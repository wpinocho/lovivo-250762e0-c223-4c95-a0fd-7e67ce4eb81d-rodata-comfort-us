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
- **OWNER PREFERENCES (2026-08-12)** — respect these, do not re-propose:
  - Arrival date belongs in the CHECKOUT ONLY, never on the PDP.
  - NO sizing / returns / shipping FAQ accordion inside checkout ("not good practice").
  - No on-site surveys for now.
  - Tracking / instrumentation work is always welcome.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8 near-white), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). `.dark` class exists but many pages render LIGHT. ⚠️ `text-brand-offwhite` / `border-white/20` / `bg-white/15` are near-WHITE and INVISIBLE on light cards — use adaptive tokens (`text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`) on any page that renders light.
- **NOTE**: PDP (`ProductPageUI.tsx`) and Checkout (`CheckoutUI.tsx`) are hardcoded DARK (`bg-[#111315]` / `bg-[#1D2125]`) — dark tokens are correct there.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 📊 Measure the 2026-08-12 changes (read ~2026-08-19)

### What shipped 2026-08-12 (Craft Mode)
1. **Delivery window 6–8 → 5–7 business days** — `getEstimatedDelivery()` in `src/pages/ui/CheckoutUI.tsx` (~line 36). Checkout-only; PDP still shows no arrival date (owner's call).
2. **PostHog autocapture ON** — `src/contexts/PostHogContext.tsx`: `autocapture: true`, `rageclick: true`. Fixes the `click_count: 0` blind spot.
3. **Checkout micro-events** — new `src/lib/checkout-tracking.ts` (`trackCheckoutEvent` + `stripeErrorProps`), wired into `src/components/StripePayment.tsx`:
   - `checkout_pay_clicked` (method, amount, currency, order_id)
   - `checkout_payment_failed` (stage: `elements_submit` | `confirm_payment` | `exception`, error_code, **decline_code**, error_type, error_message)
   - `checkout_payment_succeeded`
   - `checkout_wallet_shown` (available wallet methods, on ExpressCheckoutElement `onReady`)
   - All events carry `device_type`, `is_in_app_browser`, `utm_source/campaign/content`, `path`.

### Next session — analysis queries to run (~2026-08-19)
- `checkout_payment_failed` grouped by `error_code` / `decline_code` → are cards being declined, or is nobody clicking Pay?
- `checkout_pay_clicked` vs `purchase` → measures the true payment-step conversion for the first time.
- `checkout_wallet_shown` by `is_in_app_browser` → confirm wallets actually render inside the Facebook browser (Stripe domains ARE registered and active, verified by owner).
- `$rageclick` + autocapture `$autocapture` clicks on `/pagar`.
- Compare IC→PUR for Aug 12–19 vs the 38% 30-day baseline.

### Meta ads — why "still running" ≠ "still selling" (owner question, 2026-08-12)
Ads active is not the same as ads delivering. Things to check in the Dashboard/Meta:
- **Impressions & spend per ad by day** — a "running" ad can be delivering near-zero impressions if it lost the auction.
- **Frequency** — Aug 1–9 was a great month; the same warm audience has now seen the creative many times (creative fatigue). Frequency >2.5–3 on a 7-day window is the classic signal.
- **Budget fragmentation** — ~12 new creatives launched Aug 3–11 with 0 purchases on ~60 product views; they siphon budget from the 3 proven winners (`120251729944850736`, `120251747888880736`, `120250321849460736`).
- **Learning phase reset** — edits to budget/creative/audience restart learning and suppress delivery.
- **Attribution window** — purchases may be landing on a different ad than the one credited in PostHog `utm_content`.

## 4. Recent Changes
- 2026-08-12: **CRO FIXES SHIPPED** — (1) checkout delivery window 6–8 → **5–7 business days**; (2) PostHog `autocapture: true` + `rageclick: true`; (3) new `src/lib/checkout-tracking.ts` + micro-events in `StripePayment.tsx` (`checkout_pay_clicked`, `checkout_payment_failed` with decline_code, `checkout_payment_succeeded`, `checkout_wallet_shown`). Owner REJECTED: arrival date on PDP, FAQ accordion in checkout, abandonment survey. Owner CONFIRMED Apple/Google Pay are Active on all domains in Stripe (issue closed).
- 2026-08-12: **CRO DIAGNOSIS** — checkout→purchase drop analyzed. No code regression (last commit 2026-07-03). Main driver is upstream: ATC 6.6%→4.1%, checkout sessions 6→1/day. On-site friction: arrival date only revealed at payment; users bounce /pagar → PDP in 5–16s. No JS/payment errors in any dropped session.
- 2026-07-03: **OrderTrackUI.tsx fixed** — invisible white-on-white steps + STEP_TRANSLATIONS map (ES→EN).
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
- **(2026-08-12) Fulfillment must actually support 5–7 business days** — checkout now promises it. If ops can't hit it, revert to a longer range; late deliveries cost more than a longer promise.
- **(2026-08-12) No purchase event since 2026-08-09 19:53 UTC** — must be cross-checked against real Dashboard orders before assuming it's a conversion problem.
- **(2026-08-12) PayPal settings race** — console logs `[PayPal Settings] enabled: false | clientId: null` BEFORE `[PayPal RPC] ... status: active` resolves. Button may flicker on slow mobile. Fix: skeleton while RPC resolves (`src/components/PaypalExpressButton.tsx`).
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- **Backend tracking steps come in Spanish** — translated client-side in OrderTrackUI. Extend STEP_TRANSLATIONS if backend adds new labels.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- ~~Apple/Google Pay domains not registered~~ **RESOLVED 2026-08-12** — all domains Active in Stripe, verified by owner.

## 7. Pending / Future Sessions
- **P0** ~2026-08-19: read the new micro-events (see Section 3 query list) and log results in `.lovivo/cro-log.md`.
- **P0** Dashboard/Meta: audit impressions + frequency per ad; pause the ~12 Aug 3–11 zero-purchase creatives; refresh creative for the fatigued winners.
- **P1** Abandoned-cart email automation (Dashboard AI) — only ~38% of checkouts convert; cheapest recovery win.
- **P1** PayPal button skeleton to kill the `enabled:false` flicker.
- **P2** Replace feature images (FEAT_IMG_1-3) with English text versions.
- **P2** Add English slug redirect for product page.
- **Blocked** No A/B tests on checkout until weekly conversions grow (currently ~8/week vs ~500 needed).
- **Owner said no** (do not re-propose): arrival date on PDP, FAQ/sizing accordion in checkout, abandonment survey.