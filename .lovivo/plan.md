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

### COMPLETED ✅
- IndexUI.tsx — Full English, $69/$99 USD, US cities in reviews, US shipping messaging
- EcommerceTemplate.tsx — Full English (nav, trust bar, footer, buy buttons)
- App.tsx — English URL routes added

### 🔴 HIGH PRIORITY — do next session (all files read, ready to edit):

#### ProductPageUI.tsx — ALL in Spanish. Detailed edit plan below.

**Data arrays to replace:**
- SIZE_GUIDE: cm→inches (S:24–30in/Slim waist, M:30–35in/Average, L:35–39in/Large, XL:39–45in/Extra large)
- FEATURES[0]: title→'Finish every ride without the pain that\'s been piling up', desc→EN
- FEATURES[1]: title→'Ride for hours without stopping to adjust anything', desc→EN
- FEATURES[2]: title→'Under your jacket, completely undetected', desc→EN
- REVIEWS: cities→LA/Houston/Chicago/Phoenix/Miami, text→EN, date Ene→Jan
- FAQS: all 6 items→EN, last FAQ about WhatsApp→"Reach out via the contact options on our site"

**UI strings to translate (line refs approximate):**
- navLinks: 'Por qué funciona'→'Why it works', 'Opiniones'→'Reviews', 'FAQ' stays
- not-found: 'Producto no encontrado'→'Product not found', 'El producto no existe...'→'The product doesn\'t exist or was removed.', 'Volver'→'Back'
- back button (ArrowLeft): `/>Volver`→`/>Back` (replace_all: true)
- amber label: 'Diseñado para la postura de manejo'→'Designed for the riding posture'
- '127 reseñas verificadas'→'127 verified reviews'
- product description: 'El soporte confiado por los motociclistas mexicanos...'→'The back support trusted by riders — designed to eliminate back pain on every ride.'
- bullet points array: translate all 3
- 'Guía de tallas'→'Size guide'
- table headers `<span>Talla</span><span>Cintura</span><span>Tipo</span>`→`<span>Size</span><span>Waist</span><span>Fit</span>`
- 'Cantidad:'→'Quantity:'
- 'En stock · Envío en 24–48 hrs'→'In stock · Ships in 24–48 hrs'
- main CTA: 'Comprar ahora ·'→'Buy now ·'
- 'Agregar al carrito'→'Add to cart' (replace_all: true on `>Agregar al carrito<`)
- '🔒 Pago seguro · Envío gratis · 30 días de prueba'→'🔒 Secure checkout · Free shipping · 30-day trial'
- 'Agotado temporalmente'→'Temporarily out of stock'
- trust row: 'Envío gratis'/'A todo México'→'Free shipping'/'US-wide'; '30 días'/'De prueba'→'30 days'/'Trial'; 'Cambio talla'/'Sin costo'→'Size exchange'/'No charge'
- WhatsApp text: '¿Tienes dudas? Escríbenos por WhatsApp'→'Questions? Chat with us on WhatsApp'
- stats bar: 'Riders satisfechos'→'Happy riders', 'Calificación promedio'→'Average rating', 'Envíos en México'→'US shipping'
- lifestyle amber: 'Para riders que no se rinden antes de tiempo'→'For riders who don\'t quit before their time'
- lifestyle heading: 'Deja de bajar a estirar. Empieza a llegar mejor.'→'Stop pulling over to stretch. Start arriving better.'
- lifestyle paragraph: 'El dolor de espalda no avisa...'→'Back pain doesn\'t warn you. It just shows up at some point during the ride. The Rodata One pushes that point way further than you\'re used to.'
- features amber: 'Por qué funciona'→'Why it works'
- features heading: 'Diseñado para que dures más en el camino'→'Built to keep you going longer'
- city lifestyle alt: 'Rider urbano con Rodata One en CDMX'→'Urban rider with Rodata One'
- city lifestyle quote: '"Ahora el Rodata One sale conmigo en cada rodada."'→'"Now the Rodata One goes with me on every single ride."'
- city lifestyle cite: 'Carlos M., CDMX'→'Carlos M., Los Angeles'
- reviews amber: 'Reseñas verificadas'→'Verified reviews'
- reviews heading: 'Lo que dicen los riders'→'What riders are saying'
- reviews count: `<p ...>reseñas</p>`→`<p ...>reviews</p>`
- 'Compra verificada'→'Verified purchase'
- steps amber: 'Simple de usar · Compra sin riesgo'→'Easy to use · Risk-free purchase'
- steps heading: 'Listo en segundos. Sin riesgo.'→'Ready in seconds. Zero risk.'
- steps array: translate all 3 (Ajusta las correas/Ponlo bajo tu chamarra/Sale a rodar)
- trust cards: translate all 4 (30 días/Cambio de talla fácil/Envío gratis/Soporte WhatsApp)
- FAQ amber: 'Resolvemos tus dudas'→'We\'ve got answers'
- FAQ heading: 'Preguntas frecuentes'→'Frequently asked questions'
- final CTA heading: '¿Cuántas rodadas más...'→'How many more rides will you end with back pain?'
- final CTA sub: 'Envío gratis en México · 30 días de prueba · Cambio de talla fácil'→'Free US shipping · 30-day trial · Easy size exchange'
- final CTA button: '>Comprar ahora<ChevronRight'→'>Buy now<ChevronRight'
- sticky desktop: '<ShoppingCart size={14}/>Comprar ahora'→'<ShoppingCart size={14}/>Buy now' (replace_all)
- gallery watermark: 'rodata.mx'→'Rodata'
- highway alt: 'Rider mexicano con Soporte Lumbar Rodata One en carretera'→'Rider with Rodata One Lumbar Support on the highway'

