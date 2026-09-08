import React, { useEffect, useRef, useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ShieldCheck } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { callEdge, callEdgeOnce } from '@/lib/edge'
import {
  PAYMENT_REVIEW_COPY,
  readCaptureOutcome,
  readPaymentReview,
  savePaymentReview,
  type PaymentReview,
} from '@/lib/payment-review'
import { STORE_ID } from '@/lib/config'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { getAttributionPayload, trackPurchase, tracking } from '@/lib/tracking-utils'
import { trackCheckoutEvent, stripeErrorProps } from '@/lib/checkout-tracking'
import { toCents } from '@/lib/money'

interface PaypalExpressButtonProps {
  orderId: string
  checkoutToken: string
  amount: number        // finalTotal in dollars (e.g. 59.00)
  currency: string      // lowercase (e.g. 'usd')
  items: any[]
  shippingCost: number
  className?: string    // outer wrapper className
  showDivider?: boolean // show "or pay with" label above (default true)
  /** True while a checkout-update is still in flight — the total is not final yet. */
  disabled?: boolean
}

export function PaypalExpressButton({
  orderId,
  checkoutToken,
  amount,
  currency,
  items,
  shippingCost,
  className,
  showDivider = true,
  disabled = false,
}: PaypalExpressButtonProps) {
  const { paypalEnabled, paypalClientId, paypalEnvironment } = useSettings()
  const { toast } = useToast()
  const navigate = useNavigate()
  // One approval at a time: repeated onApprove callbacks must not capture twice.
  const captureInFlight = useRef(false)
  const capturedOrders = useRef<Set<string>>(new Set())
  /**
   * What this store page was showing when PayPal was opened. The popup stays open
   * while the page can still change (quantity, coupon, shipping), and a capture
   * must belong to the order and total the buyer actually approved.
   */
  const approvalRef = useRef<{ checkoutToken: string; amountCents: number; currency: string } | null>(null)
  // A capture awaiting reconciliation replaces the buttons: this order must not
  // be paid a second time until the backend settles it.
  const [review, setReview] = useState<PaymentReview | null>(() => readPaymentReview(orderId))
  useEffect(() => { setReview(readPaymentReview(orderId)) }, [orderId])

  console.log('[PayPal Button] paypalEnabled:', paypalEnabled, '| paypalClientId:', paypalClientId ? paypalClientId.slice(0,12)+'...' : null, '| checkoutToken:', !!checkoutToken)

  const paypalReady = Boolean(paypalEnabled && paypalClientId && checkoutToken)

  // Until now PayPal was a complete blind spot: every failure was a toast that
  // vanished. We need to know how often the button is even offered vs used.
  useEffect(() => {
    if (!paypalReady) return
    trackCheckoutEvent('checkout_paypal_shown', { order_id: orderId })
  }, [paypalReady, orderId])

  if (review) {
    return (
      <div className={className}>
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-brand-amber/25 bg-brand-amber/[0.06] p-3"
        >
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-amber" />
          <div className="min-w-0">
            <p className="font-inter text-sm font-semibold text-brand-offwhite">{PAYMENT_REVIEW_COPY.title}</p>
            <p className="mt-1 font-inter text-xs leading-relaxed text-brand-smoke">{PAYMENT_REVIEW_COPY.message}</p>
            {/* The references support has to settle it — keep them visible. */}
            <p className="mt-1.5 font-inter text-[11px] text-brand-steel">
              Order {review.orderId}
              {review.captureId ? ` · PayPal capture ${review.captureId}` : ''}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!paypalReady) return null

  const currencyUpper = currency.toUpperCase()

  return (
    <div className={className}>
      {showDivider && (
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-brand-steel">or pay with</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>
      )}

      <PayPalScriptProvider
        key={`${paypalClientId}-${currencyUpper}`}
        options={{
          clientId: paypalClientId,
          currency: currencyUpper,
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{ layout: 'horizontal', height: 45, tagline: false, color: 'gold' }}
          fundingSource="paypal"
          disabled={disabled}
          createOrder={async () => {
            if (disabled) {
              throw new Error('Your order total is still updating. Try again in a moment.')
            }
            if (readPaymentReview(orderId)) {
              throw new Error(PAYMENT_REVIEW_COPY.message)
            }
            // PayPal Express: no form validation needed — PayPal collects
            // the buyer's shipping address inside the PayPal popup.
            const attribution = getAttributionPayload();
            trackCheckoutEvent('checkout_paypal_started', {
              order_id: orderId,
              amount,
              currency: currencyUpper,
            })
            try {
              const result = await callEdge('paypal-create-order', {
                store_id: STORE_ID,
                checkout_token: checkoutToken,
                amount,
                currency: currencyUpper,
                items,
                shipping: shippingCost,
                attribution,
              })
              if (!result?.id) throw new Error('PayPal order ID missing')
              approvalRef.current = {
                checkoutToken,
                amountCents: toCents(amount),
                currency: currencyUpper,
              }
              return result.id
            } catch (err) {
              trackCheckoutEvent('checkout_payment_failed', {
                ...stripeErrorProps(err, 'paypal_create_order'),
                method: 'paypal',
                order_id: orderId,
              })
              throw err
            }
          }}
          onApprove={async (data) => {
            if (captureInFlight.current || capturedOrders.current.has(data.orderID)) return

            // The capture itself is verified server-side; here we only refuse to
            // capture an approval that no longer belongs to what is on screen.
            const approval = approvalRef.current
            const stillTheSameOrder =
              approval &&
              approval.checkoutToken === checkoutToken &&
              approval.amountCents === toCents(amount) &&
              approval.currency === currencyUpper
            if (!stillTheSameOrder) {
              trackCheckoutEvent('checkout_payment_failed', {
                reason: 'selection_changed_during_approval',
                method: 'paypal',
                order_id: orderId,
              })
              toast({
                title: 'Your order changed',
                description: 'Your order changed while PayPal was open. Review the total and pay again.',
                variant: 'destructive',
              })
              return
            }

            captureInFlight.current = true
            try {
              const attribution = getAttributionPayload();
              // Posted once and never re-sent: a repeated capture could take the
              // money twice, and the review state travels in a non-2xx body that
              // the retrying caller would have thrown away.
              const { ok: httpOk, data: captureData } = await callEdgeOnce('paypal-capture-order', {
                store_id: STORE_ID,
                paypal_order_id: data.orderID,
                checkout_token: checkoutToken,
                attribution,
              })

              const outcome = readCaptureOutcome({
                httpOk,
                data: captureData,
                orderId,
                paypalOrderId: data.orderID,
              })

              if (outcome.status === 'requires_review') {
                // PayPal may already hold the money. This is not a decline, so
                // nothing here invites a second payment and nothing marks the
                // order paid — only the backend can settle it.
                capturedOrders.current.add(data.orderID)
                savePaymentReview(outcome.review)
                setReview(outcome.review)
                trackCheckoutEvent('checkout_paypal_requires_review', {
                  method: 'paypal',
                  order_id: outcome.review.orderId,
                  capture_id: outcome.review.captureId,
                  paypal_order_id: outcome.review.paypalOrderId,
                })
                toast({
                  title: PAYMENT_REVIEW_COPY.title,
                  description: PAYMENT_REVIEW_COPY.message,
                })
                return
              }

              if (outcome.status === 'failed') {
                // A real decline: no capture happened, so the usual retry stands.
                throw new Error(outcome.message)
              }

              const res = outcome.data
              capturedOrders.current.add(data.orderID)

              // Build a fallback order object from local props in case res.order is null
              const internalOrderId = res.order?.id || res.order_id
              const fallbackOrder = {
                id: internalOrderId || data.orderID,
                order_number: (internalOrderId || data.orderID).slice(0, 8).toUpperCase(),
                total_amount: amount,
                currency_code: currency.toUpperCase(),
                status: 'paid',
                order_items: items.map((it: any) => ({
                  product_name: it.title || it.product_name || 'Product',
                  quantity: it.quantity,
                  price: it.unit_price || it.price || 0,
                  product_images: it.images || it.product_images || [],
                  variant_name: it.variant_title || it.variant_name || null,
                })),
                created_at: new Date().toISOString(),
              }

              // Always write to localStorage — use server order if available, fallback otherwise
              localStorage.setItem('completed_order', JSON.stringify(res.order ?? fallbackOrder))
              const ordId = internalOrderId || data.orderID

              // Fire Purchase (browser Pixel + CAPI + PostHog) with a unified
              // sessionStorage guard so ThankYou won't re-fire it for this order.
              const ptKey = `purchase_tracked_${ordId}`
              const alreadyTracked = (() => { try { return sessionStorage.getItem(ptKey) === '1' } catch { return false } })()
              if (!alreadyTracked) {
                try { sessionStorage.setItem(ptKey, '1') } catch {}
                trackPurchase({
                  products: items
                    .filter((it: any) => (it.quantity ?? 0) > 0)
                    .map((it: any) => tracking.createTrackingProduct({
                      id: it.product_id || it.id,
                      title: it.title || it.product_name,
                      price: it.unit_price || it.price || 0,
                      category: 'product',
                      variant: it.variant_id ? { id: it.variant_id } : undefined,
                    })),
                  value: amount,
                  currency,
                  order_id: ordId,
                  custom_parameters: { payment_method: 'paypal', checkout_token: checkoutToken },
                })
                trackCheckoutEvent('checkout_payment_succeeded', {
                  method: 'paypal',
                  value: amount,
                  order_id: ordId,
                })
              }

              navigate(`/thank-you/${ordId}`)
            } catch (err: unknown) {
              trackCheckoutEvent('checkout_payment_failed', {
                ...stripeErrorProps(err, 'paypal_capture'),
                method: 'paypal',
                order_id: orderId,
              })
              toast({
                title: 'PayPal error',
                description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
                variant: 'destructive',
              })
            } finally {
              captureInFlight.current = false
            }
          }}
          onError={(err: unknown) => {
            trackCheckoutEvent('checkout_payment_failed', {
              ...stripeErrorProps(err, 'paypal_sdk'),
              method: 'paypal',
              order_id: orderId,
            })
            toast({
              title: 'PayPal error',
              description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
              variant: 'destructive',
            })
          }}
          onCancel={() => {
            trackCheckoutEvent('checkout_paypal_cancelled', { order_id: orderId })
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}