import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, PLANS, type SubscriptionPlan } from '../lib/supabase'

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return }
    const s  = document.createElement('script')
    s.id     = 'razorpay-script'
    s.src    = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  monthly:    ['Admin applies on your behalf', 'Skill-based job matching', 'Application tracker', 'Email updates'],
  quarterly:  ['Everything in Monthly', 'Priority job matching', '3× more applications/month', 'WhatsApp updates'],
  halfyearly: ['Everything in Quarterly', 'Dedicated account manager', 'Resume optimisation tips', 'Interview alerts'],
  yearly:     ['Everything in Half-yearly', 'Unlimited applications', 'Resume rewrite (1×)', 'Career strategy call'],
}

const PLAN_SAVINGS: Record<SubscriptionPlan, string | null> = {
  monthly: null, quarterly: 'Save ₹50', halfyearly: 'Save ₹200', yearly: 'Save ₹500',
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Subscription() {
  const { user, profile, subscription, refreshProfile } = useAuth()
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const isExpired     = params.get('reason') === 'expired'

  const [selected, setSelected] = useState<SubscriptionPlan>('monthly')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<{ plan: SubscriptionPlan; endsAt: string } | null>(null)

  async function handleSubscribe() {
    if (!user) return
    setError(null); setLoading(true)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Payment gateway failed to load. Check your connection.')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired. Please sign in again.')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ plan: selected }),
        }
      )
      const orderData = await res.json()
      if (!res.ok) throw new Error(orderData.error || 'Could not create order.')

      const { orderId, amount, keyId } = orderData

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId, amount, currency: 'INR',
          name: 'Opportunities Cell',
          description: `${PLANS[selected].months} subscription`,
          order_id: orderId,
          prefill: {
            name:    profile?.full_name     || '',
            email:   profile?.email         || '',
            contact: profile?.mobile_number || '',
          },
          theme: { color: '#0f0f0f' },
          config: {
            display: {
              blocks: {
                upi: { name: 'Pay via UPI', instruments: [{ method: 'upi', flows: ['intent','collect','qr'] }] },
                other: { name: 'Other methods', instruments: [{ method: 'card' },{ method: 'netbanking' },{ method: 'wallet' }] },
              },
              sequence: ['block.upi', 'block.other'],
              preferences: { show_default_blocks: false },
            },
          },
          handler: async (response: Record<string, string>) => {
            try {
              const verRes = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                  body: JSON.stringify({
                    razorpay_order_id:   response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature:  response.razorpay_signature,
                  }),
                }
              )
              const verData = await verRes.json()
              if (!verRes.ok) throw new Error(verData.error || 'Verification failed.')

              // Re-activate account if it was suspended
              await supabase.from('profiles').update({ account_status: 'active' })
                .eq('id', user.id)

              await refreshProfile()
              setSuccess({ plan: selected, endsAt: verData.ends_at })
              resolve()
            } catch (err) { reject(err) }
          },
          modal: { ondismiss: () => reject(new Error('cancelled')), confirm_close: true },
        })
        rzp.open()
      })
    } catch (err) {
      const msg = (err as Error).message
      if (msg !== 'cancelled') setError(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ───────────────────────────────────────────── */
  if (success) {
    const nextDue = fmt(success.endsAt)
    const plan    = PLANS[success.plan]
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter',sans-serif", background: '#fff', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, fontWeight: 400,
            color: '#0f0f0f', marginBottom: 12 }}>Payment successful!</h1>

          {/* Renewal date card */}
          <div style={{ background: '#f7f7f7', border: '1.5px solid #ebebeb', borderRadius: 14,
            padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#9b9b9b' }}>Plan</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f' }}>{plan.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#9b9b9b' }}>Duration</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f' }}>{plan.months}</span>
            </div>
            <div style={{ height: 1, background: '#ebebeb', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#9b9b9b' }}>Next payment due</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>{nextDue}</span>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#9b9b9b', marginBottom: 28, lineHeight: 1.6 }}>
            Your account will be <strong>paused automatically</strong> on {nextDue} if payment isn't renewed.
            We'll remind you 3 days before.
          </p>

          <button onClick={() => navigate('/dashboard')} style={{
            width: '100%', height: 52, background: '#0f0f0f', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Inter',sans-serif",
          }}>Go to dashboard →</button>
        </div>
      </div>
    )
  }

  /* ── Main page ────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0f0f0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Expired / suspended banner */}
        {isExpired && (
          <div style={{ marginBottom: 36, padding: '20px 22px',
            background: 'linear-gradient(135deg, #fff1f2, #fff7ed)',
            border: '1.5px solid #fecaca', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', fontFamily: "'Inter',sans-serif" }}>
                Your account is paused
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#b45309', lineHeight: 1.6 }}>
              Your subscription expired and your account has been paused.
              Renew below to instantly reactivate access to your dashboard.
            </p>
          </div>
        )}

        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 10 }}>
          {isExpired ? 'RENEW SUBSCRIPTION' : 'STEP 2 OF 2 — CHOOSE A PLAN'}
        </p>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 38, fontWeight: 400,
          color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.15 }}>
          {isExpired ? 'Reactivate your account.' : 'We apply.\nYou get hired.'}
        </h1>
        <p style={{ fontSize: 15, color: '#9b9b9b', marginBottom: 36 }}>
          {isExpired
            ? 'Pick a plan and resume where you left off. All your data is saved.'
            : 'Pick a plan. We match jobs to your skills and apply on your behalf.'}
        </p>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12, marginBottom: 28 }}>
          {(Object.keys(PLANS) as SubscriptionPlan[]).map(plan => {
            const p          = PLANS[plan]
            const isSelected = selected === plan
            const saving     = PLAN_SAVINGS[plan]
            return (
              <button key={plan} type="button" onClick={() => setSelected(plan)} style={{
                background: isSelected ? '#0f0f0f' : '#fff',
                border: `2px solid ${isSelected ? '#0f0f0f' : '#ebebeb'}`,
                borderRadius: 16, padding: '22px 20px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
              }}>
                {saving && (
                  <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 11,
                    fontWeight: 700, padding: '3px 8px',
                    background: isSelected ? 'rgba(255,255,255,0.15)' : '#fef9c3',
                    color: isSelected ? '#fff' : '#854d0e', borderRadius: 99 }}>
                    {saving}
                  </span>
                )}
                <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22,
                  color: isSelected ? '#fff' : '#0f0f0f', marginBottom: 2 }}>{p.label}</p>
                <p style={{ fontSize: 13, color: isSelected ? 'rgba(255,255,255,0.5)' : '#b5b5b5', marginBottom: 18 }}>
                  {p.months}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLAN_FEATURES[plan].map(f => (
                    <li key={f} style={{ fontSize: 13,
                      color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b6b6b',
                      display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.4 }}>
                      <span style={{ color: isSelected ? '#4ade80' : '#22c55e', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, fontSize: 14, color: '#dc2626' }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={handleSubscribe} disabled={loading} style={{
          width: '100%', height: 56, background: loading ? '#6b6b6b' : '#0f0f0f', color: '#fff',
          border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {loading ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                animation: 'spin 0.7s linear infinite' }} />
              Opening payment…
            </>
          ) : isExpired ? `Renew — ${PLANS[selected].label} →` : `Pay ${PLANS[selected].label} →`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#b5b5b5', marginTop: 14 }}>
          🔒 Secured by Razorpay · UPI, Cards, Net banking · No auto-renewal
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
