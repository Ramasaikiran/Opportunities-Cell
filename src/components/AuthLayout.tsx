import type { ReactNode } from 'react'
import { isMisconfigured } from '../lib/supabase'

const LOGOS = ['Wellfound', 'LinkedIn', 'Naukri', 'Indeed', 'Internshala']

const REVIEWS = [
  { stars: 5, text: 'Got 4 interviews in week one. Never looked back.', name: 'Priya M.', role: 'SDE · Razorpay' },
  { stars: 5, text: 'Best thing I did after graduation. Period.', name: 'Arjun K.', role: 'Engineer · Groww' },
  { stars: 5, text: 'Saved me 3 hours every day on applications.', name: 'Sneha R.', role: 'PM · Flipkart' },
]

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#0f0f0f">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT — Hero ─────────────────────────── */}
      <div style={{
        width: '52%',
        background: '#f7f7f5',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 56px',
        position: 'relative',
        overflow: 'hidden',
      }} className="left-panel">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: '#0f0f0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#ffffff" strokeWidth="0"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0f', letterSpacing: '-0.02em' }}>
            Opportunities Cell
          </span>
        </div>

        {/* Main hero */}
        <div style={{ paddingTop: 80, paddingBottom: 60 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: '1px solid #e8e8e8',
            borderRadius: 100, padding: '6px 14px',
            marginBottom: 32,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#6b6b6b' }}>550+ students placed this year</span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 54, fontWeight: 400, lineHeight: 1.08,
            color: '#0f0f0f', letterSpacing: '-0.02em',
            marginBottom: 20,
          }}>
            We apply.<br />
            <span style={{ color: '#6b6b6b', fontStyle: 'italic' }}>You interview.</span>
          </h1>

          <p style={{ fontSize: 16, color: '#6b6b6b', lineHeight: 1.65, maxWidth: 400, marginBottom: 40 }}>
            Tailored applications sent to top companies every day — while you focus on preparing, not applying.
          </p>

          {/* Platform logos */}
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#b5b5b5', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Applied across
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LOGOS.map((l) => (
                <div key={l} style={{
                  background: '#ffffff', border: '1px solid #e8e8e8',
                  borderRadius: 8, padding: '6px 12px',
                  fontSize: 12, fontWeight: 500, color: '#6b6b6b',
                }}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#e8e8e8', borderRadius: 16, overflow: 'hidden', marginBottom: 48 }}>
            {[
              { n: '12,400+', l: 'Applications sent' },
              { n: '10–15', l: 'Per student, daily' },
              { n: '4.9 / 5', l: 'Average rating' },
            ].map((s) => (
              <div key={s.l} style={{ background: '#fff', padding: '20px 22px' }}>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: '#0f0f0f', marginBottom: 4 }}>{s.n}</p>
                <p style={{ fontSize: 12, color: '#b5b5b5', fontWeight: 400 }}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {REVIEWS.map((r) => (
              <div key={r.name} style={{
                background: '#ffffff', border: '1px solid #f0f0f0',
                borderRadius: 14, padding: '18px 20px',
              }}>
                <Stars n={r.stars} />
                <p style={{ fontSize: 14, color: '#3f3f3f', lineHeight: 1.6, marginBottom: 10 }}>"{r.text}"</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f0f0f' }}>
                  {r.name} <span style={{ fontWeight: 400, color: '#b5b5b5' }}>· {r.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form ─────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#ffffff',
        overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 60, display: 'flex', alignItems: 'center',
          padding: '0 24px', background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0',
          zIndex: 50,
        }} className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f', letterSpacing: '-0.02em' }}>Opportunities Cell</span>
          </div>
        </div>

        {/* Env warning */}
        {isMisconfigured && (
          <div style={{
            width: '100%', maxWidth: 400, marginBottom: 20,
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 12, padding: '14px 16px',
            fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            ⚠️ <strong>Missing Supabase env vars.</strong> Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 400 }} className="anim-slide-up">
          {/* Eyebrow */}
          <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            {eyebrow}
          </p>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 36, fontWeight: 400, color: '#0f0f0f',
            lineHeight: 1.15, letterSpacing: '-0.02em',
            marginBottom: subtitle ? 10 : 32,
          }}>
            {title}
          </h2>

          {subtitle && (
            <p style={{ fontSize: 15, color: '#9b9b9b', lineHeight: 1.6, marginBottom: 32 }}>
              {subtitle}
            </p>
          )}

          {children}

          {footer && (
            <p style={{ marginTop: 28, textAlign: 'center', fontSize: 13.5, color: '#9b9b9b' }}>
              {footer}
            </p>
          )}

          <p style={{ marginTop: 32, textAlign: 'center', fontSize: 11.5, color: '#c5c5c5', lineHeight: 1.7 }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#9b9b9b', textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#9b9b9b', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .left-panel { display: none !important; }
          .mobile-header { display: flex !important; }
          #root > div > div:last-child { padding-top: 80px; }
        }
        @media (min-width: 901px) {
          .mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}
