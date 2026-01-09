/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3A29FF',
        secondary: '#FF94B4',
        accent: '#FF3232',
      },
      fontFamily: {
        sans: ["Inter","system-ui","sans-serif"],
      },
    },
  },
  plugins: [],
};