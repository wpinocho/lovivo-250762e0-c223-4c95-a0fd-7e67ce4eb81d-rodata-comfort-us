import type { CartProductItem } from '@/contexts/CartContext'
import type { Product, ProductVariant, SellingPlan } from '@/lib/supabase'
import { isVariantAvailable } from '@/lib/utils'

/**
 * Everything the product page knows about what the shopper is buying right now.
 * Each belt keeps its own variant — the second size is never a note or a free-text
 * field, because the order has to carry two real variants through to fulfilment.
 */
export interface PurchaseSelection {
  product: Product
  /** 1 = single belt, 2 = the two-belt pack. */
  packQuantity: number
  firstVariant?: ProductVariant
  /** Only meaningful when packQuantity is 2. */
  secondVariant?: ProductVariant
  sellingPlan?: SellingPlan | null
  hasVariants: boolean
}

export type SelectionIssue =
  | 'missing_first_variant'
  | 'missing_second_variant'
  | 'insufficient_stock'

export interface SelectionValidation {
  valid: boolean
  issue?: SelectionIssue
  title?: string
  message?: string
}

const cartKeyFor = (
  product: Product,
  variant?: ProductVariant,
  sellingPlan?: SellingPlan | null
) => `${product.id}${variant ? `:${variant.id}` : ''}${sellingPlan ? `:${sellingPlan.id}` : ''}`

/**
 * The single place the buy paths agree on what is being purchased.
 *
 *   One belt, M          → Rodata One / M / qty 1
 *   Two belts, M and L   → Rodata One / M / qty 1 + Rodata One / L / qty 1
 *   Two belts, M and M   → Rodata One / M / qty 2
 *
 * Returns an empty list when the selection is incomplete, so no caller can
 * accidentally send half a pack.
 */
export function buildSelectedPurchaseItems(selection: PurchaseSelection): CartProductItem[] {
  const { product, packQuantity, firstVariant, secondVariant, sellingPlan, hasVariants } = selection
  if (!product) return []

  const packSize = packQuantity >= 2 ? 2 : 1

  if (!hasVariants) {
    return [{
      type: 'product',
      key: cartKeyFor(product, undefined, sellingPlan),
      product,
      variant: undefined,
      sellingPlan: sellingPlan || undefined,
      quantity: packSize,
    }]
  }

  if (!firstVariant) return []

  if (packSize === 1) {
    return [{
      type: 'product',
      key: cartKeyFor(product, firstVariant, sellingPlan),
      product,
      variant: firstVariant,
      sellingPlan: sellingPlan || undefined,
      quantity: 1,
    }]
  }

  if (!secondVariant) return []

  // Same size twice collapses into one line of two, which is exactly what
  // cartToApiItems() would produce anyway.
  if (secondVariant.id === firstVariant.id) {
    return [{
      type: 'product',
      key: cartKeyFor(product, firstVariant, sellingPlan),
      product,
      variant: firstVariant,
      sellingPlan: sellingPlan || undefined,
      quantity: 2,
    }]
  }

  return [
    {
      type: 'product',
      key: cartKeyFor(product, firstVariant, sellingPlan),
      product,
      variant: firstVariant,
      sellingPlan: sellingPlan || undefined,
      quantity: 1,
    },
    {
      type: 'product',
      key: cartKeyFor(product, secondVariant, sellingPlan),
      product,
      variant: secondVariant,
      sellingPlan: sellingPlan || undefined,
      quantity: 1,
    },
  ]
}

/** Units required per variant id across the whole selection. */
export function getRequiredUnitsByVariant(items: CartProductItem[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const item of items) {
    const id = item.variant?.id
    if (!id) continue
    map.set(id, (map.get(id) ?? 0) + item.quantity)
  }
  return map
}

/**
 * How many units of a variant we can still promise.
 * Returns Infinity when the store does not track inventory, so a shop that never
 * counts stock is not blocked by numbers it does not maintain.
 */
export function getVariantAvailableUnits(
  variant: (Partial<ProductVariant> & { inventory_quantity?: number; available?: boolean }) | undefined,
  trackInventory: boolean = true
): number {
  if (trackInventory === false) return Number.POSITIVE_INFINITY
  if (!variant) return 0
  if (!isVariantAvailable(variant)) return 0
  if (typeof variant.inventory_quantity === 'number') {
    // Never fall below what isVariantAvailable() already promised for one unit.
    return Math.max(1, variant.inventory_quantity)
  }
  return Number.POSITIVE_INFINITY
}

export function validatePurchaseSelection(
  selection: PurchaseSelection,
  options: { trackInventory?: boolean } = {}
): SelectionValidation {
  const { product, packQuantity, firstVariant, secondVariant, hasVariants } = selection
  const trackInventory = options.trackInventory !== false

  if (!product) {
    return { valid: false, issue: 'missing_first_variant', title: 'Select a size', message: 'Pick an available size before continuing.' }
  }

  if (hasVariants && !firstVariant) {
    return {
      valid: false,
      issue: 'missing_first_variant',
      title: packQuantity >= 2 ? 'Select the first belt size' : 'Select a size',
      message: 'Pick an available size before continuing.',
    }
  }

  if (packQuantity >= 2 && hasVariants && !secondVariant) {
    return {
      valid: false,
      issue: 'missing_second_variant',
      title: 'Select the second belt size',
      message: 'Choose a size for the second belt before continuing.',
    }
  }

  const items = buildSelectedPurchaseItems(selection)
  if (items.length === 0) {
    return {
      valid: false,
      issue: 'missing_first_variant',
      title: 'Select a size',
      message: 'Pick an available size before continuing.',
    }
  }

  const required = getRequiredUnitsByVariant(items)
  for (const item of items) {
    if (!item.variant) continue
    const need = required.get(item.variant.id) ?? item.quantity
    if (getVariantAvailableUnits(item.variant, trackInventory) < need) {
      return {
        valid: false,
        issue: 'insufficient_stock',
        title: 'Not enough stock',
        message: need > 1
          ? `We don't have ${need} units of ${item.variant.title || 'that size'} available. Pick a different size for the second belt.`
          : `${item.variant.title || 'That size'} is out of stock.`,
      }
    }
  }

  return { valid: true }
}
