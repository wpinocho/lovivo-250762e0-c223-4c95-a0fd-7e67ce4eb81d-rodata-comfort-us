import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/CartContext"
import type { CartProductItem } from "@/contexts/CartContext"
import { useCheckout } from "@/hooks/useCheckout"
import { useSettings } from "@/contexts/SettingsContext"
import { Minus, Plus, Trash2, ExternalLink, Package, X, Loader2, Tag, RefreshCw, Gift } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { FreeShippingBar } from "@/components/ui/FreeShippingBar"
import { useToast } from "@/hooks/use-toast"
import { callEdgeFetch } from "@/lib/edge"
import { STORE_ID } from "@/lib/config"
import { validateDiscount, type Discount } from "@/lib/discount-utils"
import { intervalLabel, calcSubscriptionPrice } from "@/lib/subscription-utils"
import { usePriceRules } from "@/hooks/usePriceRules"
import { calcItemUnitPrice } from "@/lib/price-rule-utils"
import { BOGOGiftBanner } from "@/components/ui/BOGOGiftBanner"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { state, updateQuantity, removeItem, clearCart, addItem } = useCart()
  const navigate = useNavigate()
  const { checkout, isLoading: isCreatingOrder } = useCheckout()
  const { currencyCode, formatMoney } = useSettings()
  const { toast } = useToast()
  const { getVolumeRulesForProduct, getBogoRulesForProduct, priceRules } = usePriceRules()

  // Discount state
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  const handleValidateCoupon = useCallback(async () => {
    const code = couponCode.trim()
    if (!code) return

    setIsValidatingCoupon(true)
    try {
      const result = await callEdgeFetch("verify-discount", {
        store_id: STORE_ID,
        code,
      })

      if (result.discount) {
        const cartQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0)
        const validation = validateDiscount(result.discount, state.total, cartQuantity)

        if (!validation.valid) {
          toast({ title: "Código no válido", description: validation.message })
          return
        }

        setDiscount(result.discount)
        try { sessionStorage.setItem("pendingDiscount", code) } catch {}
        toast({ title: "Descuento aplicado", description: `${result.discount.code}` })
      } else {
        toast({ title: "Código no válido", description: result.error || "El código de descuento no existe" })
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo verificar el código" })
    } finally {
      setIsValidatingCoupon(false)
    }
  }, [couponCode, state.total, state.items, toast])

  const handleRemoveCoupon = useCallback(() => {
    setDiscount(null)
    setCouponCode("")
    try { sessionStorage.removeItem("pendingDiscount") } catch {}
  }, [])

  const handleCreateCheckout = async () => {
    try {
      try {
        sessionStorage.setItem('checkout_cart', JSON.stringify({ items: state.items, total: state.total }))
      } catch {}

      const discountCode = discount?.code || undefined
      const order = await checkout({ currencyCode, discountCode })

      try {
        sessionStorage.setItem('checkout_order', JSON.stringify(order))
        sessionStorage.setItem('checkout_order_id', String(order.order_id))
      } catch (e) {
        console.error('Error saving to sessionStorage:', e)
      }

      onClose()
      navigate('/pagar')
    } catch (error) {
      console.error('Error in handleCreateCheckout:', error)
    }
  }

  // Calculate adjusted total with volume + bogo discounts
  const adjustedTotal = useMemo(() => {
    let total = 0
    for (const item of state.items) {
      if (item.type === 'bundle') {
        total += item.bundle.bundle_price * item.quantity
      } else {
        if ((item as CartProductItem).isBogoGift) continue
        const basePrice = (item.variant?.price ?? item.product.price) || 0
        const volumeRules = getVolumeRulesForProduct(item.product.id)
        const bogoRules = getBogoRulesForProduct(item.product.id)
        const sp = (item as CartProductItem).sellingPlan || null
        const { unitPrice } = calcItemUnitPrice(basePrice, item.quantity, volumeRules, sp, calcSubscriptionPrice, bogoRules)
        total += unitPrice * item.quantity
      }
    }
    return total
  }, [state.items, getVolumeRulesForProduct, getBogoRulesForProduct])

  const bogoRules = useMemo(() => priceRules.filter(r => r.rule_type === 'bogo'), [priceRules])

  const finalTotal = adjustedTotal

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 p-0 border-l border-white/10" style={{ backgroundColor: '#111315', color: '#F5F7F8' }} aria-describedby="cart-description">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SheetTitle className="flex items-center gap-2 font-sora" style={{ color: '#F5F7F8' }}>
              Carrito de Compras
              <Link to="/carrito" onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: '#F5F7F8' }}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </SheetTitle>
            <div id="cart-description" className="sr-only">
              Revisa y modifica los productos en tu carrito de compras
            </div>
          </SheetHeader>

          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2" style={{ color: '#F5F7F8' }}>Tu carrito está vacío</h3>
                <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Agrega algunos productos para comenzar tu compra</p>
                <Button onClick={onClose} variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8', backgroundColor: 'transparent' }}>Seguir Comprando</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 pt-4 space-y-3">
                <FreeShippingBar cartTotal={state.total} cartQuantity={state.items.reduce((sum, i) => sum + i.quantity, 0)} />
                <BOGOGiftBanner
                  cartItems={state.items as any}
                  bogoRules={bogoRules}
                  onAddGift={(product, variant) => addItem(product, variant, undefined, true)}
                  isProductInCart={(pid) => state.items.some(i => i.type === 'product' && (i as CartProductItem).product.id === pid)}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {state.items.map((item) => (
                  <Card key={item.key} style={{ backgroundColor: '#1D2125', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <CardContent className="p-4">
                      {item.type === 'bundle' ? (
                        /* --- Bundle Item --- */
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative" style={{ backgroundColor: '#111315' }}>
                            {item.bundle.images?.[0] ? (
                              <img src={item.bundle.images[0]} alt={item.bundle.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ color: '#6B7280' }}>
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm line-clamp-2" style={{ color: '#F5F7F8' }}>{item.bundle.title}</h4>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0" style={{ backgroundColor: '#2A2F35', color: '#9CA3AF' }}>Paquete</Badge>
                            </div>
                            <p className="text-xs mb-2 line-clamp-2" style={{ color: '#6B7280' }}>
                              {item.bundleItems.map(bi => `${bi.quantity}x ${bi.product.title}`).join(' + ')}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="h-7 w-7" style={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8' }}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium px-2 text-sm" style={{ color: '#F5F7F8' }}>{item.quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="h-7 w-7" style={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8' }}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-sm" style={{ color: '#C9840A' }}>
                                  {formatMoney(item.bundle.bundle_price * item.quantity)}
                                </div>
                                {item.bundle.compare_at_price && item.bundle.compare_at_price > item.bundle.bundle_price && (
                                  <div className="text-xs line-through" style={{ color: '#6B7280' }}>
                                    {formatMoney(item.bundle.compare_at_price * item.quantity)}
                                  </div>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => removeItem(item.key)} className="p-0 h-auto mt-1" style={{ color: '#EF4444' }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* --- Product Item --- */
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: '#111315' }}>
                            {(item.product.images && item.product.images.length > 0) || item.variant?.image || item.variant?.image_urls?.length ? (
                              <img src={item.variant?.image_urls?.[0] || item.variant?.image || item.product.images![0]} alt={item.product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#6B7280' }}>No image</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2" style={{ color: '#F5F7F8' }}>
                              {item.product.title}{item.variant?.title ? ` - ${item.variant.title}` : ''}
                            </h4>
                            {item.type === 'product' && (item as CartProductItem).sellingPlan && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ backgroundColor: '#2A2F35', color: '#C9840A' }}>
                                  <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                  Suscripción
                                </Badge>
                                <span className="text-xs" style={{ color: '#6B7280' }}>
                                  cada {intervalLabel(
                                    (item as CartProductItem).sellingPlan!.interval,
                                    (item as CartProductItem).sellingPlan!.interval_count
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              {(item as CartProductItem).isBogoGift ? (
                                /* Gift item: no qty controls, show GRATIS */
                                <>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0" style={{ backgroundColor: '#2A2F35', color: '#C9840A' }}>
                                    <Gift className="h-2.5 w-2.5 mr-0.5" />
                                    Regalo
                                  </Badge>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm" style={{ color: '#C9840A' }}>GRATIS</div>
                                    <div className="text-xs line-through" style={{ color: '#6B7280' }}>
                                      {formatMoney((item.variant?.price ?? item.product.price) || 0)}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.key)} className="p-0 h-auto mt-1" style={{ color: '#EF4444' }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                /* Regular product */
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="h-7 w-7" style={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8' }}>
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="font-medium px-2 text-sm" style={{ color: '#F5F7F8' }}>{item.quantity}</span>
                                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="h-7 w-7" style={{ backgroundColor: '#111315', borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8' }}>
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="text-right">
                                    {(() => {
                                      const basePrice = (item.variant?.price ?? item.product.price) || 0
                                      const volumeRules = getVolumeRulesForProduct(item.product.id)
                                      const bogoRulesForItem = getBogoRulesForProduct(item.product.id)
                                      const sp = (item as CartProductItem).sellingPlan || null
                                      const { unitPrice, volumeDiscount, bogoDiscount } = calcItemUnitPrice(basePrice, item.quantity, volumeRules, sp, calcSubscriptionPrice, bogoRulesForItem)
                                      const activeDiscount = volumeDiscount || bogoDiscount
                                      return (
                                        <>
                                          <div className="font-semibold text-sm" style={{ color: '#C9840A' }}>
                                            {formatMoney(unitPrice * item.quantity)}
                                          </div>
                                          {activeDiscount && (
                                            <>
                                              <div className="text-xs line-through" style={{ color: '#6B7280' }}>
                                                {formatMoney(activeDiscount.originalPrice * item.quantity)}
                                              </div>
                                              <span className="text-[10px] font-medium" style={{ color: '#C9840A' }}>{activeDiscount.savingsLabel}</span>
                                            </>
                                          )}
                                        </>
                                      )
                                    })()}
                                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.key)} className="p-0 h-auto mt-1" style={{ color: '#EF4444' }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="space-y-3">
                  {/* Discount code input */}
                  {!discount ? (
                    <div className="flex gap-2">
                      <input
                        placeholder="Código de descuento"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                        disabled={isValidatingCoupon}
                        className="flex-1 h-9 rounded-md px-3 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                        style={{ backgroundColor: '#0d0f11', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F7F8' }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidateCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="shrink-0 h-9"
                        style={{ backgroundColor: '#1D2125', borderColor: 'rgba(255,255,255,0.15)', color: '#F5F7F8' }}
                      >
                        {isValidatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-md px-3 py-2" style={{ border: '1px solid rgba(201,132,10,0.4)', backgroundColor: 'rgba(201,132,10,0.08)' }}>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-3.5 w-3.5" style={{ color: '#C9840A' }} />
                        <span className="font-medium" style={{ color: '#F5F7F8' }}>{discount.code}</span>
                        <span style={{ color: '#C9840A' }}>
                          {discount.discount_type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="h-auto p-1" style={{ color: '#6B7280' }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold text-lg" style={{ color: '#F5F7F8' }}>
                    <span>Total</span>
                    <span style={{ color: '#C9840A' }}>{formatMoney(finalTotal)}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg" onClick={handleCreateCheckout} disabled={isCreatingOrder}>
                  {isCreatingOrder ? 'Procesando...' : 'Pagar'}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}