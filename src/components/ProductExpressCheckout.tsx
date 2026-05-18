import { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { loadStripe, type Stripe, type PaymentRequest } from "@stripe/stripe-js"
import { Elements, PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js"
import { useNavigate } from "react-router-dom"
import { STORE_ID, STRIPE_PUBLISHABLE_KEY } from "@/lib/config"
import { callEdge } from "@/lib/edge"
import { createCheckoutFromCart } from "@/lib/checkout"
import { useSettings } from "@/contexts/SettingsContext"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"
import { trackPurchase, tracking } from "@/lib/tracking-utils"
import { countryNamesToIsoCodes } from "@/lib/country-codes"
import type { Product, ProductVariant, SellingPlan } from "@/lib/supabase"
import type { CartItem } from "@/contexts/CartContext"

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
  variant?: ProductVariant
  sellingPlan?: SellingPlan | null
  quantity: number
  unitPrice: number
  disabled?: boolean
  /**
   * Called when Stripe finishes detecting whether a wallet is available.
   * `available` is true only if the browser has an authenticated wallet ready
   * (Apple Pay/GPay with saved card, or Link logged in). Use this in the parent
   * to hide separators / labels when nothing is available.
   */
  onAvailabilityChange?: (available: boolean) => void
}

function PaymentRequestInner({
  product,
  variant,
  sellingPlan,
  quantity,
  unitPrice,
  disabled,
  onAvailabilityChange,
}: ProductExpressCheckoutProps) {
  const stripe = useStripe()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currencyCode, deliveryExpectations, shippingCoverageV2 } = useSettings()
  const { clearCart } = useCart()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [processing, setProcessing] = useState(false)

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

  const subtotalCents = Math.max(50, Math.round(unitPrice * quantity * 100))
  const defaultShipCents = walletShippingOptions[0]?.amount ?? 0
  const totalCents = subtotalCents + defaultShipCents

  // Initialize PaymentRequest and check wallet availability
  useEffect(() => {
    if (!stripe || disabled) return

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
      // DEBUG: log lo que Stripe reporta para este device/browser
      console.log('[PDP ExpressCheckout] canMakePayment result:', result)
      // Solo montamos el botón si hay un wallet REAL autenticado en el device
      // (Apple Pay con tarjeta guardada o Google Pay con tarjeta guardada).
      // Ignoramos Link a propósito: Stripe lo reporta como disponible incluso
      // en incógnito o sin sesión, porque permite "guest checkout" pidiendo
      // email + tarjeta sobre la marcha. En PDP eso es ruido visual y diluye
      // el CTA principal. Los users con Link logueado igual lo verán en /pagar.
      const hasRealWallet = !!(result?.applePay || result?.googlePay)
      console.log('[PDP ExpressCheckout] hasRealWallet:', hasRealWallet, '→', hasRealWallet ? 'mostrando botón' : 'ocultando botón')
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
  }, [stripe, disabled, currencyCode, product.title, totalCents, subtotalCents, defaultShipCents, walletShippingOptions, onAvailabilityChange])

  // Keep the total in sync if quantity / price changes after init
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

    const handlePaymentMethod = async (ev: any) => {
      try {
        setProcessing(true)

        // 1. Build a one-item cart from current PDP selection
        const buyNowItems: CartItem[] = [{
          key: `${product.id}:${variant?.id || ''}:${sellingPlan?.id || ''}`,
          type: 'product' as const,
          product,
          variant,
          sellingPlan: sellingPlan || undefined,
          quantity,
        }]

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
          buyNowItems,
          customerInfo,
          pendingDiscount,
          shippingAddress,
          shippingAddress, // billing same as shipping for express
          undefined,
          currencyCode,
        )

        const orderId = order.order_id
        const checkoutToken = order.checkout_token
        const totalAmount = (order.order?.total_amount ?? unitPrice * quantity)
        const orderTotalCents = Math.max(50, Math.round(totalAmount * 100))

        // 4. Create PaymentIntent
        const intentPayload = {
          store_id: STORE_ID,
          order_id: orderId,
          checkout_token: checkoutToken,
          amount: orderTotalCents,
          currency: (currencyCode || 'mxn').toLowerCase(),
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
            items: [{
              product_id: product.id,
              quantity,
              ...(variant?.id ? { variant_id: variant.id } : {}),
              price: Math.round(unitPrice * 100),
            }],
          },
        }

        const intentData = await callEdge("payments-create-intent", intentPayload)
        const clientSecret = intentData?.client_secret
        if (!clientSecret) {
          ev.complete('fail')
          throw new Error("No se recibió client_secret")
        }

        // 5. Confirm the PaymentIntent with the wallet's PaymentMethod (do not redirect yet)
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        )

        if (confirmError) {
          ev.complete('fail')
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
          // Track purchase
          trackPurchase({
            products: [tracking.createTrackingProduct({
              id: product.id,
              title: product.title,
              price: unitPrice,
              category: 'product',
              variant,
            })],
            value: totalAmount,
            currency: tracking.getCurrencyFromSettings(currencyCode),
            order_id: orderId,
            custom_parameters: { payment_method: 'payment_request_button', checkout_token: checkoutToken },
          })

          // Persist order for ThankYou page. Prefer the order returned by
          // payments-create-intent (already includes shipping_address from DB).
          try {
            const completedOrder = intentData?.order ?? order.order
            if (completedOrder) {
              localStorage.setItem('completed_order', JSON.stringify(completedOrder))
            }
          } catch {}

          clearCart()
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
        setProcessing(false)
      }
    }

    paymentRequest.on('paymentmethod', handlePaymentMethod)
    return () => {
      paymentRequest.off('paymentmethod', handlePaymentMethod)
    }
  }, [paymentRequest, stripe, product, variant, sellingPlan, quantity, unitPrice, currencyCode, clearCart, navigate, toast])

  if (disabled || !paymentRequest) return null

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