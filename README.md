# 🏡 Brisas de Calamuchita

Sistema web para la gestión de reservas de la propiedad de alquiler turístico **Brisas de Calamuchita**, ubicada en Santa Rosa de Calamuchita, Córdoba.

> Proyecto Integrador — Prácticas Profesionalizantes IV
> Tecnicatura Superior en Desarrollo de Software
> Instituto de Formación Técnica N° 29 — Primer Cuatrimestre 2026
>
> **Autor:** Jorge Kalas
> **Docentes:** Kevin Del Bello, Emir García Ontiveros

---

## 📖 Descripción

Aplicación web responsive que permite a los turistas conocer la propiedad, consultar disponibilidad en tiempo real y solicitar reservas online. Incluye un panel interno para que el administrador gestione las solicitudes mediante un modelo híbrido (digital + validación humana).

Reemplaza el proceso manual actual (WhatsApp + papel) eliminando problemas de reservas solapadas, falta de control de huéspedes/vehículos y desorganización general.

## 🧩 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router + Tailwind CSS + Axios |
| Backend | Node.js 20 + Express + mysql2 + JWT + bcrypt + Zod |
| Base de datos | MySQL 8 |
| Notificaciones | Nodemailer + Gmail SMTP |
| Contenedores | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Deploy | Railway (backend + MySQL) + Vercel (frontend) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## 📁 Estructura del repositorio

```
brisas-de-calamuchita/
├── backend/                # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/         # Configuración (BD, env, constantes)
│   │   ├── controladores/  # Lógica de manejo de requests
│   │   ├── middlewares/    # Auth, errores, validación
│   │   ├── modelos/        # Acceso a datos (queries SQL)
│   │   ├── rutas/          # Definición de endpoints
│   │   ├── servicios/      # Lógica de negocio
│   │   ├── utilidades/     # Helpers (fechas, JWT, etc.)
│   │   └── validadores/    # Esquemas Zod
│   ├── tests/              # Tests Jest + Supertest
│   ├── migraciones/        # Scripts SQL de creación de tablas
│   └── semillas/           # Datos iniciales (admin, etc.)
├── frontend/               # SPA (React + Vite)
├── docker/                 # Dockerfiles y configuración
├── docs/                   # Documentación del proyecto
│   ├── diagramas/          # UML, DER, estados, secuencia
│   ├── api/                # Documentación OpenAPI/Swagger
│   └── manuales/           # Manual técnico y de usuario
├── scripts/                # Scripts auxiliares
└── .github/workflows/      # Pipelines CI/CD
```

## 🚀 Cómo levantar el proyecto en local

> ⚠️ Estas instrucciones se completan a partir del Bloque 3. Por ahora solo está la estructura.

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd brisas-de-calamuchita

# 2. Levantar la base de datos con Docker
docker compose up -d

# 3. Backend
cd backend
npm install
cp .env.ejemplo .env
npm run migrar
npm run semillas
npm run dev

# 4. Frontend (en otra terminal)
cd frontend
npm install
cp .env.ejemplo .env
npm run dev
```

## 📚 Documentación

- [Documento base del sistema](./docs/manuales/01-documento-base.md)
- [Manual técnico](./docs/manuales/02-manual-tecnico.md)
- [Manual de usuario](./docs/manuales/03-manual-usuario.md)
- [Documentación de la API](./docs/api/README.md)
- [Diagramas del sistema](./docs/diagramas/)

## 🪪 Licencia

Proyecto académico — uso educativo.
