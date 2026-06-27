/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0F',
        void: '#111118',
        surface: '#16161F',
        border: '#2A2A38',
        muted: '#3D3D52',
        ghost: '#8585A0',
        silver: '#C5C5D8',
        white: '#F0F0FF',
        accent: '#6C63FF',
        'accent-light': '#8B84FF',
        'accent-dim': 'rgba(108,99,255,0.15)',
        emerald: '#00D4A0',
        'emerald-dim': 'rgba(0,212,160,0.12)',
        amber: '#FFB347',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse_slow: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'rise-delay': 'rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        'rise-delay-2': 'rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        'fade-in': 'fadeIn 0.8s ease both',
        pulse_slow: 'pulse_slow 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
