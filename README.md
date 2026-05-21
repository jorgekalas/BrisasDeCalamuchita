# Brisas de Calamuchita

Sistema web para la gestión de reservas de la propiedad de alquiler turístico **Brisas de Calamuchita**, ubicada en Santa Rosa de Calamuchita, Córdoba.

> Proyecto Integrador — Prácticas Profesionalizantes IV
> Tecnicatura Superior en Desarrollo de Software
> Instituto de Formación Técnica N° 29 — Primer Cuatrimestre 2026
>
> **Autor:** Jorge Kalas
> **Docentes:** Kevin Del Bello, Emir García Ontiveros

---

## Descripción

Aplicación web responsive que permite a los turistas conocer la propiedad, consultar disponibilidad en tiempo real y solicitar reservas online. Incluye un panel interno para que el administrador gestione las solicitudes mediante un modelo híbrido (digital + validación humana).

Reemplaza el proceso manual actual (WhatsApp + papel) eliminando problemas de reservas solapadas, falta de control de huéspedes/vehículos y desorganización general.

## Estado del proyecto

| Bloque | Descripción | Estado |
|---|---|---|
| 1 | Frontend de demostración (8 pantallas con datos simulados) | Completo |
| 2 | Base de datos MySQL (8 tablas, 30 reservas de prueba) | Completo |
| 3 | Entorno Docker (MySQL 8 + phpMyAdmin) | Completo |
| 4 | Backend Express con configuración base | Completo |
| 5 | Sistema de autenticación (JWT + bcrypt) | Completo |
| 6 | Endpoints CRUD de propiedad, usuarios y reservas | Completo |
| 7 | Máquina de estados de reservas (bloqueo 2hs, anti-solapamiento) | Completo |
| 8 | Notificaciones por email (Nodemailer + Gmail SMTP) | En curso |
| 9-10 | Integración del frontend con la API real | Pendiente |
| 11 | Pruebas automatizadas (Jest + Vitest) | Pendiente |
| 12-13 | Despliegue en Railway y Vercel | Pendiente |
| 14 | Manuales técnico y de usuario | Pendiente |

Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle de avances por bloque.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router + Tailwind CSS + Axios |
| Backend | Node.js 20 + Express + mysql2 + JWT + bcrypt + Zod |
| Base de datos | MySQL 8 |
| Notificaciones | Nodemailer + Gmail SMTP |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Despliegue | Railway (backend + MySQL) + Vercel (frontend) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## Estructura del repositorio

```
brisas-de-calamuchita/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Variables de entorno y pool de MySQL
│   │   ├── controladores/      # Manejo de requests HTTP
│   │   ├── middlewares/        # Autenticación, autorización, errores
│   │   ├── modelos/            # Queries SQL (acceso a datos)
│   │   ├── plantillas/         # Plantillas de email (HTML)
│   │   ├── rutas/              # Definición de endpoints
│   │   ├── servicios/          # Lógica de negocio
│   │   ├── tareas/             # Crons internos
│   │   ├── utilidades/         # Helpers (paginación, errores, respuestas)
│   │   └── validadores/        # Schemas Zod
│   ├── tests/                  # Pruebas con Jest + Supertest
│   ├── migraciones/            # Scripts SQL de creación de tablas
│   ├── semillas/               # Datos iniciales
│   └── scripts/                # Runner de migraciones y seeds
├── frontend/                   # SPA (React + Vite)
├── docker/                     # Configuración custom de MySQL
├── docs/
│   ├── diagramas/              # UML, DER, casos de uso
│   └── manuales/               # Documento base y manuales
└── docker-compose.yml          # Orquestación del entorno local
```

## Cómo levantar el proyecto en local

### Requisitos previos

- Node.js 20 LTS o superior
- Docker Desktop (Windows/macOS) o Docker Engine + Compose (Linux)
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgekalas/BrisasDeCalamuchita.git
cd BrisasDeCalamuchita

# 2. Levantar la base de datos en Docker (MySQL + phpMyAdmin)
docker compose up -d
# Esperar a que MySQL diga "healthy"
docker compose ps

# 3. Levantar el backend en una terminal
cd backend
npm install
cp .env.ejemplo .env
npm run dev

# 4. Levantar el frontend en otra terminal
cd frontend
npm install
npm run dev
```

### Servicios disponibles

| Servicio | URL | Notas |
|---|---|---|
| Frontend | http://localhost:5173 | SPA React |
| Backend (API) | http://localhost:3000 | Express |
| Healthcheck del backend | http://localhost:3000/api/salud | Verifica servidor + BD |
| phpMyAdmin | http://localhost:8081 | Auto-logueado como root |
| MySQL | localhost:3307 | Puerto 3307 para evitar conflicto con MySQL nativo en 3306 |

### Usuarios de demostración

Las semillas cargan automáticamente un administrador y 20 clientes. Todas las contraseñas son `demo1234`.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@brisas.com.ar` | `demo1234` |
| Cliente | `maria@ejemplo.com` | `demo1234` |
| Otros clientes | `*@ejemplo.com` | `demo1234` |

Detalles adicionales del entorno Docker en [docker/README.md](./docker/README.md).

## Documentación

- [Documento base del sistema](./docs/manuales/01-documento-base.md) — relevamiento, alcance, casos de uso, reglas de negocio
- [Diccionario de datos](./docs/diagramas/diccionario-de-datos.md) — tablas, columnas, restricciones, índices
- [Diagramas del sistema](./docs/diagramas/) — DER, clases, casos de uso, estados, secuencia
- [Entorno Docker](./docker/README.md) — configuración del entorno de desarrollo local
- Manual técnico — *en desarrollo*
- Manual de usuario — *en desarrollo*
- Documentación de la API (OpenAPI/Swagger) — *en desarrollo*

## Licencia

Proyecto académico, uso educativo. Todos los derechos reservados al autor.
