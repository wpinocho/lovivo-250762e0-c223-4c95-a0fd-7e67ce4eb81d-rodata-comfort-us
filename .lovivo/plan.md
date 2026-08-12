# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD)
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`). DO NOT use `es` locale.
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved `www.rodata-us.store` → `www.getrodata.com`.
- **Traffic profile (2026-08-12)**: ~87% mobile, ~75% from Meta. Single-product store: 1,619 of 2,141 pageviews are `/products/rodata-one`.
- **CANONICAL SOCIAL PROOF (2026-08-12)**: **1,000+ riders served · 127 verified reviews · 4.9★**. Never introduce a 4th number.
- **OWNER PREFERENCES** — respect these, do not re-propose:
  - Arrival date belongs in the CHECKOUT ONLY, never on the PDP.
  - NO sizing / returns / shipping FAQ **accordion** inside checkout. One-line microcopy is OK, an accordion is NOT.
  - No on-site surveys for now.
  - Tracking / instrumentation work is always welcome.
  - Owner has a good eye for visual density — avoid stacking multiple cards in a row.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke` for anything meant to be read (ratings, guarantees). Reserve steel for labels.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🔧 Checkout CRO pack v1.1 (visual polish) — READY TO BUILD (2026-08-12)

### Context
v1 shipped today. Owner reviewed two mobile screenshots and flagged:
1. Too much stacked *right above* the pay button (social-proof card + guarantee card + button = a wall).
2. Wants one of the two blocks moved **above the order summary card / higher up the page**.
3. Asked for a general UI quality pass on both blocks.

Visual audit of the screenshots + code confirms the complaint plus 3 concrete UI defects.

### A. Split the two blocks (the main change)
**Rationale**: testimonial = "why buy" → works as *framing*, best seen early by 100% of visitors. Guarantee = risk reversal → belongs at the moment of decision. Two cards stacked delays the CTA and neither gets read.

1. `src/components/StripePayment.tsx` (~line 893-926): REMOVE `<CheckoutSocialProof />` from the pre-CTA stack. Keep only the amber guarantee badge + the `payError` banner there. The wrapper `div` keeps `flex flex-col gap-2.5 mb-3`.
2. Move the ratings numbers INTO the guarantee badge as a compact second line so the decision moment still carries proof without a second card:
   ```
   30-Day Comfort Guarantee — if your back doesn't feel better, we refund you. Free size exchange.
   ★★★★★ 4.9 · 127 verified reviews
   ```
   Second line: `mt-1.5 text-[11px] text-brand-smoke`, stars in `text-brand-amber`, `whitespace-nowrap` chunks.
3. Tighten the guarantee copy — drop the redundant "ride with it for 30 days" (the "30-Day" is already in the label). Goal: 2 lines on mobile instead of 3.
4. Render `<CheckoutSocialProof />` in TWO new places:
   - **Mobile**: in `src/pages/ui/CheckoutUI.tsx`, immediately AFTER `<MobileOrderSummary logic={logic} />` in the parent render (NOT inside the collapsible body — it must survive the future collapse-by-default change). Wrap: `<div className="md:hidden -mt-2 mb-6"><CheckoutSocialProof /></div>`.
   - **Desktop**: directly under the right-column order summary Card, `hidden md:block mt-4`.

### B. Redesign `src/components/CheckoutSocialProof.tsx` (3 real defects)
Current defects observed in the screenshot:
- The blue verified check sits INLINE between the name and the opening quote → reads as one cramped run-on paragraph.
- The rating line wraps mid-sentence leaving a dangling `verified reviews ·` at the end of line 1 and `1,000+ riders` orphaned on line 2.
- Rating line is `text-[11px] text-brand-steel` = too dim for the strongest proof on the page. Avatar rings use `border-brand-carbon` but the card bg is `brand-graphite` → visible mismatch halo.

New structure (3 stacked rows, no inline check):
```
Row 1 — the quote:  text-[13px] leading-snug text-brand-offwhite/90
        "Rode 6 hours straight and my lower back was fine. Should've bought it sooner."
Row 2 — attribution: [3 avatars h-6 w-6, border-brand-graphite] Jason R. ✓(blue) · Verified buyer
        name = text-xs font-semibold text-brand-offwhite ; "Verified buyer" = text-[11px] text-brand-steel
Row 3 — proof line: ★★★★★ 4.9 · 127 verified reviews · 1,000+ riders served
        text-[11px] text-brand-smoke, numbers in text-brand-offwhite font-semibold
```
- Row 3 must use `flex flex-wrap items-center gap-x-1.5 gap-y-1` with each segment `whitespace-nowrap` so a `·` can never end a line.
- Card: `rounded-xl border border-white/[0.08] bg-brand-graphite px-4 py-3.5`.
- Keep the SVG Meta-blue check, just move it next to the name in row 2.
- Numbers stay canonical: 4.9 / 127 / 1,000+.

