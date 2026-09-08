import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Product as ProductType, type SellingPlan } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'
import { useCart } from '@/contexts/CartContext'
import type { CartProductItem } from '@/contexts/CartContext'
import { useCartUI } from '@/components/CartProvider'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/contexts/SettingsContext'
import { trackViewContent, trackAddToCart, tracking } from '@/lib/tracking-utils'
import { isVariantAvailable } from '@/lib/utils'
import { useSellingPlans } from '@/hooks/useSellingPlans'
import { calcSubscriptionPrice } from '@/lib/subscription-utils'
import { useCheckout } from '@/hooks/useCheckout'
import { usePriceRules } from '@/hooks/usePriceRules'
import { calcVolumeDiscount } from '@/lib/price-rule-utils'
import { priceCartItems } from '@/lib/cart-pricing'
import { roundMoney } from '@/lib/money'
import {
  buildSelectedPurchaseItems,
  getVariantAvailableUnits,
  validatePurchaseSelection,
} from '@/lib/pack-selection'

/**
 * FORBIDDEN HEADLESS COMPONENT - HeadlessProduct
 * 
 * Este componente contiene toda la lógica de negocio de la página de producto:
 * - Fetching de producto desde Supabase
 * - Manejo de variantes y opciones
 * - Cálculos de precios e inventario
 * - Lógica de imágenes y thumbnails
 * - Funciones de agregar al carrito con tracking
 * - Estados de carga y navegación
 */

