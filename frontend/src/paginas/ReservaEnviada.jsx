import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../ContextoApp';
import { formatearFecha, formatearFechaConAnio } from '../utilidades/formato';
import { Check, Mail, Clock, ArrowRight } from 'lucide-react';

/**
 * Pantalla "Reserva enviada".
 * Muestra confirmación visual + email simulado para que en la demo
 * se vea que el cliente "recibió" la notificación automática.
 */
export default function ReservaEnviada() {
  const { id } = useParams();
  const { reservas, notificaciones } = useApp();
  const reserva = reservas.find((r) => r.id === id);
  const email = notificaciones.find((n) => n.cuerpo.includes(id));

  if (!reserva) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-piedra-700">Reserva no encontrada.</p>
        <Link to="/" className="btn-principal mt-6">Volver al inicio</Link>
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
        <div className="font-mono text-2xl text-musgo-800 mb-6">{reserva.id}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Ingreso</div>
            <div className="font-medium">{formatearFechaConAnio(reserva.fechaIngreso)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Egreso</div>
            <div className="font-medium">{formatearFechaConAnio(reserva.fechaEgreso)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Huéspedes</div>
            <div className="font-medium">{reserva.cantidadHuespedes}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-piedra-600 mb-1">Estado</div>
            <div><span className="badge badge-pendiente">⏳ {reserva.estado}</span></div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-crema-200 flex items-center gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-xl">
          <Clock size={16} />
          <span>Fechas bloqueadas por 2 horas mientras revisamos tu solicitud</span>
        </div>
      </motion.div>

      {/* Email simulado — ESTO es lo que vamos a destacar en la demo */}
      {email && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="border-2 border-dashed border-musgo-300 rounded-organico p-6 bg-musgo-50/50"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-musgo-700 mb-4">
            <Mail size={14} />
            <span>Notificación enviada automáticamente</span>
          </div>
          <div className="bg-crema-50 rounded-2xl p-5 shadow-suave">
            <div className="text-xs text-piedra-600 mb-1">Para: {email.para}</div>
            <div className="font-display text-lg text-piedra-900 mb-3">{email.asunto}</div>
            <div className="text-sm text-piedra-700 leading-relaxed">{email.cuerpo}</div>
          </div>
        </motion.div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link to="/mis-reservas" className="btn-principal">
          Ver mis reservas <ArrowRight size={18} />
        </Link>
        <Link to="/" className="btn-fantasma">Volver al inicio</Link>
      </div>
    </div>
  );
}
