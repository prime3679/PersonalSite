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
        // rgb literal must equal --ink (#1c1814) in src/styles/global.css.
        // legacy text-foreground/NN utilities need an alpha-capable value,
        // so var(--ink) cannot be used here.
        foreground: 'rgb(28 24 20 / <alpha-value>)',
        muted: {
          DEFAULT: 'var(--paper-raised)',
          foreground: 'var(--ink-soft)',
        },
      },
    },
  },
  plugins: [],
};
