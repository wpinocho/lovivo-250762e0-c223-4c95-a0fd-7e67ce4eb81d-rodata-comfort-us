import posthog from 'posthog-js';

/**
 * Track a custom event with experiment context attached.
 * Automatically reads the current variant from PostHog and includes it in the event.
 *
 * Usage:
 *   trackExperimentEvent('exp-homepage-cta-color', 'cta_clicked', { position: 'hero' });
 */
export function trackExperimentEvent(
  experimentKey: string,
  eventName: string,
  properties?: Record<string, any>
) {
  const variant = posthog.getFeatureFlag(experimentKey);
  if (variant) {
    posthog.capture(eventName, {
      ...properties,
      experiment_key: experimentKey,
      experiment_variant: variant,
    });
  }
}
