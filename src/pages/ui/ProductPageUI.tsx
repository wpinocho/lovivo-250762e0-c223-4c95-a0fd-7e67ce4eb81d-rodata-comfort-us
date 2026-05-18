// ProductPageUI v3 — rodata.mx premium PDP (rebuild trigger)
import React, { useEffect, useState } from "react"
import ProductExpressCheckout from "@/components/ProductExpressCheckout"
import { useInView } from "react-intersection-observer"
import { Skeleton } from "@/components/ui/skeleton"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import {
  Star, Check, Ruler, Truck, RotateCcw, MessageSquare,
  ChevronRight, ArrowLeft, ShoppingCart, Plus, Minus,
  ChevronDown, ChevronUp, SlidersHorizontal, Wind, Layers
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const LIFESTYLE_CITY    = '/pdp-lifestyle-1.jpg'
const LIFESTYLE_HIGHWAY = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775768374485-uca4dkx21g.webp'
const FEATURES_ES       = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775767354281-gqxi2j4hklp.webp'
const PRODUCT_WORN      = '/product-worn.jpg'
const PRODUCT_FLAT      = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775767354281-gqxi2j4hklp.webp'

// Feature section images (user-provided)
const FEAT_IMG_1 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775777133671-80hvv9dmxa.webp'
const FEAT_IMG_2 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775777133672-xhxki05535d.webp'
const FEAT_IMG_3 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/message-images/0f3c776b-9309-4486-bd63-fd732b7d8db1/1775777133672-dzkdrl1lt2.webp'

const SIZE_GUIDE = [
  { size: 'S',  waist: '60–75 cm',   recom: 'Cintura delgada' },
  { size: 'M',  waist: '75–90 cm',   recom: 'Talla promedio'  },
  { size: 'L',  waist: '90–100 cm',  recom: 'Talla grande'    },
  { size: 'XL', waist: '100–115 cm', recom: 'Extra grande'    },
]

const FEATURES: { number: string; icon: React.ElementType; title: string; desc: React.ReactNode; image: string }[] = [
  { number: '01', icon: Layers, title: 'Termina cada rodada sin el dolor de siempre',
    desc: (
      <>
        En la moto, tu cuerpo va inclinado hacia adelante durante horas,{' '}
        <strong className="text-brand-smoke">esa postura carga tu zona lumbar de una forma que no te das cuenta hasta que ya duele</strong>.
        El Rodata One actúa exactamente ahí:{' '}
        <strong className="text-brand-smoke">soporte firme que distribuye esa tensión</strong> sin restringirte.
        Lo pones, arrancas y te olvidas de él.
      </>
    ), image: FEAT_IMG_1 },
  { number: '02', icon: SlidersHorizontal, title: 'Rueda horas sin detenerte a ajustar nada',
    desc: (
      <>
        No es rígido como una faja de gimnasio,{' '}
        <strong className="text-brand-smoke">es flexible y se mueve contigo mientras manejas</strong>, sin restricciones.
        El sistema de doble correa lo mantiene{' '}
        <strong className="text-brand-smoke">exactamente en el mismo lugar desde que arrancas hasta que bajas</strong>.
        Sin que se corra. Sin que apriete de más. En trayectos largos, el equipo tiene que trabajar contigo — no en tu contra.
      </>
    ), image: FEAT_IMG_2 },
  { number: '03', icon: Wind, title: 'Bajo la chamarra, sin que lo notes',
    desc: (
      <>
        <strong className="text-brand-smoke">Textil negro mate con malla perforada transpirable</strong>: construcción técnica y perfil bajo
        diseñado para{' '}
        <strong className="text-brand-smoke">no estorbar debajo de cualquier chamarra de moto</strong>.
        A diferencia de los soportes genéricos, no presiona donde no debe ni sobresale.
        Resiste el uso diario, los climas y las temporadas largas{' '}
        <strong className="text-brand-smoke">sin deformarse ni perder estructura</strong>.
      </>
    ), image: FEAT_IMG_3 },
]

const REVIEW_IMG_1 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-1.webp'
const REVIEW_IMG_2 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-2.webp'
const REVIEW_IMG_3 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-3.webp'
const REVIEW_IMG_4 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-4.webp'
const REVIEW_IMG_5 = 'https://ptgmltivisbtvmoxwnhd.supabase.co/storage/v1/object/public/product-images/cdddcb57-6bb6-4cd1-8062-d3fa8617d1cf/review-5.webp'

const REVIEWS = [
  { name: 'Carlos M.', city: 'CDMX',        stars: 5, initial: 'C', date: 'Mar 2025', photo: REVIEW_IMG_1, text: 'Trayecto CDMX–Querétaro y llegué mucho menos tenso. Ya es parte de mi equipo en cada salida.' },
  { name: 'Jorge R.',  city: 'Guadalajara', stars: 5, initial: 'J', date: 'Feb 2025', photo: REVIEW_IMG_2, text: 'Firme y cómodo. Cabe perfecto bajo la chamarra, no se nota y no estorba. La calidad se siente.' },
  { name: 'Andrés V.', city: 'Monterrey',   stars: 5, initial: 'A', date: 'Mar 2025', photo: REVIEW_IMG_3, text: 'Llevo años rodando y siempre terminaba tenso. Con el Rodata One llego mucho más fresco. Vale la pena.' },
  { name: 'Miguel T.', city: 'Puebla',      stars: 4, initial: 'M', date: 'Ene 2025', photo: REVIEW_IMG_4, text: 'La talla M me quedó exacta con la guía. El ajuste con las correas es muy fácil. Lo recomiendo.' },
  { name: 'Rodrigo S.', city: 'CDMX',       stars: 5, initial: 'R', date: 'Feb 2025', photo: REVIEW_IMG_5, text: 'Compré dudando si iba a ser incómodo — es todo lo contrario. Sale conmigo en cada rodada.' },
]

const FAQS = [
  { q: '¿Se puede usar debajo de la chamarra?', a: 'Sí, está diseñado para eso. Su perfil bajo lo hace prácticamente invisible bajo tu equipo habitual.' },
  { q: '¿Cómo elijo mi talla?', a: 'Mide tu cintura a la altura del ombligo y compara con la guía en esta página. Entre dos tallas, elige la mayor.' },
  { q: '¿Sirve para trayectos largos y uso diario?', a: 'Sí para ambos. Construido para uso frecuente en ciudad y carretera. Varios clientes lo usan todos los días.' },
  { q: '¿Se siente muy apretado?', a: 'El panel da soporte firme pero no restringe el movimiento. El nivel de compresión depende de cómo ajustes las correas.' },
  { q: '¿Cuánto tarda el envío?', a: 'Enviamos a todo México. El tiempo estimado se muestra al hacer la compra. El envío es sin costo.' },
  { q: '¿Cómo funciona el cambio de talla?', a: 'Contáctanos por WhatsApp y te guiamos. Queremos que el ajuste sea el correcto para ti.' },
]

const Stars = ({ count, size = 14 }: { count: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size} fill={s <= count ? '#C98B2E' : 'transparent'} className={s <= count ? 'text-brand-amber' : 'text-brand-steel/30'} />
    ))}
  </div>
)

