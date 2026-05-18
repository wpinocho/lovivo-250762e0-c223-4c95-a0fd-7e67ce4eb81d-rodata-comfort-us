import { useFeatureFlagVariantKey } from '@posthog/react';
import { trackExperimentEvent } from '@/lib/experiments';

/**
 * Hook for experiments that need more control than ExperimentSlot.
 * Returns the variant key and a track function for experiment-specific events.
 *
 * Usage:
 *   const { variant, track } = useExperiment('exp-checkout-layout');
 *   // variant = 'control' | 'test' | null
 *   // track('cta_clicked') → sends event with experiment context
 */
export function useExperiment(experimentKey: string) {
  const variant = useFeatureFlagVariantKey(experimentKey);

  const track = (eventName: string, properties?: Record<string, any>) => {
    trackExperimentEvent(experimentKey, eventName, properties);
  };

  return { variant, track };
}
