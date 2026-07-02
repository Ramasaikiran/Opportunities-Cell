import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('App crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12, padding: 24, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Something broke.</p>
          <p style={{ fontSize: 13, color: '#dc2626', maxWidth: 500 }}>{this.state.error.message}</p>
          <button onClick={() => location.reload()} style={{
            padding: '8px 18px', background: '#0f0f0f', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}
