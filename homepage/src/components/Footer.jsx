export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a href="https://github.com/xaoq23" target="_blank" rel="noreferrer">GitHub</a>
          <a href="mailto:2105002580@qq.com">Email</a>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} zzh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
