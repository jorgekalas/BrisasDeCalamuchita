import { MapPin, Phone, Mail, Instagram } from 'lucide-react';
import { propiedad } from '../datos/mock';

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
                href={propiedad.urlMapa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-musgo-700 transition-colors group"
              >
                <MapPin size={14} className="text-musgo-600 mt-0.5 flex-shrink-0" />
                <span>
                  {propiedad.direccion}
                  <span className="text-musgo-500 ml-1 group-hover:text-musgo-700">↗</span>
                </span>
              </a>
            </li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-musgo-600" /> +54 9 354 555 9999</li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-musgo-600" /> hola@brisascalamuchita.com.ar</li>
            <li className="flex items-center gap-2"><Instagram size={14} className="text-musgo-600" /> @brisascalamuchita</li>
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
