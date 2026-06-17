// =============================================================
//   Modal — wrapper base con overlay y portal
// =============================================================
//   Maneja:
//   - Overlay oscuro con click-fuera-para-cerrar
//   - Escape para cerrar
//   - Focus trap basico (focus inicial en el contenedor)
//   - Bloqueo del scroll del body cuando esta abierto
//   - Animacion de entrada (fade + slide)
// =============================================================

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ abierto, onCerrar, children, anchoMax = 'max-w-md' }) {
  const refContenedor = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    function alPresionarTecla(e) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [abierto, onCerrar]);

  // Bloquear scroll del body
  useEffect(() => {
    if (!abierto) return;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [abierto]);

  // Focus inicial en el contenedor
  useEffect(() => {
    if (abierto && refContenedor.current) {
      refContenedor.current.focus();
    }
  }, [abierto]);

  if (!abierto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4
                 bg-piedra-900/60 backdrop-blur-sm
                 animate-in fade-in duration-200"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={refContenedor}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${anchoMax} bg-crema-100 rounded-xl shadow-2xl
                    border border-piedra-200/40
                    animate-in fade-in slide-in-from-bottom-4 duration-200
                    outline-none`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
