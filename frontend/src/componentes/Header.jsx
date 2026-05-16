import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../ContextoApp';
import { LogOut, User } from 'lucide-react';

/**
 * Header de la aplicación.
 * Muestra logo, navegación principal y estado de sesión.
 */
export default function Header() {
  const { usuario, cerrarSesion } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-crema-100/80 border-b border-crema-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-musgo-700 rounded-organico rotate-3 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-terracota-500 rounded-full" />
            <div className="relative h-full flex items-center justify-center text-crema-50 font-display font-bold text-xl">
              B
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg text-piedra-900">Brisas</div>
            <div className="text-xs text-piedra-700 -mt-0.5 tracking-wide">de Calamuchita</div>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={({ isActive }) =>
            `text-sm transition-colors ${isActive ? 'text-musgo-700 font-medium' : 'text-piedra-700 hover:text-musgo-700'}`
          }>
            Inicio
          </NavLink>
          <NavLink to="/disponibilidad" className={({ isActive }) =>
            `text-sm transition-colors ${isActive ? 'text-musgo-700 font-medium' : 'text-piedra-700 hover:text-musgo-700'}`
          }>
            Disponibilidad
          </NavLink>
          {usuario?.rol === 'cliente' && (
            <NavLink to="/mis-reservas" className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-musgo-700 font-medium' : 'text-piedra-700 hover:text-musgo-700'}`
            }>
              Mis reservas
            </NavLink>
          )}
          {usuario?.rol === 'administrador' && (
            <NavLink to="/admin" className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-musgo-700 font-medium' : 'text-piedra-700 hover:text-musgo-700'}`
            }>
              Panel
            </NavLink>
          )}
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-piedra-700">
                <div className="w-8 h-8 rounded-full bg-musgo-100 text-musgo-700 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="font-medium">{usuario.nombre.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-piedra-700 hover:text-terracota-600 p-2 rounded-full hover:bg-crema-200/60 transition-colors"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/ingresar" className="btn-fantasma !px-5 !py-2 text-sm">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
