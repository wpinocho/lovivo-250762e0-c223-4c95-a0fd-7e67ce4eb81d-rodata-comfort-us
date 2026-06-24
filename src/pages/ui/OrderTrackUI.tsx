/**
 * EDITABLE UI COMPONENT - OrderTrackUI
 * TIPO B - El agente de IA puede editar libremente este componente
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Package, CheckCircle2, AlertTriangle, Copy, ExternalLink, ChevronDown,
  Truck, Search, MapPin, XCircle, Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrackingEvent {
  occurred_at: string
  status_detail: string
  location?: string
}

interface TrackingData {
  steps?: Array<string | { label: string; description?: string }>
  current_step?: number
  cancelled?: boolean
  carrier?: string
  shipping_carrier?: string
  tracking_number?: string
  tracking_url?: string
  estimated_delivery_at?: string
  events?: TrackingEvent[]
  display_mode?: 'detailed' | 'masked'
}

interface OrderTrackUIProps {
  token?: string
}

const DEFAULT_STEPS = ['Order Placed', 'Preparing', 'Shipped', 'Delivered']

function resolveSteps(data: TrackingData | null): string[] {
  if (!data?.steps?.length) return DEFAULT_STEPS
  return data.steps.map((s) => (typeof s === 'string' ? s : s.label))
}

/* ---------------- Timeline ---------------- */

