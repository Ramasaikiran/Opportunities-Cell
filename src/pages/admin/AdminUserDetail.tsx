import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  supabase, type Profile, type StudentDetails, type ProfessionalDetails,
  type Job, type JobApplication,
} from '../../lib/supabase'

type TabType = 'profile' | 'jobs' | 'applications'

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const { profile: adminProfile } = useAuth()

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [details,  setDetails]  = useState<StudentDetails | ProfessionalDetails | null>(null)
  const [jobs,     setJobs]     = useState<Job[]>([])
  const [apps,     setApps]     = useState<JobApplication[]>([])
  const [matched,  setMatched]  = useState<Job[]>([])
  const [tab,      setTab]      = useState<TabType>('profile')
  const [loading,  setLoading]  = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [applyErr, setApplyErr] = useState<string | null>(null)

  useEffect(() => { if (id) load(id) }, [id])

  async function load(uid: string) {
    setLoading(true)
    const [pRes, appRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('job_applications').select('*').eq('user_id', uid).order('applied_at', { ascending: false }),
    ])
    const p = pRes.data as Profile | null
    setProfile(p)
    setApps((appRes.data as JobApplication[]) ?? [])

    if (p?.user_type === 'student') {
      const { data } = await supabase.from('student_details').select('*').eq('id', uid).single()
      setDetails(data as StudentDetails)
    } else if (p?.user_type === 'professional') {
      const { data } = await supabase.from('professional_details').select('*').eq('id', uid).single()
      setDetails(data as ProfessionalDetails)
    }

    // Load all active jobs + compute matches
    const { data: allJobs } = await supabase.from('jobs').select('*').eq('is_active', true)
    if (allJobs) {
      setJobs(allJobs as Job[])
      // Match: get user skills, find overlap
      const skillsRes = p?.user_type === 'student'
        ? await supabase.from('student_details').select('technical_skills').eq('id', uid).single()
        : await supabase.from('professional_details').select('technical_skills').eq('id', uid).single()
      const userSkills: string[] = skillsRes.data?.technical_skills ?? []
      const matchedJobs = (allJobs as Job[]).filter(j =>
        j.required_skills.some(s => userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase()))
      )
      setMatched(matchedJobs)
    }
    setLoading(false)
  }

  async function applyForUser(job: Job) {
    if (!id || !adminProfile) return
    setApplying(job.id); setApplyErr(null)
    try {
      // Get user skills for this job
      const skillsRes = profile?.user_type === 'student'
        ? await supabase.from('student_details').select('technical_skills').eq('id', id).single()
        : await supabase.from('professional_details').select('technical_skills').eq('id', id).single()
      const userSkills: string[] = skillsRes.data?.technical_skills ?? []
      const matchedSkills = job.required_skills.filter(s =>
        userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
      )

      // Check not already applied
      const { data: existing } = await supabase.from('job_applications')
        .select('id').eq('user_id', id).eq('job_id', job.id).maybeSingle()
      if (existing) { setApplyErr(`Already applied to ${job.title}`); return }

      const { error } = await supabase.from('job_applications').insert({
        user_id:        id,
        job_id:         job.id,
        job_title:      job.title,
        company:        job.company,
        admin_id:       adminProfile.id,
        status:         'applied',
        matched_skills: matchedSkills,
      })
      if (error) throw error
      // Refresh apps
      const { data: appsData } = await supabase.from('job_applications')
        .select('*').eq('user_id', id).order('applied_at', { ascending: false })
      setApps((appsData as JobApplication[]) ?? [])
    } catch (err) {
      setApplyErr((err as Error).message)
    } finally {
      setApplying(null)
    }
  }

  async function updateAppStatus(appId: string, status: JobApplication['status']) {
    await supabase.from('job_applications').update({ status }).eq('id', appId)
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter',sans-serif", color: '#9b9b9b', fontSize: 14 }}>Loading…</div>
  )
  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter',sans-serif", color: '#9b9b9b', fontSize: 14 }}>User not found.</div>
  )

  const sd = profile.user_type === 'student'   ? details as StudentDetails      | null : null
  const pd = profile.user_type === 'professional' ? details as ProfessionalDetails | null : null
  const userSkills = (sd?.technical_skills ?? pd?.technical_skills ?? [])

  const tabStyle = (t: TabType): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    background: tab === t ? '#0f0f0f' : 'transparent',
    color:      tab === t ? '#fff'    : '#9b9b9b',
    border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif",
  })

  const STATUS_OPTS: JobApplication['status'][] = ['applied','shortlisted','interview','rejected','hired']
  const STATUS_COLOR: Record<string, string> = {
    applied: '#6b6b6b', shortlisted: '#2563eb', interview: '#7c3aed', rejected: '#dc2626', hired: '#16a34a',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter',sans-serif" }}>
      {/* Nav */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
        background: '#0f0f0f', gap: 16 }}>
        <Link to="/admin/users" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Users</Link>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{profile.full_name}</span>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          {profile.photo_url || profile.avatar_url ? (
            <img src={profile.photo_url || profile.avatar_url!} alt=""
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0f0f0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 600, color: '#fff' }}>
              {profile.full_name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, fontWeight: 400,
              color: '#0f0f0f', marginBottom: 4 }}>{profile.full_name}</h1>
            <p style={{ fontSize: 14, color: '#9b9b9b' }}>{profile.email} · {profile.user_type || 'not set'}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 99,
              background: profile.account_status === 'active' ? '#f0fdf4' : '#f5f5f5',
              color: profile.account_status === 'active' ? '#16a34a' : '#9b9b9b', fontWeight: 600 }}>
              {profile.account_status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: '#f0f0f0',
          padding: 4, borderRadius: 10, width: 'fit-content' }}>
          <button style={tabStyle('profile')}      onClick={() => setTab('profile')}>Profile</button>
          <button style={tabStyle('jobs')}         onClick={() => setTab('jobs')}>
            Match jobs ({matched.length})
          </button>
          <button style={tabStyle('applications')} onClick={() => setTab('applications')}>
            Applications ({apps.length})
          </button>
        </div>

        {applyErr && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 10, fontSize: 14, color: '#dc2626' }}>
            ⚠ {applyErr}
          </div>
        )}

        {/* ── PROFILE TAB ───────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Mobile',    value: profile.mobile_number },
              { label: 'LinkedIn',  value: profile.linkedin_url },
              { label: 'GitHub',    value: profile.github_url },
              { label: 'Country',   value: profile.country },
              { label: 'Address',   value: profile.address },
              { label: 'Role interests', value: profile.role_interests?.join(', ') || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {label.toUpperCase()}
                </p>
                <p style={{ fontSize: 14, color: value ? '#0f0f0f' : '#b5b5b5' }}>{value || '—'}</p>
              </div>
            ))}

            {sd && <>
              {[
                { label: 'College',       value: sd.college_name },
                { label: 'Degree',        value: sd.degree },
                { label: 'Branch',        value: sd.branch },
                { label: 'Year',          value: sd.current_year },
                { label: 'Pass-out year', value: sd.passout_year?.toString() },
                { label: 'CGPA',          value: sd.cgpa?.toString() },
                { label: 'Internship',    value: sd.internship_done ? sd.internship_details || 'Yes' : 'NA' },
                { label: 'Projects',      value: sd.projects },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.08em', marginBottom: 6 }}>
                    {label.toUpperCase()}
                  </p>
                  <p style={{ fontSize: 14, color: value ? '#0f0f0f' : '#b5b5b5' }}>{value || '—'}</p>
                </div>
              ))}
            </>}

            {pd && <>
              {[
                { label: 'Experience',     value: pd.years_experience ? `${pd.years_experience} yrs` : null },
                { label: 'Previous title', value: pd.previous_job_title },
                { label: 'Previous co.',   value: pd.previous_company },
                { label: 'Previous CTC',   value: pd.previous_salary ? `₹${pd.previous_salary.toLocaleString('en-IN')}` : null },
                { label: 'Notice period',  value: pd.notice_period ? `${pd.notice_period_days ?? 0} days` : 'NA' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.08em', marginBottom: 6 }}>
                    {label.toUpperCase()}
                  </p>
                  <p style={{ fontSize: 14, color: value ? '#0f0f0f' : '#b5b5b5' }}>{value || '—'}</p>
                </div>
              ))}
            </>}

            {/* Skills */}
            <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1.5px solid #f0f0f0',
              borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.08em', marginBottom: 10 }}>
                TECHNICAL SKILLS
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {userSkills.length > 0
                  ? userSkills.map(s => (
                    <span key={s} style={{ fontSize: 13, padding: '4px 12px', background: '#f0f0f0',
                      color: '#0f0f0f', borderRadius: 99 }}>{s}</span>
                  ))
                  : <span style={{ fontSize: 14, color: '#b5b5b5' }}>No skills added yet.</span>
                }
              </div>
            </div>

            {/* Resume link */}
            {(sd?.resume_url || pd?.resume_url) && (
              <div style={{ gridColumn: '1 / -1' }}>
                <a href="#" onClick={async e => {
                  e.preventDefault()
                  const url = sd?.resume_url || pd?.resume_url!
                  const { data } = await supabase.storage.from('resumes').createSignedUrl(url, 3600)
                  if (data?.signedUrl) window.open(data.signedUrl, '_blank')
                }} style={{ fontSize: 14, color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
                  📄 Download resume
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── MATCH JOBS TAB ────────────────────────────────── */}
        {tab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#9b9b9b', marginBottom: 8 }}>
              {matched.length} jobs match {profile.first_name || profile.full_name.split(' ')[0]}'s skills.
              Jobs already applied are hidden.
            </p>
            {matched.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: '#b5b5b5' }}>
                No matches yet. Add more jobs or wait for skills to be updated.
              </div>
            ) : matched.map(job => {
              const alreadyApplied = apps.some(a => a.job_id === job.id)
              const overlap = job.required_skills.filter(s =>
                userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
              )
              return (
                <div key={job.id} style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: '18px 20px', background: '#fff',
                  border: '1.5px solid #f0f0f0', borderRadius: 12, gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0f', marginBottom: 3 }}>{job.title}</p>
                    <p style={{ fontSize: 13, color: '#9b9b9b', marginBottom: 8 }}>
                      {job.company} · {job.job_type || 'full-time'} · {job.location || 'Remote'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {overlap.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '3px 8px', background: '#eff6ff',
                          color: '#2563eb', borderRadius: 99 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  {alreadyApplied ? (
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500, flexShrink: 0 }}>✓ Applied</span>
                  ) : (
                    <button onClick={() => applyForUser(job)} disabled={applying === job.id} style={{
                      padding: '9px 18px', background: applying === job.id ? '#f0f0f0' : '#0f0f0f',
                      color: applying === job.id ? '#9b9b9b' : '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: applying === job.id ? 'not-allowed' : 'pointer',
                      fontFamily: "'Inter',sans-serif", flexShrink: 0,
                    }}>
                      {applying === job.id ? 'Applying…' : 'Apply →'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── APPLICATIONS TAB ──────────────────────────────── */}
        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: '#b5b5b5' }}>
                No applications yet.
              </div>
            ) : apps.map(app => (
              <div key={app.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: '#fff',
                border: '1.5px solid #f0f0f0', borderRadius: 12, gap: 12,
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0f', marginBottom: 2 }}>
                    {app.job_title || 'Role'}
                  </p>
                  <p style={{ fontSize: 13, color: '#9b9b9b' }}>
                    {app.company || '—'} · {new Date(app.applied_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <select value={app.status}
                  onChange={e => updateAppStatus(app.id, e.target.value as JobApplication['status'])}
                  style={{
                    fontSize: 13, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                    border: '1.5px solid #e5e5e5', background: STATUS_COLOR[app.status] + '18',
                    color: STATUS_COLOR[app.status], fontFamily: "'Inter',sans-serif", cursor: 'pointer', outline: 'none',
                  }}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
