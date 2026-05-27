import { Link } from "react-router-dom";
import "../../styles/management.css";

export default function MatchesUploadPage() {
  return (
    <div className="management-page">
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />
      
      <header className="mgmt-header">
        <div>
          <h1>Upload & Review</h1>
          <p>Upload volleyball match video streams and review tagged highlights</p>
        </div>
      </header>

      <div className="mgmt-card" style={{ marginTop: "24px", padding: "24px" }}>
        <h2 className="mgmt-card-title" style={{ marginBottom: "16px" }}>Upload Match Video Feeds</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          To upload video feeds for matches that are not uploaded, navigate to the main Match List page, click the upload action button on a match row, and trigger the upload wizard.
        </p>
        <Link to="/matches" className="mgmt-btn mgmt-btn--primary" style={{ display: "inline-flex" }}>
          Go to Match List Directory
        </Link>
      </div>
    </div>
  );
}
