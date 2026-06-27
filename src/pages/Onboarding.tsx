import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type UserType } from '../lib/supabase'

/* ── Progress bar ─────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.06em' }}>
          STEP {step} OF {total}
        </span>
        <span style={{ fontSize: 12, color: '#b5b5b5' }}>
          {Math.round((step / total) * 100)}% complete
        </span>
      </div>
      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: '#0f0f0f',
          width: `${(step / total) * 100}%`,
          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6b6b', marginBottom: 7 }}>{label}</label>
      {children}
      {error && <p style={{ marginTop: 5, fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

const inputStyle = (err?: string): React.CSSProperties => ({
  width: '100%', height: 48, padding: '0 16px',
  fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#0f0f0f',
  background: '#fff',
  border: `1.5px solid ${err ? '#ef4444' : '#e5e5e5'}`,
  borderRadius: 12, outline: 'none',
  boxShadow: err ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
})

const btnStyle: React.CSSProperties = {
  width: '100%', height: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
  color: '#fff', background: '#0f0f0f', border: 'none',
  borderRadius: 12, cursor: 'pointer', letterSpacing: '-0.01em',
  transition: 'opacity 0.15s',
}

const SKILLS_PLACEHOLDER = 'Java, React, Python, SQL — comma separated'

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]       = useState(1)
  const [role, setRole]       = useState<UserType | null>(profile?.user_type ?? null)
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Step 2 — basics
  const [mobile, setMobile]         = useState('')
  const [locationPref, setLoc]      = useState('')
  const [skills, setSkills]         = useState('')

  // Step 2 student extras
  const [college, setCollege]       = useState('')
  const [cgpa, setCgpa]             = useState('')

  // Step 2 professional extras
  const [prevTitle, setPrevTitle]   = useState('')
  const [prevCompany, setPrevCo]    = useState('')
  const [yearsExp, setYearsExp]     = useState('')

  // Step 3 — resume
  const [resumeFile, setResume]     = useState<File | null>(null)
  const [projects, setProjects]     = useState('')

  const totalSteps = 3

  function validateStep2() {
    const next: Record<string, string> = {}
    if (!mobile.trim() || mobile.length < 10) next.mobile = 'Enter a valid mobile number.'
    if (!skills.trim()) next.skills = 'Add at least one skill.'
    if (role === 'student' && !college.trim()) next.college = 'Enter your college name.'
    if (role === 'professional' && !prevTitle.trim()) next.prevTitle = 'Enter your previous job title.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleFinish(e: FormEvent) {
    e.preventDefault()
    if (!role || !user) return
    setError(null); setLoading(true)

    try {
      let resumeUrl: string | null = null
      if (resumeFile) {
        const path = `${user.id}/${Date.now()}-${resumeFile.name}`
        const { error: uploadError } = await supabase.storage.from('resumes').upload(path, resumeFile, { upsert: true })
        if (uploadError) throw uploadError
        resumeUrl = path
      }

      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean)

      if (role === 'student') {
        const { error: dbErr } = await supabase.from('student_details').upsert({
          id: user.id, college_name: college,
          cgpa: cgpa ? Number(cgpa) : null,
          location_preference: locationPref,
          mobile_number: mobile,
          technical_skills: skillsArr, projects, resume_url: resumeUrl,
        })
        if (dbErr) throw dbErr
      } else {
        const { error: dbErr } = await supabase.from('professional_details').upsert({
          id: user.id, previous_job_title: prevTitle,
          previous_company: prevCompany,
          years_experience: yearsExp ? Number(yearsExp) : null,
          location_preference: locationPref,
          mobile_number: mobile,
          technical_skills: skillsArr, resume_url: resumeUrl,
        })
        if (dbErr) throw dbErr
      }

      const { error: profErr } = await supabase.from('profiles').update({ user_type: role, account_status: 'active' }).eq('id', user.id)
      if (profErr) throw profErr

      await refreshProfile()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top nav */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 60,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>Opportunities Cell</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#b5b5b5' }}>
          Need help? <a href="mailto:hello@opportunitiescell.com" style={{ color: '#6b6b6b', textDecoration: 'none', fontWeight: 500 }}>Contact us</a>
        </div>
      </div>

      <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 580, margin: '0 auto', padding: '100px 24px 60px' }}>
        <ProgressBar step={step} total={totalSteps} />

        {error && (
          <div className="oc-error" style={{ marginBottom: 24 }}>⚠ {error}</div>
        )}

        {/* STEP 1 — Role */}
        {step === 1 && (
          <div className="anim-slide-up">
            <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              LET'S PERSONALISE YOUR EXPERIENCE
            </p>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 36, fontWeight: 400, color: '#0f0f0f',
              lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 10,
            }}>Who are we applying for?</h1>
            <p style={{ fontSize: 15, color: '#9b9b9b', marginBottom: 36 }}>
              This shapes which jobs we target and how we tailor each application.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                { type: 'student' as UserType, icon: '🎓', title: "I'm a student", desc: 'Hunting for internships or first job after college.' },
                { type: 'professional' as UserType, icon: '💼', title: 'Early-career pro', desc: "I've worked before and I'm switching or levelling up." },
              ]).map(r => (
                <button key={r.type} onClick={() => { setRole(r.type); setStep(2) }} style={{
                  background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16,
                  padding: '24px 20px', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 14 }}>{r.icon}</span>
                  <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: '#0f0f0f', marginBottom: 8 }}>{r.title}</p>
                  <p style={{ fontSize: 13, color: '#9b9b9b', lineHeight: 1.5 }}>{r.desc}</p>
                  <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: '#0f0f0f' }}>Choose this →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Profile details */}
        {step === 2 && (
          <form className="anim-slide-up" onSubmit={(e) => { e.preventDefault(); if (validateStep2()) setStep(3) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <button type="button" onClick={() => { setStep(1); setRole(null) }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#9b9b9b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24,
              }}>← Change role</button>

              <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                YOUR PROFILE
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 32, fontWeight: 400, color: '#0f0f0f',
                lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 28,
              }}>Tell us about yourself</h2>
            </div>

            <Field label="Mobile number" error={errors.mobile}>
              <input style={inputStyle(errors.mobile)} type="tel" value={mobile}
                onChange={(e) => { setMobile(e.target.value); setErrors(p => ({...p, mobile: ''})) }}
                placeholder="+91 98765 43210" autoComplete="tel" />
            </Field>

            <Field label="Preferred locations" error={errors.locationPref}>
              <input style={inputStyle()} value={locationPref}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="Hyderabad, Bengaluru, Remote" />
            </Field>

            <Field label="Technical skills" error={errors.skills}>
              <input style={inputStyle(errors.skills)} value={skills}
                onChange={(e) => { setSkills(e.target.value); setErrors(p => ({...p, skills: ''})) }}
                placeholder={SKILLS_PLACEHOLDER} />
            </Field>

            {role === 'student' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="College name" error={errors.college}>
                  <input style={inputStyle(errors.college)} value={college}
                    onChange={(e) => { setCollege(e.target.value); setErrors(p => ({...p, college: ''})) }}
                    placeholder="ACE Engineering College" />
                </Field>
                <Field label="CGPA">
                  <input style={inputStyle()} type="number" step="0.01" min="0" max="10"
                    value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="8.45" />
                </Field>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Previous job title" error={errors.prevTitle}>
                  <input style={inputStyle(errors.prevTitle)} value={prevTitle}
                    onChange={(e) => { setPrevTitle(e.target.value); setErrors(p => ({...p, prevTitle: ''})) }}
                    placeholder="Software Engineer" />
                </Field>
                <Field label="Previous company">
                  <input style={inputStyle()} value={prevCompany}
                    onChange={(e) => setPrevCo(e.target.value)} placeholder="Infosys" />
                </Field>
                <Field label="Years of experience">
                  <input style={inputStyle()} type="number" step="0.5" min="0"
                    value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder="2" />
                </Field>
              </div>
            )}

            <button type="submit" style={btnStyle}>
              Continue →
            </button>
          </form>
        )}

        {/* STEP 3 — Resume upload */}
        {step === 3 && (
          <form className="anim-slide-up" onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <button type="button" onClick={() => setStep(2)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#9b9b9b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24,
              }}>← Back</button>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#b5b5b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                ALMOST DONE
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 32, fontWeight: 400, color: '#0f0f0f',
                lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 8,
              }}>Upload your resume</h2>
              <p style={{ fontSize: 14, color: '#9b9b9b', marginBottom: 28 }}>
                We tailor every application to the job. A strong resume = more interviews.
              </p>
            </div>

            {/* Resume upload zone */}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '36px 24px',
              background: resumeFile ? '#f0fdf4' : '#f7f7f7',
              border: `2px dashed ${resumeFile ? '#22c55e' : '#e5e5e5'}`,
              borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {resumeFile ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>{resumeFile.name}</p>
                  <p style={{ fontSize: 13, color: '#9b9b9b' }}>Click to change</p>
                </>
              ) : (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0f' }}>Upload resume</p>
                    <p style={{ fontSize: 13, color: '#b5b5b5', marginTop: 4 }}>PDF or DOCX · Max 5MB</p>
                  </div>
                </>
              )}
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
            </label>

            {role === 'student' && (
              <Field label="Projects (optional)">
                <textarea value={projects} onChange={(e) => setProjects(e.target.value)}
                  placeholder="Briefly describe your top 2–3 projects…"
                  style={{ ...inputStyle(), height: 'auto', padding: '12px 16px', resize: 'none', lineHeight: 1.6 }}
                  rows={3} />
              </Field>
            )}

            <div style={{ background: '#f7f7f7', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.6 }}>
                You can skip this and upload later from your dashboard. We'll start applying once your resume is uploaded.
              </p>
            </div>

            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Setting up your account…' : "I'm ready — start applying 🚀"}
            </button>

            {!resumeFile && (
              <button type="button" onClick={handleFinish as any} disabled={loading} style={{
                width: '100%', height: 44, background: 'none', border: '1.5px solid #e5e5e5',
                borderRadius: 12, fontSize: 14, color: '#9b9b9b', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                Skip for now →
              </button>
            )}
          </form>
        )}
      </div>

      <style>{`
        .anim-slide-up { animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        input:focus { border-color: #0f0f0f !important; box-shadow: 0 0 0 3px rgba(15,15,15,0.08) !important; }
        textarea:focus { border-color: #0f0f0f !important; box-shadow: 0 0 0 3px rgba(15,15,15,0.08) !important; outline: none; }
        label:hover > div { border-color: #c5c5c5 !important; }
      `}</style>
    </div>
  )
}
