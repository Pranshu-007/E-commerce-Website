/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7f6f4',
          100: '#eceae6',
          200: '#d8d4cd',
          300: '#bdb7ad',
          400: '#9f978c',
          500: '#877e72',
          600: '#6f665c',
          700: '#5a524a',
          800: '#4a443e',
          900: '#1c1917',
        },
        accent: {
          DEFAULT: '#9a3412',
          light: '#c2410c',
          muted: '#fed7aa',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Prata', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(28, 25, 23, 0.08)',
        card: '0 8px 30px -12px rgba(28, 25, 23, 0.12)',
        lift: '0 20px 40px -20px rgba(28, 25, 23, 0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        site: '1280px',
      },
    },
  },
  plugins: [],
}
