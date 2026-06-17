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

## Producción

El sistema está desplegado y accesible públicamente:

| Componente | URL |
|---|---|
| Frontend (Vercel) | https://brisas-de-calamuchita.vercel.app |
| Backend (Render) | https://brisas-calamuchita-backend.onrender.com |
| Healthcheck del backend | https://brisas-calamuchita-backend.onrender.com/api/salud |

> Aviso: el plan gratuito de Render aplica suspensión por inactividad. La primera request tras varios minutos sin uso puede tardar 30-60 segundos en responder ("cold start"). Las requests subsiguientes son inmediatas.

### Credenciales de demostración (producción)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `brisasdecalamuchita@gmail.com` | `demo1234` |
| Cliente (María) | `maria@ejemplo.com` | `demo1234` |
| Cliente (Miguel) | `mperez@ejemplo.com` | `demo1234` |
| Cliente (Romero) | `romero@ejemplo.com` | `demo1234` |
| Cliente (Silva) | `silva@ejemplo.com` | `demo1234` |

## Estado del proyecto

Etapa 4 (final) completada. Todas las funcionalidades planificadas están implementadas, probadas y desplegadas en producción:

- Sistema de autenticación (JWT + bcrypt) y autorización por rol.
- CRUD completo sobre usuarios, reservas, vehículos, pagos y notificaciones.
- Máquina de estados de reservas con seis estados (Pendiente, Confirmada, En curso, Finalizada, Cancelada, No Show).
- Bloqueo temporal de fechas de 2 horas con liberación automática vía cron interno.
- Notificaciones por email con patrón outbox (Nodemailer + Gmail SMTP real).
- Panel administrativo con KPIs, listado paginado y filtros, y calendario lateral sincronizado.
- Frontend completamente integrado con la API REST.
- 152 pruebas automatizadas (64 unitarias de backend, 40 E2E, 48 de frontend) ejecutadas en GitHub Actions en cada push.
- Despliegue productivo en Vercel + Render + TiDB Cloud.

Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle de avances por bloque a lo largo del proyecto.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router + Tailwind CSS + Axios |
| Backend | Node.js 20 + Express + mysql2 + JWT + bcryptjs + Zod |
| Base de datos | MySQL 8 |
| Notificaciones | Nodemailer + Gmail SMTP |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Despliegue | Vercel (frontend) + Render (backend) + TiDB Cloud (BD MySQL serverless) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## Estructura del repositorio

```
BrisasDeCalamuchita/
├── .github/workflows/          # Pipeline de CI (tests + build)
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Variables de entorno y pool de MySQL
│   │   ├── controladores/      # Manejo de requests HTTP
│   │   ├── middlewares/        # Autenticación, autorización, errores
│   │   ├── modelos/            # Queries SQL (acceso a datos)
│   │   ├── plantillas/         # Plantillas de email (HTML)
│   │   ├── rutas/              # Definición de endpoints
│   │   ├── servicios/          # Lógica de negocio
│   │   ├── tareas/             # Crons internos (bloqueos, notificaciones)
│   │   ├── utilidades/         # Helpers (paginación, errores, respuestas)
│   │   └── validadores/        # Schemas Zod
│   ├── tests/
│   │   ├── unitarios/          # 64 tests Jest
│   │   └── e2e/                # 40 tests Supertest + MySQL real
│   ├── migraciones/            # Scripts SQL de creación de tablas
│   ├── semillas/               # Datos iniciales
│   └── scripts/                # Runner de migraciones y seeds
├── frontend/                   # SPA (React + Vite, 48 tests Vitest)
├── docker/                     # Configuración custom de MySQL
├── docs/
│   ├── diagramas/              # UML, DER, casos de uso, diccionario de datos
│   └── manuales/
│       ├── Informe_Final_Brisas_de_Calamuchita.pdf   # Documento de Etapa 4
│       └── capturas/                                  # Screenshots del sistema
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
npm run migrar    # Crea las 8 tablas
npm run semillas  # Carga datos iniciales (admin + 20 clientes + 30 reservas)
npm run dev

# 4. Levantar el frontend en otra terminal
cd frontend
npm install
npm run dev
```

### Servicios locales

| Servicio | URL | Notas |
|---|---|---|
| Frontend | http://localhost:5173 | SPA React con hot-reload |
| Backend (API) | http://localhost:3000 | Express |
| Healthcheck del backend | http://localhost:3000/api/salud | Verifica servidor + BD |
| phpMyAdmin | http://localhost:8081 | Auto-logueado como root |
| MySQL | localhost:3307 | Puerto 3307 para evitar conflicto con MySQL nativo en 3306 |

### Credenciales locales

Las semillas cargan automáticamente un administrador y 20 clientes. Todas las contraseñas son `demo1234`.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@brisas.com.ar` | `demo1234` |
| Cliente | `maria@ejemplo.com` | `demo1234` |
| Otros clientes | `*@ejemplo.com` | `demo1234` |

> Nota: en producción (TiDB Cloud) el administrador es `brisasdecalamuchita@gmail.com`. En entornos locales y CI es `admin@brisas.com.ar`. Esto se debe a que el email de producción se actualizó manualmente para coincidir con la cuenta de Gmail desde la que el sistema envía las notificaciones SMTP.

Detalles adicionales del entorno Docker en [docker/README.md](./docker/README.md).

## Ejecutar las pruebas

```bash
# Backend (desde backend/)
npm run test:unit       # 64 tests unitarios (Jest)
npm run test:e2e        # 40 tests E2E con MySQL real (Jest + Supertest)
npm run test:coverage   # Cobertura combinada

# Frontend (desde frontend/)
npm test                # 48 tests con Vitest + React Testing Library
```

El mismo pipeline corre automáticamente en GitHub Actions en cada push a `main`.

## Documentación

* [Informe Final (PDF)](https://github.com/jorgekalas/BrisasDeCalamuchita/blob/main/docs/manuales/Informe_Final_Brisas_de_Calamuchita.pdf) — Documento completo de la Etapa 4 (92 páginas)
  * Bloque A — Documento base: descripción del problema, alcance, objetivos, usuarios, benchmark, viabilidad
  * Bloque B — Modelado: casos de uso, DER, clases, estados, secuencia (con enlaces a versiones interactivas en draw.io)
  * Bloque C — Implementación: arquitectura, stack tecnológico justificado, decisiones de diseño, CRUD, pruebas, CI/CD
  * Bloque D — Manuales: instalación local, despliegue productivo, manual de usuario por rol, mensajes y alertas
* [Diccionario de datos](https://github.com/jorgekalas/BrisasDeCalamuchita/blob/main/docs/diagramas/diccionario-de-datos.md) — Tablas, columnas, restricciones e índices
* [Diagramas del sistema](https://github.com/jorgekalas/BrisasDeCalamuchita/tree/main/docs/diagramas) — PNG de DER, clases, casos de uso, estados, secuencia
* [Capturas del sistema en producción](https://github.com/jorgekalas/BrisasDeCalamuchita/tree/main/docs/manuales/capturas) — Screenshots usados en el manual de usuario
* [Entorno Docker](./docker/README.md) — Configuración del entorno de desarrollo local

## Licencia

Proyecto académico, uso educativo. Todos los derechos reservados al autor.
