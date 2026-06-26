import type { ReactNode } from 'react'

const PROOF_POINTS = [
  { stat: '12,400+', label: 'applications sent on autopilot' },
  { stat: '550+', label: 'students placed through the Cell' },
  { stat: '10–15', label: 'tailored applications, every single day' },
]

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Hero — hidden on mobile, dominant on desktop */}
      <div className="relative hidden overflow-hidden bg-mesh-sunset lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 animate-drift bg-mesh-sunset opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-grain mix-blend-overlay" />

        <div className="relative z-10 px-12 pt-12">
          <span className="font-display text-[15px] tracking-[0.18em] text-cream/90">
            OPPORTUNITIES CELL
          </span>
        </div>

        <div className="relative z-10 px-12">
          <p className="mb-5 text-[13px] font-medium tracking-[0.14em] text-clay-100/80">
            JOBS APPLIED FOR YOU, DAILY
          </p>
          <h1 className="font-display text-[44px] font-light leading-[1.08] text-cream xl:text-[52px]">
            We apply.
            <br />
            You interview.
          </h1>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-cream/70">
            A resume engine and a daily application crew, built for students
            and early-career professionals breaking into tech — across
            Wellfound, LinkedIn, Naukri and Indeed.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-cream/15 px-12 py-8">
          {PROOF_POINTS.map((p) => (
            <div key={p.label}>
              <p className="font-display text-[22px] text-cream">{p.stat}</p>
              <p className="mt-1 text-[12px] leading-snug text-cream/55">
                {p.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col bg-cream px-6 py-10 sm:px-12 lg:justify-center lg:px-20">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <span className="font-display text-[15px] tracking-[0.18em] text-ink">
            OPPORTUNITIES CELL
          </span>
        </div>

        <div className="mx-auto w-full max-w-[420px] animate-rise">
          <p className="mb-3 text-[13px] font-medium tracking-[0.12em] text-clay-600">
            {eyebrow}
          </p>
          <h2 className="font-display text-[34px] font-light leading-tight text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-[15px] leading-relaxed text-ink/55">
              {subtitle}
            </p>
          )}

          <div className="mt-9">{children}</div>

          {footer && <div className="mt-8 text-[14px] text-ink/55">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
