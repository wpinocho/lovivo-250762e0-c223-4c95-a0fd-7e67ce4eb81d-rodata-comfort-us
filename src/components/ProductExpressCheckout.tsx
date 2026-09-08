import { useMemo, useState, useEffect, useRef } from "react"
import { loadStripe, type Stripe, type PaymentRequest } from "@stripe/stripe-js"
import { Elements, PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js"
import { useNavigate } from "react-router-dom"
import { STORE_ID, STRIPE_PUBLISHABLE_KEY } from "@/lib/config"
import { callEdge } from "@/lib/edge"
import { createCheckoutFromCart, verifyOrderContents } from "@/lib/checkout"
import { cartToApiItems } from "@/lib/cart-utils"
import { verifyOrderAmount } from "@/lib/order-validation"
import { confirmWithVerifiedAmount, type PaymentBlock } from "@/lib/payment-gate"
import { toCents } from "@/lib/money"
import { useSettings } from "@/contexts/SettingsContext"
import { useToast } from "@/hooks/use-toast"
import { trackPurchase, tracking } from "@/lib/tracking-utils"
import type { Product, SellingPlan } from "@/lib/supabase"
import type { CartProductItem } from "@/contexts/CartContext"

/**
 * ProductExpressCheckout (PDP)
 *
 * Uses Stripe's legacy PaymentRequestButton instead of ExpressCheckoutElement.
 * Reasoning (see .lovable/plan.md):
 *   - PRB only renders when there is an authenticated wallet on the device
 *     (Apple Pay with a saved card, Google Pay with a card, or Link logged in).
 *   - PRB shows exactly ONE button chosen by the browser/Stripe priority:
 *       Safari + Apple Pay  → Apple Pay
 *       Chrome + Link auth  → Link
 *       Chrome + GPay only  → Google Pay
 *   - This avoids the "Link guest-friendly" button always appearing on PDP,
 *     which was diluting the primary CTA.
 *
 * The /pagar page keeps the modern ExpressCheckoutElement with all wallets,
 * because there the user is already committed to checkout.
 */

interface ProductExpressCheckoutProps {
  product: Product
  /**
   * The full PDP selection — one entry per variant. A two-belt pack in two sizes
   * arrives here as two entries and must be paid for as two entries.
   */
  items: CartProductItem[]
  sellingPlan?: SellingPlan | null
  /** Selection total including the volume discount, excluding shipping. */
  selectionTotal: number
  disabled?: boolean
  /**
   * Called when Stripe finishes detecting whether a wallet is available.
   * `available` is true only if the browser has an authenticated wallet ready
   * (Apple Pay/GPay with saved card, or Link logged in). Use this in the parent
   * to hide separators / labels when nothing is available.
   */
  onAvailabilityChange?: (available: boolean) => void
  /** Lets the parent freeze the selection while a wallet purchase is in flight. */
  onProcessingChange?: (processing: boolean) => void
}

function PaymentRequestInner({
  product,
  items,
  sellingPlan,
  selectionTotal,
  disabled,
  onAvailabilityChange,
  onProcessingChange,
}: ProductExpressCheckoutProps) {
  const stripe = useStripe()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currencyCode, deliveryExpectations, shippingCoverageV2 } = useSettings()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [processing, setProcessing] = useState(false)

  const hasSelection = Array.isArray(items) && items.length > 0
  const blocked = Boolean(disabled) || !hasSelection

  // Allowed countries (ISO codes) from store shipping coverage
  const allowedCountryCodes = useMemo<string[]>(() => {
    const v2: any[] = shippingCoverageV2?.countries || []
    if (Array.isArray(v2) && v2.length > 0) {
      return v2.map((c: any) => (c.code || '').toUpperCase()).filter(Boolean)
    }
    return []
  }, [shippingCoverageV2])

  // Build wallet shippingOptions from store deliveryExpectations
  const walletShippingOptions = useMemo(() => {
    const list: any[] = Array.isArray(deliveryExpectations) ? deliveryExpectations : []
    const filtered = list.filter((m: any) => m && m.type !== 'pickup')
    if (filtered.length === 0) {
      return [{ id: 'standard', label: 'Envío estándar', detail: '', amount: 0 }]
    }
    return filtered.map((m: any, idx: number) => {
      const priceNum = m.hasPrice && m.price ? parseFloat(m.price) : 0
      const amountCents = Math.max(0, Math.round((isFinite(priceNum) ? priceNum : 0) * 100))
      return {
        id: `${m.type || 'shipping'}-${idx}`,
        label: m.type || 'Envío',
        detail: m.description || '',
        amount: amountCents,
      }
    })
  }, [deliveryExpectations])

  // Prices the whole selection, not just the first variant.
  const subtotalCents = Math.max(50, toCents(selectionTotal))
  const defaultShipCents = walletShippingOptions[0]?.amount ?? 0
  const totalCents = subtotalCents + defaultShipCents

  /**
   * The exact amount currently displayed in the wallet sheet. Confirming any
   * other number would charge money the shopper never approved, so every
   * comparison below is against this.
   */
  const authorizedTotalRef = useRef(totalCents)
  useEffect(() => { authorizedTotalRef.current = totalCents }, [totalCents])

  // One purchase at a time: wallets can fire `paymentmethod` more than once.
  const inFlightRef = useRef(false)

  useEffect(() => { onProcessingChange?.(processing) }, [processing, onProcessingChange])

  // Initialize PaymentRequest and check wallet availability
  useEffect(() => {
    if (!stripe || blocked) return

    const pr = stripe.paymentRequest({
      country: 'MX',
      currency: (currencyCode || 'mxn').toLowerCase(),
      total: {
        label: product.title,
        amount: totalCents,
      },
      displayItems: [
        { label: product.title, amount: subtotalCents },
        { label: 'Envío', amount: defaultShipCents },
      ],
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: walletShippingOptions,
    })

    let cancelled = false
    pr.canMakePayment().then((result) => {
      if (cancelled) return
      // Solo montamos el botón si hay un wallet REAL autenticado en el device
      // (Apple Pay con tarjeta guardada o Google Pay con tarjeta guardada).
      // Ignoramos Link a propósito: Stripe lo reporta como disponible incluso
      // en incógnito o sin sesión, porque permite "guest checkout" pidiendo
      // email + tarjeta sobre la marcha. En PDP eso es ruido visual y diluye
      // el CTA principal. Los users con Link logueado igual lo verán en /pagar.
      const hasRealWallet = !!(result?.applePay || result?.googlePay)
      if (hasRealWallet) {
        setPaymentRequest(pr)
        onAvailabilityChange?.(true)
      } else {
        setPaymentRequest(null)
        onAvailabilityChange?.(false)
      }
    }).catch((err) => {
      console.warn('[PDP ExpressCheckout] canMakePayment error:', err)
      if (!cancelled) {
        setPaymentRequest(null)
        onAvailabilityChange?.(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stripe, blocked, currencyCode, product.title, totalCents, subtotalCents, defaultShipCents, walletShippingOptions, onAvailabilityChange])

  // Keep the total in sync if the selection or its discount changes after init
  useEffect(() => {
    if (!paymentRequest) return
    paymentRequest.update({
      total: {
        label: product.title,
        amount: totalCents,
      },
      displayItems: [
        { label: product.title, amount: subtotalCents },
        { label: 'Envío', amount: defaultShipCents },
      ],
      shippingOptions: walletShippingOptions,
    })
  }, [paymentRequest, product.title, totalCents, subtotalCents, defaultShipCents, walletShippingOptions])

  // Validate shipping address country and recompute totals when wallet user picks a shipping option
  useEffect(() => {
    if (!paymentRequest) return

    const onShippingAddressChange = (ev: any) => {
      const country = (ev?.shippingAddress?.country || '').toUpperCase()
      if (allowedCountryCodes.length > 0 && country && !allowedCountryCodes.includes(country)) {
        ev.updateWith({ status: 'invalid_shipping_address' })
        return
      }
      const firstShip = walletShippingOptions[0]?.amount ?? 0
      authorizedTotalRef.current = subtotalCents + firstShip
      ev.updateWith({
        status: 'success',
        total: { label: product.title, amount: subtotalCents + firstShip },
        displayItems: [
          { label: product.title, amount: subtotalCents },
          { label: 'Envío', amount: firstShip },
        ],
        shippingOptions: walletShippingOptions,
      })
    }

    const onShippingOptionChange = (ev: any) => {
      const ship = Number(ev?.shippingOption?.amount || 0)
      authorizedTotalRef.current = subtotalCents + ship
      ev.updateWith({
        status: 'success',
        total: { label: product.title, amount: subtotalCents + ship },
        displayItems: [
          { label: product.title, amount: subtotalCents },
          { label: 'Envío', amount: ship },
        ],
      })
    }

    paymentRequest.on('shippingaddresschange', onShippingAddressChange)
    paymentRequest.on('shippingoptionchange', onShippingOptionChange)
    return () => {
      paymentRequest.off('shippingaddresschange', onShippingAddressChange)
      paymentRequest.off('shippingoptionchange', onShippingOptionChange)
    }
  }, [paymentRequest, allowedCountryCodes, walletShippingOptions, subtotalCents, product.title])

  // Handle wallet confirmation
  useEffect(() => {
    if (!paymentRequest || !stripe) return

    /** Aborts the wallet sheet and asks the shopper to confirm the new number. */
    const rejectWithNewTotal = (ev: any, chargeCents: number, message: string) => {
      try { ev.complete('fail') } catch {}
      try {
        paymentRequest.update({
          total: { label: product.title, amount: chargeCents },
          displayItems: [{ label: product.title, amount: chargeCents }],
          shippingOptions: walletShippingOptions,
        })
        // The next tap authorises the updated number, so a valid retry goes
        // through instead of comparing against the old total forever.
        authorizedTotalRef.current = chargeCents
      } catch {}
      toast({
        title: "Total updated",
        description: `${message} Tap the wallet button again to confirm.`,
        variant: "destructive",
      })
    }

    /**
     * Stops the purchase without confirming anything. Only a plain amount change
     * in the same currency can be re-quoted in the sheet — an amount we could not
     * read, or a different currency, is not something to re-price a wallet with.
     */
    const stopWithBlock = (ev: any, block: PaymentBlock) => {
      if (block.reauthorizable && block.chargeCents) {
        rejectWithNewTotal(ev, block.chargeCents, block.message)
        return
      }
      try { ev.complete('fail') } catch {}
      toast({ title: block.title, description: block.message, variant: "destructive" })
    }

    const handlePaymentMethod = async (ev: any) => {
      // Repeated callbacks must not create a second order or a second charge.
      if (inFlightRef.current) {
        try { ev.complete('fail') } catch {}
        return
      }

      if (!hasSelection) {
        try { ev.complete('fail') } catch {}
        toast({
          title: "Select both sizes",
          description: "Choose a size for each belt before paying.",
          variant: "destructive",
        })
        return
      }

      inFlightRef.current = true
      const currency = (currencyCode || 'mxn').toLowerCase()
      const authorizedCents = authorizedTotalRef.current

      try {
        setProcessing(true)

        // 1. The purchase is exactly what the PDP built — every variant, every unit
        const requestedItems = cartToApiItems(items)

        // 2. Extract customer + shipping info from the wallet event
        const payerEmail = ev.payerEmail as string | undefined
        const payerName = (ev.payerName as string | undefined) || ''
        const payerPhone = ev.payerPhone as string | undefined
        const shipping = ev.shippingAddress || {}

        const customerInfo = payerEmail ? {
          email: payerEmail,
          first_name: payerName.split(' ')[0] || undefined,
          last_name: payerName.split(' ').slice(1).join(' ') || undefined,
          phone: payerPhone,
        } : undefined

        const shippingAddress = shipping?.recipient || shipping?.addressLine ? {
          first_name: (shipping.recipient || payerName || '').split(' ')[0] || '',
          last_name: (shipping.recipient || payerName || '').split(' ').slice(1).join(' ') || '',
          line1: (shipping.addressLine && shipping.addressLine[0]) || '',
          line2: (shipping.addressLine && shipping.addressLine[1]) || '',
          city: shipping.city || '',
          state: shipping.region || '',
          postal_code: shipping.postalCode || '',
          country: shipping.country || 'MX',
          phone: payerPhone || '',
        } : undefined

        // 3. Create the order — pass any pending discount stored in sessionStorage
        let pendingDiscount: string | undefined
        try { pendingDiscount = sessionStorage.getItem('pendingDiscount') || undefined } catch {}

        const order = await createCheckoutFromCart(
          items,
          customerInfo,
          pendingDiscount,
          shippingAddress,
          shippingAddress, // billing same as shipping for express
          undefined,
          currencyCode,
        )

        // 4. The order must be the pack that was selected — not a partial one.
        //    An order we cannot read back is not an order we can charge for.
        const match = await verifyOrderContents(requestedItems, order)
        if (!match.valid) {
          try { ev.complete('fail') } catch {}
          toast({
            title: match.title || "Your order changed",
            description: match.message || "Review your sizes and try again.",
            variant: "destructive",
          })
          return
        }

        const orderId = order.order_id
        const checkoutToken = order.checkout_token

        // 5. The persisted order total is what gets charged — if it is not what
        //    the wallet sheet showed, ask again instead of charging quietly.
        const orderAmountCheck = verifyOrderAmount(
          {
            total_amount: order.order?.total_amount ?? order.total_amount,
            currency_code: order.order?.currency_code ?? order.currency_code,
          },
          { authorizedCents, authorizedCurrency: currency }
        )
        if (!orderAmountCheck.matches) {
          stopWithBlock(ev, {
            code: 'amount',
            title: orderAmountCheck.title!,
            message: orderAmountCheck.message!,
            chargeCents: orderAmountCheck.chargeCents,
            chargeCurrency: orderAmountCheck.chargeCurrency,
            reauthorizable: orderAmountCheck.reauthorizable,
            serverOrder: order.order ?? null,
            data: order,
          })
          return
        }
        const orderTotalCents = orderAmountCheck.chargeCents!

        // 6. Create PaymentIntent — validation_data carries every selected variant
        const intentPayload = {
          store_id: STORE_ID,
          order_id: orderId,
          checkout_token: checkoutToken,
          amount: orderTotalCents,
          currency,
          expected_total: orderTotalCents,
          delivery_fee: order.order?.shipping_amount ? Math.round((order.order.shipping_amount as number) * 100) : 0,
          description: `Pedido #${orderId}`,
          metadata: { order_id: orderId },
          receipt_email: customerInfo?.email,
          customer: customerInfo ? {
            email: customerInfo.email,
            name: `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim(),
            phone: customerInfo.phone,
          } : undefined,
          capture_method: "automatic",
          use_stripe_connect: true,
          payment_method_types: ['card', 'link'],
          validation_data: {
            shipping_address: shippingAddress ? {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country,
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim(),
            } : null,
            billing_address: shippingAddress ? {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country,
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim(),
            } : null,
            items: items.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
              ...(item.variant?.id ? { variant_id: item.variant.id } : {}),
              // Per-unit catalog price in cents, as the current contract expects.
              price: toCents((item.variant?.price ?? item.product.price) || 0),
            })),
          },
        }

        const intentData = await callEdge("payments-create-intent", intentPayload)

        // 7. The gate confirms only after the server's own payment amount and
        //    currency match what the wallet sheet authorised.
        const outcome = await confirmWithVerifiedAmount({
          data: intentData,
          authorizedCents,
          authorizedCurrency: currency,
          requestedItems,
          // 8. Confirm with the wallet's PaymentMethod (do not redirect yet)
          confirm: (clientSecret) => stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          ),
        })

        if (!outcome.confirmed) {
          stopWithBlock(ev, outcome.block)
          return
        }

        const clientSecret = intentData.client_secret as string
        const intentChargeCents = outcome.chargeCents
        const { paymentIntent, error: confirmError } = outcome.result

        if (confirmError) {
          try { ev.complete('fail') } catch {}
          toast({
            title: "Error de pago",
            description: confirmError.message || "No se pudo procesar el pago",
            variant: "destructive",
          })
          return
        }

        // Tell the wallet sheet the auth succeeded so it dismisses
        ev.complete('success')

        // If 3DS / additional action is required, run it now
        let finalIntent = paymentIntent
        if (finalIntent && finalIntent.status === 'requires_action') {
          const { paymentIntent: actionIntent, error: actionError } = await stripe.confirmCardPayment(clientSecret)
          if (actionError) {
            toast({
              title: "Error de pago",
              description: actionError.message || "No se pudo completar la autenticación",
              variant: "destructive",
            })
            return
          }
          finalIntent = actionIntent
        }

        if (finalIntent?.status === 'succeeded') {
          // sessionStorage guard: prevent duplicate Purchase events for the same order
          // (e.g. wallet sheet fires paymentmethod twice, or 3DS requires_action re-fires)
          const ptKey = `purchase_tracked_${orderId}`
          const alreadyTracked = (() => { try { return sessionStorage.getItem(ptKey) === '1' } catch { return false } })()
          if (!alreadyTracked) {
            try { sessionStorage.setItem(ptKey, '1') } catch {}
            trackPurchase({
              // Two belts report two units and the amount actually paid.
              products: items.map((item) => tracking.createTrackingProduct({
                id: product.id,
                title: product.title,
                price: (item.variant?.price ?? product.price) || 0,
                category: 'product',
                variant: item.variant,
              })),
              value: intentChargeCents / 100,
              currency: tracking.getCurrencyFromSettings(currencyCode),
              order_id: orderId,
              custom_parameters: {
                payment_method: 'payment_request_button',
                checkout_token: checkoutToken,
                num_items: items.reduce((sum, item) => sum + item.quantity, 0),
              },
            })
          }

          // Persist order for ThankYou page. Prefer the order returned by
          // payments-create-intent (already includes shipping_address from DB).
          try {
            const completedOrder = intentData?.order ?? order.order
            if (completedOrder) {
              localStorage.setItem('completed_order', JSON.stringify(completedOrder))
            }
          } catch {}

          // No clearCart(): this is a direct PDP purchase, whatever else the
          // shopper had in their cart is not part of it.
          navigate(`/gracias/${orderId}`)
          toast({ title: "¡Pago exitoso!", description: "Tu compra ha sido procesada correctamente." })
        } else {
          toast({
            title: "Estado del pago",
            description: `Estado: ${finalIntent?.status ?? "desconocido"}`,
          })
        }
      } catch (err: any) {
        try { ev.complete('fail') } catch {}
        console.error("PaymentRequestButton error (PDP):", err)
        const msg = (err?.message || "").toLowerCase()
        if (msg.includes("stripe_not_connected") || msg.includes("stripe not connected")) {
          toast({
            title: "Pagos no configurados",
            description: "Esta tienda aún no ha configurado un método de pago. Ve al dashboard de Lovivo para conectar Stripe y empezar a recibir pagos.",
          })
        } else {
          toast({
            title: "Error en el pago rápido",
            description: "No se pudo completar el pago. Intenta de nuevo.",
            variant: "destructive",
          })
        }
      } finally {
        inFlightRef.current = false
        setProcessing(false)
      }
    }

    paymentRequest.on('paymentmethod', handlePaymentMethod)
    return () => {
      paymentRequest.off('paymentmethod', handlePaymentMethod)
    }
  }, [paymentRequest, stripe, product, items, hasSelection, selectionTotal, currencyCode, walletShippingOptions, navigate, toast])

  if (blocked || !paymentRequest) return null

  return (
    <div className="relative">
      {processing && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
      )}
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '44px',
            },
          },
        }}
      />
    </div>
  )
}

export default function ProductExpressCheckout(props: ProductExpressCheckoutProps) {
  const { stripeAccountId, chargeType, isLoading: settingsLoading } = useSettings()

  // Wait until settings are fully loaded before creating the Stripe promise.
  // This prevents stripePromise from being recreated when stripeAccountId /
  // chargeType change from `undefined` → real value, which would remount
  // <Elements> and re-run canMakePayment() with a different Stripe instance
  // (causing the button to disappear on Connect stores).
  const stripePromise = useMemo<Promise<Stripe | null>>(() => {
    if (settingsLoading) return Promise.resolve(null)
    const opts = chargeType === 'direct' && stripeAccountId
      ? { stripeAccount: stripeAccountId }
      : {}
    return loadStripe(STRIPE_PUBLISHABLE_KEY, opts)
  }, [settingsLoading, stripeAccountId, chargeType])

  // Don't mount Elements until settings are ready — avoids a double-init race.
  if (settingsLoading) return null

  return (
    <Elements stripe={stripePromise}>
      <PaymentRequestInner {...props} />
    </Elements>
  )
}
