import { site } from "../config/site.js";

export default function AboutPage() {
  return (
    <section className="page-section">
      <h2 className="section-title">关于</h2>
      <div className="about-content">
        <img src={site.avatar} alt="avatar" className="about-avatar" />
        <p className="page-desc">
          这是我的个人博客，记录技术学习、编程思考和项目实践。
        </p>
        <div className="about-links">
          <a href={`https://github.com/${site.social.github}`} target="_blank" rel="noreferrer" className="btn btn-secondary">
            GitHub
          </a>
          <a href={`mailto:${site.social.email}`} className="btn btn-secondary">
            Email
          </a>
        </div>
      </div>
    </section>
  );
}
