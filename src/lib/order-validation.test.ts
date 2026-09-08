import { describe, expect, it } from 'vitest'
import {
  checkAuthorizedAmount,
  resolveIntentChargeCents,
  summarizeItemUnits,
  validateOrderMatchesRequest,
} from '@/lib/order-validation'
import { buildSelectedPurchaseItems } from '@/lib/pack-selection'
import { cartToApiItems } from '@/lib/cart-utils'
import { priceCartItems } from '@/lib/cart-pricing'
import { toCents } from '@/lib/money'
import {
  RODATA_ID,
  makeProduct,
  makeVariant,
  orderItem,
  twoPackRule,
} from '@/lib/__fixtures__/rodata'

const M = makeVariant('M')
const L = makeVariant('L')
const product = makeProduct([M, L])
const rule = twoPackRule()

const packItems = (secondVariant = L) =>
  buildSelectedPurchaseItems({
    product,
    packQuantity: 2,
    firstVariant: M,
    secondVariant,
    sellingPlan: null,
    hasVariants: true,
  } as any)

describe('validateOrderMatchesRequest', () => {
  it('accepts an order that carries both variants', () => {
    const requested = cartToApiItems(packItems())
    const order = { order_items: [orderItem(M.id, 1), orderItem(L.id, 1)] }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(true)
  })

  it('compares units, not line counts — M × 2 in one line is valid', () => {
    const requested = cartToApiItems(packItems(M))
    const order = { order_items: [orderItem(M.id, 2)] }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(true)
  })

  it('also accepts M × 2 split across two order lines', () => {
    const requested = cartToApiItems(packItems(M))
    const order = { order_items: [orderItem(M.id, 1), orderItem(M.id, 1)] }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(true)
  })

  it('rejects an order that silently dropped the second belt', () => {
    const requested = cartToApiItems(packItems())
    const order = { order_items: [orderItem(M.id, 1)] }
    const result = validateOrderMatchesRequest(requested, order)
    expect(result.valid).toBe(false)
    expect(result.code).toBe('quantity_mismatch')
  })

  it('rejects an order whose quantity shrank', () => {
    const requested = cartToApiItems(packItems(M))
    const order = { order_items: [orderItem(M.id, 1)] }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(false)
  })

  it('rejects an order that swapped a variant', () => {
    const requested = cartToApiItems(packItems())
    const order = { order_items: [orderItem(M.id, 1), orderItem('variant-xl', 1)] }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(false)
  })

  it('rejects as soon as unavailable_items comes back, whatever the order says', () => {
    const requested = cartToApiItems(packItems())
    const order = { order_items: [orderItem(M.id, 1), orderItem(L.id, 1)] }
    const result = validateOrderMatchesRequest(requested, order, [
      { product_name: 'Rodata One', variant_name: 'L' },
    ])
    expect(result.valid).toBe(false)
    expect(result.code).toBe('unavailable_items')
    expect(result.message).toContain('Rodata One (L)')
  })

  it('does not reject when the response omits order_items entirely', () => {
    const requested = cartToApiItems(packItems())
    expect(validateOrderMatchesRequest(requested, {}).valid).toBe(true)
  })

  it('rejects an empty selection', () => {
    expect(validateOrderMatchesRequest([], { order_items: [] }).code).toBe('empty_order')
  })

  it('aggregates duplicated request lines before comparing', () => {
    const units = summarizeItemUnits([
      { product_id: RODATA_ID, variant_id: M.id, quantity: 1 },
      { product_id: RODATA_ID, variant_id: M.id, quantity: 1 },
    ])
    expect(units.get(`${RODATA_ID}:${M.id}`)).toBe(2)
  })
})

