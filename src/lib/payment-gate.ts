import type { CheckoutItem } from '@/lib/supabase'
import {
  extractOrderItems,
  validateOrderMatchesRequest,
  verifyIntentAmount,
  type IntentResponseLike,
  type RequestedLine,
} from '@/lib/order-validation'

export type PaymentBlockCode =
  | 'unavailable_items'
  | 'missing_client_secret'
  | 'amount'
  | 'order_mismatch'

export interface PaymentBlock {
  code: PaymentBlockCode
  title: string
  message: string
  /** What the server would actually charge, when it could be read. */
  chargeCents: number | null
  chargeCurrency: string | null
  /** True only when the shopper can be re-quoted this exact amount and approve it. */
  reauthorizable: boolean
  /** Fresh order from the response, so the UI can show the server's truth. */
  serverOrder: unknown | null
  /** The untouched response, for callers with their own handling (unavailable items). */
  data: unknown
}

export type IntentResponse = IntentResponseLike & {
  client_secret?: unknown
  unavailable_items?: readonly { product_name?: string; variant_name?: string }[]
}

export interface ConfirmOutcome<T> {
  /** True only if `confirm` actually ran. When false, `block` says why it did not. */
  confirmed: boolean
  block?: PaymentBlock
  result?: T
  chargeCents?: number
  chargeCurrency?: string | null
  serverOrder?: unknown | null
}

/**
 * The single gate every Stripe confirmation goes through, on the product page and
 * in the checkout alike.
 *
 * `confirm` only runs once the response has been checked against what the shopper
 * actually approved: the amount and currency the server will charge, and — when
 * the response carries the order detail — that it is still the same items. A
 * response we cannot verify is a stop, not a pass.
 */
export async function confirmWithVerifiedAmount<T>(params: {
  data: IntentResponse | null | undefined
  authorizedCents: number
  authorizedCurrency: string | null
  requestedItems?: readonly (CheckoutItem | RequestedLine)[]
  confirm: (clientSecret: string) => Promise<T>
}): Promise<ConfirmOutcome<T>> {
  const { data, authorizedCents, authorizedCurrency, requestedItems, confirm } = params
  const serverOrder = (data?.order as unknown) ?? null

  const block = (
    code: PaymentBlockCode,
    title: string,
    message: string,
    extra: Partial<PaymentBlock> = {}
  ): ConfirmOutcome<T> => ({
    confirmed: false,
    block: {
      code,
      title,
      message,
      chargeCents: null,
      chargeCurrency: null,
      reauthorizable: false,
      serverOrder,
      data,
      ...extra,
    },
  })

  if (data?.unavailable_items && data.unavailable_items.length > 0) {
    const names = data.unavailable_items
      .map((item) => (item?.variant_name ? `${item.product_name} (${item.variant_name})` : item?.product_name))
      .filter(Boolean)
      .join(', ')
    return block(
      'unavailable_items',
      'Some items are unavailable',
      names
        ? `${names} could not be confirmed. Adjust your selection and try again.`
        : 'Some items could not be confirmed. Adjust your selection and try again.'
    )
  }

  const clientSecret = typeof data?.client_secret === 'string' ? data.client_secret : ''
  if (!clientSecret) {
    return block(
      'missing_client_secret',
      'We could not start the payment',
      'The payment could not be started, so nothing was charged. Please try again.'
    )
  }

  const amount = verifyIntentAmount(data, { authorizedCents, authorizedCurrency })
  if (!amount.matches) {
    return block('amount', amount.title!, amount.message!, {
      chargeCents: amount.chargeCents,
      chargeCurrency: amount.chargeCurrency,
      reauthorizable: amount.reauthorizable,
    })
  }

  // Only when the response actually carries the order back: an intent response
  // without item detail is not evidence the items changed.
  if (requestedItems && extractOrderItems(data) !== null) {
    const match = validateOrderMatchesRequest(requestedItems, data)
    if (!match.valid) {
      return block('order_mismatch', match.title!, match.message!)
    }
  }

  const result = await confirm(clientSecret)
  return {
    confirmed: true,
    result,
    chargeCents: amount.chargeCents!,
    chargeCurrency: amount.chargeCurrency,
    serverOrder,
  }
}
