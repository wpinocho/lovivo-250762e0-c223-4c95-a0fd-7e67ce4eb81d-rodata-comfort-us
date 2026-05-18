import { useEffect, useState, useMemo } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, X, ShoppingBag, Loader2, RefreshCw, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CartAppliedRules } from "@/components/ui/CartAppliedRules";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import StripePayment from "@/components/StripePayment";
import { HeadlessCheckout } from "@/components/headless/HeadlessCheckout";
import { BrandLogoLeft } from "@/components/BrandLogoLeft";
import { useURLCheckoutParams } from "@/hooks/useURLCheckoutParams";
import { useTokenCheckout } from "@/hooks/useTokenCheckout";
import { formatMoney } from "@/lib/money";
import { countryNameToCode, countryCodeToName } from "@/lib/country-codes";

// ── Dark theme utility constants ─────────────────────────────────────────────
const INP = "bg-[#0d0f11] border-white/[0.15] text-brand-offwhite placeholder:text-brand-steel focus-visible:ring-brand-amber/20 focus-visible:border-brand-amber/40"
const SEL_T = "bg-[#0d0f11] border-white/[0.15] text-brand-offwhite"
const SEL_C = "bg-[#1a1d21] border-white/[0.12]"
const SEL_I = "text-brand-smoke focus:bg-white/[0.06] focus:text-brand-offwhite"

