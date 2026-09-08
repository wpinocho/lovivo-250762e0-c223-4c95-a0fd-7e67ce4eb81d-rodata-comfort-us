import { beforeEach, describe, expect, it, vi } from 'vitest'

// Minimal browser storage for the node test environment.
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => { store.set(key, value) },
  removeItem: (key: string) => { store.delete(key) },
  clear: () => store.clear(),
})

const {
  isAwaitingPaymentReview,
  readCaptureOutcome,
  readPaymentReview,
  savePaymentReview,
} = await import('@/lib/payment-review')
const { callEdgeOnce } = await import('@/lib/edge')

const ORDER_ID = 'ord_9f3'
const PAYPAL_ORDER_ID = '5XY12345AB678901C'

/**
 * What Lovivo now answers when PayPal may already hold the money: an
 * unsuccessful HTTP status whose body still carries the references.
 */
const requiresReviewResponse = {
  ok: false,
  requires_review: true,
  error: 'Capture completed but the order could not be reconciled',
  order_id: ORDER_ID,
  capture_id: '3C679865BB0378226',
  paypal_order_id: PAYPAL_ORDER_ID,
}

/** A genuine decline: PayPal took nothing. */
const declinedResponse = {
  ok: false,
  error: 'INSTRUMENT_DECLINED',
}

beforeEach(() => store.clear())

describe('readCaptureOutcome', () => {
  it('detects requires_review even though the HTTP status was not successful', () => {
    const outcome = readCaptureOutcome({
      httpOk: false,
      data: requiresReviewResponse,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })

    expect(outcome.status).toBe('requires_review')
    if (outcome.status !== 'requires_review') return
    // The references needed to settle it survive the failed status.
    expect(outcome.review.orderId).toBe(ORDER_ID)
    expect(outcome.review.captureId).toBe('3C679865BB0378226')
    expect(outcome.review.paypalOrderId).toBe(PAYPAL_ORDER_ID)
  })

  it('also detects it when it arrives as a status', () => {
    const outcome = readCaptureOutcome({
      httpOk: false,
      data: { status: 'requires_review', order_id: ORDER_ID, capture_id: 'cap_1' },
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })
    expect(outcome.status).toBe('requires_review')
  })

  it('does not classify a review as a failure the shopper should retry', () => {
    const outcome = readCaptureOutcome({
      httpOk: false,
      data: requiresReviewResponse,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })
    expect(outcome.status).not.toBe('failed')
  })

  it('still reports a real decline as a retryable failure', () => {
    const outcome = readCaptureOutcome({
      httpOk: false,
      data: declinedResponse,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })

    expect(outcome.status).toBe('failed')
    if (outcome.status !== 'failed') return
    expect(outcome.message).toBe('INSTRUMENT_DECLINED')
  })

  it('accepts a completed capture', () => {
    const outcome = readCaptureOutcome({
      httpOk: true,
      data: { ok: true, status: 'COMPLETED', order: { id: ORDER_ID } },
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })
    expect(outcome.status).toBe('captured')
  })

  it('does not accept a capture that never completed', () => {
    const outcome = readCaptureOutcome({
      httpOk: true,
      data: { ok: true, status: 'PENDING' },
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })
    expect(outcome.status).toBe('failed')
  })
})

describe('a capture under review blocks further payment for that order', () => {
  it('stops another payment attempt once the review is recorded', () => {
    expect(isAwaitingPaymentReview(ORDER_ID)).toBe(false)

    const outcome = readCaptureOutcome({
      httpOk: false,
      data: requiresReviewResponse,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })
    if (outcome.status !== 'requires_review') throw new Error('expected a review')
    savePaymentReview(outcome.review)

    // Both payment paths read this before starting anything.
    expect(isAwaitingPaymentReview(ORDER_ID)).toBe(true)
    expect(readPaymentReview(ORDER_ID)?.captureId).toBe('3C679865BB0378226')
  })

  it('survives a reload, so the order is not payable again on a fresh page', () => {
    savePaymentReview({
      provider: 'paypal',
      orderId: ORDER_ID,
      captureId: 'cap_1',
      at: Date.now(),
    })
    // Same storage a reloaded page would read.
    expect(readPaymentReview(ORDER_ID)?.orderId).toBe(ORDER_ID)
  })

  it('leaves other orders payable', () => {
    savePaymentReview({ provider: 'paypal', orderId: ORDER_ID, at: Date.now() })
    expect(isAwaitingPaymentReview('ord_other')).toBe(false)
  })

  it('does not block anything after a real decline', () => {
    const outcome = readCaptureOutcome({
      httpOk: false,
      data: declinedResponse,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    })

    expect(outcome.status).toBe('failed')
    // Nothing was recorded, so the shopper can retry as before.
    expect(isAwaitingPaymentReview(ORDER_ID)).toBe(false)
  })
})

describe('callEdgeOnce', () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)

  beforeEach(() => fetchMock.mockReset())

  it('posts once and keeps the body of a non-2xx review response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => JSON.stringify(requiresReviewResponse),
    })

    const result = await callEdgeOnce('paypal-capture-order', { paypal_order_id: PAYPAL_ORDER_ID })

    // No second POST: re-sending a capture could take the money twice.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.ok).toBe(false)
    expect(result.status).toBe(409)
    expect(result.data.requires_review).toBe(true)
    expect(result.data.capture_id).toBe('3C679865BB0378226')
  })

  it('carries a non-JSON error body through instead of throwing', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => 'upstream timeout' })

    const result = await callEdgeOnce('paypal-capture-order', {})

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.data.error).toBe('upstream timeout')
    expect(readCaptureOutcome({
      httpOk: result.ok,
      data: result.data,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    }).status).toBe('failed')
  })

  it('returns a successful capture as parsed data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, status: 'COMPLETED', order: { id: ORDER_ID } }),
    })

    const result = await callEdgeOnce('paypal-capture-order', {})

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(readCaptureOutcome({
      httpOk: result.ok,
      data: result.data,
      orderId: ORDER_ID,
      paypalOrderId: PAYPAL_ORDER_ID,
    }).status).toBe('captured')
  })
})
