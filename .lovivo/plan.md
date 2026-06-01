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

### 🔧 THANK YOU PAGE — FULL ENGLISH TRANSLATION
**File**: `src/pages/ThankYou.tsx`

All Spanish text to translate:

**"Order not found" state:**
- `"Pedido no encontrado"` → `"Order Not Found"`
- `"Parece que aún no has completado una compra, o este enlace de pedido ha expirado."` → `"It looks like you haven't completed a purchase yet, or this order link has expired."`
- `"Comenzar a Comprar"` → `"Start Shopping"`

**Page title + confirmation header:**
- `pageTitle="Confirmación de Pedido"` → `pageTitle="Order Confirmation"`
- `"¡Pago Confirmado!"` → `"Payment Confirmed!"`
- `"Gracias por tu compra. Tu pedido ha sido procesado exitosamente."` → `"Thank you for your purchase. Your order has been successfully processed."`
- `"Pedido #"` (Badge) → `"Order #"`

**Order details card:**
- `"Detalles del Pedido"` → `"Order Details"`
- `'Producto'` (fallback alt/name) → `'Product'`
- `"Cantidad:"` → `"Qty:"`

**Delivery info card:**
- `"Información de Entrega"` → `"Delivery Information"`
- `"Dirección de Envío:"` → `"Shipping Address:"`
- `"Método de Entrega:"` → `"Delivery Method:"`
- `"Recoger en Tienda"` → `"Store Pickup"`

**Next steps:**
- `"Próximos Pasos:"` → `"Next Steps:"`
- `"Recibirás un correo de confirmación"` → `"You'll receive a confirmation email"`
- `"Te notificaremos cuando tu pedido esté listo"` → `"We'll notify you when your order ships"`
- `"Puedes rastrear tu pedido con el número #"` → `"You can track your order with number #"`

**Action buttons:**
- `"Seguir Comprando"` → `"Continue Shopping"`

Also note: the country name shows as "Estados Unidos" — this comes from the shipping_address data returned by the backend, not from the UI. Nothing to fix in the UI for that.

**Implementation**: Edit `src/pages/ThankYou.tsx` replacing all Spanish strings with English equivalents as listed above.

---

### ✅ BADGE + SOCIAL PROOF POLISH (2026-05-28)
- `-35%` badge repositioned: half inside / half outside the image top edge (desktop + mobile)

### ✅ STICKY BAR FIX v2 COMPLETE (2026-05-28)

### ✅ PDP UX IMPROVEMENTS COMPLETE (2026-05-28)

### ✅ ALL TRANSLATION COMPLETE + ROUTING FIXED

## 4. Recent Changes
- 2026-06-01: **ThankYou.tsx** — Full English translation planned
- 2026-05-28: **ProductPageUI.tsx** — badge -35% half in/half out (desktop restructure + mobile -translate-y-1/2)
- 2026-05-28: **public/avatar-j.webp, avatar-m.webp, avatar-r.webp** — Generated real rider avatar photos
- 2026-05-28: **ProductPageUI.tsx** — Social proof banner: J/M/R letters → real person photos
- 2026-05-28: **ProductPageUI.tsx** — Sticky bar v2: added `hasCTABeenVisible` ref; bar only shows after CTA has entered viewport at least once
- 2026-05-28: **ProductPageUI.tsx** — Sticky bar v1: replaced useInView with native IntersectionObserver + useState(false)
- 2026-05-28: **ProductPageUI.tsx** — removed Back button, scroll-snap peek carousel, social proof banner
- 2026-05-28: **EcommerceTemplate.tsx** — trust bar: Free US Shipping + +1,000 Happy Riders (mobile), 30-Day Trial (desktop)
- 2026-05-28: **index.css** — added `.no-scrollbar` utility class
- 2026-05-28: **ProductPageUI.tsx** — Supabase image transforms + fetchPriority + carousel lazy loading
- 2026-05-28: **IndexUI.tsx** — Supabase image transforms on all 9 image constants
- 2026-05-28: **index.html** — Removed 14 unused Google Fonts, async Sora+Inter, English meta tags
- 2026-05-26: **BrandLogoLeft.tsx + logo.svg + favicon.svg** — Updated branding
- 2026-05-26: **CartAdapter.tsx + CartSidebar.tsx** — Fixed navigate('/checkout')
- 2026-05-18: **ProductPageUI.tsx** — Full English + US reviews

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Features: `render/image/public/message-images/0f3c776b.../1775777133671-80hvv9dmxa.webp?width=800&quality=75`
- LIFESTYLE_HIGHWAY: `render/image/public/message-images/0f3c776b.../1775768374485-uca4dkx21g.webp?width=1200&quality=75`
- LIFESTYLE_CITY: /pdp-lifestyle-1.jpg (local)
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- Country name "Estados Unidos" on thank you page comes from backend data, not UI — no fix needed in frontend
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading. Verify actual currency in Dashboard.
- Product slug is still in Spanish — may want to add English slug redirect
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid — consider replacing with English versions
- Google Pay error on checkout: domain needs to be registered in Stripe Dashboard > Settings > Payment methods > Google Pay

## 7. Key Files
- `src/pages/ThankYou.tsx` — 🔧 NEEDS English translation (all Spanish strings)
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US names + ✅ image optimization + ✅ UX improvements + ✅ sticky bar v2 + ✅ badge polish + ✅ real avatars
- `index.html` — ✅ English meta + ✅ non-blocking fonts (Sora+Inter only)
- `src/pages/ui/IndexUI.tsx` — ✅ English + ✅ image optimization
- `src/templates/EcommerceTemplate.tsx` — ✅ English + ✅ new trust bar
- `src/App.tsx` — ✅ English routes
- `src/pages/ui/CheckoutUI.tsx` — ✅ English
- `src/index.css` — ✅ .no-scrollbar utility added