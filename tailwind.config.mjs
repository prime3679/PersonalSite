/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader Variable', 'Newsreader', 'Georgia', 'serif'],
        sans: ['Geist Variable', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono Variable', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'var(--line)',
        background: 'var(--paper)',
        // legacy text-foreground/NN utilities need an alpha-capable value,
        // so var(--ink) cannot be used directly. --ink-rgb tracks --ink in
        // src/styles/global.css for both light and night shift.
        foreground: 'rgb(var(--ink-rgb) / <alpha-value>)',
        muted: {
          DEFAULT: 'var(--paper-raised)',
          foreground: 'var(--ink-soft)',
        },
      },
    },
  },
  plugins: [],
};
