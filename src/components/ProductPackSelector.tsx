import { cn } from '@/lib/utils'

export interface PackOffer {
  /** True while the price rules are still being fetched. */
  loading: boolean
  /** True only when a real volume rule was found and it lowers the price. */
  available: boolean
  singleTotal: number
  packTotal: number
  packUnitPrice: number
  secondBeltPrice: number
  secondBeltOffPct: number
  savings: number
  savingsLabel: string | null
}

interface ProductPackSelectorProps {
  /** Full price of a single unit */
  unitPrice: number
  /** Current quantity selected on the PDP */
  quantity: number
  /** Called with the new quantity (1 or 2) */
  onSelect: (quantity: number) => void
  formatMoney: (value: number) => string
  /**
   * Pack economics read from the live `volume` price rule. Never a percentage
   * typed into the page: if the rule says something else, the cart wins, so the
   * PDP must quote the rule.
   */
  offer: PackOffer
  disabled?: boolean
}

/**
 * Compact 1-vs-2 quantity selector that replaces the plain stepper.
 * Single unit stays pre-selected, so the default buying path is untouched —
 * the 2-pack is an opt-in upgrade, not a detour.
 */
export const ProductPackSelector = ({
  unitPrice,
  quantity,
  onSelect,
  formatMoney,
  offer,
  disabled = false,
}: ProductPackSelectorProps) => {
  const selected = quantity >= 2 ? 2 : 1

  const packNote = offer.loading
    ? 'Checking the current offer…'
    : offer.available
      ? `First ${formatMoney(unitPrice)} · second only ${formatMoney(offer.secondBeltPrice)}`
      : 'One for whoever rides with you'

  const options = [
    {
      qty: 1,
      label: 'One belt',
      sub: 'Just for you',
      total: offer.singleTotal,
      compareAt: null as number | null,
      badge: null as string | null,
      note: null as string | null,
    },
    {
      qty: 2,
      label: 'Two belts',
      sub: 'One for whoever rides with you',
      total: offer.packTotal,
      compareAt: offer.available ? unitPrice * 2 : null,
      badge: offer.available && offer.secondBeltOffPct > 0
        ? `2nd belt ${offer.secondBeltOffPct}% off`
        : null,
      note: packNote,
    },
  ]

  return (
    <div className="space-y-2" role="radiogroup" aria-label="How many belts">
      {options.map((opt) => {
        const isSelected = selected === opt.qty
        return (
          <button
            key={opt.qty}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(opt.qty)}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all',
              disabled && 'opacity-60 cursor-not-allowed',
              isSelected
                ? 'border-brand-amber bg-brand-amber/[0.07]'
                : 'border-white/[0.12] bg-brand-graphite hover:border-brand-amber/40'
            )}
          >
            <span
              className={cn(
                'h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0',
                isSelected ? 'border-brand-amber' : 'border-white/25'
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-brand-amber" />}
            </span>

            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 flex-wrap">
                <span className="font-sora font-semibold text-brand-offwhite text-sm">{opt.label}</span>
                {opt.badge && (
                  <span className="rounded-md bg-brand-amber px-1.5 py-0.5 text-[10px] font-sora font-bold text-brand-carbon uppercase tracking-wide">
                    {opt.badge}
                  </span>
                )}
              </span>
              <span className="block text-brand-smoke text-[11px] font-inter mt-0.5 truncate">
                {opt.note ?? opt.sub}
              </span>
            </span>

            <span className="flex flex-col items-end flex-shrink-0 leading-tight">
              {opt.compareAt && opt.compareAt > opt.total && (
                <span className="font-inter text-[11px] text-brand-steel line-through">
                  {formatMoney(opt.compareAt)}
                </span>
              )}
              <span className="font-sora font-bold text-brand-offwhite text-sm">
                {formatMoney(opt.total)}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
