import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Job } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const BLANK: Omit<Job,'id'|'posted_at'> = {
  title: '', company: '', description: '', required_skills: [],
  required_experience_min: 0, required_experience_max: null,
  job_type: 'full-time', role_category: '', location: '', country: 'India',
  salary_min: null, salary_max: null, apply_url: '', is_active: true,
}

export default function AdminJobs() {
  const { profile } = useAuth()
  const [jobs,    setJobs]    = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState<typeof BLANK>(BLANK)
  const [skillsInput, setSkillsInput] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [showForm,setShowForm]= useState(false)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('jobs').select('*').order('posted_at', { ascending: false })
    setJobs((data as Job[]) ?? [])
    setLoading(false)
  }

  function openNew() {
    setForm(BLANK); setSkillsInput(''); setEditId(null); setError(null); setShowForm(true)
  }

  function openEdit(job: Job) {
    setForm({
      title: job.title, company: job.company, description: job.description ?? '',
      required_skills: job.required_skills, required_experience_min: job.required_experience_min,
      required_experience_max: job.required_experience_max, job_type: job.job_type,
      role_category: job.role_category ?? '', location: job.location ?? '', country: job.country ?? 'India',
      salary_min: job.salary_min, salary_max: job.salary_max, apply_url: job.apply_url ?? '',
      is_active: job.is_active,
    })
    setSkillsInput(job.required_skills.join(', '))
    setEditId(job.id); setError(null); setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.company.trim()) { setError('Title and company are required.'); return }
    setSaving(true); setError(null)
    const payload = {
      ...form,
      required_skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      created_by: profile?.id,
    }
    const { error: dbErr } = editId
      ? await supabase.from('jobs').update(payload).eq('id', editId)
      : await supabase.from('jobs').insert(payload)
    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    setSaving(false); setShowForm(false)
    await load()
  }

  async function toggleActive(job: Job) {
    await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id)
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j))
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 14, color: '#0f0f0f',
    border: '1.5px solid #e5e5e5', borderRadius: 10, background: '#fff',
    fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
        background: '#0f0f0f', gap: 16 }}>
        <Link to="/admin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Admin</Link>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Job Listings</span>
        <button onClick={openNew} style={{
          marginLeft: 'auto', padding: '8px 18px', background: '#fff', color: '#0f0f0f',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Inter',sans-serif",
        }}>+ Add job</button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Job form modal ─────────────────────────────── */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px',
              width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22, fontWeight: 400, color: '#0f0f0f' }}>
                  {editId ? 'Edit job' : 'Add new job'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 20, color: '#9b9b9b' }}>×</button>
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fef2f2',
                  border: '1px solid #fecaca', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Job title *',  key: 'title',    ph: 'Software Engineer' },
                  { label: 'Company *',    key: 'company',  ph: 'Accenture' },
                  { label: 'Location',     key: 'location', ph: 'Hyderabad / Remote' },
                  { label: 'Country',      key: 'country',  ph: 'India' },
                  { label: 'Apply URL',    key: 'apply_url',ph: 'https://careers.company.com/job/123' },
                  { label: 'Role category',key: 'role_category', ph: 'SDE / ML / Data' },
                ].map(({ label, key, ph }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>{label}</label>
                    <input style={inp} value={(form as Record<string,unknown>)[key] as string ?? ''}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph} />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>
                    Required skills (comma-separated)
                  </label>
                  <input style={inp} value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    placeholder="Java, Spring Boot, React, SQL" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>
                      Min experience (yrs)
                    </label>
                    <input style={inp} type="number" step="0.5" min="0"
                      value={form.required_experience_min}
                      onChange={e => setForm(p => ({ ...p, required_experience_min: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>
                      Max experience (yrs)
                    </label>
                    <input style={inp} type="number" step="0.5" min="0"
                      value={form.required_experience_max ?? ''}
                      onChange={e => setForm(p => ({ ...p, required_experience_max: e.target.value ? parseFloat(e.target.value) : null }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>
                      Min salary (₹)
                    </label>
                    <input style={inp} type="number"
                      value={form.salary_min ?? ''}
                      onChange={e => setForm(p => ({ ...p, salary_min: e.target.value ? parseFloat(e.target.value) : null }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>
                      Max salary (₹)
                    </label>
                    <input style={inp} type="number"
                      value={form.salary_max ?? ''}
                      onChange={e => setForm(p => ({ ...p, salary_max: e.target.value ? parseFloat(e.target.value) : null }))} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>Job type</label>
                  <select value={form.job_type ?? 'full-time'}
                    onChange={e => setForm(p => ({ ...p, job_type: e.target.value }))}
                    style={{ ...inp, appearance: 'none' as const }}>
                    {['full-time','internship','contract','part-time'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6b6b', marginBottom: 5 }}>Description</label>
                  <textarea rows={4} value={form.description ?? ''}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Job description, responsibilities, requirements…"
                    style={{ ...inp, height: 'auto', padding: '10px 14px', resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#0f0f0f' }}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                  Active (visible to admin for matching)
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 1, height: 46, background: saving ? '#6b6b6b' : '#0f0f0f', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif",
                  }}>
                    {saving ? 'Saving…' : editId ? 'Save changes' : 'Add job'}
                  </button>
                  <button onClick={() => setShowForm(false)} style={{
                    flex: 1, height: 46, background: '#f5f5f5', color: '#6b6b6b',
                    border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif",
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Job list ────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, fontWeight: 400, color: '#0f0f0f' }}>
            Jobs ({jobs.length})
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 14, color: '#b5b5b5' }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 15, color: '#9b9b9b', marginBottom: 16 }}>No jobs yet.</p>
            <button onClick={openNew} style={{
              padding: '10px 20px', background: '#0f0f0f', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif",
            }}>Add first job →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(job => (
              <div key={job.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: '#fff',
                border: `1.5px solid ${job.is_active ? '#f0f0f0' : '#fecaca'}`,
                borderRadius: 12, gap: 12,
                opacity: job.is_active ? 1 : 0.65,
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0f', marginBottom: 3 }}>{job.title}</p>
                  <p style={{ fontSize: 13, color: '#9b9b9b', marginBottom: 6 }}>
                    {job.company} · {job.job_type} · {job.location || 'Remote'}
                    {job.required_experience_min > 0 && ` · ${job.required_experience_min}${job.required_experience_max ? `–${job.required_experience_max}` : '+'}y exp`}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {job.required_skills.slice(0, 6).map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 8px', background: '#f0f0f0',
                        color: '#6b6b6b', borderRadius: 99 }}>{s}</span>
                    ))}
                    {job.required_skills.length > 6 && (
                      <span style={{ fontSize: 11, color: '#b5b5b5' }}>+{job.required_skills.length - 6} more</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(job)} style={{
                    padding: '7px 14px', background: '#f5f5f5', color: '#0f0f0f',
                    border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif",
                  }}>Edit</button>
                  <button onClick={() => toggleActive(job)} style={{
                    padding: '7px 14px',
                    background: job.is_active ? '#fef2f2' : '#f0fdf4',
                    color:      job.is_active ? '#dc2626' : '#16a34a',
                    border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif",
                  }}>
                    {job.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
