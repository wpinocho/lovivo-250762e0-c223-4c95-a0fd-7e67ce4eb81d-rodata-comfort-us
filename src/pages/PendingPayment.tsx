import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { EcommerceTemplate } from '@/templates/EcommerceTemplate'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Building2, ExternalLink, Copy, Check, ShoppingBag, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OxxoData {
  method: 'oxxo'
  orderId: string
  voucherUrl: string
  number?: string
  expiresAfter?: number
  amount: number
  currency: string
}

interface SpeiData {
  method: 'spei'
  orderId: string
  hostedUrl?: string
  clabe: string
  bankName: string
  amount: number
  currency: string
}

type PendingData = OxxoData | SpeiData

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({ title: 'Copiado', description: 'Se copió al portapapeles' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Error', description: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  return (
    <button onClick={handleCopy} className="p-1.5 rounded hover:bg-muted transition-colors" title="Copiar">
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
    </button>
  )
}

export default function PendingPayment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<PendingData | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_payment')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.orderId === orderId) {
          setData(parsed)
        }
      }
    } catch {}
  }, [orderId])

  if (!data) {
    return (
      <EcommerceTemplate layout="centered">
        <div className="py-16 text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Información de pago no encontrada</h1>
          <p className="text-muted-foreground text-sm">Es posible que ya hayas completado este pago o que el enlace haya expirado.</p>
          <Button onClick={() => navigate('/mis-pedidos')} variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Ver mis pedidos
          </Button>
        </div>
      </EcommerceTemplate>
    )
  }

  return (
    <EcommerceTemplate layout="centered">
      <div className="py-8 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {data.method === 'oxxo' ? (
            <Store className="h-12 w-12 text-primary mx-auto" />
          ) : (
            <Building2 className="h-12 w-12 text-primary mx-auto" />
          )}
          <h1 className="text-2xl font-bold">
            {data.method === 'oxxo' ? 'Pago pendiente en OXXO' : 'Completa tu transferencia SPEI'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Pedido #{orderId?.slice(0, 8)}
          </p>
        </div>

        {/* OXXO content */}
        {data.method === 'oxxo' && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Presenta el siguiente voucher en cualquier tienda OXXO para completar tu pago.
              </p>

              {(data as OxxoData).number && (
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Código de referencia</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-[11px] sm:text-lg font-mono font-bold tracking-wider break-all">{(data as OxxoData).number}</code>
                    <CopyButton text={(data as OxxoData).number!} />
                  </div>
                </div>
              )}

              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Monto a pagar</p>
                <p className="text-2xl font-bold">{data.currency} ${data.amount.toFixed(2)}</p>
              </div>

              {(data as OxxoData).expiresAfter && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-800">
                    ⏱ Tienes hasta el{' '}
                    <strong>
                      {new Date((data as OxxoData).expiresAfter! * 1000).toLocaleDateString('es-MX', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </strong>{' '}
                    para realizar el pago.
                  </p>
                </div>
              )}

              {(data as OxxoData).voucherUrl && (
                <Button asChild className="w-full" size="lg">
                  <a href={(data as OxxoData).voucherUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver voucher de pago
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* SPEI content */}
        {data.method === 'spei' && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Realiza una transferencia SPEI con los siguientes datos desde tu banca en línea o app bancaria.
              </p>

              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">CLABE</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm sm:text-lg font-mono font-bold tracking-wider break-all">{(data as SpeiData).clabe}</code>
                    <CopyButton text={(data as SpeiData).clabe} />
                  </div>
                </div>

                {(data as SpeiData).bankName && (
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Banco</p>
                    <p className="font-medium">{(data as SpeiData).bankName}</p>
                  </div>
                )}

                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Monto a transferir</p>
                  <p className="text-2xl font-bold">{data.currency} ${data.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-sm text-emerald-800">
                  ⚡ La confirmación del pago es generalmente instantánea una vez realizada la transferencia.
                </p>
              </div>

              {(data as SpeiData).hostedUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={(data as SpeiData).hostedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver instrucciones completas
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/mis-pedidos')} variant="outline" className="flex-1">
            <Package className="mr-2 h-4 w-4" />
            Ver mis pedidos
          </Button>
          <Button onClick={() => navigate('/')} variant="ghost" className="flex-1">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        </div>
      </div>
    </EcommerceTemplate>
  )
}
