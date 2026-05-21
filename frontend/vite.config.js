import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// =============================================================
//   VITE CONFIG — Brisas de Calamuchita
// =============================================================
//   En desarrollo el frontend hace llamadas a /api/* y Vite las
//   proxea al backend en http://localhost:3000 (o lo que diga
//   VITE_API_TARGET en el .env).
//
//   En produccion, el frontend ya tiene la URL absoluta del
//   backend (configurada via VITE_API_URL) y no usa el proxy.
//
//   Esta separacion permite escribir el codigo del front sin
//   pensar en CORS ni en URLs absolutas.
// =============================================================

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno segun el modo (.env, .env.development, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // A donde apunta el proxy. Default: localhost:3000.
  // Usamos 127.0.0.1 (no localhost) porque Node 18 + Windows tiene un
  // bug conocido con IPv6 que rompe POSTs cuando se usa "localhost".
  const apiTarget = env.VITE_API_TARGET || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],

    server: {
      port: 5173,
      open: true,
      proxy: {
        // Cualquier request del frontend que empiece con /api se redirige
        // al backend. Esto evita problemas de CORS en desarrollo.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // Si el backend no responde, devolver un 503 con formato uniforme
          // en lugar de inventar un 404.
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.error('[vite-proxy] Error proxeando al backend:', err.message);
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  exito: false,
                  error: {
                    codigo: 'BACKEND_NO_DISPONIBLE',
                    mensaje: 'El backend no esta respondiendo. Verificá que esté corriendo.',
                  },
                }));
              }
            });
          },
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
