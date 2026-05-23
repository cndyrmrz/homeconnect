/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // CSS variable set by next/font — falls back through the stack gracefully
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Design system — surfaces and text
        canvas:  'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        raised:  'rgb(var(--color-raised) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        border:  'rgb(var(--color-border) / <alpha-value>)',
        ink:     'rgb(var(--color-ink) / <alpha-value>)',
        muted:   'rgb(var(--color-muted) / <alpha-value>)',
        faint:   'rgb(var(--color-faint) / <alpha-value>)',
        // Single accent — calm indigo
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          subtle:  'rgb(var(--color-accent-subtle) / <alpha-value>)',
          muted:   'rgb(var(--color-accent-muted) / <alpha-value>)',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        // Layered, soft shadows — not harsh
        'xs':  '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':  '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':  '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg':  '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'xl':  '0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.12)',
        // Glass — for glassmorphism cards
        'glass': '0 8px 32px 0 rgb(0 0 0 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.8)',
        'glass-dark': '0 8px 32px 0 rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.06)',
        // Glow for accent elements
        'glow': '0 0 20px rgb(var(--color-accent) / 0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                    to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
};
