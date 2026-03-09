import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#4A90E2',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        sidebar: '#0f172a',
      },
    },
  },
  plugins: [],
};

export default config;
