/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff' },
          '50%': { textShadow: '0 0 20px #ff00ff, 0 0 30px #ff00ff' },
          '100%': { textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff' },
        },
        pulseGlow: {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        flash: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.2)' },
        },
      },
      animation: {
        glow: 'glow 1.5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 1.5s ease-in-out infinite',
        flash: 'flash 1s ease-in-out infinite',
        scaleUp: 'scaleUp 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

