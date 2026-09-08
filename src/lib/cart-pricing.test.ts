import { describe, expect, it } from 'vitest'
import { priceCartItems, getEligibleQuantities, cartItemsToPricingLines } from '@/lib/cart-pricing'
import { calcVolumeDiscount } from '@/lib/price-rule-utils'
import { formatMoney } from '@/lib/money'
import {
  UNIT_PRICE,
  cartLine,
  makeProduct,
  makeVariant,
  twoPackRule,
} from '@/lib/__fixtures__/rodata'

const M = makeVariant('M')
const L = makeVariant('L')
const product = makeProduct([M, L])
const rule = twoPackRule()

const price = (items: any[], rules = [rule]) =>
  priceCartItems(items, { volumeRules: rules, bogoRules: [] })

describe('volume eligibility across variants', () => {
  it('one belt pays full price', () => {
    const result = price([cartLine(product, M, 1)])
    expect(result.total).toBe(59)
    expect(result.savings).toBe(0)
  })

  it('two of the same size reach the tier', () => {
    const result = price([cartLine(product, M, 2)])
    expect(result.total).toBe(88.5)
  })

  it('an M and an L reach the tier together and pay the same as two M', () => {
    const mixed = price([cartLine(product, M, 1), cartLine(product, L, 1)])
    const same = price([cartLine(product, M, 2)])
    expect(mixed.total).toBe(88.5)
    expect(mixed.total).toBe(same.total)
  })

  it('keeps the two variants on separate lines while sharing the discount', () => {
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)])
    expect(result.lines.size).toBe(2)
    for (const line of result.lines.values()) {
      expect(line.quantity).toBe(1)
      expect(line.unitPrice).toBeCloseTo(44.25, 10)
      expect(line.volumeDiscount?.savingsLabel).toBe('25% OFF')
    }
  })

  it('applies the flat rule to three units instead of pairing them up', () => {
    const result = price([cartLine(product, M, 2), cartLine(product, L, 1)])
    expect(result.total).toBe(132.75)
    expect(result.total).toBe(price([cartLine(product, M, 3)]).total)
  })

  it('recalculates when one unit is removed from the cart', () => {
    const twoUnits = price([cartLine(product, M, 1), cartLine(product, L, 1)])
    const oneUnit = price([cartLine(product, M, 1)])
    expect(twoUnits.total).toBe(88.5)
    expect(oneUnit.total).toBe(59)
    expect(oneUnit.lines.get(cartLine(product, M, 1).key)?.volumeDiscount).toBeNull()
  })

  it('does not let an unrelated product trigger a Rodata-One-only rule', () => {
    const other = makeProduct([makeVariant('One Size', { id: 'other-variant' })], {
      id: 'other-product',
      title: 'Something else',
    })
    const result = price([
      cartLine(product, M, 1),
      cartLine(other, other.variants?.[0] as any, 5),
    ])
    expect(result.lines.get(cartLine(product, M, 1).key)?.unitPrice).toBe(UNIT_PRICE)
  })

  it('counts eligible units per rule, not per line', () => {
    const lines = cartItemsToPricingLines([cartLine(product, M, 1), cartLine(product, L, 1)])
    expect(getEligibleQuantities(lines, [rule]).get(rule.id)).toBe(2)
  })

  it('advertises nothing when no volume rule is available', () => {
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)], [])
    expect(result.total).toBe(118)
    expect(calcVolumeDiscount(UNIT_PRICE, 2, [])).toBeNull()
  })
})

describe('cent precision and presentation', () => {
  it('quotes the real 25%-off total, not a rounded one', () => {
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)])
    expect(formatMoney(result.total, 'USD', 'en-US')).toBe('$88.50')
  })

  it('keeps whole amounts free of decimals', () => {
    expect(formatMoney(59, 'USD', 'en-US')).toBe('$59')
  })

  it('never leaves float drift in the total', () => {
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1), cartLine(product, M, 0)])
    expect(Number.isInteger(Math.round(result.total * 100))).toBe(true)
    expect(result.total * 100).toBeCloseTo(8850, 6)
  })

  it('leaves the catalog price untouched — base and discount stay separate', () => {
    const line = cartLine(product, M, 2)
    price([line])
    expect(line.variant?.price).toBe(UNIT_PRICE)
    expect(line.product.price).toBe(UNIT_PRICE)
  })

  it('reports the base total alongside the discounted one', () => {
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)])
    expect(result.baseTotal).toBe(118)
    expect(result.savings).toBe(29.5)
  })
})

describe('other rule shapes are left alone', () => {
  it('honours a graduated rule across the eligible group', () => {
    const graduated = twoPackRule({
      id: 'graduated',
      conditions: {
        discount_type: 'percentage',
        tier_mode: 'graduated',
        tiers: [{ min_quantity: 2, discount_value: 50 }],
      },
    } as any)
    // Unit 1 full price, unit 2 half price → $88.50 across two belts.
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)], [graduated])
    expect(result.total).toBe(88.5)
  })

  it('honours a fixed-amount rule', () => {
    const fixed = twoPackRule({
      id: 'fixed',
      conditions: {
        discount_type: 'fixed',
        tier_mode: 'flat',
        tiers: [{ min_quantity: 2, discount_value: 10 }],
      },
    } as any)
    const result = price([cartLine(product, M, 1), cartLine(product, L, 1)], [fixed])
    expect(result.total).toBe(98)
  })

  it('does not price BOGO gift lines', () => {
    const gift = { ...cartLine(product, L, 1), key: 'bogo-gift:rodata-one', isBogoGift: true }
    const result = price([cartLine(product, M, 2), gift as any])
    expect(result.lines.get('bogo-gift:rodata-one')?.lineTotal).toBe(0)
    expect(result.total).toBe(88.5)
  })
})
