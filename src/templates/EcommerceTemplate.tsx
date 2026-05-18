import { ReactNode, useState } from 'react'
import { PageTemplate } from './PageTemplate'
import { BrandLogoLeft } from '@/components/BrandLogoLeft'
import { SocialLinks } from '@/components/SocialLinks'
import { FloatingCart } from '@/components/FloatingCart'
import { ProfileMenu } from '@/components/ProfileMenu'
import { Link } from 'react-router-dom'
import { ShoppingCart, Truck, RotateCcw, Ruler, Menu, X } from 'lucide-react'
import { useCartUISafe } from '@/components/CartProvider'
import { useCart } from '@/contexts/CartContext'
import { ScrollLink } from '@/components/ScrollLink'

interface NavLink {
  label: string
  href: string
}

interface EcommerceTemplateProps {
  children: ReactNode
  pageTitle?: string
  showCart?: boolean
  className?: string
  headerClassName?: string
  footerClassName?: string
  layout?: 'default' | 'full-width' | 'centered'
  hideFloatingCartOnMobile?: boolean
  noPadding?: boolean
  navLinks?: NavLink[]
}

const BUY_URL = '/productos/soporte-lumbar-rodata-one'

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Opiniones', href: '/#opiniones' },
  { label: 'FAQ', href: '/#faq' },
]

export const EcommerceTemplate = ({
  children,
  pageTitle,
  showCart = true,
  className,
  headerClassName,
  footerClassName,
  layout = 'default',
  hideFloatingCartOnMobile = false,
  noPadding = false,
  navLinks,
}: EcommerceTemplateProps) => {
  const cartUI = useCartUISafe()
  const openCart = cartUI?.openCart ?? (() => {})
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const resolvedNavLinks = navLinks ?? DEFAULT_NAV_LINKS

  const header = (
    <div className={headerClassName}>
      {/* Trust Bar */}
      <div className="bg-brand-graphite border-b border-white/[0.06] py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-10">
          <div className="hidden sm:flex items-center gap-1.5 text-brand-smoke text-xs font-medium">
            <Truck size={11} className="text-brand-amber shrink-0" />
            <span>Envío gratis en México</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-smoke text-xs font-medium">
            <RotateCcw size={11} className="text-brand-amber shrink-0" />
            <span>30 días de prueba</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-brand-smoke text-xs font-medium">
            <Ruler size={11} className="text-brand-amber shrink-0" />
            <span>Cambio de talla fácil</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-brand-carbon py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <BrandLogoLeft />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {resolvedNavLinks.map((link) => (
              <ScrollLink
                key={link.href}
                to={link.href}
                className="text-brand-smoke hover:text-brand-offwhite text-sm font-medium transition-colors duration-150 font-inter"
              >
                {link.label}
              </ScrollLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ProfileMenu />

            {showCart && (
              <button
                onClick={openCart}
                className="relative p-2 text-brand-smoke hover:text-brand-offwhite transition-colors"
                aria-label="Ver carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-amber text-brand-carbon text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center font-sora">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            )}

            <Link to={BUY_URL} className="hidden sm:block">
              <button className="btn-amber text-sm px-5 py-2 amber-glow">
                Comprar ahora
              </button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-brand-smoke hover:text-brand-offwhite transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] mt-3 pt-3 pb-2 space-y-1">
            {resolvedNavLinks.map((link) => (
              <ScrollLink
                key={link.href}
                to={link.href}
                className="block px-2 py-2.5 text-brand-smoke hover:text-brand-offwhite text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </ScrollLink>
            ))}
            <div className="pt-2">
              <Link to={BUY_URL} onClick={() => setMobileMenuOpen(false)}>
                <button className="btn-amber w-full text-sm py-3 amber-glow">
                  Comprar ahora
                </button>
              </Link>
            </div>
          </div>
        )}

        {pageTitle && (
          <div className="mt-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-offwhite font-sora">{pageTitle}</h1>
          </div>
        )}
      </div>
    </div>
  )

  const footer = (
    <div className={`bg-brand-carbon border-t border-white/[0.08] py-14 ${footerClassName ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <BrandLogoLeft />
            <p className="mt-4 text-brand-steel text-sm leading-relaxed max-w-xs">
              Soporte lumbar premium para motociclistas. Diseñado para riders que quieren rodar más y llegar mejor.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-sora font-semibold text-brand-smoke text-sm uppercase tracking-widest mb-5">Navegación</h3>
            <div className="space-y-3">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Cómo funciona', href: '/#como-funciona' },
                { label: 'Opiniones', href: '/#opiniones' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'Políticas de privacidad', href: '/aviso-de-privacidad' },
                { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-brand-steel hover:text-brand-smoke text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sora font-semibold text-brand-smoke text-sm uppercase tracking-widest mb-5">Contacto</h3>
            <p className="text-brand-steel text-sm mb-4">¿Tienes dudas? Escríbenos por WhatsApp.</p>
            <a
              href="https://wa.me/5215500000000?text=Hola,%20tengo%20una%20duda%20sobre%20el%20Soporte%20Lumbar%20Rodata%20One"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm font-medium px-4 py-2.5 rounded transition-colors hover:bg-[#25D366]/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-steel text-xs">
            © 2025 rodata.mx — Todos los derechos reservados.
          </p>
          <p className="text-brand-steel/60 text-xs">
            Hecho para riders mexicanos.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <PageTemplate
        header={header}
        footer={footer}
        className={className}
        layout={layout}
        noPadding={noPadding}
      >
        {children}
      </PageTemplate>

      {showCart && <FloatingCart hideOnMobile={hideFloatingCartOnMobile} />}
    </>
  )
}