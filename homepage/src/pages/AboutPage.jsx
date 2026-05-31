export default function AboutPage() {
  return (
    <section className="page-section">
      <h2 className="section-title">关于</h2>
      <div className="about-content">
        <img
          src="/assets/img/avater.jpg"
          alt="avatar"
          className="about-avatar"
        />
        <p className="page-desc">
          这是我的个人博客，使用 Jekyll + Chirpy 主题构建，前端首页由 React 驱动。
        </p>
        <p className="page-desc">
          这里记录我的技术学习、编程思考和项目实践。
        </p>
        <div className="about-links">
          <a href="https://github.com/xaoq23" target="_blank" rel="noreferrer" className="btn btn-secondary">
            GitHub
          </a>
          <a href="mailto:2105002580@qq.com" className="btn btn-secondary">
            Email
          </a>
        </div>
      </div>
    </section>
  );
}
