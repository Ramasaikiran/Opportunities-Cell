import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRateLimit } from '../hooks/useRateLimit'

const KEY = 'test_rl_key'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useRateLimit', () => {
  it('is not blocked on first render with no prior attempts', () => {
    const { result } = renderHook(() => useRateLimit(KEY))
    expect(result.current.blocked).toBe(false)
    expect(result.current.attempts).toBe(0)
  })

  it('blocks after the 1st attempt until 30s pass before allowing a 2nd', () => {
    const { result } = renderHook(() => useRateLimit(KEY))

    act(() => result.current.recordAttempt()) // attempt 1 recorded — 2nd needs a 30s gap

    expect(result.current.blocked).toBe(true)
    expect(result.current.blockMessage).toMatch(/wait/i)
  })

  it('unblocks once the 30s gap after the 1st attempt elapses', () => {
    const { result } = renderHook(() => useRateLimit(KEY))

    act(() => result.current.recordAttempt())
    expect(result.current.blocked).toBe(true)

    act(() => vi.advanceTimersByTime(31_000))
    expect(result.current.blocked).toBe(false)
  })

  it('requires a 60s gap before a 3rd attempt', () => {
    const { result } = renderHook(() => useRateLimit(KEY))

    act(() => result.current.recordAttempt()) // 1
    act(() => vi.advanceTimersByTime(31_000))
    act(() => result.current.recordAttempt()) // 2 — 3rd now needs a 60s gap

    expect(result.current.blocked).toBe(true)

    act(() => vi.advanceTimersByTime(59_000))
    expect(result.current.blocked).toBe(true)

    act(() => vi.advanceTimersByTime(2_000))
    expect(result.current.blocked).toBe(false)
  })

  it('triggers a 2-hour cooldown after the 3rd attempt', () => {
    const { result } = renderHook(() => useRateLimit(KEY))

    act(() => result.current.recordAttempt()) // 1
    act(() => vi.advanceTimersByTime(31_000))
    act(() => result.current.recordAttempt()) // 2
    act(() => vi.advanceTimersByTime(61_000))
    act(() => result.current.recordAttempt()) // 3 — triggers cooldown

    expect(result.current.blocked).toBe(true)
    expect(result.current.blockMessage).toMatch(/too many attempts/i)

    // Cooldown should still be active just before 2 hours pass
    act(() => vi.advanceTimersByTime(2 * 60 * 60 * 1000 - 1000))
    expect(result.current.blocked).toBe(true)

    // And clear once the full 2 hours have passed
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.blocked).toBe(false)
  })

  it('reset() clears attempts and unblocks', () => {
    const { result } = renderHook(() => useRateLimit(KEY))
    act(() => result.current.recordAttempt())
    act(() => result.current.recordAttempt())
    expect(result.current.blocked).toBe(true)

    act(() => result.current.reset())
    expect(result.current.blocked).toBe(false)
    expect(result.current.attempts).toBe(0)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('reloads state when the storage key changes (e.g. different email)', () => {
    const { result, rerender } = renderHook(({ key }) => useRateLimit(key), {
      initialProps: { key: KEY },
    })
    act(() => result.current.recordAttempt())
    act(() => result.current.recordAttempt())
    expect(result.current.blocked).toBe(true)

    rerender({ key: 'a_different_key' })
    expect(result.current.blocked).toBe(false)
  })

  it('does not immediately re-lock for another 2 hours on the first attempt after a cooldown expires', () => {
    const { result } = renderHook(() => useRateLimit(KEY))

    act(() => result.current.recordAttempt()) // 1
    act(() => vi.advanceTimersByTime(31_000))
    act(() => result.current.recordAttempt()) // 2
    act(() => vi.advanceTimersByTime(61_000))
    act(() => result.current.recordAttempt()) // 3 — triggers cooldown
    expect(result.current.blocked).toBe(true)

    // Cooldown fully expires
    act(() => vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1000))
    expect(result.current.blocked).toBe(false)

    // The next attempt should be treated as a fresh attempt 1, not
    // instantly re-trigger another 2-hour block.
    act(() => result.current.recordAttempt())
    expect(result.current.attempts).toBe(1)
    expect(result.current.blockMessage).not.toMatch(/too many attempts/i)
  })
})
