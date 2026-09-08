import { useState, useCallback, useMemo, useEffect } from "react"
import { useCart } from "@/contexts/CartContext"
import type { CartProductItem } from "@/contexts/CartContext"
import { useCheckout } from "@/hooks/useCheckout"
import { useSettings } from "@/contexts/SettingsContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { callEdgeFetch } from "@/lib/edge"
import { STORE_ID } from "@/lib/config"
import { validateDiscount, type Discount } from "@/lib/discount-utils"
import { usePriceRules } from "@/hooks/usePriceRules"
import { priceCartItems } from "@/lib/cart-pricing"
import { calcSubscriptionPrice } from "@/lib/subscription-utils"
import type { BogoConditions } from "@/lib/supabase"

export const useCartLogic = () => {
  const { state, updateQuantity, removeItem, addBundle, addItem } = useCart()
  const navigate = useNavigate()
  const { checkout, isLoading: isCreatingOrder } = useCheckout()
  const { currencyCode } = useSettings()
  const { toast } = useToast()
  const { priceRules } = usePriceRules()

  const volumeRules = useMemo(() => priceRules.filter(r => r.rule_type === 'volume'), [priceRules])
  const allBogoRules = useMemo(() => priceRules.filter(r => r.rule_type === 'bogo'), [priceRules])

  /**
   * Single source of truth for line prices and the cart total. Volume tiers are
   * resolved against every eligible unit in scope, so an M and an L reach the
   * two-unit tier together instead of each line asking on its own.
   */
  const cartPricing = useMemo(
    () => priceCartItems(state.items, {
      volumeRules,
      bogoRules: allBogoRules,
      calcSubscriptionPriceFn: calcSubscriptionPrice,
    }),
    [state.items, volumeRules, allBogoRules]
  )

  const getItemVolumeDiscount = useCallback((item: any) => {
    const line = cartPricing.lines.get(item.key)
    if (line) {
      return {
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        volumeDiscount: line.volumeDiscount,
        bogoDiscount: line.bogoDiscount,
      }
    }
    const fallbackPrice = item.type === 'bundle'
      ? item.bundle.bundle_price
      : (item.variant?.price ?? item.product?.price) || 0
    return {
      unitPrice: fallbackPrice,
      lineTotal: fallbackPrice * item.quantity,
      volumeDiscount: null,
      bogoDiscount: null,
    }
  }, [cartPricing])

  const adjustedTotal = cartPricing.total

  // Discount state
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  const validateCoupon = useCallback(async () => {
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
        toast({ title: "Descuento aplicado", description: `${result.discount.code} — ${result.discount.discount_type === 'percentage' ? `${result.discount.value}%` : `$${result.discount.value}`}` })
      } else {
        toast({ title: "Código no válido", description: result.error || "El código de descuento no existe" })
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo verificar el código" })
    } finally {
      setIsValidatingCoupon(false)
    }
  }, [couponCode, state.total, state.items, toast])

  const removeCoupon = useCallback(() => {
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

      navigate('/checkout')
    } catch (error) {
      console.error('Error in handleCreateCheckout:', error)
    }
  }
  const bogoRules = allBogoRules

  // Auto-remove orphaned BOGO gift items
  useEffect(() => {
    const giftItems = state.items.filter(i => i.key.startsWith('bogo-gift:'))
    if (giftItems.length === 0 || bogoRules.length === 0) return

    for (const giftItem of giftItems) {
      const giftProductId = giftItem.key.replace('bogo-gift:', '')
      let stillTriggered = false
      for (const rule of bogoRules) {
        const cond = rule.conditions as BogoConditions | undefined
        if (!cond || cond.bogo_mode !== 'different_products') continue
        if (!cond.get_product_ids?.includes(giftProductId)) continue

        for (const cartItem of state.items) {
          if (cartItem.type !== 'product' || !(cartItem as CartProductItem).product) continue
          if ((cartItem as CartProductItem).isBogoGift) continue
          const pid = (cartItem as CartProductItem).product.id
          const applies =
            rule.applies_to === 'all' ||
            (rule.applies_to === 'specific_products' && rule.product_ids?.includes(pid))
          if (applies && cartItem.quantity >= cond.buy_quantity) {
            stillTriggered = true
            break
          }
        }
        if (stillTriggered) break
      }
      if (!stillTriggered) {
        removeItem(giftItem.key)
      }
    }
  }, [state.items, bogoRules, removeItem])

  return {
    items: state.items,
    total: state.total,
    itemCount: state.items.length,
    isEmpty: state.items.length === 0,
    updateQuantity,
    removeItem,
    addItem,
    addBundle,
    handleCreateCheckout,
    handleNavigateHome: () => navigate('/'),
    handleNavigateBack: () => navigate('/'),
    isCreatingOrder,
    currencyCode,
    onCheckoutStart: () => {},
    onCheckoutComplete: () => {},
    // Discount
    couponCode,
    setCouponCode,
    discount,
    isValidatingCoupon,
    validateCoupon,
    removeCoupon,
    // Volume & BOGO
    adjustedTotal,
    cartBaseTotal: cartPricing.baseTotal,
    cartSavings: cartPricing.savings,
    getItemVolumeDiscount,
    bogoRules,
  }
}