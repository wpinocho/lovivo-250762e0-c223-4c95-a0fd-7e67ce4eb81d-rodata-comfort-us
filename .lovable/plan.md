

# Plan: Enviar método de pago en el payload de payments-create-intent

## Problema
El backend (`payments-create-intent`) retorna error de SPEI aunque el usuario seleccionó tarjeta. El frontend NO envía el método de pago seleccionado en el payload — el backend no tiene forma de saber qué método eligió el usuario.

## Cambio

### `src/components/StripePayment.tsx`
- En `buildPayload`, agregar el campo `payment_method: selectedMethod` (que ya existe como state con valor `'card' | 'oxxo' | 'spei'`)
- Línea ~183, agregar al objeto: `payment_method: selectedMethod`

Resultado del payload:
```json
{
  "store_id": "...",
  "order_id": "...",
  "payment_method": "card",
  "use_stripe_connect": true,
  ...
}
```

## Impacto
- Un campo nuevo en el payload
- El backend puede usar este campo para decidir qué flujo ejecutar (card vs OXXO vs SPEI)
- **Validar con tu técnico de backend** que `payments-create-intent` lea este campo para no intentar crear un customer SPEI cuando el método es `card`

