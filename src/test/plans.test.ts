import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { PLANS } from '../lib/supabase'

const FORBIDDEN_STRINGS = ['WhatsApp job alerts', 'Resume rewrite']

function readSource(relPath: string) {
  return fs.readFileSync(path.resolve(__dirname, '..', relPath), 'utf-8')
}

describe('PLANS constant (lib/supabase.ts)', () => {
  it('has all four plan tiers', () => {
    expect(Object.keys(PLANS).sort()).toEqual(['basic', 'free', 'maxpro', 'pro'])
  })

  it('free plan is priced at 0 and applies self', () => {
    expect(PLANS.free.amount).toBe(0)
    expect(PLANS.free.whoApplies).toBe('self')
  })

  it('pro and maxpro are admin-applies plans priced higher than basic', () => {
    expect(PLANS.pro.whoApplies).toBe('admin')
    expect(PLANS.maxpro.whoApplies).toBe('admin')
    expect(PLANS.pro.amount).toBeGreaterThan(PLANS.basic.amount)
    expect(PLANS.maxpro.amount).toBeGreaterThan(PLANS.pro.amount)
  })

  it('does not contain decommissioned features (WhatsApp alerts, resume rewrite)', () => {
    for (const plan of Object.values(PLANS)) {
      for (const forbidden of FORBIDDEN_STRINGS) {
        expect(plan.features.join(' ')).not.toContain(forbidden)
      }
    }
  })
})

// Regression guard: this exact drift (three separate hardcoded copies of plan
// features across lib/supabase.ts, Subscription.tsx, and Landing.tsx going
// out of sync) was a real bug found during audit. These checks make sure a
// future edit to one copy doesn't silently leave the others stale.
describe('Plan feature copy stays in sync across pages', () => {
  const files = ['pages/Subscription.tsx', 'pages/Landing.tsx']

  it.each(files)('%s has no decommissioned plan features', (relPath) => {
    const source = readSource(relPath)
    for (const forbidden of FORBIDDEN_STRINGS) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('Subscription.tsx and lib/supabase.ts agree on plan prices', () => {
    const source = readSource('pages/Subscription.tsx')
    expect(source).toContain(`price: ${PLANS.basic.amount}`)
    expect(source).toContain(`price: ${PLANS.pro.amount}`)
    expect(source).toContain(`price: ${PLANS.maxpro.amount}`)
  })
})
