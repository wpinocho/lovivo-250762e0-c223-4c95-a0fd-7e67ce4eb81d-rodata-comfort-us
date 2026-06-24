# Rodata.mx US Store — Plan

## 1. Brand & Context
- **Product**: Rodata One — premium motorcycle lumbar support belt
- **Market**: US riders (cloned from rodata.mx Mexico store)
- **Target**: Frequent urban riders, long-distance riders who want comfort
- **Voice**: Premium, no-BS, rider-to-rider. Dark brand aesthetic.
- **Store ID**: 250762e0-c223-4c95-a0fd-7e67ce4eb81d
- **Preview URL**: https://250762e0-c223-4c95-a0fd-7e67ce4eb81d.preview.lovivo.app
- **Brand name for US store**: RODATA (no .mx)
- **LANGUAGE: ENGLISH** — all storefront strings are in English. Dates in US format (date-fns default `en`, e.g. "Jun 12, 2026"). DO NOT use the `es` date-fns locale.

## 2. Design System
- **Colors**: brand-amber (#C98B2E), brand-carbon (#111315), brand-graphite (#1D2125), brand-offwhite, brand-smoke, brand-steel
- **Fonts**: Sora (headings), Inter (body) — loaded from Google Fonts (async/non-blocking)
- **Theme**: Dark, premium, moto culture
- **Layout**: Full-width PDP, dark checkout, dark cart sidebar
- **UI kit**: shadcn (Card, Badge, Button, Skeleton, Collapsible). Wrap pages in `EcommerceTemplate`.

## 3. Active Plan — 🚧 Order Tracking Page (READY TO BUILD — all files spec'd)

**All context already read. Implement in ONE session (no more reading needed).**

### Files to CREATE:

#### `src/pages/OrderTrack.tsx` (Tipo A wrapper)
```tsx
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import OrderTrackUI from '@/pages/ui/OrderTrackUI'

const OrderTrack = () => {
  const { token } = useParams<{ token?: string }>()
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])
  return <OrderTrackUI token={token} />
}
export default OrderTrack
```

#### `src/pages/ui/OrderTrackUI.tsx` (Tipo B, full UI)
Imports needed:
```tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Package, CheckCircle2, AlertTriangle, Copy, ExternalLink, ChevronDown, Truck, Search, MapPin, RefreshCw, XCircle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
```

Types:
```tsx
interface TrackingEvent { occurred_at: string; status_detail: string; location?: string }
interface TrackingData {
  steps?: Array<string | { label: string; description?: string }>
  current_step?: number
  cancelled?: boolean
  carrier?: string
  shipping_carrier?: string
  tracking_number?: string
  tracking_url?: string
  estimated_delivery_at?: string
  events?: TrackingEvent[]
  display_mode?: 'detailed' | 'masked'
}
interface OrderTrackUIProps { token?: string }
const DEFAULT_STEPS = ['Order Placed', 'Preparing', 'Shipped', 'Delivered']
function resolveSteps(data: TrackingData | null): string[] {
  if (!data?.steps?.length) return DEFAULT_STEPS
  return data.steps.map(s => (typeof s === 'string' ? s : s.label))
}
```

**OrderTimeline component** — horizontal desktop / vertical mobile:
- i < currentStep → done: amber bg circle + CheckCircle2 icon + amber connector line
- i === currentStep → active: amber border + pulsing amber dot
- i > currentStep → pending: white/20 border + gray dot
- Step label: brand-amber (done), brand-offwhite bold (active), brand-steel (pending)

**TrackingSkeleton** — 4 circles + lines (desktop), 4 rows (mobile), then 2 card skeletons

**LookupForm component:**
- reads `?order_number=` from URL via useSearchParams to pre-fill
- fields: Order Number (text) + Email (email)
- Submit button with Search icon, disabled during loading
- onSubmit calls: `fetchTracking({ store_id: STORE_ID, order_number, email })`

**Main OrderTrackUI state:**
```tsx
const [data, setData] = useState<TrackingData | null>(null)
const [loading, setLoading] = useState(!!token)   // auto-load if token present
const [error, setError] = useState<'not_found' | 'generic' | null>(null)
const [showForm, setShowForm] = useState(!token)
const [eventsOpen, setEventsOpen] = useState(false)
```

**fetchTracking:**
```tsx
const fetchTracking = async (payload: object) => {
  setLoading(true); setError(null)
  try {
    const result = await callEdge('order-track', payload)
    if (!result || result.error || result.ok === false) { setError('not_found') }
    else { setData(result as TrackingData); setShowForm(false) }
  } catch (err: any) {
    const msg = String(err?.message ?? '').toLowerCase()
    setError(msg.includes('404') || msg.includes('not found') ? 'not_found' : 'generic')
  } finally { setLoading(false) }
}
useEffect(() => { if (token) fetchTracking({ token }) }, [token])
const handleLookup = (orderNumber: string, email: string) =>
  fetchTracking({ store_id: STORE_ID, order_number: orderNumber, email })
```

**Render sections (in order):**
1. `{loading && <TrackingSkeleton />}`
2. `{!loading && showForm && !data && <LookupForm onSubmit={handleLookup} loading={loading} />}`
3. not_found: Package icon + "Order not found" + "Try again" button → `setError(null); setShowForm(true)`
4. generic error: AlertTriangle + "Something went wrong" + Retry
5. DATA section (when `!loading && data`):
   - h1 "Order Status" + subtitle
   - Cancelled banner (red, XCircle icon) if `data.cancelled`
   - `<Card className={cn(data.cancelled && 'opacity-40')}><OrderTimeline .../></Card>`
   - Estimated delivery: `bg-brand-amber/10 border border-brand-amber/25 rounded-xl` with Calendar icon + `format(date, 'MMM d, yyyy')`
   - Carrier card (only if `displayMode === 'detailed'` && carrier or tracking_number): carrier name row, tracking number + Copy button (navigator.clipboard → toast), "Track with carrier" external link button
   - Events Collapsible (only if `displayMode === 'detailed'` && events.length > 0): MapPin icon header, rows of `format(occurred_at, 'MMM d, h:mm a')` + status_detail + location
   - "Look up a different order" text button → reset state + showForm

**copyTracking:**
```tsx
const copyTracking = (value: string) =>
  navigator.clipboard.writeText(value)
    .then(() => toast({ description: 'Tracking number copied!' }))
    .catch(() => toast({ description: 'Could not copy.', variant: 'destructive' }))
```

---

### Files to EDIT:

#### `src/App.tsx`
Add lazy import (after PendingPayment line):
```tsx
const OrderTrack = lazy(() => import('./pages/OrderTrack'));
```
Add routes (after `/my-orders` route):
```tsx
<Route path="/orders/track" element={<OrderTrack />} />
<Route path="/orders/track/:token" element={<OrderTrack />} />
```

#### `src/templates/EcommerceTemplate.tsx`
1. Add to DEFAULT_NAV_LINKS:
```tsx
{ label: 'Track Order', href: '/orders/track' },
```
2. Add to footer navigation array:
```tsx
{ label: 'Track Order', href: '/orders/track' },
```
(add before Privacy Policy)

#### `src/pages/ui/MyOrdersUI.tsx` — FULL REWRITE (many Spanish strings + new CTA)
Key changes:
- Remove `import { es } from 'date-fns/locale'`
- Add `Truck` to lucide-react imports
- Translate STATUS_MAP: En proceso→Processing, Completado→Completed, Enviado→Shipped, Cancelado→Canceled, Reembolsado→Refunded, Pagado→Paid, Pago pendiente→Payment pending, Pago fallido→Payment failed
- Add `const navigate = useNavigate()` inside `OrderCard`
- Date: `format(new Date(order.created_at), "MMM d, yyyy")` (no locale)
- producto/productos → item/items
- Producto → Product (fallback)
- Cant: → Qty:
- Descuento aplicado → Discount applied
- Descuento → Discount, Envío → Shipping, Impuestos → Taxes
- Dirección de envío → Shipping address
- Add Track order CTA block after shipping address (inside CollapsibleContent):
```tsx
{(order.checkout_token || order.tracking_number || order.estimated_delivery_at) && (
  <div className="border-t pt-3 space-y-2">
    {order.checkout_token && (
      <Button size="sm" onClick={() => navigate('/orders/track/' + order.checkout_token)} className="gap-2">
        <Truck className="h-3.5 w-3.5" />Track order
      </Button>
    )}
    {order.tracking_number && (
      <p className="text-xs text-muted-foreground">
        Tracking: <span className="font-medium text-foreground font-mono">{order.tracking_number}</span>
        {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-amber hover:underline">View →</a>}
      </p>
    )}
    {order.estimated_delivery_at && (
      <p className="text-xs text-muted-foreground">
        Estimated delivery: <span className="font-medium text-foreground">{format(new Date(order.estimated_delivery_at), 'MMM d, yyyy')}</span>
      </p>
    )}
  </div>
)}
```
- Mis Pedidos → My Orders, Historial de compras → Order history
- Sign in state: Inicia sesión → Sign in to view your orders; Necesitas una cuenta → You need an account...; Iniciar Sesión → Sign In
- Error state: No pudimos cargar → We couldn't load your orders; Reintentar → Retry
- Empty state: Aún no tienes pedidos → You have no orders yet; Cuando realices → Your purchases will appear here; Ir a la tienda → Go to store

#### `src/pages/ThankYou.tsx`
1. Add `Truck` to lucide-react import
2. Add button in Action Buttons row (before "Continue Shopping"):
```tsx
<Button asChild>
  <Link to={`/orders/track?order_number=${order.order_number}`} className="flex items-center gap-2">
    <Truck className="w-4 h-4" />
    Track my order
  </Link>
</Button>
```

---

## 4. Recent Changes
- 2026-06-24: **Order Tracking page FULLY SPEC'D** — all 6 files ready to build in one session. No more reading needed. Just implement.
- 2026-06-24: **Order Tracking page PLANNED** — public timeline page (`/orders/track/:token` + lookup), MyOrders CTA, optional ThankYou CTA. Adapted to English/US. Ready for Craft Mode.
- 2026-06-18: **Meta duplicate conversions fix IMPLEMENTED** — deterministic event_id + sessionStorage guard on all 3 trackPurchase call sites
- 2026-06-18: **Footer contact** — WhatsApp replaced with `support@getrodata.com` email link
- 2026-06-15: **Attribution fix IMPLEMENTED** — all 5 files patched, fbclid/fbc/fbp/UTMs now flow to checkout-create and PayPal edge calls
- 2026-06-10: **PaypalExpressButton.tsx** — Fixed ThankYou "Order Not Found": added `fallbackOrder`; localStorage always written
- 2026-06-10: **CheckoutUI.tsx** — Single PayPal instance; removed "or pay with card" divider; mobile PayPal above Stripe
- 2026-06-10: **PayPal integration** — SettingsContext RPC, PaypalExpressButton.tsx, CheckoutUI.tsx
- 2026-06-09: **Delivery window** — 6–8 business days (was 7–9) in CheckoutUI + ProductPageUI
- 2026-06-09: **StripePayment.tsx** — Removed duplicate "30-Day Comfort Guarantee" line

## 5. Image Inventory
- Hero feature image (landing): `https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/render/image/public/message-images/f67d4ec0.../1779817823430-uv5gvuf1tv.webp?width=1000&quality=75`
- Hero (landing): `...render/image/public/message-images/0f3c776b.../1775772513540-16g7elmcuii.webp?width=1400&quality=80`
- Reviews: `render/image/public/product-images/cdddcb57.../review-[1-5].webp?width=600&quality=75`
- Avatars: `/avatar-j.webp`, `/avatar-m.webp`, `/avatar-r.webp` (public/ repo)

## 6. Known Issues
- **META DIAGNÓSTICO 🔴2**: Likely an expired CAPI Access Token — fix in Meta Business Manager (manual)
- Country name "Estados Unidos" on thank you page comes from backend data, not UI
- Feature images (FEAT_IMG_1-3) still contain Spanish text overlaid
- Google Pay error: domain needs registration in Stripe Dashboard
- Order tracking: all frontend files still need to be created/edited (see Active Plan above)

## 7. Key Files (for Order Tracking build)
- `src/lib/edge.ts` — `callEdge(fn, body)` helper (no auth needed)
- `src/lib/config.ts` — exports `STORE_ID`
- `src/templates/EcommerceTemplate.tsx` — has DEFAULT_NAV_LINKS array + footer nav array
- `src/App.tsx` — lazy routes, add after PendingPayment import + after /my-orders route
- `src/pages/ui/MyOrdersUI.tsx` — 321 lines, many Spanish strings, needs full rewrite
- `src/pages/ThankYou.tsx` — add Truck import + Track button in Action Buttons row
- CREATE: `src/pages/OrderTrack.tsx`
- CREATE: `src/pages/ui/OrderTrackUI.tsx`

## 8. Pending / Future Sessions
- **🔴 HIGH**: Build Order Tracking page (all files spec'd above, just needs execution)
- Fix expired CAPI Access Token in Meta Business Manager (manual — no code change)
- Replace feature images (FEAT_IMG_1-3) with English text versions
- Add English slug redirect for product page
- Register domain in Stripe Dashboard for Google Pay