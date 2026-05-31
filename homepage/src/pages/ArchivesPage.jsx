import { Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function ArchivesPage() {
  const grouped = {};
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(post);
  }
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <section className="page-section" style={{ textAlign: "left" }}>
      <h2 className="section-title">归档</h2>
      {years.map((year) => (
        <div key={year} style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>{year}</h3>
          <div className="posts-grid">
            {grouped[year].map((post) => (
              <Link key={post.slug} to={`/posts/${post.slug}`} className="post-card">
                <div className="post-card-body" style={{ padding: "14px 20px" }}>
                  <div className="post-meta">
                    <time>{post.date}</time>
                    {post.categories.length > 0 && (
                      <span>{post.categories.join(" / ")}</span>
                    )}
                  </div>
                  <h3 className="post-title" style={{ fontSize: "1rem", marginBottom: 0 }}>{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {years.length === 0 && (
        <p className="page-desc" style={{ marginTop: 24 }}>暂无归档。</p>
      )}
    </section>
  );
}
