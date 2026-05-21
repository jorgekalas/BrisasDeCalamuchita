# Registro de cambios — Brisas de Calamuchita

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [No publicado]

### Bloque 8 — Notificaciones por email asíncronas ✅
- **Patrón Outbox + cron worker** para envío asincrónico de emails:
    - Cada cambio de estado relevante en una reserva inserta una fila en
      la tabla `notificacion` con `estado_envio = 'pendiente'`
    - Un cron interno cada 15s procesa el lote pendiente (max 20 por ciclo)
    - Reintenta hasta 3 veces si falla, después marca como `fallida`
    - Los endpoints HTTP responden inmediato sin esperar SMTP
- **5 tipos de notificación** (RN-09 completa):
    - `solicitud_recibida` — al crear reserva (estado Pendiente)
    - `reserva_confirmada` — admin confirma
    - `reserva_cancelada` — cliente o admin cancela
    - `bloqueo_vencido` — cron auto-cancela por no confirmar en 2hs
    - `reserva_finalizada` — admin hace check-out
- **Modo dual** controlado por variable `EMAIL_MODO`:
    - `simulado` (default): loggea el email a consola, no envía nada
      (perfecto para desarrollo y tests)
    - `real`: envía por Gmail SMTP con Nodemailer (requiere app password)
- **5 plantillas HTML** en `src/plantillas/emails.js`:
    - Layout común con header verde y footer
    - Helpers `formatearFecha()` y `formatearMoneda()` con locale es-AR
    - Estilos inline para máxima compatibilidad con clientes de correo
    - Sin emojis (ajuste solicitado por el docente)
- **Servicios separados**:
    - `notificacionServicio.js`: registra/busca/marca filas en la tabla
      (`registrar()`, `buscarPendientes()`, `marcarEnviada()`, `marcarFallida()`)
    - `emailServicio.js`: capa de envío SMTP con `enviar()` y `verificarConexion()`.
      Lazy initialization de Nodemailer (solo se carga si EMAIL_MODO=real).
      Nunca tira excepciones: devuelve `{ ok, error? }`.
- **Cron worker** (`src/tareas/enviarNotificacionesPendientes.js`):
    - Intervalo de 15 segundos
    - Procesamiento secuencial (no paralelo) para no abusar de Gmail
    - Guard contra ejecuciones solapadas
    - Logs cuando hay actividad: `[notif] Lote procesado: X enviadas, Y fallidas`
- **Hooks en el servicio de reservas** (no tira si la notificación falla):
    - `crearReserva()` → `solicitud_recibida`
    - `confirmar()` → `reserva_confirmada`
    - `cancelar()` → `reserva_cancelada`
    - `checkOut()` → `reserva_finalizada`
- **Hook en el cron de bloqueos vencidos**: cada reserva auto-cancelada
  genera un email tipo `bloqueo_vencido`
- **Variables nuevas en `.env.ejemplo`**: `EMAIL_MODO`, `EMAIL_HOST`,
  `EMAIL_PUERTO`, `EMAIL_USUARIO`, `EMAIL_PASSWORD`, `EMAIL_REMITENTE_NOMBRE`
- **Validado end-to-end con 39 tests**:
    - Plantillas (15): cada una genera asunto + cuerpo HTML con datos correctos
    - EmailServicio simulado (3): envía, marca simulado, verifica conexión
    - Hooks (12): cada cambio de estado dispara la notificación correcta
    - Cron de bloqueos vencidos (2): registra `bloqueo_vencido`
    - Cron de envío (2): procesa pendientes y las marca como `enviada`

### README actualizado (sin emojis)
- Reescritura completa del README principal, removiendo todos los emojis
  por pedido del docente
- Información actualizada al estado real del proyecto (incluyendo puertos
  reales como 3307 y 8081, no los defaults)

