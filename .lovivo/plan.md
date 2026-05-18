# Rodata.mx — Plan

## Current State
Premium moto lumbar support PDP + Checkout dark-branded. Cart sidebar dark-themed. Store is ready for paid traffic.

## Recent Changes
- Added urgency/stock signal above CTA on PDP
- Added checkout dark rebrand
- Phone input autofill fix
- Cart Sidebar dark rebrand (DONE ✅)
- **BUG FIX: "Comprar Ahora" → checkout vacío — RESUELTO ✅**
- **Precio actualizado: MX$749 → MX$699** (compare_at_price: MX$999) ✅
- **BUG FIX: /gracias mostraba "Recoger en Tienda" — RESUELTO ✅**
- **Migración Express Checkout — Pasos 1-5 COMPLETADOS ✅**
- **Stripe Elements dark theme — RESUELTO ✅** (`src/lib/stripe-appearance.ts` + `StripePayment.tsx`)
- **ExpressCheckoutElement: paymentMethodOrder + maxRows + buttonHeight ✅**
- **BUG FIX: validateCheckoutFields bloqueaba pago con AddressElement — RESUELTO ✅**
- **trackPurchase en Express Checkout handler — RESUELTO ✅** (PostHog + Meta Pixel se disparan al pagar con GPay/Apple Pay)
- **BUG FIX: isValidPhone rechazaba E.164 sin espacio (+525531245632) — RESUELTO ✅**

---

## ✅ RESUELTO: Phone no llegaba a clients-upsert

### Root Cause
`isValidPhone` usaba `/^\+\d+\s?/` (greedy) para quitar el prefijo de `+525531245632`.
El `\d+` consumía TODOS los dígitos → `phoneWithoutPrefix = ''` → `digitsOnly.length = 0` → retornaba `false`.
`normalizePhoneNumber` llama primero a `isValidPhone` → retornaba `null` → teléfono excluido del payload.

### Fix aplicado en `src/adapters/CheckoutAdapter.tsx`
Reemplazada `isValidPhone` para contar el total de dígitos (incluye código de país):
```js
const isValidPhone = (phoneValue: string) => {
  if (!phoneValue.trim()) return false;
  const digitsOnly = phoneValue.replace(/[^\d]/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};
```
MX: +52 (2) + 10 local = 12 dígitos → pasa. Mínimo 7 excluye números claramente inválidos.

---

## ✅ COMPLETADO: trackPurchase en Express Checkout

### Cambio aplicado en `StripePayment.tsx`
Dentro del handler `onConfirm` del `ExpressCheckoutElement`, inmediatamente después de `if (pi?.status === 'succeeded') {`:
```ts
trackPurchase({
  products: paymentItems.map((item: any) => tracking.createTrackingProduct({
    id: item.product_id, title: item.product_name || item.title,
    price: item.price / 100, category: 'product',
    variant: item.variant_id ? { id: item.variant_id } : undefined
  })),
  value: totalCents / 100, currency: tracking.getCurrencyFromSettings(currency),
  order_id: orderId,
  custom_parameters: { payment_method: 'express_checkout', checkout_token: checkoutToken }
})
```
- `payment_method: 'express_checkout'` diferencia GPay/Apple Pay del flujo Stripe normal (`'stripe'`)
- Todos los parámetros (`paymentItems`, `totalCents`, `checkoutToken`, etc.) ya estaban en scope

---

## ✅ COMPLETADO: Fix validación checkout con Stripe AddressElement

### Root Cause
`validateCheckoutFields` en `CheckoutAdapter` validaba campos de React state (`phone`, `address.state`, etc.) que ahora maneja el `AddressElement` de Stripe. Cuando Link pre-rellena la dirección sin que el usuario la toque, el `onChange` no necesariamente sincroniza el estado antes de que el usuario presione "Completar Compra", causando el error "Campos requeridos: teléfono, estado".

### Fix aplicado en `CheckoutUI.tsx`
- Reemplazado `onValidationRequired={logic.validateCheckoutFields}` por una función custom inline
- Si `!logic.usePickup`: valida solo `email` (regex) + `addressElementComplete` (flag del `onChange` de Stripe AddressElement) + método de envío si aplica
- Si `logic.usePickup`: sigue usando `logic.validateCheckoutFields()` completo (campos manuales)
- Añadido `useToast` import en CheckoutUI para mostrar errores

---

## ✅ COMPLETADO: Express Checkout — Orden de botones y altura

### Fix aplicado en `StripePayment.tsx`
Dentro del objeto `options` del `<ExpressCheckoutElement>`:
```
layout: { overflow: 'auto', maxColumns: 2, maxRows: 1 },
buttonHeight: 44,
paymentMethodOrder: ['applePay', 'googlePay', 'link'],
```

---

## ✅ COMPLETADO: Stripe Elements Dark Theme

