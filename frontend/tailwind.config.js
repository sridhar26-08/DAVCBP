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
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2874f0', // Flipkart signature vibrant blue
          600: '#1e5ecc',
          700: '#14469e',
          yellow: '#ffe500' // Flipkart accent yellow
        },
        sentiment: {
          pos: '#10b981', // emerald-500
          posBg: '#ecfdf5',
          neu: '#f59e0b', // amber-500
          neuBg: '#fffbeb',
          neg: '#ef4444', // red-500
          negBg: '#fef2f2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
