const CENTS_PER_UNIT = 100

/** Money → integer cents. Single rounding point so totals never drift by float noise. */
export function toCents(value: number): number {
  const n = Number(value)
  if (!isFinite(n)) return 0
  return Math.round(n * CENTS_PER_UNIT)
}

/** Integer cents → money. */
export function fromCents(cents: number): number {
  const n = Number(cents)
  if (!isFinite(n)) return 0
  return n / CENTS_PER_UNIT
}

/** Snaps a computed amount to whole cents, the same granularity the backend persists. */
export function roundMoney(value: number): number {
  return fromCents(toCents(value))
}

export function sumMoney(values: number[]): number {
  return fromCents(values.reduce((sum, v) => sum + toCents(v), 0))
}

export function formatMoney(value: number, currency: string, locale: string = 'es-MX'): string {
  // A 25% discount on two $59 belts is $88.50, not $89 — hiding the cents would
  // advertise a price the order never charges.
  const amount = roundMoney(value)
  const hasCents = toCents(amount) % CENTS_PER_UNIT !== 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0
  }).format(amount)
}
