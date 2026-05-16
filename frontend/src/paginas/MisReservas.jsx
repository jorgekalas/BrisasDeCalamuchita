import { Link } from 'react-router-dom';
import { useApp } from '../ContextoApp';
import { formatearFecha, formatearFechaConAnio, calcularNoches } from '../utilidades/formato';
import { Calendar, Users, Car, Phone } from 'lucide-react';

const BADGE = {
  'Pendiente': 'badge-pendiente',
  'Confirmada': 'badge-confirmada',
  'En curso': 'badge-en-curso',
  'Finalizada': 'badge-finalizada',
  'Cancelada': 'badge-cancelada',
};

export default function MisReservas() {
  const { usuario, reservas } = useApp();
  if (!usuario) return null;

  const mias = reservas.filter((r) => r.emailCliente === usuario.email || r.usuarioId === usuario.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Tu historial</div>
        <h1 className="font-display text-4xl md:text-5xl text-piedra-900">
          Mis <span className="italic text-musgo-700">reservas</span>
        </h1>
      </div>

      {mias.length === 0 ? (
        <div className="tarjeta text-center py-16">
          <p className="text-piedra-700 mb-6">Todavía no tenés reservas.</p>
          <Link to="/disponibilidad" className="btn-principal">Ver disponibilidad</Link>
        </div>
      ) : (
        <div className="space-y-4 escalonar">
          {mias.map((r) => (
            <div key={r.id} className="tarjeta hover:shadow-calido transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs font-mono text-piedra-600 mb-1">{r.id}</div>
                  <div className="font-display text-xl text-piedra-900">
                    {formatearFecha(r.fechaIngreso)} → {formatearFechaConAnio(r.fechaEgreso)}
                  </div>
                  <div className="text-xs text-piedra-600">
                    {calcularNoches(r.fechaIngreso, r.fechaEgreso)} noches
                  </div>
                </div>
                <span className={`badge ${BADGE[r.estado]}`}>{r.estado}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-piedra-700">
                <div className="flex items-center gap-2"><Users size={14} className="text-musgo-700" /> {r.cantidadHuespedes} huéspedes</div>
                {r.vehiculo?.patente && (
                  <div className="flex items-center gap-2"><Car size={14} className="text-musgo-700" /> {r.vehiculo.modelo} · {r.vehiculo.patente}</div>
                )}
                <div className="flex items-center gap-2"><Calendar size={14} className="text-musgo-700" /> Estado de pago: <strong>{r.estadoPago}</strong></div>
              </div>

              {r.telefonoCliente && (
                <div className="mt-3 pt-3 border-t border-crema-200 flex items-center gap-2 text-xs text-piedra-700">
                  <Phone size={12} className="text-musgo-700" />
                  Te contactaremos al <strong className="text-piedra-900">{r.telefonoCliente}</strong> para coordinar la seña
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
