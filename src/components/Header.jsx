import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import logo from "../assets/logo recortado.png";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import i18n from "../i18n";

export default function Header() {
  const { user, role, logout } = useAuth();
  const [lang, setLang] = useState("es");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  // 🔹 Cargar idioma guardado
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "es";
    setLang(i18n.language || localStorage.getItem("lang") || "es");
  }, []);

  // 🔹 Cambiar idioma
  const toggleLang = () => {
    const newLang = lang === "es" ? "en" : "es";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    i18n.changeLanguage(newLang); // ✅ sin recargar la página
};

  // 🔹 Mostrar / ocultar header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 100) {
        // Scroll hacia abajo
        setShowHeader(false);
      } else {
        // Scroll hacia arriba
        setShowHeader(true);
      }
      setLastScroll(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-wine font-semibold border-b-2 border-wine"
      : "hover:text-wineDark transition";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 text-wine shadow-md transition-transform duration-500 ease-in-out ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
      /* Acomodar el link de nuevo terminar el png cuando encontremos una mejor alternativa*/
        backgroundImage: "url('https://res.cloudinary.com/dzjupasme/image/upload/v1761097033/carjwzmi1p4embimum5j.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay translúcido */}
      {/*Acomodar de nuevo el fondo cuando encontemos una mejor alternativa bg-rose/20*/}
      <div className="absolute inset-0 bg-rose backdrop-blur-sm"></div>

      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-0 h-20">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Petit Plaisir"
            className="h-16 w-auto md:h-18 lg:h-22 transition-all duration-300"
          />
        </Link>

        {/* Botón menú móvil */}
        <button
          className="md:hidden text-wine hover:text-wineDark transition"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navegación principal (desktop) */}
        <nav className="hidden md:flex gap-5 font-medium">
          <NavLink to="/" className={linkClass}>
            {lang === "es" ? "Inicio" : "Home"}
          </NavLink>
          <NavLink to="/productos" className={linkClass}>
            {lang === "es" ? "Productos" : "Products"}
          </NavLink>
          <NavLink to="/cafeteria" className={linkClass}>
            {lang === "es" ? "Cafetería" : "Coffee Shop"}
          </NavLink>
          <NavLink to="/pedidosespeciales" className={linkClass}>
            {lang === "es" ? "Pedidos Especiales" : "Special Orders"}
          </NavLink>
          <NavLink to="/sucursales" className={linkClass}>
            {lang === "es" ? "Sucursales" : "Branches"}
          </NavLink>

          {/* Menú “Más” (solo desktop, versión anti-flicker) */}
        <div
          className="relative"
          onMouseEnter={() => {
            clearTimeout(window._menuTimeout);
            setMoreOpen(true);
          }}
          onMouseLeave={() => {
            // Espera un poquito antes de cerrar para evitar parpadeo
            window._menuTimeout = setTimeout(() => setMoreOpen(false), 200);
          }}
        >
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="hover:text-wineDark transition flex items-center gap-1"
          >
            {lang === "es" ? "Más ▾" : "More ▾"}
          </button>

          <div
            className={`absolute right-0 mt-1 w-48 bg-cream border border-wine/20 rounded-lg shadow-md py-2 z-50 transition-all duration-150 ${
              moreOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
            }`}
            onMouseEnter={() => {
              clearTimeout(window._menuTimeout);
              setMoreOpen(true);
            }}
            onMouseLeave={() => {
              window._menuTimeout = setTimeout(() => setMoreOpen(false), 200);
            }}
          >
            <NavLink
              to="/bolsadetrabajo"
              className="block px-4 py-2 hover:bg-rose/20 text-left whitespace-nowrap"
              onClick={() => setMoreOpen(false)}
            >
              {lang === "es" ? "Bolsa de Trabajo" : "Careers"}
            </NavLink>

            <NavLink
              to="/facturacion"
              className="block px-4 py-2 hover:bg-rose/20 text-left whitespace-nowrap"
              onClick={() => setMoreOpen(false)}
            >
              {lang === "es" ? "Facturación" : "Billing"}
            </NavLink>

            {role === "admin" && (
              <NavLink
                to="/admin"
                className="block px-4 py-2 hover:bg-rose/20 text-left whitespace-nowrap"
                onClick={() => setMoreOpen(false)}
              >
                {lang === "es" ? "Panel Admin" : "Admin Panel"}
              </NavLink>
            )}
          </div>
        </div>

        </nav>

        {/* Usuario / Sesión / Idioma (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-wineDark/80 truncate max-w-[120px]">
                👤 {user.email}
                {role && role !== "user" && (
                  <span className="ml-1 text-xs text-wine/70">({role})</span>
                )}
              </span>
              <button
                onClick={logout}
                className="bg-cream px-3 py-1 rounded hover:opacity-80 transition"
              >
                {lang === "es" ? "Cerrar sesión" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-red text-cream px-3 py-1 rounded hover:bg-wine/80 transition"
              >
                {lang === "es" ? "Iniciar sesión" : "Login"}
              </Link>
              <Link
                to="/register"
                className="bg-cream border border-wine px-3 py-1 rounded text-wine hover:bg-wine/20 transition"
              >
                {lang === "es" ? "Crear cuenta" : "Register"}
              </Link>
            </>
          )}

          <button
            onClick={toggleLang}
            className="bg-cream border border-wine px-3 py-1 rounded text-sm font-semibold hover:bg-wine hover:text-cream transition"
          >
            🌐 {lang === "es" ? "ES" : "EN"}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-cream/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-3 px-6 py-4 text-center font-medium">
          <NavLink to="/" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Inicio" : "Home"}
          </NavLink>
          <NavLink to="/productos" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Productos" : "Products"}
          </NavLink>
          <NavLink to="/cafeteria" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Cafetería" : "Coffee Shop"}
          </NavLink>
          <NavLink
            to="/pedidosespeciales"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Pedidos Especiales" : "Special Orders"}
          </NavLink>
          <NavLink to="/sucursales" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Sucursales" : "Branches"}
          </NavLink>
          <NavLink
            to="/bolsadetrabajo"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Bolsa de Trabajo" : "Careers"}
          </NavLink>
          <NavLink
            to="/facturacion"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Facturación" : "Billing"}
          </NavLink>
          {role === "admin" && (
            <NavLink to="/admin" className={linkClass} onClick={toggleMenu}>
              {lang === "es" ? "Panel Admin" : "Admin Panel"}
            </NavLink>
          )}

          <div className="border-t border-wine/20 my-2"></div>

          {user ? (
            <button
              onClick={() => {
                logout();
                toggleMenu();
              }}
              className="bg-rose text-wine px-4 py-2 rounded-lg"
            >
              {lang === "es" ? "Cerrar sesión" : "Logout"}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={toggleMenu}
                className="bg-red text-cream px-4 py-2 rounded-lg"
              >
                {lang === "es" ? "Iniciar sesión" : "Login"}
              </Link>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="border border-wine text-wine px-4 py-2 rounded-lg"
              >
                {lang === "es" ? "Crear cuenta" : "Register"}
              </Link>
            </>
          )}

          <button
            onClick={() => {
              toggleLang();
              toggleMenu();
            }}
            className="mt-2 bg-cream border border-wine px-4 py-2 rounded-lg text-sm font-semibold hover:bg-wine hover:text-cream transition"
          >
            🌐 {lang === "es" ? "ES" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
