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
- **Fonts**: Sora (headings), Inter (body) — loaded from Google Fonts
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar

## 3. Active Plan

### 🟡 PERFORMANCE OPTIMIZATION (next task)
**Goal**: Improve PageSpeed mobile score from 47 → 65-75+

**Current issues found (ProductPageUI.tsx + index.html):**
1. Images served at full resolution — Supabase supports `render/image` URL transformations
2. Hero/LCP image has `loading="eager"` but no `fetchpriority="high"` — browser doesn't prioritize it
3. Mobile carousel (line 188) has NO `loading` attribute — all images load at once
4. Google Fonts (Sora + Inter) loaded blocking in index.html — adds ~1.2s to FCP
5. Feature images (FEAT_IMG_1/2/3) + review images (REVIEW_IMG_1-5) are full-size .webp — no size constraints

**Implementation steps:**

#### Step 1 — Supabase image URL transformations (biggest win, ~800 KiB savings)
Replace all image URLs from:
`/storage/v1/object/public/` → `/storage/v1/render/image/public/`
And append: `?width=800&quality=75&format=webp`

Apply to ALL images in ProductPageUI.tsx:
- LIFESTYLE_HIGHWAY → width=1200&quality=75 (full-width bg image)
- FEAT_IMG_1, FEAT_IMG_2, FEAT_IMG_3 → width=800&quality=75
- REVIEW_IMG_1-5 → width=600&quality=75
- Thumbnail images (productImages map) → width=600&quality=75

Note: LIFESTYLE_CITY = '/pdp-lifestyle-1.jpg' and PRODUCT_WORN = '/product-worn.jpg' are local files — skip Supabase transform, but add `width` + `height` HTML attributes.

Apply same optimization to IndexUI.tsx for its Supabase images.

#### Step 2 — fetchpriority="high" on LCP image
Line 179 ProductPageUI.tsx:
```
<img src={displayImage} ... loading="eager" fetchPriority="high" />
```
Also line 194 (mobile single image version):
```
<img src={displayImage} ... fetchPriority="high" />
```

#### Step 3 — Fix mobile carousel lazy loading
Line 188: First image in carousel should be eager, rest lazy:
```
loading={i === 0 ? "eager" : "lazy"}
```

#### Step 4 — Non-blocking Google Fonts
In `index.html`, change the Google Fonts `<link>` from `rel="stylesheet"` to use `rel="preconnect"` + async font loading pattern:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"></noscript>
```

#### Step 5 — Add width/height to images to prevent CLS
For all `<img>` tags in ProductPageUI.tsx, ensure they have explicit dimensions where possible (most are inside fixed-aspect containers, so this may already be fine — verify).

**Expected impact:**
- Image optimization alone: -800 KiB → LCP should drop significantly
- fetchpriority: -2-3s on LCP
- Font non-blocking: -1.2s on FCP
- Estimated new score: 65-75 mobile

**Files to modify:**
- `src/pages/ui/ProductPageUI.tsx` — image URLs + loading attributes
- `index.html` — Google Fonts loading strategy
- `src/pages/ui/IndexUI.tsx` — same Supabase image URL optimization if applicable

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
- 2026-05-18: Store cloned from rodata.mx Mexico store

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/f67d4ec0-4d70-431e-b117-75f07c0e7880/1779817823430-uv5gvuf1tv.webp` (EN version)
- Hero: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775772513540-16g7elmcuii.webp`
- Reviews: `product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-[1-5].webp`
- Features: message-images/...1775777133671 through 1775777133672
- LIFESTYLE_HIGHWAY: message-images/...1775768374485-uca4dkx21g.webp
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)

## 6. Known Issues
- **PageSpeed mobile: 47** — Performance optimization plan ready (see Active Plan above)
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- CartSidebar has some residual Spanish ("Carrito de Compras", "Pagar" button)

## 7. Key Files
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US names, 🟡 needs image optimization
- `index.html` — 🟡 needs non-blocking font loading
- `src/pages/ui/IndexUI.tsx` — ✅ English, 🟡 needs image optimization
- `src/templates/EcommerceTemplate.tsx` — ✅ English
- `src/App.tsx` — ✅ English routes
- `src/pages/ui/CheckoutUI.tsx` — ✅ English
- `src/pages/PrivacyPolicy.tsx` — ✅ English
- `src/pages/TermsAndConditions.tsx` — ✅ English
- `src/adapters/CartAdapter.tsx` — ✅ /checkout route
- `src/components/CartSidebar.tsx` — ✅ /checkout route
- `src/components/BrandLogoLeft.tsx` — ✅ RODATA