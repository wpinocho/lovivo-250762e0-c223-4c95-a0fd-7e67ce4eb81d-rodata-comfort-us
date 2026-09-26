import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Minimal browser globals for the node test environment ──────────────────
// Node ≥19 ships crypto.randomUUID globally; older runtimes get a v4-shaped fallback.
if (!globalThis.crypto?.randomUUID) {
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  vi.stubGlobal('crypto', { randomUUID: () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}` })
}
vi.stubGlobal('window', { location: { href: 'https://getrodata.com/products/rodata-one' } })
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => { store.set(k, v) },
  removeItem: (k: string) => { store.delete(k) },
  clear: () => store.clear(),
})

// ── Spies on the three sinks: Browser Pixel, CAPI (edge), PostHog ──────────
const pixelTrack = vi.fn()
const pixelSearch = vi.fn()
vi.mock('@/lib/facebook-pixel', () => ({
  facebookPixel: {
    track: (...a: unknown[]) => pixelTrack(...a),
    search: (...a: unknown[]) => pixelSearch(...a),
    pageView: vi.fn(),
  },
}))

const callEdge = vi.fn(() => Promise.resolve({}))
vi.mock('@/lib/edge', () => ({ callEdge: (...a: unknown[]) => callEdge(...(a as [])) }))
vi.mock('@/lib/config', () => ({ STORE_ID: 'test-store' }))

const posthogCapture = vi.fn()
vi.mock('posthog-js', () => ({
  default: { __loaded: true, capture: (...a: unknown[]) => posthogCapture(...a) },
}))

const { tracking } = await import('@/lib/tracking-utils')

// ── Helpers ────────────────────────────────────────────────────────────────
const PRODUCT = { id: '6a3f41ac-37f6-4886-85f0-01cf0c6238ed', name: 'Rodata One', price: 59 }
const base = { products: [PRODUCT], value: 59, currency: 'usd' }

/** event_id the Browser Pixel received on call #n (fbq 4th arg → { eventID }). */
const pixelId = (n: number) => pixelTrack.mock.calls[n][2] as string
/** event_id CAPI received on call #n. */
const capiId = (n: number) => (callEdge.mock.calls[n] as any)[1].event_id as string
/** event_id PostHog received on call #n. */
const phId = (n: number) => (posthogCapture.mock.calls[n] as any)[1].event_id as string

beforeEach(() => {
  pixelTrack.mockClear()
  pixelSearch.mockClear()
  callEdge.mockClear()
  posthogCapture.mockClear()
  store.clear()
  tracking.setPixelData('pixel-123', 'fb.1.111.222', null)
})

// ── A + B: ViewContent ─────────────────────────────────────────────────────
describe('ViewContent', () => {
  it('A) two views of the SAME product get DIFFERENT event_ids', () => {
    tracking.trackViewContent(base)
    tracking.trackViewContent(base)

    expect(pixelId(0)).not.toBe(pixelId(1))
    expect(capiId(0)).not.toBe(capiId(1))
    // And the product id is no longer leaking into the event_id.
    expect(pixelId(0)).not.toContain(PRODUCT.id)
  })

  it('B) within ONE view, Pixel, CAPI and PostHog share the exact same event_id', () => {
    tracking.trackViewContent(base)

    expect(pixelTrack).toHaveBeenCalledTimes(1)
    expect(callEdge).toHaveBeenCalledTimes(1)
    expect(pixelTrack.mock.calls[0][0]).toBe('ViewContent')
    expect((callEdge.mock.calls[0] as any)[0]).toBe('meta-capi')
    expect(pixelId(0)).toBe(capiId(0))
    expect(pixelId(0)).toBe(phId(0))
    expect(pixelId(0)).toMatch(/^viewcontent_[0-9a-f-]{36}$/)
  })
})

// ── C: AddToCart ───────────────────────────────────────────────────────────
describe('AddToCart', () => {
  it('C) two adds of the same product get different event_ids, each shared Pixel↔CAPI', () => {
    tracking.trackAddToCart({ ...base, num_items: 1 })
    tracking.trackAddToCart({ ...base, num_items: 1 })

    expect(pixelId(0)).not.toBe(pixelId(1))
    expect(pixelId(0)).toBe(capiId(0))
    expect(pixelId(1)).toBe(capiId(1))
  })
})

// ── D + E: InitiateCheckout ────────────────────────────────────────────────
describe('InitiateCheckout', () => {
  it('D) without order_id → different event_ids (no product_id fallback)', () => {
    tracking.trackInitiateCheckout(base)
    tracking.trackInitiateCheckout(base)

    expect(pixelId(0)).not.toBe(pixelId(1))
    expect(pixelId(0)).not.toContain(PRODUCT.id)
    expect(pixelId(0)).toBe(capiId(0))
  })

  it('E) with the same order_id → same event_id', () => {
    tracking.trackInitiateCheckout({ ...base, order_id: 'ord_abc' })
    tracking.trackInitiateCheckout({ ...base, order_id: 'ord_abc' })

    expect(pixelId(0)).toBe('initiatecheckout_ord_abc')
    expect(pixelId(1)).toBe(pixelId(0))
    expect(capiId(1)).toBe(capiId(0))
  })
})

// ── F: Purchase (unchanged behaviour) ──────────────────────────────────────
describe('Purchase', () => {
  it('F) same order_id → same event_id on Pixel and CAPI', () => {
    tracking.trackPurchase({ ...base, order_id: 'ord_777' })
    tracking.trackPurchase({ ...base, order_id: 'ord_777' })

    expect(pixelId(0)).toBe('purchase_ord_777')
    expect(pixelId(1)).toBe('purchase_ord_777')
    expect(capiId(0)).toBe('purchase_ord_777')
    expect(capiId(1)).toBe('purchase_ord_777')
  })
})

// ── G: Search ──────────────────────────────────────────────────────────────
describe('Search', () => {
  it('G) two searches for the same text get different event_ids, each shared Pixel↔CAPI', () => {
    tracking.trackSearch({ search_string: 'lumbar belt' })
    tracking.trackSearch({ search_string: 'lumbar belt' })

    const p0 = pixelSearch.mock.calls[0][1] as string
    const p1 = pixelSearch.mock.calls[1][1] as string
    expect(p0).not.toBe(p1)
    expect(p0).not.toContain('lumbar')
    expect(p0).toBe(capiId(0))
    expect(p1).toBe(capiId(1))
  })
})

// ── H: other sinks untouched ───────────────────────────────────────────────
describe('non-Meta sinks', () => {
  it('H) PostHog still receives every event with its payload + the shared event_id', () => {
    tracking.trackViewContent(base)
    tracking.trackAddToCart({ ...base, num_items: 2 })
    tracking.trackInitiateCheckout(base)
    tracking.trackPurchase({ ...base, order_id: 'ord_1' })
    tracking.trackSearch({ search_string: 'belt' })

    const names = posthogCapture.mock.calls.map((c) => c[0])
    expect(names).toEqual(['viewcontent', 'addtocart', 'initiatecheckout', 'purchase', 'search_performed'])
    expect((posthogCapture.mock.calls[0] as any)[1]).toMatchObject({ content_ids: [PRODUCT.id], value: 59, currency: 'usd' })
    expect((posthogCapture.mock.calls[1] as any)[1]).toMatchObject({ num_items: 2 })
    expect(phId(3)).toBe('purchase_ord_1')
  })

  it('H) CAPI user_data (fbp) is still forwarded unchanged', () => {
    tracking.trackViewContent(base)
    expect((callEdge.mock.calls[0] as any)[1].user_data).toMatchObject({ fbp: 'fb.1.111.222' })
  })

  it('events still go to Meta regardless of traffic source (no utm filtering)', () => {
    ;(window as any).location.href = 'https://getrodata.com/?utm_source=google&utm_medium=cpc'
    tracking.trackViewContent(base)
    expect(pixelTrack).toHaveBeenCalledTimes(1)
    expect(callEdge).toHaveBeenCalledTimes(1)
  })
})