### Bloque 7 — Lógica de reservas y máquina de estados ✅
- **5 endpoints nuevos** que implementan la máquina de estados:
    - `POST /api/reservas` — cliente crea reserva (Pendiente, bloqueo 2hs)
    - `POST /api/reservas/:id/confirmar` — admin: Pendiente → Confirmada
    - `POST /api/reservas/:id/cancelar` — cliente dueño o admin: Pendiente/Confirmada → Cancelada
    - `POST /api/reservas/:id/check-in` — admin: Confirmada → En curso
    - `POST /api/reservas/:id/check-out` — admin: En curso → Finalizada
- **Reglas de negocio implementadas** (las 10 del documento base):
    - **RN-01** No solapamiento: query con WHERE de rangos antes del INSERT
    - **RN-02** Bloqueo 2hs: `bloqueo_hasta = DATE_ADD(NOW(), INTERVAL 120 MINUTE)`
    - **RN-03** Cancelación automática: cron interno cada 60s
    - **RN-04** Cantidad 4-10 huéspedes: validado en Zod + CHECK BD + validación contra capacidad real de la propiedad
    - **RN-05** Máx 1 vehículo: UNIQUE en BD + se crea en la misma transacción
    - **RN-06** Solo admin confirma: middleware `requiereAdmin`
    - **RN-07** Cliente cancela: solo Pendiente/Confirmada propias, con 24hs de anticipación
    - **RN-08** Check-in/out solo admin: middleware
    - **RN-10** Fecha futura: validado en Zod (no acepta hoy ni anterior)
- **Cron interno** (`src/tareas/cancelarBloqueosVencidos.js`):
    - `setInterval` de 60 segundos
    - Guard contra ejecuciones solapadas si una toma más de 60s
    - Se inicia desde `servidor.js` y se detiene en graceful shutdown
    - Deshabilitado en entorno `pruebas` (no ensucia tests)
- **Creación atómica** con transacción BEGIN/COMMIT/ROLLBACK:
    - Inserta reserva + vehículo (si vino) en una sola transacción
    - Si falla el vehículo, hace rollback de la reserva
- **Validación de propiedad activa** al crear: rechaza reservas para propiedades pausadas
- **Validación de capacidad real** al crear: además del rango Zod (4-10), valida contra `capacidad_minima/maxima` actual de la propiedad
- **Helper de fechas** (`aISODia`) que compara strings YYYY-MM-DD para evitar bugs con zonas horarias entre cliente, servidor y BD
- **Mensajes claros para el frontend**: cada error de regla devuelve un mensaje explicativo con código `REGLA_NEGOCIO`, `CONFLICTO`, `NO_AUTORIZADO`
- **Validado end-to-end con 42 tests in-memory**:
    - Creación: 13 casos (auth, validaciones, solapamiento)
    - Confirmar: 6 casos
    - Cancelar: 8 casos (autorización, ventana 24hs, etc.)
    - Check-in/out: 9 casos (autorización, fecha en rango, transiciones inválidas)
    - Cron: 3 casos (detecta bloqueos vencidos, cancela correctamente)

### Bloque 6 — Endpoints CRUD básicos ✅
- **10 endpoints nuevos** organizados en 3 recursos:
    - **Propiedad** (`/api/propiedad`):
        - `GET /` y `GET /:id` — públicos, datos de la propiedad para la landing
        - `PUT /:id` — admin: edita precio, capacidad, descripción
    - **Usuarios** (`/api/usuarios`):
        - `GET /` — admin: listar clientes con paginación
        - `GET /:id` — admin: detalle
        - `GET /yo` — auth: alias de `/api/auth/yo`
        - `PUT /yo` — auth: editar perfil propio (transacción usuario+cliente)
    - **Reservas** (`/api/reservas`, `/api/mis-reservas`):
        - `GET /reservas/disponibilidad` — público: fechas ocupadas para el calendario
        - `GET /reservas` — admin: listado con filtro por estado y paginación
        - `GET /reservas/:id` — auth: detalle (admin ve todo; cliente solo lo suyo)
        - `GET /mis-reservas` — auth cliente: reservas propias ordenadas (en curso → pendientes → confirmadas → finalizadas → canceladas → no show)
