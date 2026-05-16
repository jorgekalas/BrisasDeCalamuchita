/**
 * Datos simulados (mock) — Brisas de Calamuchita
 * --------------------------------------------------------------
 * Estos datos representan lo que más adelante vendrá del backend.
 * Se usan en la DEMO del Sub-bloque 2A para que el frontend
 * funcione sin depender de la API real (todavía no construida).
 *
 * Cuando llegue el Bloque 11, este archivo se reemplaza por
 * llamadas a `servicios/api.js`.
 */

// --- Información de la propiedad ---------------------------------
export const propiedad = {
  id: 1,
  nombre: 'Brisas de Calamuchita',
  ubicacion: 'Santa Rosa de Calamuchita, Córdoba',
  direccion: 'Malvinas Argentinas 189, X5196 Santa Rosa de Calamuchita, Córdoba',
  coordenadas: { lat: -32.073353, lng: -64.538835 },
  // URL de Google Maps para abrir en pestaña nueva
  urlMapa: 'https://www.google.com/maps/place/Malvinas+Argentinas+189,+X5196+Santa+Rosa+de+Calamuchita,+C%C3%B3rdoba',
  // URL embebida del iframe (la del usuario)
  urlMapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d845.2120601340315!2d-64.53883553036108!3d-32.073353161962146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2bb5006eaef15%3A0x8422c633f4d05fb2!2sMalvinas%20Argentinas%20189%2C%20X5196%20Santa%20Rosa%20de%20Calamuchita%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1778873986680!5m2!1ses!2sar',
  descripcion:
    'Una casa serrana pensada para grupos y familias. A cinco minutos del río (apenas dos cuadras), rodeada de árboles, con todo lo necesario para desconectarse del mundo durante unos días.',
  capacidadMinima: 4,
  capacidadMaxima: 10,
  precioPorNoche: 85000,
  caracteristicas: [
    { icono: 'Users', texto: 'Capacidad para 4 a 10 personas' },
    { icono: 'Bed', texto: '3 habitaciones · 2 camas dobles y 6 simples' },
    { icono: 'Bath', texto: '2 baños completos' },
    { icono: 'Flame', texto: 'Asadores y amplio patio con mesa' },
    { icono: 'PawPrint', texto: 'Pet friendly · tu mascota es bienvenida' },
    { icono: 'ChefHat', texto: 'Cocina equipada · heladera con freezer' },
    { icono: 'BedDouble', texto: 'Ropa de cama incluida' },
    { icono: 'Tv', texto: 'TV por cable y calefacción' },
    { icono: 'Wifi', texto: 'Wi-Fi en toda la casa' },
    { icono: 'Car', texto: 'Cochera para 1 vehículo' },
  ],
  fotos: [
    // Imágenes placeholder de Unsplash con foco en casas serranas / hospedaje cálido
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  ],
};

// --- Usuarios de prueba ------------------------------------------
export const usuarios = [
  {
    id: 1,
    nombre: 'María Fernández',
    email: 'maria@ejemplo.com',
    rol: 'cliente',
    telefono: '+54 9 351 555 1234',
  },
  {
    id: 2,
    nombre: 'Administrador',
    email: 'admin@brisas.com.ar',
    rol: 'administrador',
    telefono: '+54 9 354 555 9999',
  },
];

// --- Estados posibles de una reserva -----------------------------
export const ESTADOS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  NO_SHOW: 'No Show',
};

// --- Reservas existentes (para el calendario y panel admin) ------
// Las fechas son absolutas (no relativas a "hoy") para que la demo sea
// 100% consistente sin importar cuándo se la mira.
// "Hoy" en la demo es 15 de mayo de 2026.

