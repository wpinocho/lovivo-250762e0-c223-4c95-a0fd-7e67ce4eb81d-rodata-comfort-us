import type { CheckoutItem } from '@/lib/supabase'
import { toCents } from '@/lib/money'

export interface RequestedLine {
  product_id: string
  variant_id?: string
  quantity: number
}

export type OrderValidationCode =
  | 'unavailable_items'
  | 'quantity_mismatch'
  | 'extra_items'
  | 'empty_order'
  | 'empty_selection'
  | 'unverifiable_order'

export interface OrderValidationResult {
  valid: boolean
  /**
   * False when the response never carried the order's items: nothing was
   * compared, so the purchase is unconfirmed rather than approved.
   */
  verifiable: boolean
  code?: OrderValidationCode
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

interface OrderShape {
  order_items?: unknown
  order?: { order_items?: unknown } | null
}

/**
 * Normalises the two shapes the backend actually returns: the order nested under
 * `order`, or `order_items` at the root. Returns null when neither is present —
 * that is "unknown", not "empty".
 */
export function extractOrderItems(source: unknown): readonly unknown[] | null {
  if (!source || typeof source !== 'object') return null
  const shape = source as OrderShape
  const nested = shape.order
  if (nested && typeof nested === 'object' && Array.isArray(nested.order_items)) {
    return nested.order_items
  }
  if (Array.isArray(shape.order_items)) return shape.order_items
  return null
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
  order: unknown,
  unavailableItems?: readonly { product_name?: string; variant_name?: string }[]
): OrderValidationResult {
  if (unavailableItems && unavailableItems.length > 0) {
    const names = unavailableItems
      .map((item) => item?.variant_name ? `${item.product_name} (${item.variant_name})` : item?.product_name)
      .filter(Boolean)
    return {
      valid: false,
      verifiable: true,
      code: 'unavailable_items',
      title: 'Some items are unavailable',
      message: names.length > 0
        ? `${names.join(', ')} could not be confirmed. Adjust your selection and try again.`
        : 'Some items could not be confirmed. Adjust your selection and try again.',
      details: names,
    }
  }

  const wanted = summarizeItemUnits(requested)

  if (wanted.size === 0) {
    return {
      valid: false,
      verifiable: true,
      code: 'empty_selection',
      title: 'Empty selection',
      message: 'There is nothing to purchase.',
    }
  }

  const orderItems = extractOrderItems(order)

  if (orderItems === null) {
    // The response carried only the order reference. Callers re-read the order
    // once before deciding; approving it here would be approving nothing.
    return {
      valid: false,
      verifiable: false,
      code: 'unverifiable_order',
      title: 'We could not confirm your order',
      message: 'We could not read your order back to confirm it. Please try again.',
    }
  }

  const got = summarizeItemUnits(orderItems)

  if (got.size === 0) {
    return {
      valid: false,
      verifiable: true,
      code: 'empty_order',
      title: 'Your order changed',
      message: 'Your order came back empty. Review your selection and try again.',
    }
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
      verifiable: true,
      code: 'quantity_mismatch',
      title: 'Your order changed',
      message: 'We could not confirm everything you selected. Review your sizes and try again.',
      details: missing,
    }
  }

  if (extra.length > 0) {
    return {
      valid: false,
      verifiable: true,
      code: 'extra_items',
      title: 'Your order changed',
      message: 'The order contains items you did not select. Review your cart and try again.',
      details: extra,
    }
  }

  return { valid: true, verifiable: true }
}

// ─── Amounts ────────────────────────────────────────────────────────────────
// Two different units live here and must never be mixed: orders persist their
// total in the currency's main unit (88.5 ⇒ $88.50), payments are quoted in
// cents (8850 ⇒ $88.50).

export type ChargeSource = 'payment_total_amount' | 'order_total_amount'
export type ChargeIssue = 'missing_amount' | 'invalid_amount'

export interface ChargeResolution {
  /** True only when a server-side amount was actually read. */
  verifiable: boolean
  chargeCents: number | null
  currency: string | null
  source: ChargeSource | null
  issue?: ChargeIssue
}

/** Order record, whose `total_amount` is in the currency's main unit. */
export interface OrderAmountLike {
  total_amount?: unknown
  currency_code?: unknown
}

/** `payments-create-intent` response: `payment_total_amount` is already in cents. */
export interface IntentResponseLike {
  payment_total_amount?: unknown
  currency?: unknown
  currency_code?: unknown
  order?: OrderAmountLike | null
}

const readCurrency = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim().toLowerCase()
  }
  return null
}

/** A payable amount must be a real, positive number — not a string, not zero, not NaN. */
const readAmount = (value: unknown): number | ChargeIssue => {
  if (value === undefined || value === null) return 'missing_amount'
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 'invalid_amount'
  return value
}

/** Converts a persisted order total (main unit) into the cents it will charge. */
export function resolveOrderCharge(order: OrderAmountLike | null | undefined): ChargeResolution {
  const currency = readCurrency(order?.currency_code)
  const amount = readAmount(order?.total_amount)
  if (typeof amount !== 'number') {
    return { verifiable: false, chargeCents: null, currency, source: null, issue: amount }
  }
  const cents = toCents(amount)
  if (cents <= 0) {
    return { verifiable: false, chargeCents: null, currency, source: null, issue: 'invalid_amount' }
  }
  return { verifiable: true, chargeCents: cents, currency, source: 'order_total_amount' }
}

