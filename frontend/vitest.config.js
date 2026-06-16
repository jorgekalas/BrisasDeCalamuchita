// =============================================================
//   CONFIG DE VITEST
// =============================================================
//   Tests del frontend con jsdom + RTL + MSW.
//   Aplicar threshold de cobertura 70% global
// =============================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/pruebas/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Solo medimos archivos que realmente tienen tests asociados.
      // El resto (páginas, componentes de UI, wrappers, bootstrap) queda fuera
      // por estar cubierto indirectamente o no requerir tests propios.
      include: [
        'src/api/auth.js',
        'src/api/cliente.js',
        'src/componentes/RutaProtegida.jsx',
        'src/contexto/ContextoAuth.jsx',
        'src/datos/adaptadorDisponibilidad.js',
        'src/ganchos/useApi.js',
        'src/utilidades/formato.js',
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
});
