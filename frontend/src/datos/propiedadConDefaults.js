// =============================================================
//   DATOS — PROPIEDAD CON DEFAULTS VISUALES
// =============================================================
//   El backend devuelve la propiedad con campos del NEGOCIO:
//   precio, capacidad, descripcion, lat/lng, activa.
//
//   Pero la landing necesita campos VISUALES (lista de amenities
//   con sus iconos, fotos, URL del iframe de Google Maps, etc.)
//   que no estan en la BD.
//
//   Esta funcion combina ambos: toma el JSON del backend y lo
//   enriquece con los defaults visuales del mock para que la
//   landing siga renderizando completo.
//
//   Cuando el día de mañana queramos cargar fotos y amenities
//   desde la BD, agregamos esas tablas y reemplazamos esta
//   logica por queries reales.
// =============================================================

// Defaults visuales (lo que no esta en la BD)
const DEFAULTS_VISUALES = {
  urlMapa: 'https://www.google.com/maps/place/Malvinas+Argentinas+189,+X5196+Santa+Rosa+de+Calamuchita,+C%C3%B3rdoba',
  urlMapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d845.2120601340315!2d-64.53883553036108!3d-32.073353161962146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2bb5006eaef15%3A0x8422c633f4d05fb2!2sMalvinas%20Argentinas%20189%2C%20X5196%20Santa%20Rosa%20de%20Calamuchita%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1778873986680!5m2!1ses!2sar',
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
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  ],
};


// -------------------------------------------------------------
//   enriquecerPropiedad(propiedadBackend) -> propiedad enriquecida
// -------------------------------------------------------------
//   Recibe el JSON tal cual viene del backend y devuelve el
//   shape que espera el frontend (con los campos visuales).
//
//   Acepta tanto el formato del backend (precio_por_noche,
//   capacidad_minima, etc.) como variantes camelCase para
//   compatibilidad con el mock viejo.
// -------------------------------------------------------------
export function enriquecerPropiedad(p) {
  if (!p) return null;

  return {
    id: p.id,
    nombre: p.nombre,
    ubicacion: p.ubicacion,
    direccion: p.direccion,
    descripcion: p.descripcion,

    // Campos en camelCase para el frontend (origen snake_case en BD)
    precioPorNoche: p.precio_por_noche ?? p.precioPorNoche ?? 0,
    capacidadMinima: p.capacidad_minima ?? p.capacidadMinima ?? 4,
    capacidadMaxima: p.capacidad_maxima ?? p.capacidadMaxima ?? 10,

    coordenadas: {
      lat: p.latitud ?? p.coordenadas?.lat,
      lng: p.longitud ?? p.coordenadas?.lng,
    },

    // Defaults visuales: mergea sobreescribiendo solo si el
    // backend devuelve algo
    ...DEFAULTS_VISUALES,
  };
}


// -------------------------------------------------------------
//   propiedadDefault — para mostrar mientras carga
// -------------------------------------------------------------
//   Skeleton de datos para que la UI tenga algo mientras espera
//   la respuesta del backend. Asi evitamos un flash de "datos
//   vacios" al primer render.
// -------------------------------------------------------------
export const propiedadDefault = enriquecerPropiedad({
  id: 1,
  nombre: 'Brisas de Calamuchita',
  ubicacion: 'Santa Rosa de Calamuchita, Córdoba',
  direccion: 'Malvinas Argentinas 189, X5196 Santa Rosa de Calamuchita, Córdoba',
  latitud: -32.073353,
  longitud: -64.538835,
  descripcion: 'Una casa serrana pensada para grupos y familias. A cinco minutos del río, rodeada de árboles, con todo lo necesario para desconectarse del mundo durante unos días.',
  precio_por_noche: 85000,
  capacidad_minima: 4,
  capacidad_maxima: 10,
});
