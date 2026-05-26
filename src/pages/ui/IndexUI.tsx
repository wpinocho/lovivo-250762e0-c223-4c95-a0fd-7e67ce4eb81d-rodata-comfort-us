import { Link } from 'react-router-dom'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Check,
  X,
  Activity,
  SlidersHorizontal,
  Shield,
  Route,
  Truck,
  RotateCcw,
  Ruler,
  MessageSquare,
  Star,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import type { UseIndexLogicReturn } from '@/components/headless/HeadlessIndex'

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const REVIEW_IMG_1 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-1.webp'
const REVIEW_IMG_2 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-2.webp'
const REVIEW_IMG_3 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-3.webp'
const HERO_IMG = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775772513540-16g7elmcuii.webp'
const LIFESTYLE_CITY = '/lifestyle-1.jpg'
const LIFESTYLE_CLOSEUP = '/lifestyle-2.jpg'
const LIFESTYLE_HIGHWAY = '/lifestyle-3.jpg'
const LIFESTYLE_WORN = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775771349198-676o65sijn4.webp'
const LIFESTYLE_BELT = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775771349198-tl8qt6nmo8.webp'
const LIFESTYLE_DETAIL = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775771349198-z730si7cdto.webp'
const PROBLEMA_REAL_IMG = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/f67d4ec0-4d70-431e-b117-75f07c0e7880/1779817823430-uv5gvuf1tv.webp'
const PRODUCT_WORN = '/product-worn.jpg'
const PRODUCT_FLAT = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775767354281-gqxi2j4hklp.webp'
const PRODUCT_FEATURES = '/product-worn.jpg'
const BUY_URL = '/products/soporte-lumbar-rodata-one'

interface IndexUIProps {
  logic: UseIndexLogicReturn
}

