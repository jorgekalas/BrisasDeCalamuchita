// =============================================================
//   SCROLL AL TOPE — al cambiar de ruta
// =============================================================
//   React Router NO hace scroll al tope automaticamente cuando
//   navega. Si veniste haciendo scroll a la mitad de una pagina
//   y haces click en un link, la siguiente pagina queda con el
//   mismo scrollY, que normalmente cae en la mitad o el footer.
//
//   Este componente escucha cambios en `location.pathname` y
//   resetea el scroll a (0, 0) en cada navegacion.
//
//   No renderiza nada, es un "componente de comportamiento".
// =============================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


export default function ScrollAlTope() {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` para que no se vea la animacion de scroll
    // (en la nueva pantalla queremos que aparezca ya arriba).
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
