import { describe, expect, it, vi } from 'vitest'
import { confirmWithVerifiedAmount } from '@/lib/payment-gate'
import { buildSelectedPurchaseItems } from '@/lib/pack-selection'
import { cartToApiItems } from '@/lib/cart-utils'
import { makeProduct, makeVariant, orderItem } from '@/lib/__fixtures__/rodata'

const M = makeVariant('M')
const L = makeVariant('L')
const product = makeProduct([M, L])

const packItems = (secondVariant = L) =>
  cartToApiItems(
    buildSelectedPurchaseItems({
      product,
      packQuantity: 2,
      firstVariant: M,
      secondVariant,
      sellingPlan: null,
      hasVariants: true,
    } as any)
  )

/**
 * The shape payments-create-intent actually answers with: the amount to charge in
 * cents, plus the order it belongs to with its total in main units.
 */
const intentResponse = (overrides: Record<string, unknown> = {}) => ({
  client_secret: 'pi_123_secret_456',
  payment_total_amount: 8850,
  currency: 'usd',
  currency_code: 'USD',
  order: {
    id: 'ord_1',
    total_amount: 88.5,
    currency_code: 'USD',
    order_items: [orderItem(M.id, 1), orderItem(L.id, 1)],
  },
  ...overrides,
})

/** Stands in for stripe.confirmPayment / stripe.confirmCardPayment. */
const confirmSpy = () => vi.fn(async () => ({ paymentIntent: { status: 'succeeded' }, error: undefined }))

const authorized = { authorizedCents: 8850, authorizedCurrency: 'usd' }

describe('confirmWithVerifiedAmount', () => {
  it('confirms when the server charges exactly what was authorised', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse(),
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith('pi_123_secret_456')
    expect(outcome.confirmed).toBe(true)
    if (outcome.confirmed) {
      expect(outcome.chargeCents).toBe(8850)
      expect(outcome.chargeCurrency).toBe('usd')
    }
  })

  it('confirms M + M, where both units share one order line', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({
        order: { total_amount: 88.5, currency_code: 'USD', order_items: [orderItem(M.id, 2)] },
      }),
      ...authorized,
      requestedItems: packItems(M),
      confirm,
    })

    expect(outcome.confirmed).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('does not confirm when the server would charge more than was authorised', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({ payment_total_amount: 11800 }),
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    expect(outcome.confirmed).toBe(false)
    if (!outcome.confirmed) {
      expect(outcome.block.code).toBe('amount')
      expect(outcome.block.chargeCents).toBe(11800)
      expect(outcome.block.reauthorizable).toBe(true)
      expect(outcome.block.serverOrder).toBeTruthy()
    }
  })

  it('trusts payment_total_amount over the order copy in the same response', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      // The order still says $88.50 but the payment is quoted at $118.00.
      data: intentResponse({ payment_total_amount: 11800 }),
      ...authorized,
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    expect(outcome.confirmed).toBe(false)
  })

  it('does not confirm an amount it could not read', async () => {
    const confirm = confirmSpy()
    const { payment_total_amount, order, ...withoutAmount } = intentResponse()
    const outcome = await confirmWithVerifiedAmount({
      data: withoutAmount,
      ...authorized,
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    if (!outcome.confirmed) {
      expect(outcome.block.code).toBe('amount')
      // Nothing to re-quote: the shopper is not asked to approve a guess.
      expect(outcome.block.reauthorizable).toBe(false)
      expect(outcome.block.chargeCents).toBeNull()
    }
  })

  it('does not confirm a charge in another currency', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({ currency: 'mxn', currency_code: 'MXN' }),
      ...authorized,
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    if (!outcome.confirmed) {
      // Re-pricing a wallet opened for USD with an MXN number is not a fix.
      expect(outcome.block.reauthorizable).toBe(false)
      expect(outcome.block.message).toContain('MXN')
    }
  })

  it('does not confirm when the returned order lost the second belt', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({
        order: { total_amount: 88.5, currency_code: 'USD', order_items: [orderItem(M.id, 1)] },
      }),
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    if (!outcome.confirmed) expect(outcome.block.code).toBe('order_mismatch')
  })

  it('does not confirm when the returned order is explicitly empty', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({
        order: { total_amount: 88.5, currency_code: 'USD', order_items: [] },
      }),
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
  })

  it('still confirms when the intent response carries no item detail to compare', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: {
        client_secret: 'pi_123_secret_456',
        payment_total_amount: 8850,
        currency: 'usd',
      },
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    // The order's contents were already verified when it was created; an intent
    // response without items is not evidence that they changed.
    expect(outcome.confirmed).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('does not confirm when items came back unavailable', async () => {
    const confirm = confirmSpy()
    const outcome = await confirmWithVerifiedAmount({
      data: intentResponse({
        unavailable_items: [{ product_name: 'Rodata One', variant_name: 'L' }],
      }),
      ...authorized,
      requestedItems: packItems(),
      confirm,
    })

    expect(confirm).not.toHaveBeenCalled()
    if (!outcome.confirmed) {
      expect(outcome.block.code).toBe('unavailable_items')
      expect(outcome.block.message).toContain('Rodata One (L)')
    }
  })

  it('does not confirm without a client secret', async () => {
    const confirm = confirmSpy()
    const { client_secret, ...withoutSecret } = intentResponse()
    const outcome = await confirmWithVerifiedAmount({ data: withoutSecret, ...authorized, confirm })

    expect(confirm).not.toHaveBeenCalled()
    if (!outcome.confirmed) expect(outcome.block.code).toBe('missing_client_secret')
  })

  it('lets a retry against the updated total go through, without looping', async () => {
    const confirm = confirmSpy()
    const data = intentResponse({ payment_total_amount: 11800, order: { total_amount: 118, currency_code: 'USD' } })

    const first = await confirmWithVerifiedAmount({ data, ...authorized, confirm })
    expect(first.confirmed).toBe(false)
    expect(confirm).not.toHaveBeenCalled()

    // The UI re-quotes the server's number; the shopper approves that one.
    const reauthorizedCents = first.confirmed ? 0 : first.block.chargeCents!
    const second = await confirmWithVerifiedAmount({
      data,
      authorizedCents: reauthorizedCents,
      authorizedCurrency: 'usd',
      confirm,
    })

    expect(second.confirmed).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })
})
