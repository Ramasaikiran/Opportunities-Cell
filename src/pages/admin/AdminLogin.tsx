import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
 const { session, profile, profileLoaded, signIn, signInWithGoogle, signOut } = useAuth()
 const navigate = useNavigate()
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [submitting, setSubmitting] = useState(false)
 const [googleLoading, setGoogleLoading] = useState(false)
 const [expectedUid, setExpectedUid] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)

 // Resolve only once the context's profile actually belongs to the user we just signed in as.
 // (profile/profileLoaded can briefly hold stale pre-login values right after signIn() resolves.)
 useEffect(() => {
 if (!expectedUid) return
 if (!profileLoaded || profile?.id !== expectedUid) return
 setExpectedUid(null)
 if (profile.is_admin) {
 navigate('/admin', { replace: true })
 } else {
 setError(`Signed in as ${profile.email}, but this account does not have admin access.`)
 signOut()
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [expectedUid, profileLoaded, profile])

 // Already signed in as admin → straight to panel
 if (session && profileLoaded && profile?.is_admin && !expectedUid) {
 return <Navigate to="/admin" replace />
 }

 async function handleSubmit(e: FormEvent) {
 e.preventDefault()
 setError(null); setSubmitting(true)

 const { error: signInErr } = await signIn(email.trim(), password)
 if (signInErr) { setError(signInErr); setSubmitting(false); return }

 const { data: { user } } = await supabase.auth.getUser()
 if (!user) { setError('Sign in failed.'); setSubmitting(false); return }

 setSubmitting(false)
 setExpectedUid(user.id) // waits for context profile to catch up to this exact user
 }

 const loading = submitting || !!expectedUid

 async function handleGoogle() {
 setError(null); setGoogleLoading(true)
 const { error: err } = await signInWithGoogle()
 if (err) { setError(err); setGoogleLoading(false) }
 // On success, browser redirects away to Google → /auth/callback handles the rest.
 }

 const inp: React.CSSProperties = {
 height: 46, padding: '0 16px', fontSize: 14, color: '#0f0f0f',
 border: '1.5px solid #2a2a2a', borderRadius: 10, background: '#161616',
 fontFamily: "'Inter',sans-serif", outline: 'none', width: '100%',
 }

 return (
 <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex',
 alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", padding: 20 }}>
 <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360,
 background: '#181818', border: '1.5px solid #262626', borderRadius: 18, padding: '36px 30px' }}>
 <p style={{ fontSize: 13, fontWeight: 600, color: '#9b9b9b', letterSpacing: '0.08em', marginBottom: 6 }}>
 OPPORTUNITIES CELL
 </p>
 <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, fontWeight: 400,
 color: '#fff', marginBottom: 24 }}>Admin sign in</h1>

 {error && (
 <div style={{ marginBottom: 16, padding: '10px 14px', background: '#2a1414',
 border: '1px solid #5c1f1f', borderRadius: 10, fontSize: 13, color: '#f87171' }}>
 {error}
 </div>
 )}

 <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
 <input style={inp} type="email" placeholder="Admin email" value={email}
 onChange={e => setEmail(e.target.value)} required autoFocus />
 <input style={inp} type="password" placeholder="Password" value={password}
 onChange={e => setPassword(e.target.value)} required />
 </div>

 <button type="submit" disabled={loading} style={{
 width: '100%', height: 46, background: loading ? '#3a3a3a' : '#fff',
 color: loading ? '#9b9b9b' : '#0f0f0f', border: 'none', borderRadius: 10,
 fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
 fontFamily: "'Inter',sans-serif",
 }}>
 {loading ? 'Checking…' : 'Sign in →'}
 </button>

 <p style={{ fontSize: 12, color: '#6b6b6b', textAlign: 'center', margin: '12px 0' }}>
 <a href="/forgot-password" style={{ color: '#9b9b9b' }}>Forgot password?</a>
 </p>

 <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
 <div style={{ flex: 1, height: 1, background: '#262626' }} />
 <span style={{ fontSize: 11, color: '#5a5a5a' }}>or</span>
 <div style={{ flex: 1, height: 1, background: '#262626' }} />
 </div>

 <button type="button" onClick={handleGoogle} disabled={googleLoading} style={{
 width: '100%', height: 46, background: '#161616', color: '#fff',
 border: '1.5px solid #2a2a2a', borderRadius: 10, fontSize: 14, fontWeight: 500,
 cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif",
 }}>
 {googleLoading ? 'Redirecting…' : 'Continue with Google'}
 </button>

 <p style={{ fontSize: 12, color: '#6b6b6b', marginTop: 18, textAlign: 'center' }}>
 Not an admin? <a href="/sign-in" style={{ color: '#9b9b9b' }}>Go to regular sign in</a>
 </p>
 </form>
 </div>
 )
}
