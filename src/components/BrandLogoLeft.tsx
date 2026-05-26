import { Link } from 'react-router-dom'

export const BrandLogoLeft = () => {
  return (
    <Link to="/" aria-label="RODATA — Lumbar Support for Riders" className="flex items-center group">
      <span className="font-sora font-bold text-xl tracking-widest select-none uppercase">
        <span className="text-brand-offwhite">ROD</span><span className="text-brand-amber">ATA</span>
      </span>
    </Link>
  )
}