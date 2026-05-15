# Backend — Brisas de Calamuchita

API REST en Node.js + Express + MySQL.

## 🏗️ Arquitectura por capas

El backend sigue una arquitectura en capas que separa responsabilidades:

```
src/
├── servidor.js           # Punto de entrada: levanta Express
├── app.js                # Configuración de Express (middlewares, rutas)
│
├── config/               # Configuración centralizada
│   ├── entorno.js        # Carga y valida variables de entorno
│   ├── basedatos.js      # Pool de conexiones MySQL
│   └── constantes.js     # Estados, roles, mensajes
│
├── rutas/                # Definición de endpoints
│   ├── index.js          # Agrupador
│   ├── auth.rutas.js
│   ├── reservas.rutas.js
│   └── ...
│
├── controladores/        # Reciben request, devuelven response
│   ├── auth.controlador.js
│   └── ...
│
├── servicios/            # Lógica de negocio (reglas, orquestación)
│   ├── auth.servicio.js
│   ├── reservas.servicio.js
│   └── ...
│
├── modelos/              # Acceso a datos (queries SQL puras)
│   ├── usuario.modelo.js
│   ├── reserva.modelo.js
│   └── ...
│
├── middlewares/          # Funciones intermedias
│   ├── autenticacion.js  # Verifica JWT
│   ├── autorizacion.js   # Verifica rol
│   ├── manejarErrores.js
│   └── validar.js        # Aplica esquemas Zod
│
├── validadores/          # Esquemas Zod por entidad
│   ├── auth.validador.js
│   └── ...
│
└── utilidades/           # Helpers reutilizables
    ├── jwt.js
    ├── fechas.js
    ├── respuestas.js     # Formato uniforme de respuesta
    └── errores.js        # Clases de error personalizadas
```

### Flujo de una petición

```
HTTP Request
    ↓
[middleware: auth] → [middleware: validar Zod]
    ↓
[ruta] → [controlador]
    ↓
[servicio]  ← (reglas de negocio)
    ↓
[modelo]    ← (queries SQL)
    ↓
MySQL
    ↑
[respuesta uniforme] → HTTP Response
```

## 🔧 Variables de entorno

Copiá `.env.ejemplo` a `.env` y completá los valores. Ver descripción de cada variable en ese archivo.

## 📜 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-reload |
| `npm run iniciar` | Inicia el servidor en modo producción |
| `npm run migrar` | Ejecuta los scripts SQL de creación de tablas |
| `npm run semillas` | Carga datos iniciales (usuario admin, propiedad) |
| `npm test` | Corre los tests con Jest |
| `npm run test:coverage` | Tests + reporte de cobertura |
| `npm run lint` | Verifica estilo de código con ESLint |

## 📦 Dependencias principales

| Paquete | Para qué se usa |
|---|---|
| `express` | Framework HTTP |
| `mysql2` | Driver MySQL con soporte de promesas y parámetros nombrados |
| `jsonwebtoken` | Generación y verificación de JWT |
| `bcryptjs` | Hash de contraseñas |
| `zod` | Validación de schemas (entrada de la API) |
| `nodemailer` | Envío de emails vía SMTP |
| `cors` | Habilita peticiones desde el frontend |
| `helmet` | Headers de seguridad HTTP |
| `morgan` | Logger de requests HTTP |
| `dotenv` | Carga variables de entorno desde `.env` |

## 🧪 Testing

Los tests viven en `tests/` y usan Jest + Supertest. Se priorizan los flujos críticos: autenticación, creación y confirmación de reservas, expiración del bloqueo temporal, validaciones de capacidad y vehículos.
