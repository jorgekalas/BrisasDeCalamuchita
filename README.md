# Brisas de Calamuchita

Sistema web para la gestión de reservas de la propiedad de alquiler turístico **Brisas de Calamuchita**, ubicada en Santa Rosa de Calamuchita, Córdoba.

> Proyecto Integrador - Prácticas Profesionalizantes IV
> Tecnicatura Superior en Desarrollo de Software
> Instituto de Formación Técnica N° 29 - Primer Cuatrimestre 2026
>
> **Autor:** Jorge Kalas
> **Docentes:** Kevin Del Bello, Emir García Ontiveros

---

## Descripción

Aplicación web responsive que permite a los turistas conocer la propiedad, consultar disponibilidad en tiempo real y solicitar reservas online. Incluye un panel interno para que el administrador gestione las solicitudes mediante un modelo híbrido (digital + validación humana).

Reemplaza el proceso manual actual (WhatsApp + papel) eliminando problemas de reservas solapadas, falta de control de huéspedes/vehículos y desorganización general.

## Estado actual del proyecto

| Etapa | Descripción | Estado |
|---|---|---|
| 1 | Análisis del negocio, alcance y casos de uso | ✅ Completa |
| 2 | Diseño del sistema (UML, DER, modelo de datos) | ✅ Completa |
| 3 | Prototipo navegable + presentación de avance | ✅ Completa |
| 4 | Backend, conexión, pruebas y deploy | 🔄 En curso |

El frontend de demo (Etapa 3) es completamente navegable con datos en memoria (mock). El backend real se implementa en la Etapa 4. Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle de avances.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router + Tailwind CSS + Axios |
| Animaciones | Framer Motion + Lucide React |
| Backend | Node.js 20 + Express + mysql2 + JWT + bcrypt + Zod |
| Base de datos | MySQL 8 |
| Notificaciones | Nodemailer + Gmail SMTP |
| Contenedores | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Deploy | Railway (backend + MySQL) + Vercel (frontend) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |

## Estructura del repositorio

```
brisas-de-calamuchita/
├── backend/                # API REST (Node.js + Express) — Etapa 4
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
│   └── src/
│       ├── componentes/    # Header, Footer, Calendario, ModalIngresos
│       ├── paginas/        # 8 pantallas del sistema
│       ├── datos/          # mock.js (datos simulados de la Etapa 3)
│       ├── utilidades/     # Helpers de formato
│       └── ContextoApp.jsx # Estado global
├── docker/                 # Dockerfiles y configuración
├── docs/                   # Documentación del proyecto
│   ├── diagramas/          # UML, DER, estados, secuencia
│   └── manuales/           # Documento base, técnico, usuario
├── scripts/                # Scripts auxiliares
└── .github/workflows/      # Pipelines CI/CD
```

## Cómo levantar el frontend de demo

El prototipo está completamente operativo con datos simulados. No requiere base de datos ni backend.

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgekalas/BrisasDeCalamuchita.git
cd BrisasDeCalamuchita

# 2. Frontend
cd frontend
npm install
npm run dev
```

El servidor de desarrollo queda disponible en `http://localhost:5173`.

### Usuarios de demo

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | maria@ejemplo.com | cualquier valor |
| Administrador | admin@brisas.com.ar | cualquier valor |

> En esta etapa la autenticación es simulada; la validación real se implementa en la Etapa 4.

## Cómo levantar el proyecto completo (Etapa 4 — en desarrollo)

```bash
# 1. Levantar la base de datos con Docker
docker compose up -d

# 2. Backend
cd backend
npm install
cp .env.ejemplo .env
npm run migrar
npm run semillas
npm run dev

# 3. Frontend (en otra terminal)
cd frontend
npm install
cp .env.ejemplo .env
npm run dev
```

## Funcionalidades del sistema

- **Landing pública** con presentación de la propiedad, características, galería y mapa real de Google embebido.
- **Calendario de disponibilidad** interactivo con selección de rango de fechas (verde = tu selección, terracota tachado = reservado).
- **Login y registro** de usuarios.
- **Formulario de reserva** con datos del huésped, vehículo (con opción de "no llevo vehículo"), teléfono de contacto editable y observaciones.
- **Confirmación de reserva** con notificación automática por email.
- **"Mis reservas"** del cliente con historial completo.
- **Panel de administración** con:
  - KPIs (pendientes, confirmadas, finalizadas, ingreso histórico anual)
  - Modal de evolución mensual de ingresos (gráfico de barras + línea acumulada)
  - Listado paginado de reservas (10 por página, ordenado por fecha de solicitud)
  - Botón de WhatsApp directo con mensaje prearmado
  - Acciones de confirmar y rechazar reservas

## Documentación

- [Documento base del sistema](./docs/manuales/01-documento-base.md) — relevamiento, alcance, casos de uso
- [Diagramas del sistema](./docs/diagramas/) — UML, DER, estados, secuencia, casos de uso
- Manual técnico — *en desarrollo (Etapa 4)*
- Manual de usuario — *en desarrollo (Etapa 4)*
- Documentación de la API (OpenAPI/Swagger) — *en desarrollo (Etapa 4)*

## Historial de cambios

Ver [CHANGELOG.md](./CHANGELOG.md) para el detalle de los avances por bloque.

## Licencia

Proyecto académico de uso educativo. Todos los derechos reservados al autor.
