/**
 * send-test-email
 * Sends a single email via Resend. Use to verify Resend delivery works
 * for any recipient — not just your own Resend account email.
 *
 * IMPORTANT: the 'from' address must be on a domain verified in Resend
 * (Resend dashboard → Domains). The sandbox address 'onboarding@resend.dev'
 * only delivers to the email that owns the Resend account — every other
 * recipient is silently dropped, which is why OTPs weren't reaching
 * other inboxes.
 *
 * Requires the RESEND_API_KEY secret to be set:
 *   supabase secrets set RESEND_API_KEY=re_xxx
 *
 * Invoke:
 *   curl -X POST https://<project>.supabase.co/functions/v1/send-test-email \
 *     -H "Authorization: Bearer <anon-or-service-key>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"to":"someone@example.com","subject":"Hello","html":"<p>Test</p>"}'
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 })
  }

  let body: { to?: string; subject?: string; html?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const { to, subject, html } = body
  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: 'to, subject, and html are required' }), { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Opportunities Cell <hello@opportunitiescell.com>',
      to,
      subject,
      html,
    }),
  })

  const result = await res.json()
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Resend rejected the email', detail: result }), { status: res.status })
  }

  return new Response(JSON.stringify({ message: 'Sent', id: result.id }))
})
