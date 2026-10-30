/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0C11',
        accent: 'var(--accent, #F5F5F7)',
        surface: 'var(--surface, rgba(255, 255, 255, 0.04))',
        border: 'var(--border, rgba(255, 255, 255, 0.09))',
        apple: {
          gray: {
            50: '#FBFBFD',
            100: '#F5F5F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#9A9AA0',
            500: '#6E6E73',
            600: '#515154',
            700: '#3A3A3C',
            800: '#222225',
            900: '#161618',
            950: '#0A0A0A',
          },
          darkSurface: 'rgba(255, 255, 255, 0.04)',
          darkBorder: 'rgba(255, 255, 255, 0.09)',
        },
      },
      fontFamily: {
        apple: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter Variable"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter Variable"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        'pill': 'var(--r-pill, 999px)',
        'card-lg': 'var(--r-card-lg, 28px)',
        'card-md': 'var(--r-card-md, 20px)',
        'card': 'var(--r-card-lg, 28px)',
        'input': 'var(--r-input, 16px)',
        'textarea': 'var(--r-textarea, 20px)',
      },
      backdropBlur: {
        'glass': '20px',
        'heavy': '32px',
      },
      boxShadow: {
        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.5)',
        'featured': 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 16px 48px rgba(0, 0, 0, 0.6)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
