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
### 🔧 IN PROGRESS: Checkout + PDP Conversion Fixes (4 items)

**Summary**: Reduce checkout abandonment and PDP bounce by addressing delivery uncertainty and disconnection from product.

---

#### Fix 1 — Delivery date line in order summary (Checkout)
**File**: `src/pages/ui/CheckoutUI.tsx`

Add a "Free shipping · Arrives [date range]" line to BOTH the desktop order summary (right panel, below the totals) and the `MobileOrderSummary` component.

Delivery date logic (pure JS, no deps):
```ts
function getEstimatedDelivery(): string {
  // Ships within 24-48h, transit 5-7 business days → add 7-9 business days total
  const today = new Date();
  const addBusinessDays = (d: Date, days: number): Date => {
    let count = 0;
    const result = new Date(d);
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const dow = result.getDay();
      if (dow !== 0 && dow !== 6) count++;
    }
    return result;
  };
  const earliest = addBusinessDays(today, 7);
  const latest   = addBusinessDays(today, 9);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(earliest)} – ${fmt(latest)}`;
}
```

In the desktop order summary (after the Total row, before the closing div), add:
```tsx
<div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.08] text-xs text-brand-steel">
  <Truck size={12} className="text-brand-amber flex-shrink-0" />
  <span>Free shipping · <span className="text-brand-smoke">Arrives {getEstimatedDelivery()}</span></span>
</div>
```

Same block in `MobileOrderSummary` after the Total row.

---

#### Fix 2 — Mobile order summary expanded by default
**File**: `src/pages/ui/CheckoutUI.tsx`

In `MobileOrderSummary`, change:
```ts
const [open, setOpen] = useState(false);
```
to:
```ts
const [open, setOpen] = useState(true);
```

Desktop already shows product photo + name correctly (lines 414–468). ✅ No change needed there.

---

#### Fix 3 — Trust reinforcement above payment button in checkout
**File**: `src/components/StripePayment.tsx`

Find the section just above the "Complete Purchase" button (the trust signals block already exists below it). We need to ADD a compact trust block ABOVE the button with:
- 4.9★ · 127 riders — social proof
- 30-Day Comfort Guarantee — risk reversal

Implementation: In StripePayment.tsx, find the trust signals block that was added on 2026-06-05 (the one with ShieldCheck, Truck, RotateCcw icons). Add ABOVE the pay button (before the `<button>Complete Purchase</button>`) this block:

```tsx
{/* Pre-pay trust reinforcement */}
<div className="flex flex-col gap-2 mb-3">
  <div className="flex items-center justify-center gap-2 text-xs text-brand-steel">
    {/* Stars */}
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(s => <span key={s} style={{color:'#C98B2E'}}>★</span>)}
    </span>
    <span className="text-brand-smoke font-medium">4.9</span>
    <span>· 127 verified riders</span>
  </div>
  <div className="flex items-center justify-center gap-1.5 text-xs text-brand-steel">
    <RotateCcw size={11} className="text-brand-amber" />
    <span>30-Day Comfort Guarantee — ride it, feel it, or we make it right</span>
  </div>
</div>
```

Note: RotateCcw is already imported in StripePayment.tsx (check imports). If not, import from lucide-react.

---

#### Fix 4 — "Shipping & Returns" accordion in PDP near CTA
**File**: `src/pages/ui/ProductPageUI.tsx`

Add a new accordion item BETWEEN the trust row (grid of 3 icons) and the social proof banner (the rider photos block). The Accordion component is already imported.

```tsx
{/* Shipping & Returns accordion */}
<div className="border-t border-white/[0.08] pt-4">
  <Accordion type="single" collapsible>
    <AccordionItem value="shipping" className="border-white/[0.08]">
      <AccordionTrigger className="font-sora font-semibold text-brand-smoke text-xs py-3 hover:no-underline hover:text-brand-offwhite [&>svg]:text-brand-amber [&>svg]:h-3.5 [&>svg]:w-3.5">
        <span className="flex items-center gap-2">
          <Truck size={13} className="text-brand-amber" />
          Shipping & Returns
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3 space-y-2">
        <div className="text-brand-steel text-xs font-inter space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-brand-amber mt-0.5">→</span>
            <span><span className="text-brand-smoke font-medium">Free US shipping</span> on all orders. No minimum.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-brand-amber mt-0.5">→</span>
            <span>Ships in <span className="text-brand-smoke font-medium">24–48 hrs</span>. Estimated arrival: <span className="text-brand-smoke font-medium">{getEstimatedDelivery()}</span></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-brand-amber mt-0.5">→</span>
            <span><span className="text-brand-smoke font-medium">30-day comfort trial</span> — if it's not right, we'll make it right.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-brand-amber mt-0.5">→</span>
            <span>Free <span className="text-brand-smoke font-medium">size exchange</span>. No hassle.</span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