function OrderTimeline({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start justify-between">
        {steps.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          const isLast = i === steps.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              <div className="flex items-center w-full">
                <div className="flex-1 h-0.5">
                  {i > 0 && (
                    <div className={cn('h-0.5 w-full', i <= currentStep ? 'bg-brand-amber' : 'bg-white/15')} />
                  )}
                </div>
                <div
                  className={cn(
                    'shrink-0 h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors',
                    done && 'bg-brand-amber border-brand-amber',
                    active && 'border-brand-amber bg-brand-amber/15',
                    !done && !active && 'border-white/20 bg-transparent',
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-carbon" />
                  ) : active ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-amber animate-pulse" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  )}
                </div>
                <div className="flex-1 h-0.5">
                  {!isLast && (
                    <div className={cn('h-0.5 w-full', i < currentStep ? 'bg-brand-amber' : 'bg-white/15')} />
                  )}
                </div>
              </div>
              <span
                className={cn(
                  'mt-3 text-xs text-center font-medium px-1',
                  done && 'text-brand-amber',
                  active && 'text-brand-offwhite font-semibold',
                  !done && !active && 'text-brand-steel',
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-0">
        {steps.map((label, i) => {
          const done = i < currentStep
          const active = i === currentStep
          const isLast = i === steps.length - 1
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'shrink-0 h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors',
                    done && 'bg-brand-amber border-brand-amber',
                    active && 'border-brand-amber bg-brand-amber/15',
                    !done && !active && 'border-white/20 bg-transparent',
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-carbon" />
                  ) : active ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-amber animate-pulse" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  )}
                </div>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 min-h-[1.5rem]', i < currentStep ? 'bg-brand-amber' : 'bg-white/15')} />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium pt-1.5 pb-4',
                  done && 'text-brand-amber',
                  active && 'text-brand-offwhite font-semibold',
                  !done && !active && 'text-brand-steel',
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ---------------- Skeleton ---------------- */

function TrackingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="hidden sm:flex items-center justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 flex items-center">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                {i < 4 && <Skeleton className="h-0.5 flex-1 mx-2" />}
              </div>
            ))}
          </div>
          <div className="sm:hidden space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  )
}

/* ---------------- Lookup Form ---------------- */

function LookupForm({
  onSubmit,
  loading,
}: {
  onSubmit: (orderNumber: string, email: string) => void
  loading: boolean
}) {
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order_number') ?? '')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) return
    onSubmit(orderNumber.trim(), email.trim())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-offwhite">
          <Search className="h-5 w-5 text-brand-amber" />
          Track your order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-brand-steel mb-5">
          Enter your order number and the email you used at checkout to see the latest status.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order_number">Order number</Label>
            <Input
              id="order_number"
              placeholder="e.g. 1024"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? 'Searching…' : 'Track order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/* ---------------- Main ---------------- */

export default function OrderTrackUI({ token }: OrderTrackUIProps) {
  const { toast } = useToast()
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState<'not_found' | 'generic' | null>(null)
  const [showForm, setShowForm] = useState(!token)
  const [eventsOpen, setEventsOpen] = useState(false)

  const fetchTracking = async (payload: object) => {
    setLoading(true)
    setError(null)
    try {
      const result = await callEdge('order-track', payload)
      if (!result || result.error || result.ok === false) {
        setError('not_found')
      } else {
        setData(result as TrackingData)
        setShowForm(false)
      }
    } catch (err: any) {
      const msg = String(err?.message ?? '').toLowerCase()
      setError(msg.includes('404') || msg.includes('not found') ? 'not_found' : 'generic')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchTracking({ token })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleLookup = (orderNumber: string, email: string) =>
    fetchTracking({ store_id: STORE_ID, order_number: orderNumber, email })

  const copyTracking = (value: string) =>
    navigator.clipboard
      .writeText(value)
      .then(() => toast({ description: 'Tracking number copied!' }))
      .catch(() => toast({ description: 'Could not copy.', variant: 'destructive' }))

  const resetToForm = () => {
    setData(null)
    setError(null)
    setShowForm(true)
    setEventsOpen(false)
  }

  const steps = resolveSteps(data)
  const currentStep = data?.current_step ?? 0
  const displayMode = data?.display_mode ?? 'detailed'
  const carrier = data?.carrier || data?.shipping_carrier
  const events = data?.events ?? []

  return (
    <EcommerceTemplate layout="centered">
      <div className="py-8 max-w-2xl mx-auto w-full">
        {loading && <TrackingSkeleton />}

        {!loading && showForm && !data && <LookupForm onSubmit={handleLookup} loading={loading} />}

        {!loading && error === 'not_found' && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-4">
              <div className="rounded-full bg-muted p-5 inline-flex">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-brand-offwhite">Order not found</h3>
                <p className="text-sm text-brand-steel mt-1">
                  We couldn't find an order matching those details. Double-check and try again.
                </p>
              </div>
              <Button onClick={resetToForm}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {!loading && error === 'generic' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-10 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm text-brand-steel">Something went wrong. Please try again.</p>
              <Button variant="outline" onClick={resetToForm}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {!loading && data && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-brand-offwhite font-sora">Order Status</h1>
              <p className="text-sm text-brand-steel mt-1">Here's the latest on your delivery.</p>
            </div>

            {data.cancelled && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm font-medium text-destructive">This order has been cancelled.</p>
              </div>
            )}

            <Card className={cn(data.cancelled && 'opacity-40')}>
              <CardContent className="p-6">
                <OrderTimeline steps={steps} currentStep={currentStep} />
              </CardContent>
            </Card>

            {data.estimated_delivery_at && !data.cancelled && (
              <div className="flex items-center gap-3 bg-brand-amber/10 border border-brand-amber/25 rounded-xl px-4 py-3">
                <Calendar className="h-5 w-5 text-brand-amber shrink-0" />
                <div>
                  <p className="text-xs text-brand-steel">Estimated delivery</p>
                  <p className="text-sm font-semibold text-brand-offwhite">
                    {format(new Date(data.estimated_delivery_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {displayMode === 'detailed' && (carrier || data.tracking_number) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-brand-offwhite">
                    <Truck className="h-5 w-5 text-brand-amber" />
                    Shipping details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {carrier && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-steel">Carrier</span>
                      <span className="font-medium text-brand-offwhite">{carrier}</span>
                    </div>
                  )}
                  {data.tracking_number && (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-brand-steel">Tracking number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-brand-offwhite">{data.tracking_number}</span>
                        <button
                          onClick={() => copyTracking(data.tracking_number!)}
                          className="text-brand-steel hover:text-brand-amber transition-colors"
                          aria-label="Copy tracking number"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {data.tracking_url && (
                    <Button asChild variant="outline" className="w-full gap-2">
                      <a href={data.tracking_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Track with carrier
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {displayMode === 'detailed' && events.length > 0 && (
              <Card>
                <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-4 text-left">
                      <span className="flex items-center gap-2 font-medium text-brand-offwhite">
                        <MapPin className="h-5 w-5 text-brand-amber" />
                        Tracking history
                      </span>
                      <ChevronDown className={cn('h-4 w-4 text-brand-steel transition-transform', eventsOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 py-3 space-y-4">
                      {events.map((ev, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="shrink-0 w-px bg-brand-amber/30 ml-1.5 relative">
                            <span className="absolute -left-1 top-1 h-2.5 w-2.5 rounded-full bg-brand-amber" />
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-xs text-brand-steel">
                              {format(new Date(ev.occurred_at), 'MMM d, h:mm a')}
                            </p>
                            <p className="text-sm font-medium text-brand-offwhite">{ev.status_detail}</p>
                            {ev.location && <p className="text-xs text-brand-steel">{ev.location}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            <button
              onClick={resetToForm}
              className="text-sm text-brand-amber hover:underline mx-auto block"
            >
              Look up a different order
            </button>
          </div>
        )}
      </div>
    </EcommerceTemplate>
  )
}