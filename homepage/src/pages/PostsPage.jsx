export default function PostsPage() {
  return (
    <section className="page-section">
      <h2 className="section-title">文章</h2>
      <p className="page-desc">
        这里汇集了所有博客文章，涵盖技术学习、编程思考和项目实践。
      </p>
      <p className="page-desc">浏览文章请前往归档页面。</p>
      <a href="/archives/" className="btn btn-primary">查看文章归档</a>
    </section>
  );
}
