import posthog from 'posthog-js';

/**
 * Lightweight checkout instrumentation.
 *
 * These are the micro-events we were blind to before (PostHog autocapture was
 * off and Stripe declines were never reported). Every event carries device +
 * attribution context so we can slice drop-off by ad / device in PostHog.
 */
export type CheckoutEventName =
  | 'checkout_wallet_shown'
  | 'checkout_pay_clicked'
  | 'checkout_payment_failed'
  | 'checkout_payment_succeeded';

function getContext(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const ua = navigator.userAgent || '';
    return {
      device_type: /iPad|Tablet/i.test(ua)
        ? 'tablet'
        : /Mobi|Android|iPhone/i.test(ua)
          ? 'mobile'
          : 'desktop',
      is_in_app_browser: /FBAN|FBAV|Instagram/i.test(ua),
      utm_source: params.get('utm_source') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      path: window.location.pathname,
    };
  } catch {
    return {};
  }
}

export function trackCheckoutEvent(
  name: CheckoutEventName,
  properties: Record<string, any> = {}
) {
  try {
    posthog.capture(name, { ...getContext(), ...properties });
  } catch {
    // never let tracking break a payment
  }
}

/** Normalize a Stripe error (or thrown Error) into flat, queryable props. */
export function stripeErrorProps(err: any, stage: string): Record<string, any> {
  return {
    stage,
    error_code: err?.code || err?.error?.code || 'unknown',
    decline_code: err?.decline_code || err?.error?.decline_code || undefined,
    error_type: err?.type || err?.error?.type || 'unknown',
    error_message: (err?.message || err?.error?.message || '').slice(0, 200),
  };
}