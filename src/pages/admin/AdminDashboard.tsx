import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Stats { total_users: number; active_subs: number; apps_today: number; apps_week: number }

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [usersRes, subsRes, appsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', false),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').gt('ends_at', new Date().toISOString()),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).gte('applied_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      ])
      const appsToday = await supabase.from('job_applications').select('id', { count: 'exact', head: true })
        .gte('applied_at', new Date().toISOString().slice(0, 10))
      setStats({
        total_users: usersRes.count ?? 0,
        active_subs: subsRes.count  ?? 0,
        apps_today:  appsToday.count ?? 0,
        apps_week:   appsRes.count  ?? 0,
      })
    }
    load()
  }, [])

  const navLink = (to: string, label: string) => (
    <Link to={to} style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0f', textDecoration: 'none',
      padding: '8px 14px', borderRadius: 8, background: '#f5f5f5' }}>{label}</Link>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
        background: '#0f0f0f', gap: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
          ⚡ Admin Panel
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {navLink('/admin/users', 'Users')}
          {navLink('/admin/jobs', 'Jobs')}
          <Link to="/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Exit admin</Link>
          <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, fontWeight: 400,
          color: '#0f0f0f', marginBottom: 32 }}>Overview</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 40 }}>
          {stats ? [
            { v: stats.total_users, l: 'Total users',          c: '#0f0f0f' },
            { v: stats.active_subs, l: 'Active subscriptions', c: '#2563eb' },
            { v: stats.apps_week,   l: 'Applications (7d)',    c: '#7c3aed' },
            { v: stats.apps_today,  l: "Applications (today)", c: '#16a34a' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 16, padding: '20px 22px' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: c }}>{v}</span>
              <p style={{ fontSize: 13, color: '#9b9b9b', marginTop: 4 }}>{l}</p>
            </div>
          )) : (
            <div style={{ fontSize: 14, color: '#b5b5b5' }}>Loading…</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link to="/admin/users" style={{
            display: 'block', padding: '28px 24px', background: '#fff',
            border: '1.5px solid #f0f0f0', borderRadius: 16, textDecoration: 'none',
          }}>
            <p style={{ fontSize: 20, marginBottom: 8 }}>👥</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', marginBottom: 6 }}>Manage users</p>
            <p style={{ fontSize: 13, color: '#9b9b9b' }}>View profiles, apply to jobs on user behalf.</p>
          </Link>
          <Link to="/admin/jobs" style={{
            display: 'block', padding: '28px 24px', background: '#fff',
            border: '1.5px solid #f0f0f0', borderRadius: 16, textDecoration: 'none',
          }}>
            <p style={{ fontSize: 20, marginBottom: 8 }}>💼</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', marginBottom: 6 }}>Job listings</p>
            <p style={{ fontSize: 13, color: '#9b9b9b' }}>Add, edit, and deactivate job openings.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
