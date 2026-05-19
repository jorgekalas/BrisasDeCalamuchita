-- =============================================================
--   BRISAS DE CALAMUCHITA — SCHEMA DE BASE DE DATOS
--   Migracion 001: creacion inicial de tablas
-- =============================================================
--   Convenciones:
--     * Nombres en snake_case y minusculas.
--     * Tablas en singular (usuario, reserva, no usuarios/reservas).
--     * Toda tabla tiene id PK INT AUTO_INCREMENT y creado_en TIMESTAMP.
--     * Charset utf8mb4 + collation utf8mb4_unicode_ci para soportar
--       acentos, ñ y caracteres extendidos.
--     * Motor InnoDB en todas las tablas (FKs + transacciones).
-- =============================================================

-- Si la BD ya existe la dropeamos para empezar limpios.
-- En produccion NUNCA correr este DROP, solo en desarrollo.
DROP DATABASE IF EXISTS brisas_de_calamuchita;

CREATE DATABASE brisas_de_calamuchita
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE brisas_de_calamuchita;


-- =============================================================
--   1. USUARIO
-- =============================================================
-- Tabla base con datos comunes a todos los usuarios del sistema.
-- El campo `tipo` discrimina si el usuario es cliente o administrador,
-- y de ese lado se completa con la fila correspondiente en `cliente`
-- o `administrador`.
-- =============================================================
CREATE TABLE usuario (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  nombre          VARCHAR(80)  NOT NULL,
  apellido        VARCHAR(80)  NOT NULL,
  telefono        VARCHAR(30),
  tipo            ENUM('cliente', 'administrador') NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_usuario_email UNIQUE (email),
  INDEX idx_usuario_tipo (tipo),
  INDEX idx_usuario_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   2. CLIENTE
-- =============================================================
-- Extiende `usuario` con datos especificos del rol cliente.
-- usuario_id es PK y FK al mismo tiempo (1-a-1 obligatorio).
-- Si se borra el usuario, se borra en cascada.
-- =============================================================
CREATE TABLE cliente (
  usuario_id        INT NOT NULL PRIMARY KEY,
  dni               VARCHAR(20),
  fecha_nacimiento  DATE,
  creado_en         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_cliente_dni (dni)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   3. ADMINISTRADOR
-- =============================================================
-- Extiende `usuario` con datos especificos del rol administrador.
-- `nivel_acceso` queda preparado para distintos niveles en el futuro
-- (admin total, admin de solo lectura, etc.).
-- =============================================================
CREATE TABLE administrador (
  usuario_id     INT NOT NULL PRIMARY KEY,
  nivel_acceso   ENUM('total', 'lectura', 'edicion') NOT NULL DEFAULT 'total',
  creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_administrador_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   4. PROPIEDAD
-- =============================================================
-- Datos de la propiedad alquilada. Por ahora siempre hay 1 sola fila
-- (id = 1), pero la tabla esta preparada para escalar a multiples
-- propiedades en versiones futuras.
-- =============================================================
CREATE TABLE propiedad (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  ubicacion           VARCHAR(150) NOT NULL,
  direccion           VARCHAR(200) NOT NULL,
  latitud             DECIMAL(10, 7),
  longitud            DECIMAL(10, 7),
  descripcion         TEXT,
  precio_por_noche    DECIMAL(10, 2) NOT NULL,
  capacidad_minima    INT NOT NULL DEFAULT 4,
  capacidad_maxima    INT NOT NULL DEFAULT 10,
  activa              BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_propiedad_capacidad CHECK (capacidad_minima <= capacidad_maxima),
  CONSTRAINT ck_propiedad_precio CHECK (precio_por_noche > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   5. RESERVA
-- =============================================================
-- Nucleo del sistema. Una reserva vincula a un cliente con una
-- propiedad en un rango de fechas, y eventualmente con el admin
-- que la confirmo, un vehiculo y un pago.
--
-- Reglas de negocio relevantes:
--   * RN-01: no puede haber solapamiento con otras pendientes/confirmadas
--   * RN-02: cuando se crea queda con bloqueo_hasta = creada_en + 2 horas
--   * RN-03: vencido el bloqueo sin confirmar, pasa a 'Cancelada'
--   * RN-04: cantidad_huespedes debe estar entre 4 y 10
--   * RN-10: fecha_ingreso debe ser futura al crearla
-- =============================================================
CREATE TABLE reserva (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id            INT NOT NULL,
  propiedad_id          INT NOT NULL,
  admin_confirmador_id  INT,
  fecha_ingreso         DATE NOT NULL,
  fecha_egreso          DATE NOT NULL,
  cantidad_huespedes    INT NOT NULL,
  estado                ENUM('Pendiente', 'Confirmada', 'En curso', 'Finalizada', 'Cancelada', 'No Show')
                        NOT NULL DEFAULT 'Pendiente',
  observaciones         TEXT,
  bloqueo_hasta         TIMESTAMP NULL DEFAULT NULL,
  confirmada_en         TIMESTAMP NULL DEFAULT NULL,
  creada_en             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizada_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_reserva_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(usuario_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_propiedad
    FOREIGN KEY (propiedad_id) REFERENCES propiedad(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_reserva_admin
    FOREIGN KEY (admin_confirmador_id) REFERENCES administrador(usuario_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT ck_reserva_fechas CHECK (fecha_egreso > fecha_ingreso),
  CONSTRAINT ck_reserva_huespedes CHECK (cantidad_huespedes BETWEEN 4 AND 10),

  INDEX idx_reserva_cliente (cliente_id),
  INDEX idx_reserva_estado (estado),
  INDEX idx_reserva_fechas (fecha_ingreso, fecha_egreso),
  INDEX idx_reserva_bloqueo (bloqueo_hasta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   6. VEHICULO
-- =============================================================
-- Vehiculo asociado a una reserva. RN-05: max 1 por reserva
-- (se asegura con UNIQUE en reserva_id). El cliente puede no llevar
-- vehiculo (no hay fila), por eso la relacion es 0..1.
-- =============================================================
CREATE TABLE vehiculo (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id      INT NOT NULL,
  patente         VARCHAR(15) NOT NULL,
  modelo          VARCHAR(100) NOT NULL,
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehiculo_reserva
    FOREIGN KEY (reserva_id) REFERENCES reserva(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uk_vehiculo_reserva UNIQUE (reserva_id),
  INDEX idx_vehiculo_patente (patente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   7. PAGO
-- =============================================================
-- Estado financiero de una reserva. Una reserva tiene 0..1 pagos
-- (al principio no hay nada cargado, despues el admin completa
-- estado_pago segun corresponda).
-- =============================================================
CREATE TABLE pago (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id        INT NOT NULL,
  estado_pago       ENUM(
                      'Seña pendiente',
                      'Seña recibida',
                      'Pago total recibido',
                      'Pago en efectivo al ingreso'
                    ) NOT NULL DEFAULT 'Seña pendiente',
  monto_sena        DECIMAL(10, 2) DEFAULT 0,
  monto_total       DECIMAL(10, 2) NOT NULL,
  metodo            VARCHAR(50),
  observaciones     TEXT,
  registrado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_reserva
    FOREIGN KEY (reserva_id) REFERENCES reserva(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uk_pago_reserva UNIQUE (reserva_id),
  CONSTRAINT ck_pago_montos CHECK (monto_total >= 0 AND monto_sena >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   8. NOTIFICACION
-- =============================================================
-- Historial de todas las notificaciones por email que dispara el
-- sistema. Cada cambio de estado relevante en una reserva genera
-- una fila aca (RN-09). Si el envio falla queda registrado para
-- poder reintentar.
-- =============================================================
CREATE TABLE notificacion (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id            INT NOT NULL,
  tipo                  ENUM(
                          'solicitud_recibida',
                          'reserva_confirmada',
                          'reserva_cancelada',
                          'reserva_finalizada',
                          'bloqueo_vencido'
                        ) NOT NULL,
  destinatario_email    VARCHAR(150) NOT NULL,
  asunto                VARCHAR(200) NOT NULL,
  cuerpo                TEXT NOT NULL,
  estado_envio          ENUM('pendiente', 'enviada', 'fallida') NOT NULL DEFAULT 'pendiente',
  intentos              INT NOT NULL DEFAULT 0,
  error_ultimo_intento  TEXT,
  creada_en             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enviada_en            TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_notificacion_reserva
    FOREIGN KEY (reserva_id) REFERENCES reserva(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_notificacion_estado (estado_envio),
  INDEX idx_notificacion_tipo (tipo),
  INDEX idx_notificacion_creada (creada_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--   FIN DEL SCHEMA
-- =============================================================
--   Para verificar que todo se creo correctamente:
--     mysql> USE brisas_de_calamuchita;
--     mysql> SHOW TABLES;
--     mysql> DESCRIBE reserva;
-- =============================================================