### C. Sticky mobile pay bar — gate it (defect visible in screenshot 2)
Right now the bar is on screen at the very TOP of checkout, before the user has typed anything, competing with the PayPal / G Pay express buttons. Tapping it only fires the "Required fields" toast → wasted tap, likely rage-click source.

Fix in `StripePayment.tsx`:
1. Add a sentinel `<div ref={payAnchorRef} />` immediately above `<PaymentElement>`.
2. `reachedPayment` latch: set `true` the first time the sentinel intersects; never reset.
3. Sticky bar renders only when `reachedPayment && !ctaVisible`.
4. Bonus: when the sticky CTA is tapped and `onValidationRequired()` fails, `scrollIntoView({ behavior:'smooth', block:'center' })` on the first invalid field (fallback: the CTA) in ADDITION to the toast.
5. Keep the `method: 'sticky_bar'` tracking exactly as-is.

### D. Do NOT change
- Tracking events, `payment-errors.ts`, coupon collapse, size microcopy, delivery window — all fine.

### Measurement (unchanged from v1)
Compare 14 days after vs before: `checkout_pay_clicked` → `checkout_payment_succeeded`, retry rate after `checkout_payment_failed`, share of `sticky_bar` clicks, `$rageclick` on `/pagar`. Fill the "Result" line in `.lovivo/cro-log.md` ~2026-08-26.

### Deferred (unchanged)
- Collapse `MobileOrderSummary` by default (`useState(true)` → `false` at `CheckoutUI.tsx` ~line 569) with a persistent header `$59 · Free shipping · Arrives {date}`.
- PayPal + payment-area skeleton to kill the `enabled:false` flicker.

## 4. Recent Changes
- 2026-08-12: **v1.1 PLANNED (not built)** — owner flagged the pre-CTA stack as too dense; plan: move testimonial under the order summary, merge ratings into the guarantee badge, rebuild `CheckoutSocialProof` in 3 rows (fixes inline check + orphaned "1,000+ riders" wrap + too-dim steel text + avatar ring mismatch), gate the sticky bar behind a payment-section sentinel.
- 2026-08-12: **CHECKOUT CRO PACK v1 SHIPPED** — new `CheckoutSocialProof.tsx` + `payment-errors.ts`; social-proof strip + guarantee badge + persistent decline banner above the pay button; sticky mobile pay bar with `sticky_bar` tracking; desktop coupon collapsed via shared `CouponSection`; size-exchange microcopy in both summaries; customer counts unified to 1,000+ / 127 / 4.9.
- 2026-08-12: **CRO FIXES SHIPPED** — delivery window 6–8 → 5–7 business days; PostHog `autocapture` + `rageclick`; `src/lib/checkout-tracking.ts` micro-events. Owner REJECTED: arrival date on PDP, FAQ accordion in checkout, abandonment survey. Apple/Google Pay confirmed Active.
- 2026-08-12: **CRO DIAGNOSIS** — checkout→purchase drop analyzed. No code regression. Main driver upstream: ATC 6.6%→4.1%, checkout sessions 6→1/day.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map (ES→EN).
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — dashboard filter pinned to old domain rodata-us.store. Fix in PostHog UI.
- 2026-06-26: Tracking fixes APPLIED — PayPal trackPurchase on capture; double PageView de-dup; usd/USD fallback; ThankYou guard unified to sessionStorage.
- 2026-06-24: Order Tracking page BUILT & SHIPPED — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-18: Footer contact → support@getrodata.com
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: PaypalExpressButton.tsx — fallbackOrder; localStorage always written

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/) — used by the PDP strip AND `CheckoutSocialProof.tsx`.

## 6. Known Issues
- **(2026-08-12) Sticky mobile pay bar appears at the very top of `/pagar`** — before any field is filled, next to the PayPal/G Pay buttons. Tap = "Required fields" toast only. Fix in v1.1 section C.
- **(2026-08-12) `CheckoutSocialProof` rating line wraps badly on 375px** — orphaned "1,000+ riders" + dangling `·`. Fix in v1.1 section B.
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout promises it.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — cross-check against real Dashboard orders.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- ~~Social proof numbers inconsistent~~ **RESOLVED 2026-08-12**.
- ~~Payment errors only shown as transient toasts~~ **RESOLVED 2026-08-12** (persistent inline banner).
- ~~Apple/Google Pay domains not registered~~ **RESOLVED 2026-08-12**.

## 7. Pending / Future Sessions
- **P0** Build checkout CRO pack v1.1 (section 3 above).
- **P0** ~2026-08-26: read the checkout pack results and fill the "Result" line in `.lovivo/cro-log.md`.
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing **accordion** in checkout, abandonment survey.