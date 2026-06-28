import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Profile } from '../../lib/supabase'

interface UserRow extends Profile {
  sub_plan?: string | null
  sub_active?: boolean
  apps_count?: number
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    // Get all non-admin profiles
    const { data: profiles } = await supabase
      .from('profiles').select('*').eq('is_admin', false)
      .order('created_at', { ascending: false })

    if (!profiles) { setLoading(false); return }

    // Enrich with subscription + app count
    const enriched: UserRow[] = await Promise.all(profiles.map(async (p) => {
      const [subRes, appRes] = await Promise.all([
        supabase.from('subscriptions').select('plan,status,ends_at')
          .eq('user_id', p.id).eq('status', 'active')
          .gt('ends_at', new Date().toISOString()).maybeSingle(),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', p.id),
      ])
      return {
        ...p,
        sub_plan:   subRes.data?.plan ?? null,
        sub_active: !!subRes.data,
        apps_count: appRes.count ?? 0,
      }
    }))
    setUsers(enriched)
    setLoading(false)
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const inp: React.CSSProperties = {
    height: 42, padding: '0 14px', fontSize: 14, color: '#0f0f0f',
    border: '1.5px solid #e5e5e5', borderRadius: 10, background: '#fff',
    fontFamily: "'Inter',sans-serif", outline: 'none', width: 280,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
        background: '#0f0f0f', gap: 16 }}>
        <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Admin</Link>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Users</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, fontWeight: 400, color: '#0f0f0f' }}>
            All users ({users.length})
          </h1>
          <input style={inp} placeholder="Search name or email…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 14, color: '#b5b5b5' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(u => (
              <Link key={u.id} to={`/admin/users/${u.id}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: '#fff',
                border: '1.5px solid #f0f0f0', borderRadius: 12, textDecoration: 'none',
                transition: 'border-color 0.15s', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {u.photo_url || u.avatar_url ? (
                    <img src={u.photo_url || u.avatar_url!} alt=""
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 600, color: '#9b9b9b', flexShrink: 0 }}>
                      {u.full_name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0f', marginBottom: 2 }}>{u.full_name}</p>
                    <p style={{ fontSize: 13, color: '#9b9b9b' }}>{u.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: '#f5f5f5', color: '#6b6b6b' }}>
                    {u.user_type || 'not set'}
                  </span>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: u.sub_active ? '#f0fdf4' : '#f5f5f5',
                    color: u.sub_active ? '#16a34a' : '#9b9b9b', fontWeight: u.sub_active ? 600 : 400,
                  }}>
                    {u.sub_active ? `✓ ${u.sub_plan}` : 'No sub'}
                  </span>
                  <span style={{ fontSize: 12, color: '#9b9b9b' }}>{u.apps_count} apps</span>
                  <span style={{ fontSize: 12, color: '#b5b5b5' }}>→</span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: '#b5b5b5' }}>
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
