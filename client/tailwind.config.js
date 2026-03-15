/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          blue: '#00d4ff',
          dark: '#0a0e1a',
          panel: '#0d1526',
          border: '#1a2a4a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          to: { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        },
      },
    },
  },
  plugins: [],
};
