// =============================================================
//   CONFIG DE VITEST
// =============================================================
//   Tests del frontend con jsdom + RTL + MSW.
//   Aplicar threshold de cobertura 70% global.
// =============================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    // jsdom porque testeamos componentes React (DOM virtual)
    environment: 'jsdom',

    // Setup global: registra matchers de jest-dom, arranca MSW
    setupFiles: ['./src/pruebas/setup.js'],

    // Patrones de archivos
    include: ['src/**/*.{test,spec}.{js,jsx}'],

    // Globales (describe, test, expect sin import)
    globals: true,

    // Coverage con v8
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './cobertura',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/App.jsx',
        'src/pruebas/**',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        // Excluimos las paginas y componentes de UI grandes:
        // estos se validan con tests E2E del backend + revision manual
        // del docente. Los tests del frontend se focalizan en las
        // abstracciones criticas (cliente axios, contextos, hooks, helpers).
        'src/paginas/**',
        'src/componentes/Header.jsx',
        'src/componentes/Footer.jsx',
        'src/componentes/Layout.jsx',
        'src/componentes/Calendario.jsx',
        // Datos visuales y mocks tampoco se testean por unidad
        'src/datos/propiedadConDefaults.js',
        'src/datos/constantes.js',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
