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

```bash
cp .env.ejemplo .env
```

## 🗄️ Base de datos

El esquema de la BD se administra con dos carpetas:

- **`migraciones/`** — scripts SQL que crean las tablas. Se ejecutan en orden alfabético.
- **`semillas/`** — datos iniciales: propiedad, usuario admin, clientes de demo y 30 reservas distribuidas en 2026.

### Puesta en marcha inicial

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

### Usuarios de demo cargados por las semillas

| Email | Contraseña | Rol |
|---|---|---|
| `admin@brisas.com.ar` | `demo1234` | Administrador |
| `maria@ejemplo.com` | `demo1234` | Cliente |
| (otros 19 clientes) | `demo1234` | Cliente |

> Las contraseñas están hasheadas con bcrypt (cost 10) en las semillas. Para producción cambiá todas y deshabilitá los usuarios de demo.

### Diccionario de datos

La documentación completa de cada tabla, columna y constraint está en [`docs/diagramas/diccionario-de-datos.md`](../docs/diagramas/diccionario-de-datos.md).

## 📜 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-reload |
| `npm run iniciar` | Inicia el servidor en modo producción |
| `npm run migrar` | Ejecuta los scripts SQL de `migraciones/` |
| `npm run semillas` | Carga datos iniciales desde `semillas/` |
| `npm run resetear` | Drop + migrar + semillas (útil en desarrollo) |
| `npm test` | Corre los tests con Jest |
| `npm run test:coverage` | Tests + reporte de cobertura |
| `npm run lint` | Verifica estilo de código con ESLint |

## 📦 Dependencias principales

| Paquete | Para qué se usa |
|---|---|
| `express` | Framework HTTP |
| `mysql2` | Driver MySQL con soporte de promesas y parámetros nombrados |
| `jsonwebtoken` | Generación y verificación de JWT |
| `bcrypt` | Hash de contraseñas |
| `zod` | Validación de schemas (entrada de la API) |
| `nodemailer` | Envío de emails vía SMTP |
| `cors` | Habilita peticiones desde el frontend |
| `helmet` | Headers de seguridad HTTP |
| `morgan` | Logger de requests HTTP |
| `dotenv` | Carga variables de entorno desde `.env` |

## 🧪 Testing

Los tests viven en `tests/` y usan Jest + Supertest. Se priorizan los flujos críticos: autenticación, creación y confirmación de reservas, expiración del bloqueo temporal, validaciones de capacidad y vehículos.
