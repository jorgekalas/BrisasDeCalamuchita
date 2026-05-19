# Diccionario de datos — Brisas de Calamuchita

Documento que describe cada tabla, columna, tipo y restricción de la base de datos del sistema.

> **Base de datos:** `brisas_de_calamuchita`
> **Motor:** InnoDB
> **Charset:** utf8mb4 / Collation: utf8mb4_unicode_ci

---

## Convenciones generales

- Todos los nombres en `snake_case` y minúsculas.
- Tablas en singular (`usuario`, no `usuarios`).
- Toda tabla tiene `id INT AUTO_INCREMENT PRIMARY KEY`.
- Toda tabla principal tiene `creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
- Tablas que pueden modificarse tienen además `actualizado_en TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
- Foreign keys siempre con nombre `fk_{tabla_local}_{tabla_referenciada}`.
- Unique keys con prefijo `uk_` y check constraints con prefijo `ck_`.
- Índices secundarios con prefijo `idx_`.

---

## 1. Tabla `usuario`

Tabla base con datos comunes a todos los usuarios del sistema (clientes y administradores).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único del usuario |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Email de login. Único en el sistema |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash bcrypt de la contraseña (cost 10) |
| `nombre` | VARCHAR(80) | NOT NULL | Nombre del usuario |
| `apellido` | VARCHAR(80) | NOT NULL | Apellido del usuario |
| `telefono` | VARCHAR(30) | — | Teléfono de contacto |
| `tipo` | ENUM | NOT NULL | `'cliente'` o `'administrador'` |
| `activo` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft delete: si está en false el usuario no puede loguearse |
| `creado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Fecha de alta |
| `actualizado_en` | TIMESTAMP | NOT NULL, ON UPDATE NOW | Última modificación |

**Índices:** `idx_usuario_tipo`, `idx_usuario_activo`

---

## 2. Tabla `cliente`

Extiende `usuario` con datos específicos del rol cliente. La relación con `usuario` es 1-a-1 obligatoria.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `usuario_id` | INT | PK + FK a usuario(id) | ID del usuario al que extiende |
| `dni` | VARCHAR(20) | — | DNI del cliente |
| `fecha_nacimiento` | DATE | — | Fecha de nacimiento |
| `creado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Fecha de alta del rol cliente |

**FK:** `fk_cliente_usuario` ON DELETE CASCADE, ON UPDATE CASCADE
**Índices:** `idx_cliente_dni`

---

## 3. Tabla `administrador`

Extiende `usuario` con datos específicos del rol administrador.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `usuario_id` | INT | PK + FK a usuario(id) | ID del usuario al que extiende |
| `nivel_acceso` | ENUM | NOT NULL, DEFAULT `'total'` | `'total'`, `'lectura'` o `'edicion'`. Preparado para roles más finos |
| `creado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Fecha de alta del rol admin |

**FK:** `fk_administrador_usuario` ON DELETE CASCADE, ON UPDATE CASCADE

---

## 4. Tabla `propiedad`

Datos de la propiedad alquilada. Por ahora hay una sola fila (id=1), preparada para escalar.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre comercial. Ej: "Brisas de Calamuchita" |
| `ubicacion` | VARCHAR(150) | NOT NULL | Localidad y provincia |
| `direccion` | VARCHAR(200) | NOT NULL | Dirección completa para mapas |
| `latitud` | DECIMAL(10,7) | — | Latitud geográfica |
| `longitud` | DECIMAL(10,7) | — | Longitud geográfica |
| `descripcion` | TEXT | — | Descripción extendida |
| `precio_por_noche` | DECIMAL(10,2) | NOT NULL, > 0 | Tarifa por noche en pesos |
| `capacidad_minima` | INT | NOT NULL, DEFAULT 4 | Mínimo de huéspedes para reservar |
| `capacidad_maxima` | INT | NOT NULL, DEFAULT 10 | Máximo de huéspedes permitidos |
| `activa` | BOOLEAN | NOT NULL, DEFAULT TRUE | Si está disponible para reservas |
| `creado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Fecha de alta |
| `actualizado_en` | TIMESTAMP | NOT NULL, ON UPDATE NOW | Última modificación |

**Checks:**
- `ck_propiedad_capacidad`: capacidad_minima ≤ capacidad_maxima
- `ck_propiedad_precio`: precio_por_noche > 0

---

## 5. Tabla `reserva`

