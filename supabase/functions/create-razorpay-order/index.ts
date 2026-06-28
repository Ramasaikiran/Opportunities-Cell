import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PLANS: Record<string, { amount: number; days: number; label: string }> = {
  monthly:     { amount: 25000,  days: 30,  label: '1 Month'  },
  quarterly:   { amount: 70000,  days: 90,  label: '3 Months' },
  halfyearly:  { amount: 130000, days: 180, label: '6 Months' },
  yearly:      { amount: 250000, days: 365, label: '1 Year'   },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { plan } = await req.json()
    if (!PLANS[plan]) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: corsHeaders })

    // Verify user auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { amount } = PLANS[plan]
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!

    // Create Razorpay order
    const razorRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `opp_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { plan, user_id: user.id },
      }),
    })
    const order = await razorRes.json()
    if (!razorRes.ok) throw new Error(order.error?.description || 'Razorpay error')

    // Insert pending subscription record
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan,
      amount_paise: amount,
      status: 'pending',
      razorpay_order_id: order.id,
    })

    return new Response(JSON.stringify({ orderId: order.id, amount, keyId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: corsHeaders,
    })
  }
})