export const IndexUI = ({ logic }: IndexUIProps) => {
  const productSlug = logic.filteredProducts[0]?.slug
  const buyUrl = productSlug ? `/products/${productSlug}` : BUY_URL

  return (
    <EcommerceTemplate showCart layout="full-width" noPadding>

      {/* ══════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════ */}
      <section
        className="relative flex items-center min-h-[90vh] overflow-hidden"
        style={{ background: '#111315' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMG}
            alt="Rider in the city with Rodata One lumbar support"
            className="w-full h-full object-cover object-center opacity-80"
            loading="eager"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, #111315 0%, #111315 35%, rgba(17,19,21,0.7) 55%, rgba(17,19,21,0.25) 100%)',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-8 bg-brand-amber block" />
              <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em]">
                Premium support for motorcyclists
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-sora font-bold text-brand-offwhite text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-5">
              Ride more.<br />
              <span className="text-brand-amber">Arrive better.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-brand-smoke text-lg sm:text-xl leading-relaxed mb-8 max-w-xl font-inter">
              Lumbar support designed to reduce fatigue and improve comfort on urban commutes and long rides.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-10">
              {[
                'Comfortable under your riding gear',
                'Firm, lightweight support',
                'Perfect for city and highway',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-brand-smoke text-sm font-inter">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center">
                    <Check size={11} className="text-brand-amber" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span style={{ letterSpacing: '0px' }} className="font-sora font-bold text-brand-offwhite text-4xl">$69</span>
              <span className="text-brand-steel text-xl line-through font-inter">$99</span>
              <span className="bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold px-2.5 py-1 rounded font-sora">
                30% OFF
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to={buyUrl}>
                <button className="btn-amber-lg amber-glow w-full sm:w-auto font-sora">
                  Buy now
                  <ArrowRight size={16} />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="btn-outline-light w-full sm:w-auto font-sora">
                  See how it works
                </button>
              </a>
            </div>

            {/* Micro trust */}
            <p className="text-brand-steel text-xs font-inter">
              Free shipping · 30-day trial · Easy size exchange
            </p>
          </div>
        </div>


      </section>

      {/* ══════════════════════════════════════════════
          2. BENEFITS BAR
      ══════════════════════════════════════════════ */}
      <section className="bg-brand-graphite border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Activity, label: 'Less lumbar fatigue', desc: 'Continuous support throughout your ride' },
              { icon: SlidersHorizontal, label: 'Firm, comfortable fit', desc: 'Dual precision tensioner' },
              { icon: Shield, label: 'Built for riders', desc: 'Not a generic back brace' },
              { icon: Route, label: 'City and highway', desc: 'Ideal for frequent use' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center">
                  <Icon size={20} className="text-brand-amber" />
                </div>
                <div>
                  <p className="font-sora font-semibold text-brand-offwhite text-sm">{label}</p>
                  <p className="text-brand-steel text-xs mt-0.5 font-inter">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. PROBLEM SECTION
      ══════════════════════════════════════════════ */}
      <section className="bg-brand-offwhite py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">
                The real problem
              </span>
              <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                After a while on the bike, your body starts to feel it
              </h2>
              <p className="text-brand-steel text-lg leading-relaxed mb-6 font-inter">
                The posture, the vibration, and long rides all end up loading your lumbar area. When that happens, you enjoy the ride less and arrive more tired than you should.
              </p>
              <div className="h-px w-12 bg-brand-amber mb-6" />
              <p className="text-brand-carbon text-base font-medium leading-relaxed font-inter">
                Rodata One was designed to help you ride with more support and finish every trip feeling better.
              </p>
              <div className="mt-8">
                <Link to={buyUrl}>
                  <button className="btn-amber amber-glow font-sora">
                    Discover Rodata One
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-lg overflow-hidden aspect-square shadow-2xl">
                <img
                  src={PROBLEMA_REAL_IMG}
                  alt="Rider on the road with Rodata One Lumbar Support"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-brand-graphite border border-white/[0.08] rounded-lg p-5 shadow-2xl max-w-[220px]">
                <p className="font-sora font-bold text-brand-amber text-2xl mb-1">+80%</p>
                <p className="text-brand-smoke text-xs font-inter">of riders experience lower back fatigue after frequent rides</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-dark py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Support technology
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl">
              Support exactly where you need it
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                number: '01',
                title: 'Stable compression',
                desc: 'Provides a firm support sensation in the lumbar zone throughout the entire ride, without affecting your range of motion.',
                icon: Shield,
              },
              {
                number: '02',
                title: 'Better riding posture',
                desc: 'Helps maintain a more comfortable riding position for longer — mile after mile, city after city.',
                icon: Activity,
              },
              {
                number: '03',
                title: 'Less accumulated fatigue',
                desc: 'Ideal for frequent riders and long-haul trips. You arrive fresher at the end of every ride.',
                icon: Route,
              },
            ].map(({ number, title, desc, icon: Icon }) => (
              <div
                key={number}
                className="relative bg-brand-graphite border border-white/[0.07] rounded-xl p-8 group hover:border-brand-amber/30 transition-colors duration-300"
              >
                <div className="flex items-start gap-4 mb-5">
                  <span className="font-sora font-bold text-brand-amber/30 text-5xl leading-none select-none">{number}</span>
                  <div className="h-10 w-10 rounded-lg bg-brand-amber/10 flex items-center justify-center mt-1">
                    <Icon size={18} className="text-brand-amber" />
                  </div>
                </div>
                <h3 className="font-sora font-bold text-brand-offwhite text-xl mb-3">{title}</h3>
                <p className="text-brand-steel text-sm leading-relaxed font-inter">{desc}</p>
              </div>
            ))}
          </div>

          {/* Product feature image */}
          <div className="mt-16 rounded-2xl overflow-hidden relative">
            <img
              src={PRODUCT_FEATURES}
              alt="Technical features of the Rodata One Lumbar Support"
              className="w-full max-h-[500px] object-cover object-center"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, #111315 0%, rgba(17,19,21,0.3) 50%, rgba(17,19,21,0) 100%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <p className="font-sora font-semibold text-brand-offwhite text-xl mb-4">
                Hexagonal lumbar panel · Dual-adjustment straps · Breathable mesh
              </p>
              <Link to={buyUrl}>
                <button className="btn-amber amber-glow font-sora">
                  See the full product
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. LIFESTYLE / PRODUCT IN USE
      ══════════════════════════════════════════════ */}
      <section className="bg-brand-offwhite py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Images grid */}
            <div className="grid grid-cols-2 gap-3">
              <img
                src={LIFESTYLE_WORN}
                alt="Rider wearing the Rodata One Lumbar Support from behind"
                className="col-span-2 rounded-xl object-cover aspect-video shadow-lg"
                style={{ objectPosition: 'center 40%' }}
                loading="lazy"
              />
              <img
                src={LIFESTYLE_BELT}
                alt="Rodata One Lumbar Support — full product view"
                className="rounded-xl object-cover aspect-square shadow-lg"
                loading="lazy"
              />
              <img
                src={LIFESTYLE_DETAIL}
                alt="Detail of breathable mesh and straps of the Rodata One"
                className="rounded-xl object-cover aspect-square shadow-lg"
                loading="lazy"
              />
            </div>

            {/* Copy */}
            <div>
              <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">
                Part of your gear
              </span>
              <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Built to feel like part of your gear
              </h2>
              <p className="text-brand-steel text-lg leading-relaxed mb-8 font-inter">
                Lightweight, discreet, and designed to wear comfortably under your jacket or regular riding gear. Whether you ride in the city or on the highway — Rodata One goes with you without you noticing it.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Fits invisibly under your jacket',
                  'Technical matte black textile construction',
                  'Low-profile lumbar panel',
                  'Dual precision-adjustment tensioner',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-brand-carbon/10 border border-brand-carbon/20 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-brand-carbon" />
                    </div>
                    <span className="text-brand-carbon text-sm font-inter">{item}</span>
                  </div>
                ))}
              </div>

              <Link to={buyUrl}>
                <button className="btn-amber amber-glow font-sora">
                  Buy now — $69
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. FOR WHOM
      ══════════════════════════════════════════════ */}
      <section className="section-graphite py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Who it's for
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
              Designed for riders who want to arrive feeling better
            </h2>
            <p className="text-brand-smoke text-lg font-inter">Rodata One is ideal for:</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Frequent urban rider',
                desc: 'Those who use their bike several times a week commuting in the city.',
              },
              {
                title: 'Medium and long-distance riders',
                desc: 'Riders with long routes who end up feeling it in the lower back.',
              },
              {
                title: 'Weekend getaway riders',
                desc: 'Those who hit the highway on weekends and want to arrive fresh.',
              },
              {
                title: 'Serious gear mindset',
                desc: 'Motorcyclists who care about their experience and already invest in quality gear.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-brand-carbon border border-white/[0.07] rounded-xl p-7 hover:border-brand-amber/20 transition-colors duration-300"
              >
                <div className="h-8 w-8 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center mb-4">
                  <Check size={14} className="text-brand-amber" />
                </div>
                <h3 className="font-sora font-bold text-brand-offwhite text-base mb-2">{title}</h3>
                <p className="text-brand-steel text-sm font-inter leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. COMPARISON TABLE
      ══════════════════════════════════════════════ */}
      <section className="bg-brand-offwhite py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              The difference is clear
            </span>
            <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Not another generic back brace from the internet
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-brand-smoke/40 shadow-lg">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-brand-carbon text-brand-offwhite">
              <div className="p-5 col-span-1">
                <span className="text-brand-steel text-xs font-sora uppercase tracking-wider">Feature</span>
              </div>
              <div className="p-5 text-center border-l border-white/[0.08]">
                <span className="font-sora font-bold text-brand-amber text-sm">Rodata One</span>
              </div>
              <div className="p-5 text-center border-l border-white/[0.08]">
                <span className="font-sora font-medium text-brand-steel text-sm">Generic braces</span>
              </div>
            </div>

            {/* Rows */}
            {[
              'Designed for motorcyclists',
              'Premium look',
              'Clear size guide',
              'Easy size exchange',
              'US shipping',
              'Real human support',
              'Brand experience focused on riders',
            ].map((feature, i) => (
              <div
                key={feature}
                className={`grid grid-cols-3 border-t ${i % 2 === 0 ? 'bg-white' : 'bg-brand-offwhite'}`}
                style={{ borderColor: '#E2E8EE' }}
              >
                <div className="p-4 sm:p-5">
                  <span className="text-brand-carbon text-sm font-inter">{feature}</span>
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-center border-l" style={{ borderColor: '#E2E8EE' }}>
                  <div className="h-6 w-6 rounded-full bg-brand-amber/15 flex items-center justify-center">
                    <Check size={13} className="text-brand-amber" />
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-center border-l" style={{ borderColor: '#E2E8EE' }}>
                  <div className="h-6 w-6 rounded-full bg-brand-steel/10 flex items-center justify-center">
                    <X size={13} className="text-brand-steel" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to={buyUrl}>
              <button className="btn-amber-lg amber-glow font-sora">
                Buy Rodata One — $69
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section id="reviews" className="section-dark py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Social proof
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl">
              Riders who already felt the difference
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: 'Used it on a long ride and the difference when I got off the bike was real. Way more comfortable than I expected.',
                name: 'Carlos',
                city: 'Los Angeles',
                stars: 5,
                photo: REVIEW_IMG_1,
              },
              {
                text: "Feels firm but not uncomfortable. The best part is it doesn't get in the way under my jacket.",
                name: 'Jorge',
                city: 'Houston',
                stars: 5,
                photo: REVIEW_IMG_2,
              },
              {
                text: "I liked that it looks like part of your gear, not just a random back brace. You can feel the quality.",
                name: 'Andres',
                city: 'Chicago',
                stars: 5,
                photo: REVIEW_IMG_3,
              },
            ].map(({ text, name, city, stars, photo }) => (
              <div
                key={name}
                className="bg-brand-graphite border border-white/[0.07] rounded-xl overflow-hidden flex flex-col"
              >
                {/* Customer photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={photo} alt={`${name} using the Rodata One`} className="w-full h-full object-cover" loading="lazy"/>
                  <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, transparent 50%, rgba(17,19,21,0.65) 100%)'}}/>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Check size={10} className="text-brand-amber"/><span className="text-brand-amber text-[10px] font-inter font-medium">Verified purchase</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" className="text-brand-amber" />
                    ))}
                  </div>
                  <blockquote className="text-brand-smoke text-sm leading-relaxed flex-1 font-inter mb-5">
                    "{text}"
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="h-8 w-8 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center">
                      <span className="font-sora font-bold text-brand-amber text-sm">{name[0]}</span>
                    </div>
                    <div>
                      <p className="font-sora font-semibold text-brand-offwhite text-sm">{name}</p>
                      <p className="text-brand-steel text-xs font-inter">{city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9. GUARANTEE SECTION
      ══════════════════════════════════════════════ */}
      <section className="bg-brand-offwhite py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Risk-free purchase
            </span>
            <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl">
              Try it without the hassle
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: RotateCcw,
                title: '30-day trial',
                desc: "If it doesn't work for you, we'll make it right — no hassle.",
              },
              {
                icon: Ruler,
                title: 'Easy size exchange',
                desc: 'We help you find the right fit. We guide you through the process.',
              },
              {
                icon: Truck,
                title: 'Free US shipping',
                desc: 'Shop with zero friction. No extra shipping cost.',
              },
              {
                icon: MessageSquare,
                title: 'Real human support',
                desc: 'We answer your questions directly — real people, not bots.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-brand-smoke/40 rounded-xl p-7 text-center hover:border-brand-amber/30 transition-colors duration-300 shadow-sm"
              >
                <div className="h-14 w-14 rounded-full bg-brand-carbon/5 border border-brand-carbon/10 flex items-center justify-center mx-auto mb-5">
                  <Icon size={22} className="text-brand-carbon" />
                </div>
                <h3 className="font-sora font-bold text-brand-carbon text-base mb-2">{title}</h3>
                <p className="text-brand-steel text-sm font-inter leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10. FAQ
      ══════════════════════════════════════════════ */}
      <section id="faq" className="section-graphite py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Got questions?
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: 'Can I wear it under my jacket?',
                a: "Yes. It's designed to feel comfortable and discreet under your regular riding gear. Its low profile makes it virtually invisible under your jacket.",
              },
              {
                q: 'How do I choose my size?',
                a: "Use our size guide on the product page. If it doesn't fit as expected, we'll help you exchange it at no cost.",
              },
              {
                q: 'Is it good for long rides?',
                a: "That's exactly what it's designed for — riders who want more comfort and less fatigue on frequent or long-distance trips. City or highway.",
              },
              {
                q: 'Does it feel too stiff?',
                a: "It has a firm fit but it's designed to be comfortable in real-world use. It doesn't restrict movement or feel invasive while riding.",
              },
              {
                q: 'Can I use it daily?',
                a: "Yes, especially if you ride several times a week. It's built for frequent, continuous use.",
              },
              {
                q: 'How long does shipping take?',
                a: 'Estimated shipping times are shown at checkout. Shipping is free across the US.',
              },
              {
                q: 'How does the size exchange work?',
                a: "If your size isn't right, contact us and we'll guide you through a simple exchange. We want you to have the right fit.",
              },
            ].map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-brand-carbon border border-white/[0.07] rounded-xl px-6 data-[state=open]:border-brand-amber/20 transition-colors duration-200"
              >
                <AccordionTrigger className="font-sora font-semibold text-brand-offwhite text-sm py-5 hover:no-underline hover:text-brand-amber [&>svg]:text-brand-amber">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-brand-smoke text-sm font-inter leading-relaxed pb-5">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          11. FINAL CTA
      ══════════════════════════════════════════════ */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{ background: '#111315' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${LIFESTYLE_HIGHWAY})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #111315 0%, rgba(17,19,21,0.85) 50%, #111315 100%)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">
            Rodata One
          </span>
          <h2 className="font-sora font-bold text-brand-offwhite text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Make every ride feel better
          </h2>
          <p className="text-brand-smoke text-lg leading-relaxed mb-10 font-inter max-w-2xl mx-auto">
            Rodata One was built for riders who want more support, more comfort, and less fatigue at the end of every ride.
          </p>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-3 mb-8">
            <span className="font-sora font-bold text-brand-offwhite text-4xl">$69</span>
            <span className="text-brand-steel text-xl line-through font-inter">$99</span>
          </div>

          <Link to={buyUrl}>
            <button className="btn-amber-lg amber-glow font-sora text-lg px-12">
              Buy now
              <ArrowRight size={18} />
            </button>
          </Link>

          <p className="mt-5 text-brand-steel text-sm font-inter">
            Free US shipping · 30-day trial · Easy size exchange
          </p>
        </div>
      </section>

    </EcommerceTemplate>
  )
}