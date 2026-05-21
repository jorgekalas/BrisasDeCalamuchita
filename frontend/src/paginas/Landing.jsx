import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApi } from '../ganchos/useApi';
import * as apiPropiedad from '../api/propiedad';
import { enriquecerPropiedad, propiedadDefault } from '../datos/propiedadConDefaults';
import { ArrowRight, Users, Bed, BedDouble, Bath, Flame, Wifi, Car, PawPrint, ChefHat, Tv, MapPin, Star } from 'lucide-react';

const ICONOS = { Users, Bed, BedDouble, Bath, Flame, Wifi, Car, PawPrint, ChefHat, Tv };

export default function Landing() {
  // Cargar propiedad del backend. Mientras carga (o si hay error)
  // usamos los defaults para que la UI no se vea vacia.
  const { datos } = useApi(() => apiPropiedad.listarPropiedades(), []);
  const propiedad = datos && datos[0]
    ? enriquecerPropiedad(datos[0])
    : propiedadDefault;

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Decoración orgánica de fondo */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-musgo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-40 w-[400px] h-[400px] rounded-full bg-terracota-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
          {/* Texto */}
          <div className="lg:col-span-6 z-10">
            <motion.a
              href={propiedad.urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-capsula bg-musgo-100 text-musgo-700 text-xs font-medium mb-6 hover:bg-musgo-200 transition-colors group"
              title="Ver en Google Maps"
            >
              <MapPin size={14} /> Santa Rosa de Calamuchita · Córdoba
              <span className="text-musgo-500 group-hover:text-musgo-700 transition-colors">↗</span>
            </motion.a>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-piedra-900 mb-6"
            >
              Tu lugar entre <span className="italic text-musgo-700">sierras</span> y
              <span className="block text-terracota-600 italic">silencio.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-piedra-700 leading-relaxed max-w-lg mb-8"
            >
              Una casa serrana pensada para grupos y familias. A dos cuadras del río,
              rodeada de árboles, con todo lo necesario para desconectarse durante unos días.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/disponibilidad" className="btn-principal">
                Ver disponibilidad <ArrowRight size={18} />
              </Link>
              <a href="#fotos" className="btn-fantasma">Conocer la casa</a>
            </motion.div>

            {/* Mini-stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-md"
            >
              <div>
                <div className="font-display text-3xl text-musgo-700">4–10</div>
                <div className="text-xs text-piedra-600 uppercase tracking-widest mt-1">huéspedes</div>
              </div>
              <div>
                <div className="font-display text-3xl text-musgo-700">2 <span className="text-base">asadores</span></div>
                <div className="text-xs text-piedra-600 uppercase tracking-widest mt-1">amplio patio</div>
              </div>
              <div>
                <div className="font-display text-3xl text-musgo-700 flex items-center gap-1">
                  4.9 <Star size={20} className="fill-terracota-500 text-terracota-500" />
                </div>
                <div className="text-xs text-piedra-600 uppercase tracking-widest mt-1">huéspedes felices</div>
              </div>
            </motion.div>
          </div>

          {/* Imagen hero — composición asimétrica */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative aspect-[4/5] rounded-organico overflow-hidden elevado con-grano"
            >
              <img
                src={propiedad.fotos[0]}
                alt="Brisas de Calamuchita"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Tarjeta flotante de precio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-crema-50 rounded-organico p-5 shadow-calido border border-crema-200/60 max-w-xs animate-flotar"
            >
              <div className="text-xs text-piedra-600 uppercase tracking-widest">Desde</div>
              <div className="font-display text-3xl text-musgo-800">$85.000<span className="text-sm text-piedra-600 font-cuerpo">/noche</span></div>
              <div className="text-xs text-piedra-700 mt-1">para hasta 10 personas</div>
            </motion.div>

            {/* Círculo decorativo */}
            <div className="absolute -top-8 -right-4 w-24 h-24 rounded-full bg-terracota-400/80" />
          </div>
        </div>
      </section>

      {/* ===== CARACTERÍSTICAS ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Lo que vas a encontrar</div>
          <h2 className="font-display text-4xl md:text-5xl text-piedra-900">
            Pensada para que <span className="italic text-musgo-700">no te falte nada</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 escalonar">
          {propiedad.caracteristicas.map((c, i) => {
            const Icono = ICONOS[c.icono];
            return (
              <div
                key={i}
                className="tarjeta flex flex-col items-start gap-3 hover:shadow-calido hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-musgo-100 text-musgo-700 flex items-center justify-center">
                  {Icono && <Icono size={22} />}
                </div>
                <div className="text-sm text-piedra-800 leading-snug">{c.texto}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FOTOS ===== */}
      <section id="fotos" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">La casa</div>
          <h2 className="font-display text-4xl md:text-5xl text-piedra-900 max-w-2xl">
            Cada rincón, pensado para <span className="italic text-musgo-700">quedarse</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 md:row-span-2 aspect-square md:aspect-auto rounded-organico overflow-hidden con-grano">
            <img src={propiedad.fotos[1]} alt="Living" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-square rounded-organico overflow-hidden con-grano">
            <img src={propiedad.fotos[2]} alt="Cocina" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-square rounded-organico overflow-hidden con-grano">
            <img src={propiedad.fotos[3]} alt="Habitación" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* ===== UBICACIÓN ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Dónde estamos</div>
            <h2 className="font-display text-4xl md:text-5xl text-piedra-900 mb-4">
              En el <span className="italic text-musgo-700">corazón</span> del Valle
            </h2>
            <p className="text-piedra-700 leading-relaxed mb-6">
              A apenas dos cuadras del río y a pocos minutos a pie del centro de Santa Rosa.
              La ubicación ideal para descansar sin perderte nada.
            </p>
            <div className="space-y-2 mb-6 text-sm text-piedra-800">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-musgo-700 mt-0.5 flex-shrink-0" />
                <span>{propiedad.direccion}</span>
              </div>
            </div>
            <a
              href={propiedad.urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fantasma"
            >
              <MapPin size={16} /> Ver en Google Maps
            </a>
          </div>

          <div className="lg:col-span-3 relative">
            <div className="rounded-organico overflow-hidden elevado con-grano aspect-[4/3] bg-musgo-100">
              <iframe
                src={propiedad.urlMapaEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Brisas de Calamuchita en Google Maps"
              />
            </div>
            {/* Círculo decorativo */}
            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-terracota-400/80 -z-0" />
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative bg-musgo-800 rounded-organico overflow-hidden con-grano p-12 md:p-20 text-center">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-terracota-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-musgo-400/20 blur-3xl" />

          <h2 className="relative font-display text-4xl md:text-5xl text-crema-50 mb-4">
            ¿Ya tenés fecha?
          </h2>
          <p className="relative text-crema-200 max-w-lg mx-auto mb-8 leading-relaxed">
            Consultá la disponibilidad y solicitá tu reserva en menos de dos minutos.
            Te confirmamos en el día.
          </p>
          <Link to="/disponibilidad" className="relative btn-principal !bg-terracota-500 hover:!bg-terracota-400">
            Ver disponibilidad <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