export const reservasIniciales = [
  // ===== RESERVAS FINALIZADAS (pasadas, distribuidas a lo largo del año) =====
  {
    id: 'RES-2026-0001',
    usuarioId: 1,
    nombreCliente: 'Grupo Pérez',
    emailCliente: 'mperez@ejemplo.com',
    telefonoCliente: '+54 9 351 555 1111',
    fechaIngreso: '2026-01-05',
    fechaEgreso: '2026-01-12',
    cantidadHuespedes: 8,
    vehiculo: { patente: 'AA111BB', modelo: 'VW Suran' },
    observaciones: 'Vacaciones de verano.',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2025-12-15',
  },
  {
    id: 'RES-2026-0002',
    usuarioId: 1,
    nombreCliente: 'Familia Romero',
    emailCliente: 'romero@ejemplo.com',
    telefonoCliente: '+54 9 11 5555 2222',
    fechaIngreso: '2026-01-20',
    fechaEgreso: '2026-01-27',
    cantidadHuespedes: 6,
    vehiculo: { patente: 'BB222CC', modelo: 'Chevrolet Spin' },
    observaciones: '',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-01-02',
  },
  {
    id: 'RES-2026-0008',
    usuarioId: 1,
    nombreCliente: 'Grupo Sánchez',
    emailCliente: 'sanchez@ejemplo.com',
    telefonoCliente: '+54 9 351 555 3333',
    fechaIngreso: '2026-02-14',
    fechaEgreso: '2026-02-17',
    cantidadHuespedes: 5,
    vehiculo: { patente: 'CC333DD', modelo: 'Toyota Hilux' },
    observaciones: 'Fin de semana largo de Carnaval.',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-01-30',
  },
  {
    id: 'RES-2026-0012',
    usuarioId: 1,
    nombreCliente: 'Familia Gómez',
    emailCliente: 'gomez@ejemplo.com',
    telefonoCliente: '+54 9 11 4444 4444',
    fechaIngreso: '2026-03-21',
    fechaEgreso: '2026-03-29',
    cantidadHuespedes: 7,
    vehiculo: { patente: 'DD444EE', modelo: 'Renault Kangoo' },
    observaciones: '',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-03-01',
  },
  {
    id: 'RES-2026-0015',
    usuarioId: 1,
    nombreCliente: 'Grupo Rodríguez',
    emailCliente: 'r.rodriguez@ejemplo.com',
    telefonoCliente: '+54 9 351 555 7777',
    fechaIngreso: '2026-04-10',
    fechaEgreso: '2026-04-15',
    cantidadHuespedes: 5,
    vehiculo: { patente: 'CD555EF', modelo: 'Ford Focus' },
    observaciones: 'Festejo de aniversario.',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-03-20',
  },
  {
    id: 'RES-2026-0017',
    usuarioId: 1,
    nombreCliente: 'Familia Torres',
    emailCliente: 'torres@ejemplo.com',
    telefonoCliente: '+54 9 351 555 6666',
    fechaIngreso: '2026-04-25',
    fechaEgreso: '2026-04-30',
    cantidadHuespedes: 4,
    vehiculo: { patente: 'EE555FF', modelo: 'Peugeot 208' },
    observaciones: '',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-04-05',
  },
  {
    id: 'RES-2026-0019',
    usuarioId: 1,
    nombreCliente: 'Grupo Álvarez',
    emailCliente: 'alvarez@ejemplo.com',
    telefonoCliente: '+54 9 11 6666 7777',
    fechaIngreso: '2026-05-01',
    fechaEgreso: '2026-05-05',
    cantidadHuespedes: 6,
    vehiculo: { patente: 'FF666GG', modelo: 'Toyota Corolla' },
    observaciones: 'Día del Trabajador.',
    estado: ESTADOS.FINALIZADA,
    estadoPago: 'Pago total recibido',
    creadaEn: '2026-04-15',
  },

  // ===== RESERVAS FUTURAS — CONFIRMADAS =====
  {
    id: 'RES-2026-0021',
    usuarioId: 1,
    nombreCliente: 'María Fernández',
    emailCliente: 'maria@ejemplo.com',
    telefonoCliente: '+54 9 351 555 1234',
    fechaIngreso: '2026-05-30',
    fechaEgreso: '2026-06-04',
    cantidadHuespedes: 6,
    vehiculo: { patente: 'AB123CD', modelo: 'Toyota Etios' },
    observaciones: 'Llegamos por la tarde. Viajamos con un perro pequeño.',
    estado: ESTADOS.CONFIRMADA,
    estadoPago: 'Seña recibida',
    creadaEn: '2026-05-10',
  },

  // ===== RESERVAS FUTURAS — PENDIENTES (las que el admin puede confirmar) =====
  {
    id: 'RES-2026-0022',
    usuarioId: 1,
    nombreCliente: 'Familia López',
    emailCliente: 'jlopez@ejemplo.com',
    telefonoCliente: '+54 9 11 4444 5555',
    fechaIngreso: '2026-06-12',
    fechaEgreso: '2026-06-17',
    cantidadHuespedes: 8,
    vehiculo: { patente: 'XY987ZW', modelo: 'Renault Duster' },
    observaciones: 'Viajan con dos abuelos. Necesitan habitación en planta baja si es posible.',
    estado: ESTADOS.PENDIENTE,
    estadoPago: 'Seña pendiente',
    creadaEn: '2026-05-14',
  },
  {
    id: 'RES-2026-0023',
    usuarioId: 1,
    nombreCliente: 'Carlos Méndez',
    emailCliente: 'cmendez@ejemplo.com',
    telefonoCliente: '+54 9 351 555 8888',
    fechaIngreso: '2026-07-10',
    fechaEgreso: '2026-07-20',
    cantidadHuespedes: 10,
    vehiculo: { patente: 'GG777HH', modelo: 'Fiat Toro' },
    observaciones: 'Vacaciones de invierno con la familia extendida.',
    estado: ESTADOS.PENDIENTE,
    estadoPago: 'Seña pendiente',
    creadaEn: '2026-05-13',
  },
  {
    id: 'RES-2026-0024',
    usuarioId: 1,
    nombreCliente: 'Luciana Vega',
    emailCliente: 'lvega@ejemplo.com',
    telefonoCliente: '+54 9 11 7777 8888',
    fechaIngreso: '2026-08-08',
    fechaEgreso: '2026-08-15',
    cantidadHuespedes: 6,
    vehiculo: { patente: 'HH888II', modelo: 'Citroën C3' },
    observaciones: '',
    estado: ESTADOS.PENDIENTE,
    estadoPago: 'Seña pendiente',
    creadaEn: '2026-05-12',
  },
  {
    id: 'RES-2026-0025',
    usuarioId: 1,
    nombreCliente: 'Diego Castro',
    emailCliente: 'dcastro@ejemplo.com',
    telefonoCliente: '+54 9 351 555 2020',
    fechaIngreso: '2026-09-19',
    fechaEgreso: '2026-09-22',
    cantidadHuespedes: 5,
    vehiculo: { patente: 'II999JJ', modelo: 'Volkswagen Gol' },
    observaciones: 'Fin de semana del Día del Estudiante.',
    estado: ESTADOS.PENDIENTE,
    estadoPago: 'Seña pendiente',
    creadaEn: '2026-05-11',
  },
  {
    id: 'RES-2026-0026',
    usuarioId: 1,
    nombreCliente: 'Familia Ibáñez',
    emailCliente: 'ibanez@ejemplo.com',
    telefonoCliente: '+54 9 11 3232 4545',
    fechaIngreso: '2026-12-26',
    fechaEgreso: '2027-01-02',
    cantidadHuespedes: 9,
    vehiculo: { patente: 'JJ000KK', modelo: 'Toyota SW4' },
    observaciones: 'Fin de año en familia. Cruce de año en la casa.',
    estado: ESTADOS.CONFIRMADA,
    estadoPago: 'Seña recibida',
    creadaEn: '2026-05-08',
  },
];

