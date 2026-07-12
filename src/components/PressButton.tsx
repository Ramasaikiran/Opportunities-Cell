import { useState, CSSProperties, ReactNode } from 'react'

/**
 * Stress-free tap button, modeled on Zomato's "ADD" → checkmark morph.
 * - Compresses on press (instant tactile feedback)
 * - On click, briefly shows a checkmark before firing the real action
 *   so the user always sees their tap register before navigation happens
 */
export default function PressButton({
  onClick,
  children,
  style,
  confirmMs = 380,
}: {
  onClick: () => void
  children: ReactNode
  style: CSSProperties
  confirmMs?: number
}) {
  const [pressed, setPressed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleClick = () => {
    if (confirmed) return
    setConfirmed(true)
    setTimeout(() => {
      onClick()
      setConfirmed(false)
    }, confirmMs)
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...style,
        transform: pressed ? 'scale(0.96)' : confirmed ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {confirmed ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Got it
        </>
      ) : (
        children
      )}
    </button>
  )
}