### Root Cause
`getComputedStyle(document.documentElement)` leía variables de `:root` (tema claro → `--background: 200 18% 97%` ≈ blanco), porque la página de checkout usa fondos oscuros hardcodeados (`bg-[#111315]`) sin agregar `.dark` al `<html>`.

### Solución
- Creado `src/lib/stripe-appearance.ts` con `getStripeAppearance('dark' | 'light')`
- Modo `'dark'`: usa `theme: 'night'` + tokens dark de rodata.mx hardcodeados
- Modo `'light'`: lee CSS vars de `:root` en runtime (para stores futuras en modo claro)
- `StripePayment.tsx`: reemplazado bloque de appearance inline por `getStripeAppearance('dark')`

---

## ✅ COMPLETADO: Migración Express Checkout (Stripe PaymentElement + Apple Pay / Google Pay)

### Pasos completados
1. ✅ `src/lib/country-codes.ts` — mapeo bidireccional ISO ↔ nombre en español
2. ✅ `src/components/ProductExpressCheckout.tsx` — PaymentRequestButton en PDP; settings-gated mount (no IntersectionObserver)
3. ✅ `src/components/StripePayment.tsx` — PaymentElement + LinkAuthenticationElement + AddressElement + ExpressCheckoutElement; fix de `intentOrder` preservado; dark appearance via `getStripeAppearance('dark')`
4. ✅ `src/pages/ui/CheckoutUI.tsx` — integrado: `allowedCountries`, `deliveryMethodSlot`, `onAddressChange`, `onEmailChange`, `onLinkAuthChange`, `showAddressElement`, `addressElementComplete`, `stripeKey` estable, `isStripeReady` guard; dark theme 100% preservado; validación custom bypasa fields de Stripe AddressElement
5. ✅ `src/pages/ui/ProductPageUI.tsx` — Express Checkout insertado encima de los CTAs

### CTA Order (PDP)
1. `<ProductExpressCheckout>` — aparece solo si Apple Pay / Google Pay disponibles
2. Divider "— o —" — solo si `expressAvailable === true`
3. **Comprar ahora** (btn-amber-lg, primario)
4. **Agregar al carrito** (btn-outline-light, secundario)

### CRITICAL: intentOrder fix preservado en StripePayment.tsx
```
// After successful payment:
if (intentOrder) {
  localStorage.setItem('completed_order', JSON.stringify(intentOrder))
} else {
  const checkoutData = localStorage.getItem(`checkout:${STORE_ID}`)
  if (checkoutData) {
    const parsed = JSON.parse(checkoutData)
    if (parsed.order) localStorage.setItem('completed_order', JSON.stringify(parsed.order))
  }
}
```

---

## ✅ BUG RESUELTO: /gracias → dirección incorrecta

### Fix Applied
- `StripePayment.tsx`: captura `intentOrder = data?.order` y lo guarda en localStorage
- `ThankYou.tsx`: lectura de campos con fallback dual: `line1 || address1`, `state || province`, etc.

---

## Known Issues
- Chrome autofill puede pintar inputs del checkout en blanco (workaround: CSS autofill override ya aplicado en index.css)

## Key Files
- `src/pages/ui/ProductPageUI.tsx` — main PDP ✅ (Express Checkout + CTAs ordenados)
- `src/pages/ui/CheckoutUI.tsx` — checkout ✅ (dark brand rebrand done + Express Checkout integrado + validación custom)
- `src/templates/EcommerceTemplate.tsx` — header/footer/nav
- `src/components/StripePayment.tsx` — payment form ✅ (intentOrder fix + PaymentElement + AddressElement + dark appearance + paymentMethodOrder + trackPurchase en express)
- `src/lib/stripe-appearance.ts` — ✅ helper getStripeAppearance('dark'|'light')
- `src/components/ProductExpressCheckout.tsx` — PaymentRequestButton en PDP ✅ (settings-gated, no lazy observer)
- `src/lib/country-codes.ts` — mapeo ISO ↔ español ✅
- `src/components/CartSidebar.tsx` — cart lateral ✅ dark theme complete
- `src/index.css` — design system
- `src/adapters/CheckoutAdapter.tsx` — checkout logic ✅ isValidPhone fix aplicado
- `src/hooks/useCheckout.ts` — checkoutWithItems agregado
- `src/hooks/useCheckoutState.ts` — manages localStorage state
- `src/components/headless/HeadlessProduct.tsx` — handleBuyNow corregido ✅
- `src/pages/ThankYou.tsx` — ✅ field names fixed (line1/state/postal_code/name)

---

## PENDING: Post-Launch (nice to have)
- Add a "También les encantó" section at bottom of cart/checkout (upsell)
- Consider a post-purchase email sequence (set up from Dashboard)
- Video testimonial section if user has video content