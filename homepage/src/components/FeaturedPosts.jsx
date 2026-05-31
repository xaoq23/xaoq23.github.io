import { Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function FeaturedPosts() {
  const featured = posts.slice(0, 6);

  return (
    <section className="featured-posts">
      <h2 className="section-title">最新文章</h2>
      <div className="posts-grid">
        {featured.map((post) => (
          <Link key={post.slug} to={`/posts/${post.slug}`} className="post-card">
            <div className="post-card-body">
              <div className="post-meta">
                <time>{post.date}</time>
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
      {posts.length > 6 && (
        <div className="section-footer">
          <Link to="/posts" className="btn btn-text">查看全部文章 →</Link>
        </div>
      )}
    </section>
  );
}