#### CheckoutUI.tsx — Spanish strings to translate:
- L48: 'Error al cargar la orden'→'Error loading your order'
- L54: 'Cargando orden...'→'Loading order...'
- L82: 'Métodos de envío'→'Shipping methods'
- L104: `'GRATIS'` in delivery method display→`'FREE'`
- L148: 'Recoger en tienda' checkbox label→'Store pickup'
- L181: 'Te esperamos'→"We'll be waiting"
- L187: 'Horario:'→'Hours:'
- L192: GRATIS pickup label→FREE
- L206: 'Pago 100% seguro · Cifrado SSL · Procesado por Stripe'→'100% secure payment · SSL encrypted · Powered by Stripe'
- L244: `Pedido #${...}` description→`Order #${...}`
- L295: pickup description "Recoger en tienda"→"Store pickup"
- L362: 'Cargando productos...'→'Loading products...'
- L380: 'Restaurando tu carrito...'→'Restoring your cart...'
- L381: 'Mostrando datos guardados'→'Showing saved data'
- L390: 'Actualizar'→'Refresh'
- L403: 'Tu carrito está vacío'→'Your cart is empty'
- L404: 'Agrega un producto para iniciar tu compra'→'Add a product to start your purchase'
- L409: 'Comenzar a Comprar'→'Start Shopping'
- L432: 'Suscripción'→'Subscription'
- L437: 'Cantidad'→'Quantity'
- L471-472: 'Código de descuento'→'Discount code'
- L476: 'Ingresa tu cupón' placeholder→'Enter your coupon'
- L491: 'Aplicar'→'Apply'
- L497: 'Cupón aplicado:'→'Coupon applied:'
- L518: 'Envío'→'Shipping'
- L520-521: 'GRATIS (Recoger en tienda)'→'FREE (Store pickup)', 'GRATIS'→'FREE'
- Validation toast: 'Campos requeridos'→'Required fields', 'Por favor completa:'→'Please complete:'
- Validation push calls (have unicode escapes in file): 'email v\u00e1lido'→'valid email', 'direcci\u00f3n completa'→'complete address', 'm\u00e9todo de env\u00edo'→'shipping method' (NOTE: use \\u escapes in JSON old_string)
- L536: 'Descuento ({...})'→'Discount ({...})'
- MobileOrderSummary L576: 'Resumen del pedido'→'Order summary'
- Mobile L611: 'Envío'→'Shipping'
- Mobile L614-618: "GRATIS"→"FREE", "Pendiente"→"Pending"
- Mobile L623: 'Descuento'→'Discount'
- MobileCouponSection L768: '¿Tienes un cupón?'→'Have a coupon?'
- Mobile L773: 'Código de descuento' placeholder→'Discount code'
- Mobile L787: 'Aplicar'→'Apply'
- Mobile L795: 'Cupón:'→'Coupon:'
- BillingCheckboxSection L658: 'Usar la dirección de envío...'→'Use shipping address as billing address'
- Billing placeholders: 'Nombre'→'First name', 'Apellidos'→'Last name', 'Dirección'→'Address', 'Apartamento, suite, etc. (opcional)'→'Apartment, suite, etc. (optional)', 'C.P.'→'ZIP code', 'Ciudad'→'City', 'Estado'→'State', 'País'→'Country'

