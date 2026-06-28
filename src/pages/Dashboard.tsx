import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type AppStats, type JobApplication, PLANS } from '../lib/supabase'

type Period = '7' | '30' | '365' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '7': 'Last 7 days', '30': 'Last 30 days', '365': 'Last 365 days', 'all': 'All time',
}

function StatCard({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 16,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span style={{ fontSize: 34, fontWeight: 700, color: color || '#0f0f0f', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 13, color: '#9b9b9b' }}>{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const { profile, subscription, signOut } = useAuth()
  const navigate = useNavigate()

  const [stats,       setStats]       = useState<AppStats | null>(null)
  const [matched,     setMatched]     = useState<number>(0)
  const [recentApps,  setRecentApps]  = useState<JobApplication[]>([])
  const [period,      setPeriod]      = useState<Period>('30')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    if (!profile) return
    setLoadingData(true)
    try {
      const [statsRes, matchedRes, appsRes] = await Promise.all([
        supabase.rpc('get_application_stats', { p_user_id: profile.id }),
        supabase.rpc('get_matched_jobs_count', { p_user_id: profile.id }),
        supabase.from('job_applications')
          .select('*').eq('user_id', profile.id)
          .order('applied_at', { ascending: false }).limit(10),
      ])
      if (statsRes.data)  setStats(statsRes.data as AppStats)
      if (matchedRes.data !== null) setMatched(matchedRes.data as number)
      if (appsRes.data)   setRecentApps(appsRes.data as JobApplication[])
    } finally {
      setLoadingData(false)
    }
  }

  const periodCount = stats
    ? period === '7'   ? stats.last_7_days
    : period === '30'  ? stats.last_30_days
    : period === '365' ? stats.last_365_days
    : stats.all_time
    : 0

  const isSubscribed = !!subscription

  const STATUS_COLOR: Record<string, string> = {
    applied: '#6b6b6b', shortlisted: '#2563eb', interview: '#7c3aed',
    rejected: '#dc2626', hired: '#16a34a',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Navbar */}
      <div style={{
        position: 'sticky', top: 0,
        background: 'rgba(250,250,250,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0', zIndex: 50,
        display: 'flex', alignItems: 'center', padding: '0 28px', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0f0f0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile?.is_admin && (
            <Link to="/admin" style={{
              padding: '8px 14px', background: '#f5f5f5',
              color: '#0f0f0f', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>Admin →</Link>
          )}
          <button onClick={signOut} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#9b9b9b', fontFamily: "'Inter',sans-serif",
          }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Greeting */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 8 }}>YOUR DASHBOARD</p>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 34, fontWeight: 400,
          color: '#0f0f0f', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Welcome back, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'there'}.
        </h1>
        <p style={{ fontSize: 15, color: '#9b9b9b', marginBottom: 36 }}>
          Here's how your job search is going.
        </p>

        {/* Subscription card — renewal date + days left */}
        {subscription ? (() => {
          const endsAt   = new Date(subscription.ends_at!)
          const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / 86400000)
          const isUrgent = daysLeft <= 7
          const renewDate = endsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          return (
            <div style={{
              marginBottom: 28, padding: '18px 22px', borderRadius: 14,
              background: isUrgent ? '#fff7ed' : '#f7f7f7',
              border: `1.5px solid ${isUrgent ? '#fed7aa' : '#ebebeb'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    background: isUrgent ? '#ffedd5' : '#dcfce7',
                    color: isUrgent ? '#ea580c' : '#16a34a',
                  }}>
                    {isUrgent ? `⚠ ${daysLeft}d left` : '✓ Active'}
                  </span>
                  <span style={{ fontSize: 13, color: '#9b9b9b' }}>{PLANS[subscription.plan].months} plan</span>
                </div>
                <p style={{ fontSize: 14, color: '#6b6b6b' }}>
                  Next payment due:{' '}
                  <strong style={{ color: isUrgent ? '#dc2626' : '#0f0f0f' }}>{renewDate}</strong>
                </p>
              </div>
              <button onClick={() => navigate('/subscription')} style={{
                padding: '9px 18px', background: isUrgent ? '#dc2626' : '#0f0f0f', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Inter',sans-serif", flexShrink: 0,
              }}>
                {isUrgent ? 'Renew now ⚡' : 'Manage plan'}
              </button>
            </div>
          )
        })() : null}

        {/* Applications stats */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f' }}>Applications sent</h2>
            <select value={period} onChange={e => setPeriod(e.target.value as Period)}
              style={{
                fontSize: 13, border: '1.5px solid #e5e5e5', borderRadius: 8,
                padding: '6px 12px', background: '#fff', color: '#0f0f0f',
                fontFamily: "'Inter',sans-serif", cursor: 'pointer', outline: 'none',
              }}>
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {loadingData ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#b5b5b5' }}>Loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              <StatCard value={periodCount} label={PERIOD_LABELS[period]} />
              <StatCard value={matched}     label="Jobs matching your skills" color="#2563eb" />
              <StatCard value={stats?.shortlisted ?? 0} label="Shortlisted" color="#7c3aed" />
              <StatCard value={stats?.hired ?? 0}       label="Hired / Offers" color="#16a34a" />
            </div>
          )}
        </div>

        {/* Profile completeness */}
        {(!profile?.mobile_number || !profile?.linkedin_url || profile?.role_interests?.length === 0) && (
          <div style={{
            marginBottom: 28, padding: '16px 20px', background: '#fff8ed',
            border: '1px solid #fed7aa', borderRadius: 12,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>
              ⚠ Complete your profile
            </p>
            <p style={{ fontSize: 13, color: '#b45309', lineHeight: 1.6 }}>
              {!profile?.mobile_number && '· Mobile number missing. '}
              {!profile?.linkedin_url && '· LinkedIn URL missing. '}
              {(!profile?.role_interests || profile.role_interests.length === 0) && '· No roles selected. '}
              Better profile = better job matches.
            </p>
          </div>
        )}

        {/* Recent applications table */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', marginBottom: 14 }}>Recent applications</h2>
          {loadingData ? (
            <div style={{ fontSize: 14, color: '#b5b5b5', textAlign: 'center', padding: '40px 0' }}>Loading…</div>
          ) : recentApps.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 16,
            }}>
              <p style={{ fontSize: 15, color: '#9b9b9b', marginBottom: 8 }}>No applications yet.</p>
              <p style={{ fontSize: 13, color: '#c5c5c5' }}>
                {isSubscribed
                  ? 'Our admin team is matching jobs to your profile. Check back soon.'
                  : 'Subscribe so our team can start applying on your behalf.'}
              </p>
              {!isSubscribed && (
                <button onClick={() => navigate('/subscription')} style={{
                  marginTop: 16, padding: '10px 20px', background: '#0f0f0f', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif",
                }}>View plans →</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentApps.map(app => (
                <div key={app.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: '#fff',
                  border: '1.5px solid #f0f0f0', borderRadius: 12, gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0f', marginBottom: 2 }}>
                      {app.job_title || 'Role'}
                    </p>
                    <p style={{ fontSize: 13, color: '#9b9b9b' }}>
                      {app.company || '—'} · {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    {app.matched_skills?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {app.matched_skills.slice(0, 4).map(s => (
                          <span key={s} style={{
                            fontSize: 11, padding: '2px 8px', background: '#f5f5f5',
                            color: '#6b6b6b', borderRadius: 99,
                          }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                    background: STATUS_COLOR[app.status] + '18',
                    color: STATUS_COLOR[app.status], textTransform: 'capitalize', flexShrink: 0,
                  }}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
