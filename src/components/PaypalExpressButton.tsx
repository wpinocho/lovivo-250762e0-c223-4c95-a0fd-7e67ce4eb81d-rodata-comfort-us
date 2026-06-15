import React from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useSettings } from '@/contexts/SettingsContext'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { getAttributionPayload } from '@/lib/tracking-utils'

interface PaypalExpressButtonProps {
  orderId: string
  checkoutToken: string
  amount: number        // finalTotal in dollars (e.g. 59.00)
  currency: string      // lowercase (e.g. 'usd')
  items: any[]
  shippingCost: number
  className?: string    // outer wrapper className
  showDivider?: boolean // show "or pay with" label above (default true)
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
}: PaypalExpressButtonProps) {
  const { paypalEnabled, paypalClientId, paypalEnvironment } = useSettings()
  const { toast } = useToast()
  const navigate = useNavigate()

  console.log('[PayPal Button] paypalEnabled:', paypalEnabled, '| paypalClientId:', paypalClientId ? paypalClientId.slice(0,12)+'...' : null, '| checkoutToken:', !!checkoutToken)
  if (!paypalEnabled || !paypalClientId || !checkoutToken) return null

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
          createOrder={async () => {
            // PayPal Express: no form validation needed — PayPal collects
            // the buyer's shipping address inside the PayPal popup.
            const attribution = getAttributionPayload();
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
            return result.id
          }}
          onApprove={async (data) => {
            try {
              const attribution = getAttributionPayload();
              const res = await callEdge('paypal-capture-order', {
                store_id: STORE_ID,
                paypal_order_id: data.orderID,
                checkout_token: checkoutToken,
                attribution,
              })
              if (!res?.ok || res?.status !== 'COMPLETED') {
                throw new Error(res?.error || 'Payment not completed')
              }

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
              navigate(`/thank-you/${ordId}`)
            } catch (err: unknown) {
              toast({
                title: 'PayPal error',
                description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
                variant: 'destructive',
              })
            }
          }}
          onError={(err: unknown) => {
            toast({
              title: 'PayPal error',
              description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
              variant: 'destructive',
            })
          }}
          onCancel={() => { /* user closed popup — no action needed */ }}
        />
      </PayPalScriptProvider>
    </div>
  )
}