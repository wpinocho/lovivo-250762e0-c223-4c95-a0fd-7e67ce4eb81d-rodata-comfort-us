# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar

## 3. Active Plan

### COMPLETED THIS SESSION ✅
- IndexUI.tsx — fully translated to English, prices changed to $69/$99 USD, reviews updated to US cities (LA, Houston, Chicago), shipping messaging updated to US
- EcommerceTemplate.tsx — header/footer fully translated, nav links updated (How it works / Reviews / FAQ), footer links point to `/privacy-policy` and `/terms-and-conditions`, copyright updated to "© 2025 Rodata — All rights reserved.", "Built for riders."
- App.tsx — added English routes: `/products/:slug`, `/cart`, `/checkout`, `/thank-you`, `/my-orders`, `/my-subscriptions`, `/terms-and-conditions`, `/privacy-policy`, `/pending-payment/:orderId` (kept Spanish routes as aliases for backward compat)

### STILL PENDING (do in next session):

#### 🔴 HIGH PRIORITY — next session:
1. **ProductPageUI.tsx** — entire page in Spanish (size guide headers "Talla/Cintura/Tipo", features, reviews with MX cities, FAQ, trust signals, sticky bar). All needs English translation + US cities.
2. **CheckoutUI.tsx** — "Cargando orden...", "Error al cargar la orden" and any other Spanish strings
3. **PrivacyPolicy.tsx** — entire page in Spanish, needs English translation
4. **TermsAndConditions.tsx** — entire page in Spanish, needs English translation

#### 🟡 IMPORTANT:
5. **Dashboard**: Translate product title/description to English: "Soporte Lumbar Rodata One" → "Rodata One Lumbar Support"
6. **Dashboard**: Set up US shipping zones (continental US, Alaska, Hawaii)
7. **Dashboard**: Update product slug to English (affects PDP URL)
8. **CartUI.tsx / CartSidebar.tsx** — may have Spanish strings ("Tu carrito", "Subtotal", etc.)

#### 🟢 NICE TO HAVE:
- Update WhatsApp number to US support number
- SEO metadata in English (page title, meta description)
- Blog pages if any

## 4. Recent Changes
- 2026-05-18: **IndexUI.tsx** — Full English translation, $69/$99 USD prices, US cities in reviews, US shipping messaging, routes to `/products/`
- 2026-05-18: **EcommerceTemplate.tsx** — Full English translation (nav, trust bar, footer, buy buttons), English routes for footer links
- 2026-05-18: **App.tsx** — Added English URL routes alongside Spanish fallbacks
- 2026-05-18: Store cloned from rodata.mx Mexico store for US market expansion
- Previous MX store changes: Express Checkout, Stripe dark theme, phone validation fix, trackPurchase, intentOrder fix, price MX$749→MX$699

## 5. Image Inventory
All product/lifestyle images are the same as MX store — OK to reuse:
- Hero: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775772513540-16g7elmcuii.webp`
- Reviews: `product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-[1-5].webp`
- Features: message-images/...1775777133671 through 1775777133672

## 6. Known Issues
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading but actual currency code appears to be USD. Verify in Dashboard.
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- ProductPageUI.tsx still fully in Spanish — highest priority for next session

## 7. Key Files
- `src/pages/ui/IndexUI.tsx` — ✅ DONE — English
- `src/templates/EcommerceTemplate.tsx` — ✅ DONE — English
- `src/App.tsx` — ✅ DONE — English routes added
- `src/pages/ui/ProductPageUI.tsx` — ⚠️ TODO — ALL SPANISH
- `src/pages/ui/CheckoutUI.tsx` — ⚠️ TODO — some Spanish strings
- `src/pages/PrivacyPolicy.tsx` — ⚠️ TODO — ALL SPANISH
- `src/pages/TermsAndConditions.tsx` — ⚠️ TODO — ALL SPANISH
- `src/adapters/CheckoutAdapter.tsx` — checkout logic