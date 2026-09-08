import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartToApiItems } from '@/lib/cart-utils'
import { buildSelectedPurchaseItems } from '@/lib/pack-selection'
import { makeProduct, makeVariant, orderItem } from '@/lib/__fixtures__/rodata'

const callEdge = vi.fn()
vi.mock('@/lib/edge', () => ({ callEdge: (...args: unknown[]) => callEdge(...args) }))

const { verifyOrderContents } = await import('@/lib/checkout')

const M = makeVariant('M')
const L = makeVariant('L')
const product = makeProduct([M, L])

const requested = cartToApiItems(
  buildSelectedPurchaseItems({
    product,
    packQuantity: 2,
    firstVariant: M,
    secondVariant: L,
    sellingPlan: null,
    hasVariants: true,
  } as any)
)

const bothBelts = [orderItem(M.id, 1), orderItem(L.id, 1)]

beforeEach(() => callEdge.mockReset())

describe('verifyOrderContents', () => {
  it('does not read the order again when the response already carries its items', async () => {
    const result = await verifyOrderContents(requested, {
      order_id: 'ord_1',
      checkout_token: 'tok_1',
      order: { order_items: bothBelts },
    } as any)

    expect(result.valid).toBe(true)
    expect(callEdge).not.toHaveBeenCalled()
  })

  it('reads the order detail once when the response is only a reference', async () => {
    callEdge.mockResolvedValue({ order_id: 'ord_1', order_items: bothBelts })

    const result = await verifyOrderContents(requested, {
      order_id: 'ord_1',
      checkout_token: 'tok_1',
    } as any)

    expect(result.valid).toBe(true)
    expect(callEdge).toHaveBeenCalledTimes(1)
    expect(callEdge).toHaveBeenCalledWith('order-get', { checkout_token: 'tok_1' })
  })

  it('rejects when the re-read shows a partial order', async () => {
    callEdge.mockResolvedValue({ order_id: 'ord_1', order_items: [orderItem(M.id, 1)] })

    const result = await verifyOrderContents(requested, {
      order_id: 'ord_1',
      checkout_token: 'tok_1',
    } as any)

    expect(result.valid).toBe(false)
    expect(result.code).toBe('quantity_mismatch')
  })

  it('stays unverified — never valid — when the re-read cannot confirm it', async () => {
    // order-get answers failures with `{ error }` and no order detail.
    callEdge.mockResolvedValue({ error: 'Order not found' })

    const result = await verifyOrderContents(requested, {
      order_id: 'ord_1',
      checkout_token: 'tok_1',
    } as any)

    expect(result.valid).toBe(false)
    expect(result.verifiable).toBe(false)
    // One read, not a retry loop.
    expect(callEdge).toHaveBeenCalledTimes(1)
  })

  it('cannot verify anything without a checkout token to read with', async () => {
    const result = await verifyOrderContents(requested, { order_id: 'ord_1' } as any)

    expect(result.valid).toBe(false)
    expect(result.verifiable).toBe(false)
    expect(callEdge).not.toHaveBeenCalled()
  })

  it('does not re-read when unavailable items already answer the question', async () => {
    const result = await verifyOrderContents(requested, {
      order_id: 'ord_1',
      checkout_token: 'tok_1',
      unavailable_items: [{ product_name: 'Rodata One', variant_name: 'L' }],
    } as any)

    expect(result.code).toBe('unavailable_items')
    expect(callEdge).not.toHaveBeenCalled()
  })
})
