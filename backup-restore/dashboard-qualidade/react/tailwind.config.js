/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'wave-glow': 'waveGlow 6s ease-in-out infinite',
        'wave-move': 'waveMove 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        waveGlow: {
          '0%, 100%': { 
            transform: 'translateX(0) translateY(0) scale(1)',
            opacity: '0.9',
          },
          '25%': { 
            transform: 'translateX(-30px) translateY(-15px) scale(1.1)',
            opacity: '0.7',
          },
          '50%': { 
            transform: 'translateX(25px) translateY(-20px) scale(0.9)',
            opacity: '1',
          },
          '75%': { 
            transform: 'translateX(-15px) translateY(12px) scale(1.05)',
            opacity: '0.8',
          },
        },
        waveMove: {
          '0%': { 
            transform: 'translateX(0) translateY(0) scale(1)',
            opacity: '0.9',
          },
          '25%': { 
            transform: 'translateX(-50px) translateY(-25px) scale(1.05)',
            opacity: '0.7',
          },
          '50%': { 
            transform: 'translateX(40px) translateY(-35px) scale(0.95)',
            opacity: '1',
          },
          '75%': { 
            transform: 'translateX(-25px) translateY(20px) scale(1.02)',
            opacity: '0.8',
          },
          '100%': { 
            transform: 'translateX(0) translateY(0) scale(1)',
            opacity: '0.9',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