/**
 * Reads what a PaymentIntent response will actually charge.
 *
 * `payment_total_amount` wins over everything else — it is the number the
 * provider was told to charge. There is deliberately no fallback to a value the
 * browser computed: comparing our own expectation against itself verifies nothing.
 */
export function resolveIntentCharge(
  intent: IntentResponseLike | null | undefined
): ChargeResolution {
  const currency = readCurrency(intent?.currency, intent?.currency_code, intent?.order?.currency_code)
  const payment = readAmount(intent?.payment_total_amount)

  if (typeof payment === 'number') {
    if (!Number.isInteger(payment)) {
      return { verifiable: false, chargeCents: null, currency, source: null, issue: 'invalid_amount' }
    }
    return { verifiable: true, chargeCents: payment, currency, source: 'payment_total_amount' }
  }

  if (payment === 'invalid_amount') {
    return { verifiable: false, chargeCents: null, currency, source: null, issue: 'invalid_amount' }
  }

  const fromOrder = resolveOrderCharge(intent?.order)
  return { ...fromOrder, currency: currency ?? fromOrder.currency }
}

export type AmountIssue = ChargeIssue | 'missing_currency' | 'currency_mismatch' | 'amount_mismatch'

export interface AmountCheck {
  matches: boolean
  /** False when the server amount or currency could not be read at all. */
  verifiable: boolean
  authorizedCents: number
  chargeCents: number | null
  chargeCurrency: string | null
  currencyMatches: boolean
  issue?: AmountIssue
  title?: string
  message?: string
  /**
   * True only for a plain amount change in the same currency — the one case a
   * wallet or CTA can honestly re-quote and ask the shopper to approve again.
   */
  reauthorizable: boolean
}

export const formatChargeAmount = (cents: number, currency: string | null): string =>
  `${(currency || '').toUpperCase()} $${(cents / 100).toFixed(2)}`.trim()

const UNVERIFIABLE_COPY = {
  title: 'We could not confirm the amount',
  message: 'We could not confirm the amount to charge, so nothing was charged. Please try again.',
}

/**
 * The shopper approved one exact number in one exact currency. Confirming any
 * other one — a cent apart, cheaper, or in another currency — is charging money
 * they never approved. An amount we cannot read is not a match either.
 */
export function checkAuthorizedAmount(params: {
  authorizedCents: number
  chargeCents: number | null
  authorizedCurrency: string | null
  chargeCurrency: string | null
  issue?: ChargeIssue
}): AmountCheck {
  const authorizedCents = Math.round(params.authorizedCents || 0)
  const authorizedCurrency = readCurrency(params.authorizedCurrency)
  const chargeCurrency = readCurrency(params.chargeCurrency)
  const base = {
    authorizedCents,
    chargeCents: params.chargeCents,
    chargeCurrency,
    reauthorizable: false,
  }

  if (params.issue || params.chargeCents === null || params.chargeCents === undefined) {
    return {
      ...base,
      chargeCents: null,
      matches: false,
      verifiable: false,
      currencyMatches: false,
      issue: params.issue || 'missing_amount',
      ...UNVERIFIABLE_COPY,
    }
  }

  // An absent currency is not a matching currency.
  if (!chargeCurrency || !authorizedCurrency) {
    return {
      ...base,
      matches: false,
      verifiable: false,
      currencyMatches: false,
      issue: 'missing_currency',
      ...UNVERIFIABLE_COPY,
    }
  }

  if (chargeCurrency !== authorizedCurrency) {
    return {
      ...base,
      matches: false,
      verifiable: true,
      currencyMatches: false,
      issue: 'currency_mismatch',
      title: 'Currency changed',
      // Deliberately not re-quotable: swapping the number inside a sheet opened
      // for another currency would charge the wrong money.
      message: `This order is now charged in ${chargeCurrency.toUpperCase()}. Reload the checkout and pay again in that currency.`,
    }
  }

  const chargeCents = Math.round(params.chargeCents)
  if (chargeCents !== authorizedCents) {
    return {
      ...base,
      chargeCents,
      matches: false,
      verifiable: true,
      currencyMatches: true,
      issue: 'amount_mismatch',
      reauthorizable: true,
      title: 'Total updated',
      message: `Your order now totals ${formatChargeAmount(chargeCents, chargeCurrency)}. Confirm the new amount to continue.`,
    }
  }

  return {
    ...base,
    chargeCents,
    matches: true,
    verifiable: true,
    currencyMatches: true,
  }
}

interface AuthorizedTotal {
  authorizedCents: number
  authorizedCurrency: string | null
}

/** Checks a `payments-create-intent` response against what the shopper approved. */
export function verifyIntentAmount(
  intent: IntentResponseLike | null | undefined,
  authorized: AuthorizedTotal
): AmountCheck {
  const resolution = resolveIntentCharge(intent)
  return checkAuthorizedAmount({
    authorizedCents: authorized.authorizedCents,
    authorizedCurrency: authorized.authorizedCurrency,
    chargeCents: resolution.chargeCents,
    chargeCurrency: resolution.currency,
    issue: resolution.issue,
  })
}

/** Checks a persisted order total against what the shopper approved. */
export function verifyOrderAmount(
  order: OrderAmountLike | null | undefined,
  authorized: AuthorizedTotal
): AmountCheck {
  const resolution = resolveOrderCharge(order)
  return checkAuthorizedAmount({
    authorizedCents: authorized.authorizedCents,
    authorizedCurrency: authorized.authorizedCurrency,
    chargeCents: resolution.chargeCents,
    chargeCurrency: resolution.currency,
    issue: resolution.issue,
  })
}
