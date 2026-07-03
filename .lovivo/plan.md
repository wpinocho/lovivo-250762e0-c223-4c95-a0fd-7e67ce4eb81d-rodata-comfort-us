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
- **LIVE DOMAIN CHANGED ~2026-06-15**: production traffic moved `www.rodata-us.store` → `www.getrodata.com`. getrodata.com is now the real production domain.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite (#F5F7F8 near-white), brand-smoke, brand-steel (#5E6670)
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **THEME IS LIGHT by default** (`:root` = light bg #f7f8fa, white cards, dark text). `.dark` class exists but many pages render LIGHT. ⚠️ `text-brand-offwhite` / `border-white/20` / `bg-white/15` are near-WHITE and INVISIBLE on light cards — use adaptive tokens (`text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`) instead on any page that renders light.
- **UI kit**: shadcn. Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ Order Tracking page fixed (2026-07-03)

## 4. Recent Changes
- 2026-07-03: **OrderTrackUI.tsx fixed** — (1) invisible white-on-white steps: replaced dark-theme-only tokens (text-brand-offwhite, border-white/20, bg-white/15, bg-white/30) with adaptive tokens (text-foreground, text-muted-foreground, border-border, bg-muted-foreground/40) so labels/titles are visible on the light card. (2) Spanish backend steps: added STEP_TRANSLATIONS map + translateStep() in resolveSteps — "Confirmado→Confirmed, En preparación→Preparing, Enviado→Shipped, Entregado→Delivered", etc.
- 2026-06-26: DIAGNOSED PostHog dashboard "collapse" — NOT a tracking bug. Cause: dashboard "Initial Current URL" filter pinned to old domain rodata-us.store; traffic moved to getrodata.com. Fix in PostHog UI.
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
- **Backend tracking steps come in Spanish** — now translated client-side in OrderTrackUI. If backend adds new Spanish status labels, extend STEP_TRANSLATIONS map. Tracking event `status_detail` / carrier strings may still be Spanish (from carrier data).
- **PostHog dashboard filter pinned to OLD domain** (2026-06-26): fix in PostHog UI (not code).
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: register getrodata.com domain in Stripe Dashboard

## 7. Pending / Future Sessions
- User: update PostHog dashboard filters to include getrodata.com.
- Register getrodata.com domain in Stripe for Google/Apple Pay.
- Replace feature images (FEAT_IMG_1-3) with English text versions.
- Add English slug redirect for product page.