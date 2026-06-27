import type { ReactNode } from 'react'

const STATS = [
  { value: '12,400+', label: 'Applications sent' },
  { value: '550+', label: 'Students placed' },
  { value: '10–15', label: 'Apps per day' },
]

const TESTIMONIALS = [
  { text: 'Got 3 interviews in my first week.', name: 'Priya M.', role: 'SDE @ Razorpay' },
  { text: 'Finally stopped dreading job apps.', name: 'Arjun K.', role: 'Engineer @ Groww' },
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A0A0F' }}>
      {/* LEFT PANEL */}
      <div style={{
        display: 'none',
        width: '48%',
        background: '#0D0D15',
        borderRight: '1px solid #1E1E2A',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg-panel">
        {/* Glow orbs */}
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(108,99,255,0.12)', top: -100, left: -100 }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(0,212,160,0.06)', bottom: 100, right: -50 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6C63FF, #00D4A0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>O</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#8585A0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Opportunities Cell
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6C63FF', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            YOUR CAREER OS
          </p>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 48, fontWeight: 400, lineHeight: 1.1, color: '#F0F0FF', marginBottom: 20 }}>
            We apply.<br />
            <em style={{ color: '#8B84FF' }}>You interview.</em>
          </h1>
          <p style={{ fontSize: 15, color: '#8585A0', lineHeight: 1.7, maxWidth: 380 }}>
            Tailored applications across Wellfound, LinkedIn, Naukri, and Indeed — every single day. Built for students breaking into tech.
          </p>

          {/* Testimonials */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #1E1E2A',
                borderRadius: 12,
                padding: '16px 18px',
              }}>
                <p style={{ fontSize: 13, color: '#C5C5D8', lineHeight: 1.6, marginBottom: 10 }}>"{t.text}"</p>
                <p style={{ fontSize: 11, color: '#6C63FF', fontWeight: 600 }}>{t.name} · <span style={{ color: '#3D3D52', fontWeight: 400 }}>{t.role}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: 24, color: '#F0F0FF', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#8585A0', lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflowY: 'auto',
      }}>
        {/* Background gradient */}
        <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(108,99,255,0.05)', top: '20%', left: '50%', transform: 'translateX(-50%)' }} />

        {/* Mobile logo */}
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 8 }} className="mobile-logo">
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #6C63FF, #00D4A0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>O</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8585A0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Opportunities Cell</span>
        </div>

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }} className="animate-rise">
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6C63FF', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            {eyebrow}
          </p>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 36, fontWeight: 400, color: '#F0F0FF', lineHeight: 1.15, marginBottom: subtitle ? 10 : 32 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 14, color: '#8585A0', lineHeight: 1.6, marginBottom: 32 }}>{subtitle}</p>
          )}

          {children}

          {footer && (
            <p style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: '#3D3D52' }}>{footer}</p>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  )
}
