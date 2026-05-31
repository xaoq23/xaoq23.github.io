import { useState } from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { label: "首页", to: "/" },
  { label: "文章", to: "/posts" },
  { label: "归档", to: "/archives" },
  { label: "分类", to: "/categories" },
  { label: "标签", to: "/tags" },
  { label: "关于", to: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo" onClick={close}>
          Xaoq23`s Blog
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
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link" onClick={close}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
