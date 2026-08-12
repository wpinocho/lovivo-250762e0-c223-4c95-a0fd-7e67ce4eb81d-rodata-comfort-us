# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt ($59 USD)
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`, "Jun 12, 2026"). DO NOT use `es` date-fns locale.
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved `www.rodata-us.store` → `www.getrodata.com`.
- **Traffic profile (2026-08-12)**: ~87% mobile, ~75% from Meta (facebook.com / m.facebook.com / instagram.com, plus Facebook in-app browser). Single-product store: 1,619 of 2,141 pageviews are `/products/rodata-one`.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8 near-white), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). `.dark` class exists but many pages render LIGHT. ⚠️ `text-brand-offwhite` / `border-white/20` / `bg-white/15` are near-WHITE and INVISIBLE on light cards — use adaptive tokens (`text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`) on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx`) are hardcoded DARK (`bg-[#111315]` / `bg-[#1D2125]`) — dark tokens are correct there.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🔴 CRO: checkout→purchase drop diagnosis (2026-08-12)

### DIAGNOSIS SUMMARY (data-backed, 2026-08-12)

**Code is NOT the cause.** `git-log` shows the last commit is `c6c1340` on **2026-07-03**. Nothing shipped between Aug 3 and Aug 12. The drop is not a code regression.

**Funnel by week (PostHog, `viewcontent` → `addtocart` → `initiatecheckout` → `purchase`):**
| Period | viewcontent | addtocart | ATC rate | initiatecheckout | purchase | IC→PUR |
|---|---|---|---|---|---|---|
| Jul 13–19 | 365 | 28 | 7.7% | 21 | 10 | 48% |
| Jul 20–26 | 405 | 27 | 6.7% | 23 | 5 | 22% |
| Jul 27–Aug 2 | 230 | 10 | 4.3% | 10 | 3 | 30% |
| Aug 3–9 | 410 | 27 | 6.6% | 26 | 13 | **50%** |
| **Aug 10–12** | **193** | **8** | **4.1%** | **5** | **0** | **0%** |
- 30d totals: 1,603 viewcontent / 99 atc / 85 ic / 32 purchase. Overall IC→PUR ≈ 38%.
- Distinct sessions reaching `/pagar`: Aug 8 = 6, Aug 9 = 5, **Aug 10 = 1, Aug 11 = 1, Aug 12 = 3**.
- Last `purchase` event: **2026-08-09 19:53 UTC**.

**Finding #1 — The primary drop is NOT checkout→purchase, it's volume upstream.**
Traffic is FLAT/UP (Aug 11 = 87 viewcontent, highest of the month) but add-to-cart rate fell 6.6% → 4.1%. Fewer people even reach `/pagar` (6→1). The `0/5` checkout→purchase is real but **n=5 is statistically meaningless** (P(0 of 5 at 45% rate) ≈ 5%). Do not treat 0% as a broken checkout without more data.

**Finding #2 — Ad-level data points at Meta, not the store.** Query on `properties.utm_content`:
- WINNERS carrying nearly all revenue: `120251729944850736` (246 vc / 11 atc / 4 pur), `120251747888880736` (227 / 13 / 4), `120250321849460736` (184 / 8 / 3).
- ⚠️ `120250321849460736` — a proven converter — **stopped delivering exactly on 2026-08-09**, the same day purchases stopped.
- ~12 newer ads launched Aug 3–11 (`120251729888140736`, `120251747791510736`, `120251743231170736`, `120251828224720736`, `120251729967400736`, `120251730119240736`, `120251729928770736`, etc.) have **0 purchases on ~60 combined product views**. Budget appears to have fragmented across non-converting creatives.
- ACTION (Dashboard, not code): re-activate/scale the 3 winning ads, pause the 0-conversion ads.