// --- Helper: obtener rangos de fechas ocupadas para el calendario ---
export const obtenerFechasOcupadas = (reservas) => {
  const fechas = [];
  reservas
    .filter((r) => r.estado === ESTADOS.CONFIRMADA || r.estado === ESTADOS.PENDIENTE)
    .forEach((r) => {
      const inicio = new Date(r.fechaIngreso);
      const fin = new Date(r.fechaEgreso);
      const cursor = new Date(inicio);
      while (cursor <= fin) {
        fechas.push({
          fecha: cursor.toISOString().split('T')[0],
          estado: r.estado,
          reservaId: r.id,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    });
  return fechas;
};

/**
 * Calcula el "estado efectivo" de una reserva considerando la fecha actual.
 * Si una reserva confirmada ya terminó, debe verse como Finalizada;
 * si está en curso (hoy entre ingreso y egreso), se ve como "En curso".
 * Esto evita inconsistencias cuando los datos del mock son fijos pero
 * el calendario del usuario avanza.
 */
export const estadoEfectivo = (reserva) => {
  if (reserva.estado === ESTADOS.CANCELADA || reserva.estado === ESTADOS.NO_SHOW) {
    return reserva.estado;
  }
  if (reserva.estado === ESTADOS.PENDIENTE) {
    // Si una pendiente ya pasó su fecha de ingreso, se cancela
    const hoy = new Date().toISOString().split('T')[0];
    if (reserva.fechaIngreso < hoy) return ESTADOS.CANCELADA;
    return ESTADOS.PENDIENTE;
  }
  // Confirmada o Finalizada: calculamos según fechas
  const hoy = new Date().toISOString().split('T')[0];
  if (reserva.fechaEgreso < hoy) return ESTADOS.FINALIZADA;
  if (reserva.fechaIngreso <= hoy && hoy <= reserva.fechaEgreso) return ESTADOS.EN_CURSO;
  return ESTADOS.CONFIRMADA;
};

