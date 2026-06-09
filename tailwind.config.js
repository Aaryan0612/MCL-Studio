/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0A0A0A',
          panel: '#111111',
          elevated: '#161616',
          surface: '#1D1E22',
          border: '#2A2A2A',
          borderStrong: '#3A3A3A',
          borderActive: '#40424A',
          text: '#E5E5E5',
          textSecondary: '#A1A1A1',
          textMuted: '#7B7B7B',
          textDisabled: '#5F5F5F',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          ast: '#E7A6FF',
        },
      },
      fontFamily: {
        ui: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"JetBrains Mono"', 'Consolas', '"SFMono-Regular"', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
