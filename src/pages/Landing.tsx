import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* ── tiny helpers ─────────────────────────────────────────────── */
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
const STAR = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const AVATARS = ['PK','AR','SM','VR','NK','DP']

const COMPANIES = ['Razorpay','Groww','Zepto','PhonePe','Flipkart','CRED','Swiggy','Meesho']

/* ── live ticker numbers (rotates every 4 s) ─────────────────── */
const TICKERS = [
  '47 interviews booked this week',
  '12 offers accepted this month',
  '340 applications sent today',
  '8 students got shortlisted today',
]

export default function Landing() {
  const { session, subscription, profile } = useAuth()
  const navigate = useNavigate()
  const [tickerIdx, setTickerIdx]   = useState(0)
  const [showSticky, setShowSticky] = useState(false)
  const [openFaq, setOpenFaq]       = useState<number | null>(null)

  /* auth redirect */
  useEffect(() => {
    if (!session) return
    if (profile === null) return
    if (profile?.is_admin)   { navigate('/admin',        { replace: true }); return }
    if (!profile?.user_type) { navigate('/onboarding',   { replace: true }); return }
    if (!subscription)       { navigate('/subscription', { replace: true }); return }
    navigate('/dashboard', { replace: true })
  }, [session, profile, subscription])

  /* ticker */
  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 4000)
    return () => clearInterval(id)
  }, [])

  /* sticky bar */
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goSignUp = () => navigate('/sign-up')

  const FAQS = [
    {
      q: 'How do I know you\'re actually applying and not just taking my money?',
      a: 'Your dashboard shows every single job we\'ve applied to — company name, role, date applied, matched skills, and current status. Full transparency, zero guessing.',
    },
    {
      q: 'What if I don\'t get any interviews?',
      a: 'If you don\'t receive at least 1 shortlist within 14 days of your profile going active, email us and we\'ll extend your subscription by 14 days free. No questions asked.',
    },
    {
      q: 'Do you write generic cover letters or tailored ones?',
      a: 'Every application is tailored to the JD. We match your skills, highlight relevant projects, and write a cover letter specific to that company. Recruiters notice.',
    },
    {
      q: 'How many applications per day?',
      a: '10–15 applications daily. That\'s 300–450/month while you focus entirely on interview prep and DSA.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. No auto-renewal, no lock-in, no questions. Plans are one-time payments. When your period ends, you decide if you want to continue.',
    },
    {
      q: 'I\'m a fresher with no experience. Will this work?',
      a: 'Especially built for freshers. We highlight your projects, college, skills, and internships. Our targeting filters for fresher-friendly roles and companies that actively hire from colleges.',
    },
  ]

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", background: '#fff', color: '#0f0f0f' }}>

      {/* ── ANNOUNCEMENT BAR ──────────────────────────────────── */}
      <div style={{ background: '#0f0f0f', padding: '10px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, transition: 'opacity 0.4s' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
            display: 'block', flexShrink: 0, boxShadow: '0 0 0 3px rgba(34,197,94,0.25)',
            animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
            🔥 <strong>{TICKERS[tickerIdx]}</strong>
          </span>
        </div>
      </div>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
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
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600,
              background: '#f0fdf4', padding: '4px 12px', borderRadius: 99,
              border: '1px solid #bbf7d0' }}>
              ₹250/mo
            </span>
            <button onClick={() => navigate('/sign-in')} style={{
              background: 'none', border: 'none', fontSize: 14, color: '#6b6b6b',
              cursor: 'pointer', fontFamily: "'Inter',sans-serif", padding: '8px 12px',
            }}>Sign in</button>
            <button onClick={goSignUp} style={{
              background: '#0f0f0f', color: '#fff', border: 'none',
              padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}>Get started →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>

        {/* Urgency pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 99, padding: '7px 16px', marginBottom: 32 }}>
          <span style={{ fontSize: 13 }}>⏳</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#c2410c' }}>
            Only 12 spots left in Hyderabad this month
          </span>
        </div>

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

        <p style={{ fontSize: 20, color: '#6b6b6b', lineHeight: 1.65,
          maxWidth: 560, margin: '0 auto 16px', fontWeight: 400 }}>
          You've sent 200+ applications. Got 3 replies.
          The problem isn't your skills.
        </p>
        <p style={{ fontSize: 20, color: '#0f0f0f', lineHeight: 1.65,
          maxWidth: 560, margin: '0 auto 44px', fontWeight: 600 }}>
          It's that you're applying alone.
        </p>

        {/* Primary CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button onClick={goSignUp} style={{
            background: '#0f0f0f', color: '#fff', border: 'none',
            padding: '18px 52px', borderRadius: 14, fontSize: 17, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            letterSpacing: '-0.02em',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            Get my first shortlist — ₹250/mo →
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#9b9b9b' }}>✓ Setup in 4 minutes</span>
            <span style={{ fontSize: 13, color: '#9b9b9b' }}>✓ No auto-renewal</span>
            <span style={{ fontSize: 13, color: '#9b9b9b' }}>✓ 14-day guarantee</span>
          </div>
        </div>

        {/* Avatar + trust */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, marginTop: 52 }}>
          <div style={{ display: 'flex' }}>
            {AVATARS.map((a, i) => (
              <div key={a} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `hsl(${i * 45 + 200},55%,55%)`,
                border: '2.5px solid #fff', marginLeft: i === 0 ? 0 : -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>{a[0]}</div>
            ))}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
              {[1,2,3,4,5].map(i => <STAR key={i} />)}
            </div>
            <p style={{ fontSize: 13, color: '#9b9b9b' }}>
              <strong style={{ color: '#0f0f0f' }}>550+ students</strong> placed · 4.9/5 rating
            </p>
          </div>
        </div>
      </section>

      {/* ── PLACEMENT LOGOS ───────────────────────────────────── */}
      <section style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0',
        padding: '28px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#c4c4c4', letterSpacing: '0.12em',
            textTransform: 'uppercase', textAlign: 'center', marginBottom: 20 }}>
            Our students work at
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '8px 28px' }}>
            {COMPANIES.map(c => (
              <span key={c} style={{ fontSize: 14, fontWeight: 700, color: '#b5b5b5',
                letterSpacing: '-0.02em' }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN vs GAIN ──────────────────────────────────────── */}
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              WITHOUT OPPORTUNITIES CELL
            </p>
            {[
              'Spend 3 hours daily copy-pasting the same application',
              'Generic cover letters recruiters skip in 2 seconds',
              'Apply to 5 jobs/day — get 0 replies in 2 weeks',
              'No idea which companies even saw your profile',
              'Give up and settle for a role you didn\'t want',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                <CROSS /><p style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}

            {/* cost of inaction */}
            <div style={{ marginTop: 24, padding: '16px 18px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>
                💸 The real cost of waiting
              </p>
              <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
                Every month unemployed = ₹30,000–50,000 in lost salary.
                ₹250/month to fix it isn't a cost. It's the best ROI of your life.
              </p>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              WITH OPPORTUNITIES CELL
            </p>
            {[
              'Fill your profile once. We apply to 10–15 jobs every single day',
              'Tailored applications matched exactly to your skills and role',
              '300–450 applications/month while you focus on interview prep',
              'Dashboard shows every job applied, status, matched skills',
              'First shortlist typically within 3–5 days of going active',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                <TICK /><p style={{ fontSize: 14, color: '#0f0f0f', lineHeight: 1.6 }}>{t}</p>
              </div>
            ))}

            {/* guarantee callout */}
            <div style={{ marginTop: 24, padding: '16px 18px', background: '#f0fdf4',
              border: '1px solid #bbf7d0', borderRadius: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                🛡️ 14-day shortlist guarantee
              </p>
              <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                Don't get shortlisted in 14 days? We extend your plan free.
                Zero risk to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '64px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1 }}>
          {[
            { n: '12,400+', l: 'Applications sent'        },
            { n: '550+',    l: 'Students placed'           },
            { n: '87%',     l: 'Get shortlisted ≤ 30 days' },
            { n: '3–5 days',l: 'Avg. to first interview'   },
          ].map(s => (
            <div key={s.n} style={{ padding: '28px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif",
                fontSize: 36, color: '#fff', marginBottom: 8 }}>{s.n}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
          letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
          fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
          color: '#0f0f0f', marginBottom: 16 }}>
          4 minutes setup. Interviews for months.
        </h2>
        <p style={{ fontSize: 16, color: '#9b9b9b', textAlign: 'center', marginBottom: 56, maxWidth: 500, margin: '0 auto 56px' }}>
          You set up once. We do the grind. You focus on being ready when they call.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2,
          background: '#f0f0f0', borderRadius: 16, overflow: 'hidden' }}>
          {[
            {
              step: '01', title: 'Fill your profile', time: '4 min',
              desc: 'Skills, resume, preferred roles, location. One time. Never repeat.',
              icon: '📋',
            },
            {
              step: '02', title: 'Pick a plan', time: '2 min',
              desc: 'From ₹250/month. No hidden charges. Cancel any time instantly.',
              icon: '⚡',
            },
            {
              step: '03', title: 'We apply daily', time: 'Ongoing',
              desc: 'Our team finds matches and applies with tailored cover letters. You get notified of every single one.',
              icon: '🚀',
            },
          ].map((s, i) => (
            <div key={s.step} style={{ background: i === 1 ? '#0f0f0f' : '#fff', padding: '36px 30px' }}>
              <div style={{ fontSize: 28, marginBottom: 20 }}>{s.icon}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700,
                  color: i === 1 ? 'rgba(255,255,255,0.4)' : '#b5b5b5',
                  letterSpacing: '0.08em' }}>{s.step}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: i === 1 ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
                  color: i === 1 ? 'rgba(255,255,255,0.6)' : '#9b9b9b' }}>{s.time}</span>
              </div>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22,
                color: i === 1 ? '#fff' : '#0f0f0f', marginBottom: 10 }}>{s.title}</p>
              <p style={{ fontSize: 14, color: i === 1 ? 'rgba(255,255,255,0.55)' : '#9b9b9b',
                lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={goSignUp} style={{
            background: '#0f0f0f', color: '#fff', border: 'none',
            padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Inter',sans-serif",
          }}>
            Start today →
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
            letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
            RESULTS
          </p>
          <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
            fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
            color: '#0f0f0f', marginBottom: 56 }}>
            Real students. Real timelines.
          </h2>

          {/* Featured testimonial */}
          <div style={{ background: '#0f0f0f', borderRadius: 20, padding: '36px 40px',
            marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120,
              color: 'rgba(255,255,255,0.03)', fontFamily: 'Georgia,serif', lineHeight: 1 }}>"</div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
              {[1,2,3,4,5].map(i => <STAR key={i} />)}
            </div>
            <p style={{ fontSize: 22, fontFamily: "'Instrument Serif',Georgia,serif",
              color: '#fff', lineHeight: 1.55, marginBottom: 24, maxWidth: 700 }}>
              "They applied to 340 jobs in my first month. I attended 7 interviews. Got 2 offers. Chose Zepto.
              Literally the best ₹1,300 I ever spent — and I had an internship offer in week 3."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff' }}>SR</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Sneha R.</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Product Manager · Zepto · Got offer in 19 days</p>
              </div>
            </div>
          </div>

          {/* 3-col grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
            {[
              { text: 'Week 1: 4 shortlists. Week 3: offer from a Series B startup. Insane value for ₹250.', name: 'Priya M.', role: 'SDE · Razorpay', time: 'Placed in 18 days', initials: 'PM', color: '#0d9488' },
              { text: 'Applied manually for 4 months. Zero replies. Joined here. Got 3 interviews in 8 days. I wish I found this earlier.', name: 'Arjun K.', role: 'Engineer · Groww', time: 'Placed in 11 days', initials: 'AK', color: '#1d4ed8' },
              { text: 'The team customises every application. It shows — recruiters actually read them. Got my PhonePe offer in 2 weeks.', name: 'Vikram P.', role: 'Backend · PhonePe', time: 'Placed in 14 days', initials: 'VP', color: '#dc2626' },
            ].map(r => (
              <div key={r.name} style={{ background: '#fff', border: '1px solid #f0f0f0',
                borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(i => <STAR key={i} />)}
                </div>
                <p style={{ fontSize: 14, color: '#3f3f3f', lineHeight: 1.65, marginBottom: 18 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{r.initials}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#9b9b9b' }}>{r.role}</p>
                    <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{r.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2 more */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { text: 'Freshers: stop wasting time on portals. Pay ₹250. Let these guys handle it. Focus on DSA. It actually works.', name: 'Nidhi A.', role: 'SDE · Flipkart', time: 'Placed in 22 days', initials: 'NA', color: '#059669' },
              { text: 'Got placed in 19 days. Best ₹250 I ever spent. Period. The dashboard showing every application gave me so much confidence.', name: 'Rohit S.', role: 'Full Stack · CRED', time: 'Placed in 19 days', initials: 'RS', color: '#7c3aed' },
            ].map(r => (
              <div key={r.name} style={{ background: '#fff', border: '1px solid #f0f0f0',
                borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(i => <STAR key={i} />)}
                </div>
                <p style={{ fontSize: 14, color: '#3f3f3f', lineHeight: 1.65, marginBottom: 18 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{r.initials}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#9b9b9b' }}>{r.role}</p>
                    <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{r.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '96px 24px' }}>
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
          ₹250/month = ₹8.3/day to get 10–15 applications sent while you sleep.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: '1 Month',  price: '₹250',   sub: '₹250/mo',  highlight: false, popular: false, saving: null,       color: '#0f0f0f' },
            { label: '3 Months', price: '₹700',   sub: '₹233/mo',  highlight: false, popular: false, saving: 'Save ₹50', color: '#1d4ed8' },
            { label: '6 Months', price: '₹1,300', sub: '₹216/mo',  highlight: true,  popular: true,  saving: 'Save ₹200',color: '#7c3aed' },
            { label: '12 Months',price: '₹2,500', sub: '₹208/mo',  highlight: false, popular: false, saving: 'Save ₹500',color: '#059669' },
          ].map(p => (
            <div key={p.label} style={{
              background: p.highlight ? p.color : '#fff',
              border: `2px solid ${p.highlight ? p.color : '#e8e8e8'}`,
              borderRadius: 16, padding: '28px 20px', position: 'relative', textAlign: 'center',
              boxShadow: p.highlight ? `0 16px 48px ${p.color}33` : '0 1px 4px rgba(0,0,0,0.04)',
              transform: p.highlight ? 'scale(1.04)' : 'none',
            }}>
              {p.popular && (
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, padding: '4px 12px',
                  background: '#f59e0b', color: '#fff', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </span>
              )}
              {p.saving && !p.popular && (
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  background: '#fef9c3', color: '#92400e', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {p.saving}
                </span>
              )}
              <p style={{ fontSize: 13, color: p.highlight ? 'rgba(255,255,255,0.55)' : '#9b9b9b', marginBottom: 8 }}>
                {p.label}
              </p>
              <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32,
                color: p.highlight ? '#fff' : '#0f0f0f', marginBottom: 4 }}>{p.price}</p>
              <p style={{ fontSize: 12, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#b5b5b5', marginBottom: 20 }}>{p.sub}</p>
              <button onClick={goSignUp} style={{
                width: '100%', padding: '10px 0', borderRadius: 8,
                border: p.highlight ? '1px solid rgba(255,255,255,0.25)' : '1px solid #e8e8e8',
                background: p.highlight ? 'rgba(255,255,255,0.15)' : '#f5f5f5',
                color: p.highlight ? '#fff' : '#0f0f0f',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              }}>
                Get started →
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36, padding: '20px 24px', background: '#f0fdf4',
          border: '1px solid #bbf7d0', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#15803d', fontWeight: 500 }}>
            🛡️ <strong>14-day shortlist guarantee</strong> on all plans.
            Don't get shortlisted? We extend your plan free of charge.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#b5b5b5', marginTop: 20 }}>
          🔒 Secured by Razorpay · UPI · Cards · Net banking · No auto-renewal
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '96px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#b5b5b5',
            letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
            FAQ
          </p>
          <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 40,
            fontWeight: 400, textAlign: 'center', letterSpacing: '-0.025em',
            color: '#0f0f0f', marginBottom: 52 }}>
            Every question you have.
          </h2>

          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #ebebeb' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none', padding: '22px 0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter',sans-serif",
                }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', paddingRight: 24 }}>
                  {faq.q}
                </span>
                <span style={{ fontSize: 22, color: '#9b9b9b', flexShrink: 0,
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s', display: 'block' }}>+</span>
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.7,
                  paddingBottom: 22, paddingRight: 32 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button onClick={goSignUp} style={{
              background: '#0f0f0f', color: '#fff', border: 'none',
              padding: '16px 40px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}>
              I'm ready — get me shortlisted →
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '100px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          YOUR MOVE
        </p>
        <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif",
          fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400,
          color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Every day you wait<br />
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>is a day someone else</span><br />
          gets the role you wanted.
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>
          ₹250. 4 minutes. 14-day guarantee. What are you waiting for?
        </p>
        <button onClick={goSignUp} style={{
          background: '#fff', color: '#0f0f0f', border: 'none',
          padding: '20px 56px', borderRadius: 14, fontSize: 18, fontWeight: 800,
          cursor: 'pointer', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.02em',
          boxShadow: '0 8px 40px rgba(255,255,255,0.15)',
        }}>
          Get my first shortlist →
        </button>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18 }}>
          Setup in 4 min · ₹250/month · No auto-renewal · 14-day guarantee
        </p>

        {/* mini trust strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 28, marginTop: 52, flexWrap: 'wrap' }}>
          {['550+ students placed','12,400+ applications sent','4.9/5 avg rating','87% shortlisted ≤ 30 days'].map(t => (
            <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>✓ {t}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px' }}>
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
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2025 · All rights reserved</p>
        </div>
      </footer>

      {/* ── STICKY CTA BAR ────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
        transform: showSticky ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
            display: 'block', boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }} />
          <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>
            <strong>550+ students placed.</strong> Spots filling fast.
          </span>
        </div>
        <button onClick={goSignUp} style={{
          background: '#fff', color: '#0f0f0f', border: 'none',
          padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap',
        }}>
          Start for ₹250 →
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media (max-width: 768px) {
          div[style*="repeat(4,1fr)"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="1fr 1fr"]       { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
