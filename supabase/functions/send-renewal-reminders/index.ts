/**
 * send-renewal-reminders
 * Runs daily via cron. Finds subscriptions expiring in exactly 2 days,
 * sends one reminder email each (no duplicates), and logs to
 * renewal_reminders so it never re-sends for the same cycle.
 *
 * Schedule in Supabase Dashboard → Edge Functions → Schedules
 * Cron: 0 9 * * *  (daily 9am IST)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== Deno.env.get('CRON_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const resendKey = Deno.env.get('RESEND_API_KEY')

  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() + 2)
  windowStart.setHours(0, 0, 0, 0)
  const windowEnd = new Date(windowStart)
  windowEnd.setHours(23, 59, 59, 999)

  const { data: expiring, error } = await supabase
    .from('subscriptions')
    .select('user_id, ends_at, plan, profiles(email, full_name)')
    .eq('status', 'active')
    .gte('ends_at', windowStart.toISOString())
    .lte('ends_at', windowEnd.toISOString())

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!expiring || expiring.length === 0) {
    return new Response(JSON.stringify({ message: 'No subscriptions expiring in 2 days.', count: 0 }))
  }

  let sent = 0
  for (const sub of expiring) {
    // Skip if already reminded for this cycle (within last 3 days)
    const { data: already } = await supabase
      .from('renewal_reminders')
      .select('id')
      .eq('user_id', sub.user_id)
      .eq('reminder_type', 'expiry_2day')
      .gte('sent_at', new Date(Date.now() - 3 * 86400000).toISOString())
      .maybeSingle()
    if (already) continue

    const profile = sub.profiles as unknown as { email: string; full_name: string } | null
    if (profile?.email && resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'ApplyMate <support@applymate.in>',
          to: profile.email,
          subject: 'Your plan expires in 2 days',
          html: `<p>Hi ${profile.full_name || 'there'},</p>
            <p>Your ${sub.plan} plan expires on ${new Date(sub.ends_at).toLocaleDateString('en-IN')}.</p>
            <p>Renew now to keep your jobs and applications active.</p>
            <p><a href="https://applymate.in/subscription">Renew now →</a></p>`,
        }),
      })
    }

    await supabase.from('renewal_reminders').insert({
      user_id: sub.user_id, reminder_type: 'expiry_2day',
    })
    sent++
  }

  return new Response(JSON.stringify({ message: `Sent ${sent} reminder(s).`, count: sent }))
})
