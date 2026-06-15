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

const BUY_URL = '/products/rodata-one'

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Reviews', href: '/#reviews' },
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
      <div className="bg-brand-graphite border-b border-white/[0.06] py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Truck size={12} className="text-brand-amber shrink-0" />
            <span className="font-semibold text-brand-smoke">Free US Shipping</span>
          </div>
          <div className="h-3 w-px bg-white/[0.12]" />
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-brand-amber shrink-0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className="text-brand-smoke"><span className="font-semibold text-brand-offwhite">+1,000</span> Happy Riders</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-3 w-px bg-white/[0.12] mr-2" />
            <RotateCcw size={12} className="text-brand-amber shrink-0" />
            <span className="text-brand-smoke text-xs font-medium">30-Day Trial</span>
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
                aria-label="View cart"
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
                Buy now
              </button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-brand-smoke hover:text-brand-offwhite transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
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
                  Buy now
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
              Premium lumbar support for motorcyclists. Designed for riders who want to ride more and arrive better.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-sora font-semibold text-brand-smoke text-sm uppercase tracking-widest mb-5">Navigation</h3>
            <div className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'How it works', href: '/#how-it-works' },
                { label: 'Reviews', href: '/#reviews' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms & Conditions', href: '/terms-and-conditions' },
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
            <h3 className="font-sora font-semibold text-brand-smoke text-sm uppercase tracking-widest mb-5">Support</h3>
            <p className="text-brand-steel text-sm mb-4">Have questions? We're here to help.</p>
            <a
              href="mailto:support@getrodata.com"
              className="inline-flex items-center gap-2 bg-brand-amber/10 border border-brand-amber/30 text-brand-amber text-sm font-medium px-4 py-2.5 rounded transition-colors hover:bg-brand-amber/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              support@getrodata.com
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-steel text-xs">
            © 2025 Rodata — All rights reserved.
          </p>
          <p className="text-brand-steel/60 text-xs">
            Built for riders.
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