import { useParams, Link } from "react-router-dom";
import posts from "../data/posts.json";

export default function PostPage() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="page-section">
        <h2 className="section-title">文章未找到</h2>
        <p className="page-desc">抱歉，未找到该文章。</p>
        <Link to="/posts" className="btn btn-primary">返回文章列表</Link>
      </section>
    );
  }

  return (
    <article className="article-page">
      <div className="article-header">
        <h1 className="article-title">{post.title}</h1>
        <div className="article-meta">
          <time>{post.date}</time>
          {post.categories.length > 0 && (
            <span className="article-categories">
              {post.categories.map((cat) => (
                <Link key={cat} to="/categories" className="article-cat">{cat}</Link>
              ))}
            </span>
          )}
          {post.tags.length > 0 && (
            <div className="article-tags">
              {post.tags.map((tag) => (
                <Link key={tag} to="/tags" className="tag">{tag}</Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="article-footer">
        <Link to="/posts" className="btn btn-text">← 返回文章列表</Link>
      </div>
    </article>
  );
}
