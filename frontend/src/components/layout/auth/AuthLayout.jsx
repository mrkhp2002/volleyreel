const defaultFeatures = [
  "Automated Video Analysis",
  "Tournament Management",
  "Performance Analytics",
];

export default function AuthLayout({
  children,
  pageEyebrow = "",
  heading = "Analyze. Track. Win.",
  description = "Transform your volleyball matches into powerful insights with AI-powered video analysis and comprehensive team management.",
  features = defaultFeatures,
}) {
  return (
    <div className="auth-container">
      {pageEyebrow && <div className="auth-page-eyebrow">{pageEyebrow}</div>}

      <div className="auth-left">
        <div className="brand">
          <div className="logo">🏆</div>
          <div className="brand-copy">
            <h2>VolleyReel</h2>
            <p>Analytics Platform</p>
          </div>
        </div>

        <div className="auth-left-content">
          <h1>{heading}</h1>

          <p className="description">{description}</p>

          <div className="feature-panel">
            <h3>What you'll get:</h3>
            <ul className="features">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <footer>© 2026 VolleyReel. All rights reserved.</footer>
      </div>

      <div className="auth-right">
        {children}
      </div>
    </div>
  );
}