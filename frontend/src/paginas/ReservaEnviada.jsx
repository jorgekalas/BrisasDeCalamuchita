import { Link, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as apiReservas from '../api/reservas';
import { extraerError } from '../api/cliente';
import { formatearFechaConAnio } from '../utilidades/formato';
import { Check, Mail, Clock, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Pantalla "Reserva enviada".
 * Muestra confirmacion visual despues de crear la reserva.
 *
 * Fuente de datos en orden de prioridad:
 *   1. location.state.reserva (la pasa Reservar.jsx al navegar) — instantanea
 *   2. GET /api/reservas/:id (fallback si el usuario refresca la pagina) — async
 */
export default function ReservaEnviada() {
  const { id } = useParams();
  const location = useLocation();

  const [reserva, setReserva] = useState(location.state?.reserva || null);
  const [cargando, setCargando] = useState(!reserva);
  const [error, setError] = useState(null);

  // Si no vino reserva por state, la buscamos al backend
  useEffect(() => {
    if (reserva) return;
    apiReservas.obtenerReserva(id)
      .then((r) => setReserva(r))
      .catch((err) => setError(extraerError(err)))
      .finally(() => setCargando(false));
  }, [id, reserva]);

  if (cargando) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center text-piedra-700 text-sm">
        Cargando reserva...
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-red-100 text-red-600 items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h1 className="font-display text-2xl text-piedra-900 mb-2">No encontramos la reserva</h1>
        <p className="text-sm text-piedra-700 mb-6">
          {error?.mensaje || 'La reserva solicitada no existe o no tenés permisos para verla.'}
        </p>
        <Link to="/" className="btn-principal">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.7 }}
        className="w-20 h-20 rounded-full bg-musgo-100 flex items-center justify-center mx-auto mb-8"
      >
        <Check size={40} className="text-musgo-700" strokeWidth={3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-4xl md:text-5xl text-piedra-900 mb-3">
          ¡Solicitud <span className="italic text-musgo-700">enviada</span>!
        </h1>
        <p className="text-piedra-700 max-w-md mx-auto leading-relaxed">
          Recibimos tu pedido. Bloqueamos las fechas y te vamos a confirmar
          por email en menos de 2 horas.
        </p>
      </motion.div>

      {/* Detalle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="tarjeta mb-8"
      >
        <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Número de solicitud</div>
        <div className="font-mono text-2xl text-musgo-800 mb-6">#{reserva.id}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Ingreso</div>
            <div className="font-medium">{formatearFechaConAnio(reserva.fecha_ingreso)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Egreso</div>
            <div className="font-medium">{formatearFechaConAnio(reserva.fecha_egreso)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Huéspedes</div>
            <div className="font-medium">{reserva.cantidad_huespedes}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Estado</div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                {reserva.estado}
              </span>
            </div>
          </div>
        </div>

        {reserva.vehiculo && (
          <div className="mt-4 pt-4 border-t border-crema-200">
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Vehículo</div>
            <div className="font-medium text-sm">
              {reserva.vehiculo.modelo} <span className="text-piedra-600">({reserva.vehiculo.patente})</span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-crema-200 flex items-center gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-xl">
          <Clock size={16} />
          <span>Fechas bloqueadas por 2 horas mientras revisamos tu solicitud</span>
        </div>
      </motion.div>

      {/* Aviso de email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="border-2 border-dashed border-musgo-300 rounded-organico p-6 bg-musgo-50/50"
      >
        <div className="flex items-start gap-3">
          <Mail size={20} className="text-musgo-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-musgo-800 mb-1">Te enviamos un email de confirmación</div>
            <div className="text-sm text-piedra-700">
              Revisá tu casilla en <span className="font-medium">{reserva.cliente?.email}</span>.
              Si no lo ves, fijate en spam o promociones.
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link to="/mis-reservas" className="btn-principal">
          Ver mis reservas <ArrowRight size={18} />
        </Link>
        <Link to="/" className="btn-fantasma">Volver al inicio</Link>
      </div>
    </div>
  );
}
