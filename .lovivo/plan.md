# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings in English. Dates US format (date-fns default `en`, "Jun 12, 2026"). DO NOT use `es` date-fns locale.
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved from `www.rodata-us.store` → `www.getrodata.com`. getrodata.com is now the real production domain (footer email already support@getrodata.com). PostHog confirms ~all live traffic now on getrodata.com.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar
- **UI kit**: shadcn (Card, Badge, Button, Skeleton, Collapsible, Input, Label). Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ DIAGNOSED: PostHog dashboard "collapse" is a FILTER issue, NOT a tracking bug (2026-06-26)

User reported all PostHog dashboard charts collapsed to ~0 starting Jun 15-16, e.g. "only 2 pageviews yesterday" while Meta Ads shows more visitors.

**ROOT CAUSE FOUND (not a code bug):**
- Raw PostHog data is HEALTHY. Query (store_id only) shows: Jun 24 = 111 pageviews/79 users, Jun 25 = 60/50, Jun 26 = 40/29. No collapse.
- The store's LIVE DOMAIN changed ~Jun 15-16: traffic moved `www.rodata-us.store` → `www.getrodata.com` (confirmed via `domain($current_url)` breakdown).
- The user's PostHog DASHBOARD has an extra saved filter chip "Initial current ...bar-rodata-one" = an "Initial Current URL" filter pinned to the OLD domain (rodata-us.store / product slug lumbar-rodata-one). New visitors land on getrodata.com → don't match → charts read ~0 after Jun 15.

**FIX (done by user in PostHog UI — NOT a Lovivo code change):**
- Edit the dashboard's saved filter: remove the "Initial Current URL = ...rodata-us.store..." filter, OR broaden it (filter by store_id only, or by `$pathname`/host include both getrodata.com + rodata-us.store).
- Apply across all dashboard insights (the chip is dashboard-level).
- No storefront code change required. Tracking fixes from earlier (PayPal purchase, double-pageview de-dup, USD currency, unified guard) remain valid and working.

## 4. Recent Changes
- 2026-06-26: **DIAGNOSED PostHog dashboard "collapse"** — NOT a tracking bug. Raw data healthy (Jun 25 = 60 pageviews/50 users, not 2). Cause: live domain moved rodata-us.store→getrodata.com ~Jun 15-16; dashboard's "Initial Current URL" filter chip still pinned to old domain so new traffic excluded. Fix = update/remove dashboard filter in PostHog UI. No code change.
- 2026-06-26: **Tracking fixes APPLIED (Craft Mode)** — (1) PayPal now fires trackPurchase on capture, (2) double PageView removed via provider-owns-initial + PageViewTracker-skips-first-mount + PixelContext pageView-once ref, (3) usd/USD currency fallback, (4) ThankYou guard unified to sessionStorage. Files: PaypalExpressButton.tsx, tracking-utils.ts, App.tsx, PixelContext.tsx, ThankYou.tsx.
- 2026-06-26: **Tracking audit (Meta + PostHog)** — Queried 30d purchase events. Confirmed deterministic event_id works (06-25).
- 2026-06-24: **Order Tracking page BUILT & SHIPPED** — OrderTrack.tsx + OrderTrackUI.tsx, routes, nav + footer links, MyOrders EN + Track CTA, ThankYou "Track my order".
- 2026-06-18: **Meta duplicate conversions fix** — deterministic event_id + sessionStorage guard on 3 trackPurchase sites
- 2026-06-18: **Footer contact** — WhatsApp → `support@getrodata.com`
- 2026-06-15: **Attribution fix** — fbclid/fbc/fbp/UTMs flow to checkout-create + PayPal
- 2026-06-10: **PaypalExpressButton.tsx** — fallbackOrder; localStorage always written
- 2026-06-10: **CheckoutUI.tsx** — single PayPal instance; mobile PayPal above Stripe
- 2026-06-09: **Delivery window** — 6–8 business days in CheckoutUI + ProductPageUI

## 5. Image Inventory
- Hero feature image (landing): `...message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `...product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/)

## 6. Known Issues
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): "Initial Current URL ...rodata-us.store/...lumbar-rodata-one" filter excludes new getrodata.com traffic. Charts read ~0 since Jun 15. Fix in PostHog UI (not code).
- **META DIAGNÓSTICO**: CAPI now confirmed WORKING by user (events arriving in Meta). Earlier expired-token worry resolved.
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard (now getrodata.com domain to register)

## 7. Pending / Future Sessions
- User: update PostHog dashboard filters to include getrodata.com (or remove URL filter) so charts reflect real traffic.
- Register `getrodata.com` domain in Stripe Dashboard for Google Pay/Apple Pay.
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- (Order tracking) Verify `order-track` edge returns expected shape once a real order ships