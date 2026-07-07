/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        charcoal: '#1A1A1A',
        crimson: '#DC2626',
        // Dark mode palette
        navy: '#0F1923',
        'navy-light': '#162231',
        'navy-input': '#1B2B3A',
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'scaleX(0)' },
          '50%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
