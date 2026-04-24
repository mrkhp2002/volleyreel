export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="brand">
          <div className="logo">🏆</div>
          <h2>VolleyReel</h2>
          <p>Analytics Platform</p>
        </div>

        <h1>Analyze. Track. Win.</h1>

        <p className="description">
          Transform your volleyball matches into powerful insights with AI-powered video analysis and comprehensive team management.
        </p>

        <ul className="features">
          <li>✔ Automated Video Analysis</li>
          <li>✔ Tournament Management</li>
          <li>✔ Performance Analytics</li>
        </ul>

        <footer>© 2026 VolleyReel. All rights reserved.</footer>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        {children}
      </div>

    </div>
  );
}