# Backend — Brisas de Calamuchita

API REST en Node.js + Express + MySQL. Desplegada en producción en Render con base de datos en TiDB Cloud (MySQL-compatible).

**Producción:** https://brisas-calamuchita-backend.onrender.com
**Healthcheck:** https://brisas-calamuchita-backend.onrender.com/api/salud

## Arquitectura por capas

El backend sigue una arquitectura en capas que separa responsabilidades:

```
src/
├── servidor.js           # Punto de entrada: levanta Express + crons
├── app.js                # Configuración de Express (middlewares, rutas)
│
├── config/               # Configuración centralizada
│   ├── env.js            # Carga y valida variables de entorno con Zod
│   ├── bd.js             # Pool de conexiones MySQL (SSL en producción)
│   └── constantes.js     # Estados, roles, mensajes
│
├── rutas/                # Definición de endpoints HTTP
│   ├── index.js          # Agrupador
│   ├── auth.rutas.js
│   ├── reservas.rutas.js
│   └── ...
│
├── controladores/        # Reciben request, devuelven response
│   ├── auth.controlador.js
│   └── ...
│
├── servicios/            # Lógica de negocio (reglas, transacciones)
│   ├── auth.servicio.js
│   ├── reservas.servicio.js
│   ├── notificacion.servicio.js
│   └── email.servicio.js
│
├── modelos/              # Acceso a datos (queries SQL puras)
│   ├── usuario.modelo.js
│   ├── reserva.modelo.js
│   └── ...
│
├── middlewares/          # Funciones intermedias
│   ├── autenticacion.js  # Verifica JWT
│   ├── autorizacion.js   # Verifica rol (admin / cliente)
│   ├── manejarErrores.js # Handler centralizado de errores
│   └── validar.js        # Aplica esquemas Zod
│
├── tareas/               # Crons internos
│   ├── cancelarBloqueosVencidos.js  # Cada 60s
│   └── enviarNotificacionesPendientes.js  # Cada 15s
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
[servicio]  ← (reglas de negocio + transacciones)
    ↓
[modelo]    ← (queries SQL parametrizadas)
    ↓
MySQL / TiDB Cloud
    ↑
[respuesta uniforme] → HTTP Response
```

## Variables de entorno

Copiá `.env.ejemplo` a `.env` y completá los valores.

```bash
cp .env.ejemplo .env
```

| Variable | Desarrollo | Producción |
|---|---|---|
| `NODE_ENV` | `desarrollo` | `produccion` |
| `PUERTO` | `3000` | (asignado por Render) |
| `BD_HOST` | `localhost` | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `BD_PUERTO` | `3307` | `4000` |
| `BD_USUARIO` | `brisas_user` | `<prefix>.root` |
| `BD_PASSWORD` | `brisas_password_local` | (password TiDB) |
| `BD_NOMBRE` | `brisas_de_calamuchita` | `brisas_de_calamuchita` |
| `JWT_SECRETO` | (cualquier valor para dev) | 128 chars hex generados con `crypto` |
| `JWT_EXPIRACION` | `24h` | `24h` |
| `EMAIL_MODO` | `simulado` | `real` |
| `EMAIL_USUARIO` | — | `brisasdecalamuchita@gmail.com` |
| `EMAIL_PASSWORD` | — | App Password de Gmail (16 chars) |
| `URL_FRONTEND` | `http://localhost:5173` | `https://brisas-de-calamuchita.vercel.app` |

> En producción, SSL/TLS a la base de datos se activa automáticamente cuando `NODE_ENV=produccion` (TiDB Cloud requiere TLS 1.2).
> Generar un JWT_SECRETO nuevo: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Base de datos

El esquema se administra con dos carpetas:

- **`migraciones/`** — scripts SQL que crean las tablas. Se ejecutan en orden alfabético.
- **`semillas/`** — datos iniciales: propiedad, usuario admin, clientes de demo y 30 reservas distribuidas en 2026.

### Puesta en marcha inicial (local)

El entorno de desarrollo se levanta con Docker Compose desde la raíz del proyecto. Ver [`docker/README.md`](../docker/README.md) para detalles.

```bash
# 1. Desde la raíz del proyecto, levantar MySQL + phpMyAdmin
docker compose up -d

# 2. En la primera ejecución, las semillas y migraciones se cargan
#    automáticamente. No hace falta correr nada más.

# 3. Si querés resetear los datos sin reiniciar Docker:
cd backend
npm run resetear
```

El comando `npm run resetear` borra la base, la vuelve a crear desde cero con las migraciones y carga las semillas. Es lo más cómodo en desarrollo para tener siempre datos limpios.

> **Importante:** los init scripts de Docker solo corren la **primera vez** que arranca MySQL (cuando el volumen está vacío). Para volver a ejecutarlos hay que usar `docker compose down -v && docker compose up -d` o el `npm run resetear`.

### Puesta en marcha en TiDB Cloud (producción)

Para cargar el schema en TiDB Cloud, abrir el SQL Editor del cluster y ejecutar las migraciones envueltas en:

```sql
SET FOREIGN_KEY_CHECKS=0;
-- ... contenido del schema (CREATE TABLE, etc.) ...
SET FOREIGN_KEY_CHECKS=1;
```

Esto es necesario porque TiDB Cloud ejecuta cada sentencia por separado y rompería las FKs sin esta envoltura.

### Usuarios de demo cargados por las semillas