- **Helper de paginación** (`src/utilidades/paginacion.js`):
    - `obtenerPaginacion(req)` parsea `?pagina=1&porPagina=10` con Zod (limite máx 100)
    - `construirMetadata(total, pagina, porPagina)` arma `{ paginacion: { pagina, porPagina, total, totalPaginas, hayProxima, hayAnterior } }`
- **JOINs anidados en reservas**: una sola query devuelve `reserva.cliente`, `reserva.pago` y `reserva.vehiculo` poblados. Sin N+1 queries.
- **Autorización fina**: el cliente puede ver el detalle de SUS reservas pero recibe 403 si intenta ver una ajena (validación en `reservaServicio.obtener`).
- **Filtrado por estado** con ENUM de Zod: solo acepta los 6 estados válidos, rechaza el resto con 400.
- **Modelo de usuario extendido** con `listarPorTipo()` y `actualizarPerfil()` (transacción que toca `usuario` y `cliente` atómicamente).
- **Validador unificado** (`src/validadores/recursosValidador.js`) con schemas Zod para los 3 recursos.
- **Validado end-to-end** con 50 tests in-memory: cubren los 10 endpoints, todos los casos de autorización (sin token / cliente / admin), validación de inputs, paginación, filtros y anidación de relaciones.

### Bloque 5 — Sistema de autenticación (JWT + bcrypt) ✅
- **Modelo de usuario** (`src/modelos/usuarioModelo.js`):
    - `buscarPorEmail()` / `buscarPorId()` con JOIN a cliente y administrador
    - `existeEmail()` — query optimizada (solo trae el id) para validación rápida
    - `crearCliente()` — usa transacción (BEGIN/COMMIT/ROLLBACK) para insertar en
      `usuario` y `cliente` atómicamente
- **Servicio de tokens** (`src/servicios/tokenServicio.js`):
    - `generarToken()` con payload mínimo `{ id, tipo }` (issuer: 'brisas-calamuchita')
    - `verificarToken()` con mensajes específicos para token vencido vs inválido
- **Servicio de autenticación** (`src/servicios/autServicio.js`):
    - `registrar()` — valida email único antes de bcrypt, hashea cost 10, crea usuario + cliente
    - `login()` — anti-timing-attack: hace bcrypt.compare dummy incluso si el email no existe
    - Mensaje genérico "Email o contraseña incorrectos" para no permitir enumeración de usuarios
    - Helper `limpiarUsuario()` que elimina `password_hash` antes de responder
- **Validadores Zod** (`src/validadores/autValidador.js`):
    - `schemaRegistro` — email, password 8-72 chars, nombre, apellido, telefono?, dni?, fecha_nacimiento?
    - `schemaLogin` — email + password (sin restricción de longitud en login)
- **Controlador** (`src/controladores/autControlador.js`):
    - `registrar()` → 201 Created con `{ usuario, token }`
    - `login()` → 200 OK con `{ usuario, token }`
    - `yo()` → 200 OK con `{ usuario }` (datos frescos de BD)
- **Middlewares de seguridad**:
    - `requiereAuth.js` — lee `Authorization: Bearer <token>`, verifica JWT, carga usuario fresco
      desde BD en `req.usuario`. Rechaza si está desactivado.
    - `requiereAdmin.js` — verifica `req.usuario.tipo === 'administrador'`. Va después de requiereAuth.
- **Rutas** (`src/rutas/auth.js`):
    - `POST /api/auth/registro` (público) — crea cliente nuevo
    - `POST /api/auth/login` (público) — devuelve JWT
    - `GET /api/auth/yo` (requiere JWT) — perfil del usuario logueado
    - Wrapper `async$()` para que Express 4 propague errores async al manejador centralizado.
- **Validado end-to-end** con 20 tests (BD in-memory, sin Jest):
    registro exitoso/duplicado/inválido, login con todas las combinaciones,
    GET /yo sin token / con token falso / con token válido. Todo OK.

