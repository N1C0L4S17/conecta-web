import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#D6006E', dark: '#A30057', light: '#FBE6F1' },
        forest: { DEFAULT: '#0B3B2E', dark: '#082A21', light: '#E6EEEA' },
        ink: '#16211D',
        muted: '#5B6B65',
        mist: '#E3E9E6',
        paper: '#F6F8F7',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
