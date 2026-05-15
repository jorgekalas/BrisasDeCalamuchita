# Frontend — Brisas de Calamuchita

SPA en React 18 + Vite + Tailwind CSS.

> ⚠️ Este módulo se construye a partir del **Bloque 11** del plan del proyecto.
> En este momento solo está la carpeta reservada.

## 🏗️ Arquitectura prevista

```
frontend/
├── src/
│   ├── main.jsx              # Entrada de la app
│   ├── App.jsx               # Configuración de rutas
│   │
│   ├── paginas/              # Componentes de página
│   │   ├── publicas/         # Landing, calendario, registro, login
│   │   ├── cliente/          # Mis reservas, nueva reserva
│   │   └── admin/            # Dashboard, gestión de reservas
│   │
│   ├── componentes/          # Componentes reutilizables
│   │   ├── layout/           # Header, Footer, Layout
│   │   ├── ui/               # Botones, inputs, modales
│   │   └── reservas/         # Calendario, formulario, tarjeta
│   │
│   ├── contextos/            # React Context (Auth, etc.)
│   ├── ganchos/              # Custom hooks (useApi, useAuth)
│   ├── servicios/            # Cliente Axios + llamadas a la API
│   ├── utilidades/           # Helpers (fechas, formato)
│   └── estilos/              # CSS global y Tailwind config
│
├── public/                   # Assets estáticos
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Diseño

Basado en el prototipo de Figma del proyecto, con estética inspirada en Airbnb/Booking:
[Ver prototipo](https://www.figma.com/design/l0HmyoVz9rs0ysuaHsJCDG/Jorge-s-Starter-team-library?node-id=1-222)
