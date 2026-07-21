import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Forest Bloom" (Stitch) — verde bosque profundo + magenta vibrante.
        brand: { DEFAULT: '#B50062', dark: '#E2007C', light: '#FFD9E2' },
        forest: { DEFAULT: '#00361E', dark: '#002110', light: '#E8F3EC' },
        ink: '#0B1C30',
        muted: '#414942',
        mist: '#C0C9C0',
        paper: '#F8F9FF',
        outline: '#717972',
        error: '#BA1A1A',
        surface: {
          DEFAULT: '#F8F9FF',
          dim: '#CBDBF5',
          lowest: '#FFFFFF',
          low: '#EFF4FF',
          container: '#E5EEFF',
          high: '#DCE9FF',
          highest: '#D3E4FE',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.04)',
        floating: '0 20px 40px rgba(0,0,0,0.08)',
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
