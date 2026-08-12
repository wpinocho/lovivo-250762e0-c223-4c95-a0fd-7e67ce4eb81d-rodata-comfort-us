import React from "react"

const AVATARS = [
  { src: "/avatar-j.webp", alt: "Jason R." },
  { src: "/avatar-m.webp", alt: "Mike T." },
  { src: "/avatar-r.webp", alt: "Ray D." },
]

function VerifiedCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="ml-1 inline-block h-3 w-3 shrink-0 align-[-1px]"
    >
      <path
        fill="#1D9BF0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34Z"
      />
      <path
        fill="#fff"
        d="m10.86 15.55-2.9-2.9 1.24-1.24 1.66 1.66 3.94-3.94 1.24 1.25-5.18 5.17Z"
      />
    </svg>
  )
}

/**
 * Compact social-proof strip for the checkout.
 *
 * Deliberately TWO text rows next to a stacked avatar group (single-strip
 * density) so it frames the order summary instead of competing with it.
 * Carries the three canonical numbers and nothing else:
 *   1,000+ riders served · 127 verified reviews · 4.9★
 */
export default function CheckoutSocialProof() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-brand-graphite px-3.5 py-2.5">
      <div className="flex -space-x-2 shrink-0">
        {AVATARS.map((a) => (
          <img
            key={a.src}
            src={a.src}
            alt={a.alt}
            loading="lazy"
            width={26}
            height={26}
            className="h-[26px] w-[26px] rounded-full border-2 border-brand-graphite object-cover"
          />
        ))}
      </div>

      <div className="min-w-0">
        <p className="font-inter text-[12.5px] leading-snug text-brand-smoke">
          <span className="font-semibold text-brand-offwhite">Jason R.</span>
          <VerifiedCheck />
          <span> and </span>
          <span className="font-semibold text-brand-offwhite">1,000+ riders</span>
          <span> already ride with it</span>
        </p>
        <p className="mt-0.5 font-inter text-[11.5px] leading-snug text-brand-smoke">
          <span className="mr-1 text-brand-amber">★</span>
          <span className="font-semibold text-brand-offwhite">4.9</span>
          <span> from </span>
          <span className="font-semibold text-brand-offwhite">127</span>
          <span> verified reviews</span>
        </p>
      </div>
    </div>
  )
}