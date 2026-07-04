import { Link } from 'react-router-dom'

type Props = {
  title: string
  effectiveDate: string
  children: React.ReactNode
}

export default function LegalPage({ title, effectiveDate, children }: Props) {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>
        <Link to="/" style={{ fontSize: 13, color: '#9b9b9b', textDecoration: 'none' }}>← Back to Home</Link>

        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32,
          color: '#0f0f0f', margin: '20px 0 6px' }}>{title}</h1>
        <p style={{ fontSize: 13, color: '#9b9b9b', marginBottom: 28 }}>
          Effective Date: {effectiveDate}
        </p>

        <div style={{ fontSize: 14.5, color: '#3b3b3b', lineHeight: 1.75 }}>
          {children}
        </div>

        <div style={{ marginTop: 40, padding: '18px 20px', background: '#f7f7f7', borderRadius: 12 }}>
          <p style={{ fontSize: 13, color: '#6b6b6b', marginBottom: 6 }}>Have questions? Call</p>
          <a href="tel:+916303728397" style={{ fontSize: 26, fontWeight: 700, color: '#0f0f0f',
            textDecoration: 'none', letterSpacing: '0.01em' }}>
            +91 63037 28397
          </a>
        </div>
      </div>
    </div>
  )
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f0f0f', margin: '28px 0 10px' }}>{children}</h2>
}
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0f', margin: '18px 0 6px' }}>{children}</h3>
}
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 12px' }}>{children}</p>
}
export function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>{children}</ul>
}
