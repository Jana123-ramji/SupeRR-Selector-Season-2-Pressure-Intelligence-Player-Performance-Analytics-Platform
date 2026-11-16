/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rr: {
          pink: {
            DEFAULT: '#E40066',
            light: '#FF3385',
            dark: '#B0004E',
            glow: 'rgba(228, 0, 102, 0.35)',
          },
          navy: {
            DEFAULT: '#0B132B',
            light: '#1C2541',
            dark: '#070B18',
            surface: '#111C38',
            card: '#162347',
          },
          gold: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          blue: {
            DEFAULT: '#2563EB',
            light: '#3B82F6',
            dark: '#1D4ED8',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