Núcleo del sistema. Una reserva vincula a un cliente con una propiedad en un rango de fechas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `cliente_id` | INT | NOT NULL, FK a cliente(usuario_id) | Cliente que hizo la reserva |
| `propiedad_id` | INT | NOT NULL, FK a propiedad(id) | Propiedad reservada |
| `admin_confirmador_id` | INT | FK a administrador(usuario_id) | Admin que confirmó (NULL hasta confirmación) |
| `fecha_ingreso` | DATE | NOT NULL | Día de check-in |
| `fecha_egreso` | DATE | NOT NULL | Día de check-out |
| `cantidad_huespedes` | INT | NOT NULL, BETWEEN 4 y 10 | Cantidad de personas (RN-04) |
| `estado` | ENUM | NOT NULL, DEFAULT `'Pendiente'` | Ver estados abajo |
| `observaciones` | TEXT | — | Notas del cliente o del admin |
| `bloqueo_hasta` | TIMESTAMP | — | Hasta cuándo se reservan las fechas (RN-02) |
| `confirmada_en` | TIMESTAMP | — | Cuándo se confirmó (NULL si nunca) |
| `creada_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Cuándo se creó la solicitud |
| `actualizada_en` | TIMESTAMP | NOT NULL, ON UPDATE NOW | Última modificación |

**Estados del campo `estado`:**

| Valor | Significado |
|---|---|
| `Pendiente` | Recién creada, esperando confirmación. Las fechas están bloqueadas |
| `Confirmada` | El admin la aprobó, el cliente puede planificar |
| `En curso` | Hoy está entre `fecha_ingreso` y `fecha_egreso` |
| `Finalizada` | Ya terminó, hoy es posterior a `fecha_egreso` |
| `Cancelada` | Cancelada por el cliente o el admin |
| `No Show` | El cliente no se presentó |

**Foreign Keys:**
- `fk_reserva_cliente` ON DELETE RESTRICT (no borrar reservas accidentalmente)
- `fk_reserva_propiedad` ON DELETE RESTRICT
- `fk_reserva_admin` ON DELETE SET NULL (si se elimina el admin, queda la reserva con el campo en NULL)

**Checks:**
- `ck_reserva_fechas`: fecha_egreso > fecha_ingreso
- `ck_reserva_huespedes`: cantidad_huespedes entre 4 y 10

**Índices:** `idx_reserva_cliente`, `idx_reserva_estado`, `idx_reserva_fechas`, `idx_reserva_bloqueo`

---

## 6. Tabla `vehiculo`

Vehículo asociado a una reserva. Máximo 1 por reserva (RN-05).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `reserva_id` | INT | NOT NULL, FK + UNIQUE | Reserva a la que pertenece. UNIQUE asegura 1 por reserva |
| `patente` | VARCHAR(15) | NOT NULL | Patente del vehículo |
| `modelo` | VARCHAR(100) | NOT NULL | Marca y modelo |
| `creado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Fecha de registro |

**FK:** `fk_vehiculo_reserva` ON DELETE CASCADE (si se borra la reserva, se borra el vehículo)
**Unique:** `uk_vehiculo_reserva` (reserva_id) — garantiza máximo 1 vehículo por reserva
**Índices:** `idx_vehiculo_patente`

---

## 7. Tabla `pago`

