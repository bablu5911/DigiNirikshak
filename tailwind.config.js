/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        trustBlue: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        passBg: '#DCFCE7',
        passText: '#15803D',
        failBg: '#FEE2E2',
        failText: '#B91C1C',
      },
    },
  },
  plugins: [],
}