interface ProductPageUIProps {
  logic: {
    product: any; loading: boolean; notFound: boolean
    selected: Record<string, string>; quantity: number; matchingVariant: any
    currentPrice: number; currentCompareAt: number | null; currentImage: string | null
    displayImages?: string[]; inStock: boolean
    handleOptionSelect: (n: string, v: string) => void
    handleQuantityChange: (q: number) => void
    handleAddToCart: () => void; handleBuyNow: () => void
    handleNavigateBack: () => void
    isOptionValueAvailable: (n: string, v: string) => boolean
    formatMoney: (a: number) => string
    [key: string]: any
  }
}

export const ProductPageUI = ({ logic }: ProductPageUIProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [expressAvailable, setExpressAvailable] = useState(false)
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0 })

  const productImages: string[] = logic.displayImages?.length ? logic.displayImages : [PRODUCT_FLAT, PRODUCT_WORN]
  const displayImage = selectedImage ?? productImages[0]
  const discountPct = logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice
    ? Math.round((1 - logic.currentPrice / logic.currentCompareAt) * 100) : null

  useEffect(() => { setSelectedImage(null) }, [logic.matchingVariant])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (logic.loading) return (
    <EcommerceTemplate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /><Skeleton className="h-12 w-full" /></div>
      </div>
    </EcommerceTemplate>
  )

  if (logic.notFound) return (
    <EcommerceTemplate>
      <div className="text-center py-20">
        <h1 className="font-sora font-bold text-brand-carbon text-4xl mb-4">Producto no encontrado</h1>
        <p className="text-brand-steel mb-8 font-inter">El producto no existe o fue eliminado.</p>
        <Link to="/"><button className="btn-amber font-sora"><ArrowLeft size={16} />Volver</button></Link>
      </div>
    </EcommerceTemplate>
  )

  if (!logic.product) return null
  const handlePrimary = logic.handleBuyNow ?? logic.handleAddToCart

  return (
    <EcommerceTemplate
      layout="full-width"
      noPadding
      hideFloatingCartOnMobile
      navLinks={[
        { label: 'Por qué funciona', href: '#por-que-funciona' },
        { label: 'Opiniones', href: '#opiniones' },
        { label: 'FAQ', href: '#faq' },
      ]}
    >

      {/* ── 1. MAIN PRODUCT ── */}
      <section style={{ backgroundColor: '#111315' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14">
          <button onClick={logic.handleNavigateBack} className="flex items-center gap-1.5 text-brand-steel hover:text-brand-smoke text-xs font-inter mb-6 transition-colors">
            <ArrowLeft size={13} />Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Gallery */}
            <div className="space-y-3 lg:sticky lg:top-[80px]">
              <div className="hidden md:block relative rounded-2xl overflow-hidden bg-brand-graphite aspect-square">
                <img src={displayImage} alt={logic.product.title} className="w-full h-full object-cover" loading="eager" />
                {discountPct && <div className="absolute top-4 left-4 bg-brand-amber text-brand-carbon text-xs font-bold px-2.5 py-1 rounded-md font-sora">-{discountPct}%</div>}
                <div className="absolute bottom-3 right-3 bg-brand-carbon/80 backdrop-blur-sm text-brand-smoke text-[10px] font-inter px-2 py-1 rounded border border-white/[0.08]">rodata.mx</div>
              </div>
              <div className="md:hidden relative">
                {productImages.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {productImages.map((img, i) => (
                        <CarouselItem key={i}><div className="aspect-square rounded-2xl overflow-hidden bg-brand-graphite"><img src={img} alt={`${logic.product.title} ${i+1}`} className="w-full h-full object-cover" /></div></CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-3" /><CarouselNext className="right-3" />
                  </Carousel>
                ) : (
                  <div className="aspect-square rounded-2xl overflow-hidden bg-brand-graphite"><img src={displayImage} alt={logic.product.title} className="w-full h-full object-cover" /></div>
                )}
                {discountPct && <div className="absolute top-4 left-4 bg-brand-amber text-brand-carbon text-xs font-bold px-2.5 py-1 rounded-md font-sora">-{discountPct}%</div>}
              </div>
              {productImages.length > 1 && (
                <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
                  {productImages.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(img)} className={cn("flex-shrink-0 w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all", (selectedImage === img || (!selectedImage && i === 0)) ? "border-brand-amber" : "border-white/10 hover:border-white/30")}>
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-brand-amber block" />
                <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em]">Diseñado para la postura de manejo</span>
              </div>
              <h1 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl leading-tight">{logic.product.title}</h1>
              <div className="flex items-center gap-3">
                <Stars count={5} size={15} />
                <span className="text-brand-smoke text-sm font-inter">4.9 <span className="text-brand-steel">· 127 reseñas verificadas</span></span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-sora font-bold text-brand-offwhite text-4xl">{logic.formatMoney(logic.currentPrice)}</span>
                {logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice && (
                  <><span className="text-brand-steel text-xl line-through font-inter">{logic.formatMoney(logic.currentCompareAt)}</span>
                  <span className="bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold px-2.5 py-1 rounded font-sora">{discountPct}% OFF</span></>
                )}
              </div>
              <div className="border-t border-white/[0.08] pt-5 space-y-3">
                <p className="text-brand-smoke text-sm leading-relaxed font-inter">
                  El soporte confiado por los motociclistas mexicanos diseñado para eliminar el dolor de espalda.
                </p>
                <div className="space-y-2">
                  {['Baja de la moto sin ese dolor que acumulas en cada rodada', 'Flexible: se mueve contigo y no estorba el manejo ni bajo la chamarra', 'Ajuste en segundos y se queda exactamente donde lo pusiste'].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center flex-shrink-0"><Check size={9} className="text-brand-amber" /></div>
                      <span className="text-brand-smoke text-xs font-inter">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              {logic.product.options?.length > 0 && (
                <div className="border-t border-white/[0.08] pt-5 space-y-3">
                  {logic.product.options.map((option: any) => (
                    <div key={option.name}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-brand-smoke text-sm font-sora font-semibold">
                          {option.name}
                          {logic.selected[option.name] && <span className="text-brand-steel font-inter font-normal ml-2">· {SIZE_GUIDE.find(s => s.size === logic.selected[option.name])?.waist ?? logic.selected[option.name]}</span>}
                        </p>
                        <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="flex items-center gap-1 text-brand-amber text-xs font-inter underline underline-offset-2">
                          Guía de tallas {showSizeGuide ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                        </button>
                      </div>
                      {showSizeGuide && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/[0.08]">
                          <div className="grid grid-cols-3 bg-brand-graphite px-4 py-2 text-[10px] font-sora text-brand-steel uppercase tracking-wider"><span>Talla</span><span>Cintura</span><span>Tipo</span></div>
                          {SIZE_GUIDE.map(sg => (
                            <div key={sg.size} className={cn("grid grid-cols-3 px-4 py-2.5 text-xs font-inter border-t border-white/[0.06]", logic.selected[option.name] === sg.size ? "bg-brand-amber/10 text-brand-offwhite" : "text-brand-steel")}>
                              <span className="font-sora font-semibold text-brand-smoke">{sg.size}</span><span>{sg.waist}</span><span>{sg.recom}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value: string) => {
                          const isSelected = logic.selected[option.name] === value
                          const isAvailable = logic.isOptionValueAvailable(option.name, value)
                          const sg = SIZE_GUIDE.find(s => s.size === value)
                          return (
                            <button key={value} disabled={!isAvailable} onClick={() => logic.handleOptionSelect(option.name, value)}
                              className={cn("flex flex-col items-center min-w-[68px] px-3 py-2.5 rounded-xl border text-sm transition-all font-sora",
                                isSelected ? "bg-brand-amber text-brand-carbon border-brand-amber font-bold shadow-[0_0_16px_rgba(201,139,46,0.3)]"
                                : isAvailable ? "bg-brand-graphite border-white/[0.12] text-brand-smoke hover:border-brand-amber/50"
                                : "opacity-40 cursor-not-allowed bg-brand-graphite border-white/[0.08] text-brand-steel")}>
                              <span className="font-bold">{value}</span>
                              {sg && <span className={cn("text-[10px] font-inter mt-0.5", isSelected ? "text-brand-carbon/70" : "text-brand-steel")}>{sg.waist}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-brand-smoke text-sm font-inter">Cantidad:</span>
                <div className="flex items-center rounded-xl overflow-hidden border border-white/[0.12]">
                  <button onClick={() => logic.handleQuantityChange(Math.max(1, logic.quantity - 1))} disabled={logic.quantity <= 1} className="px-3.5 py-2.5 text-brand-smoke hover:text-brand-offwhite hover:bg-brand-graphite transition-colors disabled:opacity-40"><Minus size={14}/></button>
                  <span className="px-4 py-2.5 text-brand-offwhite font-sora font-bold text-sm border-x border-white/[0.12] min-w-[44px] text-center">{logic.quantity}</span>
                  <button onClick={() => logic.handleQuantityChange(logic.quantity + 1)} className="px-3.5 py-2.5 text-brand-smoke hover:text-brand-offwhite hover:bg-brand-graphite transition-colors"><Plus size={14}/></button>
                </div>
              </div>

              {/* Urgency / Stock signal */}
              {logic.inStock && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <span className="text-brand-smoke text-xs font-inter">En stock · Envío en 24–48 hrs</span>
                </div>
              )}

              {/* CTAs */}
              <div ref={ctaRef} className="flex flex-col gap-3">
                {logic.inStock ? (
                  <>
                    {/* ── Express Checkout (Apple Pay / Google Pay) ── */}
                    <ProductExpressCheckout
                      product={logic.product}
                      variant={logic.matchingVariant}
                      sellingPlan={logic.selectedPlan ?? null}
                      quantity={logic.quantity}
                      unitPrice={logic.currentPrice}
                      onAvailabilityChange={setExpressAvailable}
                    />
                    {expressAvailable && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/[0.1]" />
                        <span className="text-brand-steel text-[10px] font-inter uppercase tracking-wider">o</span>
                        <div className="flex-1 h-px bg-white/[0.1]" />
                      </div>
                    )}
                    <button onClick={handlePrimary} className="btn-amber-lg amber-glow font-sora w-full text-base">
                      <ShoppingCart size={18}/>Comprar ahora · {logic.formatMoney(logic.currentPrice)}
                    </button>
                    <button onClick={logic.handleAddToCart} className="btn-outline-light font-sora w-full">Agregar al carrito</button>
                    <p className="text-brand-steel text-[11px] font-inter text-center">
                      🔒 Pago seguro · Envío gratis · 30 días de prueba
                    </p>
                  </>
                ) : (
                  <button disabled className="btn-amber-lg font-sora w-full opacity-50 cursor-not-allowed">Agotado temporalmente</button>
                )}
              </div>

              {/* Trust row */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.08]">
                {[{icon: Truck, label: 'Envío gratis', sub: 'A todo México'}, {icon: RotateCcw, label: '30 días', sub: 'De prueba'}, {icon: Ruler, label: 'Cambio talla', sub: 'Sin costo'}].map(({icon: Icon, label, sub}) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center"><Icon size={13} className="text-brand-amber"/></div>
                    <p className="text-brand-smoke text-[11px] font-sora font-semibold leading-tight">{label}</p>
                    <p className="text-brand-steel text-[10px] font-inter">{sub}</p>
                  </div>
                ))}
              </div>
              <a href="https://wa.me/525531215386?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20Rodata%20One" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#25D366] text-xs font-inter hover:underline">
                <MessageSquare size={13}/>¿Tienes dudas? Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ── */}
      <section style={{ backgroundColor: '#1D2125' }} className="border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/[0.06]">
            {[{value:'+800', label:'Riders satisfechos'},{value:'4.9 ★', label:'Calificación promedio'},{value:'100%', label:'Envíos en México'}].map(({value, label}) => (
              <div key={label} className="py-1">
                <p className="font-sora font-bold text-brand-amber text-xl sm:text-2xl">{value}</p>
                <p className="text-brand-steel text-xs font-inter mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. LIFESTYLE BREAK ── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={LIFESTYLE_HIGHWAY} alt="Rider mexicano con Soporte Lumbar Rodata One en carretera" className="w-full h-full object-cover" loading="lazy"/>
          <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(17,19,21,0.92) 0%, rgba(17,19,21,0.55) 55%, rgba(17,19,21,0.2) 100%)'}}/>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">Para riders que no se rinden antes de tiempo</span>
            <h2 className="font-sora font-bold text-brand-offwhite text-4xl sm:text-5xl leading-[1.05] mb-5">Deja de bajar a estirar. Empieza a llegar mejor.</h2>
            <p className="text-brand-smoke text-lg font-inter leading-relaxed">El dolor de espalda no avisa. Simplemente llega en algún punto de la rodada. El Rodata One retrasa ese punto hasta mucho más lejos de lo que estás acostumbrado.</p>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES ── */}
      <section id="por-que-funciona" style={{backgroundColor:'#111315'}} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">Por qué funciona</span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl lg:text-5xl">Diseñado para que dures más en el camino</h2>
          </div>
          <div className="space-y-24">
            {FEATURES.map(({number, icon: Icon, title, desc, image}, idx) => (
              <div key={number} className={cn("grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center", idx % 2 !== 0 && "lg:grid-flow-dense")}>
                <div className={cn("relative rounded-2xl overflow-hidden", idx % 2 !== 0 && "lg:col-start-2")}>
                  <img src={image} alt={title} className="w-full aspect-square object-cover" loading="lazy"/>
                  <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(to bottom, transparent 55%, rgba(17,19,21,0.6) 100%)'}}/>
                </div>
                <div className={cn(idx % 2 !== 0 && "lg:col-start-1 lg:row-start-1")}>
                  <span className="font-sora font-bold text-brand-amber/15 text-8xl block leading-none mb-2 select-none">{number}</span>
                  <div className="h-10 w-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center mb-4"><Icon size={18} className="text-brand-amber"/></div>
                  <h3 className="font-sora font-bold text-brand-offwhite text-2xl sm:text-3xl mb-4">{title}</h3>
                  <p className="text-brand-smoke text-base leading-relaxed font-inter mb-6">{desc}</p>
                  <div className="h-px w-12 bg-brand-amber/40"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── 7. CITY LIFESTYLE ── */}
      <section className="relative overflow-hidden" style={{minHeight:'40vh'}}>
        <img src={LIFESTYLE_CITY} alt="Rider urbano con Rodata One en CDMX" className="w-full h-full object-cover absolute inset-0" loading="lazy"/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(17,19,21,0.3) 0%, rgba(17,19,21,0.75) 100%)'}}/>
        <div className="relative z-10 flex items-end min-h-[40vh] pb-10">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <blockquote>
              <p className="font-sora font-semibold text-brand-offwhite text-xl sm:text-2xl mb-2">"Ahora el Rodata One sale conmigo en cada rodada."</p>
              <cite className="text-brand-smoke text-sm font-inter not-italic">Carlos M., CDMX</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── 8. REVIEWS ── */}
      <section id="opiniones" style={{backgroundColor:'#111315'}} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-2 block">Reseñas verificadas</span>
              <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl">Lo que dicen los riders</h2>
            </div>
            <div className="flex items-center gap-4 bg-brand-graphite border border-white/[0.08] rounded-2xl px-6 py-4 flex-shrink-0">
              <div><p className="font-sora font-bold text-brand-amber text-3xl leading-none">4.9</p><div className="mt-1.5"><Stars count={5} size={11}/></div></div>
              <div className="h-12 w-px bg-white/[0.08]"/>
              <div><p className="text-brand-offwhite font-sora font-bold text-lg leading-none">127</p><p className="text-brand-steel text-xs font-inter mt-1">reseñas</p></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map(({name, city, stars, date, initial, text, photo}) => (
              <div key={name} className="bg-brand-graphite border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col hover:border-brand-amber/20 transition-colors duration-300">
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={photo} alt={`Foto de ${name} usando el Rodata One`} className="w-full h-full object-cover" loading="lazy"/>
                  <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, transparent 50%, rgba(17,19,21,0.7) 100%)'}}/>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Check size={10} className="text-brand-amber"/><span className="text-brand-amber text-[10px] font-inter font-medium">Compra verificada</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-center flex-shrink-0"><span className="font-sora font-bold text-brand-amber text-sm">{initial}</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sora font-semibold text-brand-offwhite text-sm">{name}</p>
                      <p className="text-brand-steel text-xs font-inter">{city} · {date}</p>
                    </div>
                  </div>
                  <Stars count={stars} size={12}/>
                  <blockquote className="text-brand-smoke text-sm font-inter leading-relaxed mt-3 flex-1">"{text}"</blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── 7. COMBINED: STEPS + TRUST ── */}
      <section style={{backgroundColor:'#1D2125'}} className="border-y border-white/[0.06] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">Simple de usar · Compra sin riesgo</span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl">Listo en segundos. Sin riesgo.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {step:'1', title:'Ajusta las correas', desc:'Coloca a la altura lumbar y ajusta hasta sentirlo firme.'},
              {step:'2', title:'Ponlo bajo tu chamarra', desc:'El perfil bajo lo hace discreto bajo cualquier chamarra.'},
              {step:'3', title:'Sale a rodar', desc:'Notarás la diferencia al bajarte.'},
            ].map(({step, title, desc}) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="h-10 w-10 rounded-full bg-brand-amber text-brand-carbon font-sora font-bold text-base flex items-center justify-center mb-4 amber-glow group-hover:scale-105 transition-transform">{step}</div>
                <h3 className="font-sora font-bold text-brand-offwhite text-base mb-1.5">{title}</h3>
                <p className="text-brand-steel text-sm font-inter leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] my-10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {icon:RotateCcw, title:'30 días de prueba', desc:'Si no te convence, lo resolvemos.'},
              {icon:Ruler, title:'Cambio de talla fácil', desc:'Para que el ajuste sea el correcto.'},
              {icon:Truck, title:'Envío gratis', desc:'Sin costo a todo México.'},
              {icon:MessageSquare, title:'Soporte WhatsApp', desc:'Personas reales que responden.'},
            ].map(({icon: Icon, title, desc}) => (
              <div key={title} className="bg-brand-carbon border border-white/[0.07] rounded-xl p-5 flex items-center gap-4 hover:border-brand-amber/20 transition-colors">
                <div className="h-10 w-10 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center flex-shrink-0"><Icon size={17} className="text-brand-amber"/></div>
                <div>
                  <h3 className="font-sora font-semibold text-brand-offwhite text-sm">{title}</h3>
                  <p className="text-brand-steel text-xs font-inter mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section id="faq" style={{backgroundColor:'#1D2125'}} className="border-t border-white/[0.06] py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-3 block">Resolvemos tus dudas</span>
            <h2 className="font-sora font-bold text-brand-offwhite text-3xl">Preguntas frecuentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map(({q, a}, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-brand-carbon border border-white/[0.07] rounded-xl px-6 data-[state=open]:border-brand-amber/20 transition-colors duration-200">
                <AccordionTrigger className="font-sora font-semibold text-brand-offwhite text-sm py-5 hover:no-underline hover:text-brand-amber [&>svg]:text-brand-amber">{q}</AccordionTrigger>
                <AccordionContent className="text-brand-smoke text-sm font-inter leading-relaxed pb-5">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── 11. FINAL CTA ── */}
      <section style={{backgroundColor:'#111315'}} className="border-t border-white/[0.08] py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-brand-amber text-xs font-sora font-semibold uppercase tracking-[0.18em] mb-4 block">Rodata One</span>
          <h2 className="font-sora font-bold text-brand-offwhite text-3xl sm:text-4xl leading-tight mb-4">¿Cuántas rodadas más vas a terminar con dolor de espalda?</h2>
          <p className="text-brand-smoke font-inter text-sm mb-8">Envío gratis en México · 30 días de prueba · Cambio de talla fácil</p>
          <div className="flex items-baseline justify-center gap-3 mb-7">
            <span className="font-sora font-bold text-brand-offwhite text-4xl">{logic.formatMoney(logic.currentPrice)}</span>
            {logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice && <span className="text-brand-steel text-xl line-through font-inter">{logic.formatMoney(logic.currentCompareAt)}</span>}
          </div>
          <button onClick={handlePrimary} className="btn-amber-lg amber-glow font-sora text-base px-12">Comprar ahora<ChevronRight size={18}/></button>
        </div>
      </section>

      {/* ── STICKY BAR ── */}
      {logic.inStock && (
        <div className={cn("fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t border-white/[0.1] transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]", ctaInView ? "translate-y-full" : "translate-y-0")} style={{backgroundColor:'rgba(17,19,21,0.96)'}}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="hidden md:flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <h3 className="font-sora font-semibold text-brand-offwhite text-sm truncate">{logic.product.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-sora font-bold text-brand-offwhite">{logic.formatMoney(logic.currentPrice)}</span>
                  {logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice && <span className="text-brand-steel text-sm line-through font-inter">{logic.formatMoney(logic.currentCompareAt)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={handlePrimary} className="btn-amber amber-glow font-sora px-8"><ShoppingCart size={14}/>Comprar ahora</button>
                <button onClick={logic.handleAddToCart} className="btn-outline-light font-sora">Agregar al carrito</button>
              </div>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-sora font-bold text-brand-offwhite text-sm">{logic.formatMoney(logic.currentPrice)}</p>
                <p className="text-brand-steel text-xs font-inter truncate">{logic.product.title}</p>
              </div>
              <button onClick={handlePrimary} className="btn-amber amber-glow font-sora flex-shrink-0"><ShoppingCart size={14}/>Comprar ahora</button>
            </div>
          </div>
        </div>
      )}

    </EcommerceTemplate>
  )
}