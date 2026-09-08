import type { PriceRule, Product, ProductVariant } from '@/lib/supabase'
import type { CartProductItem } from '@/contexts/CartContext'

export const UNIT_PRICE = 59

export const makeVariant = (
  size: string,
  overrides: Partial<ProductVariant> & Record<string, any> = {}
): ProductVariant => ({
  id: `variant-${size.toLowerCase()}`,
  title: size,
  price: UNIT_PRICE,
  options: { Size: size },
  inventory_quantity: 25,
  available: true,
  ...overrides,
} as any)

export const RODATA_ID = 'rodata-one'

export const makeProduct = (
  variants: ProductVariant[] = [makeVariant('S'), makeVariant('M'), makeVariant('L'), makeVariant('XL')],
  overrides: Record<string, any> = {}
): Product => ({
  id: RODATA_ID,
  title: 'Rodata One',
  slug: 'rodata-one',
  price: UNIT_PRICE,
  status: 'active',
  track_inventory: true,
  options: [{ name: 'Size', values: variants.map(v => v.title) }],
  variants,
  ...overrides,
} as any)

/** Mirrors the "Rider + Partner 2-Pack" volume rule: flat 25% off from 2 units. */
export const twoPackRule = (overrides: Partial<PriceRule> = {}): PriceRule => ({
  id: 'rule-two-pack',
  title: 'Rider + Partner 2-Pack',
  rule_type: 'volume',
  applies_to: 'specific_products',
  product_ids: [RODATA_ID],
  conditions: {
    discount_type: 'percentage',
    tier_mode: 'flat',
    tiers: [{ min_quantity: 2, discount_value: 25 }],
  },
  ...overrides,
} as PriceRule)

export const cartLine = (
  product: Product,
  variant: ProductVariant | undefined,
  quantity: number
): CartProductItem => ({
  type: 'product',
  key: `${product.id}${variant ? `:${variant.id}` : ''}`,
  product,
  variant,
  quantity,
})

/** Shape of an order_items row as checkout-create returns it. */
export const orderItem = (variantId: string | undefined, quantity: number) => ({
  product_id: RODATA_ID,
  ...(variantId ? { variant_id: variantId } : {}),
  quantity,
  price: UNIT_PRICE,
})
