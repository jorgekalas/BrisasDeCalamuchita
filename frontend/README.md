# Frontend — Brisas de Calamuchita

SPA en **React 18 + Vite + Tailwind CSS**, conectada al backend real y desplegada en producción en Vercel.

**Producción:** https://brisas-de-calamuchita.vercel.app
**API backend:** https://brisas-calamuchita-backend.onrender.com

## Cómo levantarlo en local

Requiere el backend corriendo en `http://localhost:3000` (ver `backend/README.md`).

```bash
# Una sola vez: instalar dependencias
cd frontend
npm install

# Crear .env (apuntando al backend local)
cp .env.ejemplo .env

# Levantar el servidor de desarrollo
npm run dev
```

Se abre automáticamente en `http://localhost:5173`.

## Variables de entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | `https://brisas-calamuchita-backend.onrender.com` |

> Importante: sin barra final, y debe coincidir con la URL real del backend, sino el cliente Axios falla en runtime.

## Recorrido sugerido para la demo

1. **Landing** (`/`) — hero, fotos, características.
2. **Disponibilidad** (`/disponibilidad`) — calendario interactivo en tiempo real (consulta al backend). Seleccioná dos fechas libres.
3. **Ingresar** (`/ingresar`) — usar uno de los emails de prueba (ver tabla abajo). Contraseña: `demo1234`.
4. **Reservar** (`/reservar`) — completá huéspedes, vehículo y observaciones. Confirmar.
5. **Reserva enviada** — el sistema envía correo real vía SMTP (Gmail) al email del cliente.
6. **Mis reservas** (`/mis-reservas`) — el cliente ve su historial con estados reales desde la base de datos.
7. **Cerrar sesión** → volver a **Ingresar** como administrador.
8. **Panel admin** (`/admin`) — KPIs, listado paginado con filtros por estado, calendario lateral sincronizado. Confirmar / cancelar / check-in / check-out.

## Usuarios de demostración (producción)

| Email | Rol | Contraseña |
|---|---|---|
| `brisasdecalamuchita@gmail.com` | Administrador | `demo1234` |
| `maria@ejemplo.com` | Cliente | `demo1234` |
| `mperez@ejemplo.com` | Cliente | `demo1234` |
| `romero@ejemplo.com` | Cliente | `demo1234` |
| `silva@ejemplo.com` | Cliente | `demo1234` |

> En entorno local, el admin es `admin@brisas.com.ar` (mismo password).

## Sistema de diseño

| Token | Valor | Uso |
|---|---|---|
| `musgo-700` | `#3d5b3c` | Color primario (acciones, header) |
| `terracota-500` | `#c97b5a` | Acento cálido (CTAs principales) |
| `crema-100` | `#f5efe6` | Fondo de página |
| `piedra-900` | `#2a2520` | Tipografía principal |
| Fraunces | Serif (display) | Títulos |
| Outfit | Sans (cuerpo) | Texto general |

## Estructura

```
frontend/
├── public/                  # Assets estáticos (favicon, imágenes)
├── src/
│   ├── main.jsx             # Punto de entrada
│   ├── App.jsx              # Rutas + RutaProtegida
│   │
│   ├── paginas/
│   │   ├── Landing.jsx
│   │   ├── Disponibilidad.jsx
│   │   ├── Ingresar.jsx
│   │   ├── Registrarse.jsx
│   │   ├── Reservar.jsx
│   │   ├── ReservaEnviada.jsx
│   │   ├── MisReservas.jsx
│   │   └── PanelAdmin.jsx
│   │
│   ├── componentes/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   ├── Calendario.jsx       # Reutilizable (visualizar | seleccionar)
│   │   ├── RutaProtegida.jsx    # Auth + rol
│   │   └── ScrollAlTope.jsx     # Scroll a (0,0) en cada navegación
│   │
│   ├── contexto/
│   │   └── ContextoAuth.jsx     # Sesión global (usuario + token)
│   │
│   ├── api/
│   │   ├── cliente.js           # Instancia Axios + interceptores JWT
│   │   ├── apiAuth.js
│   │   ├── apiReservas.js
│   │   ├── apiDisponibilidad.js
│   │   └── apiPropiedad.js
│   │
│   ├── hooks/
│   │   └── useApi.js            # Patrón fetch + loading + error
│   │
│   ├── utiles/
│   │   └── fechas.js
│   │
│   └── estilos/
│       └── global.css
│
├── tests/                       # Tests con Vitest + React Testing Library
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Scripts disponibles

| Comando | Función |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR en `localhost:5173` |
| `npm run build` | Compila el frontend para producción en `/dist` |
| `npm run preview` | Sirve `/dist` localmente para validar el build |
| `npm test` | Ejecuta los tests de componentes y hooks con Vitest |

## Tests

El frontend cuenta con 48 tests automatizados (Vitest + React Testing Library) que cubren:

- Renderizado de componentes principales (Header, Calendario, RutaProtegida).
- Hook `useApi` (estados de loading, success, error).
- Utilidades de formato de fechas.
- Comportamiento ante interacción del usuario en formularios.

```bash
npm test                # Ejecutar todos los tests
npm test -- --coverage  # Reporte de cobertura
```

## Despliegue en Vercel

El frontend se redespliega automáticamente en cada push a `main`. Configuración del proyecto:

- **Framework Preset:** Vite (auto-detectado)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Variable de entorno:** `VITE_API_URL` apuntando al backend en Render

> Después del primer deploy de Vercel, hay que actualizar la variable `URL_FRONTEND` en Render con el dominio asignado por Vercel, de lo contrario CORS bloquea las requests.

## Notas técnicas

- **Cold start del backend:** la primera request tras 15+ min de inactividad tarda 30-60 segundos por el free tier de Render. Es comportamiento esperado.
- **Sesión JWT:** el token se guarda en `localStorage` con clave `brisas_token` y se inyecta automáticamente en cada request vía interceptor de Axios.
- **Manejo de 401:** el interceptor detecta sesión expirada y redirige a `/ingresar` limpiando el storage.
