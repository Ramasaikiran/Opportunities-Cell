import { useEffect, useRef, useState } from 'react'

/**
 * Zomato-style "you save ₹X" micro-animation.
 * Counts up from 0 the moment it scrolls into view, then
 * settles with a small pulse. Re-triggers if remounted.
 */
export default function SavingsCounter({
  amount,
  label = 'You save',
  color = '#16a34a',
  bg = '#f0fdf4',
  border = '#bbf7d0',
}: {
  amount: number
  label?: string
  color?: string
  bg?: string
  border?: string
}) {
  const [display, setDisplay] = useState(0)
  const [pulsed, setPulsed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 900
          const start = performance.now()

          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
            setDisplay(Math.round(eased * amount))
            if (t < 1) requestAnimationFrame(tick)
            else {
              setPulsed(true)
              setTimeout(() => setPulsed(false), 260)
            }
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [amount])

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 99,
        padding: '5px 12px',
        transform: pulsed ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span style={{ fontSize: 12.5, fontWeight: 700, color }}>
        {label} ₹{display.toLocaleString('en-IN')}
      </span>
    </div>
  )
}
