# Registro de cambios — Brisas de Calamuchita

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [No publicado]

### Bloque 1 — Estructura inicial del monorepo
- Estructura de carpetas del monorepo (backend, frontend, docs, docker, scripts).
- README principal del proyecto.
- `.gitignore`, `.editorconfig` y configuración recomendada de VS Code.
- `package.json` y `.env.ejemplo` del backend.
- README del backend con explicación de la arquitectura por capas.
- Documento base del sistema en `docs/manuales/01-documento-base.md`.

### Sub-bloque 2A — Frontend de demo en React (buildea sin errores)
- Configuración base: Vite, Tailwind con paleta personalizada (musgo, terracota, crema, piedra),
  PostCSS, autoprefixer, fuentes Fraunces + Outfit.
- Estilos globales con texturas (grano), animaciones de reveal escalonado, botones, badges,
  tarjetas orgánicas, inputs.
- Contexto global `ContextoApp.jsx` con autenticación simulada, gestión de reservas y
  notificaciones en memoria (sin backend).
- Datos mockeados (`src/datos/mock.js`) con propiedad, usuarios y reservas iniciales
  generadas con fechas relativas a hoy.
- Componente reutilizable `Calendario` con dos modos: visualizar / seleccionar.
- 8 páginas implementadas:
    1. Landing (hero + galería + características + CTA)
    2. Disponibilidad (calendario interactivo)
    3. Ingresar (login con usuarios de demo autocompletables)
    4. Registrarse
    5. Reservar (formulario con huéspedes, vehículo, observaciones)
    6. Reserva enviada (con email simulado en pantalla)
    7. Mis reservas (cliente)
    8. Panel de administración (KPIs, filtros, confirmar/cancelar)
- Header con navegación adaptativa según rol y Footer.
- Build de producción exitoso (~338 kB JS, ~30 kB CSS).

### Sub-bloque 2A.1 — Ajuste: teléfono de contacto y WhatsApp
- Nuevas utilidades `normalizarTelefono` y `armarLinkWhatsApp` en `utilidades/formato.js`.
- Formulario de reserva: nueva tarjeta "Teléfono de contacto", autocompletada con el del
  perfil pero editable (el cliente puede dar un número distinto al de su registro).
- `ContextoApp.crearReserva` ahora prioriza el `telefonoContacto` del formulario sobre
  el del perfil.
- Panel admin: cada tarjeta de reserva muestra un bloque destacado en verde musgo con
  el teléfono y un botón de WhatsApp (logo oficial SVG) que abre la conversación con
  un mensaje prearmado: nombre del cliente, ID de la reserva, fechas y referencia a la seña.
- "Mis reservas" del cliente: muestra al pie de cada reserva a qué número lo van a
  contactar para coordinar la seña, dándole transparencia.

### Sub-bloque 2A.2 — Ajustes de propiedad, fechas y gráfico de ingresos
- **Propiedad actualizada en `mock.js`**: ahora son 3 habitaciones (2 dobles + 6 simples),
  2 baños, se elimina pileta, se agregan asadores con amplio patio, jardín arbolado,
  cocina equipada con heladera/freezer, ropa de cama incluida, TV cable y calefacción.
  A 5 minutos del río (2 cuadras).
- **Fechas con año visible**: nuevas utilidades `formatearFechaConAnio` y
  `formatearRangoFechas`. Se aplica en panel admin, "Mis reservas" y página de
  confirmación de reserva.
- **Mock con fechas absolutas** (no relativas a "hoy"): 11 reservas distribuidas
  en 2026 mostrando claramente pasadas, presentes y futuras.
- **Bug-fix**: nueva utilidad `estadoEfectivo` que calcula el estado de una reserva
  según la fecha actual. Una reserva confirmada cuyo egreso ya pasó se ve como
  "Finalizada"; una pendiente que pasó su fecha de ingreso se ve "Cancelada";
  una confirmada que está sucediendo hoy se ve "En curso". Aplicada en todo el
  panel admin para evitar inconsistencias.
- **Nuevo modal `ModalIngresos.jsx`**: gráfico SVG combinado de barras (ingresos
  mensuales en terracota) + línea de tendencia acumulada (musgo) + área sutil
  bajo la curva. Incluye 3 mini-KPIs (total año, mejor mes, promedio mensual) y
  tooltip al pasar el mouse por cada mes. Sin librerías externas — SVG puro,
  ~14 KB extra al bundle.
- **KPI "Ingreso histórico"** ahora dice "Ingreso histórico 2026" y es clickeable.
  Hover con sombra cálida + anillo terracota + texto "ver evolución mensual →".
- **Grilla de características** ajustada a 5 columnas en desktop (2 filas de 5)
  para acomodar las 10 características nuevas con buena proporción.
- **Mini-stat de la landing**: "1200 m² jardín privado" → "2 cuadras del río".
- **Footer**: actualizado para reflejar la nueva descripción de la propiedad.

### Sub-bloque 2A.3 — Mapa real, paginación y ajustes finos
- **Texto de habitaciones** mejorado: ahora dice "3 habitaciones · 2 camas dobles
  y 6 simples" (más claro que "2 dobles + 6 simples").
- **Mini-stat de la landing**: "2 cuadras del río" → "2 asadores · amplio patio"
  para destacar mejor el diferencial del producto.
- **Dirección y coordenadas reales** en `mock.js`: Malvinas Argentinas 189, X5196
  Santa Rosa de Calamuchita. Coordenadas (-32.073353, -64.538835).
- **Badge de ubicación clickeable** en la landing: ahora abre Google Maps en
  pestaña nueva con el indicador `↗`.
- **Nueva sección "Dónde estamos"** en la landing entre la galería y el CTA final:
  texto descriptivo + dirección completa + botón "Ver en Google Maps" + iframe
  embebido de Google Maps con la ubicación real de la propiedad. Decorada con
  círculo terracota orgánico.
- **Footer** con la dirección completa de la propiedad, clickeable hacia Google Maps.
- **Panel admin: orden y paginación**:
    - Las reservas se ordenan por fecha de creación descendente (más recientes
      arriba).
    - Paginación de 10 reservas por página con controles `<`, números, `...` para
      saltar páginas si son muchas.
    - Indicador "Mostrando 1–10 de 15" en el extremo opuesto al paginador.
    - Contador total de reservas junto a los filtros.
    - Al cambiar de filtro se vuelve automáticamente a la página 1.
    - Mensaje claro cuando un filtro no tiene resultados.
- **Mock**: 4 reservas nuevas (Vega, Castro, Ibáñez, +1) para que la paginación
  sea visible desde el primer momento. Total: 15 reservas.

### Pendiente
- Sub-bloque 2B: Deck de Canva (estructura, contenido y guion).
- Sub-bloque 2C: Guion del video de 15 minutos.
- Sub-bloque 2D: Documento de organización (anexo).
- Bloque 2: diseño completo de la base de datos.
- Bloque 3: docker-compose con MySQL.
- Bloques 4–10: backend.
- Bloques 11–14: frontend conectado a backend real.
- Bloques 15–16: deploy y documentación final.
