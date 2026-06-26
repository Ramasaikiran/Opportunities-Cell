import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream px-6 py-14 sm:px-12">
      <div className="mx-auto max-w-[640px]">
        <p className="text-[13px] font-medium tracking-[0.12em] text-clay-600">
          YOU&rsquo;RE IN
        </p>
        <h1 className="mt-3 font-display text-[32px] font-light text-ink">
          Welcome, {profile?.full_name?.split(' ')[0] ?? 'there'}.
        </h1>
        <p className="mt-2 text-[15px] text-ink/55">
          Your account is active. This is where the application dashboard —
          resume builder, daily job feed, and application tracker — picks up.
        </p>
        <button onClick={signOut} className="btn-primary mt-8 w-auto px-6">
          Sign out
        </button>
      </div>
    </div>
  )
}
