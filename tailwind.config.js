/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor": '#ffffff',
        "columnBackgroundColor": '#f8f9fa'
      }
    },
  },
  plugins: [],
}

