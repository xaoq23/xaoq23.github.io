import { Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function CategoriesPage() {
  const grouped = {};
  for (const post of posts) {
    for (const cat of post.categories) {
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(post);
    }
  }
  const cats = Object.keys(grouped).sort();

  return (
    <section className="page-section" style={{ textAlign: "left" }}>
      <h2 className="section-title">分类</h2>
      {cats.map((cat) => (
        <div key={cat} style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>
            {cat} <span style={{ fontWeight: 400, fontSize: "0.9rem", color: "var(--text-secondary)" }}>({grouped[cat].length})</span>
          </h3>
          <div className="posts-grid">
            {grouped[cat].map((post) => (
              <Link key={post.slug} to={`/posts/${post.slug}`} className="post-card">
                <div className="post-card-body" style={{ padding: "14px 20px" }}>
                  <div className="post-meta">
                    <time>{post.date}</time>
                  </div>
                  <h3 className="post-title" style={{ fontSize: "1rem", marginBottom: 0 }}>{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {cats.length === 0 && (
        <p className="page-desc" style={{ marginTop: 24 }}>暂无分类。</p>
      )}
    </section>
  );
}
