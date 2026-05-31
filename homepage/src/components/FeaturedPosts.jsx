const posts = [
  {
    title: "Hello World",
    desc: "这是我的第一篇博客文章。使用 Jekyll + Chirpy 主题搭建，前端首页由 React 驱动。",
    date: "2024-01-01",
    tags: ["杂谈"],
    url: "/posts/hello-world/",
  },
];

export default function FeaturedPosts() {
  return (
    <section className="featured-posts">
      <h2 className="section-title">最新文章</h2>
      <div className="posts-grid">
        {posts.map((post, i) => (
          <a key={i} href={post.url} className="post-card">
            <div className="post-card-body">
              <div className="post-meta">
                <time>{post.date}</time>
                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-desc">{post.desc}</p>
            </div>
          </a>
        ))}
      </div>
      <div className="section-footer">
        <a href="/archives/" className="btn btn-text">查看全部文章 →</a>
      </div>
    </section>
  );
}