The `getEstimatedDelivery()` function should be defined at the module level (outside the component), same logic as Fix 1. Only needs to be defined once and imported/used in both files.

---

### Files to modify
- `src/pages/ui/CheckoutUI.tsx` — Fix 1 (delivery date) + Fix 2 (mobile open by default)
- `src/components/StripePayment.tsx` — Fix 3 (trust above button)
- `src/pages/ui/ProductPageUI.tsx` — Fix 4 (shipping accordion)

### Key notes for Craft Mode
- `getEstimatedDelivery()` pure function defined at module level in each file (or could be extracted to a utils file)
- StripePayment.tsx: find the `{/* Trust signals below CTA */}` comment added on 2026-06-05, then go UP to find the Complete Purchase button — insert the trust block BETWEEN the button and whatever is above it
- The Truck icon is already imported in CheckoutUI.tsx (line 9) ✅
- The Accordion + AccordionItem are already imported in ProductPageUI.tsx (line 15) ✅

## 4. Recent Changes
- 2026-06-09: **ProductPageUI.tsx** — Added Launch Offer amber badge below price block
- 2026-06-05: **StripePayment.tsx** — Added trust signals below CTA (Free U.S. Shipping · Secure Checkout · 30-Day Guarantee + card logos). Replaced Terms|Privacy alone with full trust block.
- 2026-06-05: **CheckoutUI.tsx** — Updated top security bar: removed "SSL encrypted" jargon → "Secure Checkout · Powered by Stripe"
- 2026-06-05: **StripePayment.tsx + CheckoutUI.tsx** — Full English translation (30 strings). Stripe locale set to `'en'`. Default country MX→US. Express checkout price bug fixed.
- 2026-06-05: **IndexUI.tsx** — All hardcoded prices ($49, $75, 35% OFF) now dynamically read from `filteredProducts[0].price` and `compare_at_price` via `useSettings().formatMoney`. Updates automatically when product price changes in Dashboard.
- 2026-06-04: **PixelContext.tsx** — Persist fbclid → fbc to localStorage (_fbc_fallback) AND set first-party cookie (90 days). Survives refresh/navigation.
- 2026-06-04: **tracking-utils.ts** — `getUserDataForCapi()` now reads `_fbc_fallback` and `_fbp_fallback` from localStorage as fallback if React state is null.
- 2026-06-04: **StripePayment.tsx** — Fixed `item.price / 100` bug in handlePayment: item.price was already in dollars, division was sending $0.49 instead of $49 to Meta.
- 2026-06-04: **ThankYou.tsx** — Added deferred Purchase tracking for Stripe 3DS redirect flow (`redirect_status=succeeded` in URL). Uses fire-once guard (`purchase_tracked_<orderId>` in localStorage).
- 2026-06-01: **ThankYou.tsx** — Full English translation (20 strings)
- 2026-05-28: **ProductPageUI.tsx** — badge -35% half in/half out (desktop restructure + mobile -translate-y-1/2)

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

## 7. Key Files
- `src/pages/ui/IndexUI.tsx` — ✅ Prices now dynamically linked to product DB via useSettings().formatMoney
- `src/contexts/PixelContext.tsx` — ✅ fbclid now persisted to localStorage + first-party cookie
- `src/lib/tracking-utils.ts` — ✅ CAPI getUserDataForCapi reads localStorage fallback for fbc/fbp
- `src/components/StripePayment.tsx` — ✅ Full EN translation + MX→US default + locale:'en' + express checkout price bug fixed + trust signals below CTA
- `src/pages/ThankYou.tsx` — ✅ Deferred Purchase event for 3DS redirect flow
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + image optimization + UX improvements + Launch Offer badge
- `index.html` — ✅ English meta + non-blocking fonts (Sora+Inter only)
- `src/templates/EcommerceTemplate.tsx` — ✅ English + new trust bar
- `src/pages/ui/CheckoutUI.tsx` — ✅ Fully translated to English + updated top security bar