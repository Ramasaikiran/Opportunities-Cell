import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Graceful fallback — app renders, shows config error instead of blank page
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const isMisconfigured = !supabaseUrl || !supabaseAnonKey

export const supabase = createClient(url, key, {
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
