/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          50:  'var(--theme-color-50)',
          100: 'var(--theme-color-100)',
          200: 'var(--theme-color-200)',
          300: 'var(--theme-color-300)',
          400: 'var(--theme-color-400)',
          500: 'var(--theme-color-500)',
          600: 'var(--theme-color-600)',
          700: 'var(--theme-color-700)',
          800: 'var(--theme-color-800)',
          900: 'var(--theme-color-900)',
        }
      }
    },
  },
  plugins: [],
}
