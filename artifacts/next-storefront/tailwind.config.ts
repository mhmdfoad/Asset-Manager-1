import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5fa',
          100: '#ebebf5',
          200: '#d1d1e8',
          500: '#3d3d8f',
          600: '#2d2d7f',
          700: '#1e1e6e',
          800: '#1a1a2e',
          900: '#0d0d1a',
        },
        accent: {
          300: '#e0c76a',
          400: '#d4b04a',
          500: '#c4a045',
          600: '#a8893a',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#e8e8e4',
          300: '#d4d4ce',
          600: '#6b7280',
          700: '#4b5563',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'sans-serif'],
        latin: ['var(--font-latin)', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};

export default config;