| Email | Contraseña | Rol |
|---|---|---|
| `admin@brisas.com.ar` (local) / `brisasdecalamuchita@gmail.com` (producción) | `demo1234` | Administrador |
| `maria@ejemplo.com` | `demo1234` | Cliente |
| `mperez@ejemplo.com` | `demo1234` | Cliente |
| `romero@ejemplo.com` | `demo1234` | Cliente |
| `silva@ejemplo.com` | `demo1234` | Cliente |
| (otros clientes de seed) | `demo1234` | Cliente |

> Las contraseñas están hasheadas con bcrypt (cost 10) en las semillas. Para producción real cambiá todas y deshabilitá los usuarios de demo.

### Diccionario de datos

La documentación completa de cada tabla, columna y constraint está en [`docs/diagramas/diccionario-de-datos.md`](../docs/diagramas/diccionario-de-datos.md).

## Tareas programadas (crons internos)

El servidor lanza dos crons al iniciar (`servidor.js`):

| Cron | Frecuencia | Función |
|---|---|---|
| `cancelarBloqueosVencidos` | 60s | Cancela reservas Pendientes cuyo `bloqueo_hasta < NOW()` y emite notificación |
| `enviarNotificacionesPendientes` | 15s | Toma las N primeras notificaciones Pendientes y las envía por SMTP (patrón outbox) |

> Si el proceso se reinicia (cold start de Render), los crons retoman donde quedaron. Las notificaciones nunca se pierden porque viven en la tabla `notificacion`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-reload |
| `npm start` | Inicia el servidor en modo producción (usado por Render) |
| `npm run migrar` | Ejecuta los scripts SQL de `migraciones/` |
| `npm run semillas` | Carga datos iniciales desde `semillas/` |
| `npm run resetear` | Drop + migrar + semillas (útil en desarrollo) |
| `npm run test:unit` | Corre los 64 tests unitarios con Jest |
| `npm run test:e2e` | Corre los 40 tests E2E con Jest + Supertest |
| `npm run test:coverage` | Tests + reporte de cobertura (~70% líneas) |
| `npm run lint` | Verifica estilo de código con ESLint |

## Dependencias principales

| Paquete | Para qué se usa |
|---|---|
| `express` | Framework HTTP |
| `mysql2` | Driver MySQL con soporte de promesas y parámetros nombrados |
| `jsonwebtoken` | Generación y verificación de JWT |
| `bcryptjs` | Hash de contraseñas (implementación pura JS, sin deps nativas) |
| `zod` | Validación de esquemas (entrada de la API + variables de entorno) |
| `nodemailer` | Envío de emails vía SMTP (Gmail) |
| `cors` | Habilita peticiones desde el frontend |
| `helmet` | Headers de seguridad HTTP |
| `morgan` | Logger de requests HTTP |
| `dotenv` | Carga variables de entorno desde `.env` |

## Testing

Los tests viven en `tests/` y usan Jest + Supertest. Total: **104 tests** (64 unitarios + 40 E2E) ejecutándose en aproximadamente 55 segundos.

```bash
npm run test:unit         # Tests unitarios (~1s)
npm run test:e2e          # Tests E2E (~50s, requiere BD de pruebas)
npm run test:coverage     # Reporte de cobertura
```

### Tests unitarios (64)

Verifican funciones aisladas sin acceso a BD:

- Validadores Zod (reserva, auth, usuario): 18 tests
- Servicios de autenticación (bcrypt, JWT): 12 tests
- Servicios de reserva (transiciones, validaciones de estado): 15 tests
- Helpers de fechas y paginación: 8 tests
- Servicio de notificaciones: 6 tests
- Configuración (env, BD): 5 tests

### Tests E2E (40)

Ejercitan el sistema completo (HTTP → middleware → servicio → BD):

- `auth.test.js`: 11 tests (registro, login, sesión)
- `propiedad.test.js`: 7 tests (datos públicos)
- `reservas.test.js`: 22 tests (CRUD + máquina de estados + filtros)

### Configuración de tests E2E

Los tests E2E usan una BD separada (`brisas_test`). El archivo `.env.test` debe definir las mismas variables que `.env` pero apuntando a esa base. El runner resetea la BD antes de cada suite.

## Despliegue en Render

El backend se redespliega automáticamente en cada push a `main`. Configuración:

- **Type:** Web Service
- **Language:** Node
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free (sleep tras 15 min de inactividad, cold start de 30-60s)
- **15 variables de entorno** cargadas (ver tabla arriba)

> Tras el primer deploy de Vercel del frontend, actualizar `URL_FRONTEND` en Render con el dominio real, sino CORS bloquea todas las requests.

## Endpoints principales

| Método | Ruta | Auth | Rol |
|---|---|---|---|
| `POST` | `/api/auth/registrar` | — | — |
| `POST` | `/api/auth/login` | — | — |
| `GET` | `/api/auth/yo` | JWT | cualquiera |
| `GET` | `/api/propiedad` | — | — |
| `GET` | `/api/reservas/disponibilidad` | — | — |
| `POST` | `/api/reservas` | JWT | cliente |
| `GET` | `/api/reservas/mias` | JWT | cliente |
| `GET` | `/api/reservas` | JWT | admin |
| `PATCH` | `/api/reservas/:id/confirmar` | JWT | admin |
| `PATCH` | `/api/reservas/:id/cancelar` | JWT | cliente o admin |
| `PATCH` | `/api/reservas/:id/check-in` | JWT | admin |
| `PATCH` | `/api/reservas/:id/check-out` | JWT | admin |
| `GET` | `/api/salud` | — | — |

> Todas las respuestas siguen el formato uniforme `{ exito: true, datos: ... }` o `{ exito: false, error: { codigo, mensaje } }`.
