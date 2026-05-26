import { MapPin, Phone, Instagram, Mail } from 'lucide-react';

// Datos de contacto fijos del footer.
// No vienen del backend porque son metadatos del negocio
// que no cambian con frecuencia.
const DIRECCION = 'Malvinas Argentinas 189, X5196 Santa Rosa de Calamuchita, Córdoba';
const URL_MAPA = 'https://www.google.com/maps/place/Malvinas+Argentinas+189,+X5196+Santa+Rosa+de+Calamuchita,+C%C3%B3rdoba';
const TELEFONO_DISPLAY = '+54 9 3546 52-8237';
const TELEFONO_WA = 'https://wa.me/5493546528237';
const EMAIL = 'brisasdecalamuchita@gmail.com';

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-crema-200 bg-crema-50/60">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-xl text-musgo-700 mb-3">Brisas de Calamuchita</h3>
          <p className="text-sm text-piedra-700 leading-relaxed max-w-xs">
            Una casa serrana para encuentros que importan. A dos cuadras del río, en el corazón
            de Calamuchita.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-piedra-700 mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-piedra-800">
            <li>
              <a
                href={URL_MAPA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-musgo-700 transition-colors group"
              >
                <MapPin size={14} className="text-musgo-600 mt-0.5 flex-shrink-0" />
                <span>
                  {DIRECCION}
                  <span className="text-musgo-500 ml-1 group-hover:text-musgo-700">↗</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={TELEFONO_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-musgo-700 transition-colors"
              >
                <Phone size={14} className="text-musgo-600" /> {TELEFONO_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 hover:text-musgo-700 transition-colors"
              >
                <Mail size={14} className="text-musgo-600" /> {EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram size={14} className="text-musgo-600" /> @brisascalamuchita
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-piedra-700 mb-4">La propiedad</h4>
          <ul className="space-y-2 text-sm text-piedra-800">
            <li>3 habitaciones · 8 camas</li>
            <li>Capacidad 4 a 10 personas</li>
            <li>Amplio jardín y 2 asadores</li>
            <li>A 2 cuadras del río</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-crema-200 py-5 text-center text-xs text-piedra-600">
        © {new Date().getFullYear()} Brisas de Calamuchita · Proyecto Integrador IFTS N°29
      </div>
    </footer>
  );
}
