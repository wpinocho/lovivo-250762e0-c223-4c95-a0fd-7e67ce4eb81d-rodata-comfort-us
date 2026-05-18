import { Link } from 'react-router-dom'

export const BrandLogoLeft = () => {
  return (
    <Link to="/" aria-label="rodata.mx — Inicio" className="flex items-center group">
      <span className="font-sora font-bold text-xl tracking-tight select-none">
        <span className="text-brand-offwhite">rodata</span>
        <span className="text-brand-amber">.mx</span>
      </span>
    </Link>
  )
}