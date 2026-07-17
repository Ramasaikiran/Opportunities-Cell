import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const COOLDOWN = 45

export default function CheckInbox() {
 const location = useLocation()
 const navigate = useNavigate()
 const { resendVerification, verifySignupOtp } = useAuth()

 const initialEmail = (location.state as { email?: string })?.email ?? ''
 const [email, setEmail] = useState(initialEmail)
 const [editing, setEditing] = useState(!initialEmail)
 const [cooldown, setCooldown] = useState(initialEmail ? COOLDOWN : 0)
 const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
 const [errMsg, setErrMsg] = useState('')
 const [code, setCode] = useState('')
 const [verifying, setVerifying] = useState(false)
 const [checkingLink, setCheckingLink] = useState(false)
 const [showCodeEntry, setShowCodeEntry] = useState(false)

 useEffect(() => {
 if (cooldown <= 0) return
 const t = setTimeout(() => setCooldown(c => c - 1), 1000)
 return () => clearTimeout(t)
 }, [cooldown])

 if (!initialEmail && !editing) { navigate('/sign-up'); return null }

 async function handleResend() {
 if (cooldown > 0 || !email) return
 setStatus('sending')
 const { error } = await resendVerification(email)
 if (error) { setStatus('error'); setErrMsg(error); return }
 setStatus('sent'); setCooldown(COOLDOWN)
 }

 async function handleVerify() {
 if (code.length !== 6) return
 setVerifying(true)
 setStatus('idle')
 const { error } = await verifySignupOtp(email, code)
 setVerifying(false)
 if (error) { setStatus('error'); setErrMsg(error); return }
 navigate('/onboarding', { replace: true })
 }

 // Signup confirmation emails are a link, not a code — same as the
 // "Confirm email address" link in the message. If the user already
 // clicked it (in this tab or another), a session will exist.
 async function handleIveClickedTheLink() {
 setCheckingLink(true); setStatus('idle')
 const { data } = await supabase.auth.getSession()
 setCheckingLink(false)
 if (data.session) {
 navigate('/auth/callback', { replace: true })
 } else {
 setStatus('error')
 setErrMsg("We don't see a confirmed session yet. Open the email and tap the link, then come back and try again.")
 }
 }

 return (
 <div style={{
 minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
 background: '#f7f7f5', fontFamily: "'Inter', -apple-system, sans-serif", padding: '24px',
 }}>
 <div style={{
 width: '100%', maxWidth: 460, background: '#fff',
 borderRadius: 24, padding: '48px 44px',
 boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
 }}>
 {/* Icon */}
 <div style={{
 width: 56, height: 56, borderRadius: 16, background: '#f7f7f7',
 display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
 }}>
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="1.6">
 <path d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 </div>

 <h1 style={{
 fontFamily: "'Instrument Serif', Georgia, serif",
 fontSize: 32, fontWeight: 400, color: '#0f0f0f',
 letterSpacing: '-0.02em', marginBottom: 10,
 }}>Check your inbox</h1>

 {editing ? (
 <div style={{ marginTop: 24 }}>
 <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6b6b', marginBottom: 7 }}>Email address</label>
 <input className="oc-input" type="email" value={email}
 onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
 <button onClick={() => { if (email) { setEditing(false); handleResend() } }}
 style={{ marginTop: 14, width: '100%', height: 50, background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
 Send confirmation email
 </button>
 </div>
 ) : (
 <>
 <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.65, marginBottom: 24 }}>
 We sent a confirmation link to{' '}
 <strong style={{ color: '#0f0f0f' }}>{email}</strong>. Open the email and tap{' '}
 <strong style={{ color: '#0f0f0f' }}>Confirm email address</strong> — it'll bring you straight back here signed in.
 </p>

 {status === 'sent' && (
 <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#16a34a', marginBottom: 16 }}>
 Email resent. Check your inbox (and spam folder).
 </div>
 )}
 {status === 'error' && (
 <div className="oc-error" style={{ marginBottom: 16 }}> {errMsg}</div>
 )}

 <button onClick={handleIveClickedTheLink} disabled={checkingLink}
 style={{
 width: '100%', height: 50, background: '#0f0f0f', color: '#fff',
 border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600,
 cursor: checkingLink ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif",
 opacity: checkingLink ? 0.6 : 1,
 }}>
 {checkingLink ? 'Checking…' : "I've tapped the link — continue"}
 </button>

 <button onClick={handleResend} disabled={cooldown > 0 || status === 'sending'}
 style={{
 marginTop: 12, width: '100%', height: 44, background: 'none',
 border: '1.5px solid #e5e5e5', borderRadius: 12, fontSize: 14,
 cursor: cooldown > 0 ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif",
 color: '#6b6b6b', opacity: cooldown > 0 ? 0.6 : 1,
 }}>
 {status === 'sending' ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
 </button>

 <button onClick={() => setEditing(true)}
 style={{ marginTop: 12, width: '100%', height: 44, background: 'none', border: '1.5px solid #e5e5e5', borderRadius: 12, fontSize: 14, color: '#6b6b6b', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
 Wrong email? Change it
 </button>

 {!showCodeEntry ? (
 <button onClick={() => setShowCodeEntry(true)}
 style={{ marginTop: 16, width: '100%', textAlign: 'center', background: 'none', border: 'none', fontSize: 12.5, color: '#b5b5b5', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textDecoration: 'underline' }}>
 Have a 6-digit code instead?
 </button>
 ) : (
 <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
 <input className="oc-input" inputMode="numeric" maxLength={6}
 value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
 placeholder="000000"
 style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.4em', fontWeight: 600 }} />
 <button onClick={handleVerify} disabled={code.length !== 6 || verifying}
 style={{
 marginTop: 12, width: '100%', height: 46, background: '#0f0f0f', color: '#fff',
 border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
 cursor: code.length === 6 ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif",
 opacity: code.length === 6 ? 1 : 0.45,
 }}>
 {verifying ? 'Verifying…' : 'Verify code'}
 </button>
 </div>
 )}
 </>
 )}

 <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#b5b5b5' }}>
 <Link to="/sign-in" style={{ color: '#6b6b6b', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #e5e5e5' }}>
 ← Back to sign in
 </Link>
 </p>
 </div>

 <style>{`
 .oc-input { width: 100%; height: 48px; padding: 0 16px; font-family: 'Inter', sans-serif; font-size: 15px; color: #0f0f0f; background: #fff; border: 1.5px solid #e5e5e5; border-radius: 12px; outline: none; }
 .oc-input:focus { border-color: #0f0f0f; box-shadow: 0 0 0 3px rgba(15,15,15,0.08); }
 .oc-error { background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; color: #dc2626; }
 `}</style>
 </div>
 )
}
