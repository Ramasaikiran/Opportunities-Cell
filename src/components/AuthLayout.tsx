import type { ReactNode } from 'react'
import { isMisconfigured } from '../lib/supabase'

const AVATARS = ['PK','AR','SM','VR','NK','DP','RS','AK']

function LiveBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: '#fff', border: '1px solid #e8e8e8',
      borderRadius: 100, padding: '7px 14px', marginBottom: 32,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: '#22c55e', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          opacity: 0.4,
        }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#3f3f3f' }}>
        <strong style={{ color: '#0f0f0f' }}>43 students</strong> signed up today
      </span>
    </div>
  )
}

function AvatarStack() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
      <div style={{ display: 'flex' }}>
        {AVATARS.slice(0, 5).map((a, i) => (
          <div key={a} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `hsl(${i * 40 + 200}, 60%, 65%)`,
            border: '2px solid #f7f7f5',
            marginLeft: i === 0 ? 0 : -10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: '#fff',
          }}>{a[0]}</div>
        ))}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#f0f0f0', border: '2px solid #f7f7f5',
          marginLeft: -10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#9b9b9b',
        }}>+550</div>
      </div>
      <div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9b9b9b', marginTop: 2 }}>4.9 from 550+ students placed</p>
      </div>
    </div>
  )
}

const PROOF = [
  { metric: '12,400+', label: 'Applications sent', sub: 'across all platforms' },
  { metric: '10–15', label: 'Per student daily', sub: 'tailored, not spammy' },
  { metric: '3 days', label: 'Avg. to first interview', sub: 'after going active' },
]

const REVIEWS = [
  { text: 'Got 4 interviews in week one. Never looked back.', name: 'Priya M.', role: 'SDE @ Razorpay', avatar: 'PM' },
  { text: 'Saved me 3 hours every single day on applications.', name: 'Arjun K.', role: 'Engineer @ Groww', avatar: 'AK' },
]

export default function AuthLayout({
  eyebrow, title, subtitle, children, footer,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* LEFT */}
      <div className="left-panel" style={{
        width: '52%', background: '#f7f7f5',
        display: 'flex', flexDirection: 'column',
        padding: '44px 52px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 80 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#0f0f0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: '#0f0f0f' }}>Opportunities Cell</span>
        </div>

        {/* Hero */}
        <div style={{ flex: 1 }}>
          <LiveBadge />

          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 56, fontWeight: 400, lineHeight: 1.06,
            letterSpacing: '-0.03em', color: '#0f0f0f', marginBottom: 18,
          }}>
            We apply.<br />
            <em style={{ color: '#9b9b9b' }}>You interview.</em>
          </h1>
          <p style={{ fontSize: 16, color: '#6b6b6b', lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
            Tailored applications to 10–15 companies a day across Wellfound, LinkedIn, Naukri, and Indeed. Built for Indian students and early-career professionals.
          </p>

          <AvatarStack />

          {/* Proof stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 1, background: '#e8e8e8', borderRadius: 16,
            overflow: 'hidden', marginBottom: 28,
          }}>
            {PROOF.map(p => (
              <div key={p.metric} style={{ background: '#fff', padding: '18px 20px' }}>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: '#0f0f0f', marginBottom: 2 }}>{p.metric}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#3f3f3f', marginBottom: 2 }}>{p.label}</p>
                <p style={{ fontSize: 11, color: '#b5b5b5' }}>{p.sub}</p>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REVIEWS.map(r => (
              <div key={r.name} style={{
                background: '#fff', border: '1px solid #f0f0f0',
                borderRadius: 14, padding: '16px 18px',
                display: 'flex', gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: '#0f0f0f', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>{r.avatar}</div>
                <div>
                  <p style={{ fontSize: 13.5, color: '#3f3f3f', lineHeight: 1.55, marginBottom: 8 }}>"{r.text}"</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#0f0f0f' }}>
                    {r.name} <span style={{ fontWeight: 400, color: '#b5b5b5' }}>· {r.role}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: '#fff', overflowY: 'auto',
      }}>
        {/* Mobile nav */}
        <div className="mobile-nav" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 58,
          display: 'none', alignItems: 'center', padding: '0 20px',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #f0f0f0', zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
          </div>
        </div>

        {isMisconfigured && (
          <div style={{
            width: '100%', maxWidth: 420, marginBottom: 20,
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 12, padding: '14px 16px',
            fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            ⚠️ Add <code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code> in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        )}

        <div className="anim-slide-up" style={{ width: '100%', maxWidth: 420 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            {eyebrow}
          </p>
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 34, fontWeight: 400, color: '#0f0f0f',
            lineHeight: 1.15, letterSpacing: '-0.02em',
            marginBottom: subtitle ? 10 : 28,
          }}>{title}</h2>
          {subtitle && (
            <p style={{ fontSize: 15, color: '#9b9b9b', lineHeight: 1.6, marginBottom: 28 }}>{subtitle}</p>
          )}

          {children}

          {footer && (
            <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5, color: '#9b9b9b' }}>{footer}</p>
          )}

          <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11.5, color: '#c5c5c5', lineHeight: 1.7 }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#9b9b9b', textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms</a>
            {' '}&amp;{' '}
            <a href="#" style={{ color: '#9b9b9b', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @media (max-width: 900px) {
          .left-panel { display: none !important; }
          .mobile-nav { display: flex !important; }
          div[style*="max-width: 420"] { padding-top: 72px; }
        }
      `}</style>
    </div>
  )
}
