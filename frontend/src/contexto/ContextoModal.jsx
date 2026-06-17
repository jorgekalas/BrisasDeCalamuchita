// =============================================================
//   ContextoModal — provider global de modales
// =============================================================
//   Reemplaza window.confirm/alert/prompt con modales estilizados.
//
//   Expone tres metodos via useModal():
//     - confirmar(mensaje, opciones) -> Promise<boolean>
//     - alertar(mensaje, opciones)   -> Promise<void>
//     - preguntar(mensaje, opciones) -> Promise<string|null>
// =============================================================

import { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../componentes/Modal';

const ContextoModal = createContext(null);

export function useModal() {
  const ctx = useContext(ContextoModal);
  if (!ctx) {
    throw new Error('useModal debe usarse dentro de <ProveedorModal>');
  }
  return ctx;
}

export function ProveedorModal({ children }) {
  const [config, setConfig] = useState(null);

  const cerrar = useCallback((resultado) => {
    if (config?.resolve) config.resolve(resultado);
    setConfig(null);
  }, [config]);

  const confirmar = useCallback((mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      setConfig({
        tipo: 'confirmar',
        mensaje,
        titulo: opciones.titulo || 'Confirmar',
        textoConfirmar: opciones.textoConfirmar || 'Confirmar',
        textoCancelar: opciones.textoCancelar || 'Cancelar',
        variante: opciones.variante || 'primaria',
        resolve,
      });
    });
  }, []);

  const alertar = useCallback((mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      setConfig({
        tipo: 'alertar',
        mensaje,
        titulo: opciones.titulo,
        textoConfirmar: opciones.textoConfirmar || 'Entendido',
        variante: opciones.variante || 'info',
        resolve,
      });
    });
  }, []);

  const preguntar = useCallback((mensaje, opciones = {}) => {
    return new Promise((resolve) => {
      setConfig({
        tipo: 'preguntar',
        mensaje,
        titulo: opciones.titulo || 'Ingresar valor',
        placeholder: opciones.placeholder || '',
        valorInicial: opciones.valorInicial || '',
        textoConfirmar: opciones.textoConfirmar || 'Aceptar',
        textoCancelar: opciones.textoCancelar || 'Cancelar',
        resolve,
      });
    });
  }, []);

  return (
    <ContextoModal.Provider value={{ confirmar, alertar, preguntar }}>
      {children}
      <ContenidoModal config={config} alCerrar={cerrar} />
    </ContextoModal.Provider>
  );
}


// -------------------------------------------------------------
//   Contenido del modal (cambia segun el tipo)
// -------------------------------------------------------------
function ContenidoModal({ config, alCerrar }) {
  // input controlado para el modo "preguntar"
  const [valor, setValor] = useState(config?.valorInicial || '');

  // resetear el input cuando cambia la config
  // (cada vez que se abre un modal de tipo "preguntar")
  if (config && config.tipo === 'preguntar' && valor === '' && config.valorInicial) {
    setValor(config.valorInicial);
  }

  if (!config) return null;

  // Tonos del titulo segun variante (solo aplica a alertar/confirmar)
  const colorTitulo = {
    primaria: 'text-musgo-700',
    destructiva: 'text-red-700',
    exito: 'text-musgo-700',
    error: 'text-red-700',
    advertencia: 'text-amber-700',
    info: 'text-piedra-900',
  }[config.variante] || 'text-piedra-900';

  // Estilos del boton principal segun variante
  const claseBotonPrimario = {
    primaria: 'bg-musgo-700 hover:bg-musgo-800 text-white',
    destructiva: 'bg-red-600 hover:bg-red-700 text-white',
    exito: 'bg-musgo-700 hover:bg-musgo-800 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    advertencia: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-musgo-700 hover:bg-musgo-800 text-white',
  }[config.variante] || 'bg-musgo-700 hover:bg-musgo-800 text-white';

  function alConfirmar() {
    if (config.tipo === 'preguntar') {
      alCerrar(valor);
      setValor('');
    } else if (config.tipo === 'confirmar') {
      alCerrar(true);
    } else {
      alCerrar();
    }
  }

  function alCancelar() {
    if (config.tipo === 'preguntar') {
      alCerrar(null);
      setValor('');
    } else if (config.tipo === 'confirmar') {
      alCerrar(false);
    } else {
      alCerrar();
    }
  }

  return (
    <Modal abierto={!!config} onCerrar={alCancelar}>
      <div className="px-6 py-5">
        {config.titulo && (
          <h2 className={`font-display text-2xl font-semibold mb-3 ${colorTitulo}`}>
            {config.titulo}
          </h2>
        )}

        <p className="text-piedra-900 mb-5 leading-relaxed">
          {config.mensaje}
        </p>

        {config.tipo === 'preguntar' && (
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && alConfirmar()}
            placeholder={config.placeholder}
            autoFocus
            className="w-full px-3 py-2 mb-5 rounded-lg
                       border border-piedra-300 bg-white
                       text-piedra-900 placeholder-piedra-400
                       focus:outline-none focus:ring-2 focus:ring-musgo-500
                       focus:border-musgo-500"
          />
        )}

        <div className="flex gap-3 justify-end">
          {(config.tipo === 'confirmar' || config.tipo === 'preguntar') && (
            <button
              onClick={alCancelar}
              className="px-4 py-2 rounded-lg font-medium
                         bg-piedra-200 hover:bg-piedra-300 text-piedra-900
                         transition-colors"
            >
              {config.textoCancelar}
            </button>
          )}
          <button
            onClick={alConfirmar}
            autoFocus={config.tipo !== 'preguntar'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${claseBotonPrimario}`}
          >
            {config.textoConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}
