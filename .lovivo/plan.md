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

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — Google Fonts (async)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar
- **UI kit**: shadcn (Card, Badge, Button, Skeleton, Collapsible, Input, Label). Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — ✅ Order Tracking Page DONE
All 6 files built & shipped. Edge fn `order-track` accepts `{token}` or `{store_id, order_number, email}`. Public page at `/orders/track` (lookup) + `/orders/track/:token` (auto-load, noindex). Live in nav + footer.

## 4. Recent Changes
- 2026-06-24: **Order Tracking page BUILT & SHIPPED** — created `OrderTrack.tsx` (noindex wrapper) + `OrderTrackUI.tsx` (Shop-style timeline, lookup form, carrier card, events collapsible, copy tracking). Added routes in App.tsx. Added "Track Order" to nav + footer in EcommerceTemplate. MyOrdersUI fully translated EN + Track CTA. ThankYou got "Track my order" button. Adapter needs no change (`select('*')` covers tracking fields).
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
- **META DIAGNÓSTICO 🔴2**: Likely expired CAPI Access Token — fix in Meta Business Manager (manual)
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard

## 7. Pending / Future Sessions
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay
- (Order tracking) Verify `order-track` edge returns expected shape once a real order ships; confirm `checkout_token`/`tracking_number`/`estimated_delivery_at` exist in `orders_customer` view