// @ts-nocheck
// Este archivo es una Supabase Edge Function (runtime Deno).
// Los errores de VS Code son falsos positivos — el código funciona correctamente en Supabase.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL     = 'Ferretería Online <onboarding@resend.dev>'
// Cuando tengas dominio propio cambia por: 'Ferretería Online <noreply@tudominio.com>'

// ⚠️ MODO DESARROLLO: Resend sin dominio verificado solo permite enviar a tu propio email.
// Agrega el secret DEV_EMAIL en Supabase con tu email de Resend (ej: yeraldfuste@gmail.com).
// Cuando tengas dominio verificado, elimina esta línea y usa siempre customerEmail.
const DEV_EMAIL = Deno.env.get('DEV_EMAIL') ?? null

const STATUS_INFO: Record<string, { subject: string; emoji: string; title: string; message: string; color: string }> = {
  pending: {
    subject: '📦 Tu pedido fue recibido - Ferretería Online',
    emoji: '📦',
    title: 'Pedido Recibido',
    message: 'Hemos recibido tu pedido correctamente. En breve nuestro equipo lo confirmará.',
    color: '#f59e0b',
  },
  confirmed: {
    subject: '✅ Tu pedido fue confirmado - Ferretería Online',
    emoji: '✅',
    title: 'Pedido Confirmado',
    message: 'Tu pedido ha sido confirmado y está siendo preparado para el envío.',
    color: '#3b82f6',
  },
  on_the_way: {
    subject: '🚚 Tu pedido va en camino - Ferretería Online',
    emoji: '🚚',
    title: '¡Tu pedido va en camino!',
    message: 'Nuestro repartidor está en ruta hacia tu dirección. ¡Prepárate para recibirlo!',
    color: '#8b5cf6',
  },
  delivered: {
    subject: '🎉 Tu pedido fue entregado - Ferretería Online',
    emoji: '🎉',
    title: '¡Pedido Entregado!',
    message: 'Tu pedido fue entregado exitosamente. ¡Gracias por confiar en nosotros!',
    color: '#22c55e',
  },
  cancelled: {
    subject: '❌ Tu pedido fue cancelado - Ferretería Online',
    emoji: '❌',
    title: 'Pedido Cancelado',
    message: 'Lamentamos informarte que tu pedido ha sido cancelado.',
    color: '#ef4444',
  },
}

function buildEmailHTML(params: {
  customerName: string
  orderId: string
  status: string
  total: number
  cancelReason?: string
  items: Array<{ product_name: string; quantity: number; subtotal: number }>
}) {
  const info    = STATUS_INFO[params.status]
  const shortId = params.orderId.slice(0, 8).toUpperCase()

  const itemsRows = params.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151;">
        ${item.product_name}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #6b7280; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: bold; color: #111827; text-align: right;">
        $${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('')

  const cancelBlock = params.cancelReason ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #dc2626;">
        Motivo de cancelación:
      </p>
      <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
        ${params.cancelReason}
      </p>
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${info.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 32px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 36px; height: 36px; background: #f97316; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; line-height: 36px; text-align: center;">
          🔧
        </div>
        <span style="color: white; font-size: 18px; font-weight: bold;">Ferretería Online</span>
      </div>
    </div>

    <!-- Status Banner -->
    <div style="background: ${info.color}; padding: 24px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">${info.emoji}</div>
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 800;">${info.title}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 8px 0;">
        Hola, <strong>${params.customerName}</strong>
      </p>
      <p style="font-size: 15px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.6;">
        ${info.message}
      </p>

      ${cancelBlock}

      <!-- Order ID -->
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
          Número de pedido
        </p>
        <p style="margin: 0; font-size: 22px; font-weight: 900; color: #111827; letter-spacing: 2px;">
          #${shortId}
        </p>
      </div>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="text-align: left; font-size: 12px; color: #9ca3af; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Producto</th>
            <th style="text-align: center; font-size: 12px; color: #9ca3af; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Cant.</th>
            <th style="text-align: right; font-size: 12px; color: #9ca3af; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Total -->
      <div style="background: #fff7ed; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 16px; font-weight: bold; color: #374151;">Total del pedido</span>
        <span style="font-size: 20px; font-weight: 900; color: #f97316;">$${params.total.toFixed(2)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
        © 2025 Ferretería Online. Todos los derechos reservados.
      </p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Cuba · info@ferreteria.cu · +53 5 000 0000
      </p>
    </div>

  </div>
</body>
</html>
  `
}

serve(async (req) => {
  // CORS para llamadas desde el frontend
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const body = await req.json()
    const { customerEmail, customerName, orderId, status, total, cancelReason, items } = body

    // Validar que el status es uno que debemos notificar
    if (!STATUS_INFO[status]) {
      return new Response(JSON.stringify({ error: 'Status not notifiable' }), { status: 400 })
    }

    const info = STATUS_INFO[status]

    // En modo desarrollo usamos DEV_EMAIL para evitar el error 403 de Resend.
    // En producción (con dominio verificado) DEV_EMAIL estará vacío y se usa customerEmail.
    const toEmail = DEV_EMAIL ?? customerEmail

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      toEmail,
        subject: info.subject,
        html:    buildEmailHTML({ customerName, orderId, status, total, cancelReason, items }),
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ error }), { status: 500 })
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})