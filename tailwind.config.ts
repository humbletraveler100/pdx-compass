/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#055368',
          light: '#244357',
        },
        secondary: {
          DEFAULT: '#c2f5f7',
          mint: '#c5ffce',
          peach: '#f0c498',
          apricot: '#fcd9b8'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}

