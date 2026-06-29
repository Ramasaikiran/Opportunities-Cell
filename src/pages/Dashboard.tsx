import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, PLANS, type AppStats, type JobApplication } from '../lib/supabase'

type Period = '7' | '30' | '365' | 'all'

const PERIOD_MAP: Record<Period, string> = {
  '7': 'Last 7 days', '30': 'Last 30 days', '365': 'Last year', 'all': 'All time',
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  applied:     { label: 'Applied',     color: '#6b6b6b', bg: '#f5f5f5'  },
  shortlisted: { label: 'Shortlisted', color: '#2563eb', bg: '#eff6ff'  },
  interview:   { label: 'Interview',   color: '#7c3aed', bg: '#f5f3ff'  },
  rejected:    { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2'  },
  hired:       { label: 'Hired',       color: '#16a34a', bg: '#f0fdf4'  },
}

function StatCard({ value, label, sub, accent }: { value: number | string; label: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 36, fontWeight: 700, color: accent || '#0f0f0f',
        lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#3f3f3f' }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: '#b5b5b5' }}>{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { profile, subscription, signOut } = useAuth()
  const navigate = useNavigate()

  const [stats,      setStats]      = useState<AppStats | null>(null)
  const [matched,    setMatched]    = useState(0)
  const [apps,       setApps]       = useState<JobApplication[]>([])
  const [period,     setPeriod]     = useState<Period>('30')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    if (!profile) return
    setLoading(true)
    const [s, m, a] = await Promise.all([
      supabase.rpc('get_application_stats', { p_user_id: profile.id }),
      supabase.rpc('get_matched_jobs_count', { p_user_id: profile.id }),
      supabase.from('job_applications').select('*')
        .eq('user_id', profile.id).order('applied_at', { ascending: false }).limit(20),
    ])
    if (s.data)  setStats(s.data as AppStats)
    if (m.data !== null) setMatched(m.data as number)
    if (a.data)  setApps(a.data as JobApplication[])
    setLoading(false)
  }

  const periodVal = stats
    ? period === '7' ? stats.last_7_days : period === '30' ? stats.last_30_days
    : period === '365' ? stats.last_365_days : stats.all_time
    : 0

  // Subscription renewal info
  let daysLeft  = 0
  let renewDate = ''
  let isUrgent  = false
  if (subscription?.ends_at) {
    const end = new Date(subscription.ends_at)
    daysLeft  = Math.ceil((end.getTime() - Date.now()) / 86400000)
    isUrgent  = daysLeft <= 7
    renewDate = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Profile completion
  const completionItems = [
    { done: !!profile?.first_name,     label: 'Name'        },
    { done: !!profile?.mobile_number,  label: 'Mobile'      },
    { done: !!profile?.linkedin_url,   label: 'LinkedIn'    },
    { done: !!profile?.github_url,     label: 'GitHub'      },
    { done: !!profile?.role_interests?.length, label: 'Roles' },
    { done: !!profile?.user_type,      label: 'Profile type'},
  ]
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px',
          height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0f0f0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {profile?.is_admin && (
              <Link to="/admin" style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f',
                background: '#f5f5f5', padding: '6px 12px', borderRadius: 7, textDecoration: 'none' }}>
                Admin
              </Link>
            )}
            <button onClick={signOut} style={{ background: 'none', border: 'none',
              fontSize: 13, color: '#9b9b9b', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              padding: '6px 10px' }}>Sign out</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>DASHBOARD</p>
            <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28,
              fontWeight: 400, color: '#0f0f0f', letterSpacing: '-0.02em' }}>
              {profile?.first_name ? `Welcome back, ${profile.first_name}.` : 'Your dashboard'}
            </h1>
          </div>
          {/* Subscription pill */}
          {subscription && (
            <div onClick={() => navigate('/subscription')} style={{
              padding: '10px 16px', background: isUrgent ? '#fff7ed' : '#f7f7f7',
              border: `1px solid ${isUrgent ? '#fed7aa' : '#e8e8e8'}`,
              borderRadius: 10, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%',
                  background: isUrgent ? '#f97316' : '#22c55e', display: 'block' }} />
                <span style={{ fontSize: 12, fontWeight: 600,
                  color: isUrgent ? '#ea580c' : '#15803d' }}>
                  {isUrgent ? `${daysLeft} days left` : 'Active'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#9b9b9b' }}>
                Next due: <strong style={{ color: isUrgent ? '#dc2626' : '#0f0f0f' }}>{renewDate}</strong>
              </p>
            </div>
          )}
        </div>

        {/* No subscription alert */}
        {!subscription && (
          <div style={{ marginBottom: 24, padding: '16px 20px',
            background: '#0f0f0f', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>
              Your account isn't active yet. Subscribe to start getting applications.
            </p>
            <button onClick={() => navigate('/subscription')} style={{
              background: '#fff', color: '#0f0f0f', border: 'none',
              padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif", flexShrink: 0,
            }}>Subscribe →</button>
          </div>
        )}

        {/* Profile completion bar */}
        {completionPct < 100 && (
          <div style={{ marginBottom: 24, padding: '16px 20px', background: '#fff',
            border: '1px solid #f0f0f0', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>
                Profile {completionPct}% complete
              </p>
              <p style={{ fontSize: 12, color: '#9b9b9b' }}>
                Missing: {completionItems.filter(i => !i.done).map(i => i.label).join(', ')}
              </p>
            </div>
            <div style={{ height: 6, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionPct}%`,
                background: completionPct < 50 ? '#ef4444' : completionPct < 80 ? '#f59e0b' : '#22c55e',
                borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}

        {/* Stats — period dropdown */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>Applications sent</p>
            <select value={period} onChange={e => setPeriod(e.target.value as Period)}
              style={{ fontSize: 13, border: '1px solid #e5e5e5', borderRadius: 7,
                padding: '6px 10px', background: '#fff', color: '#0f0f0f',
                fontFamily: "'Inter',sans-serif", cursor: 'pointer', outline: 'none' }}>
              {(Object.keys(PERIOD_MAP) as Period[]).map(p => (
                <option key={p} value={p}>{PERIOD_MAP[p]}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#b5b5b5' }}>Loading…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
              <StatCard value={periodVal}              label={PERIOD_MAP[period]}   sub="applications sent" />
              <StatCard value={matched}               label="Jobs match your skills" accent="#2563eb" />
              <StatCard value={stats?.shortlisted ?? 0} label="Shortlisted"          accent="#7c3aed" />
              <StatCard value={stats?.hired ?? 0}     label="Offers received"       accent="#16a34a" />
            </div>
          )}
        </div>

        {/* Urgent renewal banner */}
        {subscription && isUrgent && (
          <div style={{ marginBottom: 20, padding: '14px 18px',
            background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#92400e', fontWeight: 500 }}>
              ⚠ Subscription expires in {daysLeft} day{daysLeft === 1 ? '' : 's'} on {renewDate}.
              Account will be paused automatically.
            </p>
            <button onClick={() => navigate('/subscription')} style={{
              background: '#dc2626', color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif", flexShrink: 0,
            }}>Renew now</button>
          </div>
        )}

        {/* Recent applications */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0f', marginBottom: 14 }}>
            Recent applications
          </p>
          {loading ? (
            <div style={{ fontSize: 13, color: '#b5b5b5', textAlign: 'center', padding: '48px 0' }}>Loading…</div>
          ) : apps.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12,
              padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>📋</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0f', marginBottom: 6 }}>
                No applications yet
              </p>
              <p style={{ fontSize: 13, color: '#9b9b9b' }}>
                {subscription
                  ? 'Our team is matching jobs to your profile. Usually starts within 24 hours.'
                  : 'Subscribe to let our team start applying on your behalf.'}
              </p>
              {!subscription && (
                <button onClick={() => navigate('/subscription')} style={{
                  marginTop: 16, padding: '10px 22px', background: '#0f0f0f', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Inter',sans-serif",
                }}>View plans →</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Table header */}
              <div style={{ display: 'grid',
                gridTemplateColumns: '1fr 160px 120px 100px',
                padding: '8px 16px', gap: 12 }}>
                {['Role & Company','Applied','Skills matched','Status'].map(h => (
                  <p key={h} style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5',
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</p>
                ))}
              </div>
              {apps.map(app => {
                const st = STATUS_META[app.status] || STATUS_META.applied
                return (
                  <div key={app.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 160px 120px 100px',
                    padding: '14px 16px', gap: 12, background: '#fff',
                    border: '1px solid #f0f0f0', borderRadius: 10,
                    alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0f', marginBottom: 2 }}>
                        {app.job_title || 'Role'}
                      </p>
                      <p style={{ fontSize: 12, color: '#9b9b9b' }}>{app.company || '—'}</p>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b6b6b' }}>
                      {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(app.matched_skills ?? []).slice(0, 2).map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '2px 7px',
                          background: '#f0f0f0', color: '#6b6b6b', borderRadius: 99 }}>{s}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px',
                      background: st.bg, color: st.color, borderRadius: 99,
                      textAlign: 'center', display: 'inline-block' }}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subscription plan info footer */}
      {subscription && (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ padding: '16px 20px', background: '#fff',
            border: '1px solid #f0f0f0', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 11, color: '#b5b5b5', marginBottom: 3 }}>CURRENT PLAN</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f' }}>
                  {PLANS[subscription.plan].label}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#b5b5b5', marginBottom: 3 }}>NEXT PAYMENT DUE</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: isUrgent ? '#dc2626' : '#0f0f0f' }}>
                  {renewDate}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#b5b5b5', marginBottom: 3 }}>DAYS REMAINING</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: isUrgent ? '#dc2626' : '#16a34a' }}>
                  {daysLeft} days
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/subscription')} style={{
              background: 'none', border: '1px solid #e5e5e5', padding: '8px 16px',
              borderRadius: 7, fontSize: 13, color: '#0f0f0f', cursor: 'pointer',
              fontFamily: "'Inter',sans-serif",
            }}>Manage plan</button>
          </div>
        </div>
      )}
    </div>
  )
}
