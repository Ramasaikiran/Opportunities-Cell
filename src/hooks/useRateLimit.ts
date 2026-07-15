/**
 * useRateLimit — client-side email send throttle.
 *
 * Attempt 1 → immediate
 * Attempt 2 → allowed after 30 s
 * Attempt 3 → allowed after 60 s from attempt 2
 * After 3 attempts → 2-hour cooldown before any more
 */

import { useState, useEffect, useCallback } from 'react'

interface RateLimitState {
  attempts: number        // total attempts made
  lastAttemptAt: number  // epoch ms of last attempt
  cooledAt: number | null // epoch ms when 3rd attempt was made (starts 2hr block)
}

const DELAYS_MS = [0, 30_000, 60_000]   // min gap before attempt 1, 2, 3
const COOLDOWN_MS = 2 * 60 * 60 * 1000  // 2 hours after 3rd attempt

function load(key: string): RateLimitState {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { attempts: 0, lastAttemptAt: 0, cooledAt: null }
}

function save(key: string, state: RateLimitState) {
  localStorage.setItem(key, JSON.stringify(state))
}

export function useRateLimit(storageKey: string) {
  const [state, setState] = useState<RateLimitState>(() => load(storageKey))
  const [now, setNow] = useState(Date.now())

  // Reload state whenever the key changes (e.g. user switches email)
  useEffect(() => {
    setState(load(storageKey))
  }, [storageKey])

  // Tick every second to update countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // During 2-hr cooldown?
  const inCooldown = state.cooledAt !== null && (now - state.cooledAt) < COOLDOWN_MS
  const cooldownSecondsLeft = state.cooledAt
    ? Math.max(0, Math.ceil((COOLDOWN_MS - (now - state.cooledAt)) / 1000))
    : 0

  // During per-attempt delay?
  const attemptIndex = Math.min(state.attempts, DELAYS_MS.length - 1)
  const requiredDelay = DELAYS_MS[attemptIndex] ?? 0
  const elapsed = now - state.lastAttemptAt
  const inDelay = state.attempts > 0 && elapsed < requiredDelay
  const delaySecondsLeft = inDelay ? Math.ceil((requiredDelay - elapsed) / 1000) : 0

  const blocked = inCooldown || inDelay

  function humanCooldown(seconds: number) {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600)
      const m = Math.ceil((seconds % 3600) / 60)
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    if (seconds >= 60) return `${Math.ceil(seconds / 60)}m`
    return `${seconds}s`
  }

  const blockMessage = inCooldown
    ? `Too many attempts. Try again in ${humanCooldown(cooldownSecondsLeft)}.`
    : inDelay
    ? `Please wait ${delaySecondsLeft}s before resending.`
    : null

  const recordAttempt = useCallback(() => {
    const next: RateLimitState = {
      attempts: state.attempts + 1,
      lastAttemptAt: Date.now(),
      cooledAt: state.attempts + 1 >= 3 ? Date.now() : null,
    }
    setState(next)
    save(storageKey, next)
  }, [state, storageKey])

  const reset = useCallback(() => {
    const next: RateLimitState = { attempts: 0, lastAttemptAt: 0, cooledAt: null }
    setState(next)
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return { blocked, blockMessage, recordAttempt, reset, attempts: state.attempts }
}
