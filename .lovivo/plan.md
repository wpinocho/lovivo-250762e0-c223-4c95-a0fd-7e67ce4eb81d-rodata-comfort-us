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

### ✅ BADGE + CAROUSEL IMAGES (2026-05-28)
- Badge -35% repositioned: `top-0 -translate-y-1/2` → straddles top edge of carousel (half inside/half outside)
- Two new product photos added as slides 2 & 3 in the carousel (`PDP_EXTRA_1`, `PDP_EXTRA_2`)
- `carouselImages` array injects new images at position 2+ after first product image
- Desktop thumbnails also show the new images

### ✅ STICKY BAR FIX v2 COMPLETE (2026-05-28)
- Added `hasCTABeenVisible` ref (starts `false`)
- IntersectionObserver only sets `showStickyBar = true` AFTER CTA has been seen in viewport at least once

### ✅ PDP UX IMPROVEMENTS COMPLETE (2026-05-28)
1. ✅ **Back button removed**
2. ✅ **Mobile carousel → scroll-snap peek**
3. ✅ **Trust bar** — "Free US Shipping" + "+1,000 Happy Riders" mobile; "30-Day Trial" desktop
4. ✅ **Social proof banner**

### ✅ PERFORMANCE OPTIMIZATION COMPLETE (2026-05-28)
- Supabase image transforms, fetchPriority, mobile carousel lazy loading, non-blocking fonts

### ✅ ALL TRANSLATION COMPLETE + ROUTING FIXED

## 4. Recent Changes
- 2026-05-28: **ProductPageUI.tsx** — Badge -35% repositioned to `top-0 -translate-y-1/2` (half inside/half outside image top edge)
- 2026-05-28: **ProductPageUI.tsx** — Added PDP_EXTRA_1 + PDP_EXTRA_2 as carousel slides 2 & 3
- 2026-05-28: **ProductPageUI.tsx** — Sticky bar v2: added `hasCTABeenVisible` ref; bar only shows after CTA has entered viewport at least once
- 2026-05-28: **ProductPageUI.tsx** — Sticky bar v1: replaced useInView with native IntersectionObserver + useState(false)
- 2026-05-28: **DIAGNOSED** sticky bar shows on load — `initialInView:true` in react-intersection-observer is unreliable
- 2026-05-28: **ProductPageUI.tsx** — removed Back button, scroll-snap peek carousel, social proof banner
- 2026-05-28: **EcommerceTemplate.tsx** — trust bar: Free US Shipping + +1,000 Happy Riders (mobile), 30-Day Trial (desktop)
- 2026-05-28: **index.css** — added `.no-scrollbar` utility class
- 2026-05-28: **ProductPageUI.tsx** — Supabase image transforms + fetchPriority + carousel lazy loading
- 2026-05-28: **IndexUI.tsx** — Supabase image transforms on all 9 image constants
- 2026-05-28: **index.html** — Removed 14 unused Google Fonts, async Sora+Inter, English meta tags
- 2026-05-26: **BrandLogoLeft.tsx + logo.svg + favicon.svg** — Updated branding
- 2026-05-26: **CartAdapter.tsx + CartSidebar.tsx** — Fixed navigate('/checkout')
- 2026-05-18: **ProductPageUI.tsx** — Full English + US reviews
- 2026-05-18: **CheckoutUI.tsx** — Full English

## 5. Image Inventory
- PDP_EXTRA_1: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779996935992-sw1rkxgmulj.webp?width=1200&quality=80`
- PDP_EXTRA_2: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779996935993-8juigpxnux.webp?width=1200&quality=80`
- Hero feature image (landing): `...1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `...1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `...1775768374485-uca4dkx21g.webp?width=1200&quality=75`

## 6. Known Issues
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid — consider replacing with English versions

## 7. Key Files
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US names + ✅ image optimization + ✅ UX improvements + ✅ sticky bar v2 + ✅ badge repositioned + ✅ extra carousel images
- `index.html` — ✅ English meta + ✅ non-blocking fonts (Sora+Inter only)
- `src/pages/ui/IndexUI.tsx` — ✅ English + ✅ image optimization
- `src/templates/EcommerceTemplate.tsx` — ✅ English + ✅ new trust bar
- `src/App.tsx` — ✅ English routes
- `src/pages/ui/CheckoutUI.tsx` — ✅ English
- `src/index.css` — ✅ .no-scrollbar utility added