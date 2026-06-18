// =============================================================
//   COMPONENTE — GALERÍA DE LA CASA
// =============================================================
//   Muestra las fotos reales de la propiedad en tres bloques:
//   1. Postales destacadas (grid de 6 fotos en aspect vertical)
//   2. Marquee infinito (carrusel autoplay del resto)
//   3. Botón "Ver las {n} fotos" → lightbox con grid completa
//
//   Todas las fotos viven en /public/casa/ y se referencian
//   con paths absolutos (/casa/01.jpg, /casa/02.jpg, etc.)
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

// -------------------------------------------------------------
//   Lista de fotos disponibles en /public/casa/
//   (Generadas con el script optimizar-fotos.mjs)
// -------------------------------------------------------------
const TODAS_LAS_FOTOS = [
  '/casa/01.jpg', '/casa/02.jpg', '/casa/03.jpg', '/casa/04.jpg', '/casa/05.jpg',
  '/casa/06.jpg', '/casa/07.jpg', '/casa/08.jpg', '/casa/09.jpg', '/casa/10.jpg',
  '/casa/11.jpg', '/casa/12.jpg', '/casa/13.jpg', '/casa/14.jpg', '/casa/15.jpg',
  '/casa/16.jpg', '/casa/17.jpg', '/casa/18.jpg', '/casa/19.jpg', '/casa/20.jpg',
  '/casa/21.jpg', '/casa/22.jpg', '/casa/23.jpg', '/casa/24.jpg', '/casa/25.jpg',
  '/casa/26.jpg', '/casa/27.jpg', '/casa/28.jpg', '/casa/29.jpg', '/casa/30.jpg',
];

// Las primeras 6 fotos van en la grilla de postales destacadas
const DESTACADAS = TODAS_LAS_FOTOS.slice(0, 6);
// El resto va al marquee infinito (duplicado para loop visual continuo)
const RESTANTES = TODAS_LAS_FOTOS.slice(6);

export default function GaleriaCasa() {
  // Lightbox: si es null no esta abierto, si es numero es el indice de la foto activa
  const [indiceActivo, setIndiceActivo] = useState(null);
  const cerrar = useCallback(() => setIndiceActivo(null), []);
  const anterior = useCallback(() => {
    setIndiceActivo((i) => (i === null ? null : (i - 1 + TODAS_LAS_FOTOS.length) % TODAS_LAS_FOTOS.length));
  }, []);
  const siguiente = useCallback(() => {
    setIndiceActivo((i) => (i === null ? null : (i + 1) % TODAS_LAS_FOTOS.length));
  }, []);

  // Manejo de teclado en lightbox (ESC, flechas)
  useEffect(() => {
    if (indiceActivo === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'ArrowRight') siguiente();
    };
    window.addEventListener('keydown', onKey);
    // Bloquear scroll del body mientras el lightbox esta abierto
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [indiceActivo, cerrar, anterior, siguiente]);

  return (
    <section id="fotos" className="max-w-7xl mx-auto px-6 py-20">
      {/* ===== Título de la sección ===== */}
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">
          La casa
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-piedra-900 max-w-2xl">
          Cada rincón, pensado para <span className="italic text-musgo-700">quedarse</span>
        </h2>
      </div>

      {/* ===== A — Postales destacadas (grid de 6) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        {DESTACADAS.map((src, i) => (
          <motion.button
            key={src}
            type="button"
            onClick={() => setIndiceActivo(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="group relative aspect-[3/4] overflow-hidden rounded-organico bg-musgo-100 focus:outline-none focus:ring-2 focus:ring-terracota-500"
          >
            <img
              src={src}
              alt={`Brisas de Calamuchita — foto ${i + 1}`}
              loading={i < 3 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay suave terracota en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-piedra-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
        ))}
      </div>

      {/* ===== B — Marquee infinito (carrousel autoplay) ===== */}
      {RESTANTES.length > 0 && (
        <div
          className="relative -mx-6 md:-mx-0 overflow-hidden mb-8"
          // CSS local para pausar el marquee al hacer hover sobre el contenedor.
          // Como Tailwind no expone animation-play-state por defecto, usamos
          // un <style> scoped al componente.
        >
          <style>{`
            .grupo-marquee:hover { animation-play-state: paused; }
          `}</style>

          {/* Sombras de borde (fade-in/out laterales) */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-crema-100 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-crema-100 to-transparent z-10" />

          <div className="grupo-marquee flex gap-4 animate-marquee w-max">
            {/* Lista duplicada x2 para loop continuo sin parpadeo */}
            {[...RESTANTES, ...RESTANTES].map((src, i) => {
              const indiceReal = (i % RESTANTES.length) + 6;
              return (
                <button
                  key={`marquee-${i}`}
                  type="button"
                  onClick={() => setIndiceActivo(indiceReal)}
                  className="relative flex-shrink-0 w-[180px] md:w-[260px] aspect-[3/4] rounded-organico overflow-hidden bg-musgo-100 focus:outline-none focus:ring-2 focus:ring-terracota-500"
                  aria-label={`Ver foto ${indiceReal + 1}`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== C — Botón "Ver las N fotos" ===== */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIndiceActivo(0)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-capsula bg-musgo-700 text-crema-50 hover:bg-musgo-800 transition-colors font-cuerpo text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-terracota-500 focus:ring-offset-2 focus:ring-offset-crema-100"
        >
          <Images size={18} />
          Ver las {TODAS_LAS_FOTOS.length} fotos
        </button>
      </div>

      {/* ===== Lightbox ===== */}
      <AnimatePresence>
        {indiceActivo !== null && (
          <Lightbox
            fotos={TODAS_LAS_FOTOS}
            indice={indiceActivo}
            onCerrar={cerrar}
            onAnterior={anterior}
            onSiguiente={siguiente}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// -------------------------------------------------------------
//   LIGHTBOX — vista grande con navegacion
// -------------------------------------------------------------
function Lightbox({ fotos, indice, onCerrar, onAnterior, onSiguiente }) {
  const total = fotos.length;
  const src = fotos[indice];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-piedra-900/95 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos"
      onClick={onCerrar}
    >
      {/* Botón cerrar */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onCerrar(); }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 rounded-full bg-crema-50/10 hover:bg-crema-50/20 text-crema-50 transition-colors"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      {/* Contador */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 text-crema-50/70 text-sm font-cuerpo">
        {indice + 1} / {total}
      </div>

      {/* Botón anterior */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAnterior(); }}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-crema-50/10 hover:bg-crema-50/20 text-crema-50 transition-colors"
        aria-label="Foto anterior"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Imagen activa */}
      <motion.img
        key={src}
        src={src}
        alt={`Brisas de Calamuchita — foto ${indice + 1}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="max-w-[88vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Botón siguiente */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSiguiente(); }}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-crema-50/10 hover:bg-crema-50/20 text-crema-50 transition-colors"
        aria-label="Foto siguiente"
      >
        <ChevronRight size={28} />
      </button>
    </motion.div>
  );
}
