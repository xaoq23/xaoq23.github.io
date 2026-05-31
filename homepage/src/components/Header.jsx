import { useState } from "react";
import { NavLink } from "react-router-dom";
import { site } from "../config/site.js";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo" onClick={close}>
          {site.title}
        </NavLink>
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="菜单"
        >
          <span />
          <span />
          <span />
        </button>
        {menuOpen && <div className="nav-overlay" onClick={close} />}
        <nav className={`nav ${menuOpen ? "nav--open" : ""}`}>
          {site.nav.map((link) => (
            <NavLink key={link.path} to={link.path} className="nav-link" end onClick={close}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
