/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // This enables dark mode via class
  theme: {
    extend: {
      colors: {
        // EchoWrite custom colors
        echowrite: {
          orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
            950: '#431407',
            // Custom darker variants
            primary: '#B4400A',
            secondary: '#C66A00',
            tertiary: '#C69000',
            'dark-primary': '#A43A09',
            'dark-secondary': '#B65A00',
            'dark-tertiary': '#B68000',
            'hover-primary': '#943309',
            'hover-secondary': '#A55000',
            'hover-tertiary': '#A57000',
          },
        },
        // Background colors
        'echowrite-bg': {
          start: '#C4500A',
          middle: '#8B4513',
          end: '#000000',
        },
      },
      backgroundImage: {
        'echowrite-primary': 'linear-gradient(135deg, #B4400A, #C66A00, #C69000)',
        'echowrite-button': 'linear-gradient(135deg, #A43A09, #B65A00, #B68000)',
        'echowrite-button-hover': 'linear-gradient(135deg, #943309, #A55000, #A57000)',
        'echowrite-sidebar': 'linear-gradient(135deg, #C4500A, #8B4513, #000000)',
        'echowrite-dark': 'linear-gradient(135deg, #000000, #030712, #0f172a)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
