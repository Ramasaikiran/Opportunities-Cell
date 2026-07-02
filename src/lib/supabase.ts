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
export type SubscriptionPlan = 'basic' | 'pro' | 'maxpro'
export type SubStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'failed'
export type AppStatus = 'applied' | 'assessment' | 'interview' | 'hr_round' | 'rejected' | 'offer' | 'joined'
  | 'shortlisted' | 'hired' // legacy values, still readable
export type EmploymentType = 'full-time' | 'internship' | 'contract' | 'part-time'
export type WorkPreference = 'remote' | 'hybrid' | 'onsite'

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
  portfolio_url: string | null
  preferred_locations: string[]
  salary_expectation: number | null
  employment_type: EmploymentType | null
  work_preference: WorkPreference | null
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

export type JobStatus = 'draft' | 'published' | 'inactive'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export interface Job {
  id: string
  title: string
  company: string
  description: string | null
  required_skills: string[]
  required_experience_min: number
  required_experience_max: number | null
  job_type: string | null
  work_mode: WorkMode | null
  role_category: string | null
  location: string | null
  country: string | null
  salary_min: number | null
  salary_max: number | null
  apply_url: string | null
  last_date: string | null
  plan_visibility: SubscriptionPlan[]
  status: JobStatus
  is_active: boolean
  posted_at: string
  updated_at: string
}

export interface SavedJob {
  id: string
  user_id: string
  job_id: string
  created_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  job_id: string | null
  job_title: string | null
  company: string | null
  job_url: string | null
  admin_id: string | null
  status: AppStatus
  matched_skills: string[]
  applied_at: string
  notes: string | null
}

export interface ActivityLogEntry {
  id: string
  admin_id: string | null
  action: string
  target_user_id: string | null
  details: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: string
  is_read: boolean
  created_at: string
}

export interface AdminDashboardStats {
  total_users: number
  active_subscribers: number
  apps_today: number
  apps_week: number
  apps_month: number
  total_interviews: number
  total_offers: number
  expiring_subscriptions: number
}

export interface UserAppStats {
  total_applications: number
  interviews: number
  rejections: number
  offers: number
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

// Subscription plan metadata — all 1 month, differ by service level
export const PLANS: Record<SubscriptionPlan, {
  label: string; amount: number; tagline: string; whoApplies: 'self' | 'admin'
  features: string[]
}> = {
  basic: {
    label: 'Basic', amount: 399, tagline: 'You apply. We surface the jobs.',
    whoApplies: 'self',
    features: ['Daily job feed matched to your skills', 'Save & track jobs yourself', 'WhatsApp job alerts'],
  },
  pro: {
    label: 'Pro', amount: 1999, tagline: 'We apply for you.',
    whoApplies: 'admin',
    features: ['Everything in Basic', 'Admin applies on your behalf', 'Application tracker with live status', 'Priority job matching'],
  },
  maxpro: {
    label: 'Max Pro', amount: 3599, tagline: 'We apply + get you interview-ready.',
    whoApplies: 'admin',
    features: ['Everything in Pro', 'Resume rewrite (1×)', 'Interview scheduling support', 'Career strategy call'],
  },
}
