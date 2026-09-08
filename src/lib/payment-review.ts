import { STORE_ID } from '@/lib/config'

/**
 * A capture whose outcome only the backend can settle: the money may already have
 * been taken, so the browser neither calls it paid nor offers to pay again.
 */
export interface PaymentReview {
  provider: 'paypal'
  /** The store order awaiting reconciliation. */
  orderId: string
  paypalOrderId?: string
  captureId?: string
  at: number
}

/** Same-tab notification so the checkout stops offering payment immediately. */
export const PAYMENT_REVIEW_EVENT = 'payment:review'

const storageKey = (orderId: string) => `payment_review:${STORE_ID}:${orderId}`

export function readPaymentReview(orderId?: string | null): PaymentReview | null {
  if (!orderId) return null
  try {
    const raw = localStorage.getItem(storageKey(orderId))
    return raw ? (JSON.parse(raw) as PaymentReview) : null
  } catch {
    return null
  }
}

export function savePaymentReview(review: PaymentReview): void {
  try {
    localStorage.setItem(storageKey(review.orderId), JSON.stringify(review))
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(PAYMENT_REVIEW_EVENT, { detail: review }))
  } catch {}
}

/** True while an order has a capture the backend has not resolved yet. */
export const isAwaitingPaymentReview = (orderId?: string | null): boolean =>
  readPaymentReview(orderId) !== null

export const PAYMENT_REVIEW_COPY = {
  title: 'Your payment is being reviewed',
  message:
    'PayPal accepted your payment and we are confirming it with them. Do not pay again — we will email you as soon as it is confirmed.',
}

/** Shape of a paypal-capture-order response, successful or not. */
interface CaptureResponseLike {
  ok?: unknown
  status?: unknown
  error?: unknown
  requires_review?: unknown
  order_id?: unknown
  capture_id?: unknown
  paypal_order_id?: unknown
  order?: { id?: unknown } | null
}

export type CaptureOutcome =
  | { status: 'captured'; data: any }
  | { status: 'requires_review'; review: PaymentReview }
  | { status: 'failed'; message: string }

const readId = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined

/**
 * Classifies a capture response.
 *
 * `requires_review` arrives with a non-successful HTTP status, so it is read
 * before anything else and its references are kept: treating it as a decline
 * would invite a second payment for money that may already be captured. A
 * genuine decline — no capture — still comes back as a plain failure the shopper
 * can retry.
 */
export function readCaptureOutcome(params: {
  httpOk: boolean
  data: unknown
  orderId?: string
  paypalOrderId: string
}): CaptureOutcome {
  const data = (params.data || {}) as CaptureResponseLike
  const requiresReview = data.requires_review === true || data.status === 'requires_review'

  if (requiresReview) {
    return {
      status: 'requires_review',
      review: {
        provider: 'paypal',
        orderId: readId(data.order_id) || readId(data.order?.id) || params.orderId || params.paypalOrderId,
        paypalOrderId: readId(data.paypal_order_id) || params.paypalOrderId,
        captureId: readId(data.capture_id),
        at: Date.now(),
      },
    }
  }

  if (!params.httpOk || data.ok !== true || data.status !== 'COMPLETED') {
    return {
      status: 'failed',
      message: readId(data.error) || 'Payment not completed',
    }
  }

  return { status: 'captured', data }
}
