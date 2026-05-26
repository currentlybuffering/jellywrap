/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#07080c',
          900: '#0c0e16',
          800: '#12141f',
          700: '#1a1d2e',
          600: '#242840',
          500: '#2e3352',
        },
        gold: {
          DEFAULT: '#e8c547',
          dim: '#b89a2e',
          bright: '#f5d96a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
}
