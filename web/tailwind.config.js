/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          blue: '#0070FF',
          DEFAULT: '#0070FF',
          hover: '#0062E0',
        },
        'brand-blue': '#0070FF',
        'brand-hover': '#0062E0',
        accent: {
          orange: '#CF703C',
          DEFAULT: '#CF703C',
        },
        'accent-orange': '#CF703C',
        // Backgrounds
        background: {
          DEFAULT: '#010101',
          dark: '#010101',
          card: '#0D0D0D',
          modal: '#1A1A1A',
        },
        'bg-dark': '#010101',
        'bg-card': '#0D0D0D',
        'bg-modal': '#1A1A1A',
        // Override default grays with oklch values
        gray: {
          50: 'oklch(87.2% .01 258.338)',
          100: 'oklch(82.2% .01 258.338)',
          200: 'oklch(75.7% .022 261.325)',
          300: 'oklch(70.7% .022 261.325)',
          400: 'oklch(55.1% .027 264.364)',
          500: '#868686', // Fallback for oklch(55.1% .027 264.364)
          600: 'oklch(44.6% .03 256.802)',
          700: 'oklch(35.1% .03 256.802)',
          800: 'oklch(25.6% .03 256.802)',
          900: 'oklch(15.1% .03 256.802)',
          950: '#0D0D0D',
        },
        // Semantic colors
        success: {
          DEFAULT: '#00C853',
        },
        danger: {
          DEFAULT: '#FF3B30',
        },
        warning: {
          DEFAULT: '#FF9500',
        },
      },
    },
  },
  plugins: [],
}
