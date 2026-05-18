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
const PROBLEMA_REAL_IMG = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775770729257-1nufsuab1jt.webp'
const PRODUCT_WORN = '/product-worn.jpg'
const PRODUCT_FLAT = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775767354281-gqxi2j4hklp.webp'
const PRODUCT_FEATURES = '/product-worn.jpg'
const BUY_URL = '/productos/soporte-lumbar-rodata-one'

interface IndexUIProps {
  logic: UseIndexLogicReturn
}

export const IndexUI = ({ logic }: IndexUIProps) => {
  const productSlug = logic.filteredProducts[0]?.slug
  const buyUrl = productSlug ? `/productos/${productSlug}` : BUY_URL

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
            alt="Rider en ciudad con soporte lumbar Rodata One"
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
                Soporte premium para motociclistas
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-sora font-bold text-brand-offwhite text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-5">
              Rueda más.<br />
              <span className="text-brand-amber">Llega mejor.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-brand-smoke text-lg sm:text-xl leading-relaxed mb-8 max-w-xl font-inter">
              Soporte lumbar diseñado para reducir la fatiga y mejorar la comodidad en trayectos urbanos y rodadas largas.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-10">
              {[
                'Cómodo debajo de tu equipo',
                'Ajuste firme y ligero',
                'Ideal para ciudad y carretera',
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
              <span style={{ letterSpacing: '0px' }} className="font-sora font-bold text-brand-offwhite text-4xl">MX$699</span>
              <span className="text-brand-steel text-xl line-through font-inter">MX$999</span>
              <span className="bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold px-2.5 py-1 rounded font-sora">
                25% OFF
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to={buyUrl}>
                <button className="btn-amber-lg amber-glow w-full sm:w-auto font-sora">
                  Comprar ahora
                  <ArrowRight size={16} />
                </button>
              </Link>
              <a href="#como-funciona">
                <button className="btn-outline-light w-full sm:w-auto font-sora">
                  Ver cómo funciona
                </button>
              </a>
            </div>

            {/* Micro trust */}
            <p className="text-brand-steel text-xs font-inter">
              Envío gratis · 30 días de prueba · Cambio de talla fácil
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
              { icon: Activity, label: 'Menos fatiga lumbar', desc: 'Soporte continuo durante el trayecto' },
              { icon: SlidersHorizontal, label: 'Ajuste firme y cómodo', desc: 'Doble tensor de precisión' },
              { icon: Shield, label: 'Diseñado para riders', desc: 'No para uso genérico' },
              { icon: Route, label: 'Ciudad y carretera', desc: 'Ideal para uso frecuente' },
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
                El problema real
              </span>
              <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Después de cierto tiempo en la moto, el cuerpo lo empieza a sentir
              </h2>
              <p className="text-brand-steel text-lg leading-relaxed mb-6 font-inter">
                La postura, la vibración y los trayectos largos terminan cargando la zona lumbar. Cuando eso pasa, disfrutas menos la rodada y llegas más cansado de lo que deberías.
              </p>
              <div className="h-px w-12 bg-brand-amber mb-6" />
              <p className="text-brand-carbon text-base font-medium leading-relaxed font-inter">
                Rodata One fue pensado para ayudarte a rodar con más soporte y terminar mejor cada trayecto.
              </p>
              <div className="mt-8">
                <Link to={buyUrl}>
                  <button className="btn-amber amber-glow font-sora">
                    Conocer el Rodata One
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-lg overflow-hidden aspect-square shadow-2xl">
                <img
                  src={PROBLEMA_REAL_IMG}
                  alt="Rider en carretera con Soporte Lumbar Rodata One y efecto de soporte lumbar"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-brand-graphite border border-white/[0.08] rounded-lg p-5 shadow-2xl max-w-[220px]">
                <p className="font-sora font-bold text-brand-amber text-2xl mb-1">+80%</p>
                <p className="text-brand-smoke text-xs font-inter">de riders siente fatiga en zona lumbar después de trayectos frecuentes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="como-funciona" className="section-dark py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Tecnología de soporte
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl">
              Soporte donde más lo necesitas
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                number: '01',
                title: 'Compresión estable',
                desc: 'Aporta una sensación de soporte firme en la zona lumbar durante todo el trayecto, sin afectar tu rango de movimiento.',
                icon: Shield,
              },
              {
                number: '02',
                title: 'Mejor sensación de postura',
                desc: 'Ayuda a mantener una posición de manejo más cómoda por más tiempo, ciudad tras ciudad o tramo tras tramo.',
                icon: Activity,
              },
              {
                number: '03',
                title: 'Menos fatiga acumulada',
                desc: 'Ideal para quienes ruedan seguido o hacen trayectos largos. Llegas más fresco al final de cada rodada.',
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
              alt="Características técnicas del Soporte Lumbar Rodata One"
              className="w-full max-h-[500px] object-cover object-center"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, #111315 0%, rgba(17,19,21,0.3) 50%, rgba(17,19,21,0) 100%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <p className="font-sora font-semibold text-brand-offwhite text-xl mb-4">
                Panel lumbar hexagonal · Correas de doble ajuste · Malla transpirable
              </p>
              <Link to={buyUrl}>
                <button className="btn-amber amber-glow font-sora">
                  Ver el producto completo
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
                alt="Rider usando Soporte Lumbar Rodata One por detrás"
                className="col-span-2 rounded-xl object-cover aspect-video shadow-lg"
                style={{ objectPosition: 'center 40%' }}
                loading="lazy"
              />
              <img
                src={LIFESTYLE_BELT}
                alt="Soporte Lumbar Rodata One — vista del producto completo"
                className="rounded-xl object-cover aspect-square shadow-lg"
                loading="lazy"
              />
              <img
                src={LIFESTYLE_DETAIL}
                alt="Detalle de malla transpirable y correas del Rodata One"
                className="rounded-xl object-cover aspect-square shadow-lg"
                loading="lazy"
              />
            </div>

            {/* Copy */}
            <div>
              <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">
                Parte del equipo
              </span>
              <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Hecho para sentirse parte de tu equipo
              </h2>
              <p className="text-brand-steel text-lg leading-relaxed mb-8 font-inter">
                Ligero, discreto y pensado para usarse cómodamente debajo de tu chamarra o equipo habitual. No importa si rodas en ciudad o carretera — el Rodata One va contigo sin que lo notes.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'No estorba debajo de la chamarra',
                  'Construcción técnica en textil negro mate',
                  'Panel lumbar de perfil bajo',
                  'Doble tensor de ajuste preciso',
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
                  Comprar ahora — MX$699
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
              Para quién es
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
              Diseñado para riders que quieren llegar mejor
            </h2>
            <p className="text-brand-smoke text-lg font-inter">Rodata One es ideal para:</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Rider urbano frecuente',
                desc: 'Quienes usan la moto varias veces por semana en la ciudad.',
              },
              {
                title: 'Trayectos medianos y largos',
                desc: 'Riders con rutas largas que terminan sintiendo la zona lumbar.',
              },
              {
                title: 'Escapadas de fin de semana',
                desc: 'Quienes salen a carretera los fines de semana y quieren llegar frescos.',
              },
              {
                title: 'Equipo serio en mente',
                desc: 'Motociclistas que cuidan su experiencia y ya invierten en buen equipo.',
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
              La diferencia es clara
            </span>
            <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl leading-tight">
              No es otro soporte genérico de internet
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-brand-smoke/40 shadow-lg">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-brand-carbon text-brand-offwhite">
              <div className="p-5 col-span-1">
                <span className="text-brand-steel text-xs font-sora uppercase tracking-wider">Característica</span>
              </div>
              <div className="p-5 text-center border-l border-white/[0.08]">
                <span className="font-sora font-bold text-brand-amber text-sm">Rodata One</span>
              </div>
              <div className="p-5 text-center border-l border-white/[0.08]">
                <span className="font-sora font-medium text-brand-steel text-sm">Soportes genéricos</span>
              </div>
            </div>

            {/* Rows */}
            {[
              'Diseñado para motociclistas',
              'Look premium',
              'Guía de talla clara',
              'Cambio de talla fácil',
              'Envío en México',
              'Atención por WhatsApp',
              'Experiencia de marca enfocada en riders',
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
                Comprar Rodata One — MX$699
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section id="opiniones" className="section-dark py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">
              Prueba social
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl">
              Riders que ya notaron la diferencia
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: 'Lo usé en un trayecto largo y la diferencia al bajarme de la moto sí se sintió. Mucho más cómodo de lo que esperaba.',
                name: 'Carlos',
                city: 'CDMX',
                stars: 5,
                photo: REVIEW_IMG_1,
              },
              {
                text: 'Se siente firme pero no incómodo. Lo mejor es que no estorba debajo de la chamarra.',
                name: 'Jorge',
                city: 'Guadalajara',
                stars: 5,
                photo: REVIEW_IMG_2,
              },
              {
                text: 'Me gustó que se ve como parte del equipo y no como una faja cualquiera. La calidad se nota.',
                name: 'Andrés',
                city: 'Monterrey',
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
                  <img src={photo} alt={`${name} usando el Rodata One`} className="w-full h-full object-cover" loading="lazy"/>
                  <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, transparent 50%, rgba(17,19,21,0.65) 100%)'}}/>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Check size={10} className="text-brand-amber"/><span className="text-brand-amber text-[10px] font-inter font-medium">Compra verificada</span>
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
              Compra sin riesgo
            </span>
            <h2 className="font-sora font-bold text-brand-carbon text-3xl sm:text-4xl lg:text-5xl">
              Pruébalo sin complicarte
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: RotateCcw,
                title: '30 días de prueba',
                desc: 'Si no te convence, te ayudamos a resolverlo sin complicaciones.',
              },
              {
                icon: Ruler,
                title: 'Cambio de talla fácil',
                desc: 'Para que encuentres el ajuste correcto. Te guiamos en el proceso.',
              },
              {
                icon: Truck,
                title: 'Envío gratis en México',
                desc: 'Compra sin fricción desde el inicio. Sin costo adicional de envío.',
              },
              {
                icon: MessageSquare,
                title: 'Atención por WhatsApp',
                desc: 'Resolvemos tus dudas directamente, con personas reales.',
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
              Resolvemos tus dudas
            </span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: '¿Se puede usar debajo de la chamarra?',
                a: 'Sí. Está pensado para sentirse cómodo y discreto debajo de tu equipo habitual. Su perfil bajo lo hace prácticamente invisible bajo la chamarra.',
              },
              {
                q: '¿Cómo elijo mi talla?',
                a: 'Puedes apoyarte en nuestra guía de tallas que encontrarás en la página del producto. Si aún así no te queda como esperabas, te ayudamos con el cambio sin costo.',
              },
              {
                q: '¿Sirve para trayectos largos?',
                a: 'Está diseñado justamente para riders que buscan más comodidad y menos fatiga en trayectos frecuentes o prolongados. Ciudad o carretera.',
              },
              {
                q: '¿Se siente muy rígido?',
                a: 'Tiene un ajuste firme pero pensado para ser cómodo en uso real. No restringe el movimiento ni se siente invasivo durante la rodada.',
              },
              {
                q: '¿Lo puedo usar diario?',
                a: 'Sí, especialmente si usas la moto varias veces por semana. Está construido para uso frecuente y continuo.',
              },
              {
                q: '¿Cuánto tarda el envío?',
                a: 'Mostramos tiempos estimados al momento de compra dentro de México. El envío es gratis a todo el país.',
              },
              {
                q: '¿Cómo funciona el cambio de talla?',
                a: 'Si tu talla no fue la ideal, contáctanos por WhatsApp y te guiamos para hacer el cambio de manera simple. Queremos que el ajuste sea el correcto.',
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
            Haz que tus trayectos se sientan mejor
          </h2>
          <p className="text-brand-smoke text-lg leading-relaxed mb-10 font-inter max-w-2xl mx-auto">
            Rodata One fue creado para riders que quieren más soporte, más comodidad y menos fatiga al final de cada rodada.
          </p>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-3 mb-8">
            <span className="font-sora font-bold text-brand-offwhite text-4xl">MX$699</span>
            <span className="text-brand-steel text-xl line-through font-inter">MX$999</span>
          </div>

          <Link to={buyUrl}>
            <button className="btn-amber-lg amber-glow font-sora text-lg px-12">
              Comprar ahora
              <ArrowRight size={18} />
            </button>
          </Link>

          <p className="mt-5 text-brand-steel text-sm font-inter">
            Envío gratis en México · 30 días de prueba · Cambio de talla fácil
          </p>
        </div>
      </section>

    </EcommerceTemplate>
  )
}