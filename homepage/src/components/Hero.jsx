import { site } from "../config/site.js";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <img src={site.avatar} alt="avatar" className="hero-avatar" />
        <h1 className="hero-title">{site.title}</h1>
        <p className="hero-tagline">{site.tagline}</p>
        <p className="hero-desc">{site.description}</p>
      </div>
    </section>
  );
}
