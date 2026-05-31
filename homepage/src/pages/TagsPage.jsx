import { Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function TagsPage() {
  const grouped = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(post);
    }
  }
  const tags = Object.keys(grouped).sort();

  return (
    <section className="page-section" style={{ textAlign: "left" }}>
      <h2 className="section-title">标签</h2>
      {tags.map((tag) => (
        <div key={tag} style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>
            {tag} <span style={{ fontWeight: 400, fontSize: "0.9rem", color: "var(--text-secondary)" }}>({grouped[tag].length})</span>
          </h3>
          <div className="posts-grid">
            {grouped[tag].map((post) => (
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
      {tags.length === 0 && (
        <p className="page-desc" style={{ marginTop: 24 }}>暂无标签。</p>
      )}
    </section>
  );
}