### Bloque 4 — Setup del backend Express ✅
- **Esqueleto del servidor** con arquitectura modular:
    - `src/servidor.js` — bootstrap HTTP, prueba de BD al arrancar (fail-fast)
      y graceful shutdown (SIGTERM/SIGINT con timeout de 10s).
    - `src/app.js` — configuración de Express separada del servidor (para
      poder testear con Supertest sin levantar puerto).
- **Configuración con Zod** (`src/config/env.js`): valida variables de entorno
  al arrancar. Si falta alguna obligatoria (`BD_HOST`, `BD_PASSWORD`, etc.),
  el servidor falla con un mensaje claro antes de aceptar requests.
- **Pool de MySQL** (`src/config/bd.js`) con tuning para producción:
    - 10 conexiones simultáneas, cola ilimitada
    - utf8mb4 forzado, timezone Argentina (-03:00)
    - Helper `probarConexion()` para fail-fast al arrancar
    - Helper `cerrarPool()` para graceful shutdown
- **Sistema de errores tipados** (`src/utilidades/errores.js`):
    - `ErrorApp` (clase base con `codigoHttp` y `codigoNegocio`)
    - `ValidacionFallida` (400), `NoAutenticado` (401), `NoAutorizado` (403)
    - `NoEncontrado` (404), `Conflicto` (409), `ReglaDeNegocio` (422)
- **Manejador centralizado de errores** (`src/middlewares/manejadorErrores.js`):
    - Captura errores de la app y los formatea uniforme
    - Convierte `ZodError` en respuestas 400 con detalles de cada campo
    - Traduce errores de MySQL conocidos (`ER_DUP_ENTRY` → 409, etc.)
    - En desarrollo expone stack trace; en producción mensaje genérico
- **Formato uniforme de respuestas** (`src/utilidades/respuesta.js`):
    - Éxito: `{ exito: true, datos, metadata? }`
    - Error: `{ exito: false, error: { codigo, mensaje, detalles? } }`
    - Helpers: `exito()`, `creado()` (201), `sinContenido()` (204), `error()`
- **Middlewares base**:
    - `helmet` — 12 headers de seguridad (CSP, HSTS, X-Frame, etc.)
    - `cors` — permite el origen del frontend, configurable por env
    - `morgan` (formato `dev`) — log de cada request con color por status
    - Body parsers de JSON y URL-encoded con límite de 1MB
- **Primer endpoint funcional** `GET /api/salud`:
    - Verifica que el servidor está vivo Y la BD responde
    - Devuelve 200 si todo OK, 503 si la BD está caída
- **`.env.ejemplo` actualizado** para alinear con el schema Zod del backend
  (`NODE_ENV` con valores `desarrollo|pruebas|produccion`, `BD_PUERTO=3307`,
  `PUERTO=3000`).

### Bloque 3 — Entorno local con Docker Compose ✅
- `docker-compose.yml` en la raíz con dos servicios:
    - **MySQL 8.4**: base de datos del sistema, puerto 3306, volumen
      persistente `brisas_mysql_data`, healthcheck cada 10s.
    - **phpMyAdmin 5.2**: interfaz web en puerto 8080, auto-login como root,
      arranca solo cuando MySQL está `healthy`.
- Init scripts montados como read-only: en el primer arranque (cuando el
  volumen está vacío) MySQL ejecuta automáticamente el schema y las semillas
  desde `backend/migraciones/001_schema.sql` y `backend/semillas/001_datos_iniciales.sql`.
- Configuración custom de MySQL en `docker/mysql/conf/my.cnf`:
    - charset `utf8mb4` + collation `utf8mb4_unicode_ci` forzado en todas las conexiones
    - timezone `-03:00` (Argentina) para que `NOW()` devuelva hora local
    - `sql_mode` estricto: rechaza datos inválidos
    - slow query log habilitado para queries > 2s
- Red dedicada `brisas_net` (bridge) para aislamiento entre contenedores.
- Variables de entorno preconfiguradas para desarrollo:
    - root: `rootBrisas2026`
    - app: `brisas_user` / `brisas_password_local`
    - db: `brisas_de_calamuchita`
