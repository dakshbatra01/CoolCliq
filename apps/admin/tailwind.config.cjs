/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0D0D14',
        'dark-surface': '#13131F',
        'dark-border': '#222233',
        'accent-purple': '#6C63FF',
        'accent-violet': '#A78BFA',
        'accent-green': '#34D399',
        'accent-red': '#EF4444',
        'accent-blue': '#22D3EE',
        'text-main': '#FFFFFF',
        'text-muted': '#6B6B8A',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
