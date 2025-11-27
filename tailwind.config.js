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
        primary: '#3b82f6',      // Blue-500
        secondary: '#60a5fa',    // Blue-400
        background: '#f8fafc',   // Slate-50 - 추가됨
        surface: '#ffffff',      // White - 추가됨
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',  // Blue glow
      },
    },
  },
  plugins: [],
};