Estado financiero de una reserva. Una reserva tiene 0 o 1 pago.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `reserva_id` | INT | NOT NULL, FK + UNIQUE | Reserva asociada |
| `estado_pago` | ENUM | NOT NULL, DEFAULT `'Seña pendiente'` | Ver estados abajo |
| `monto_sena` | DECIMAL(10,2) | DEFAULT 0, ≥ 0 | Monto de la seña |
| `monto_total` | DECIMAL(10,2) | NOT NULL, ≥ 0 | Monto total de la reserva |
| `metodo` | VARCHAR(50) | — | Transferencia, Mercado Pago, Efectivo, etc. |
| `observaciones` | TEXT | — | Notas |
| `registrado_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Cuándo se registró el pago |
| `actualizado_en` | TIMESTAMP | NOT NULL, ON UPDATE NOW | Última modificación |

**Estados del campo `estado_pago`:**

| Valor | Significado |
|---|---|
| `Seña pendiente` | Todavía no se recibió la seña |
| `Seña recibida` | La seña fue cobrada, falta el resto |
| `Pago total recibido` | Pagó todo por adelantado |
| `Pago en efectivo al ingreso` | El cliente paga al llegar |

**FK:** `fk_pago_reserva` ON DELETE CASCADE
**Unique:** `uk_pago_reserva` (reserva_id)
**Check:** `ck_pago_montos`: monto_total ≥ 0 AND monto_sena ≥ 0

---

## 8. Tabla `notificacion`

Historial de todas las notificaciones por email que dispara el sistema (RN-09).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único |
| `reserva_id` | INT | NOT NULL, FK a reserva(id) | Reserva que generó la notificación |
| `tipo` | ENUM | NOT NULL | Tipo de evento (ver abajo) |
| `destinatario_email` | VARCHAR(150) | NOT NULL | Email de destino (al momento del envío) |
| `asunto` | VARCHAR(200) | NOT NULL | Asunto del email |
| `cuerpo` | TEXT | NOT NULL | Cuerpo del email (texto plano o HTML simple) |
| `estado_envio` | ENUM | NOT NULL, DEFAULT `'pendiente'` | `'pendiente'`, `'enviada'`, `'fallida'` |
| `intentos` | INT | NOT NULL, DEFAULT 0 | Cantidad de intentos de envío |
| `error_ultimo_intento` | TEXT | — | Mensaje de error si falló el último intento |
| `creada_en` | TIMESTAMP | NOT NULL, DEFAULT NOW | Cuándo se generó |
| `enviada_en` | TIMESTAMP | — | Cuándo se envió efectivamente (NULL si nunca) |

**Tipos de notificación:**

| Tipo | Cuándo se dispara |
|---|---|
| `solicitud_recibida` | El cliente acaba de crear la solicitud |
| `reserva_confirmada` | El admin confirmó la reserva |
| `reserva_cancelada` | Se canceló (por cliente, admin o expiración) |
| `reserva_finalizada` | Se completó la estadía |
| `bloqueo_vencido` | Pasaron 2hs sin confirmar y se canceló automáticamente |

**FK:** `fk_notificacion_reserva` ON DELETE CASCADE
**Índices:** `idx_notificacion_estado`, `idx_notificacion_tipo`, `idx_notificacion_creada`

---

## Mapa de relaciones

```
usuario (1) ──┬── (0..1) cliente
              └── (0..1) administrador

cliente (1) ───────── (0..*) reserva
administrador (1) ─── (0..*) reserva (como confirmador)
propiedad (1) ─────── (0..*) reserva

reserva (1) ── (0..1) vehiculo
reserva (1) ── (0..1) pago
reserva (1) ── (0..*) notificacion
```

---

## Reglas de negocio implementadas en BD

| ID | Regla | Implementación |
|---|---|---|
| RN-01 | No solapamiento de reservas pendientes/confirmadas | Lógica en la capa de aplicación (queries con BETWEEN) |
| RN-02 | Bloqueo de 2hs al crear pendiente | Campo `bloqueo_hasta` en reserva |
| RN-03 | Vencido el bloqueo, pasa a Cancelada | Cron job en la capa de aplicación lee `idx_reserva_bloqueo` |
| RN-04 | Cantidad entre 4 y 10 | `ck_reserva_huespedes` CHECK constraint |
| RN-05 | Máximo 1 vehículo por reserva | `uk_vehiculo_reserva` UNIQUE constraint |
| RN-06 | Solo admin confirma | Validación en la capa de aplicación (rol del usuario logueado) |
| RN-07 | Cliente solo cancela las suyas en estado P/C | Validación en la capa de aplicación |
| RN-08 | Check-in/out solo lo registra admin | Validación en la capa de aplicación |
| RN-09 | Cada cambio de estado dispara notificación | Tabla `notificacion` registra historial completo |
| RN-10 | Fecha_ingreso debe ser futura al crear | Validación en la capa de aplicación + middleware |

---

## Modelo de eliminaciones (ON DELETE)

| Padre | Hijo | Acción | Razón |
|---|---|---|---|
| usuario → cliente | CASCADE | Si se borra el usuario, se borra su rol cliente |
| usuario → administrador | CASCADE | Igual que cliente |
| cliente → reserva | RESTRICT | No se puede borrar un cliente con reservas (proteger historial) |
| propiedad → reserva | RESTRICT | Igual que cliente |
| administrador → reserva | SET NULL | Si se elimina al admin, la reserva queda con campo NULL pero sigue existiendo |
| reserva → vehiculo | CASCADE | Si se borra la reserva, su vehículo también |
| reserva → pago | CASCADE | Igual que vehículo |
| reserva → notificacion | CASCADE | Igual que vehículo |

---

> **Última actualización:** Bloque 2 — Diseño de la base de datos
