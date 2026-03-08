/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#050505',
        secondary: '#050505',
        accent: '#EB1E99',
      },
      fontFamily: {
        sans: ["Inter","system-ui","sans-serif"],
      },
    },
  },
  plugins: [],
};