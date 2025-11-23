/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#1a0b2e',
          900: '#2d1b4e',
          800: '#3d2a5f',
          700: '#4d3a6f',
          600: '#6d4a9f',
          500: '#8d5abf',
          400: '#a855f7',
          300: '#c084fc',
        }
      }
    },
  },
  plugins: [],
}
