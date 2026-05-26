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
  // Helper to highlight key words in headings automatically
  const renderHeading = (text) => {
    if (typeof text !== "string") return text;
    
    if (text.includes(".")) {
      const parts = text.split(".");
      const filtered = parts.map((p) => p.trim()).filter(Boolean);
      if (filtered.length === 0) return text;
      return (
        <>
          {filtered.slice(0, -1).map((part, i) => (
            <span key={i}>{part}. </span>
          ))}
          <span className="accent">{filtered[filtered.length - 1]}.</span>
        </>
      );
    }

    const words = text.split(" ");
    if (words.length <= 1) return text;
    return (
      <>
        {words.slice(0, -1).join(" ")}{" "}
        <span className="accent">{words[words.length - 1]}</span>
      </>
    );
  };

  return (
    <div className="auth-container">
      {pageEyebrow && <div className="auth-page-eyebrow">{pageEyebrow}</div>}

      <div className="auth-left">
        <div className="brand">
          <div className="logo">🏐</div>
          <div className="brand-copy">
            <h2>VolleyReel</h2>
            <p>Analytics Platform</p>
          </div>
        </div>

        <div className="auth-left-content">
          <h1>{renderHeading(heading)}</h1>

          <p className="description">{description}</p>

          <div className="feature-panel">
            <h3>What you'll get:</h3>
            <ul className="features">
              {features.map((item) => (
                <li key={item}>
                  <div className="feature-icon-wrapper">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
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