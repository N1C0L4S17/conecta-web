import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0F6CBD', dark: '#0A4E8A', light: '#EFF6FC' },
        ink: '#242424',
        muted: '#616161',
      },
      fontFamily: { sans: ['Segoe UI', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