**Finding #3 — Delivery-promise mismatch is the strongest on-site friction hypothesis.**
- `ProductPageUI.tsx` line ~343 says **"In stock · Ships in 24–48 hrs"** and the offer badge says "Free U.S. Shipping included". **No arrival date is ever shown on the PDP.**
- `CheckoutUI.tsx` `getEstimatedDelivery()` (lines 23–40) computes **6–8 BUSINESS days** → renders "Arrives Aug 20 – Aug 24" = **8–12 calendar days out**, and this is the FIRST time the buyer sees a date, at the moment of payment.
- Session evidence (`posthog-session-list`, initiatecheckout without purchase): multiple users hit `/pagar` and **bounce straight back to the PDP within 5–16 seconds**, then leave. Examples: session `019fe02b` (Aug 8, ic 07:00:01 → PDP 07:00:06, **5s**), `019fedb4` (Aug 10, ic 22:05:05 → PDP 22:05:21 → then navigates to **#faq** → leaves), `019fe1b9` (Aug 8, ic → PDP 4 min later). This is classic "I need to re-check something before paying" behavior (shipping time and/or size).
- 15/15 dropped sessions had `error_signals: 0` → **no JS errors, no payment errors**. The checkout is not technically broken.

**Finding #4 — Instrumentation blind spot.** All 15 dropped sessions report `click_count: 0` → PostHog **autocapture appears disabled**. We cannot see button clicks, rage clicks, payment-method selection or field-level abandonment. This is the biggest obstacle to a real checkout diagnosis.

**Finding #5 — Wallet payments likely broken on the live domain.** Known open issue: `getrodata.com` is NOT registered in the Stripe Dashboard for Apple Pay / Google Pay. With ~87% mobile traffic (much of it Facebook in-app browser), losing wallets forces manual card entry — the single biggest mobile conversion killer. The GPay button renders in the UI but must be verified end-to-end on the live domain.

**Finding #6 — PayPal settings race.** Console shows `[PayPal Settings] enabled: false | clientId: null | rawRow: undefined` fired BEFORE `[PayPal RPC] ... status: active` resolves. The PayPal button may render late / flicker on slow mobile connections.

### IMPLEMENTATION STEPS (Craft Mode)

**P0 — Set delivery expectations early and consistently (biggest expected lift)**
1. `src/pages/ui/ProductPageUI.tsx`: next to the stock signal (~line 340–345), add the ARRIVAL estimate, not just dispatch. Extract the date helper into a shared module so PDP and Checkout can never disagree.
   - Create `src/lib/delivery.ts` exporting `getEstimatedDeliveryRange()` (move the `addBusinessDays` logic out of `CheckoutUI.tsx` lines 23–40) and `getEstimatedDeliveryLabel()`.
   - PDP copy: `In stock · Ships in 24–48 hrs · Free U.S. delivery, arrives {range}`.
2. `src/pages/ui/CheckoutUI.tsx`: import from `@/lib/delivery` instead of the local `getEstimatedDelivery()`. Delete the duplicate.
3. Reduce the perceived wait: change transit window from **6–8 business days to 3–7 business days** IF fulfillment can actually support it (ASK THE USER FIRST — do not promise faster than reality). If it cannot, keep the range but reframe: `Free tracked U.S. shipping · Arrives {range} · 30-day comfort guarantee` so the long window sits next to the risk reversal.
4. `src/pages/ui/CheckoutUI.tsx` mobile summary (~line 667–670): make the delivery line higher-contrast (`text-brand-smoke` instead of `text-brand-steel`) and append `· 30-Day Comfort Guarantee`.

**P0 — Kill the "go back and re-check" loop inside checkout**
5. `src/pages/ui/CheckoutUI.tsx` order summary rows (~line 460 and ~line 636): the variant already renders (`item.variant.name`, e.g. "S (24–30 in)"). Add a small inline reassurance under it: `Wrong size? Free exchanges within 30 days.` — so users don't leave checkout to re-open the size guide on the PDP.
6. Add a compact FAQ/objection accordion INSIDE the checkout summary (shipping time, returns, sizing) so the answer is one tap away and the user never leaves `/pagar`.

**P0 — Restore mobile wallets (revenue leak, ~87% mobile traffic)**
7. USER TASK (Stripe Dashboard → Settings → Payment methods → Apple Pay → Web domains): register `getrodata.com` AND `www.getrodata.com`. Until this is done, Apple Pay / Google Pay cannot complete on the live domain.
8. After registering, run `browser-test` on `/pagar` (mobile viewport) and confirm the Express Checkout Element actually renders Apple/Google Pay and that no console error appears.

**P1 — Fix the instrumentation blind spot (required to diagnose anything further)**
9. `src/contexts/PostHogContext.tsx`: enable `autocapture: true` (and confirm session recording config) so clicks and rage clicks are captured.
10. Add explicit micro-events on the checkout path, all with `$device_type`, `$browser`, `utm_source`, `utm_content`:
    - `checkout_wallet_shown` (Express Checkout Element rendered, with `methods: ['apple_pay','google_pay','link']`)
    - `checkout_payment_method_selected` (`method`)
    - `checkout_address_completed`
    - `checkout_pay_clicked`
    - `checkout_payment_failed` (`error_code`, `decline_code`) ← **critical: we currently cannot see declines at all**
    - `checkout_left_to_pdp` (fires when user navigates from `/pagar` back to the product page — quantifies the loop found in Finding #3)
    Files: `src/components/StripePayment.tsx`, `src/components/PaypalExpressButton.tsx`, `src/pages/ui/CheckoutUI.tsx`, `src/lib/tracking-utils.ts`.
11. `src/components/PaypalExpressButton.tsx` / settings loader: render a skeleton while the PayPal RPC resolves instead of the `enabled:false` state, to prevent the button flicker (Finding #6).

**P1 — Ask the buyers directly (n is too small to A/B test)**
12. Launch a PostHog popover survey via `posthog-survey`:
    - name: `Checkout abandonment - why not buying`
    - target_url: `/pagar`, device: both
    - Q1 (single_choice): "What's stopping you from completing your order?" → ["Shipping takes too long", "Not sure about my size", "Payment method I want isn't available", "Price is too high", "I want to think about it", "Something didn't work"]
    - Q2 (open): "Anything we could fix to make this easier?"
    - Leave running 7–10 days (only ~25–30 checkouts/week, so patience is required).

**DO NOT** run an A/B test on checkout right now: ~25 checkout sessions/week and ~8 purchases/week is far below the ~500 weekly conversions needed. Make sequential changes and compare 7-day before/after windows.

**VERIFY FIRST (user action):** cross-check the Dashboard orders list for Aug 10–12. If real paid orders exist but PostHog shows 0 `purchase` events, the problem is tracking, not conversion — and priority shifts entirely to the tracking fix.

## 4. Recent Changes
- 2026-08-12: **CRO DIAGNOSIS (no code changes)** — checkout→purchase drop analyzed. Ruled out code regression (last commit 2026-07-03). Root cause is mostly upstream volume: ATC rate 6.6%→4.1%, checkout sessions 6→1/day, and a proven Meta ad (`120250321849460736`) stopped delivering on Aug 9 while ~12 new 0-conversion creatives launched. On-site friction found: delivery date only revealed at payment (6–8 business days → "Arrives Aug 20–24") vs PDP promising "Ships in 24–48 hrs"; users bounce from `/pagar` back to PDP in 5–16s. No JS/payment errors in any dropped session. PostHog autocapture is OFF (click_count 0 everywhere).
- 2026-07-03: **OrderTrackUI.tsx fixed** — (1) invisible white-on-white steps: replaced dark-theme-only tokens with adaptive tokens; (2) added STEP_TRANSLATIONS map + translateStep() ("Confirmado→Confirmed", "En preparación→Preparing", etc.).
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — dashboard filter pinned to old domain rodata-us.store. Fix in PostHog UI.
- 2026-06-26: Tracking fixes APPLIED — PayPal trackPurchase on capture; double PageView de-dup; usd/USD fallback; ThankYou guard unified to sessionStorage.
- 2026-06-24: Order Tracking page BUILT & SHIPPED — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links.
- 2026-06-18: Meta duplicate conversions fix — deterministic event_id + sessionStorage guard.
- 2026-06-18: Footer contact → support@getrodata.com
- 2026-06-15: Attribution fix — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: PaypalExpressButton.tsx — fallbackOrder; localStorage always written
- 2026-06-09: Delivery window — 6–8 business days in CheckoutUI + ProductPageUI

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/)

## 6. Known Issues
- **(2026-08-12) PostHog autocapture appears DISABLED** — every session returns `click_count: 0`. We are blind to clicks, rage clicks and payment declines. Fix in `src/contexts/PostHogContext.tsx`.
- **(2026-08-12) Delivery promise inconsistency** — PDP says "Ships in 24–48 hrs" with no arrival date; checkout reveals 6–8 business days ("Arrives Aug 20–24"). Duplicated date logic lives only in `CheckoutUI.tsx` lines 23–40 — must be extracted to `src/lib/delivery.ts`.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — must be cross-checked against real Dashboard orders before assuming it's a conversion problem.
- **Google/Apple Pay**: `getrodata.com` still NOT registered in Stripe Dashboard → wallets cannot complete on live domain. High impact (87% mobile).
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI. Extend STEP_TRANSLATIONS if backend adds new labels.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid

## 7. Pending / Future Sessions
- **P0** Extract `src/lib/delivery.ts`; show arrival estimate on PDP; align with checkout.
- **P0** Register `getrodata.com` + `www.getrodata.com` in Stripe for Apple/Google Pay (user task), then `browser-test` verify.
- **P0** Dashboard: re-activate winning ads `120251729944850736` / `120251747888880736` / `120250321849460736`; pause the ~12 Aug 3–11 creatives with 0 purchases.
- **P1** Enable PostHog autocapture + add checkout micro-events (esp. `checkout_payment_failed`).
- **P1** Launch checkout-abandonment PostHog survey; read after 7–10 days.
- **P1** Abandoned-cart email automation (Dashboard AI) — only ~38% of checkouts convert; recovery email is the cheapest win.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (currently ~8/week vs ~500 needed).