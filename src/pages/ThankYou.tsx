import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Mail, ArrowLeft, ShoppingBag, Truck } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { useToast } from '@/hooks/use-toast'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { trackPurchase, tracking } from '@/lib/tracking-utils'
import { useCart } from '@/contexts/CartContext'

interface OrderDetails {
  id: string
  order_number: string
  total_amount: number
  currency_code: string
  status: string
  shipping_address?: any
  billing_address?: any
  order_items: any[]
  created_at: string
}

const ThankYou = () => {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const { clearCart } = useCart()

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const loadOrder = () => {
      try {
        // Try to get order from localStorage (saved from successful payment)
        const completedOrderJson = localStorage.getItem('completed_order')
        if (completedOrderJson) {
          const completedOrder = JSON.parse(completedOrderJson)
          setOrder(completedOrder)
          // Clean up localStorage
          localStorage.removeItem('completed_order')
        } else {
          setOrder(null)
        }
      } catch (error) {
        console.error('Error loading order:', error)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  // Fire Purchase event for Stripe 3DS redirect flow.
  // When Stripe redirects back to /gracias/:orderId after 3DS, the payment intent
  // status is in the URL. The in-page handlePayment() never ran to completion,
  // so we must fire trackPurchase here — but ONLY once per order.
  useEffect(() => {
    const paymentIntentStatus = searchParams.get('redirect_status')
    if (paymentIntentStatus !== 'succeeded') return

    // Unified guard: same sessionStorage key used by StripePayment & PaypalExpressButton
    // so a Purchase is never fired twice for the same order across redirect flows.
    const trackingKey = `purchase_tracked_${orderId}`
    const alreadyTracked = (() => { try { return sessionStorage.getItem(trackingKey) === '1' } catch { return false } })()
    if (alreadyTracked) return // already fired

    // Mark as tracked immediately to prevent double-firing on re-renders
    try { sessionStorage.setItem(trackingKey, '1') } catch {}

    // Try to read order details from completed_order (may have been set before redirect)
    try {
      const raw = localStorage.getItem('completed_order') || localStorage.getItem(`completed_order_${orderId}`)
      const savedOrder = raw ? JSON.parse(raw) : null
      const items = savedOrder?.order_items || []
      const value = savedOrder?.total_amount || 0
      const currency = savedOrder?.currency_code || 'usd'

      trackPurchase({
        products: items
          .filter((it: any) => it.quantity > 0)
          .map((it: any) => tracking.createTrackingProduct({
            id: it.product_id || it.id,
            title: it.product_name,
            price: it.price || it.unit_price || 0,
            category: 'product',
            variant: it.variant_id ? { id: it.variant_id } : undefined
          })),
        value,
        currency,
        order_id: orderId,
        custom_parameters: { payment_method: 'stripe_3ds', redirect: true }
      })

      // Cart may not have been cleared if user was redirected away during payment
      clearCart()
    } catch (err) {
      console.error('ThankYou: error firing deferred Purchase event', err)
    }
  }, [orderId, searchParams])

  if (loading) {
    return (
      <EcommerceTemplate showCart={true}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </EcommerceTemplate>
    )
  }

  if (!order) {
    return (
      <EcommerceTemplate showCart={true}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-muted p-6">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl">Order Not Found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    It looks like you haven't completed a purchase yet, or this order link has expired.
                  </p>
                </div>
                <Button 
                  size="lg"
                  asChild
                  className="mt-4"
                >
                  <Link to="/">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start Shopping
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </EcommerceTemplate>
    )
  }

  return (
    <EcommerceTemplate pageTitle="Order Confirmation" showCart={true}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been successfully processed.
          </p>
          <Badge variant="secondary" className="text-sm">
            Order #{order.order_number}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.order_items.filter(item => item.quantity > 0).map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    {/* Product Image */}
                    {item.product_images && item.product_images.length > 0 && (
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.product_images[0]} 
                          alt={item.product_name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name || 'Product'}</p>
                      {item.variant_name && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatMoney(item.price * item.quantity, order.currency_code)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatMoney(order.total_amount, order.currency_code)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.shipping_address && (order.shipping_address.line1 || order.shipping_address.address1) ? (
                <div>
                  <h4 className="font-medium mb-2">Shipping Address:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{order.shipping_address.name || `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim()}</p>
                    <p>{order.shipping_address.line1 || order.shipping_address.address1}</p>
                    {(order.shipping_address.line2 || order.shipping_address.address2) && (
                      <p>{order.shipping_address.line2 || order.shipping_address.address2}</p>
                    )}
                    <p>{order.shipping_address.city}, {order.shipping_address.state || order.shipping_address.province}</p>
                    <p>{order.shipping_address.postal_code || order.shipping_address.zip} {order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p>Tel: {order.shipping_address.phone}</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Delivery Method:</h4>
                  <p className="text-sm text-muted-foreground">Store Pickup</p>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• You'll receive a confirmation email</li>
                  <li>• We'll notify you when your order ships</li>
                  <li>• You can track your order with number #{order.order_number}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild>
            <Link to={`/orders/track?order_number=${order.order_number}`} className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Track my order
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </EcommerceTemplate>
  )
}

export default ThankYou