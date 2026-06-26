import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev so a missing .env never silently breaks auth.
  console.error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in your project URL + anon key.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type UserType = 'student' | 'professional'
export type AccountStatus = 'pending_onboarding' | 'active' | 'suspended'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  user_type: UserType | null
  account_status: AccountStatus
  created_at: string
  last_login: string | null
}