#### PrivacyPolicy.tsx — Full English rewrite needed (10 sections):
1. Responsible Party / Data Controller
2. Data We Collect
3. Purpose of Processing
4. Cookies and Tracking
5. Sharing Data with Third Parties
6. Data Security
7. Your Rights
8. Data Retention
9. Policy Updates
10. Contact

#### TermsAndConditions.tsx — Full English rewrite needed (11 sections):
1. Acceptance of Terms
2. Use of Site
3. Products and Prices
4. Purchase Process
5. Payment Methods
6. Shipping and Delivery
7. Returns and Refunds
8. Intellectual Property
9. Limitation of Liability
10. Modifications
11. Contact

## 4. Recent Changes
- 2026-05-18: Read ProductPageUI, CheckoutUI, PrivacyPolicy, TermsAndConditions — full edit plan documented above
- 2026-05-18: **IndexUI.tsx** — Full English translation, $69/$99 USD prices, US cities in reviews, US shipping messaging, routes to `/products/`
- 2026-05-18: **EcommerceTemplate.tsx** — Full English translation (nav, trust bar, footer, buy buttons), English routes for footer links
- 2026-05-18: **App.tsx** — Added English URL routes alongside Spanish fallbacks
- 2026-05-18: Store cloned from rodata.mx Mexico store for US market expansion

## 5. Image Inventory
All product/lifestyle images are the same as MX store — OK to reuse:
- Hero: `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775772513540-16g7elmcuii.webp`
- Reviews: `product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-[1-5].webp`
- Features: message-images/...1775777133671 through 1775777133672

## 6. Known Issues
- Store config shows `currency: usd (Peso Mexicano (MXN))` — label is misleading but actual currency code appears to be USD. Verify in Dashboard.
- Chrome autofill can paint checkout inputs white (CSS override already in index.css)
- ProductPageUI.tsx still fully in Spanish — highest priority
- CheckoutUI.tsx has unicode-escaped validation strings (`\u00e1` etc.) — use `\\u` in JSON old_string when editing

## 7. Key Files
- `src/pages/ui/IndexUI.tsx` — ✅ DONE — English
- `src/templates/EcommerceTemplate.tsx` — ✅ DONE — English
- `src/App.tsx` — ✅ DONE — English routes added
- `src/pages/ui/ProductPageUI.tsx` — ⚠️ TODO — ALL SPANISH (detailed plan in section 3)
- `src/pages/ui/CheckoutUI.tsx` — ⚠️ TODO — Spanish strings (detailed plan in section 3)
- `src/pages/PrivacyPolicy.tsx` — ⚠️ TODO — ALL SPANISH
- `src/pages/TermsAndConditions.tsx` — ⚠️ TODO — ALL SPANISH