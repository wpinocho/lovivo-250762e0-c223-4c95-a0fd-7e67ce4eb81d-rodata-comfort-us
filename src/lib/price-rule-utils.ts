import type { PriceRule, BogoConditions } from '@/lib/supabase'

export interface VolumeDiscountResult {
  discountedPrice: number
  originalPrice: number
  savingsLabel: string
}

/**
 * Resolves how many units count towards a rule's tiers. A two-belt pack in sizes
 * M and L sits on two cart lines of one unit each, but the backend adds up every
 * unit inside the rule's scope — so tier eligibility must be asked per rule, not
 * read off the line.
 */
export type EligibleQuantityResolver = (rule: PriceRule) => number

/** True when the rule's scope covers this product. Mirrors usePriceRules filtering. */
export function ruleAppliesToProduct(
  rule: PriceRule,
  productId: string,
  collectionIds?: string[]
): boolean {
  if (!rule) return false
  if (rule.applies_to === 'all') return true
  if (rule.applies_to === 'specific_products') return !!rule.product_ids?.includes(productId)
  if (rule.applies_to === 'specific_collections') {
    return !!(collectionIds && rule.collection_ids?.some(cid => collectionIds.includes(cid)))
  }
  return false
}

/**
 * Calcula el descuento de volumen aplicable para un producto dado su precio base,
 * cantidad en el carrito y las reglas de volumen que le aplican.
 * Retorna null si no aplica ningún descuento.
 *
 * `eligibleQuantityFor` decide cuántas unidades activan los tiers de cada regla
 * (por defecto, la cantidad del renglón). El precio resultante siempre se aplica
 * a `quantity` unidades de este renglón.
 */
export function calcVolumeDiscount(
  basePrice: number,
  quantity: number,
  volumeRules: PriceRule[],
  eligibleQuantityFor?: EligibleQuantityResolver
): VolumeDiscountResult | null {
  if (!volumeRules.length || quantity < 1) return null

  let bestDiscount: VolumeDiscountResult | null = null
  let bestSavings = 0

  for (const rule of volumeRules) {
    const conditions = rule.conditions as any
    if (!conditions?.tiers?.length) continue

    const eligibleQuantity = Math.max(
      quantity,
      eligibleQuantityFor ? (eligibleQuantityFor(rule) || 0) : quantity
    )

    const discountType = conditions.discount_type || 'percentage'
    const tierMode = conditions.tier_mode || 'flat'
    const sortedTiers = (conditions.tiers as any[])
      .slice()
      .sort((a: any, b: any) => (a.min_quantity || 0) - (b.min_quantity || 0))

    if (tierMode === 'graduated') {
      // Graduated: each unit gets the discount of its tier bracket.
      // Units are indexed across the whole eligible group, then the resulting
      // average unit price is what this line pays.
      let totalCost = 0
      let maxDiscountValue = 0

      for (let u = 1; u <= eligibleQuantity; u++) {
        // Find the highest tier where u >= min_quantity
        let tierForUnit: any = null
        for (const t of sortedTiers) {
          if (u >= (t.min_quantity || 0)) tierForUnit = t
        }

        if (tierForUnit) {
          const dv = tierForUnit.discount_value || 0
          if (dv > maxDiscountValue) maxDiscountValue = dv
          if (discountType === 'percentage') {
            totalCost += basePrice * (1 - dv / 100)
          } else {
            totalCost += Math.max(0, basePrice - dv)
          }
        } else {
          totalCost += basePrice
        }
      }

      const avgUnitPrice = totalCost / eligibleQuantity
      const savings = (basePrice - avgUnitPrice) * quantity
      if (savings > bestSavings) {
        bestSavings = savings
        const label = discountType === 'percentage'
          ? `hasta ${maxDiscountValue}% OFF`
          : `-$${maxDiscountValue}`
        bestDiscount = {
          discountedPrice: avgUnitPrice,
          originalPrice: basePrice,
          savingsLabel: label,
        }
      }
    } else {
      // Flat: single tier applies to all units
      const applicableTiers = sortedTiers
        .filter((t: any) => eligibleQuantity >= (t.min_quantity || 0))
        .sort((a: any, b: any) => (b.min_quantity || 0) - (a.min_quantity || 0))

      const tier = applicableTiers[0]
      if (!tier) continue

      const discountValue = tier.discount_value || 0
      let discountedPrice: number
      let label: string

      if (discountType === 'percentage') {
        discountedPrice = basePrice * (1 - discountValue / 100)
        label = `${discountValue}% OFF`
      } else {
        discountedPrice = Math.max(0, basePrice - discountValue)
        label = `-$${discountValue}`
      }

      const savings = (basePrice - discountedPrice) * quantity
      if (savings > bestSavings) {
        bestSavings = savings
        bestDiscount = {
          discountedPrice,
          originalPrice: basePrice,
          savingsLabel: label,
        }
      }
    }
  }

  return bestDiscount
}

