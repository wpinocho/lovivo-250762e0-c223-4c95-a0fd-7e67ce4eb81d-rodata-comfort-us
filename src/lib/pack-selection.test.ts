import { describe, expect, it } from 'vitest'
import {
  buildSelectedPurchaseItems,
  getRequiredUnitsByVariant,
  getVariantAvailableUnits,
  validatePurchaseSelection,
} from '@/lib/pack-selection'
import { cartToApiItems } from '@/lib/cart-utils'
import { makeProduct, makeVariant, RODATA_ID } from '@/lib/__fixtures__/rodata'

const S = makeVariant('S')
const M = makeVariant('M')
const L = makeVariant('L')
const XL = makeVariant('XL')
const product = makeProduct([S, M, L, XL])

const selection = (overrides: Record<string, any> = {}) => ({
  product,
  packQuantity: 1,
  firstVariant: M,
  secondVariant: undefined,
  sellingPlan: null,
  hasVariants: true,
  ...overrides,
}) as any

describe('buildSelectedPurchaseItems', () => {
  it('one belt in M is a single unit of the M variant', () => {
    const items = buildSelectedPurchaseItems(selection())
    expect(items).toHaveLength(1)
    expect(items[0].variant?.id).toBe(M.id)
    expect(items[0].quantity).toBe(1)
  })

  it('two belts in M and L keep both variants, one unit each', () => {
    const items = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: L }))
    expect(items.map(i => [i.variant?.id, i.quantity])).toEqual([
      [M.id, 1],
      [L.id, 1],
    ])
  })

  it('two belts in the same size collapse into one line of two', () => {
    const items = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: M }))
    expect(items).toHaveLength(1)
    expect(items[0].variant?.id).toBe(M.id)
    expect(items[0].quantity).toBe(2)
  })

  it('changing one belt never rewrites the other', () => {
    const mAndL = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: L }))
    const sAndL = buildSelectedPurchaseItems(selection({ packQuantity: 2, firstVariant: S, secondVariant: L }))
    const mAndXl = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: XL }))

    expect(mAndL.map(i => i.variant?.id)).toEqual([M.id, L.id])
    expect(sAndL.map(i => i.variant?.id)).toEqual([S.id, L.id])
    expect(mAndXl.map(i => i.variant?.id)).toEqual([M.id, XL.id])
  })

  it('going back to one belt only sends the first unit', () => {
    const items = buildSelectedPurchaseItems(selection({ packQuantity: 1, secondVariant: L }))
    expect(items).toHaveLength(1)
    expect(items[0].variant?.id).toBe(M.id)
    expect(items[0].quantity).toBe(1)
  })

  it('returns nothing when the pack is incomplete, so no caller can send half a pack', () => {
    expect(buildSelectedPurchaseItems(selection({ packQuantity: 2 }))).toEqual([])
    expect(buildSelectedPurchaseItems(selection({ firstVariant: undefined }))).toEqual([])
  })

  it('feeds cartToApiItems without any extra conversion', () => {
    const apiItems = cartToApiItems(
      buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: L }))
    )
    expect(apiItems).toEqual([
      { product_id: RODATA_ID, quantity: 1, variant_id: M.id },
      { product_id: RODATA_ID, quantity: 1, variant_id: L.id },
    ])
  })

  it('merges same-size duplicates through cartToApiItems too', () => {
    const apiItems = cartToApiItems(
      buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: M }))
    )
    expect(apiItems).toEqual([{ product_id: RODATA_ID, quantity: 2, variant_id: M.id }])
  })

  it('handles products without variants', () => {
    const simple = makeProduct([], { options: [], variants: [] })
    const items = buildSelectedPurchaseItems({
      product: simple,
      packQuantity: 2,
      hasVariants: false,
    } as any)
    expect(items).toHaveLength(1)
    expect(items[0].variant).toBeUndefined()
    expect(items[0].quantity).toBe(2)
  })
})

describe('getVariantAvailableUnits', () => {
  it('is unbounded when the store does not track inventory', () => {
    const soldOut = makeVariant('M', { inventory_quantity: 0, available: false })
    expect(getVariantAvailableUnits(soldOut, false)).toBe(Number.POSITIVE_INFINITY)
  })

  it('reports the tracked stock count', () => {
    expect(getVariantAvailableUnits(makeVariant('M', { inventory_quantity: 1 }), true)).toBe(1)
  })

  it('is zero for an unavailable variant', () => {
    expect(getVariantAvailableUnits(makeVariant('M', { available: false }), true)).toBe(0)
  })
})

describe('validatePurchaseSelection', () => {
  it('accepts a single belt without demanding a second size', () => {
    expect(validatePurchaseSelection(selection())).toEqual({ valid: true })
  })

  it('requires the second size to be chosen explicitly', () => {
    const result = validatePurchaseSelection(selection({ packQuantity: 2 }))
    expect(result.valid).toBe(false)
    expect(result.issue).toBe('missing_second_variant')
  })

  it('accepts a complete pack', () => {
    expect(validatePurchaseSelection(selection({ packQuantity: 2, secondVariant: L })).valid).toBe(true)
  })

  it('rejects two of the same size when only one is in stock', () => {
    const scarce = makeVariant('M', { inventory_quantity: 1 })
    const scarceProduct = makeProduct([S, scarce, L, XL])
    const result = validatePurchaseSelection(
      selection({ product: scarceProduct, packQuantity: 2, firstVariant: scarce, secondVariant: scarce })
    )
    expect(result.valid).toBe(false)
    expect(result.issue).toBe('insufficient_stock')
  })

  it('still allows one unit when only one is in stock', () => {
    const scarce = makeVariant('M', { inventory_quantity: 1 })
    expect(validatePurchaseSelection(selection({ firstVariant: scarce })).valid).toBe(true)
  })

  it('rejects a sold-out second size', () => {
    const soldOut = makeVariant('L', { available: false, inventory_quantity: 0 })
    const result = validatePurchaseSelection(
      selection({ packQuantity: 2, secondVariant: soldOut })
    )
    expect(result.valid).toBe(false)
    expect(result.issue).toBe('insufficient_stock')
  })

  it('does not block on inventory the store does not track', () => {
    const soldOut = makeVariant('L', { available: false, inventory_quantity: 0 })
    const result = validatePurchaseSelection(
      selection({ packQuantity: 2, secondVariant: soldOut }),
      { trackInventory: false }
    )
    expect(result.valid).toBe(true)
  })
})

describe('getRequiredUnitsByVariant', () => {
  it('counts two units for the same size picked twice', () => {
    const items = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: M }))
    expect(getRequiredUnitsByVariant(items).get(M.id)).toBe(2)
  })

  it('counts one unit per size for mixed sizes', () => {
    const items = buildSelectedPurchaseItems(selection({ packQuantity: 2, secondVariant: L }))
    const units = getRequiredUnitsByVariant(items)
    expect(units.get(M.id)).toBe(1)
    expect(units.get(L.id)).toBe(1)
  })
})
