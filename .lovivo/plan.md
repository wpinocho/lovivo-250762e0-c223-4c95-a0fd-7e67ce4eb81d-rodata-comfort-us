# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — loaded from Google Fonts (async/non-blocking)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar

## 3. Active Plan
### 🚧 IN PROGRESS: PayPal Integration in Checkout

**Goal**: Add PayPal as a conditional payment method in `/checkout` (only renders when store has an active PayPal account connected via Dashboard).

#### Step 1 — Install dependency (Craft Mode)
```
bun add @paypal/react-paypal-js
```

#### Step 2 — Extend SettingsContext (`src/contexts/SettingsContext.tsx`)
Add a third `useQuery` in parallel (after the existing `platform_stores` query):

```ts
const { data: paypalAccount } = useQuery({
  queryKey: ['paypal-account', STORE_ID],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('paypal_accounts_safe')
      .select('environment, client_id, status, merchant_email')
      .eq('store_id', STORE_ID)
      .eq('status', 'active')
      .maybeSingle()
    if (error) { console.warn('paypal_accounts_safe:', error); return null }
    return data
  },
  staleTime: 60000,
  retry: 1
})
```

Add to `SettingsContextType` interface:
```ts
paypalEnabled: boolean
paypalClientId: string | null
paypalEnvironment: 'sandbox' | 'live' | null
```

Derive values:
```ts
const paypalEnabled = paypalAccount?.status === 'active' && !!paypalAccount?.client_id
const paypalClientId = paypalAccount?.client_id || null
const paypalEnvironment = (paypalAccount?.environment as 'sandbox' | 'live') || null
```

Add to `isLoading`: also check paypalAccount loading.

Expose all 3 new values in the context value object.

#### Step 3 — Create `src/components/PaypalExpressButton.tsx`

```tsx
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
  amount: number          // finalTotal in dollars (e.g. 59.00)
  currency: string        // lowercase (e.g. 'usd')
  items: any[]
  shippingCost: number
  onValidationRequired: () => boolean
}

export const PaypalExpressButton = ({
  orderId,
  checkoutToken,
  amount,
  currency,
  items,
  shippingCost,
  onValidationRequired,
}: PaypalExpressButtonProps) => {
  const { paypalEnabled, paypalClientId, paypalEnvironment } = useSettings()
  const { toast } = useToast()
  const navigate = useNavigate()

  if (!paypalEnabled || !paypalClientId) return null

  const currencyUpper = currency.toUpperCase()

  return (
    <PayPalScriptProvider
      key={`${paypalClientId}-${currencyUpper}`}
      options={{
        'client-id': paypalClientId,
        currency: currencyUpper,
        intent: 'capture',
        'enable-funding': 'venmo,paylater',
        components: 'buttons',
        ...(paypalEnvironment === 'sandbox' ? { 'data-environment': 'sandbox' } : {}),
      }}
    >
      <div className="mt-3">
        <PayPalButtons
          style={{ layout: 'horizontal', height: 45, tagline: false, color: 'gold' }}
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
          onError={(err: any) => {
            if (err?.message === 'Validation failed') return
            toast({ title: 'PayPal error', description: err?.message || 'Something went wrong', variant: 'destructive' })
          }}
          onCancel={() => { /* user closed popup — no action needed */ }}
        />
      </div>
    </PayPalScriptProvider>
  )
}
```

#### Step 4 — Mount in `CheckoutUI.tsx`

**Import at top:**
```tsx
import { PaypalExpressButton } from '@/components/PaypalExpressButton'
```

**Placement:** After the closing `</StripePayment>` tag (line ~367) but INSIDE the `isStripeReady` block, BEFORE the outer `</section>` at line ~370. This ensures the same `isStripeReady` guard (orderId, checkoutToken, etc.) applies. The PaypalExpressButton has its own PayPalScriptProvider so it's independent of Stripe's `<Elements>`.

Add right after `</StripePayment>` and before `);` that closes the return of the IIFE:

```tsx
<PaypalExpressButton
  orderId={logic.orderId}
  checkoutToken={logic.checkoutToken}
  amount={logic.finalTotal}
  currency={logic.currencyCode.toLowerCase()}
  items={logic.orderItems}
  shippingCost={logic.shippingCost}
  onValidationRequired={() => {
    if (!logic.usePickup) {
      const missing: string[] = []
      const emailOk = !!logic.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(logic.email)
      if (!emailOk) missing.push('valid email')
      if (!addressElementComplete) missing.push('complete address')
      if (
        Array.isArray(logic.deliveryExpectations) &&
        logic.deliveryExpectations.length > 0 &&
        !logic.selectedDeliveryMethod
      ) missing.push('shipping method')
      if (missing.length > 0) {
        toast({
          title: 'Required fields',
          description: `Please complete: ${missing.join(', ')}`,
          variant: 'destructive',
          duration: 5000,
        })
        return false
      }
      return true
    }
    return logic.validateCheckoutFields()
  }}
/>
```

#### Files to modify
- `src/contexts/SettingsContext.tsx` — add paypal_accounts_safe query + 3 new context fields
- `src/components/PaypalExpressButton.tsx` — CREATE new component
- `src/pages/ui/CheckoutUI.tsx` — import + mount PaypalExpressButton after StripePayment
- `package.json` via `lov-add-dependency` — `@paypal/react-paypal-js`

