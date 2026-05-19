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

### Opción rápida (recomendada): Docker + frontend

Levanta MySQL con los datos cargados automáticamente, y el frontend con todas las pantallas:

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgekalas/BrisasDeCalamuchita.git
cd BrisasDeCalamuchita

# 2. Levantar la base de datos (MySQL + phpMyAdmin)
docker compose up -d
# Esperá unos segundos a que mysql diga "healthy":
docker compose ps

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
# Abrí http://localhost:5173
```

Una vez arriba podés inspeccionar la BD en **http://localhost:8080** (phpMyAdmin).

### Opción con backend (Etapa 4 — en desarrollo)

```bash
# Suma estos pasos a lo anterior:
cd backend
npm install
cp .env.ejemplo .env
npm run dev
```

### Usuarios de demo cargados automáticamente

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@brisas.com.ar` | `demo1234` |
| Cliente | `maria@ejemplo.com` | `demo1234` |
| (otros 19 clientes) | `*@ejemplo.com` | `demo1234` |

Más detalles del entorno Docker en [`docker/README.md`](./docker/README.md).

## 📚 Documentación

- [Documento base del sistema](./docs/manuales/01-documento-base.md) — relevamiento, alcance, casos de uso
- [Diccionario de datos](./docs/diagramas/diccionario-de-datos.md) — todas las tablas con sus columnas y restricciones
- [Diagramas del sistema](./docs/diagramas/) — UML, DER, estados, secuencia, casos de uso
- [Entorno Docker](./docker/README.md) — cómo levantar MySQL local
- Manual técnico — *en desarrollo (Etapa 4)*
- Manual de usuario — *en desarrollo (Etapa 4)*
- Documentación de la API (OpenAPI/Swagger) — *en desarrollo (Etapa 4)*

## 🪪 Licencia

Proyecto académico — uso educativo.
