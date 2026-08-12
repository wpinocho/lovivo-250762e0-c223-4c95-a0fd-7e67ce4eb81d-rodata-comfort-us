import React from "react"

const AVATARS = [
  { src: "/avatar-j.webp", alt: "Jason R." },
  { src: "/avatar-m.webp", alt: "Mike T." },
  { src: "/avatar-r.webp", alt: "Ray D." },
]

/**
 * Compact social-proof block for the checkout, shown right above the pay button
 * (the moment of maximum doubt). Mirrors the PDP strip so the story stays
 * consistent: 1,000+ riders served · 127 verified reviews · 4.9★
 */
export default function CheckoutSocialProof() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-brand-graphite px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex -space-x-2 shrink-0 pt-0.5">
          {AVATARS.map((a) => (
            <img
              key={a.src}
              src={a.src}
              alt={a.alt}
              loading="lazy"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border-2 border-brand-carbon object-cover"
            />
          ))}
        </div>

        <div className="min-w-0">
          <p className="font-inter text-xs leading-relaxed text-brand-smoke">
            <span className="font-semibold text-brand-offwhite">Jason R.</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mx-1 inline-block h-3.5 w-3.5 -mt-0.5 align-middle"
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
            &ldquo;Rode 6 hours straight and my lower back was fine. Should&rsquo;ve
            bought it sooner.&rdquo;
          </p>

          <p className="mt-1.5 font-inter text-[11px] text-brand-steel">
            <span className="mr-1 tracking-tight text-brand-amber">★★★★★</span>
            <span className="font-semibold text-brand-offwhite">4.9</span>
            {" · "}
            <span className="font-semibold text-brand-offwhite">127</span> verified
            reviews · <span className="font-semibold text-brand-offwhite">1,000+</span>{" "}
            riders
          </p>
        </div>
      </div>
    </div>
  )
}