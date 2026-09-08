import { describe, expect, it } from 'vitest'
import {
  checkAuthorizedAmount,
  extractOrderItems,
  resolveIntentCharge,
  resolveOrderCharge,
  summarizeItemUnits,
  validateOrderMatchesRequest,
  verifyIntentAmount,
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

const USD = { authorizedCurrency: 'usd' }

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

  it('reads the order nested under `order`, as checkout-create returns it', () => {
    const requested = cartToApiItems(packItems())
    const response = { order: { order_items: [orderItem(M.id, 1), orderItem(L.id, 1)] } }
    expect(validateOrderMatchesRequest(requested, response).valid).toBe(true)
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

  it('does not approve a non-empty selection against an explicitly empty order', () => {
    const requested = cartToApiItems(packItems())
    const result = validateOrderMatchesRequest(requested, { order_items: [] })
    expect(result.valid).toBe(false)
    expect(result.code).toBe('empty_order')
    expect(result.verifiable).toBe(true)
  })

  it('reports a missing order detail as unverifiable, never as valid', () => {
    const requested = cartToApiItems(packItems())
    const result = validateOrderMatchesRequest(requested, { order_id: 'ord_1' })
    expect(result.valid).toBe(false)
    expect(result.verifiable).toBe(false)
    expect(result.code).toBe('unverifiable_order')
  })

  it('rejects an empty selection', () => {
    expect(validateOrderMatchesRequest([], { order_items: [] }).code).toBe('empty_selection')
  })

  it('aggregates duplicated request lines before comparing', () => {
    const units = summarizeItemUnits([
      { product_id: RODATA_ID, variant_id: M.id, quantity: 1 },
      { product_id: RODATA_ID, variant_id: M.id, quantity: 1 },
    ])
    expect(units.get(`${RODATA_ID}:${M.id}`)).toBe(2)
  })
})

describe('extractOrderItems', () => {
  it('tells an absent detail apart from an empty one', () => {
    expect(extractOrderItems({ order_id: 'ord_1' })).toBeNull()
    expect(extractOrderItems({ order_items: [] })).toEqual([])
    expect(extractOrderItems(null)).toBeNull()
  })

  it('prefers the nested order record over a root-level list', () => {
    const items = extractOrderItems({
      order: { order_items: [orderItem(M.id, 2)] },
      order_items: [orderItem(L.id, 1)],
    })
    expect(items).toHaveLength(1)
    expect((items as any[])[0].variant_id).toBe(M.id)
  })
})

describe('resolveIntentCharge', () => {
  it('reads the realistic Lovivo response as $88.50 USD', () => {
    const resolution = resolveIntentCharge({
      payment_total_amount: 8850,
      currency: 'usd',
      currency_code: 'USD',
      order: { total_amount: 88.5, currency_code: 'USD' },
    })
    expect(resolution.verifiable).toBe(true)
    // Already cents: 8850 must not be multiplied again.
    expect(resolution.chargeCents).toBe(8850)
    expect(resolution.currency).toBe('usd')
    expect(resolution.source).toBe('payment_total_amount')
  })

  it('prevails over a stale copy of the order', () => {
    const resolution = resolveIntentCharge({
      payment_total_amount: 11800,
      currency: 'usd',
      order: { total_amount: 88.5, currency_code: 'usd' },
    })
    expect(resolution.chargeCents).toBe(11800)
  })

  it('falls back to the order total the response carries, in main units', () => {
    const resolution = resolveIntentCharge({ currency: 'usd', order: { total_amount: 88.5 } })
    expect(resolution.chargeCents).toBe(8850)
    expect(resolution.source).toBe('order_total_amount')
  })

  it('never invents an amount when the response carries none', () => {
    const resolution = resolveIntentCharge({ currency: 'usd' })
    expect(resolution.verifiable).toBe(false)
    expect(resolution.chargeCents).toBeNull()
    expect(resolution.issue).toBe('missing_amount')
  })

  it.each([
    ['zero', 0],
    ['negative', -8850],
    ['not a whole number of cents', 88.5],
    ['not finite', Number.NaN],
  ])('refuses an amount that is %s', (_label, payment_total_amount) => {
    const resolution = resolveIntentCharge({ payment_total_amount, currency: 'usd' })
    expect(resolution.verifiable).toBe(false)
  })

  it('reads the effective currency from the order when the response omits it', () => {
    expect(resolveIntentCharge({
      payment_total_amount: 8850,
      order: { currency_code: 'USD' },
    }).currency).toBe('usd')
  })
})

describe('resolveOrderCharge', () => {
  it('converts the persisted total into cents', () => {
    const resolution = resolveOrderCharge({ total_amount: 88.5, currency_code: 'usd' })
    expect(resolution.chargeCents).toBe(8850)
    expect(resolution.currency).toBe('usd')
  })

  it('is unverifiable without a total', () => {
    expect(resolveOrderCharge({ currency_code: 'usd' }).verifiable).toBe(false)
  })
})

describe('checkAuthorizedAmount', () => {
  const base = { authorizedCurrency: 'usd', chargeCurrency: 'usd' }

  it('accepts the exact amount the shopper approved', () => {
    expect(checkAuthorizedAmount({ ...base, authorizedCents: 8850, chargeCents: 8850 }).matches).toBe(true)
  })

  it('rejects a higher amount', () => {
    const check = checkAuthorizedAmount({ ...base, authorizedCents: 8850, chargeCents: 11800 })
    expect(check.matches).toBe(false)
    expect(check.issue).toBe('amount_mismatch')
    // A plain amount change can be re-quoted and approved again.
    expect(check.reauthorizable).toBe(true)
    expect(check.message).toContain('USD $118.00')
  })

  it('rejects a lower amount too — it is still not what was approved', () => {
    expect(checkAuthorizedAmount({ ...base, authorizedCents: 8850, chargeCents: 5900 }).matches).toBe(false)
  })

  it('rejects a one-cent drift', () => {
    expect(checkAuthorizedAmount({ ...base, authorizedCents: 8850, chargeCents: 8851 }).matches).toBe(false)
  })

  it('rejects a currency swap and refuses to re-quote it', () => {
    const check = checkAuthorizedAmount({
      authorizedCents: 8850,
      chargeCents: 8850,
      authorizedCurrency: 'usd',
      chargeCurrency: 'mxn',
    })
    expect(check.matches).toBe(false)
    expect(check.currencyMatches).toBe(false)
    expect(check.reauthorizable).toBe(false)
  })

  it('does not treat an absent currency as a matching one', () => {
    const check = checkAuthorizedAmount({
      authorizedCents: 8850,
      chargeCents: 8850,
      authorizedCurrency: 'usd',
      chargeCurrency: null,
    })
    expect(check.matches).toBe(false)
    expect(check.verifiable).toBe(false)
    expect(check.issue).toBe('missing_currency')
  })

  it('does not fall back to the amount the browser expected', () => {
    const check = verifyIntentAmount({ currency: 'usd' }, { authorizedCents: 8850, ...USD })
    expect(check.matches).toBe(false)
    expect(check.verifiable).toBe(false)
    expect(check.chargeCents).toBeNull()
  })

  it('matches the case-insensitive currency Lovivo returns', () => {
    const check = verifyIntentAmount(
      { payment_total_amount: 8850, currency: 'usd', currency_code: 'USD' },
      { authorizedCents: 8850, ...USD }
    )
    expect(check.matches).toBe(true)
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
    const check = verifyIntentAmount(
      { payment_total_amount: 8850, currency: 'usd', currency_code: 'USD' },
      { authorizedCents: expectedCents, ...USD }
    )
    expect(check.matches).toBe(true)
  })

  it('agrees end to end for M + M, one line of two units', () => {
    const items = packItems(M)
    const requested = cartToApiItems(items)
    const expectedCents = toCents(pricing(items).total)
    expect(expectedCents).toBe(8850)

    expect(validateOrderMatchesRequest(requested, { order_items: [orderItem(M.id, 2)] }).valid).toBe(true)
    expect(
      verifyIntentAmount({ payment_total_amount: 8850, currency: 'usd' }, { authorizedCents: expectedCents, ...USD }).matches
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
      verifyIntentAmount(
        { payment_total_amount: 5900, currency: 'usd' },
        { authorizedCents: expectedCents, ...USD }
      ).matches
    ).toBe(false)
  })

  it('stops when the intent would charge a different amount than the wallet showed', () => {
    const items = packItems()
    const expectedCents = toCents(pricing(items).total)
    const check = verifyIntentAmount(
      { payment_total_amount: 11800, currency: 'usd' },
      { authorizedCents: expectedCents, ...USD }
    )
    expect(check.matches).toBe(false)
    expect(check.chargeCents).toBe(11800)
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
