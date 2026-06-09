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
### ✅ COMPLETED: Checkout + PDP Conversion Fixes

All fixes implemented. No pending items.

## 4. Recent Changes
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
- 2026-06-04: **ThankYou.tsx** — Added deferred Purchase tracking for Stripe 3DS redirect flow (`redirect_status=succeeded` in URL). Uses fire-once guard (`purchase_tracked_<orderId>` in localStorage).

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
- `src/components/StripePayment.tsx` — ✅ Full EN translation + MX→US default + locale:'en' + express checkout price bug fixed + trust signals below CTA + pre-pay ★ rating above button (no duplicate guarantee)
- `src/pages/ThankYou.tsx` — ✅ Deferred Purchase event for 3DS redirect flow
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + image optimization + UX improvements + Launch Offer badge + Shipping & Returns accordion (6–8 biz days)
- `index.html` — ✅ English meta + non-blocking fonts (Sora+Inter only)
- `src/templates/EcommerceTemplate.tsx` — ✅ English + new trust bar
- `src/pages/ui/CheckoutUI.tsx` — ✅ Fully translated + top security bar + delivery date line (6–8 biz days) + mobile summary open by default