export const useProductLogic = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selected, setSelected] = useState<Record<string, string>>({})
  // Second belt options stay empty until the shopper picks them: the pack must be
  // an explicit choice, never a copy of the first size.
  const [secondSelected, setSecondSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<SellingPlan | null>(null)
  
  const { addItem, getTotalItems } = useCart()
  const { openCart } = useCartUI()
  const { toast } = useToast()
  const { formatMoney, currencyCode } = useSettings()
  const { plans: sellingPlans } = useSellingPlans(product?.id)
  const { checkoutWithItems } = useCheckout()
  const { getVolumeRulesForProduct, getBogoRulesForProduct, loading: priceRulesLoading } = usePriceRules()
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isExpressProcessing, setIsExpressProcessing] = useState(false)
  const addToCartGuard = useRef(false)
  const buyNowGuard = useRef(false)

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .eq('store_id', STORE_ID)
        .single()

      if (error || !data) {
        setNotFound(true)
        return
      }

      setProduct(data)
      // Set first image as selected
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0])
      }
      
      // Track ViewContent event with proper formatting
      trackViewContent({
        products: [tracking.createTrackingProduct({
          id: data.id,
          title: data.title,
          price: data.price,
          category: 'product'
        })],
        value: data.price,
        currency: tracking.getCurrencyFromSettings(currencyCode)
      })
    } catch (error) {
      console.error('Error fetching product:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  // Auto-select first available value for each option
  useEffect(() => {
    if (!product) return
    
    const options = (product as any).options
    const variants = (product as any).variants
    const hasVariants = Array.isArray(variants) && variants.length > 0
    
    if (!hasVariants || !options?.length) return
    
    const newSelected = { ...selected }
    let hasChanges = false
    
    for (const opt of options) {
      if (!selected[opt.name]) {
        const availableValues = opt.values.filter((val: string) => isOptionValueAvailable(opt.name, val))
        
        if (availableValues.length > 0) {
          newSelected[opt.name] = availableValues[0]
          hasChanges = true
        }
      }
    }
    
    if (hasChanges) {
      setSelected(newSelected)
    }
  }, [product, selected])

  const tracksInventory = (product as any)?.track_inventory !== false

  /**
   * @param requiredUnits how many units of the resulting variant we need — picking
   * the same size for both belts must check stock for two, not for one.
   */
  const isOptionValueAvailableFor = (
    selection: Record<string, string>,
    optName: string,
    value: string,
    requiredUnits: number = 1
  ) => {
    if (!product) return false

    const variants = (product as any).variants
    if (!Array.isArray(variants)) return true

    if (!tracksInventory) return true

    return variants.some((v: any) => {
      const ov = v.options || {}

      if (ov[optName] !== value) return false

      for (const [selectedOptName, selectedValue] of Object.entries(selection)) {
        if (selectedOptName !== optName && ov[selectedOptName] !== selectedValue) {
          return false
        }
      }

      return getVariantAvailableUnits(v, tracksInventory) >= requiredUnits
    })
  }

  const isOptionValueAvailable = (optName: string, value: string) =>
    isOptionValueAvailableFor(selected, optName, value, 1)

  const getMatchingVariantFor = (selection: Record<string, string>) => {
    if (!product) return undefined
    
    const options = (product as any).options
    const variants = (product as any).variants
    const hasVariants = Array.isArray(variants) && variants.length > 0
    
    if (!hasVariants || !options?.length) return undefined
    
    for (const opt of options) {
      if (!selection[opt.name]) return undefined
    }
    
    return variants?.find((v: any) => {
      const ov = v.options || {}
      return options.every((opt: any) => ov[opt.name] === selection[opt.name])
    })
  }

  const getMatchingVariant = () => getMatchingVariantFor(selected)
  const getSecondMatchingVariant = () => getMatchingVariantFor(secondSelected)

  const getCurrentPrice = () => {
    const matchingVariant = getMatchingVariant()
    if (matchingVariant) return matchingVariant.price
    
    const variants = (product as any)?.variants
    if (Array.isArray(variants) && variants.length > 0) {
      return Math.min(...variants.map((v: any) => v.price))
    }
    
    return product?.price || 0
  }

  const getCurrentCompareAt = () => {
    const matchingVariant = getMatchingVariant()
    return matchingVariant?.compare_at_price ?? product?.compare_at_price
  }

  const getCurrentImage = () => {
    const matchingVariant = getMatchingVariant()
    return matchingVariant?.image || selectedImage || product?.images?.[0] || ''
  }

  // Helper para obtener imágenes a mostrar según variante seleccionada
  const getDisplayImages = (): string[] => {
    if (!product) return []
    
    const productImages = product.images || []
    const variants = (product as any).variants as any[] | undefined
    const matchingVariant = getMatchingVariant()
    
    // Recolectar TODAS las image_urls de TODAS las variantes
    const allVariantImageUrls = new Set<string>()
    if (Array.isArray(variants)) {
      variants.forEach((v: any) => {
        if (v.image_urls && Array.isArray(v.image_urls)) {
          v.image_urls.forEach((url: string) => allVariantImageUrls.add(url))
        }
      })
    }
    
    // Encontrar imágenes generales (las que NO están en ninguna variante)
    const generalImages = productImages.filter((img: string) => !allVariantImageUrls.has(img))
    
    // Si hay variante seleccionada con image_urls
    if (matchingVariant?.image_urls && matchingVariant.image_urls.length > 0) {
      // Combinar: imágenes de variante + imágenes generales
      return [...matchingVariant.image_urls, ...generalImages]
    }
    
    // Sin variante seleccionada o variante sin image_urls: mostrar todas las del producto
    return productImages
  }

  const isInStock = () => {
    if (!product) return false
    
    const anyProduct = product as any
    if (anyProduct.track_inventory === false) return true
    
    const variants = anyProduct.variants
    if (Array.isArray(variants) && variants.length > 0) {
      const matchingVariant = getMatchingVariant()
      if (matchingVariant) {
        return isVariantAvailable(matchingVariant)
      }
      return variants.some((v: any) => isVariantAvailable(v))
    }
    
    return (anyProduct.inventory_quantity ?? 0) > 0
  }

  const handleNavigateBack = () => navigate(-1)
  const handleNavigateToCart = () => navigate('/carrito')

  const handleOptionSelect = (optName: string, value: string) => {
    setSelected(prev => ({ ...prev, [optName]: value }))
  }

  // Independent from the first belt on purpose: changing one size must never
  // silently rewrite the size the shopper already picked for the other.
  const handleSecondOptionSelect = (optName: string, value: string) => {
    setSecondSelected(prev => ({ ...prev, [optName]: value }))
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(2, newQuantity)))
  }

  // Calculated values
  const options = product ? (product as any).options : undefined
  const variants = product ? (product as any).variants : undefined
  const hasVariants = Array.isArray(variants) && variants.length > 0
  const currentPrice = getCurrentPrice()
  const currentCompareAt = getCurrentCompareAt()
  const currentImage = getCurrentImage()
  const inStock = isInStock()
  const matchingVariant = getMatchingVariant()
  const displayImages = getDisplayImages()
  
  const discountPercentage = currentCompareAt && currentPrice && currentCompareAt > currentPrice 
    ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
    : undefined

  const subscriptionPrice = selectedPlan ? calcSubscriptionPrice(currentPrice, selectedPlan) : null

  // ─── Two-belt pack ────────────────────────────────────────────────────────
  const isPack = quantity >= 2
  const secondMatchingVariant = getSecondMatchingVariant()

  const isSecondOptionValueAvailable = (optName: string, value: string) => {
    // Two belts in the same size need two units in stock, not one.
    const candidateVariant = getMatchingVariantFor({ ...secondSelected, [optName]: value })
    const needsTwo = !!(candidateVariant && matchingVariant && candidateVariant.id === matchingVariant.id)
    return isOptionValueAvailableFor(secondSelected, optName, value, needsTwo ? 2 : 1)
  }

  const packSelection = {
    product: product as ProductType,
    packQuantity: quantity,
    firstVariant: matchingVariant,
    secondVariant: secondMatchingVariant,
    sellingPlan: selectedPlan,
    hasVariants,
  }

  /**
   * The one construction every buy path consumes: Add to cart, Buy now and the
   * wallet buttons all read this instead of rebuilding items from the first
   * variant alone.
   */
  // Memoised on the identifiers that actually define the purchase, so the wallet
  // listeners and the pricing memo below don't churn on every render.
  const selectedPurchaseItems: CartProductItem[] = useMemo(
    () => (product ? buildSelectedPurchaseItems(packSelection) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, quantity, matchingVariant?.id, secondMatchingVariant?.id, selectedPlan?.id, hasVariants]
  )

  const selectionValidation = product
    ? validatePurchaseSelection(packSelection, { trackInventory: tracksInventory })
    : { valid: false as const }

  const volumeRules = useMemo(
    () => (product ? getVolumeRulesForProduct(product.id, (product as any).collection_ids) : []),
    [product, getVolumeRulesForProduct]
  )
  const bogoRulesForProduct = useMemo(
    () => (product ? getBogoRulesForProduct(product.id, (product as any).collection_ids) : []),
    [product, getBogoRulesForProduct]
  )

  // Prices the exact items that will be bought from this page — the cart prices
  // its own full contents separately.
  const selectionPricing = useMemo(
    () => priceCartItems(selectedPurchaseItems, {
      volumeRules,
      bogoRules: bogoRulesForProduct,
      calcSubscriptionPriceFn: calcSubscriptionPrice,
    }),
    [selectedPurchaseItems, volumeRules, bogoRulesForProduct]
  )

  /**
   * What the 2-pack option can honestly advertise, read from the live price rule
   * rather than a percentage hard-coded in the page. When the rule can't be read
   * we show no discount at all instead of promising one the cart won't honour.
   */
  const packOffer = useMemo(() => {
    const singleTotal = roundMoney(currentPrice)
    if (priceRulesLoading) {
      return {
        loading: true,
        available: false,
        singleTotal,
        packTotal: roundMoney(currentPrice * 2),
        packUnitPrice: currentPrice,
        secondBeltPrice: currentPrice,
        secondBeltOffPct: 0,
        savings: 0,
        savingsLabel: null as string | null,
      }
    }
    const discount = calcVolumeDiscount(currentPrice, 2, volumeRules)
    if (!discount || discount.discountedPrice >= currentPrice) {
      return {
        loading: false,
        available: false,
        singleTotal,
        packTotal: roundMoney(currentPrice * 2),
        packUnitPrice: currentPrice,
        secondBeltPrice: currentPrice,
        secondBeltOffPct: 0,
        savings: 0,
        savingsLabel: null as string | null,
      }
    }
    const packTotal = roundMoney(discount.discountedPrice * 2)
    const secondBeltPrice = roundMoney(packTotal - currentPrice)
    return {
      loading: false,
      available: true,
      singleTotal,
      packTotal,
      packUnitPrice: discount.discountedPrice,
      secondBeltPrice,
      // Derived from the real numbers: never claims "50% off" unless it is.
      secondBeltOffPct: currentPrice > 0
        ? Math.round((1 - secondBeltPrice / currentPrice) * 100)
        : 0,
      savings: roundMoney(currentPrice * 2 - packTotal),
      savingsLabel: discount.savingsLabel,
    }
  }, [currentPrice, volumeRules, priceRulesLoading])

  const selectionTotal = selectedPurchaseItems.length > 0
    ? selectionPricing.total
    : (isPack ? packOffer.packTotal : roundMoney(currentPrice))

  const selectionCompareAt = currentCompareAt
    ? roundMoney(currentCompareAt * (isPack ? 2 : 1))
    : null

  const selectionUnits = selectedPurchaseItems.reduce((sum, item) => sum + item.quantity, 0) || (isPack ? 2 : 1)

  const canPurchaseSelection = inStock && selectionValidation.valid && !isExpressProcessing

  const warnInvalidSelection = () => {
    toast({
      title: selectionValidation.title || 'Select a size',
      description: selectionValidation.message || 'Pick an available size before continuing.',
      variant: selectionValidation.issue === 'insufficient_stock' ? 'destructive' : undefined,
    })
  }

  const trackSelectionAddToCart = () => {
    if (!product) return
    trackAddToCart({
      products: selectedPurchaseItems.map(item => tracking.createTrackingProduct({
        id: product.id,
        title: product.title,
        price: (item.variant?.price ?? product.price) || 0,
        category: 'product',
        variant: item.variant,
      })),
      value: selectionTotal,
      currency: tracking.getCurrencyFromSettings(currencyCode),
      num_items: selectionUnits,
    })
  }

  const handleAddToCart = () => {
    if (!product) return
    // Double-click protection: a second tap must not stack another pack.
    if (addToCartGuard.current) return
    if (isExpressProcessing) return

    if (!selectionValidation.valid || selectedPurchaseItems.length === 0) {
      warnInvalidSelection()
      return
    }

    addToCartGuard.current = true
    setIsAddingToCart(true)
    try {
      // Validated up front so the cart never ends up with half a pack.
      let addedAny = false
      for (const item of selectedPurchaseItems) {
        for (let i = 0; i < item.quantity; i++) {
          const added = addItem(product, item.variant, selectedPlan || undefined)
          if (!added) {
            toast({
              title: "One subscription plan per cart",
              description: "Remove the current subscription to add a different one.",
              variant: "destructive"
            })
            return
          }
          addedAny = true
        }
      }

      if (addedAny) {
        trackSelectionAddToCart()
        setTimeout(() => openCart(), 300)
      }
    } finally {
      setIsAddingToCart(false)
      setTimeout(() => { addToCartGuard.current = false }, 400)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    if (buyNowGuard.current || isBuyingNow || isExpressProcessing) return

    if (!selectionValidation.valid || selectedPurchaseItems.length === 0) {
      warnInvalidSelection()
      return
    }

    trackSelectionAddToCart()

    buyNowGuard.current = true
    setIsBuyingNow(true)
    try {
      // Items are built locally and handed straight to checkoutWithItems() —
      // no addItem() followed by an immediate read of React state, and whatever
      // else is already in the cart stays there.
      await checkoutWithItems(selectedPurchaseItems, { currencyCode })
      navigate('/pagar')
    } catch (error) {
      // El error ya fue mostrado con toast dentro de checkoutWithItems
      console.error('Buy Now error:', error)
    } finally {
      setIsBuyingNow(false)
      buyNowGuard.current = false
    }
  }

  return {
    // State
    product,
    loading,
    notFound,
    selectedImage,
    selected,
    secondSelected,
    quantity,
    
    // Calculated values
    options,
    variants,
    hasVariants,
    currentPrice,
    currentCompareAt,
    currentImage,
    inStock,
    matchingVariant,
    secondMatchingVariant,
    discountPercentage,
    displayImages,

    // Two-belt pack
    isPack,
    packOffer,
    selectedPurchaseItems,
    selectionPricing,
    selectionTotal,
    selectionCompareAt,
    selectionUnits,
    selectionValidation,
    canPurchaseSelection,
    isExpressProcessing,
    setIsExpressProcessing,
    isAddingToCart,
    
    // Selling plans (subscriptions)
    sellingPlans,
    selectedPlan,
    setSelectedPlan,
    subscriptionPrice,
    
    // Cart info
    totalItems: getTotalItems(),
    
    // Buy Now state
    isBuyingNow,

    // Actions
    handleAddToCart,
    handleBuyNow,
    handleNavigateBack,
    handleNavigateToCart,
    handleOptionSelect,
    handleSecondOptionSelect,
    handleQuantityChange,
    setSelectedImage,
    isOptionValueAvailable,
    isSecondOptionValueAvailable,
    
    // Utilities
    formatMoney,
    
    // States for UI
    canAddToCart: canPurchaseSelection,
    
    // Events for additional features
    onAddToCartSuccess: () => {
      console.log('Product added to cart from product page - ready for additional features')
    }
  }
}

interface HeadlessProductProps {
  children: (logic: ReturnType<typeof useProductLogic>) => React.ReactNode
}

export const HeadlessProduct = ({ children }: HeadlessProductProps) => {
  const productLogic = useProductLogic()
  
  return <>{children(productLogic)}</>
}