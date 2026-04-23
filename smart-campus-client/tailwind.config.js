import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        smartuni: {
          primary: '#2563eb',
          'primary-content': '#ffffff',
          secondary: '#1d4ed8',
          accent: '#3b82f6',
          neutral: '#111827',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          'base-content': '#0f172a',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626',
        },
      },
      'light',
    ],
  }
}
