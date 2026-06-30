import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Subscription, type Profile, type SubscriptionPlan, PLANS } from '../../lib/supabase'
import AdminNav from './AdminNav'

interface SubRow extends Subscription {
  user_name?: string
  user_email?: string
}

type Tab = 'active' | 'expiring' | 'expired'

export default function AdminSubscriptions() {
  const [subs,    setSubs]    = useState<SubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<Tab>('active')
  const [busyId,  setBusyId]  = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: subRows } = await supabase.from('subscriptions')
      .select('*').order('ends_at', { ascending: true })
    if (!subRows) { setSubs([]); setLoading(false); return }

    const ids = Array.from(new Set(subRows.map(s => s.user_id)))
    const { data: people } = await supabase.from('profiles').select('id, full_name, email').in('id', ids)
    const nameMap  = new Map((people ?? []).map(p => [p.id, p.full_name]))
    const emailMap = new Map((people ?? []).map(p => [p.id, p.email]))

    setSubs((subRows as Subscription[]).map(s => ({
      ...s, user_name: nameMap.get(s.user_id) ?? 'Unknown', user_email: emailMap.get(s.user_id) ?? '',
    })))
    setLoading(false)
  }

  const now = Date.now()
  const isExpiring = (s: SubRow) => s.status === 'active' && s.ends_at
    && new Date(s.ends_at).getTime() > now && new Date(s.ends_at).getTime() < now + 7 * 86400000
  const isActive   = (s: SubRow) => s.status === 'active' && s.ends_at && new Date(s.ends_at).getTime() > now
  const isExpired  = (s: SubRow) => s.status === 'expired' || (s.status === 'active' && s.ends_at && new Date(s.ends_at).getTime() <= now)

  const shown = subs.filter(s => tab === 'active' ? isActive(s) && !isExpiring(s) : tab === 'expiring' ? isExpiring(s) : isExpired(s))

  async function act(s: SubRow, action: 'renew' | 'cancel' | 'extend' | 'upgrade') {
    setBusyId(s.id)
    try {
      if (action === 'cancel') {
        await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', s.id)
      }
      if (action === 'renew') {
        const months = PLANS[s.plan].months.match(/\d+/)?.[0] ?? '1'
        const newEnd = new Date(); newEnd.setMonth(newEnd.getMonth() + parseInt(months))
        await supabase.from('subscriptions').update({
          status: 'active', starts_at: new Date().toISOString(), ends_at: newEnd.toISOString(),
        }).eq('id', s.id)
        await supabase.from('profiles').update({ account_status: 'active' }).eq('id', s.user_id)
      }
      if (action === 'extend') {
        const base = s.ends_at && new Date(s.ends_at) > new Date() ? new Date(s.ends_at) : new Date()
        base.setDate(base.getDate() + 30)
        await supabase.from('subscriptions').update({ status: 'active', ends_at: base.toISOString() }).eq('id', s.id)
        await supabase.from('profiles').update({ account_status: 'active' }).eq('id', s.user_id)
      }
      if (action === 'upgrade') {
        const order: SubscriptionPlan[] = ['monthly', 'quarterly', 'halfyearly', 'yearly']
        const next = order[Math.min(order.indexOf(s.plan) + 1, order.length - 1)]
        await supabase.from('subscriptions').update({ plan: next }).eq('id', s.id)
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const tabBtn = (t: Tab, label: string, count: number): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: tab === t ? '#0f0f0f' : 'transparent',
    color:      tab === t ? '#fff'    : '#6b6b6b',
    border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
  })

  const STATUS_COLOR: Record<string,string> = { active: '#16a34a', expired: '#dc2626', cancelled: '#9b9b9b', pending: '#d97706', failed: '#dc2626' }

  const actionBtn = (label: string, onClick: () => void, color = '#0f0f0f'): React.JSX.Element => (
    <button onClick={onClick} disabled={!!busyId} style={{
      padding: '7px 12px', fontSize: 12, fontWeight: 600, borderRadius: 7,
      border: `1.5px solid ${color}22`, background: `${color}10`, color,
      cursor: busyId ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif",
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',sans-serif" }}>
      <AdminNav title="Subscriptions" />

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, fontWeight: 400,
          color: '#0f0f0f', marginBottom: 20 }}>Subscriptions</h1>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#f0f0f0', padding: 4,
          borderRadius: 10, width: 'fit-content' }}>
          <button style={tabBtn('active', 'Active', subs.filter(isActive).length)} onClick={() => setTab('active')}>
            Active ({subs.filter(s => isActive(s) && !isExpiring(s)).length})
          </button>
          <button style={tabBtn('expiring', 'Expiring soon', 0)} onClick={() => setTab('expiring')}>
            Expiring soon ({subs.filter(isExpiring).length})
          </button>
          <button style={tabBtn('expired', 'Expired', 0)} onClick={() => setTab('expired')}>
            Expired ({subs.filter(isExpired).length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 14, color: '#b5b5b5' }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 14, color: '#b5b5b5' }}>Nothing here.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shown.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 180 }}>
                  <Link to={`/admin/users/${s.user_id}`} style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f', textDecoration: 'none' }}>
                    {s.user_name}
                  </Link>
                  <p style={{ fontSize: 12, color: '#9b9b9b' }}>{s.user_email}</p>
                </div>
                <div style={{ fontSize: 13, color: '#6b6b6b' }}>{PLANS[s.plan]?.label ?? s.plan}</div>
                <div style={{ fontSize: 13, color: '#9b9b9b' }}>
                  {s.ends_at ? `Expires ${new Date(s.ends_at).toLocaleDateString('en-IN')}` : 'No end date'}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: STATUS_COLOR[s.status] + '18', color: STATUS_COLOR[s.status] }}>{s.status}</span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {tab !== 'active' && actionBtn(busyId === s.id ? '…' : 'Renew', () => act(s, 'renew'), '#16a34a')}
                  {tab === 'active' && actionBtn(busyId === s.id ? '…' : 'Extend', () => act(s, 'extend'), '#2563eb')}
                  {tab === 'active' && actionBtn('Upgrade', () => act(s, 'upgrade'), '#7c3aed')}
                  {s.status === 'active' && actionBtn('Cancel', () => act(s, 'cancel'), '#dc2626')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
