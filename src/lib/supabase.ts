import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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

// ── Types ──────────────────────────────────────────────────────────
export type UserType      = 'student' | 'professional'
export type AccountStatus = 'pending_onboarding' | 'active' | 'suspended'
export type SubscriptionPlan = 'monthly' | 'quarterly' | 'halfyearly' | 'yearly'
export type SubStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'failed'
export type AppStatus = 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired'

export interface Profile {
  id: string
  full_name: string
  first_name: string | null
  last_name: string | null
  email: string
  mobile_number: string | null
  linkedin_url: string | null
  github_url: string | null
  avatar_url: string | null
  photo_url: string | null
  country: string | null
  address: string | null
  role_interests: string[]
  user_type: UserType | null
  is_admin: boolean
  account_status: AccountStatus
  created_at: string
  last_login: string | null
}

export interface StudentDetails {
  id: string
  college_name: string | null
  degree: string | null
  branch: string | null
  current_year: string | null
  passout_year: number | null
  cgpa: number | null
  internship_done: boolean
  internship_details: string | null
  technical_skills: string[]
  projects: string | null
  resume_url: string | null
  updated_at: string
}

export interface ProfessionalDetails {
  id: string
  years_experience: number | null
  previous_job_title: string | null
  previous_company: string | null
  previous_salary: number | null
  notice_period: boolean
  notice_period_days: number | null
  technical_skills: string[]
  resume_url: string | null
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  amount_paise: number
  status: SubStatus
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  description: string | null
  required_skills: string[]
  required_experience_min: number
  required_experience_max: number | null
  job_type: string | null
  role_category: string | null
  location: string | null
  country: string | null
  salary_min: number | null
  salary_max: number | null
  apply_url: string | null
  is_active: boolean
  posted_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  job_id: string | null
  job_title: string | null
  company: string | null
  admin_id: string | null
  status: AppStatus
  matched_skills: string[]
  applied_at: string
  notes: string | null
}

export interface AppStats {
  last_7_days:   number
  last_30_days:  number
  last_90_days:  number
  last_365_days: number
  all_time:      number
  shortlisted:   number
  hired:         number
}

// Subscription plan metadata
export const PLANS: Record<SubscriptionPlan, { label: string; amount: number; months: string }> = {
  monthly:    { label: '₹399 / month',   amount: 399,  months: '1 month'  },
  quarterly:  { label: '₹1,099 / 3 months', amount: 1099, months: '3 months' },
  halfyearly: { label: '₹1,999 / 6 months', amount: 1999, months: '6 months' },
  yearly:     { label: '₹3,599 / year',  amount: 3599, months: '12 months' },
}
