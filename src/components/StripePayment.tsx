import React, { useMemo, useState, useCallback, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, LinkAuthenticationElement, AddressElement, ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { callEdge } from "@/lib/edge"
import { STORE_ID, STRIPE_PUBLISHABLE_KEY } from "@/lib/config"
import { getStripeAppearance } from "@/lib/stripe-appearance"
import { countryNameToCode } from "@/lib/country-codes"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useCart } from "@/contexts/CartContext"
import { useCheckoutState } from "@/hooks/useCheckoutState"
import { useSettings } from "@/contexts/SettingsContext"
import { trackPurchase, tracking } from "@/lib/tracking-utils"
import type { PaymentMethods } from "@/lib/supabase"

/** Build Stripe payment_method_types array from store_settings.payment_methods */
function buildPaymentMethodTypes(pm?: PaymentMethods): string[] {
  const types: string[] = ['link'] // Link always enabled for autofill
  if (!pm || pm.card !== false) types.unshift('card')
  if (pm?.oxxo) types.push('oxxo')
  if (pm?.spei) types.push('customer_balance')
  return types
}

interface StripeAddressValue {
  name: string
  address: {
    line1: string
    line2: string | null
    city: string
    state: string
    postal_code: string
    country: string // 2-letter ISO code
  }
  phone?: string
}

interface StripePaymentProps {
  amountCents: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  email?: string
  name?: string
  phone?: string
  orderId?: string
  checkoutToken?: string
  onValidationRequired?: () => boolean
  expectedTotal?: number
  deliveryFee?: number
  shippingAddress?: any
  billingAddress?: any
  items?: any[]
  deliveryExpectations?: any[]
  pickupLocations?: any[]
  billingSlot?: React.ReactNode
  deliveryMethodSlot?: React.ReactNode
  paymentMethods?: PaymentMethods
  stripeAccountId?: string | null
  chargeType?: string | null
  onEmailChange?: (email: string) => void
  onAddressChange?: (address: StripeAddressValue, complete: boolean) => void
  allowedCountries?: string[]
  defaultAddress?: Partial<StripeAddressValue>
  showAddressElement?: boolean
  /**
   * Whether the on-page AddressElement currently has a complete address.
   * - true  → Express Checkout wallet runs in silent mode (uses form address).
   * - false → wallet must request shipping address from user (form is empty/incomplete).
   */
  addressElementComplete?: boolean
  shippingError?: string | null
  onLinkAuthChange?: (authenticated: boolean) => void
}

/** Build Stripe ExpressCheckoutElement shippingRates from store deliveryExpectations */
function buildShippingRates(deliveryExpectations: any[] | undefined) {
  if (!Array.isArray(deliveryExpectations) || deliveryExpectations.length === 0) return undefined
  return deliveryExpectations
    .filter((m: any) => m && m.type !== 'pickup')
    .map((m: any, idx: number) => {
      const priceNum = m.hasPrice && m.price ? parseFloat(m.price) : 0
      const amountCents = Math.max(0, Math.round((isFinite(priceNum) ? priceNum : 0) * 100))
      return {
        id: `${m.type || 'shipping'}-${idx}`,
        displayName: m.type || 'Envío',
        amount: amountCents,
        deliveryEstimate: m.description ? m.description.slice(0, 22) : undefined,
      }
    })
}

