import { useState } from "react";
import { site } from "../config/site.js";

export default function Hero() {
  const [btnText, setBtnText] = useState("联系我");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(site.social.email);
    setBtnText("邮箱复制成功");
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <img src={site.avatar} alt="avatar" className="hero-avatar" />
        <h1 className="hero-title">{site.title}</h1>
        <p className="hero-tagline">{site.tagline}</p>
        <div className="hero-actions">
          <a href={`https://github.com/${site.social.github}`} target="_blank" rel="noreferrer" className="btn btn-primary">
            <img src="/assets/img/github.svg" alt="GitHub" className="btn-icon" />
            我的主页
          </a>
          <button type="button" className="btn btn-primary" onClick={handleCopyEmail} onMouseLeave={() => setBtnText("联系我")}>
            <img src="/assets/img/gmail.ico" alt="Email" className="btn-icon" />
            {btnText}
          </button>
        </div>
      </div>
    </section>
  );
}
