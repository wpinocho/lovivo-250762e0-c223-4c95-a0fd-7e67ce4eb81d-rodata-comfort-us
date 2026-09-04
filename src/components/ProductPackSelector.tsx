import { cn } from '@/lib/utils'

interface ProductPackSelectorProps {
  /** Full price of a single unit */
  unitPrice: number
  /** Current quantity selected on the PDP */
  quantity: number
  /** Called with the new quantity (1 or 2) */
  onSelect: (quantity: number) => void
  formatMoney: (value: number) => string
  /**
   * Percentage taken off EVERY unit once 2 are in the cart.
   * Must mirror the `volume` price rule in the database
   * ("Rider + Partner 2-Pack") or the PDP will promise a price
   * the cart does not honour. Default 25% = 2nd belt half price.
   */
  packDiscountPct?: number
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
  packDiscountPct = 25,
}: ProductPackSelectorProps) => {
  const packUnitPrice = unitPrice * (1 - packDiscountPct / 100)
  const packTotal = packUnitPrice * 2
  const packSavings = unitPrice * 2 - packTotal
  const selected = quantity >= 2 ? 2 : 1

  const options = [
    {
      qty: 1,
      label: 'One belt',
      sub: 'Just for you',
      total: unitPrice,
      badge: null as string | null,
      note: null as string | null,
    },
    {
      qty: 2,
      label: 'Two belts',
      sub: 'One for whoever rides with you',
      total: packTotal,
      badge: `Save ${formatMoney(packSavings)}`,
      note: `${formatMoney(packUnitPrice)} each · second belt half price`,
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
            onClick={() => onSelect(opt.qty)}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all',
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
                  <span className="rounded-md bg-brand-amber/15 border border-brand-amber/30 px-1.5 py-0.5 text-[10px] font-sora font-bold text-brand-amber uppercase tracking-wide">
                    {opt.badge}
                  </span>
                )}
              </span>
              <span className="block text-brand-steel text-[11px] font-inter mt-0.5 truncate">
                {opt.note ?? opt.sub}
              </span>
            </span>

            <span className="font-sora font-bold text-brand-offwhite text-sm flex-shrink-0">
              {formatMoney(opt.total)}
            </span>
          </button>
        )
      })}
    </div>
  )
}