- Documentación completa en `docker/README.md`:
    - Cómo levantar, parar, ver logs, conectarse a la BD
    - Diferencia entre `docker compose down` (mantiene datos) y `down -v` (borra todo)
    - Troubleshooting de los errores más comunes (puerto ocupado, healthcheck fallido)
    - Cómo conectarse desde phpMyAdmin, DBeaver, MySQL Workbench y CLI
- README principal actualizado con la opción rápida de arranque (Docker + frontend).
- README del backend actualizado con la nota sobre Docker como prerequisito.
- `.gitignore` con comentario aclaratorio sobre que el volumen `brisas_mysql_data`
  es administrado por Docker (no cae en el repo) y excluyendo bind mounts custom
  por si alguien los usa.

### Bloque 2 — Diseño completo de la base de datos MySQL ✅
- Schema completo de la BD `brisas_de_calamuchita` con **8 tablas** en
  `backend/migraciones/001_schema.sql`:
    - `usuario` (base) + `cliente` + `administrador` (herencia con tablas separadas)
    - `propiedad` (preparada para escalar)
    - `reserva` (núcleo) + `vehiculo` + `pago` + `notificacion`
- Motor InnoDB, charset utf8mb4, todas las FKs con `ON DELETE` apropiado:
  CASCADE para relaciones de propiedad, RESTRICT para historial de reservas,
  SET NULL para admin_confirmador.
- Constraints CHECK implementando reglas de negocio:
    - RN-04: `cantidad_huespedes BETWEEN 4 AND 10`
    - Reserva: `fecha_egreso > fecha_ingreso`
    - Propiedad: `precio_por_noche > 0`, `capacidad_minima <= capacidad_maxima`
    - Pago: montos >= 0
- UNIQUE constraints:
    - `usuario.email` único
    - `vehiculo.reserva_id` único (RN-05: máx 1 vehículo por reserva)
    - `pago.reserva_id` único (1 pago por reserva)
- Índices secundarios en columnas de búsqueda frecuente: `estado`, `fechas`,
  `bloqueo_hasta`, `tipo` de usuario, etc.
- ENUM nativos para `tipo`, `estado` de reserva, `estado_pago`, `tipo` de notificación.
- Seeds completas en `backend/semillas/001_datos_iniciales.sql`:
    - 1 propiedad con datos reales de Brisas de Calamuchita (lat, lng, precio).
    - 1 administrador (`admin@brisas.com.ar`) + 20 clientes de demo.
    - **30 reservas** distribuidas en 2026: 12 finalizadas, 7 confirmadas
      futuras, 10 pendientes, 1 cancelada.
    - 25 vehículos (5 reservas sin auto, RN-05 lo permite).
    - 20 pagos con montos reales calculados (noches × $85.000).
    - 9 notificaciones de ejemplo (8 enviadas exitosamente + 1 fallida).
    - Todas las contraseñas demo: `demo1234` (hash bcrypt cost 10).
- Runner de migraciones y semillas en `backend/scripts/runner-sql.cjs`:
    - Lee archivos `.sql` de las carpetas en orden alfabético.
    - Usa `mysql2` con `multipleStatements: true`.
    - Logs en colores con tiempos de ejecución.
    - Manejo de errores con sugerencias accionables.
- Scripts npm en `backend/package.json`:
    - `npm run migrar` → ejecuta migraciones.
    - `npm run semillas` → carga datos iniciales.
    - `npm run resetear` → drop + migrate + seed (útil en desarrollo).
- Diccionario de datos completo en `docs/diagramas/diccionario-de-datos.md`:
  cada tabla con todas sus columnas, tipos, restricciones, FKs e índices.
- `.env.ejemplo` actualizado con `BD_NOMBRE=brisas_de_calamuchita`.
- Cambio de `bcryptjs` a `bcrypt` nativo (mejor performance, mismo formato de hash).
- README del backend actualizado con sección de puesta en marcha de la BD.

