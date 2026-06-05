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

### ACTIVE: Checkout full English translation
**Files**: `src/components/StripePayment.tsx`, `src/pages/ui/CheckoutUI.tsx`

#### StripePayment.tsx — all Spanish strings to fix:
| Line | Current (ES) | Target (EN) |
|------|-------------|-------------|
| 88 | `'Envío'` | `'Shipping'` |
| 199 | `\`Pedido #${orderId ?? "s/n"}\`` | `\`Order #${orderId ?? "N/A"}\`` |
| 256 | toast title: `"Productos agotados"` | `"Out of stock"` |
| 257 | toast desc: `"Los siguientes productos ya no están disponibles: ... Retíralos de tu carrito..."` | `"The following items are no longer available: ${unavailableNames}. Remove them from your cart to complete your purchase."` |
| 268 | toast desc: `"Stripe no está listo"` | `"Stripe is not ready yet"` |
| 275 | toast title: `"Punto de recogida requerido"`, desc: `"Por favor selecciona un punto de recogida antes de continuar."` | title: `"Pickup required"`, desc: `"Please select a pickup location before continuing."` |
| 285 | toast desc: `submitError.message \|\| "Verifica los datos de pago"` | `submitError.message \|\| "Please check your payment details"` |
| 327 | `throw new Error("No se recibió client_secret del servidor")` | `"No client_secret received from server"` |
| 357 | toast title: `"Error de pago"`, desc: `"No se pudo procesar el pago"` | title: `"Payment error"`, desc: `result.error.message \|\| "Your payment could not be processed"` |
| 399 | toast title: `"¡Pago exitoso!"`, desc: `"Tu compra ha sido procesada correctamente."` | title: `"Payment successful!"`, desc: `"Your order has been placed successfully."` |
| 434 | toast title: `"Acción requerida"`, desc: `"Por favor completa la verificación del pago."` | title: `"Action required"`, desc: `"Please complete the payment verification."` |
| 441 | toast title: `"Estado del pago"`, desc: `\`Estado: ${pi?.status ?? "desconocido"}\`` | title: `"Payment status"`, desc: `\`Status: ${pi?.status ?? "unknown"}\`` |
| 463-466 | toast title: `"Pagos no configurados"`, desc: `"Esta tienda aún no ha configurado un método de pago..."` | title: `"Payments not configured"`, desc: `"This store hasn't set up a payment method yet. Go to the Lovivo dashboard to connect Stripe."` |
| 469 | toast desc: `"No se pudo procesar el pago. Intenta de nuevo."` | `"Your payment could not be processed. Please try again."` |
| 513-515 | toast title: `"Falta dirección de envío"`, desc: `"Por favor completa tu dirección antes de pagar."` | title: `"Shipping address required"`, desc: `"Please complete your shipping address before paying."` |
| 558 | `throw new Error("No se recibió client_secret del servidor")` | `"No client_secret received from server"` |
| 587 | toast title: `"Error de pago"`, desc: `"No se pudo procesar el pago"` | title: `"Payment error"`, desc: `result.error.message \|\| "Your payment could not be processed"` |
| 612 | toast title: `"¡Pago exitoso!"`, desc: `"Tu compra ha sido procesada correctamente."` | title: `"Payment successful!"`, desc: `"Your order has been placed successfully."` |
| 635 | `displayName: 'Envío estándar'` | `displayName: 'Standard shipping'` |
| 661 | `displayName: 'Envío estándar'` | `displayName: 'Standard shipping'` |
| 693 | `<span>o</span>` | `<span>or</span>` |
| 818 | `<span>Procesando...</span>` | `<span>Processing...</span>` |
| 820 | `` `Completar Compra - ${amountLabel}` `` | `` `Complete Purchase - ${amountLabel}` `` |
| 824 | `Condiciones` (Terms link) | `Terms` |
| 826 | `Privacidad` (Privacy link) | `Privacy` |

