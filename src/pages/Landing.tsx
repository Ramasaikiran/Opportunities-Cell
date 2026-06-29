import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const TICK = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const CROSS = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const AVATARS = ['PK','AR','SM','VR','NK','DP']

export default function Landing() {
  const { session, subscription, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) return
    if (profile === null) return          // still loading
    if (profile?.is_admin) { navigate('/admin', { replace: true }); return }
    if (!profile?.user_type) { navigate('/onboarding', { replace: true }); return }
    if (!subscription) { navigate('/subscription', { replace: true }); return }
    navigate('/dashboard', { replace: true })
  }, [session, profile, subscription])

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fff', color: '#0f0f0f' }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0f0f0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/sign-in')} style={{
              background: 'none', border: 'none', fontSize: 14, color: '#6b6b6b',
              cursor: 'pointer', fontFamily: "'Inter',sans-serif", padding: '8px 12px',
            }}>Sign in</button>
            <button onClick={() => navigate('/sign-up')} style={{
              background: '#0f0f0f', color: '#fff', border: 'none',
              padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}>Get started →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, maxWidth: 780,
        margin: '0 auto', padding: '140px 24px 100px', textAlign: 'center' }}>

        {/* Live social proof pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 99, padding: '7px 16px', marginBottom: 36 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
            display: 'block', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
            43 students got shortlisted this week
          </span>
        </div>

        {/* HEADLINE — Vaibhav style: punchy, short, painful */}
        <h1 style={{
          fontFamily: "'Instrument Serif',Georgia,serif",
          fontSize: 'clamp(44px, 8vw, 76px)',
          fontWeight: 400, lineHeight: 1.04,
          letterSpacing: '-0.03em', color: '#0f0f0f',
          marginBottom: 28,
        }}>
          Stop wasting 3 hours<br />
          applying to jobs<br />
          <span style={{ color: '#9b9b9b' }}>nobody replies to.</span>
        </h1>

        {/* SUB — one brutal truth */}
        <p style={{ fontSize: 20, color: '#6b6b6b', lineHeight: 1.65,
          maxWidth: 560, margin: '0 auto 20px', fontWeight: 400 }}>
          You've sent 200+ applications.
          Got 3 replies.
          The problem isn't your skills.
        </p>
        <p style={{ fontSize: 20, color: '#0f0f0f', lineHeight: 1.65,
          maxWidth: 560, margin: '0 auto 44px', fontWeight: 600 }}>
          It's that you're applying alone.
        </p>

        {/* CTA block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/sign-up')} style={{
            background: '#0f0f0f', color: '#fff', border: 'none',
            padding: '18px 48px', borderRadius: 14, fontSize: 17, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Start getting interviews — ₹250/mo →
          </button>
          <p style={{ fontSize: 13, color: '#b5b5b5' }}>
            Setup takes 4 minutes. No card needed to start.
          </p>
        </div>

        {/* Avatar + trust */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, marginTop: 48 }}>
          <div style={{ display: 'flex' }}>
            {AVATARS.map((a, i) => (
              <div key={a} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `hsl(${i * 45 + 200},55%,55%)`,
                border: '2.5px solid #fff',
                marginLeft: i === 0 ? 0 : -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>{a[0]}</div>
            ))}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#9b9b9b' }}>
              <strong style={{ color: '#0f0f0f' }}>550+ students</strong> placed · 4.9/5 rating
            </p>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ────────────────────────────────────────── */}
      <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>

          {/* Without us */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              WITHOUT OPPORTUNITIES CELL
            </p>
            {[
              'Spend 3 hours daily copy-pasting the same application',
              'Generic cover letters that recruiters skip in 2 seconds',
              'Apply to 5 jobs/day — get 0 replies in 2 weeks',
              'No idea which companies even saw your profile',
              'Give up and settle for a job you didn\'t want',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                <CROSS /><p style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>

          {/* With us */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              WITH OPPORTUNITIES CELL
            </p>
            {[
              'Fill your profile once. We apply to 10–15 jobs every single day',
              'Tailored applications matched exactly to your skills and role',
              '150–450 applications/month while you focus on prep',
              'Dashboard shows every job applied, status, matched skills',
              'First shortlist typically within 3–5 days of going active',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                <TICK /><p style={{ fontSize: 14, color: '#0f0f0f', lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
          letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
          fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
          color: '#0f0f0f', marginBottom: 64 }}>
          4 minutes setup. Lifetime results.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2,
          background: '#f0f0f0', borderRadius: 16, overflow: 'hidden' }}>
          {[
            {
              step: '01', title: 'Fill your profile', time: '4 min',
              desc: 'Skills, resume, preferred roles, location. One time. No repeat.',
            },
            {
              step: '02', title: 'Pick a plan', time: '2 min',
              desc: 'From ₹250/month. No hidden charges. Cancel any time instantly.',
            },
            {
              step: '03', title: 'We apply daily', time: 'Ongoing',
              desc: 'Our team finds matches and applies with tailored cover letters. You get notified.',
            },
          ].map((s, i) => (
            <div key={s.step} style={{ background: i === 1 ? '#0f0f0f' : '#fff',
              padding: '36px 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700,
                  color: i === 1 ? 'rgba(255,255,255,0.4)' : '#b5b5b5',
                  letterSpacing: '0.08em' }}>{s.step}</span>
                <span style={{ fontSize: 11, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 99,
                  background: i === 1 ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
                  color: i === 1 ? 'rgba(255,255,255,0.6)' : '#9b9b9b' }}>{s.time}</span>
              </div>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22,
                color: i === 1 ? '#fff' : '#0f0f0f', marginBottom: 12 }}>{s.title}</p>
              <p style={{ fontSize: 14, color: i === 1 ? 'rgba(255,255,255,0.55)' : '#9b9b9b',
                lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1 }}>
          {[
            { n: '12,400+', l: 'Applications sent' },
            { n: '550+',    l: 'Students active'   },
            { n: '87%',     l: 'Get interview in 30 days' },
            { n: '₹250',    l: 'Starting per month' },
          ].map(s => (
            <div key={s.n} style={{ padding: '28px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif",
                fontSize: 36, color: '#fff', marginBottom: 8 }}>{s.n}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
          letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
          PRICING
        </p>
        <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
          fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
          color: '#0f0f0f', marginBottom: 8 }}>
          Less than one Swiggy order a day.
        </h2>
        <p style={{ fontSize: 16, color: '#9b9b9b', textAlign: 'center', marginBottom: 56 }}>
          ₹250/month. That's ₹8.3/day to get 10–15 applications sent while you sleep.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: '1 Month',  price: '₹250',  sub: '₹250/mo',  highlight: false, saving: null },
            { label: '3 Months', price: '₹700',  sub: '₹233/mo',  highlight: false, saving: 'Save ₹50' },
            { label: '6 Months', price: '₹1,300',sub: '₹216/mo',  highlight: true,  saving: 'Save ₹200' },
            { label: '12 Months',price: '₹2,500',sub: '₹208/mo',  highlight: false, saving: 'Save ₹500' },
          ].map(p => (
            <div key={p.label} style={{
              background: p.highlight ? '#0f0f0f' : '#fff',
              border: `1.5px solid ${p.highlight ? '#0f0f0f' : '#e8e8e8'}`,
              borderRadius: 14, padding: '24px 20px', position: 'relative', textAlign: 'center',
            }}>
              {p.saving && (
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  background: p.highlight ? '#22c55e' : '#fef9c3',
                  color: p.highlight ? '#fff' : '#92400e', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {p.saving}
                </span>
              )}
              <p style={{ fontSize: 13, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#9b9b9b', marginBottom: 8 }}>
                {p.label}
              </p>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 30,
                color: p.highlight ? '#fff' : '#0f0f0f', marginBottom: 4 }}>{p.price}</p>
              <p style={{ fontSize: 12, color: p.highlight ? 'rgba(255,255,255,0.4)' : '#b5b5b5' }}>{p.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => navigate('/sign-up')} style={{
            background: '#0f0f0f', color: '#fff', border: 'none',
            padding: '16px 44px', borderRadius: 12, fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter',sans-serif",
          }}>
            Start for ₹250/month →
          </button>
          <p style={{ fontSize: 12, color: '#b5b5b5', marginTop: 12 }}>
            No auto-renewal. Cancel anytime. Secured by Razorpay.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
            letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
            RESULTS
          </p>
          <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
            fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
            color: '#0f0f0f', marginBottom: 56 }}>
            Real students. Real interviews.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { text: 'Week 1: 4 shortlists. Week 3: offer from a Series B startup. This is insane value for ₹250.', name: 'Priya M.', role: 'SDE · Razorpay', initials: 'PM' },
              { text: 'I was applying manually for 4 months. Zero replies. Joined Opportunities Cell. Got 3 interviews in 8 days.', name: 'Arjun K.', role: 'Engineer · Groww', initials: 'AK' },
              { text: 'They applied to 340 jobs in my first month. I attended 7 interviews. Got 2 offers. Chose Zepto.', name: 'Sneha R.', role: 'Product · Zepto', initials: 'SR' },
              { text: 'The team customises every application. It shows. Recruiters actually reply.', name: 'Vikram P.', role: 'Backend · PhonePe', initials: 'VP' },
              { text: 'Freshers: stop wasting time on portals. Pay ₹250. Let these guys handle it. Focus on DSA.', name: 'Nidhi A.', role: 'SDE · Flipkart', initials: 'NA' },
              { text: 'Got placed in 19 days. Best ₹250 I ever spent. Period.', name: 'Rohit S.', role: 'Full Stack · Cred', initials: 'RS' },
            ].map(r => (
              <div key={r.name} style={{ background: '#fff', border: '1px solid #f0f0f0',
                borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p style={{ fontSize: 14, color: '#3f3f3f', lineHeight: 1.65, marginBottom: 18 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0f0f0f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{r.initials}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#9b9b9b' }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '100px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          THE QUESTION IS SIMPLE
        </p>
        <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif",
          fontSize: 'clamp(36px,6vw,60px)', fontWeight: 400,
          color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
          Keep applying alone<br />
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>and getting ignored.</span>
        </h2>
        <p style={{ fontSize: 'clamp(36px,6vw,60px)', fontFamily: "'Instrument Serif',Georgia,serif",
          fontWeight: 400, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 48 }}>
          Or let us handle it<br />
          <span style={{ color: '#22c55e' }}>for ₹250/month.</span>
        </p>
        <button onClick={() => navigate('/sign-up')} style={{
          background: '#fff', color: '#0f0f0f', border: 'none',
          padding: '18px 52px', borderRadius: 14, fontSize: 17, fontWeight: 800,
          cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.02em',
        }}>
          Get my first shortlist →
        </button>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 16 }}>
          4 min setup · ₹250/month · No auto-renewal
        </p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0f0f0f"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              Opportunities Cell
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © 2025 · All rights reserved
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"],
          section > div[style*="gridTemplateColumns: '1fr 1fr'"],
          div[style*="repeat(3,1fr)"],
          div[style*="repeat(4,1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="repeat(2,1fr)"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
