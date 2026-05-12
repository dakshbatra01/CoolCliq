/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0D0D14',
          card: '#13131F',
          surface: '#1A1A2E',
          border: '#2A2A40',
        },
        accent: {
          blue: '#6C63FF',
          purple: '#A78BFA',
          pink: '#F472B6',
          cyan: '#22D3EE',
          red: '#FF4D6D',
          green: '#34D399',
          amber: '#FBBF24',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#C4C4D4',
          muted: '#6B6B8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #5B52EE 0%, #9478F0 100%)',
        'gradient-danger': 'linear-gradient(135deg, #FF4D6D 0%, #FF6B35 100%)',
        'gradient-card': 'linear-gradient(145deg, #13131F 0%, #1A1A2E 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'brand': '0 0 30px rgba(108, 99, 255, 0.3)',
        'brand-sm': '0 0 15px rgba(108, 99, 255, 0.2)',
        'danger': '0 0 30px rgba(255, 77, 109, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 60px rgba(108, 99, 255, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
