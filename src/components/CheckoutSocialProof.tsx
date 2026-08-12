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
      className="h-3.5 w-3.5 shrink-0"
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
 * Compact social-proof block for the checkout. Rendered right under the order
 * summary (framing, seen by 100% of visitors) — NOT above the pay button, where
 * it competed with the guarantee badge.
 *
 * Three stacked rows so nothing runs on and no segment can orphan-wrap:
 *   1. the quote
 *   2. avatars + name + verified check
 *   3. canonical proof numbers: 4.9★ · 127 verified reviews · 1,000+ riders served
 */
export default function CheckoutSocialProof() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-brand-graphite px-4 py-3.5">
      {/* Row 1 — the quote */}
      <p className="font-inter text-[13px] leading-snug text-brand-offwhite/90">
        &ldquo;Rode 6 hours straight and my lower back was fine. Should&rsquo;ve
        bought it sooner.&rdquo;
      </p>

      {/* Row 2 — attribution */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex -space-x-2 shrink-0">
          {AVATARS.map((a) => (
            <img
              key={a.src}
              src={a.src}
              alt={a.alt}
              loading="lazy"
              width={24}
              height={24}
              className="h-6 w-6 rounded-full border-2 border-brand-graphite object-cover"
            />
          ))}
        </div>
        <span className="font-inter text-xs font-semibold text-brand-offwhite">
          Jason R.
        </span>
        <VerifiedCheck />
        <span className="font-inter text-[11px] text-brand-steel">
          · Verified buyer
        </span>
      </div>

      {/* Row 3 — canonical proof numbers */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-inter text-[11px] text-brand-smoke">
        <span className="whitespace-nowrap">
          <span className="mr-1 tracking-tight text-brand-amber">★★★★★</span>
          <span className="font-semibold text-brand-offwhite">4.9</span>
        </span>
        <span className="text-brand-steel">·</span>
        <span className="whitespace-nowrap">
          <span className="font-semibold text-brand-offwhite">127</span> verified
          reviews
        </span>
        <span className="text-brand-steel">·</span>
        <span className="whitespace-nowrap">
          <span className="font-semibold text-brand-offwhite">1,000+</span> riders
          served
        </span>
      </div>
    </div>
  )
}