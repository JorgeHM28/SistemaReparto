import { useState } from "react";
import {Link} from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

function Header() {
  const [navOpen, setNavOpen] = useState(false);

  function toggleNav() {
    setNavOpen((prev) => !prev);
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <header className="site-header" id="inicio">
      <div className="container header-inner">
        <a href="#inicio" className="logo" aria-label="DeliveryTrack — Inicio">
          <img
            src="/logo-deliverytrack.svg"
            alt=""
            width="36"
            height="36"
            className="logo-icon"
          />
          <span className="logo-text">
            Delivery<span className="logo-accent">Track</span>
          </span>
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="main-nav"
          aria-label="Abrir menú de navegación"
          onClick={toggleNav}
        >
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
        </button>
        <ThemeToggle className="theme-toggle--landing header-theme-toggle" />
        <nav
          className={`main-nav${navOpen ? " is-open" : ""}`}
          id="main-nav"
          aria-label="Navegación principal"
        >
          <ul className="nav-list">
            <li>
              <a href="#problema" onClick={closeNav}>
                Problema
              </a>
            </li>
            <li>
              <a href="#caracteristicas" onClick={closeNav}>
                Características
              </a>
            </li>
            <li>
              <a href="#precios" onClick={closeNav}>
                Precios
              </a>
            </li>
            <li>
              <a href="#testimonios" onClick={closeNav}>
                Testimonios
              </a>
            </li>
            <li>
              <Link to="/register">
                <a  className="nav-cta" onClick={closeNav}>
                Prueba gratis
              </a>
              </Link>

            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
