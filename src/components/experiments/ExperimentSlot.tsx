import React from 'react';
import { useFeatureFlagVariantKey } from '@posthog/react';

interface ExperimentSlotProps {
  experimentKey: string;
  variants: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
}

/**
 * Renders the correct variant based on a PostHog feature flag.
 * The useFeatureFlagVariantKey hook automatically sends the
 * $feature_flag_called exposure event to PostHog.
 *
 * Usage:
 *   <ExperimentSlot
 *     experimentKey="exp-homepage-cta-color"
 *     variants={{
 *       control: <Button className="bg-green-600">Comprar</Button>,
 *       test:    <Button className="bg-purple-600">Comprar</Button>,
 *     }}
 *     fallback={<Button className="bg-green-600">Comprar</Button>}
 *   />
 */
export function ExperimentSlot({ experimentKey, variants, fallback }: ExperimentSlotProps) {
  const variant = useFeatureFlagVariantKey(experimentKey);

  // While loading or if flag not found, show fallback (always control/original)
  if (!variant || typeof variant !== 'string' || !(variant in variants)) {
    return <>{fallback || variants['control'] || Object.values(variants)[0]}</>;
  }

  return <>{variants[variant]}</>;
}
