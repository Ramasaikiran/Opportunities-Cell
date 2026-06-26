/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F0',
        paper: '#F4EEE3',
        ink: '#1C1A17',
        coal: '#26221D',
        clay: {
          50: '#FFF4EE',
          100: '#FFE3D4',
          300: '#FFB28C',
          500: '#FF6B45',
          600: '#E8552F',
          700: '#C5401F',
        },
        gold: '#C9A35F',
        sage: '#7A8A6F',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Switzer"', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-sunset':
          'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,107,69,0.55), transparent 60%), radial-gradient(ellipse 70% 60% at 85% 30%, rgba(201,163,95,0.45), transparent 55%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(122,138,111,0.35), transparent 60%), linear-gradient(180deg, #1C1A17 0%, #26221D 100%)',
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        glass: '0 8px 40px -8px rgba(28,26,23,0.25)',
        soft: '0 2px 20px -4px rgba(28,26,23,0.08)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-2%, 2%) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 18s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
