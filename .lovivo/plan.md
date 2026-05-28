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

### ✅ PERFORMANCE OPTIMIZATION COMPLETE (2026-05-28)
All 5 steps implemented:

1. ✅ **Supabase image URL transforms** — all images in ProductPageUI.tsx + IndexUI.tsx now use `/render/image/public/` with width + quality params:
   - LIFESTYLE_HIGHWAY → width=1200&quality=75
   - FEAT_IMG_1/2/3 → width=800&quality=75
   - REVIEW_IMG_1-5 → width=600&quality=75 (PDP), width=480&quality=75 (landing)
   - HERO_IMG (landing) → width=1400&quality=80
   - LIFESTYLE/PRODUCT Supabase images → width=800&quality=75
   - PROBLEMA_REAL_IMG → width=1000&quality=75

2. ✅ **fetchPriority="high"** on desktop + mobile LCP images (ProductPageUI.tsx lines ~179, 188, 194)

3. ✅ **Mobile carousel lazy loading** — first image eager/high priority, rest lazy

4. ✅ **Non-blocking Google Fonts** — removed 14 unused font families, only Sora + Inter remain, loaded with `rel="preload"` + async pattern. Saves ~1.2s FCP.

5. ✅ **index.html meta tags** — updated to English/US (title, description, canonical, keywords, lang="en-US", og tags)

**Expected new score**: 65-75 mobile (up from 47)

### ✅ ALL TRANSLATION COMPLETE + ROUTING FIXED
- IndexUI.tsx — Full English, $49/$75 USD, US cities, US shipping
- EcommerceTemplate.tsx — Full English (nav, trust bar, footer)
- App.tsx — English URL routes + `/pagar` alias → `/checkout`
- ProductPageUI.tsx — Full English + US names in reviews
- CheckoutUI.tsx — Full English
- PrivacyPolicy.tsx + TermsAndConditions.tsx — Full English

### ✅ BRANDING UPDATED (2026-05-26)
- BrandLogoLeft.tsx — "RODATA" (ROD in offwhite, ATA in amber)
- public/logo.svg + favicon.svg — Updated

## 4. Recent Changes
- 2026-05-28: **ProductPageUI.tsx** — Supabase image transforms + fetchPriority + carousel lazy loading
- 2026-05-28: **IndexUI.tsx** — Supabase image transforms on all 9 image constants
- 2026-05-28: **index.html** — Removed 14 unused Google Fonts, async Sora+Inter, English meta tags
- 2026-05-28: **ProductPageUI.tsx** — Review names changed to US-sounding (Carlos M. stays, Jason R., Tyler V., Marcus T., Ryan S.)
- 2026-05-26: **BrandLogoLeft.tsx + logo.svg + favicon.svg** — Updated branding from "rodata.mx" to "RODATA"
- 2026-05-26: **IndexUI.tsx** — Replaced `PROBLEMA_REAL_IMG` with English version (user uploaded)
- 2026-05-26: **CartAdapter.tsx + CartSidebar.tsx** — Fixed `navigate('/pagar')` → `navigate('/checkout')`
- 2026-05-26: **App.tsx** — Added `/pagar` as alias route
- 2026-05-18: **ProductPageUI.tsx** — 49 string replacements: sizes in inches, US city reviews, all UI copy in English
- 2026-05-18: **CheckoutUI.tsx** — 44 string replacements
- 2026-05-18: **PrivacyPolicy.tsx** — Full English rewrite
- 2026-05-18: **TermsAndConditions.tsx** — Full English rewrite
- 2026-05-18: **IndexUI.tsx** — Full English translation, $49/$75 USD
- 2026-05-18: **EcommerceTemplate.tsx** — Full English translation
- 2026-05-18: **App.tsx** — English URL routes added

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0-4d70-431e-b117-75f07c0e7880/1779817823430-uv5gvuf1tv.webp?width=1000&quality=75` (EN version)
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)

## 6. Known Issues
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- CartSidebar has some residual Spanish ("Carrito de Compras", "Pagar" button)

## 7. Key Files
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US names + ✅ image optimization
- `index.html` — ✅ English meta + ✅ non-blocking fonts (Sora+Inter only)
- `src/pages/ui/IndexUI.tsx` — ✅ English + ✅ image optimization
- `src/templates/EcommerceTemplate.tsx` — ✅ English
- `src/App.tsx` — ✅ English routes
- `src/pages/ui/CheckoutUI.tsx` — ✅ English
- `src/pages/PrivacyPolicy.tsx` — ✅ English
- `src/pages/TermsAndConditions.tsx` — ✅ English
- `src/adapters/CartAdapter.tsx` — ✅ /checkout route
- `src/components/CartSidebar.tsx` — ✅ /checkout route
- `src/components/BrandLogoLeft.tsx` — ✅ RODATA