**ALSO fix default country** in AddressElement (lines 744 & 748): Change `country: 'MX'` → `country: 'US'` so the address form pre-selects United States.

**ALSO fix express checkout price bug** (line 596): `price: item.price / 100` → `price: item.price` (same bug that was fixed in handlePayment but NOT in handleExpressCheckoutConfirm — would send $0.49 to Meta instead of $49 for Apple Pay / Google Pay flows).

#### CheckoutUI.tsx — all Spanish strings to fix:
| Line | Current (ES) | Target (EN) |
|------|-------------|-------------|
| 48 | `"Error al cargar la orden"` | `"Error loading order"` |
| 54 | `"Cargando orden..."` | `"Loading order..."` |
| 82 | `"Métodos de envío"` | `"Shipping methods"` |

## 4. Recent Changes
- 2026-06-05: **IndexUI.tsx** — All hardcoded prices ($49, $75, 35% OFF) now dynamically read from `filteredProducts[0].price` and `compare_at_price` via `useSettings().formatMoney`. Updates automatically when product price changes in Dashboard.
- 2026-06-04: **PixelContext.tsx** — Persist fbclid → fbc to localStorage (_fbc_fallback) AND set first-party cookie (90 days). Survives refresh/navigation.
- 2026-06-04: **tracking-utils.ts** — `getUserDataForCapi()` now reads `_fbc_fallback` and `_fbp_fallback` from localStorage as fallback if React state is null.
- 2026-06-04: **StripePayment.tsx** — Fixed `item.price / 100` bug: item.price was already in dollars, division was sending $0.49 instead of $49 to Meta.
- 2026-06-04: **ThankYou.tsx** — Added deferred Purchase tracking for Stripe 3DS redirect flow (`redirect_status=succeeded` in URL). Uses fire-once guard (`purchase_tracked_<orderId>` in localStorage).
- 2026-06-01: **ThankYou.tsx** — Full English translation (20 strings)
- 2026-05-28: **ProductPageUI.tsx** — badge -35% half in/half out (desktop restructure + mobile -translate-y-1/2)
- 2026-05-28: **public/avatar-j.webp, avatar-m.webp, avatar-r.webp** — Generated real rider avatar photos
- 2026-05-28: **ProductPageUI.tsx** — Social proof banner: J/M/R letters → real person photos
- 2026-05-28: **ProductPageUI.tsx** — Sticky bar v2
- 2026-05-28: **EcommerceTemplate.tsx** — trust bar: Free US Shipping + +1,000 Happy Riders (mobile), 30-Day Trial (desktop)
- 2026-05-28: **index.css** — added `.no-scrollbar` utility class
- 2026-05-28: **ProductPageUI.tsx** — Supabase image transforms + fetchPriority + carousel lazy loading
- 2026-05-28: **IndexUI.tsx** — Supabase image transforms on all 9 image constants
- 2026-05-28: **index.html** — Removed 14 unused Google Fonts, async Sora+Inter, English meta tags

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
- **🐛 Express checkout price bug**: `handleExpressCheckoutConfirm` in StripePayment.tsx line 596 still has `item.price / 100` — same bug that was fixed in `handlePayment`. Will be fixed in next checkout translation pass.
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
- `src/components/StripePayment.tsx` — ✅ Fixed item.price/100 bug + 3DS redirect support | ⏳ Needs full EN translation
- `src/pages/ThankYou.tsx` — ✅ Deferred Purchase event for 3DS redirect flow
- `src/pages/ui/ProductPageUI.tsx` — ✅ English + US reviews + image optimization + UX improvements
- `index.html` — ✅ English meta + non-blocking fonts (Sora+Inter only)
- `src/templates/EcommerceTemplate.tsx` — ✅ English + new trust bar
- `src/pages/ui/CheckoutUI.tsx` — ⏳ 3 Spanish strings remaining