import React from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useSettings } from '@/contexts/SettingsContext'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

interface PaypalExpressButtonProps {
  orderId: string
  checkoutToken: string
  amount: number        // finalTotal in dollars (e.g. 59.00)
  currency: string      // lowercase (e.g. 'usd')
  items: any[]
  shippingCost: number
  onValidationRequired: () => boolean
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
  onValidationRequired,
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
            const valid = onValidationRequired()
            if (!valid) throw new Error('Validation failed')
            const result = await callEdge('paypal-create-order', {
              store_id: STORE_ID,
              checkout_token: checkoutToken,
              amount,
              currency: currencyUpper,
              items,
              shipping: shippingCost,
            })
            return result.id
          }}
          onApprove={async (data) => {
            const res = await callEdge('paypal-capture-order', {
              store_id: STORE_ID,
              order_id: data.orderID,
              checkout_token: checkoutToken,
            })
            navigate(`/thank-you/${res.order.id}`)
          }}
          onError={(err: unknown) => {
            if (err instanceof Error && err.message === 'Validation failed') return
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