function PaymentForm({
  amountCents,
  currency = "mxn",
  description,
  metadata,
  email,
  name,
  phone,
  orderId,
  checkoutToken,
  onValidationRequired,
  expectedTotal,
  deliveryFee = 0,
  shippingAddress,
  billingAddress,
  items = [],
  deliveryExpectations = [],
  pickupLocations = [],
  billingSlot,
  deliveryMethodSlot,
  paymentMethods,
  onEmailChange,
  onAddressChange,
  allowedCountries,
  defaultAddress,
  showAddressElement = false,
  addressElementComplete = false,
  shippingError,
  onLinkAuthChange,
}: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [linkAuthenticated, setLinkAuthenticated] = useState(false)
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { updateOrderCache, getFreshOrder, getOrderSnapshot } = useCheckoutState()
  const { currencyCode } = useSettings()

  // Per Stripe deferred-mode docs: when the amount changes (e.g., user picks a
  // shipping method, applies a coupon, or qty changes), update the Elements
  // amount in-place. Remounting <Elements> would kill open wallet sessions.
  useEffect(() => {
    if (!elements) return
    try {
      elements.update({ amount: Math.max(amountCents || 50, 50) })
    } catch (err) {
      console.warn('elements.update(amount) failed:', err)
    }
  }, [elements, amountCents])

  const amountLabel = useMemo(() => {
    const amt = (amountCents || 0) / 100
    const cur = (currency || "mxn").toUpperCase()
    return `${cur} $${amt.toFixed(2)}`
  }, [amountCents, currency])

  const normalizeOrderFromResponse = (resp: any) => {
    if (resp?.order) return resp.order
    return {
      id: resp?.order_id ?? orderId,
      store_id: STORE_ID,
      checkout_token: resp?.checkout_token ?? checkoutToken,
      currency_code: resp?.currency_code,
      subtotal: resp?.subtotal,
      discount_amount: resp?.discount_amount,
      total_amount: resp?.total_amount,
      order_items: Array.isArray(resp?.order_items) ? resp.order_items : []
    }
  }

  const buildPaymentItems = () => {
    const sourceOrder = (typeof getFreshOrder === 'function' ? getFreshOrder() : null) || (typeof getOrderSnapshot === 'function' ? getOrderSnapshot() : null)
    const rawItems: any[] = (Array.isArray(items) && items.length > 0)
      ? items
      : (sourceOrder && Array.isArray(sourceOrder.order_items) ? sourceOrder.order_items : [])

    const normalizedItems = rawItems.map((it: any) => ({
      product_id: it.product_id || it.product?.id || '',
      variant_id: it.variant_id || it.variant?.id,
      quantity: Number(it.quantity ?? 0),
      price: Number(it.variant_price ?? it.variant?.price ?? it.price ?? it.unit_price ?? 0),
      selling_plan_id: it.selling_plan_id || undefined,
      product_name: it.product_name || it.product?.name || '',
    }))

    const seen = new Set<string>()
    return normalizedItems.filter((it: any) => it.product_id && it.quantity > 0).filter((it: any) => {
      const key = `${it.product_id}:${it.variant_id ?? ''}:${it.selling_plan_id ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const buildPayload = (paymentItems: any[], totalCents: number) => ({
    store_id: STORE_ID,
    order_id: orderId,
    checkout_token: checkoutToken,
    amount: totalCents,
    currency: currency || "mxn",
    expected_total: expectedTotal || totalCents,
    delivery_fee: deliveryFee,
    description: description || `Pedido #${orderId ?? "s/n"}`,
    metadata: { order_id: orderId ?? "", ...(metadata || {}) },
    receipt_email: email,
    customer: { email, name, phone },
    capture_method: "automatic",
    use_stripe_connect: true,
    payment_method_types: buildPaymentMethodTypes(paymentMethods),
    validation_data: {
      shipping_address: shippingAddress ? {
        line1: shippingAddress.line1 || "",
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postal_code: shippingAddress.postal_code || "",
        country: shippingAddress.country || "",
        name: `${shippingAddress.first_name || ""} ${shippingAddress.last_name || ""}`.trim()
      } : null,
      billing_address: billingAddress ? {
        line1: billingAddress.line1 || "",
        line2: billingAddress.line2 || "",
        city: billingAddress.city || "",
        state: billingAddress.state || "",
        postal_code: billingAddress.postal_code || "",
        country: billingAddress.country || "",
        name: `${billingAddress.first_name || ""} ${billingAddress.last_name || ""}`.trim()
      } : null,
      items: paymentItems.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        ...(item.variant_id ? { variant_id: item.variant_id } : {}),
        price: Math.max(0, Math.round(Number(item.price) * 100))
      })),
      ...(metadata?.discount_code ? { discount_code: metadata.discount_code } : {})
    },
    ...(pickupLocations && pickupLocations.length === 1 ? {
      delivery_method: "pickup",
      pickup_locations: pickupLocations.map(loc => ({
        id: loc.id || loc.name,
        name: loc.name || "",
        address: `${loc.line1 || ""}, ${loc.city || ""}, ${loc.state || ""}, ${loc.country || ""}`,
        hours: loc.schedule || ""
      }))
    } : deliveryExpectations && deliveryExpectations.length > 0 && deliveryExpectations[0]?.type !== "pickup" ? {
      delivery_expectations: deliveryExpectations.map((exp: any) => ({
        type: exp.type || "standard_delivery",
        description: exp.description || "",
        ...(exp.price !== undefined ? { estimated_days: "3-5" } : {})
      }))
    } : {})
  })

  const handleUnavailableItems = (data: any) => {
    if (data?.unavailable_items && data.unavailable_items.length > 0) {
      const unavailableNames = data.unavailable_items.map((item: any) =>
        item.variant_name ? `${item.product_name} (${item.variant_name})` : item.product_name
      ).join(', ')
      toast({
        title: "Productos agotados",
        description: `Los siguientes productos ya no están disponibles: ${unavailableNames}. Retíralos de tu carrito para completar tu compra.`,
        variant: "destructive"
      })
      updateOrderCache(normalizeOrderFromResponse(data))
      return true
    }
    return false
  }

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast({ title: "Error", description: "Stripe no está listo", variant: "destructive" })
      return
    }

    if (onValidationRequired && !onValidationRequired()) return

    if (deliveryExpectations?.[0]?.type === "pickup" && (!pickupLocations || pickupLocations.length === 0)) {
      toast({ title: "Punto de recogida requerido", description: "Por favor selecciona un punto de recogida antes de continuar.", variant: "destructive" })
      return
    }

    try {
      setLoading(true)

      // 1. Validate the payment form
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast({ title: "Error", description: submitError.message || "Verifica los datos de pago", variant: "destructive" })
        return
      }

      // 2. Create PaymentIntent on backend
      const paymentItems = buildPaymentItems()
      const totalCents = Math.max(0, Math.floor(amountCents || 0))
      const hasSubscription = paymentItems.some((it: any) => it.selling_plan_id)

      let client_secret: string | undefined
      let intentOrder: any = null

      if (hasSubscription) {
        const subscriptionItems = paymentItems.filter((it: any) => it.selling_plan_id)
        const oneTimeItems = paymentItems.filter((it: any) => !it.selling_plan_id)
        const mainItem = subscriptionItems[0]
        const subPayload = {
          store_id: STORE_ID,
          selling_plan_id: mainItem.selling_plan_id,
          recurring_items: subscriptionItems.map((i: any) => ({
            product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity,
          })),
          order_id: orderId,
          customer: { email, name },
          one_time_items: oneTimeItems.length > 0 ? oneTimeItems.map((i: any) => ({
            product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity, price: i.price, title: i.product_name || '',
          })) : undefined,
        }
        const data = await callEdge('subscription-create', subPayload)
        if (handleUnavailableItems(data)) return
        client_secret = data?.client_secret
        intentOrder = data?.order ?? null
      } else {
        const payload = buildPayload(paymentItems, totalCents)
        console.log('🔍 StripePayment payload:', JSON.stringify(payload, null, 2))
        const data = await callEdge("payments-create-intent", payload)
        if (handleUnavailableItems(data)) return
        client_secret = data?.client_secret
        intentOrder = data?.order ?? null
      }

      if (!client_secret) {
        throw new Error("No se recibió client_secret del servidor")
      }

      // 3. Confirm payment with the selected method (PaymentElement handles method selection)
      const result = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/gracias/${orderId}`,
          receipt_email: email || undefined,
          payment_method_data: {
            billing_details: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
              address: shippingAddress ? {
                line1: shippingAddress.line1 || '',
                line2: shippingAddress.line2 || '',
                city: shippingAddress.city || '',
                state: shippingAddress.state || '',
                postal_code: shippingAddress.postal_code || '',
                country: countryNameToCode(shippingAddress.country || ''),
              } : undefined,
            },
          },
        },
        redirect: 'if_required',
      })

      if (result.error) {
        toast({ title: "Error de pago", description: result.error.message || "No se pudo procesar el pago", variant: "destructive" })
        return
      }

      const pi = result.paymentIntent
      const nextAction = pi?.next_action as any

      if (pi?.status === 'succeeded') {
        // Payment succeeded (card, Link, etc.)
        trackPurchase({
          products: paymentItems.map((item: any) => tracking.createTrackingProduct({
            id: item.product_id, title: item.product_name || item.title,
            price: item.price / 100, category: 'product',
            variant: item.variant_id ? { id: item.variant_id } : undefined
          })),
          value: totalCents / 100, currency: tracking.getCurrencyFromSettings(currency),
          order_id: orderId,
          custom_parameters: { payment_method: 'stripe', checkout_token: checkoutToken }
        })

        // Save order data for ThankYou page before clearing.
        // Prefer the order returned by payments-create-intent (already includes
        // shipping_address persisted from DB). Fallback to the checkout snapshot.
        try {
          if (intentOrder) {
            localStorage.setItem('completed_order', JSON.stringify(intentOrder))
          } else {
            const checkoutData = localStorage.getItem(`checkout:${STORE_ID}`)
            if (checkoutData) {
              const parsed = JSON.parse(checkoutData)
              if (parsed.order) {
                localStorage.setItem('completed_order', JSON.stringify(parsed.order))
              }
            }
          }
        } catch {}

        clearCart()
        navigate(`/gracias/${orderId}`)
        toast({ title: "¡Pago exitoso!", description: "Tu compra ha sido procesada correctamente." })
      } else if (pi?.status === 'requires_action') {
        // Handle OXXO voucher
        if (nextAction?.oxxo_display_details) {
          const details = nextAction.oxxo_display_details
          sessionStorage.setItem('pending_payment', JSON.stringify({
            method: 'oxxo',
            orderId,
            voucherUrl: details.hosted_voucher_url,
            number: details.number,
            expiresAfter: details.expires_after,
            amount: (amountCents || 0) / 100,
            currency: (currency || 'mxn').toUpperCase(),
          }))
          clearCart()
          navigate(`/pago-pendiente/${orderId}`)
        }
        // Handle SPEI / bank transfer
        else if (nextAction?.display_bank_transfer_instructions) {
          const instructions = nextAction.display_bank_transfer_instructions
          const speiAddr = instructions.financial_addresses?.find((a: any) => a.type === 'spei')?.spei
          sessionStorage.setItem('pending_payment', JSON.stringify({
            method: 'spei',
            orderId,
            hostedUrl: instructions.hosted_instructions_url,
            clabe: speiAddr?.clabe || '',
            bankName: speiAddr?.bank_name || '',
            amount: (instructions.amount_remaining || amountCents || 0) / 100,
            currency: (currency || 'mxn').toUpperCase(),
          }))
          clearCart()
          navigate(`/pago-pendiente/${orderId}`)
        }
        // Generic requires_action (e.g. 3D Secure handled by Stripe)
        else {
          toast({ title: "Acción requerida", description: "Por favor completa la verificación del pago." })
        }
      } else if (pi?.status === 'processing') {
        // SPEI / bank transfer might be in processing state
        clearCart()
        navigate(`/pago-pendiente/${orderId}`)
      } else {
        toast({ title: "Estado del pago", description: `Estado: ${pi?.status ?? "desconocido"}` })
      }
    } catch (err: any) {
      console.error("Error en el proceso de pago:", err)
      handlePaymentError(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (err: any) => {
    const message = err?.message || ""
    const jsonStart = message.indexOf("{")
    const jsonEnd = message.lastIndexOf("}")
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        const parsed = JSON.parse(message.slice(jsonStart, jsonEnd + 1))
        if (handleUnavailableItems(parsed)) return
      } catch {}
    }
    const lowered = (message || "").toLowerCase()
    if (lowered.includes("stripe_not_connected") || lowered.includes("stripe not connected")) {
      toast({
        title: "Pagos no configurados",
        description: "Esta tienda aún no ha configurado un método de pago. Ve al dashboard de Lovivo para conectar Stripe y empezar a recibir pagos.",
      })
      return
    }
    toast({ title: "Error de pago", description: "No se pudo procesar el pago. Intenta de nuevo.", variant: "destructive" })
  }

  const handleExpressCheckoutConfirm = useCallback(async (ev?: any) => {
    if (!stripe || !elements) return
    try {
      setLoading(true)
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast({ title: "Error", description: submitError.message || "Verifica los datos de pago", variant: "destructive" })
        return
      }

      const walletShipping = ev?.shippingAddress
      const walletBilling = ev?.billingDetails
      const walletEmail = walletBilling?.email || ev?.email || email
      const walletPhone = walletBilling?.phone || ev?.phone || phone
      const walletName = walletBilling?.name || walletShipping?.name || name
      const walletShipRate = ev?.shippingRate

      const effectiveShippingAddress = walletShipping?.address ? {
        first_name: (walletShipping.name || walletName || '').split(' ')[0] || '',
        last_name: (walletShipping.name || walletName || '').split(' ').slice(1).join(' ') || '',
        line1: walletShipping.address.line1 || '',
        line2: walletShipping.address.line2 || '',
        city: walletShipping.address.city || '',
        state: walletShipping.address.state || '',
        postal_code: walletShipping.address.postal_code || '',
        country: walletShipping.address.country || '',
        phone: walletPhone || '',
      } : shippingAddress
      const effectiveBillingAddress = walletBilling?.address ? {
        first_name: (walletName || '').split(' ')[0] || '',
        last_name: (walletName || '').split(' ').slice(1).join(' ') || '',
        line1: walletBilling.address.line1 || '',
        line2: walletBilling.address.line2 || '',
        city: walletBilling.address.city || '',
        state: walletBilling.address.state || '',
        postal_code: walletBilling.address.postal_code || '',
        country: walletBilling.address.country || '',
        phone: walletPhone || '',
      } : (billingAddress || effectiveShippingAddress)

      if (showAddressElement && (!effectiveShippingAddress || !effectiveShippingAddress.line1)) {
        toast({
          title: "Falta dirección de envío",
          description: "Por favor completa tu dirección antes de pagar.",
          variant: "destructive",
        })
        return
      }

      const paymentItems = buildPaymentItems()
      const walletShipCents = typeof walletShipRate?.amount === 'number' ? walletShipRate.amount : Math.round((deliveryFee || 0) * 100)
      const totalCents = Math.max(0, Math.floor(amountCents || 0))

      const basePayload = buildPayload(paymentItems, totalCents)
      const payload = {
        ...basePayload,
        delivery_fee: walletShipCents,
        receipt_email: walletEmail,
        customer: { email: walletEmail, name: walletName, phone: walletPhone },
        validation_data: {
          ...basePayload.validation_data,
          shipping_address: effectiveShippingAddress ? {
            line1: effectiveShippingAddress.line1 || '',
            line2: effectiveShippingAddress.line2 || '',
            city: effectiveShippingAddress.city || '',
            state: effectiveShippingAddress.state || '',
            postal_code: effectiveShippingAddress.postal_code || '',
            country: effectiveShippingAddress.country || '',
            name: `${effectiveShippingAddress.first_name || ''} ${effectiveShippingAddress.last_name || ''}`.trim() || walletName || '',
          } : null,
          billing_address: effectiveBillingAddress ? {
            line1: effectiveBillingAddress.line1 || '',
            line2: effectiveBillingAddress.line2 || '',
            city: effectiveBillingAddress.city || '',
            state: effectiveBillingAddress.state || '',
            postal_code: effectiveBillingAddress.postal_code || '',
            country: effectiveBillingAddress.country || '',
            name: `${effectiveBillingAddress.first_name || ''} ${effectiveBillingAddress.last_name || ''}`.trim() || walletName || '',
          } : null,
        },
      }

      const data = await callEdge("payments-create-intent", payload)
      if (handleUnavailableItems(data)) return
      const client_secret = data?.client_secret
      const intentOrder = data?.order ?? null
      if (!client_secret) throw new Error("No se recibió client_secret del servidor")

      const result = await stripe.confirmPayment({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/gracias/${orderId}`,
          payment_method_data: {
            billing_details: {
              name: walletName || undefined,
              email: walletEmail || undefined,
              phone: walletPhone || undefined,
              address: effectiveShippingAddress ? {
                line1: effectiveShippingAddress.line1 || '',
                line2: effectiveShippingAddress.line2 || '',
                city: effectiveShippingAddress.city || '',
                state: effectiveShippingAddress.state || '',
                postal_code: effectiveShippingAddress.postal_code || '',
                country: (effectiveShippingAddress.country || '').length === 2
                  ? effectiveShippingAddress.country
                  : countryNameToCode(effectiveShippingAddress.country || ''),
              } : undefined,
            },
          },
        },
        redirect: 'if_required',
      })

      if (result.error) {
        toast({ title: "Error de pago", description: result.error.message || "No se pudo procesar el pago", variant: "destructive" })
        return
      }

      const pi = result.paymentIntent
      if (pi?.status === 'succeeded') {
        trackPurchase({
          products: paymentItems.map((item: any) => tracking.createTrackingProduct({
            id: item.product_id, title: item.product_name || item.title,
            price: item.price / 100, category: 'product',
            variant: item.variant_id ? { id: item.variant_id } : undefined
          })),
          value: totalCents / 100, currency: tracking.getCurrencyFromSettings(currency),
          order_id: orderId,
          custom_parameters: { payment_method: 'express_checkout', checkout_token: checkoutToken }
        })

        // intentOrder fix: persist order from edge function for ThankYou page
        try {
          if (intentOrder) {
            localStorage.setItem('completed_order', JSON.stringify(intentOrder))
          }
        } catch {}
        clearCart()
        navigate(`/gracias/${orderId}`)
        toast({ title: "¡Pago exitoso!", description: "Tu compra ha sido procesada correctamente." })
      } else if (pi?.status === 'processing') {
        clearCart()
        navigate(`/pago-pendiente/${orderId}`)
      }
    } catch (err: any) {
      console.error("Express checkout error:", err)
      handlePaymentError(err)
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, amountCents, orderId, email, name, phone, shippingAddress, billingAddress, deliveryFee, navigate, clearCart])

  const handleExpressShippingAddressChange = useCallback(async (ev: any) => {
    try {
      const country = (ev?.address?.country || '').toUpperCase()
      if (allowedCountries && allowedCountries.length > 0 && country && !allowedCountries.includes(country)) {
        ev.reject()
        return
      }
      const builtRates = buildShippingRates(deliveryExpectations)
      const rates = (builtRates && builtRates.length > 0)
        ? builtRates
        : [{ id: 'standard', displayName: 'Envío estándar', amount: 0 }]
      ev.resolve({ shippingRates: rates })
    } catch (err) {
      console.error('shippingaddresschange error:', err)
      try { ev.reject() } catch {}
    }
  }, [allowedCountries, deliveryExpectations])

  const handleExpressShippingRateChange = useCallback(async (ev: any) => {
    try { ev.resolve() } catch {}
  }, [])

  return (
    <div className="space-y-6">

      {/* Express Checkout (Google Pay, Apple Pay) - only when Link is NOT authenticated */}
      {!linkAuthenticated && (
        <>
          <ExpressCheckoutElement
            onConfirm={handleExpressCheckoutConfirm}
            onShippingAddressChange={showAddressElement ? handleExpressShippingAddressChange : undefined}
            onShippingRateChange={showAddressElement ? handleExpressShippingRateChange : undefined}
            options={(() => {
              const builtRates = buildShippingRates(deliveryExpectations)
              const rates = (builtRates && builtRates.length > 0)
                ? builtRates
                : [{ id: 'standard', displayName: 'Envío estándar', amount: 0 }]
              const orderHasShippingAddress = Boolean(
                shippingAddress && (shippingAddress.line1 || shippingAddress.address?.line1)
              )
              const formIsReady = addressElementComplete && orderHasShippingAddress
              const wantsShipping = showAddressElement && !formIsReady
              return {
                buttonType: {
                  googlePay: 'plain',
                  applePay: 'plain',
                },
                layout: {
                  overflow: 'auto',
                  maxColumns: 2,
                  maxRows: 1,
                },
                buttonHeight: 44,
                paymentMethodOrder: ['applePay', 'googlePay', 'link'],
                emailRequired: true,
                phoneNumberRequired: true,
                ...(allowedCountries && allowedCountries.length > 0 ? {
                  allowedShippingCountries: allowedCountries,
                } : {}),
                ...(wantsShipping ? {
                  shippingAddressRequired: true,
                  shippingRates: rates,
                } : {}),
              } as any
            })()}
          />
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">o</span>
            <Separator className="flex-1" />
          </div>
        </>
      )}

      {/* Link Authentication - email capture + Link recognition */}
      <LinkAuthenticationElement
        options={{
          defaultValues: {
            email: email || '',
          },
        }}
        onChange={(event) => {
          if (event.value?.email && onEmailChange) {
            onEmailChange(event.value.email)
          }
          const authenticated = !!(event as any).authenticated
          setLinkAuthenticated(authenticated)
          if (onLinkAuthChange) {
            onLinkAuthChange(authenticated)
          }
        }}
      />

      {/* Shipping Address Element - replaces custom address inputs */}
      {showAddressElement && (
        <>
          <AddressElement
            options={{
              mode: 'shipping',
              fields: {
                phone: 'always',
              },
              validation: {
                phone: {
                  required: 'always',
                },
              },
              display: {
                name: 'split',
              },
              defaultValues: defaultAddress ? {
                firstName: defaultAddress.name?.split(' ')[0] || '',
                lastName: defaultAddress.name?.split(' ').slice(1).join(' ') || '',
                address: defaultAddress.address ? {
                  line1: defaultAddress.address.line1 || '',
                  line2: defaultAddress.address.line2 || '',
                  city: defaultAddress.address.city || '',
                  state: defaultAddress.address.state || '',
                  postal_code: defaultAddress.address.postal_code || '',
                  country: defaultAddress.address.country || 'MX',
                } : { country: 'MX', line1: '', line2: '', city: '', state: '', postal_code: '' },
                phone: defaultAddress.phone || '',
              } : {
                address: { country: 'MX', line1: '', line2: '', city: '', state: '', postal_code: '' },
              },
              ...(allowedCountries && allowedCountries.length > 0 ? {
                allowedCountries,
              } : {}),
            }}
            onChange={(event) => {
              if (onAddressChange) {
                const val = event.value as StripeAddressValue
                onAddressChange(val, event.complete)
              }
            }}
          />

          {/* Shipping coverage error banner */}
          {shippingError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive mt-0.5 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <p className="text-sm text-destructive">{shippingError}</p>
            </div>
          )}

          {/* Delivery method slot - rendered between address and payment */}
          {deliveryMethodSlot}
        </>
      )}

      {/* Unified Payment Element - shows card, OXXO, SPEI, wallets automatically */}
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: false,
          },
          fields: {
            billingDetails: {
              name: 'never',
              email: 'never',
              phone: 'never',
              address: 'never',
            },
          },
          defaultValues: {
            billingDetails: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
            },
          },
          business: {
            name: 'Lovivo',
          },
        }}
      />

      {/* Billing address slot */}
      {billingSlot}

      {/* Submit button */}
      <Button
        onClick={handlePayment}
        disabled={!stripe || loading || !amountCents || !!shippingError}
        className="w-full h-12 text-lg font-semibold"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Procesando...</span>
          </div>
        ) : `Completar Compra - ${amountLabel}`}
      </Button>

      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <a href="/terminos-y-condiciones" target="_blank" className="underline hover:text-foreground">Condiciones</a>
        <span>|</span>
        <a href="/aviso-de-privacidad" target="_blank" className="underline hover:text-foreground">Privacidad</a>
      </div>
    </div>
  )
}

export default function StripePayment(props: StripePaymentProps) {
  const stripePromise = useMemo(() => {
    const opts = props.chargeType === 'direct' && props.stripeAccountId
      ? { stripeAccount: props.stripeAccountId }
      : {}
    return loadStripe(STRIPE_PUBLISHABLE_KEY, opts)
  }, [props.stripeAccountId, props.chargeType])

  const elementsOptions = useMemo(() => ({
    mode: 'payment' as const,
    amount: Math.max(props.amountCents || 50, 50),
    currency: (props.currency || 'mxn').toLowerCase(),
    paymentMethodTypes: buildPaymentMethodTypes(props.paymentMethods),
    appearance: getStripeAppearance('dark'),
  }), [props.amountCents, props.currency, props.paymentMethods])

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm {...props} />
    </Elements>
  )
}