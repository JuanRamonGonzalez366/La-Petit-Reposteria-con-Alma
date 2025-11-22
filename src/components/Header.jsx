import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import logo from "../assets/logo recortado.png";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import i18n from "../i18n";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Header() {
  const { user, role, logout } = useAuth();
  const [lang, setLang] = useState("es");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");






    // 🔹 Traer nombre del usuario desde Firestore
  useEffect(() => {
    if (!user?.uid) {
      setDisplayName("");
      return;
    }

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setDisplayName(data?.name || user.email || "");
    });

    return () => unsub();
  }, [user?.uid]);

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
          <NavLink to="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz" className={linkClass}>
            {lang === "es" ? "Productos" : "Products"}
          </NavLink>
          <NavLink to="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" className={linkClass}>
            {lang === "es" ? "Novedades" : "News"}
          </NavLink>
          <NavLink to="/c5f81wnh8tD29JX+apIYQpwFHwP3w5E31j71ZGa8knBwmdqvW/ttOpuAKiVu6sJe" className={linkClass}>
            {lang === "es" ? "Cafetería" : "Coffee Shop"}
          </NavLink>
          <NavLink to="/jdg9DL3muQqzJOuOLmae21cZvH861bBV3QmSQKCOJPGX5MI+t3LiP+XxEzj33EijLUREeoz/TW/JbZk9swdbsA" className={linkClass}>
            {lang === "es" ? "Pedidos Especiales" : "Special Orders"}
          </NavLink>
          <NavLink to="/SD9wrfTl3r/mTdgppUT8fDJQL9UqI34oyF5kcfaYvNKjWscyJ5V1yiGGAx26KZB3" className={linkClass}>
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
              to="/PoztxJ04ullrJPmqS7ZpDhBQchWL8aWgNXt+tFGa1lHXxvAAjkg4QemCr06KR+ZP"
              className="block px-4 py-2 hover:bg-rose/20 text-left whitespace-nowrap"
              onClick={() => setMoreOpen(false)}
            >
              {lang === "es" ? "Bolsa de Trabajo" : "Careers"}
            </NavLink>

            <NavLink
              to="/sWB7AuVkuH9cwxeonb7YJW4Td0nim7ISf8xNllbl1zow2SJX6BFY7t9MO4jMlW8o"
              className="block px-4 py-2 hover:bg-rose/20 text-left whitespace-nowrap"
              onClick={() => setMoreOpen(false)}
            >
              {lang === "es" ? "Facturación" : "Billing"}
            </NavLink>

            {role === "admin" && (
              <NavLink
                to="/1fPaYyxWaapylzV/Gipj4gVqPJKP4I3QS54tSatEwL9qiUdzePZJBJAdxC8ZFupN"
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
                👤 {displayName || user.email}
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
                to="/au5Z4YhReMcxh1r0WdbGNrGiMU7+j6CfaUrMxP2TGJNv7ZgI72muOl1gie2Lc7da"
                className="bg-red text-cream px-3 py-1 rounded hover:bg-wine/80 transition"
              >
                {lang === "es" ? "Iniciar sesión" : "Login"}
              </Link>
              <Link
                to="/R/pka3Igof2dpoOaMHXhACqm7+/L8K1PQ2ovWlhfFH3ZFeBwua4iQnLJmXLsd0aI"
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
          <NavLink to="/UmEFSY7AZFKVrotZ6mtdTWU5vthcO4fPeRgHPykBVUVuXFBOxELqnMJqYTHYkZvz" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Productos" : "Products"}
          </NavLink>
          <NavLink to="/ttfe/q/gwQysFs3gp3skmr7JaaQbw9Ehet1NTVeXeqROMFPrk1nu/A80K86WwSvM" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Novedades" : "News"}
          </NavLink>
          <NavLink to="/c5f81wnh8tD29JX+apIYQpwFHwP3w5E31j71ZGa8knBwmdqvW/ttOpuAKiVu6sJe" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Cafetería" : "Coffee Shop"}
          </NavLink>
          <NavLink
            to="/jdg9DL3muQqzJOuOLmae21cZvH861bBV3QmSQKCOJPGX5MI+t3LiP+XxEzj33EijLUREeoz/TW/JbZk9swdbsA"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Pedidos Especiales" : "Special Orders"}
          </NavLink>
          <NavLink to="/SD9wrfTl3r/mTdgppUT8fDJQL9UqI34oyF5kcfaYvNKjWscyJ5V1yiGGAx26KZB3" className={linkClass} onClick={toggleMenu}>
            {lang === "es" ? "Sucursales" : "Branches"}
          </NavLink>
          <NavLink
            to="/PoztxJ04ullrJPmqS7ZpDhBQchWL8aWgNXt+tFGa1lHXxvAAjkg4QemCr06KR+ZP"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Bolsa de Trabajo" : "Careers"}
          </NavLink>
          <NavLink
            to="/sWB7AuVkuH9cwxeonb7YJW4Td0nim7ISf8xNllbl1zow2SJX6BFY7t9MO4jMlW8o"
            className={linkClass}
            onClick={toggleMenu}
          >
            {lang === "es" ? "Facturación" : "Billing"}
          </NavLink>
          {role === "admin" && (
            <NavLink to="/1fPaYyxWaapylzV/Gipj4gVqPJKP4I3QS54tSatEwL9qiUdzePZJBJAdxC8ZFupN" className={linkClass} onClick={toggleMenu}>
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
                to="/au5Z4YhReMcxh1r0WdbGNrGiMU7+j6CfaUrMxP2TGJNv7ZgI72muOl1gie2Lc7da"
                onClick={toggleMenu}
                className="bg-red text-cream px-4 py-2 rounded-lg"
              >
                {lang === "es" ? "Iniciar sesión" : "Login"}
              </Link>
              <Link
                to="/R/pka3Igof2dpoOaMHXhACqm7+/L8K1PQ2ovWlhfFH3ZFeBwua4iQnLJmXLsd0aI"
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
