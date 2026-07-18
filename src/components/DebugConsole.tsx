import { useEffect, useRef, useState } from 'react'

// Activate with ?debug=1 in the URL. Shows console.log/warn/error and any
// uncaught errors in an on-screen panel — for diagnosing mobile-only bugs
// where the person has no way to plug into a desktop for remote debugging.
// Safe to leave in: does nothing unless the query param is present.
export default function DebugConsole() {
  const [enabled] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('debug') === '1' }
    catch { return false }
  })
  const [lines, setLines] = useState<{ type: string; text: string }[]>([])
  const [open, setOpen] = useState(true)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const push = (type: string, args: unknown[]) => {
      const text = args.map(a => {
        try { return typeof a === 'string' ? a : JSON.stringify(a) }
        catch { return String(a) }
      }).join(' ')
      setLines(prev => [...prev.slice(-49), { type, text }])
    }

    const origLog = console.log
    const origWarn = console.warn
    const origError = console.error
    console.log = (...args) => { origLog(...args); push('log', args) }
    console.warn = (...args) => { origWarn(...args); push('warn', args) }
    console.error = (...args) => { origError(...args); push('error', args) }

    const onError = (e: ErrorEvent) => push('error', [`Uncaught: ${e.message} (${e.filename}:${e.lineno})`])
    const onRejection = (e: PromiseRejectionEvent) => push('error', [`Unhandled rejection: ${String(e.reason)}`])
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      console.log = origLog
      console.warn = origWarn
      console.error = origError
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [enabled])

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [lines])

  if (!enabled) return null

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 999999,
      fontFamily: 'monospace', fontSize: 11,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'block', width: '100%', padding: '6px 10px',
        background: '#0f0f0f', color: '#fff', border: 'none', textAlign: 'left',
      }}>
        DEBUG CONSOLE ({lines.length}) {open ? '▼ hide' : '▲ show'}
      </button>
      {open && (
        <div ref={boxRef} style={{
          height: '35vh', overflowY: 'auto', background: 'rgba(15,15,15,0.95)',
          color: '#0f0', padding: 8,
        }}>
          {lines.length === 0 && <div style={{ color: '#888' }}>No logs yet. Try the action you're testing.</div>}
          {lines.map((l, i) => (
            <div key={i} style={{
              color: l.type === 'error' ? '#ff6b6b' : l.type === 'warn' ? '#ffd93d' : '#6bff6b',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 4,
            }}>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
