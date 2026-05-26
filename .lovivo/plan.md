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

### ✅ ALL TRANSLATION COMPLETE + ROUTING FIXED
- IndexUI.tsx — Full English, $69/$99 USD, US cities, US shipping
- EcommerceTemplate.tsx — Full English (nav, trust bar, footer)
- App.tsx — English URL routes + `/pagar` alias → `/checkout`
- ProductPageUI.tsx — Full English (49 string replacements): sizes in inches, US cities in reviews, features/FAQ/CTA/steps/trust cards all in English
- CheckoutUI.tsx — Full English (44 string replacements): all labels, shipping, coupon, billing form, validation messages
- PrivacyPolicy.tsx — Full English rewrite (10 sections)
- TermsAndConditions.tsx — Full English rewrite (11 sections)
- CartAdapter.tsx — Fixed `/pagar` → `/checkout`
- CartSidebar.tsx — Fixed `/pagar` → `/checkout`

### 🟡 NEXT STEPS (post-launch)
- Configure US shipping zones in Dashboard (Settings > Shipping)
- Consider US phone/email support (WhatsApp is less common in US)
- Verify product slug (currently `/productos/soporte-lumbar-rodata-one`) — consider adding `/products/rodata-one` redirect
- Verify currency display is USD (not MXN) in Dashboard
- CartSidebar still has some Spanish text ("Carrito de Compras", "Pagar", etc.) — could translate if needed

## 4. Recent Changes
- 2026-05-26: **CartAdapter.tsx + CartSidebar.tsx** — Fixed `navigate('/pagar')` → `navigate('/checkout')`
- 2026-05-26: **App.tsx** — Added `/pagar` as alias route → `<Checkout />` (safety net for external links)
- 2026-05-18: **ProductPageUI.tsx** — 49 string replacements: sizes in inches, US city reviews, all UI copy in English
- 2026-05-18: **CheckoutUI.tsx** — 44 string replacements: all Spanish labels translated
- 2026-05-18: **PrivacyPolicy.tsx** — Full English rewrite (10 sections)
- 2026-05-18: **TermsAndConditions.tsx** — Full English rewrite (11 sections)
- 2026-05-18: Read ProductPageUI, CheckoutUI, PrivacyPolicy, TermsAndConditions — full edit plan documented
- 2026-05-18: **IndexUI.tsx** — Full English translation, $69/$99 USD, US cities in reviews
- 2026-05-18: **EcommerceTemplate.tsx** — Full English translation (nav, trust bar, footer)
- 2026-05-18: **App.tsx** — English URL routes added
- 2026-05-18: Store cloned from rodata.mx Mexico store for US market expansion

## 5. Image Inventory
All product/lifestyle images reused from MX store:
- Hero: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775772513540-16g7elmcuii.webp`
- Reviews: `product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-[1-5].webp`
- Features: message-images/...1775777133671 through 1775777133672

## 6. Known Issues
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- CartSidebar has some residual Spanish ("Carrito de Compras", "Pagar" button, empty state text)

## 7. Key Files — ALL DONE ✅
- `src/pages/ui/IndexUI.tsx` — ✅ English
- `src/templates/EcommerceTemplate.tsx` — ✅ English
- `src/App.tsx` — ✅ English routes + /pagar alias
- `src/pages/ui/ProductPageUI.tsx` — ✅ English
- `src/pages/ui/CheckoutUI.tsx` — ✅ English
- `src/pages/PrivacyPolicy.tsx` — ✅ English
- `src/pages/TermsAndConditions.tsx` — ✅ English
- `src/adapters/CartAdapter.tsx` — ✅ /checkout route fixed
- `src/components/CartSidebar.tsx` — ✅ /checkout route fixed