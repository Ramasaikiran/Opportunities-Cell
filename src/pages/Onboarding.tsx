import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type UserType } from '../lib/supabase'

const ROLES: { type: UserType; title: string; desc: string }[] = [
  {
    type: 'student',
    title: "I'm a student",
    desc: 'Still in college, hunting for internships or first job.',
  },
  {
    type: 'professional',
    title: 'Early-career professional',
    desc: "I've worked before and I'm switching or levelling up.",
  },
]

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<UserType | null>(
    profile?.user_type ?? null
  )
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // shared
  const [locationPref, setLocationPref] = useState('')
  const [mobile, setMobile] = useState('')
  const [skills, setSkills] = useState('')

  // student
  const [college, setCollege] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [projects, setProjects] = useState('')

  // professional
  const [prevTitle, setPrevTitle] = useState('')
  const [prevCompany, setPrevCompany] = useState('')
  const [yearsExp, setYearsExp] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role || !user) return
    setError(null)
    setLoading(true)

    try {
      let resumeUrl: string | null = null
      if (resumeFile) {
        const path = `${user.id}/${Date.now()}-${resumeFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(path, resumeFile, { upsert: true })
        if (uploadError) throw uploadError
        resumeUrl = path
      }

      const skillsArr = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      if (role === 'student') {
        const { error: dbError } = await supabase.from('student_details').upsert({
          id: user.id,
          college_name: college,
          cgpa: cgpa ? Number(cgpa) : null,
          location_preference: locationPref,
          mobile_number: mobile,
          technical_skills: skillsArr,
          projects,
          resume_url: resumeUrl,
        })
        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase
          .from('professional_details')
          .upsert({
            id: user.id,
            previous_job_title: prevTitle,
            previous_company: prevCompany,
            years_experience: yearsExp ? Number(yearsExp) : null,
            location_preference: locationPref,
            mobile_number: mobile,
            technical_skills: skillsArr,
            resume_url: resumeUrl,
          })
        if (dbError) throw dbError
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: role, account_status: 'active' })
        .eq('id', user.id)
      if (profileError) throw profileError

      await refreshProfile()
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-14 sm:px-12">
      <div className="mx-auto max-w-[640px]">
        <p className="text-[13px] font-medium tracking-[0.12em] text-clay-600">
          ONE LAST STEP
        </p>
        <h1 className="mt-3 font-display text-[32px] font-light text-ink">
          Tell us who we&rsquo;re applying for
        </h1>
        <p className="mt-2 text-[15px] text-ink/55">
          This shapes which jobs we target and how we tailor your resume.
        </p>

        {!role ? (
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <button
                key={r.type}
                onClick={() => setRole(r.type)}
                className="group rounded-2xl border border-ink/10 bg-white/70 p-6 text-left transition-all duration-200 hover:border-clay-500/50 hover:shadow-soft"
              >
                <p className="font-display text-[19px] text-ink">{r.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
                  {r.desc}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium text-clay-600 group-hover:translate-x-0.5 transition-transform">
                  Choose this →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 space-y-5 animate-rise">
            <button
              type="button"
              onClick={() => setRole(null)}
              className="text-[13px] font-medium text-ink/50 underline underline-offset-4"
            >
              ← Change role
            </button>

            {error && (
              <div className="rounded-xl border border-clay-700/20 bg-clay-50 px-4 py-3 text-[13px] text-clay-700">
                {error}
              </div>
            )}

            {role === 'student' ? (
              <>
                <div>
                  <label className="label">College name</label>
                  <input
                    className="input-field"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">CGPA</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Mobile number</label>
                    <input
                      className="input-field"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Location preference</label>
                  <input
                    className="input-field"
                    placeholder="Hyderabad, Remote, Bengaluru…"
                    value={locationPref}
                    onChange={(e) => setLocationPref(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Technical skills</label>
                  <input
                    className="input-field"
                    placeholder="Java, React, SQL — comma separated"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Projects</label>
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Briefly describe your top projects"
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Previous job title</label>
                    <input
                      className="input-field"
                      value={prevTitle}
                      onChange={(e) => setPrevTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Previous company</label>
                    <input
                      className="input-field"
                      value={prevCompany}
                      onChange={(e) => setPrevCompany(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Years of experience</label>
                    <input
                      className="input-field"
                      type="number"
                      step="0.5"
                      min="0"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Mobile number</label>
                    <input
                      className="input-field"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Location preference</label>
                  <input
                    className="input-field"
                    placeholder="Hyderabad, Remote, Bengaluru…"
                    value={locationPref}
                    onChange={(e) => setLocationPref(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Technical skills</label>
                  <input
                    className="input-field"
                    placeholder="Java, React, SQL — comma separated"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Resume</label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-ink/20 bg-white/60 px-4 py-3.5 text-[14px] text-ink/60 hover:border-clay-500/50">
                <span>{resumeFile ? resumeFile.name : 'Upload PDF or DOCX'}</span>
                <span className="text-clay-600 font-medium">Browse</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Finish setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
