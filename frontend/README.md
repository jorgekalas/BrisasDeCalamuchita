# Frontend — Brisas de Calamuchita

SPA en **React 18 + Vite + Tailwind CSS** con datos simulados, lista para la demo del video del Sub-bloque 2A.

> En esta fase de demo el frontend funciona **sin backend**: usa datos mockeados en memoria (`src/datos/mock.js`).
> En el Bloque 11 se conectará a la API real.

## 🚀 Cómo levantarlo

```bash
# Una sola vez: instalar dependencias
cd frontend
npm install

# Levantar el servidor de desarrollo
npm run dev
```

Se abre automáticamente en `http://localhost:5173`.

## 🎬 Recorrido sugerido para la demo

1. **Landing** (`/`) — hero, fotos, características.
2. **Disponibilidad** (`/disponibilidad`) — calendario interactivo. Seleccioná dos fechas libres.
3. **Ingresar** (`/ingresar`) — clic en **maria@ejemplo.com** (autocompleta). Cualquier contraseña.
4. **Reservar** (`/reservar`) — completá huéspedes, vehículo y observaciones. Confirmar.
5. **Reserva enviada** — ¡acá aparece el email de notificación simulado!
6. **Mis reservas** (`/mis-reservas`) — el cliente ve su historial con estados.
7. **Cerrar sesión** (logout del header) → Volver a **Ingresar**.
8. **Ingresar como admin** — clic en **admin@brisas.com.ar**.
9. **Panel admin** (`/admin`) — KPIs, listado, **confirmar** la reserva pendiente y ver cómo aparece en notificaciones.

## 👥 Usuarios de demostración

| Email | Rol |
|---|---|
| `maria@ejemplo.com` | Cliente |
| `admin@brisas.com.ar` | Administrador |

> La contraseña es ignorada en esta demo (cualquier texto sirve).

## 🎨 Sistema de diseño

| Token | Valor | Uso |
|---|---|---|
| `musgo-700` | `#3d5b3c` | Color primario (acciones, header) |
| `terracota-500` | `#c97b5a` | Acento cálido (CTAs principales) |
| `crema-100` | `#f5efe6` | Fondo de página |
| `piedra-900` | `#2a2520` | Tipografía principal |
| Fraunces | Serif (display) | Títulos |
| Outfit | Sans (cuerpo) | Texto general |

## 📁 Estructura

```
frontend/
├── public/                  # Assets estáticos (favicon)
├── src/
│   ├── main.jsx             # Punto de entrada
│   ├── App.jsx              # Rutas
│   ├── ContextoApp.jsx      # Estado global (usuario, reservas, notif.)
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
│   │   └── Calendario.jsx   # Reutilizable (visualizar | seleccionar)
│   │
│   ├── datos/
│   │   └── mock.js          # Datos simulados (se reemplaza en Bloque 11)
│   │
│   ├── utilidades/
│   │   └── formato.js
│   │
│   └── estilos/
│       └── global.css
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 📦 Build de producción

```bash
npm run build       # Genera /dist
npm run preview     # Sirve /dist localmente para validar
```

## 🔌 Migración al backend real (Bloque 11)

Cuando llegue el momento de conectar al backend:

1. Reemplazar `src/datos/mock.js` por un cliente Axios en `src/servicios/api.js`.
2. Adaptar `ContextoApp.jsx` para que las funciones `iniciarSesion`, `crearReserva`, `cambiarEstadoReserva` hagan llamadas HTTP en lugar de actualizar estado local.
3. Agregar manejo de tokens JWT (interceptor de Axios + localStorage).
4. Variables de entorno: `VITE_API_URL=http://localhost:3001/api`.