### Bloque 1 — Estructura inicial del monorepo
- Estructura de carpetas del monorepo (backend, frontend, docs, docker, scripts).
- README principal del proyecto.
- `.gitignore`, `.editorconfig` y configuración recomendada de VS Code.
- `package.json` y `.env.ejemplo` del backend.
- README del backend con explicación de la arquitectura por capas.
- Documento base del sistema en `docs/manuales/01-documento-base.md`.

### Sub-bloque 2A — Frontend de demo en React (✅ buildea sin errores)
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

### Sub-bloque 2A.6 — Pet friendly + checkbox "sin vehículo"
- Reemplaza "amplio jardín arbolado" por "Pet friendly · tu mascota es bienvenida"
  con icono de huella (`PawPrint`).
- Checkbox "No voy a llevar vehículo" en el formulario de reserva. Al tildarlo
  oculta los inputs de patente y modelo, y al enviar manda `vehiculo: null`.

### Sub-bloque 2A.7 — Calendario: intercambio de colores
- Selección del usuario: verde musgo (antes terracota).
- Reservado: terracota tachado (antes verde musgo).
- Razón: terracota tachado = "no se puede" lee más natural; verde sólido = "esto es tuyo".

### Sub-bloque 2A.8 — "En el corazón del Valle" + textos finales
- Sección de ubicación: "corazón de la villa" → "corazón del Valle".
- Hero: corrige "diez minutos" → "dos cuadras" para coherencia con el resto.
- Calendario público: descripción ahora dice "fechas tachadas" en lugar de
  "verdes" (independiente del color).

### Sub-bloque 2B — Deck ejecutivo del cliente (PowerPoint)
- Deck de 16 slides en formato widescreen (13.3" × 7.5") generado con pptxgenjs.
- Paleta coherente con el frontend (musgo / terracota / crema / piedra).
- Tipografía: Georgia (display, equivalente serif a Fraunces) + Calibri (cuerpo).
- Estructura: portada → equipo → proyecto → problema → solución → usuarios →
  tecnologías → hitos → flujo de reserva → 3 slides de capturas reales →
  próximos pasos → cronograma (Gantt) → costo/beneficio → cierre.
- Las capturas son **screenshots reales del frontend** generadas con Playwright:
  panel admin, calendario público, login y modal del gráfico de ingresos.
- Disponible en `docs/manuales/Deck-Brisas-de-Calamuchita-Etapa3.pptx` (editable)
  y `.pdf` (versión exportada lista para subir al Drive).

### Sub-bloque 2C — Guion del video (Markdown + Word)
- Guion completo del video de 15 minutos, dividido en 6 bloques con tiempos
  precisos: apertura, problema, solución, demo en vivo (5.5 min), tecnologías,
  cierre.
- Cada slide tiene su texto sugerido en formato cita destacada, acciones
  visuales y notas del orador.
- Demo en vivo dividida en 3 actos (visitante / cliente / admin) con clicks
  exactos y momentos clave marcados.
- Checklists de pre-grabación y post-producción.
- Tips para ajustar duración si te quedaste corto o te pasaste.
- Dos formatos: `02-guion-video.md` (editable) y `Guion-Video-Brisas-Etapa3.docx`
  (impreso/teleprompter, con formato visual de citas, banderas de tiempo y
  acciones destacadas).

### Sub-bloque 2D — Documento de trabajo
- Documento anexo (Word) que describe cómo se preparó toda la Etapa 3, según
  pide la consigna: cómo se organizó el trabajo, qué herramientas se usaron,
  cómo se preparó el material, los tiempos invertidos.
- 10 secciones: introducción, organización del trabajo, herramientas,
  el frontend de demo, el deck, el video, tiempos invertidos (~43 horas),
  dificultades y aprendizajes, próximos pasos, anexos.
- Incluye decisiones explícitas sobre qué mostrar y qué dejar afuera tanto en
  el frontend como en el video.
- Disponible como `Documento-de-Trabajo-Etapa3.docx` y `.pdf`.

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
