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
  return (
    <header className="header">
      <div className="header-inner">
        <NavLink to="/" className="logo">Xaoq23`s Blog</NavLink>
        <nav className="nav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
