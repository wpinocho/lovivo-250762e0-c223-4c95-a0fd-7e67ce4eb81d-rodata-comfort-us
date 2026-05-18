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

## 3. Active Plan — US Localization

### STATUS: PENDING — needs Craft Mode

### What needs to change for US launch:

#### 🔴 CRITICAL (must do before first sale):

**A. Translate entire storefront to English** (Craft Mode)
Files to edit:
- `src/pages/ui/IndexUI.tsx` — ALL copy: hero, benefits bar, problem section, how it works, comparison table, testimonials, guarantee, FAQ, final CTA
- `src/pages/ui/ProductPageUI.tsx` — ALL copy: product description, size guide (headers "Talla/Cintura/Tipo"), features, reviews (change cities from MX to US), FAQ, trust signals, stats bar, sticky bar
- `src/templates/EcommerceTemplate.tsx` — trust bar, nav links, footer (copyright, "Hecho para riders mexicanos", WhatsApp message text, nav labels), footer nav labels
- `src/pages/ui/CheckoutUI.tsx` — "Cargando orden...", "Error al cargar la orden" and any other Spanish strings

**B. Fix hardcoded MX$ prices in UI** (Craft Mode)
- `src/pages/ui/IndexUI.tsx`: "MX$699", "MX$999", "25% OFF" badges, "Comprar Rodata One — MX$699" buttons — need to show USD price dynamically from the product, OR be hardcoded in USD
- Dynamic price blocks (using `logic.formatMoney`) should auto-convert if currency is set to USD in dashboard

**C. Update shipping/trust messaging to US context**
- "Envío gratis en México" → "Free shipping to the US"
- "A todo México" → "Across the US"  
- "Envío en 24–48 hrs" → "Ships in 1-3 business days"
- "100% Envíos en México" (stats bar) → "100% US Shipping"
- All WhatsApp links: change +525531215386 to US support number AND translate message text to English

**D. Update reviews to US context**
- Change cities: CDMX → Los Angeles, Guadalajara → Houston, Monterrey → Chicago, Puebla → Miami, CDMX → New York
- Review dates can stay (Mar 2025 etc.)
- Review text needs English translation

**E. Translate product itself in Dashboard**
- Product title: "Soporte Lumbar Rodata One" → "Rodata One Lumbar Support"
- Product description
- Variant option names (if in Spanish)
- Set price in USD (should already be USD if currency is configured)

**F. Set up US shipping zones in Dashboard**
- Add US shipping zone
- Configure shipping rates for continental US, Alaska, Hawaii

#### 🟡 IMPORTANT (do before paid traffic):

**G. Update product page slug** (Dashboard)
- Current: `/productos/soporte-lumbar-rodata-one`
- US: `/products/rodata-one-lumbar-support`
- BUY_URL const in IndexUI.tsx and EcommerceTemplate.tsx also needs update

**H. Footer cleanup**
- "© 2025 rodata.mx" — update if brand has US name (e.g. rodata.com or keep rodata.mx)
- "Hecho para riders mexicanos" → "Made for riders." or "Built for the road."
- Footer nav links in Spanish: "Inicio" → "Home", "Cómo funciona" → "How it works", "Opiniones" → "Reviews"
- Privacy/Terms page URLs: `/aviso-de-privacidad` → `/privacy-policy`, `/terms` — these pages need English content too

**I. Comparison table — fix Mexico-specific row**
- "Envío en México" → "US Shipping"

**J. WhatsApp support — reconsider**
- For US market, consider email or live chat instead of WhatsApp (lower adoption in US)
- Alternative: keep WhatsApp but add email option

#### 🟢 NICE TO HAVE (can do later):
- Translate Blog pages if any
- US-specific Meta Ads (separate ad account or campaigns)
- US phone number for support
- Update SEO metadata (meta title, description) to English

## 4. Recent Changes
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
- All hardcoded prices in IndexUI.tsx are "MX$699" / "MX$999" — need to either replace with dynamic `logic.formatMoney()` calls or hardcode USD values

## 7. Key Files
- `src/pages/ui/IndexUI.tsx` — homepage (**ALL SPANISH — needs full English translation**)
- `src/pages/ui/ProductPageUI.tsx` — PDP (**ALL SPANISH — needs full English translation**)
- `src/templates/EcommerceTemplate.tsx` — header/footer (**ALL SPANISH — needs translation**)
- `src/pages/ui/CheckoutUI.tsx` — checkout (a few Spanish strings)
- `src/pages/ThankYou.tsx` — post-purchase page
- `src/components/StripePayment.tsx` — payment form
- `src/adapters/CheckoutAdapter.tsx` — checkout logic