-- =============================================================
--   BRISAS DE CALAMUCHITA — SEEDS (datos iniciales)
--   Semilla 001: propiedad, usuarios y reservas de prueba
-- =============================================================
--   Las contraseñas de los usuarios de demo son todas: demo1234
--   El hash bcrypt fue generado con cost 10:
--     $2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK
--
--   Las reservas tienen fechas absolutas en 2026 para que la demo
--   sea 100% reproducible. La fecha "presente" simulada es
--   alrededor de mediados de mayo 2026.
-- =============================================================

USE brisas_de_calamuchita;


-- =============================================================
--   PROPIEDAD
-- =============================================================
INSERT INTO propiedad (
  id, nombre, ubicacion, direccion, latitud, longitud,
  descripcion, precio_por_noche, capacidad_minima, capacidad_maxima, activa
) VALUES (
  1,
  'Brisas de Calamuchita',
  'Santa Rosa de Calamuchita, Córdoba',
  'Malvinas Argentinas 189, X5196 Santa Rosa de Calamuchita, Córdoba',
  -32.073353, -64.538835,
  'Casa serrana para grupos y familias. A dos cuadras del río, rodeada de árboles, con todo lo necesario para desconectarse del mundo durante unos días.',
  85000.00, 4, 10, TRUE
);


-- =============================================================
--   USUARIOS
-- =============================================================
-- 1 administrador + 12 clientes que se usaran en las reservas.
-- Password para todos: demo1234

-- Administrador
INSERT INTO usuario (id, email, password_hash, nombre, apellido, telefono, tipo) VALUES
  (1, ' brisasdecalamuchita@gmail.com',
   '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
   'Jorge', 'Kalas', '+54 9 11 5555 0000', 'administrador');

INSERT INTO administrador (usuario_id, nivel_acceso) VALUES
  (1, 'total');

