/**
 * Maps Stripe errors to human, actionable English copy shown in the persistent
 * inline banner above the pay button. Transient toasts get missed on mobile —
 * this is what actually recovers a declined payment.
 */
export interface PayErrorCopy {
  title: string
  help: string
}

const DECLINE_COPY: Record<string, PayErrorCopy> = {
  insufficient_funds: {
    title: "Your bank declined the charge for insufficient funds",
    help: "Try another card, or pay with PayPal / Apple Pay instead.",
  },
  card_declined: {
    title: "Your bank declined this card",
    help: "This is usually a security block, not a problem with your order. Try another card, PayPal, or Apple / Google Pay.",
  },
  generic_decline: {
    title: "Your bank declined this card",
    help: "This is usually a security block, not a problem with your order. Try another card, PayPal, or Apple / Google Pay.",
  },
  do_not_honor: {
    title: "Your bank declined this card",
    help: "Call your bank to approve the charge, or try another card / PayPal.",
  },
  expired_card: {
    title: "That card is expired",
    help: "Double-check the expiration date, or use another card.",
  },
  incorrect_cvc: {
    title: "The security code doesn't match",
    help: "Re-check the 3 digits on the back of your card (4 on the front for Amex).",
  },
  invalid_cvc: {
    title: "The security code doesn't match",
    help: "Re-check the 3 digits on the back of your card (4 on the front for Amex).",
  },
  incorrect_number: {
    title: "That card number isn't valid",
    help: "Please re-check the 16 digits and try again.",
  },
  invalid_number: {
    title: "That card number isn't valid",
    help: "Please re-check the 16 digits and try again.",
  },
  invalid_expiry_month: {
    title: "That expiration date isn't valid",
    help: "Please re-check the month and year on your card.",
  },
  invalid_expiry_year: {
    title: "That expiration date isn't valid",
    help: "Please re-check the month and year on your card.",
  },
  processing_error: {
    title: "The bank had a temporary error",
    help: "Nothing was charged. Please try again in a few seconds.",
  },
  authentication_required: {
    title: "Your bank needs to verify this payment",
    help: "Complete the verification your bank shows, or try another card.",
  },
}

export function getPayErrorCopy(err: any): PayErrorCopy {
  const key = (err?.decline_code || err?.code || "") as string
  const mapped = DECLINE_COPY[key]
  if (mapped) return mapped

  const message = err?.message || "Your payment could not be processed"
  return {
    title: message,
    help: "Nothing was charged. Try another card, or pay with PayPal / Apple Pay.",
  }
}