import { Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function PostsPage() {
  return (
    <section className="page-section" style={{ textAlign: "left" }}>
      <h2 className="section-title">文章</h2>
      <div className="posts-grid" style={{ marginTop: 24 }}>
        {posts.map((post) => (
          <Link key={post.slug} to={`/posts/${post.slug}`} className="post-card">
            <div className="post-card-body">
              <div className="post-meta">
                <time>{post.date}</time>
                {post.categories.length > 0 && (
                  <span>{post.categories.join(" / ")}</span>
                )}
                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="post-title">{post.title}</h3>
              {post.excerpt && <p className="post-desc">{post.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="page-desc" style={{ marginTop: 24 }}>暂无文章。</p>
      )}
    </section>
  );
}
