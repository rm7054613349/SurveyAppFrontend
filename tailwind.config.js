/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563eb',
        'secondary-green': '#16a34a',
        'light-bg': '#f9fafb',
        'dark-bg': '#1f2937',
        'card-bg': '#ffffff',
        'card-dark-bg': '#374151',
        'accent-orange': '#f97316',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
         opensans: ['"Open Sans"', 'sans-serif'],
         roboto: ['"Roboto"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};


