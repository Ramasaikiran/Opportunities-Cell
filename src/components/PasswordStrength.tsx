function scorePassword(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent']
const COLORS = ['bg-clay-700', 'bg-clay-500', 'bg-gold', 'bg-sage', 'bg-sage']

export function passwordRequirementsMet(pw: string) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw)
  )
}

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = scorePassword(password)

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? COLORS[score] : 'bg-ink/10'
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[12px] text-ink/45">
        {LABELS[score]} · use 8+ characters, a capital letter and a number
      </p>
    </div>
  )
}