/**
 * Calcula el descuento BOGO para same_product.
 * Retorna el precio unitario promedio considerando unidades gratis.
 */
export interface BogoDiscountResult {
  discountedPrice: number
  originalPrice: number
  savingsLabel: string
}

export function calcBogoDiscount(
  basePrice: number,
  quantity: number,
  bogoRules: PriceRule[]
): BogoDiscountResult | null {
  if (!bogoRules.length || quantity < 1) return null

  for (const rule of bogoRules) {
    const cond = rule.conditions as BogoConditions | undefined
    if (!cond || cond.bogo_mode !== 'same_product') continue

    const { buy_quantity, get_quantity, get_discount_percentage } = cond
    const groupSize = buy_quantity + get_quantity
    if (quantity < groupSize) continue

    // How many full groups + remainder
    const fullGroups = Math.floor(quantity / groupSize)
    const remainder = quantity % groupSize

    // Cost per group: buy_quantity at full price + get_quantity at discounted price
    const discountFraction = get_discount_percentage / 100
    const costPerGroup = (buy_quantity * basePrice) + (get_quantity * basePrice * (1 - discountFraction))
    const totalCost = (fullGroups * costPerGroup) + (remainder * basePrice)
    const avgPrice = totalCost / quantity

    if (avgPrice < basePrice) {
      const label = get_discount_percentage === 100
        ? `${buy_quantity}x${buy_quantity + get_quantity} aplicado`
        : `BOGO ${get_discount_percentage}% OFF`
      return {
        discountedPrice: avgPrice,
        originalPrice: basePrice,
        savingsLabel: label,
      }
    }
  }

  return null
}

/**
 * Calcula el precio unitario de un item del carrito considerando suscripción + volumen + BOGO.
 */
export function calcItemUnitPrice(
  basePrice: number,
  quantity: number,
  volumeRules: PriceRule[],
  sellingPlan?: any,
  calcSubscriptionPriceFn?: (price: number, plan: any) => number,
  bogoRules?: PriceRule[],
  eligibleQuantityFor?: EligibleQuantityResolver
): { unitPrice: number; volumeDiscount: VolumeDiscountResult | null; bogoDiscount: BogoDiscountResult | null } {
  let price = basePrice
  if (sellingPlan && calcSubscriptionPriceFn) {
    price = calcSubscriptionPriceFn(basePrice, sellingPlan)
  }

  const volumeDiscount = calcVolumeDiscount(price, quantity, volumeRules, eligibleQuantityFor)
  const bogoDiscount = bogoRules ? calcBogoDiscount(price, quantity, bogoRules) : null

  // Pick the best discount
  let unitPrice = price
  if (volumeDiscount && bogoDiscount) {
    unitPrice = Math.min(volumeDiscount.discountedPrice, bogoDiscount.discountedPrice)
  } else if (volumeDiscount) {
    unitPrice = volumeDiscount.discountedPrice
  } else if (bogoDiscount) {
    unitPrice = bogoDiscount.discountedPrice
  }

  return { unitPrice, volumeDiscount, bogoDiscount }
}