-- Clientes
INSERT INTO usuario (id, email, password_hash, nombre, apellido, telefono, tipo) VALUES
  (2,  'maria@ejemplo.com',     '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'María',       'Fernández', '+54 9 351 555 1234', 'cliente'),
  (3,  'mperez@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Miguel',      'Pérez',     '+54 9 351 555 1111', 'cliente'),
  (4,  'romero@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Familia',     'Romero',    '+54 9 11 5555 2222', 'cliente'),
  (5,  'sanchez@ejemplo.com',   '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Grupo',       'Sánchez',   '+54 9 351 555 3333', 'cliente'),
  (6,  'gomez@ejemplo.com',     '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Familia',     'Gómez',     '+54 9 11 4444 4444', 'cliente'),
  (7,  'r.rodriguez@ejemplo.com','$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Grupo',       'Rodríguez', '+54 9 351 555 7777', 'cliente'),
  (8,  'torres@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Familia',     'Torres',    '+54 9 351 555 6666', 'cliente'),
  (9,  'alvarez@ejemplo.com',   '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Grupo',       'Álvarez',   '+54 9 11 6666 7777', 'cliente'),
  (10, 'jlopez@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Familia',     'López',     '+54 9 11 4444 5555', 'cliente'),
  (11, 'cmendez@ejemplo.com',   '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Carlos',      'Méndez',    '+54 9 351 555 8888', 'cliente'),
  (12, 'lvega@ejemplo.com',     '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Luciana',     'Vega',      '+54 9 11 7777 8888', 'cliente'),
  (13, 'dcastro@ejemplo.com',   '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Diego',       'Castro',    '+54 9 351 555 2020', 'cliente'),
  (14, 'ibanez@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Familia',     'Ibáñez',    '+54 9 11 3232 4545', 'cliente'),
  (15, 'pquiroga@ejemplo.com',  '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Patricia',    'Quiroga',   '+54 9 351 555 9090', 'cliente'),
  (16, 'fmolinari@ejemplo.com', '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Federico',    'Molinari',  '+54 9 11 8181 7272', 'cliente'),
  (17, 'aaguilar@ejemplo.com',  '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Andrea',      'Aguilar',   '+54 9 351 555 6363', 'cliente'),
  (18, 'rsilva@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Ricardo',     'Silva',     '+54 9 11 5454 3232', 'cliente'),
  (19, 'mfunes@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Mariana',     'Funes',     '+54 9 351 555 4747', 'cliente'),
  (20, 'sortiz@ejemplo.com',    '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Sofía',       'Ortiz',     '+54 9 11 9898 6565', 'cliente'),
  (21, 'gpaz@ejemplo.com',      '$2b$10$DOugbEVcmuvRnZq3lYrP8OGtQydm88V8396Wz4F3hRsBOE6BtJuIK',
       'Grupo',       'Paz',       '+54 9 351 555 2828', 'cliente');

INSERT INTO cliente (usuario_id, dni, fecha_nacimiento) VALUES
  ( 2, '32145678', '1988-03-15'),
  ( 3, '28456789', '1982-07-20'),
  ( 4, '35987654', '1990-11-08'),
  ( 5, '29876543', '1984-05-22'),
  ( 6, '33567890', '1989-09-14'),
  ( 7, '31234567', '1986-02-28'),
  ( 8, '34678901', '1991-06-10'),
  ( 9, '30123456', '1985-12-03'),
  (10, '36789012', '1992-04-17'),
  (11, '27890123', '1981-08-25'),
  (12, '35234567', '1990-01-30'),
  (13, '33456789', '1988-10-12'),
  (14, '29345678', '1983-03-07'),
  (15, '34567890', '1991-07-19'),
  (16, '32678901', '1987-11-26'),
  (17, '36123456', '1993-05-04'),
  (18, '28567890', '1982-09-15'),
  (19, '35345678', '1990-02-21'),
  (20, '37234567', '1994-06-08'),
  (21, '33890123', '1989-12-30');


-- =============================================================
--   RESERVAS (30 distribuidas en 2026)
-- =============================================================
-- Distribución:
--   * 15 finalizadas (enero a abril 2026)
--   * 3 en curso o muy recientes (mayo 2026)
--   * 7 pendientes futuras
--   * 4 confirmadas futuras
--   * 1 cancelada (caso real)
-- =============================================================

-- ----- FINALIZADAS (enero a abril 2026) -----
INSERT INTO reserva (
  id, cliente_id, propiedad_id, admin_confirmador_id,
  fecha_ingreso, fecha_egreso, cantidad_huespedes, estado,
  observaciones, confirmada_en, creada_en
) VALUES
  -- Enero
  ( 1,  3, 1, 1, '2026-01-05', '2026-01-12', 8, 'Finalizada',
    'Vacaciones de verano.',           '2025-12-20 10:00:00', '2025-12-15 14:30:00'),
  ( 2,  4, 1, 1, '2026-01-20', '2026-01-27', 6, 'Finalizada',
    NULL,                              '2026-01-05 11:00:00', '2026-01-02 09:15:00'),
  -- Febrero
  ( 3,  5, 1, 1, '2026-02-14', '2026-02-17', 5, 'Finalizada',
    'Fin de semana largo de Carnaval.','2026-02-02 16:00:00', '2026-01-30 18:45:00'),
  ( 4, 15, 1, 1, '2026-02-21', '2026-02-25', 6, 'Finalizada',
    'Cumpleaños sorpresa.',            '2026-02-10 12:00:00', '2026-02-05 10:20:00'),
  -- Marzo
  ( 5,  6, 1, 1, '2026-03-21', '2026-03-29', 7, 'Finalizada',
    NULL,                              '2026-03-05 14:00:00', '2026-03-01 11:00:00'),
  ( 6, 16, 1, 1, '2026-03-07', '2026-03-10', 4, 'Finalizada',
    'Escapada de fin de semana.',      '2026-02-25 09:30:00', '2026-02-22 17:00:00'),
  -- Abril
  ( 7,  7, 1, 1, '2026-04-10', '2026-04-15', 5, 'Finalizada',
    'Festejo de aniversario.',         '2026-03-25 11:00:00', '2026-03-20 15:30:00'),
  ( 8,  8, 1, 1, '2026-04-25', '2026-04-30', 4, 'Finalizada',
    NULL,                              '2026-04-10 10:00:00', '2026-04-05 12:15:00'),
  ( 9, 17, 1, 1, '2026-04-02', '2026-04-06', 6, 'Finalizada',
    'Semana Santa.',                   '2026-03-20 13:00:00', '2026-03-18 09:45:00'),
  (10, 18, 1, 1, '2026-04-17', '2026-04-22', 8, 'Finalizada',
    'Viaje familiar.',                 '2026-04-02 14:30:00', '2026-03-28 11:30:00'),
  -- Mayo (recientes, finalizadas)
  (11,  9, 1, 1, '2026-05-01', '2026-05-05', 6, 'Finalizada',
    'Día del Trabajador.',             '2026-04-18 09:00:00', '2026-04-15 16:00:00'),
  (12, 19, 1, 1, '2026-05-08', '2026-05-11', 5, 'Finalizada',
    NULL,                              '2026-04-25 10:30:00', '2026-04-22 14:00:00'),

  -- ----- FUTURAS CONFIRMADAS -----
  (13,  2, 1, 1, '2026-05-30', '2026-06-04', 6, 'Confirmada',
    'Llegamos por la tarde. Viajamos con un perro pequeño.',
                                       '2026-05-12 11:00:00', '2026-05-10 09:30:00'),
  (14, 14, 1, 1, '2026-12-26', '2027-01-02', 9, 'Confirmada',
    'Fin de año en familia. Cruce de año en la casa.',
                                       '2026-05-10 14:00:00', '2026-05-08 16:45:00'),
  (15, 20, 1, 1, '2026-07-25', '2026-07-30', 7, 'Confirmada',
    'Vacaciones de invierno.',         '2026-05-13 10:00:00', '2026-05-09 11:20:00'),
  (16,  4, 1, 1, '2026-10-12', '2026-10-15', 5, 'Confirmada',
    'Día de la Diversidad Cultural.',  '2026-05-14 15:00:00', '2026-05-11 13:30:00'),

  -- ----- FUTURAS PENDIENTES (esperan confirmación del admin) -----
  (17, 10, 1, NULL, '2026-06-12', '2026-06-17', 8, 'Pendiente',
    'Viajan con dos abuelos. Necesitan habitación en planta baja si es posible.',
    NULL, '2026-05-14 18:00:00'),
  (18, 11, 1, NULL, '2026-07-10', '2026-07-20', 10, 'Pendiente',
    'Vacaciones de invierno con la familia extendida.',
    NULL, '2026-05-13 20:30:00'),
  (19, 12, 1, NULL, '2026-08-08', '2026-08-15', 6, 'Pendiente',
    NULL,
    NULL, '2026-05-12 19:15:00'),
  (20, 13, 1, NULL, '2026-09-19', '2026-09-22', 5, 'Pendiente',
    'Fin de semana del Día del Estudiante.',
    NULL, '2026-05-11 17:45:00'),
  (21, 15, 1, NULL, '2026-11-21', '2026-11-25', 6, 'Pendiente',
    'Día de la Soberanía.',
    NULL, '2026-05-10 21:00:00'),
  (22, 16, 1, NULL, '2026-06-27', '2026-07-04', 8, 'Pendiente',
    'Comienzo de las vacaciones de invierno.',
    NULL, '2026-05-09 16:30:00'),
  (23, 21, 1, NULL, '2026-08-22', '2026-08-26', 7, 'Pendiente',
    'Grupo de amigos. Aniversario de la promo del secundario.',
    NULL, '2026-05-08 22:15:00'),

  -- ----- FUTURAS PENDIENTES MÁS RECIENTES -----
  (24, 17, 1, NULL, '2026-11-07', '2026-11-10', 4, 'Pendiente',
    'Escapada romántica de aniversario.',
    NULL, '2026-05-07 14:00:00'),
  (25, 18, 1, NULL, '2026-10-25', '2026-10-30', 6, 'Pendiente',
    NULL,
    NULL, '2026-05-06 11:30:00'),

  -- ----- CONFIRMADAS A LARGO PLAZO -----
  (26,  3, 1, 1, '2026-09-05', '2026-09-12', 8, 'Confirmada',
    'Vacaciones de primavera.',
                                       '2026-05-05 10:00:00', '2026-05-03 09:00:00'),
  (27,  5, 1, 1, '2026-08-01', '2026-08-05', 5, 'Confirmada',
    NULL,
                                       '2026-05-04 12:30:00', '2026-05-02 15:45:00'),

  -- ----- UNA CANCELADA (caso real) -----
  (28,  6, 1, 1, '2026-06-05', '2026-06-08', 4, 'Cancelada',
    'Cancelada por problemas personales del cliente.',
                                       '2026-05-01 09:00:00', '2026-04-28 19:30:00'),

  -- ----- DOS RESERVAS MUY RECIENTES (en estados intermedios) -----
  (29, 19, 1, NULL, '2026-06-21', '2026-06-24', 4, 'Pendiente',
    'Día del Padre.',
    NULL, '2026-05-05 20:00:00'),
  (30, 20, 1, 1, '2026-07-09', '2026-07-13', 8, 'Confirmada',
    'Vacaciones de invierno escolares.',
                                       '2026-05-13 16:00:00', '2026-05-11 18:30:00');


-- =============================================================
--   VEHICULOS (la mayoria de reservas tiene auto)
-- =============================================================
INSERT INTO vehiculo (reserva_id, patente, modelo) VALUES
  ( 1, 'AA111BB', 'Volkswagen Suran'),
  ( 2, 'BB222CC', 'Chevrolet Spin'),
  ( 3, 'CC333DD', 'Toyota Hilux'),
  ( 5, 'DD444EE', 'Renault Kangoo'),
  ( 6, 'KL111MN', 'Ford EcoSport'),
  ( 7, 'CD555EF', 'Ford Focus'),
  ( 8, 'EE555FF', 'Peugeot 208'),
  ( 9, 'NO222PQ', 'Chevrolet Cruze'),
  (10, 'PQ333RS', 'Renault Sandero'),
  (11, 'FF666GG', 'Toyota Corolla'),
  (12, 'RS444TU', 'Volkswagen Gol Trend'),
  (13, 'AB123CD', 'Toyota Etios'),
  (14, 'JJ000KK', 'Toyota SW4'),
  (15, 'TU555VW', 'Renault Duster'),
  (16, 'VW666XY', 'Fiat Cronos'),
  (17, 'XY987ZW', 'Renault Duster'),
  (18, 'GG777HH', 'Fiat Toro'),
  (19, 'HH888II', 'Citroën C3'),
  (20, 'II999JJ', 'Volkswagen Gol'),
  (22, 'YZ777AB', 'Peugeot 308'),
  (23, 'AB888CD', 'Chevrolet Tracker'),
  (25, 'CD999EF', 'Ford Ka'),
  (26, 'EF111GH', 'Toyota Etios'),
  (27, 'GH222IJ', 'Volkswagen T-Cross'),
  (30, 'IJ333KL', 'Chevrolet Onix');
-- Las reservas 4, 21, 24, 28, 29 no tienen vehiculo asociado
-- (clientes que vienen sin auto, RN-05 lo permite).


-- =============================================================
--   PAGOS (estado financiero de las reservas)
-- =============================================================
-- Cálculo del monto_total: noches × precio_por_noche
INSERT INTO pago (reserva_id, estado_pago, monto_sena, monto_total, metodo) VALUES
  ( 1, 'Pago total recibido', 297500.00,  595000.00, 'Transferencia'),  -- 7 noches
  ( 2, 'Pago total recibido', 297500.00,  595000.00, 'Transferencia'),  -- 7 noches
  ( 3, 'Pago total recibido', 127500.00,  255000.00, 'Mercado Pago'),   -- 3 noches
  ( 4, 'Pago total recibido', 170000.00,  340000.00, 'Transferencia'),  -- 4 noches
  ( 5, 'Pago total recibido', 340000.00,  680000.00, 'Transferencia'),  -- 8 noches
  ( 6, 'Pago total recibido', 127500.00,  255000.00, 'Efectivo'),       -- 3 noches
  ( 7, 'Pago total recibido', 212500.00,  425000.00, 'Mercado Pago'),   -- 5 noches
  ( 8, 'Pago total recibido', 212500.00,  425000.00, 'Transferencia'),  -- 5 noches
  ( 9, 'Pago total recibido', 170000.00,  340000.00, 'Transferencia'),  -- 4 noches
  (10, 'Pago total recibido', 212500.00,  425000.00, 'Transferencia'),  -- 5 noches
  (11, 'Pago total recibido', 170000.00,  340000.00, 'Mercado Pago'),   -- 4 noches
  (12, 'Pago total recibido', 127500.00,  255000.00, 'Transferencia'),  -- 3 noches
  -- Confirmadas: seña recibida, pago total pendiente
  (13, 'Seña recibida',       212500.00,  425000.00, 'Transferencia'),  -- 5 noches
  (14, 'Seña recibida',       297500.00,  595000.00, 'Transferencia'),  -- 7 noches
  (15, 'Seña recibida',       212500.00,  425000.00, 'Mercado Pago'),   -- 5 noches
  (16, 'Seña recibida',       127500.00,  255000.00, 'Transferencia'),  -- 3 noches
  (26, 'Seña recibida',       297500.00,  595000.00, 'Transferencia'),  -- 7 noches
  (27, 'Seña recibida',       170000.00,  340000.00, 'Mercado Pago'),   -- 4 noches
  (30, 'Seña recibida',       170000.00,  340000.00, 'Transferencia'),  -- 4 noches
  -- Cancelada: registramos para auditoria, monto_sena devuelto
  (28, 'Seña pendiente',           0.00,  255000.00, NULL);             -- 3 noches
-- Las pendientes (17-25, 29) todavia no tienen pago registrado.


-- =============================================================
--   NOTIFICACIONES (historial)
-- =============================================================
-- Insertamos una notificacion por cada reserva no pendiente
-- (en produccion estas las generan los servicios al cambiar estado).
INSERT INTO notificacion (
  reserva_id, tipo, destinatario_email, asunto, cuerpo,
  estado_envio, intentos, creada_en, enviada_en
) VALUES
  -- Confirmaciones de las reservas finalizadas
  ( 1, 'reserva_confirmada', 'mperez@ejemplo.com',
    'Tu reserva en Brisas de Calamuchita fue confirmada',
    'Hola Miguel, te confirmamos tu reserva del 5 al 12 de enero de 2026. ¡Te esperamos!',
    'enviada', 1, '2025-12-20 10:01:00', '2025-12-20 10:01:05'),
  ( 2, 'reserva_confirmada', 'romero@ejemplo.com',
    'Tu reserva en Brisas de Calamuchita fue confirmada',
    'Hola Familia Romero, confirmada tu reserva del 20 al 27 de enero de 2026.',
    'enviada', 1, '2026-01-05 11:01:00', '2026-01-05 11:01:03'),
  (13, 'solicitud_recibida', 'maria@ejemplo.com',
    'Recibimos tu solicitud de reserva',
    'Hola María, recibimos tu solicitud para las fechas 30/05 al 04/06. Te confirmamos en breve.',
    'enviada', 1, '2026-05-10 09:31:00', '2026-05-10 09:31:08'),
  (13, 'reserva_confirmada', 'maria@ejemplo.com',
    'Tu reserva en Brisas de Calamuchita fue confirmada',
    'Hola María, te confirmamos la reserva del 30 de mayo al 4 de junio de 2026.',
    'enviada', 1, '2026-05-12 11:01:00', '2026-05-12 11:01:04'),
  (14, 'solicitud_recibida', 'ibanez@ejemplo.com',
    'Recibimos tu solicitud de reserva',
    'Hola Familia Ibáñez, recibimos tu solicitud para fin de año 2026.',
    'enviada', 1, '2026-05-08 16:46:00', '2026-05-08 16:46:11'),
  (14, 'reserva_confirmada', 'ibanez@ejemplo.com',
    'Tu reserva en Brisas de Calamuchita fue confirmada',
    'Hola Familia Ibáñez, confirmada tu estadía de fin de año 26/12 al 02/01.',
    'enviada', 1, '2026-05-10 14:01:00', '2026-05-10 14:01:07'),
  -- Notificaciones recientes (pendientes y confirmadas de mayo)
  (17, 'solicitud_recibida', 'jlopez@ejemplo.com',
    'Recibimos tu solicitud de reserva',
    'Hola Familia López, recibimos tu solicitud para el 12 al 17 de junio. Te respondemos en breve.',
    'enviada', 1, '2026-05-14 18:01:00', '2026-05-14 18:01:09'),
  (18, 'solicitud_recibida', 'cmendez@ejemplo.com',
    'Recibimos tu solicitud de reserva',
    'Hola Carlos, recibimos tu solicitud para vacaciones de invierno.',
    'enviada', 1, '2026-05-13 20:31:00', '2026-05-13 20:31:06'),
  -- Una notificacion fallida (caso de prueba)
  (28, 'reserva_cancelada', 'gomez@ejemplo.com',
    'Tu reserva en Brisas de Calamuchita fue cancelada',
    'Hola Familia Gómez, confirmamos la cancelación de tu reserva del 5 al 8 de junio.',
    'fallida', 3, '2026-05-01 09:02:00', NULL);


-- =============================================================
--   FIN DE LOS DATOS DE PRUEBA
-- =============================================================
--   Resumen:
--     * 1 propiedad
--     * 1 administrador + 20 clientes
--     * 30 reservas (12 finalizadas + 7 confirmadas + 10 pendientes + 1 cancelada)
--     * 25 vehiculos (5 reservas sin auto)
--     * 20 pagos
--     * 9 notificaciones (8 exitosas + 1 fallida)
-- =============================================================
