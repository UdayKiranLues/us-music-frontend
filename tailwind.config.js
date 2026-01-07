/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540',
          light: '#1E3A5F',
          dark: '#05192D',
        },
        accent: {
          orange: '#FF6B35',
          red: '#E63946',
          blue: '#0077FF',
        },
        dark: {
          DEFAULT: '#0A0E27',
          light: '#151A2E',
          lighter: '#1E2438',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #0A2540 0%, #0A0E27 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
