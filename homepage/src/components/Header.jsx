import { useState } from "react";
import { NavLink } from "react-router-dom";

const chirpyLinks = [
  { label: "归档", to: "/archives/" },
  { label: "分类", to: "/categories/" },
  { label: "标签", to: "/tags/" },
  { label: "关于", to: "/about/" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo" onClick={close}>
          Xaoq23`s Blog
        </a>
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
          <a href="/" className="nav-link" onClick={close}>
            首页
          </a>
          <NavLink to="/" className="nav-link" end onClick={close}>
            展示页
          </NavLink>
          {chirpyLinks.map((link) => (
            <a key={link.to} href={link.to} className="nav-link" onClick={close}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
