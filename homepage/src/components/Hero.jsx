import { site } from "../config/site.js";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <img src={site.avatar} alt="avatar" className="hero-avatar" />
        <h1 className="hero-title">{site.title}</h1>
        <p className="hero-tagline">{site.tagline}</p>
        <div className="hero-actions">
          <a href={`https://github.com/${site.social.github}`} target="_blank" rel="noreferrer" className="btn btn-primary">
            <img src="/assets/img/github.svg" alt="GitHub" className="btn-icon" />
            我的主页
          </a>
          <a href={`mailto:${site.social.email}`} className="btn btn-primary">
            <img src="/assets/img/gmail.ico" alt="Email" className="btn-icon" />
            联系我
          </a>
        </div>
      </div>
    </section>
  );
}
