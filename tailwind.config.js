/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './writing/**/*.html',
    './js/**/*.js',
    './data/**/*.js',
  ],
  safelist: [
    'border-3',
    'border-4',
  ],
  theme: {
    extend: {
      colors: {
        'crayon-yellow': 'var(--crayon-yellow)',
        'crayon-blue': 'var(--crayon-blue)',
        'crayon-green': 'var(--crayon-green)',
        'crayon-red': 'var(--crayon-red)',
        'crayon-purple': 'var(--crayon-purple)',
        'crayon-orange': 'var(--crayon-orange)',
        'crayon-light-blue': 'var(--crayon-light-blue)',
        'surface': 'var(--surface)',
        'surface-glass': 'var(--surface-glass)',
        'on-surface': 'var(--on-surface)',
        'on-surface-dim': 'var(--on-surface-dim)',
      },
      fontFamily: {
        ui: ['var(--font-ui)', 'sans-serif'],
        accent: ['var(--font-accent)', 'cursive'],
      },
      borderRadius: {
        'DEFAULT': '0rem',
        'lg': '0rem',
        'xl': '0rem',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
