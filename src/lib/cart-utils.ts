import type { CartItem, CartProductItem } from '@/contexts/CartContext'
import type { CheckoutItem } from '@/lib/supabase'

/**
 * Decomposes cart items (including bundles) into flat API items
 * for checkout-create / checkout-update.
 * Merges duplicates by product_id + variant_id + selling_plan_id.
 */
export function cartToApiItems(cartItems: CartItem[]): CheckoutItem[] {
  const map = new Map<string, CheckoutItem>()

  for (const item of cartItems) {
    if (item.type === 'bundle') {
      for (const bi of item.bundleItems) {
        const key = `${bi.product.id}:${bi.variant?.id || ''}:`
        const qty = bi.quantity * item.quantity
        const existing = map.get(key)
        if (existing) {
          existing.quantity += qty
        } else {
          map.set(key, {
            product_id: bi.product.id,
            quantity: qty,
            ...(bi.variant && { variant_id: bi.variant.id }),
          })
        }
      }
    } else {
      // type === 'product' (or legacy without type)
      const productItem = item as CartProductItem
      const product = productItem.product
      const variant = productItem.variant
      const sellingPlan = productItem.sellingPlan
      const isCustomized = !!(productItem.customizationData || productItem.previewImageUrl)
      // Customized items never merge — use their unique cart key
      const key = isCustomized
        ? productItem.key
        : `${product.id}:${variant?.id || ''}:${sellingPlan?.id || ''}`
      const existing = !isCustomized ? map.get(key) : undefined
      if (existing) {
        existing.quantity += item.quantity
      } else {
        map.set(key, {
          product_id: product.id,
          quantity: item.quantity,
          ...(variant && { variant_id: variant.id }),
          ...(sellingPlan && { selling_plan_id: sellingPlan.id }),
          ...(productItem.customizationData && { customization_data: productItem.customizationData }),
          ...(productItem.previewImageUrl && { preview_image_url: productItem.previewImageUrl }),
        })
      }
    }
  }

  return Array.from(map.values())
}
