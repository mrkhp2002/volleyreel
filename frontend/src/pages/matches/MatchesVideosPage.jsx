import { Link } from "react-router-dom";
import "../../styles/management.css";

export default function MatchesVideosPage() {
  return (
    <div className="management-page">
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />
      
      <header className="mgmt-header">
        <div>
          <h1>Generated Videos</h1>
          <p>Browse all generated highlight clips and tournament analytics compilations</p>
        </div>
      </header>

      <div className="mgmt-card" style={{ marginTop: "24px", padding: "24px" }}>
        <h2 className="mgmt-card-title" style={{ marginBottom: "16px" }}>Highlight Clip Directory</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          You can review generated highlight videos by going to the Match List directory and clicking the Eye icon or Video icon on any row that has a "Ready" video status.
        </p>
        <Link to="/matches" className="mgmt-btn mgmt-btn--primary" style={{ display: "inline-flex" }}>
          Go to Match List Directory
        </Link>
      </div>
    </div>
  );
}
