import { createContext, useContext, useState, useCallback } from 'react';
import { reservasIniciales, usuarios, ESTADOS } from './datos/mock';
import { generarIdReserva } from './utilidades/formato';

/**
 * Contexto global de la app para la DEMO.
 * Mantiene en memoria: usuario logueado, listado de reservas y notificaciones.
 * Cuando llegue el Bloque 11, esto se reemplaza por llamadas reales al backend.
 */
const ContextoApp = createContext(null);

export const ProveedorApp = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [reservas, setReservas] = useState(reservasIniciales);
  const [notificaciones, setNotificaciones] = useState([]);

  // --- Autenticación simulada ---
  const iniciarSesion = useCallback((email) => {
    const u = usuarios.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (u) {
      setUsuario(u);
      return { ok: true, usuario: u };
    }
    return { ok: false, error: 'Usuario no encontrado' };
  }, []);

  const cerrarSesion = useCallback(() => setUsuario(null), []);

  // --- Reservas ---
  const crearReserva = useCallback(
    (datos) => {
      // Separamos telefonoContacto (campo del formulario) del resto
      const { telefonoContacto, ...resto } = datos;
      const nueva = {
        id: generarIdReserva(),
        usuarioId: usuario?.id || 1,
        nombreCliente: usuario?.nombre || datos.nombreCliente,
        emailCliente: usuario?.email || datos.emailCliente,
        // El teléfono del formulario tiene prioridad sobre el del perfil
        telefonoCliente: telefonoContacto || usuario?.telefono || '',
        ...resto,
        estado: ESTADOS.PENDIENTE,
        estadoPago: 'Seña pendiente',
        creadaEn: new Date().toISOString().split('T')[0],
      };
      setReservas((prev) => [nueva, ...prev]);
      agregarNotificacion({
        para: nueva.emailCliente,
        asunto: 'Recibimos tu solicitud de reserva',
        cuerpo: `Hola ${nueva.nombreCliente}, recibimos tu solicitud (${nueva.id}). Bloqueamos las fechas por 2 horas mientras la revisamos. Te avisaremos por email apenas la confirmemos.`,
      });
      return nueva;
    },
    [usuario]
  );

  const cambiarEstadoReserva = useCallback((id, nuevoEstado) => {
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
    );
    const reserva = reservas.find((r) => r.id === id);
    if (reserva) {
      const mensajes = {
        [ESTADOS.CONFIRMADA]: {
          asunto: '¡Tu reserva fue confirmada!',
          cuerpo: `Hola ${reserva.nombreCliente}, confirmamos tu reserva ${reserva.id}. ¡Te esperamos en Brisas de Calamuchita!`,
        },
        [ESTADOS.CANCELADA]: {
          asunto: 'Reserva cancelada',
          cuerpo: `Hola ${reserva.nombreCliente}, tu reserva ${reserva.id} fue cancelada.`,
        },
      };
      const msg = mensajes[nuevoEstado];
      if (msg) agregarNotificacion({ para: reserva.emailCliente, ...msg });
    }
  }, [reservas]);

  // --- Notificaciones (email simulado) ---
  const agregarNotificacion = useCallback((notif) => {
    setNotificaciones((prev) => [
      { id: Date.now(), enviadaEn: new Date(), ...notif },
      ...prev,
    ]);
  }, []);

  const valor = {
    usuario,
    iniciarSesion,
    cerrarSesion,
    reservas,
    crearReserva,
    cambiarEstadoReserva,
    notificaciones,
  };

  return <ContextoApp.Provider value={valor}>{children}</ContextoApp.Provider>;
};

export const useApp = () => {
  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error('useApp debe usarse dentro de ProveedorApp');
  return ctx;
};