describe('checkAuthorizedAmount', () => {
  it('accepts the exact amount the shopper approved', () => {
    expect(checkAuthorizedAmount({ authorizedCents: 8850, chargeCents: 8850 }).matches).toBe(true)
  })

  it('rejects a higher amount', () => {
    expect(checkAuthorizedAmount({ authorizedCents: 8850, chargeCents: 11800 }).matches).toBe(false)
  })

  it('rejects a lower amount too — it is still not what was approved', () => {
    expect(checkAuthorizedAmount({ authorizedCents: 8850, chargeCents: 5900 }).matches).toBe(false)
  })

  it('rejects a currency swap', () => {
    const result = checkAuthorizedAmount({
      authorizedCents: 8850,
      chargeCents: 8850,
      authorizedCurrency: 'usd',
      chargeCurrency: 'mxn',
    })
    expect(result.matches).toBe(false)
    expect(result.currencyMatches).toBe(false)
  })

  it('rejects a one-cent drift', () => {
    expect(checkAuthorizedAmount({ authorizedCents: 8850, chargeCents: 8851 }).matches).toBe(false)
  })
})

describe('resolveIntentChargeCents', () => {
  it('prefers the intent amount over local math', () => {
    expect(resolveIntentChargeCents({ amount: 11800 }, 8850)).toBe(11800)
  })

  it('falls back to the persisted order total', () => {
    expect(resolveIntentChargeCents({ order: { total_amount: 88.5 } }, 5900)).toBe(8850)
  })

  it('falls back to the caller value when the response says nothing', () => {
    expect(resolveIntentChargeCents({}, 8850)).toBe(8850)
  })
})

describe('selection → order → payment provider → confirmation', () => {
  const pricing = (items: any[]) => priceCartItems(items, { volumeRules: [rule], bogoRules: [] })

  it('agrees on composition and amount end to end for M + L', () => {
    const items = packItems()
    const requested = cartToApiItems(items)
    const expectedCents = toCents(pricing(items).total)

    // What checkout-create persists.
    const order = {
      order_items: [orderItem(M.id, 1), orderItem(L.id, 1)],
      total_amount: 88.5,
      currency_code: 'usd',
    }
    expect(validateOrderMatchesRequest(requested, order).valid).toBe(true)
    expect(toCents(order.total_amount)).toBe(expectedCents)

    // What payments-create-intent will charge.
    const chargeCents = resolveIntentChargeCents({ amount: 8850, currency: 'usd' }, expectedCents)
    expect(
      checkAuthorizedAmount({
        authorizedCents: expectedCents,
        chargeCents,
        authorizedCurrency: 'usd',
        chargeCurrency: 'usd',
      }).matches
    ).toBe(true)
  })

  it('stops when the order comes back partial, before any payment', () => {
    const items = packItems()
    const requested = cartToApiItems(items)
    const partialOrder = { order_items: [orderItem(M.id, 1)], total_amount: 59 }

    const match = validateOrderMatchesRequest(requested, partialOrder)
    expect(match.valid).toBe(false)

    // And even if someone ignored that, the amount check catches the difference.
    const expectedCents = toCents(pricing(items).total)
    expect(
      checkAuthorizedAmount({ authorizedCents: expectedCents, chargeCents: toCents(59) }).matches
    ).toBe(false)
  })

  it('stops when the intent would charge a different amount than the wallet showed', () => {
    const items = packItems()
    const expectedCents = toCents(pricing(items).total)
    const chargeCents = resolveIntentChargeCents({ amount: 11800 }, expectedCents)
    expect(checkAuthorizedAmount({ authorizedCents: expectedCents, chargeCents }).matches).toBe(false)
  })

  it('a single belt needs no second size and charges the single price', () => {
    const items = buildSelectedPurchaseItems({
      product,
      packQuantity: 1,
      firstVariant: M,
      sellingPlan: null,
      hasVariants: true,
    } as any)
    const requested = cartToApiItems(items)
    expect(requested).toEqual([{ product_id: RODATA_ID, quantity: 1, variant_id: M.id }])
    expect(toCents(pricing(items).total)).toBe(5900)
    expect(validateOrderMatchesRequest(requested, { order_items: [orderItem(M.id, 1)] }).valid).toBe(true)
  })
})