export default function CheckoutUI() {
  const { params, hasParams } = useURLCheckoutParams();
  const { isLoadingToken, tokenError, hasToken } = useTokenCheckout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { paymentMethods, stripeAccountId, chargeType, isLoading: isSettingsLoading } = useSettings();
  const [linkAuthenticated, setLinkAuthenticated] = useState(false);
  // Track whether the on-page Stripe AddressElement has a complete address.
  const [addressElementComplete, setAddressElementComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoadingToken || hasToken) {
    return (
      <div className="min-h-screen bg-[#111315] flex items-center justify-center">
        <div className="text-center space-y-4">
          {tokenError ? (
            <>
              <p className="text-lg font-sora font-semibold text-destructive">Error al cargar la orden</p>
              <p className="text-sm text-brand-smoke">{tokenError}</p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-amber" />
              <p className="text-sm text-brand-smoke">Cargando orden...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <HeadlessCheckout>
      {(logic) => {
        useEffect(() => {
          if (hasParams && params) {
            logic.applyURLParams(params);
          }
        }, [hasParams, params]);

        // Convert available country names to ISO codes for Stripe AddressElement
        const allowedCountries = useMemo(() => {
          if (!logic.availableCountries || logic.availableCountries.length === 0) return undefined;
          return logic.availableCountries
            .map((c: any) => c.code || countryNameToCode(c.name))
            .filter(Boolean);
        }, [logic.availableCountries]);

        // Delivery methods slot rendered inside StripePayment (between AddressElement and PaymentElement)
        const deliveryMethodSlot = !logic.usePickup && logic.deliveryExpectations && logic.deliveryExpectations.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-sora font-semibold text-brand-offwhite">Métodos de envío</h3>
            {Array.isArray(logic.deliveryExpectations) && logic.deliveryExpectations.map((method: any, index: number) => (
              <div key={index} className="border border-white/[0.1] rounded-xl bg-[#111315]">
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="delivery-method"
                      value={index}
                      checked={logic.selectedDeliveryMethod?.type === method.type}
                      onChange={() => {
                        logic.setSelectedDeliveryMethod(method);
                        logic.setShippingCost(method.hasPrice && method.price ? parseFloat(method.price) : 0);
                      }}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-brand-offwhite">{method.type}</div>
                      <div className="text-sm text-brand-steel">{method.description}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-brand-amber">
                    {method.hasPrice && method.price ? formatMoney(parseFloat(method.price), logic.currencyCode) : 'GRATIS'}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ) : null;

        return (
          <div className="min-h-screen bg-[#111315]">
            {/* Header */}
            <header className="border-b border-white/[0.08] bg-[#111315]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <BrandLogoLeft />
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Mobile Order Summary */}
              <MobileOrderSummary logic={logic} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ── Left: Checkout form ── */}
                <div className="space-y-8 bg-[#1D2125] border border-white/[0.08] p-3 sm:p-6 rounded-xl">

                  {/* Pickup Locations */}
                  {logic.pickupLocations && logic.pickupLocations.length > 0 && (
                    <section>
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          id="use-pickup"
                          checked={logic.usePickup}
                          onChange={e => {
                            logic.setUsePickup(e.target.checked);
                            if (!e.target.checked) {
                              logic.setSelectedPickupLocation(null);
                              logic.setShippingCost(0);
                              logic.setSelectedDeliveryMethod(null);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor="use-pickup" className="text-sm font-medium text-brand-smoke">Recoger en tienda</label>
                      </div>

                      {logic.usePickup && (
                        <div className="space-y-3">
                          {Array.isArray(logic.pickupLocations) && logic.pickupLocations.map((location: any, index: number) => {
                            const isExpanded = logic.selectedPickupLocation?.name === location.name;
                            return (
                              <div key={index} className="border border-white/[0.12] rounded-xl bg-[#111315]">
                                <label className="flex items-start p-4 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="pickup"
                                    value={index}
                                    checked={isExpanded}
                                    onChange={() => {
                                      if (isExpanded) {
                                        logic.setSelectedPickupLocation(null);
                                        logic.setShippingCost(0);
                                        logic.setSelectedDeliveryMethod(null);
                                      } else {
                                        logic.setSelectedPickupLocation(location);
                                        logic.setShippingCost(0);
                                        logic.setSelectedDeliveryMethod(null);
                                      }
                                    }}
                                    className="w-4 h-4 mt-1 mr-3"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-brand-offwhite">{location.name}</div>
                                    <div className="text-sm text-brand-steel mt-1">
                                      {location.line1}{location.line2 && `, ${location.line2}`}, {location.city}, {location.country}
                                    </div>
                                    {!isExpanded && <div className="text-sm text-brand-amber mt-1">Te esperamos</div>}
                                    {isExpanded && (
                                      <>
                                        <div className="text-sm text-brand-steel mt-1">
                                          {location.city}, {location.state}, {location.country} - {location.postal_code}
                                        </div>
                                        {location.schedule && <div className="text-sm text-brand-steel">Horario: {location.schedule}</div>}
                                        {location.instructions && <div className="text-sm text-brand-amber mt-1">{location.instructions}</div>}
                                      </>
                                    )}
                                  </div>
                                  <div className="font-semibold text-brand-amber">GRATIS</div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Pago — Stripe handles email, address, delivery methods, and payment */}
                  <section>
                    <div className="flex items-center gap-2 text-brand-steel text-[11px] font-inter mb-4 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                      <Lock size={11} className="text-brand-amber flex-shrink-0" />
                      Pago 100% seguro · Cifrado SSL · Procesado por Stripe
                    </div>

                    {(() => {
                      const isStripeReady =
                        !isSettingsLoading &&
                        logic.isInitialized &&
                        logic.hasActiveCheckout &&
                        logic.orderId &&
                        logic.checkoutToken &&
                        logic.summaryItems.length > 0 &&
                        logic.finalTotal > 0;

                      if (!isStripeReady) {
                        return (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-amber" />
                          </div>
                        );
                      }

                      // Stable key — does NOT include finalTotal to avoid remounting
                      // the Elements provider (would kill Apple Pay / Google Pay / Link session).
                      // Amount is updated in-place via elements.update({ amount }) inside StripePayment.
                      const stripeKey = [
                        logic.orderId,
                        logic.checkoutToken,
                        logic.currencyCode,
                        JSON.stringify(paymentMethods),
                        stripeAccountId,
                        chargeType,
                      ].join('|');

                      return (
                        <StripePayment
                          key={stripeKey}
                          amountCents={Math.round(logic.finalTotal * 100)}
                          currency={logic.currencyCode.toLowerCase()}
                          description={`Pedido #${logic.orderId ?? 's/n'}`}
                          metadata={{
                            order_id: logic.orderId ?? '',
                            ...(logic.discount?.code ? { discount_code: logic.discount.code } : {})
                          }}
                          email={logic.email}
                          name={`${logic.firstName} ${logic.lastName}`.trim()}
                          phone={logic.phone}
                          orderId={logic.orderId}
                          checkoutToken={logic.checkoutToken}
                          onValidationRequired={() => {
                            // When Stripe AddressElement manages address + phone,
                            // trust its `complete` flag instead of re-validating those fields.
                            if (!logic.usePickup) {
                              const missing: string[] = [];
                              const emailOk = !!logic.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(logic.email);
                              if (!emailOk) missing.push('email v\u00e1lido');
                              if (!addressElementComplete) missing.push('direcci\u00f3n completa');
                              if (
                                Array.isArray(logic.deliveryExpectations) &&
                                logic.deliveryExpectations.length > 0 &&
                                !logic.selectedDeliveryMethod
                              ) missing.push('m\u00e9todo de env\u00edo');
                              if (missing.length > 0) {
                                toast({
                                  title: 'Campos requeridos',
                                  description: `Por favor completa: ${missing.join(', ')}`,
                                  variant: 'destructive',
                                  duration: 5000,
                                });
                                return false;
                              }
                              return true;
                            }
                            // Pickup: use full manual validation
                            return logic.validateCheckoutFields();
                          }}
                          expectedTotal={Math.round(logic.finalTotal * 100)}
                          deliveryFee={Math.round((logic.shippingFromCheckout || logic.shippingCost) * 100)}
                          shippingAddress={logic.usePickup ? null : {
                            ...logic.address,
                            first_name: logic.firstName,
                            last_name: logic.lastName
                          }}
                          billingAddress={logic.usePickup ? logic.billingAddress : (logic.useSameAddress ? {
                            ...logic.address,
                            first_name: logic.firstName,
                            last_name: logic.lastName
                          } : logic.billingAddress)}
                          items={logic.orderItems}
                          deliveryExpectations={logic.usePickup ?
                            [{ type: "pickup", description: "Recoger en tienda" }] :
                            (logic.deliveryExpectations || [])
                          }
                          pickupLocations={logic.usePickup ?
                            (logic.selectedPickupLocation ? [logic.selectedPickupLocation] : []) :
                            []
                          }
                          billingSlot={<BillingCheckboxSection logic={logic} />}
                          deliveryMethodSlot={deliveryMethodSlot}
                          showAddressElement={!logic.usePickup}
                          addressElementComplete={addressElementComplete}
                          allowedCountries={allowedCountries}
                          onAddressChange={(addressValue: any, complete: boolean) => {
                            setAddressElementComplete(complete);
                            const { address, name, phone } = addressValue;

                            const nameParts = (name || '').split(' ');
                            const first = nameParts[0] || '';
                            const last = nameParts.slice(1).join(' ') || '';

                            logic.setFirstName(first);
                            logic.setLastName(last);

                            if (phone) {
                              logic.setPhone(phone);
                            }

                            const countryName = countryCodeToName(address.country);

                            logic.setAddress({
                              country: countryName,
                              countryCode: address.country,
                              line1: address.line1 || '',
                              line2: address.line2 || '',
                              city: address.city || '',
                              state: address.state || '',
                              postal_code: address.postal_code || '',
                            });

                            if (complete && first) {
                              logic.saveClientData(true);
                            }
                          }}
                          shippingError={logic.shippingError}
                          paymentMethods={paymentMethods}
                          stripeAccountId={stripeAccountId}
                          chargeType={chargeType}
                          onEmailChange={(email: string) => {
                            logic.setEmail(email);
                            logic.saveClientData(true, email);
                          }}
                          onLinkAuthChange={setLinkAuthenticated}
                        />
                      );
                    })()}
                  </section>
                </div>

                {/* ── Right: Order summary (desktop) ── */}
                <div className="hidden md:block md:sticky md:top-8 md:h-fit">
                  <div className="bg-[#1D2125] border border-white/[0.08] p-6 space-y-4 rounded-xl">

                    {/* Loading */}
                    {logic.itemsLoading && logic.summaryItems.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber mx-auto"></div>
                        <p className="mt-2 text-brand-smoke text-sm">Cargando productos...</p>
                      </div>
                    ) : null}

                    {/* Stale data */}
                    {logic.isStale && logic.summaryItems.length > 0 && (
                      <div className="bg-yellow-950/30 border border-yellow-700/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4">
                              {logic.revalidating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                              ) : (
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-yellow-400">
                              {logic.revalidating ? 'Restaurando tu carrito...' : 'Mostrando datos guardados'}
                            </span>
                          </div>
                          {!logic.revalidating && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={logic.refreshItems}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              Actualizar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty cart */}
                    {logic.summaryItems.length === 0 && !logic.itemsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-brand-graphite rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-brand-steel" />
                        </div>
                        <h3 className="text-lg font-sora font-semibold text-brand-offwhite">Tu carrito está vacío</h3>
                        <p className="text-brand-steel text-center text-sm">Agrega un producto para iniciar tu compra</p>
                        <Button
                          onClick={() => navigate('/')}
                          className="mt-4 bg-brand-amber text-brand-carbon hover:bg-brand-amber/90 font-sora font-semibold"
                        >
                          Comenzar a Comprar
                        </Button>
                      </div>
                    ) : (
                      Array.isArray(logic.summaryItems) && logic.summaryItems.map((item: any) => (
                        <div key={item.key} className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={item.product.images?.[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-white/[0.1]"
                            />
                            <span className="absolute -top-2 -right-2 bg-brand-amber text-brand-carbon text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-offwhite">{item.product.name}</h4>
                            {item.variant && <p className="text-sm text-brand-steel">{item.variant.name}</p>}
                            {item.selling_plan_id && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-brand-amber/10 text-brand-amber border-brand-amber/20">
                                  <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                  Suscripción
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-brand-steel">Cantidad</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0 border-white/[0.15] text-brand-smoke bg-transparent hover:bg-white/[0.06] hover:text-brand-offwhite"
                                  disabled={logic.updatingItems.has(item.key)}
                                  aria-disabled={logic.updatingItems.has(item.key)}
                                  onClick={() => logic.updateOrderQuantity(item.key, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="font-medium text-brand-offwhite">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 p-0 border-white/[0.15] text-brand-smoke bg-transparent hover:bg-white/[0.06] hover:text-brand-offwhite"
                                  disabled={logic.updatingItems.has(item.key)}
                                  aria-disabled={logic.updatingItems.has(item.key)}
                                  onClick={() => logic.updateOrderQuantity(item.key, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-brand-offwhite">
                            {formatMoney(item.total || (item.price * item.quantity), logic.currencyCode)}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Código de descuento */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-brand-smoke">Código de descuento</div>
                      {!logic.discount ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ingresa tu cupón"
                            value={logic.couponCode}
                            onChange={e => logic.setCouponCode(e.target.value.toUpperCase())}
                            className={`text-sm ${INP}`}
                            ref={logic.couponInputRef}
                            onKeyDown={(e) => { if (e.key === 'Enter') logic.validateCoupon(); }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={logic.validateCoupon}
                            disabled={logic.isValidatingCoupon || !logic.couponCode.trim()}
                            className="border-white/[0.15] bg-transparent text-brand-smoke hover:bg-white/[0.06] hover:text-brand-offwhite disabled:opacity-40"
                          >
                            <Tag className="h-4 w-4 mr-1" />
                            {logic.isValidatingCoupon ? '...' : 'Aplicar'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm bg-brand-amber/10 border border-brand-amber/20 p-3 rounded-lg">
                          <span className="text-brand-smoke font-medium">
                            Cupón aplicado: {logic.couponCode}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={logic.removeCoupon}
                            className="text-brand-steel hover:text-brand-smoke p-1 h-auto"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Totales */}
                    <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                      <div className="flex justify-between text-brand-smoke text-sm">
                        <span>Subtotal</span>
                        <span>{formatMoney(logic.summaryTotal, logic.currencyCode)}</span>
                      </div>
                      <div className="flex justify-between text-brand-smoke text-sm">
                        <span>Envío</span>
                        <span className={`${logic.isCalculatingShipping ? 'opacity-50 blur-sm' : ''} transition-all duration-200`}>
                          {logic.selectedPickupLocation ? 'GRATIS (Recoger en tienda)' :
                           logic.shippingCost > 0 ? formatMoney(logic.shippingCost, logic.currencyCode) : 'GRATIS'}
                        </span>
                      </div>

                      {/* Applied rules */}
                      {logic.appliedRules && logic.appliedRules.length > 0 && (
                        <CartAppliedRules
                          appliedRules={logic.appliedRules}
                          formatMoney={(v: number) => formatMoney(v, logic.currencyCode)}
                        />
                      )}

                      {/* Manual discount */}
                      {logic.discount && logic.backendDiscountAmount === 0 && (
                        <div className="flex justify-between text-brand-amber text-sm">
                          <span>Descuento ({logic.getDiscountDisplayText(logic.discount, logic.totalQuantity)})</span>
                          <span>- {formatMoney(logic.discountAmount, logic.currencyCode)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-baseline pt-3 border-t border-white/[0.08]">
                        <span className="text-lg font-sora font-semibold text-brand-offwhite">Total</span>
                        <div className={`flex items-baseline gap-1.5 ${logic.isCalculatingTotal ? 'opacity-50 blur-sm' : ''} transition-all duration-200`}>
                          <span className="text-sm text-brand-steel">{logic.currencyCode.toUpperCase()}</span>
                          <span className="text-lg font-sora font-bold text-brand-offwhite">{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </main>
          </div>
        );
      }}
    </HeadlessCheckout>
  );
}

/* ─── Mobile Order Summary (collapsible) ─── */
function MobileOrderSummary({ logic }: { logic: any }) {
  const [open, setOpen] = useState(false);

  if (logic.summaryItems.length === 0) return null;

  return (
    <div className="md:hidden mb-6 border border-white/[0.1] rounded-xl bg-[#1D2125]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-brand-offwhite"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-brand-amber" />
          Resumen del pedido ({logic.totalQuantity})
          {open ? <ChevronUp className="h-4 w-4 text-brand-steel" /> : <ChevronDown className="h-4 w-4 text-brand-steel" />}
        </span>
        <span className="font-sora font-bold text-brand-amber">{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.08]">
          {logic.summaryItems.map((item: any) => (
            <div key={item.key} className="flex items-center gap-3 pt-3">
              <div className="relative shrink-0">
                <img
                  src={item.product.images?.[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-lg border border-white/[0.1]"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-brand-amber text-brand-carbon text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-brand-offwhite">{item.product.name}</p>
                {item.variant && <p className="text-xs text-brand-steel">{item.variant.name}</p>}
              </div>
              <span className="text-sm font-medium text-brand-offwhite">
                {formatMoney(item.total || item.price * item.quantity, logic.currencyCode)}
              </span>
            </div>
          ))}

          <div className="space-y-1 pt-3 border-t border-white/[0.08] text-sm">
            <div className="flex justify-between">
              <span className="text-brand-steel">Subtotal</span>
              <span className="text-brand-smoke">{formatMoney(logic.summaryTotal, logic.currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-steel">Envío</span>
              <span className="text-brand-smoke">
                {logic.selectedPickupLocation
                  ? "GRATIS"
                  : logic.shippingCost > 0
                  ? formatMoney(logic.shippingCost, logic.currencyCode)
                  : "Pendiente"}
              </span>
            </div>
            {logic.discountAmount > 0 && (
              <div className="flex justify-between text-brand-amber">
                <span>Descuento</span>
                <span>- {formatMoney(logic.discountAmount, logic.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between font-sora font-semibold pt-1 border-t border-white/[0.08] text-brand-offwhite">
              <span>Total</span>
              <span>{formatMoney(logic.finalTotal, logic.currencyCode)}</span>
            </div>
          </div>

          {/* Cupón mobile */}
          <MobileCouponSection logic={logic} />
        </div>
      )}
    </div>
  );
}

/* ─── Billing address (shown inside StripePayment as billingSlot) ─── */
function BillingCheckboxSection({ logic }: { logic: any }) {
  const INP_B = "bg-[#0d0f11] border-white/[0.15] text-brand-offwhite placeholder:text-brand-steel focus-visible:ring-brand-amber/20"
  const SEL_TB = "bg-[#0d0f11] border-white/[0.15] text-brand-offwhite"
  const SEL_CB = "bg-[#1a1d21] border-white/[0.12]"
  const SEL_IB = "text-brand-smoke focus:bg-white/[0.06] focus:text-brand-offwhite"

  return (
    <div className="mt-4 space-y-4">
      {!logic.usePickup && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="same-billing"
            checked={logic.useSameAddress}
            onCheckedChange={(v: boolean) => logic.setUseSameAddress(!!v)}
          />
          <Label htmlFor="same-billing" className="text-sm cursor-pointer text-brand-smoke">
            Usar la dirección de envío como dirección de facturación
          </Label>
        </div>
      )}

      {(logic.usePickup || !logic.useSameAddress) && (
        <Card className="mt-3 bg-[#111315] border-white/[0.12]">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={logic.billingAddress.first_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, first_name: e.target.value }))}
                placeholder="Nombre"
                className={INP_B}
              />
              <Input
                value={logic.billingAddress.last_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Apellidos"
                className={INP_B}
              />
            </div>
            <Input
              value={logic.billingAddress.line1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, line1: e.target.value }))}
              placeholder="Dirección"
              className={INP_B}
            />
            <Input
              value={logic.billingAddress.line2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, line2: e.target.value }))}
              placeholder="Apartamento, suite, etc. (opcional)"
              className={INP_B}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={logic.billingAddress.postal_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, postal_code: e.target.value }))}
                placeholder="C.P."
                className={INP_B}
              />
              <Input
                value={logic.billingAddress.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setBillingAddress((prev: any) => ({ ...prev, city: e.target.value }))}
                placeholder="Ciudad"
                className={INP_B}
              />
              <Select
                value={logic.billingAddress.state}
                onValueChange={(value: string) => logic.setBillingAddress((prev: any) => ({ ...prev, state: value }))}
              >
                <SelectTrigger className={SEL_TB}>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className={SEL_CB}>
                  {(() => {
                    const states =
                      logic.billingAddress.country === logic.address.country
                        ? logic.availableStates
                        : logic.availableCountries.find((c: any) => c.name === logic.billingAddress.country)?.states || [];
                    return (
                      Array.isArray(states) &&
                      states.map((state: string) => (
                        <SelectItem key={state} value={state} className={SEL_IB}>
                          {state}
                        </SelectItem>
                      ))
                    );
                  })()}
                </SelectContent>
              </Select>
            </div>
            <Select
              value={logic.billingAddress.country}
              onValueChange={(value: string) => logic.setBillingAddress((prev: any) => ({ ...prev, country: value }))}
            >
              <SelectTrigger className={SEL_TB}>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent className={SEL_CB}>
                {Array.isArray(logic.availableCountries) &&
                  logic.availableCountries.map((country: any) => (
                    <SelectItem key={country.name} value={country.name} className={SEL_IB}>
                      {country.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Mobile Coupon Section (collapsible) ─── */
function MobileCouponSection({ logic }: { logic: any }) {
  const [open, setOpen] = useState(false);
  const INP_M = "bg-[#0d0f11] border-white/[0.15] text-brand-offwhite placeholder:text-brand-steel focus-visible:ring-brand-amber/20"

  return (
    <div className="pt-2 border-t border-white/[0.08]">
      {!logic.discount ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-xs text-brand-amber font-medium flex items-center gap-1"
          >
            <Tag className="h-3 w-3" />
            ¿Tienes un cupón?
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {open && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Código de descuento"
                value={logic.couponCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => logic.setCouponCode(e.target.value.toUpperCase())}
                className={`text-sm h-9 ${INP_M}`}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') logic.validateCoupon(); }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={logic.validateCoupon}
                disabled={logic.isValidatingCoupon || !logic.couponCode.trim()}
                className="h-9 shrink-0 border-white/[0.15] bg-transparent text-brand-smoke hover:bg-white/[0.06] hover:text-brand-offwhite disabled:opacity-40"
              >
                {logic.isValidatingCoupon ? '...' : 'Aplicar'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between text-xs bg-brand-amber/10 border border-brand-amber/20 p-2 rounded-lg">
          <span className="text-brand-smoke font-medium">
            Cupón: {logic.couponCode}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logic.removeCoupon}
            className="text-brand-steel hover:text-brand-smoke p-1 h-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}