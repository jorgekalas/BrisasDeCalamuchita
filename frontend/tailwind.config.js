/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta inspirada en la sierra y río de Calamuchita.
      colors: {
        // Verde musgo profundo: tono dominante, transmite naturaleza y serenidad.
        musgo: {
          50: '#f3f6f1',
          100: '#e2ebde',
          200: '#c6d7c0',
          300: '#9fbb98',
          400: '#779b70',
          500: '#5a8054',
          600: '#456641',
          700: '#3d5b3c', // primario
          800: '#314632',
          900: '#293a2a',
          950: '#161f17',
        },
        // Terracota: acento cálido para CTAs y elementos destacados.
        terracota: {
          50: '#fbf5f1',
          100: '#f5e7dd',
          200: '#eccdba',
          300: '#e1ad8d',
          400: '#d18d63',
          500: '#c97b5a', // principal
          600: '#b25e3f',
          700: '#944b33',
          800: '#783f2e',
          900: '#623728',
        },
        // Crema: fondo principal cálido.
        crema: {
          50: '#fdfbf6',
          100: '#f5efe6', // fondo
          200: '#ece1cd',
          300: '#dfcaa9',
          400: '#cfae82',
        },
        // Piedra oscura: para tipografía y elementos contrastantes.
        piedra: {
          900: '#2a2520',
          800: '#3a342d',
          700: '#4d4640',
          600: '#6a625a',
        },
      },
      fontFamily: {
        // Display: serif moderna, cálida, editorial.
        display: ['"Fraunces"', 'Georgia', 'serif'],
        // Cuerpo: sans humanista, contemporánea.
        cuerpo: ['"Outfit"', '"Helvetica Neue"', 'sans-serif'],
      },
      borderRadius: {
        organico: '2rem',
        capsula: '9999px',
      },
      boxShadow: {
        calido: '0 20px 60px -20px rgba(60, 40, 30, 0.25)',
        suave: '0 10px 30px -10px rgba(60, 40, 30, 0.15)',
      },
      backgroundImage: {
        'grano': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.15 0 0 0 0 0.1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'aparecer': 'aparecer 0.7s ease-out both',
        'flotar': 'flotar 6s ease-in-out infinite',
      },
      keyframes: {
        aparecer: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flotar: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
