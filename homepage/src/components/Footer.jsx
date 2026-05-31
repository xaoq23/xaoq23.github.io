import { site } from "../config/site.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a href={`https://github.com/${site.social.github}`} target="_blank" rel="noreferrer">GitHub</a>
          <a href={`mailto:${site.social.email}`}>Email</a>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} {site.author}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
