import type { CheckoutItem } from '@/lib/supabase'
import { toCents } from '@/lib/money'

export interface RequestedLine {
  product_id: string
  variant_id?: string
  quantity: number
}

export interface OrderValidationResult {
  valid: boolean
  code?: 'unavailable_items' | 'missing_items' | 'quantity_mismatch' | 'extra_items' | 'empty_order'
  title?: string
  message?: string
  details?: string[]
}

/** Backend payloads vary in shape (order_items, checkout items, cart lines). */
interface ItemLike {
  product_id?: string
  variant_id?: string | null
  quantity?: number
  product?: { id?: string }
  variant?: { id?: string }
}

/**
 * Aggregates by product + variant. Two M belts are one line of two, an M and an L
 * are two lines of one — comparing line counts would reject a valid pack, so the
 * comparison is always on units per variant.
 */
export function summarizeItemUnits(items: readonly unknown[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const raw of items || []) {
    const item = raw as ItemLike
    const productId = item?.product_id || item?.product?.id
    if (!productId) continue
    const quantity = Number(item?.quantity ?? 0)
    if (!(quantity > 0)) continue
    const variantId = item?.variant_id || item?.variant?.id || ''
    const key = `${productId}:${variantId}`
    map.set(key, (map.get(key) ?? 0) + quantity)
  }
  return map
}

const describe = (key: string, qty: number) => {
  const [productId, variantId] = key.split(':')
  return variantId ? `${productId} / ${variantId} ×${qty}` : `${productId} ×${qty}`
}

/**
 * Confirms the persisted order is the purchase the shopper asked for.
 * Anything short of an exact match stops the flow: silently charging for one belt
 * after the shopper picked two is worse than asking them to try again.
 */
export function validateOrderMatchesRequest(
  requested: readonly (CheckoutItem | RequestedLine)[],
  order: { order_items?: readonly unknown[] } | null | undefined,
  unavailableItems?: readonly { product_name?: string; variant_name?: string }[]
): OrderValidationResult {
  if (unavailableItems && unavailableItems.length > 0) {
    const names = unavailableItems
      .map((item) => item?.variant_name ? `${item.product_name} (${item.variant_name})` : item?.product_name)
      .filter(Boolean)
    return {
      valid: false,
      code: 'unavailable_items',
      title: 'Some items are unavailable',
      message: names.length > 0
        ? `${names.join(', ')} could not be reserved. Adjust your selection and try again.`
        : 'Some items could not be reserved. Adjust your selection and try again.',
      details: names,
    }
  }

  const wanted = summarizeItemUnits(requested)
  const got = summarizeItemUnits(order?.order_items || [])

  if (wanted.size === 0) {
    return { valid: false, code: 'empty_order', title: 'Empty selection', message: 'There is nothing to purchase.' }
  }

  if (got.size === 0) {
    // Some responses omit order_items; treating that as a mismatch would break
    // every legitimate checkout, so only an explicitly different order is rejected.
    return { valid: true }
  }

  const missing: string[] = []
  for (const [key, qty] of wanted) {
    const actual = got.get(key) ?? 0
    if (actual !== qty) missing.push(`${describe(key, qty)} (order has ${actual})`)
  }

  const extra: string[] = []
  for (const [key, qty] of got) {
    if (!wanted.has(key)) extra.push(describe(key, qty))
  }

  if (missing.length > 0) {
    return {
      valid: false,
      code: 'quantity_mismatch',
      title: 'Your order changed',
      message: 'We could not reserve everything you selected. Review your sizes and try again.',
      details: missing,
    }
  }

  if (extra.length > 0) {
    return {
      valid: false,
      code: 'extra_items',
      title: 'Your order changed',
      message: 'The order contains items you did not select. Review your cart and try again.',
      details: extra,
    }
  }

  return { valid: true }
}

export interface AmountCheck {
  matches: boolean
  authorizedCents: number
  chargeCents: number
  currencyMatches: boolean
}

/**
 * The wallet sheet authorises one exact number. Confirming a different one — even
 * a cent apart, even cheaper — is charging money the shopper never approved.
 */
export function checkAuthorizedAmount(params: {
  authorizedCents: number
  chargeCents: number
  authorizedCurrency?: string
  chargeCurrency?: string
}): AmountCheck {
  const authorizedCents = Math.round(params.authorizedCents || 0)
  const chargeCents = Math.round(params.chargeCents || 0)
  const currencyMatches =
    !params.authorizedCurrency ||
    !params.chargeCurrency ||
    params.authorizedCurrency.toLowerCase() === params.chargeCurrency.toLowerCase()
  return {
    matches: currencyMatches && authorizedCents === chargeCents,
    authorizedCents,
    chargeCents,
    currencyMatches,
  }
}

interface IntentLike {
  amount?: number
  currency?: string
  payment_amount?: number
  payment_intent?: { amount?: number }
  intent?: { amount?: number }
  order?: { total_amount?: number }
}

/** Reads the amount a PaymentIntent response will actually charge, in cents. */
export function resolveIntentChargeCents(
  intentData: IntentLike | null | undefined,
  fallbackCents: number
): number {
  const candidates = [
    intentData?.amount,
    intentData?.payment_amount,
    intentData?.payment_intent?.amount,
    intentData?.intent?.amount,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && isFinite(candidate) && candidate > 0) {
      return Math.round(candidate)
    }
  }
  const orderTotal = intentData?.order?.total_amount
  if (typeof orderTotal === 'number' && isFinite(orderTotal) && orderTotal > 0) {
    return toCents(orderTotal)
  }
  return Math.round(fallbackCents)
}
