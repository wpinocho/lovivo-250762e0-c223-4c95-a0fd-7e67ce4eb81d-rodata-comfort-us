# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD, compare-at $75/$79)
- **Landed cost**: **$10 USD/unit** (owner-confirmed 2026-09-04) → ~83% gross margin. Huge room for AOV levers.
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
  - Owner has a good eye for visual density — avoid stacking multiple cards in a row. Prefers compact single-strip social proof over tall testimonial cards.
  - Owner asks for RESEARCH before UX pattern changes — cite sources, don't assert.
  - Owner wants clear separation between "diagnosed" and "fixed" — never imply a fix shipped when only measurement shipped.
  - **(2026-09-04) AOV levers must NOT dominate the PDP.** Owner explicitly fears losing single-unit conversions. Any upsell must keep 1 unit as the default and stay visually quiet.
  - **(2026-09-04) Offer framing: show the SECOND-unit price, not the blended per-unit price.** "$29.50 for the second" beats "$44 each". Owner prefers the discount to read as a turbo deal on the add-on unit.
  - **(2026-09-04) No "free exchange" promise in the 2-pack microcopy** — different sizes are handled by replying to the order email, not framed as a free-exchange guarantee.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). ⚠️ `text-brand-offwhite` / `border-white/20` are near-WHITE and INVISIBLE on light cards — use adaptive tokens on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx` + `StripePayment.tsx`) are hardcoded DARK — dark tokens are correct there.
- **`text-brand-steel` at ≤11px on dark is TOO DIM for selling copy** — use `text-brand-smoke` for anything meant to be read. `text-brand-steel` is fine for struck-through compare-at prices.
- **Badge emphasis ladder**: quiet = `bg-brand-amber/15 border-brand-amber/30 text-brand-amber`; loud = solid `bg-brand-amber text-brand-carbon`. The 2-pack discount badge uses the loud variant.
- **Avatar rings inside a `bg-brand-graphite` card must use `border-brand-graphite`**.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🟢 AOV: 2-pack shipped (2026-09-04) · 🟠 Google Pay timeout still open

### A. 2-PACK / BOGO — SHIPPED 2026-09-04
**Offer**: 2 belts = **$88.50** = first at $59 + **second at $29.50 (50% off)**, save $29.50.
**Mechanism**: `volume` price rule (NOT the `bogo` rule type — see Known Issues), flat 25% off every unit at qty ≥ 2.
- Rule ID `d30f69a4-b188-4f14-b4e6-8202d81e5d51`, title "Rider + Partner 2-Pack (2nd belt half price)", scoped to product `6a3f41ac-37f6-4886-85f0-01cf0c6238ed`, priority 10.
- Flat 25%-off-both is mathematically identical to "2nd unit 50% off"; the UI expresses it the second way because it converts better.

**Economics**: single order = $59 rev / $49 profit. 2-pack = $88.50 rev / $68.50 profit (+$19.50, +40% per upgraded order). Even at half price the 2nd unit clears $19.50 because landed cost is only $10. **Do not exceed 50% off the second unit.**

**Why 2 options and not 3**: a lumbar belt is a durable, non-consumable, personal-fit item. A 3-pack has no believable use case. Research (Monk Commerce, Voucherify, Uniqodo) says straight BOGO underperforms on considered/premium goods, while a quantity-break selector with the single unit pre-selected is the safe AOV lever.

**UI**: `src/components/ProductPackSelector.tsx` — compact 2-row radio group that **replaced the old quantity stepper**. "One belt / $59" is pre-selected, so the default path is byte-for-byte what it was before. Row 2 (v2, 2026-09-04): solid-amber `2nd belt 50% off` badge, note `First $59 · second only $29.50`, right column shows struck `$118` over `$88.50`. `secondBeltPrice` and `secondBeltOffPct` are DERIVED from `packDiscountPct` — change the DB rule and the copy follows automatically.

**Wiring in `ProductPageUI.tsx`**: `PACK_DISCOUNT_PCT = 25` mirrors the DB rule. `effectiveUnitPrice` / `cartTotal` / `cartCompareAt` drive the main CTA, the bottom CTA and both sticky bars, plus `ProductExpressCheckout unitPrice` (it charges `unitPrice * quantity`, so passing the raw price would have OVERCHARGED wallet buyers $118 for 2).

**VERIFIED 2026-09-04**: console shows `checkout-create` returning `subtotal: 118, discount_amount: 29.5, total_amount: 88.5` — the backend DOES apply the volume rule at order creation. Card path confirmed; wallet + PayPal still unverified.

### B. Google Pay CALLBACK_TIMED_OUT — status: NOT FIXED, only instrumented
- Intermittent; owner retried and it worked. Hypothesis: `handleExpressCheckoutConfirm` does `elements.submit()` → `callEdge("payments-create-intent")` → `stripe.confirmPayment()` *inside* the wallet callback; Google Pay aborts if that's slow.
- Remedy still PENDING: pre-create the PaymentIntent before the wallet sheet opens, cache `client_secret`.
- `checkout_wallet_timing` (`intent_ms`) had not fired yet as of 08-13.

### C. Correction to the 2026-08-13 diagnosis (keep this nuance)
Aug 10–11 had ~1 checkout view/day — the "4-day zero-purchase drought" was mostly a TRAFFIC collapse, not a broken checkout. Only **Aug 12 (7 checkout views → 0 purchases)** is genuinely suspicious.

## 4. Recent Changes
- 2026-09-04: **2-PACK OFFER FRAMING v2** — row 2 now sells the second unit, not a blended average: solid-amber `2nd belt 50% off` badge (was a soft `Save $30` chip), note `First $59 · second only $29.50` (was `$44 each · second belt half price`), and a struck `$118` above the `$88.50` total. Both values derive from `packDiscountPct`. Also dropped "Free exchange," from the mixed-size microcopy in `ProductPageUI.tsx` — now just "Different size for the second rider? Just reply to your order email."
- 2026-09-04: **2-PACK AOV LEVER SHIPPED** — created volume price rule `d30f69a4` (25% off all units at qty ≥ 2 = 2 belts for $88.50); new `ProductPackSelector.tsx` replaced the quantity stepper with a quiet 1-vs-2 radio group (1 pre-selected); `ProductPageUI.tsx` now computes `effectiveUnitPrice`/`cartTotal`/`cartCompareAt` and feeds them to the main CTA, bottom CTA, both sticky bars and `ProductExpressCheckout` (prevented a $118 overcharge on wallet 2-packs). Also translated the leftover Spanish toasts in `HeadlessProduct.tsx` + `ProductAdapter.tsx` to English.
- 2026-08-13: **PAYPAL INSTRUMENTED + ROUTING BUG FIXED + DIAGNOSIS CORRECTED** — added `checkout_paypal_shown/started/cancelled`, failure events on createOrder/capture/SDK, and `checkout_payment_succeeded`. Fixed `StripePayment.tsx` navigating to the non-existent `/pago-pendiente/:id` (real route `/pending-payment/:id`) → customers hit a 404 after paying.
- 2026-08-13: **GOOGLE PAY MOBILE DIAGNOSIS + INSTRUMENTATION** — `checkout_wallet_timing`, `checkout_wallet_cancelled`, `checkout_wallet_load_error`. No fix applied.
- 2026-08-12: **CHECKOUT CRO PACK v1.2** — compact social-proof strip above the mobile order summary; `MobileOrderSummary` collapsed by default; sticky pay bar kept.
- 2026-08-12: **CHECKOUT CRO PACK v1.1** — testimonial under the order summary; ratings merged into the guarantee badge; sticky bar gated behind a payment sentinel; validation scrolls to the bad field.
- 2026-08-12: **CHECKOUT CRO PACK v1** — `CheckoutSocialProof.tsx` + `payment-errors.ts`; guarantee badge; sticky mobile pay bar; counts unified.
- 2026-08-12: **CRO FIXES** — delivery window 6–8 → 5–7 business days; PostHog autocapture + rageclick; `checkout-tracking.ts`.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map.
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — filter pinned to old domain.
- 2026-06-26: Tracking fixes — PayPal trackPurchase on capture; PageView de-dup; usd/USD fallback.
- 2026-06-24: Order Tracking page BUILT & SHIPPED.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal.

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/)
- Product images (6): `product-images/products/{ikd1slcjslh,kq3m6oa30qp,4ui0bi0f6nt,0aesq7u46qs4,b5mg4lv2qbf,2l8h0ww9eb5}.webp`

## 6. Known Issues
- **(2026-09-04) The 2-pack discount only applies to ONE cart line item.** `calcItemUnitPrice` keys off `item.quantity`, so 2 belts in **different sizes** = 2 lines of qty 1 = NO discount. Current mitigation is copy: "Both belts ship in the size selected above. Different size for the second rider? Just reply to your order email." A true mixed-size 2-pack needs a cart-level rule or a bundle.
- **(2026-09-04) `bogo` rule type is likely BROKEN in the storefront.** `create-price-rule` writes `bogo_mode: "same_products"` (plural) but `calcBogoDiscount` in `price-rule-utils.ts` checks `!== 'same_product'` (singular) and bails. This is why the 2-pack uses a `volume` rule instead. Verify before ever using a bogo rule.
- **(2026-09-04) Wallet + PayPal 2-unit charge still UNVERIFIED.** Card path is confirmed at $88.50 via `checkout-create` logs; wallet (`ProductExpressCheckout`) and PayPal build their amounts differently.
- **(2026-09-04) `price-rule-utils.ts` has Spanish labels** in the graduated-volume path (`hasta X% OFF`) and the bogo path (`NxM aplicado`). Unused by the current flat rule, but they'd surface in the cart if the rule type changes.
- **(2026-08-13) Google Pay `CALLBACK_TIMED_OUT` on mobile — NOT FIXED**, only measurable.
- **(2026-08-13) Wallet success path never fires `checkout_payment_succeeded`** — card + PayPal do.
- **(2026-08-13) `ProductExpressCheckout.tsx` is still hardcoded to Mexico**: `country: 'MX'`, currency fallback `'mxn'`, Spanish `'Envío'` label. Same in-callback timeout exposure.
- **(2026-08-12) `lov-search-files` glob with `{a,b}` braces returns 0 matches** — use `src/**` instead.
- **(2026-08-12) `lov-view` with two line ranges only returns the FIRST range.**
- **(2026-08-12) Fulfillment must actually support 5–7 business days.**
- **(2026-08-12) PayPal settings race** — `enabled: false | clientId: null` logs before the RPC resolves; button may flicker.
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI.
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI.
- Country name "Estados Unidos" on the thank-you page comes from backend data.
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid.
- `src/adapters/ProductAdapter.tsx` is `useProductCardLogic` (ProductCard only). The **PDP logic lives in `src/components/headless/HeadlessProduct.tsx`** — don't confuse them.

## 7. Pending / Future Sessions
- **P0** Confirm the 2-unit charge is **$88.50** on wallet (Apple/Google Pay) AND PayPal. Card is already verified.
- **P0** Read `checkout_wallet_timing.intent_ms` by device → if slow, pre-create the PaymentIntent before the wallet sheet opens.
- **P0** Check Stripe for orphan PaymentIntents after a `CALLBACK_TIMED_OUT`.
- **P0** Add `checkout_payment_succeeded` to the wallet success branch in `StripePayment.tsx`.
- **P1** Measure the 2-pack: attach rate (orders with qty ≥ 2 ÷ all orders) and AOV before/after 2026-09-04. Target attach rate 8–15%. If ATC rate drops at all, the selector is too loud — shrink it.
- **P1** Mixed-size 2-pack (rider + partner, different waists) — needs cart-level discount or a bundle. This is the biggest unlock for the offer.
- **P1** Write the v1.2 entry + v1.1 "Result" line in `.lovivo/cro-log.md`, and log the 2026-09-04 2-pack change + v2 framing.
- **P1** Investigate Aug 12 (7 checkout views → 0 purchases) with session replays.
- **P1** Abandoned-cart email automation (Dashboard AI).
- **P2** Localize `ProductExpressCheckout.tsx` to US once the Stripe account country is confirmed.
- **P2** Replace feature images (FEAT_IMG_1-3) with English versions.
- **Blocked** No A/B tests on checkout until weekly conversions grow (~8/week vs ~500 needed). The 2-pack was shipped straight to 100% for this reason.
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing accordion in checkout, abandonment survey, "free exchange" wording in the 2-pack microcopy.