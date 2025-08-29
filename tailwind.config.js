/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', ...fontFamily.sans],
        serif: ['"Playfair Display"', ...fontFamily.serif],
      },
      colors: {
        'cuet-primary': {
          '50': '#f2f5ff',
          '100': '#e4e9ff',
          '200': '#d0d8ff',
          '300': '#b1beff',
          '400': '#8e9eff',
          '500': '#6f7aff',
          '600': '#5757fa',
          '700': '#4742de',
          '800': '#3a38b1',
          '900': '#32328e', // Main Primary
          '950': '#1e1d52',
        },
        'cuet-secondary': {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c', // Main Secondary
          '800': '#991b1b',
          '900': '#7f1d1d',
          '950': '#450a0a',
        },
        'cuet-accent': {
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24', // Main Accent
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
          '950': '#451a03',
        },
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-border': '#2C2C2C',
        'dark-text': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
