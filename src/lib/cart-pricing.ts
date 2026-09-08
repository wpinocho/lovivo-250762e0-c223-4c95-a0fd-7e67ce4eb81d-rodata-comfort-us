import type { PriceRule, SellingPlan } from '@/lib/supabase'
import type { CartItem, CartProductItem } from '@/contexts/CartContext'
import {
  calcItemUnitPrice,
  ruleAppliesToProduct,
  type BogoDiscountResult,
  type VolumeDiscountResult,
} from '@/lib/price-rule-utils'
import { roundMoney, toCents, fromCents } from '@/lib/money'

/**
 * One priceable row. Kept structural (not tied to CartItem) so the product page
 * can price a selection it has not added to the cart yet.
 */
export interface PricingLine {
  key: string
  productId?: string
  collectionIds?: string[]
  basePrice: number
  quantity: number
  sellingPlan?: SellingPlan | null
  isBogoGift?: boolean
  isBundle?: boolean
}

export interface PricedLine {
  key: string
  /** Price of one unit after the best applicable rule. */
  unitPrice: number
  /** unitPrice × quantity, snapped to cents. */
  lineTotal: number
  /** Undiscounted quantity × basePrice, snapped to cents. */
  lineBaseTotal: number
  quantity: number
  volumeDiscount: VolumeDiscountResult | null
  bogoDiscount: BogoDiscountResult | null
}

export interface CartPricing {
  lines: Map<string, PricedLine>
  /** Sum of every line total, discounts included. */
  total: number
  /** Sum of every line at catalog price. */
  baseTotal: number
  savings: number
}

interface PricingContext {
  volumeRules: PriceRule[]
  bogoRules?: PriceRule[]
  calcSubscriptionPriceFn?: (price: number, plan: SellingPlan) => number
}

const EMPTY_PRICED_LINE = (line: PricingLine, unitPrice: number): PricedLine => ({
  key: line.key,
  unitPrice,
  lineTotal: roundMoney(unitPrice * line.quantity),
  lineBaseTotal: roundMoney(line.basePrice * line.quantity),
  quantity: line.quantity,
  volumeDiscount: null,
  bogoDiscount: null,
})

/**
 * Adds up, per rule, every unit that falls inside that rule's scope. This is what
 * makes an M and an L reach a two-unit tier together, and it is also why an
 * unrelated product cannot trigger a Rodata-One-only rule.
 */
export function getEligibleQuantities(
  lines: PricingLine[],
  volumeRules: PriceRule[]
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const rule of volumeRules) {
    let qty = 0
    for (const line of lines) {
      if (line.isBundle || line.isBogoGift || !line.productId) continue
      if (line.quantity <= 0) continue
      if (ruleAppliesToProduct(rule, line.productId, line.collectionIds)) {
        qty += line.quantity
      }
    }
    totals.set(rule.id, qty)
  }
  return totals
}

/**
 * Prices a whole set of lines at once. Line prices, savings labels and the grand
 * total all come from here so the sidebar, the cart page and the product page can
 * never disagree about what the promotion is worth.
 */
export function priceCartLines(lines: PricingLine[], ctx: PricingContext): CartPricing {
  const volumeRules = ctx.volumeRules || []
  const bogoRules = ctx.bogoRules || []
  const eligible = getEligibleQuantities(lines, volumeRules)
  const resolver = (rule: PriceRule) => eligible.get(rule.id) ?? 0

  const priced = new Map<string, PricedLine>()
  let totalCents = 0
  let baseCents = 0

  for (const line of lines) {
    if (line.quantity <= 0) continue

    if (line.isBogoGift) {
      const free = EMPTY_PRICED_LINE({ ...line, basePrice: 0 }, 0)
      priced.set(line.key, { ...free, lineBaseTotal: roundMoney(line.basePrice * line.quantity) })
      continue
    }

    if (line.isBundle || !line.productId) {
      const flat = EMPTY_PRICED_LINE(line, line.basePrice)
      priced.set(line.key, flat)
      totalCents += toCents(flat.lineTotal)
      baseCents += toCents(flat.lineBaseTotal)
      continue
    }

    const lineVolumeRules = volumeRules.filter(r =>
      ruleAppliesToProduct(r, line.productId!, line.collectionIds)
    )
    const lineBogoRules = bogoRules.filter(r =>
      ruleAppliesToProduct(r, line.productId!, line.collectionIds)
    )

    const { unitPrice, volumeDiscount, bogoDiscount } = calcItemUnitPrice(
      line.basePrice,
      line.quantity,
      lineVolumeRules,
      line.sellingPlan || null,
      ctx.calcSubscriptionPriceFn,
      lineBogoRules,
      resolver
    )

    const entry: PricedLine = {
      key: line.key,
      unitPrice,
      lineTotal: roundMoney(unitPrice * line.quantity),
      lineBaseTotal: roundMoney(line.basePrice * line.quantity),
      quantity: line.quantity,
      volumeDiscount,
      bogoDiscount,
    }
    priced.set(line.key, entry)
    totalCents += toCents(entry.lineTotal)
    baseCents += toCents(entry.lineBaseTotal)
  }

  return {
    lines: priced,
    total: fromCents(totalCents),
    baseTotal: fromCents(baseCents),
    savings: fromCents(Math.max(0, baseCents - totalCents)),
  }
}

/** Maps cart items (products and bundles) onto priceable lines. */
export function cartItemsToPricingLines(items: CartItem[]): PricingLine[] {
  return items.map((item) => {
    if (item.type === 'bundle') {
      return {
        key: item.key,
        basePrice: item.bundle.bundle_price,
        quantity: item.quantity,
        isBundle: true,
      }
    }
    const productItem = item as CartProductItem
    return {
      key: productItem.key,
      productId: productItem.product.id,
      collectionIds: (productItem.product as { collection_ids?: string[] })?.collection_ids,
      basePrice: (productItem.variant?.price ?? productItem.product.price) || 0,
      quantity: productItem.quantity,
      sellingPlan: productItem.sellingPlan,
      isBogoGift: productItem.isBogoGift,
    }
  })
}

export function priceCartItems(items: CartItem[], ctx: PricingContext): CartPricing {
  return priceCartLines(cartItemsToPricingLines(items), ctx)
}
