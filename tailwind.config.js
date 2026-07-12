/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#6B1E2B',
          dark: '#4A1420',
          light: '#8A2C3C',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E0C15C',
          dark: '#9C7D1A',
        },
        cream: '#FAF6EE',
        charcoal: '#2B2320',
        emerald: '#2F5D50',
        blush: '#E8D5C4',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