#### Notes
- No changes to edge functions (they live in Lovivo's Supabase, not this repo)
- `navigate('/thank-you/...')` — confirm correct route path (currently uses /gracias/ in some places — double-check ThankYou.tsx route)
- PaypalExpressButton returns `null` when `!paypalEnabled` → zero impact for stores without PayPal
- Currency key ensures PayPalScriptProvider re-mounts if currency changes mid-session

## 4. Recent Changes
- 2026-06-10: **CheckoutUI.tsx** — Shipping shows "FREE" (was "Pending") when shippingCost === 0 on mobile
- 2026-06-09: **CheckoutUI.tsx + ProductPageUI.tsx** — Delivery window changed to 6–8 business days (was 7–9)
- 2026-06-09: **StripePayment.tsx** — Removed duplicate "30-Day Comfort Guarantee" line above buy button (already in trust bar below). Kept only ★4.9 · 127 verified riders pre-pay.
- 2026-06-09: **CheckoutUI.tsx** — Added `getEstimatedDelivery()` fn + "Free shipping · Arrives [date]" line in desktop order summary + mobile summary. Added Truck icon to imports.
- 2026-06-09: **CheckoutUI.tsx** — Mobile order summary now open by default (`useState(true)`)
- 2026-06-09: **StripePayment.tsx** — Added pre-pay trust block ABOVE "Complete Purchase" button: 4.9★ · 127 verified riders + 30-Day Comfort Guarantee
- 2026-06-09: **ProductPageUI.tsx** — Added `getEstimatedDelivery()` fn + "Shipping & Returns" accordion between trust row and social proof banner. Shows: free US shipping, 24–48h dispatch, estimated arrival date, 30-day trial, free size exchange.
- 2026-06-09: **ProductPageUI.tsx** — Added Launch Offer amber badge below price block
- 2026-06-05: **StripePayment.tsx** — Added trust signals below CTA (Free U.S. Shipping · Secure Checkout · 30-Day Guarantee + card logos). Replaced Terms|Privacy alone with full trust block.
- 2026-06-05: **CheckoutUI.tsx** — Updated top security bar: removed "SSL encrypted" jargon → "Secure Checkout · Powered by Stripe"
- 2026-06-05: **StripePayment.tsx + CheckoutUI.tsx** — Full English translation (30 strings). Stripe locale set to `'en'`. Default country MX→US. Express checkout price bug fixed.
- 2026-06-05: **IndexUI.tsx** — All hardcoded prices ($49, $75, 35% OFF) now dynamically read from `filteredProducts[0].price` and `compare_at_price` via `useSettings().formatMoney`. Updates automatically when product price changes in Dashboard.
- 2026-06-04: **PixelContext.tsx** — Persist fbclid → fbc to localStorage (_fbc_fallback) AND set first-party cookie (90 days). Survives refresh/navigation.
- 2026-06-04: **tracking-utils.ts** — `getUserDataForCapi()` now reads `_fbc_fallback` and `_fbp_fallback` from localStorage as fallback if React state is null.
- 2026-06-04: **StripePayment.tsx** — Fixed `item.price / 100` bug in handlePayment: item.price was already in dollars, division was sending $0.49 instead of $49 to Meta.

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- **META DIAGNÓSTICO 🔴1**: Likely an expired CAPI Access Token — fix in Meta Business Manager → System Users → generate a new non-expiring token and update in Lovivo Dashboard Settings.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI — no fix needed in frontend
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid — consider replacing with English versions
- Google Pay error on checkout: domain needs to be registered in Stripe Dashboard > Settings > Payment methods > Google Pay
- **PAYPAL TODO**: Confirm correct thank-you route path — some code uses `/gracias/` others may use `/thank-you/`. Check App.tsx routes before finalizing PaypalExpressButton navigate() call.

## 7. Key Files
- `src/pages/ui/IndexUI.tsx` — ✅ Prices now dynamically linked to product DB via useSettings().formatMoney
- `src/contexts/PixelContext.tsx` — ✅ fbclid now persisted to localStorage + first-party cookie
- `src/lib/tracking-utils.ts` — ✅ CAPI getUserDataForCapi reads localStorage fallback for fbc/fbp
- `src/components/StripePayment.tsx` — ✅ Full EN translation + MX→US default + locale:'en' + express checkout price bug fixed + trust signals below CTA + pre-pay ★ rating above button (no duplicate guarantee)
- `src/pages/ThankYou.tsx` — ✅ Deferred Purchase event for 3DS redirect flow
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + image optimization + UX improvements + Launch Offer badge + Shipping & Returns accordion (6–8 biz days)
- `index.html` — ✅ English meta + non-blocking fonts (Sora+Inter only)
- `src/templates/EcommerceTemplate.tsx` — ✅ English + new trust bar
- `src/pages/ui/CheckoutUI.tsx` — ✅ Fully translated + top security bar + delivery date line (6–8 biz days) + mobile summary open by default

## 8. Pending / Future Sessions
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay