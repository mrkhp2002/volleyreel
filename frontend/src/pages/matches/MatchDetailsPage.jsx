import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../../styles/matches.css";

const initialMatchesCopy = [
  { id: "VM-2026-001", tournament: "Spring Championship 2026", teams: "Thunder Strikers vs Ocean Waves", date: "Mar 15, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-002", tournament: "Regional Cup", teams: "Sky Hawks vs Net Ninjas", date: "Mar 14, 2026", upload: "Processing", review: "In Review", video: "Not Generated" },
  { id: "VM-2026-003", tournament: "Spring Championship 2026", teams: "Beach Blazers vs Court Kings", date: "Mar 13, 2026", upload: "Failed", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-004", tournament: "Regional Cup", teams: "Thunder Strikers vs Sky Hawks", date: "Mar 12, 2026", upload: "Completed", review: "Completed", video: "Generating" },
  { id: "VM-2026-005", tournament: "Spring Championship 2026", teams: "Net Ninjas vs Beach Blazers", date: "Mar 11, 2026", upload: "Not Uploaded", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-006", tournament: "Spring Championship 2026", teams: "Thunder Strikers vs Court Kings", date: "Mar 10, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-007", tournament: "Regional Cup", teams: "Ocean Waves vs Beach Blazers", date: "Mar 09, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-008", tournament: "Regional Cup", teams: "Sky Hawks vs Court Kings", date: "Mar 08, 2026", upload: "Completed", review: "Completed", video: "Ready" },
  { id: "VM-2026-009", tournament: "Spring Championship 2026", teams: "Net Ninjas vs Thunder Strikers", date: "Mar 07, 2026", upload: "Processing", review: "In Review", video: "Not Generated" },
  { id: "VM-2026-010", tournament: "Regional Cup", teams: "Ocean Waves vs Net Ninjas", date: "Mar 06, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-011", tournament: "Regional Cup", teams: "Beach Blazers vs Sky Hawks", date: "Mar 05, 2026", upload: "Failed", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-012", tournament: "Spring Championship 2026", teams: "Court Kings vs Ocean Waves", date: "Mar 04, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
];

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [matchesList, setMatchesList] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("volleyreel_matches");
    const list = saved ? JSON.parse(saved) : initialMatchesCopy;
    setMatchesList(list);
    
    if (!matchId) return;
    const found = list.find((m) => m && m.id && m.id.toUpperCase() === matchId.toUpperCase());
    if (found) {
      setMatch(found);
    } else {
      // Fallback fallback if match isn't in database, create basic entry
      setMatch({
        id: matchId.toUpperCase(),
        tournament: "Spring Championship 2026",
        teams: "Thunder Strikers vs Ocean Waves",
        date: "Mar 15, 2026",
        upload: "Completed",
        review: "Approved",
        video: "Generated",
      });
    }
  }, [matchId]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleDelete = () => {
    const updatedList = matchesList.filter((m) => m.id.toUpperCase() !== matchId.toUpperCase());
    localStorage.setItem("volleyreel_matches", JSON.stringify(updatedList));
    triggerToast("Match successfully deleted.");
    setShowDeleteModal(false);
    setTimeout(() => {
      navigate("/matches");
    }, 1000);
  };

  if (!match) {
    return (
      <div className="matches-page" style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading match details...</p>
      </div>
    );
  }

  // Parse teams safely
  const teamsStr = match.teams || "Team A vs Team B";
  const teamNames = teamsStr.split(" vs ");
  const teamA = teamNames[0] || "Team A";
  const teamB = teamNames[1] || "Team B";

  return (
    <div className="matches-page">
      {/* Decorative background glows */}
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast popup */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid #ef4444",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "10px",
            zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.88rem",
            fontWeight: "600",
            animation: "matchesSlideUp 0.2s ease-out"
          }}
        >
          <span style={{ color: "#ef4444" }}>✓</span> {toast}
        </div>
      )}

      {/* Back button */}
      <Link to="/matches" className="matches-details-back-link">
        ← Back to Matches
      </Link>

      {/* Page Header */}
      <header className="matches-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="matches-header-text">
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2rem", fontWeight: "700" }}>Match Details</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            View match information and workflow status
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            type="button" 
            onClick={() => navigate(`/matches/upload?matchId=${match.id}`)}
            className="matches-btn-outline"
          >
            👁 Open Review
          </button>
          <button 
            type="button" 
            onClick={() => setShowDeleteModal(true)}
            className="matches-btn-danger"
          >
            🗑 Delete
          </button>
        </div>
      </header>

      {/* 2 Column Details Grid Layout */}
      <div className="matches-details-grid">
        {/* Left Column - Details Panels */}
        <div className="matches-details-left">
          
          {/* Panel 1: Match Summary header card */}
          <div className="matches-form-card" style={{ padding: "24px" }}>
            <div className="matches-summary-card-header">
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                  {match.teams}
                </h2>
                <span className="matches-video-card-meta" style={{ marginTop: "4px", display: "inline-block" }}>
                  {match.tournament}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>Match ID</span>
                <h4 style={{ fontSize: "1rem", color: "#ffffff", margin: "2px 0 0 0", fontWeight: "700" }}>{match.id}</h4>
              </div>
            </div>
            
            <div className="matches-summary-card-badges">
              <div className="matches-summary-badge-item">
                <span>Upload:</span>
                <span className={`matches-badge ${match.upload === "Completed" ? "matches-badge--green" : match.upload === "Processing" ? "matches-badge--blue" : "matches-badge--muted"}`}>
                  {match.upload}
                </span>
              </div>
              <div className="matches-summary-badge-item">
                <span>Review:</span>
                <span className={`matches-badge ${match.review === "Confirmed" || match.review === "Completed" ? "matches-badge--green" : match.review === "In Review" ? "matches-badge--yellow" : "matches-badge--muted"}`}>
                  {match.review === "Confirmed" ? "Approved" : match.review}
                </span>
              </div>
              <div className="matches-summary-badge-item">
                <span>Video:</span>
                <span className={`matches-badge ${match.video === "Ready" ? "matches-badge--green" : match.video === "Generating" ? "matches-badge--blue" : "matches-badge--muted"}`}>
                  {match.video === "Ready" ? "Generated" : match.video}
                </span>
              </div>
            </div>
          </div>

          {/* Panel 2: Match Information Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Match Information</h2>
            <div className="matches-info-grid">
              <div className="matches-info-item">
                <span className="matches-info-label">Team A</span>
                <span className="matches-info-val">{teamA}</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">Team B</span>
                <span className="matches-info-val">{teamB}</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">Tournament</span>
                <span className="matches-info-val">{match.tournament}</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">Match Stage</span>
                <span className="matches-info-val">
                  {match.id === "VM-2026-001" ? "Semi-Final" : match.id === "VM-2026-002" ? "Quarter-Final" : "Group Stage"}
                </span>
              </div>
              <div className="matches-info-item" style={{ gridColumn: "span 2" }}>
                <span className="matches-info-label">Final Score</span>
                <span className="matches-info-val">
                  {match.scoreA ? `${match.scoreA}-${match.scoreB}` : "3-1 (25-20, 22-25, 25-18, 25-22)"}
                </span>
              </div>
            </div>
          </div>

          {/* Panel 3: Schedule & Venue Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Schedule & Venue</h2>
            <div className="matches-venue-block">
              <div className="matches-venue-row">
                <span className="matches-venue-icon">📅</span>
                <div>
                  <span className="matches-info-label">Match Date & Time</span>
                  <p className="matches-info-val" style={{ margin: "2px 0 0 0" }}>
                    {match.id === "VM-2026-001" ? "April 14, 2026 at 14:00" : `${match.date || "TBD"} at 18:30`}
                  </p>
                </div>
              </div>
              <div className="matches-venue-row">
                <span className="matches-venue-icon">📍</span>
                <div>
                  <span className="matches-info-label">Venue</span>
                  <p className="matches-info-val" style={{ margin: "2px 0 0 0" }}>Central Sports Arena</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 4: Upload Details Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Upload Details</h2>
            <div className="matches-info-grid">
              <div className="matches-info-item">
                <span className="matches-info-label">Uploaded By</span>
                <span className="matches-info-val">Coach Anderson</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">Upload Date</span>
                <span className="matches-info-val">Mar 16, 2026 at 10:30 AM</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">Video Duration</span>
                <span className="matches-info-val">{match.duration || "1h 45m"}</span>
              </div>
              <div className="matches-info-item">
                <span className="matches-info-label">File Size</span>
                <span className="matches-info-val">2.4 GB</span>
              </div>
            </div>
          </div>

          {/* Panel 5: Review Progress Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Review Progress</h2>
            
            <div className="matches-details-metric-row">
              <div className="matches-details-metric-box matches-details-metric-box--blue">
                <span className="matches-details-metric-num">42</span>
                <span className="matches-details-metric-lbl">Detected Events</span>
              </div>
              <div className="matches-details-metric-box matches-details-metric-box--green">
                <span className="matches-details-metric-num">38</span>
                <span className="matches-details-metric-lbl">Approved</span>
              </div>
              <div className="matches-details-metric-box matches-details-metric-box--yellow">
                <span className="matches-details-metric-num">4</span>
                <span className="matches-details-metric-lbl">Pending</span>
              </div>
            </div>

            <h3 style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: "600", marginBottom: "12px" }}>Recent Events</h3>
            <div className="matches-table-wrap" style={{ background: "rgba(2, 6, 17, 0.2)" }}>
              <table className="matches-table" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Player</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ace</td>
                    <td>Thunder Strikers - James Anderson</td>
                    <td>2:35</td>
                    <td><span className="matches-badge matches-badge--green">Approved</span></td>
                  </tr>
                  <tr>
                    <td>Block</td>
                    <td>Ocean Waves - Sarah Kim</td>
                    <td>5:12</td>
                    <td><span className="matches-badge matches-badge--green">Approved</span></td>
                  </tr>
                  <tr>
                    <td>Spike</td>
                    <td>Thunder Strikers - Michael Chen</td>
                    <td>8:45</td>
                    <td><span className="matches-badge matches-badge--green">Approved</span></td>
                  </tr>
                  <tr>
                    <td>Ace</td>
                    <td>Thunder Strikers - James Anderson</td>
                    <td>12:20</td>
                    <td><span className="matches-badge matches-badge--yellow">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel 6: Generated Videos Card */}
          <div className="matches-form-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>Generated Videos</h2>
              <Link to="/matches/videos" style={{ color: "#3b82f6", fontSize: "0.85rem", textDecoration: "none", fontWeight: "600" }}>
                View All Videos
              </Link>
            </div>

            <div className="matches-details-video-list">
              <div className="matches-details-video-item">
                <div className="matches-details-video-info">
                  <div className="matches-details-video-icon">🎥</div>
                  <div className="matches-details-video-text">
                    <span className="matches-details-video-name">Match Highlights</span>
                    <span className="matches-details-video-meta">5:30 • Mar 16, 2026</span>
                  </div>
                </div>
                <span className="matches-badge matches-badge--green">Ready</span>
              </div>

              <div className="matches-details-video-item">
                <div className="matches-details-video-info">
                  <div className="matches-details-video-icon">🎥</div>
                  <div className="matches-details-video-text">
                    <span className="matches-details-video-name">Thunder Strikers Best Plays</span>
                    <span className="matches-details-video-meta">3:15 • Mar 16, 2026</span>
                  </div>
                </div>
                <span className="matches-badge matches-badge--green">Ready</span>
              </div>

              <div className="matches-details-video-item">
                <div className="matches-details-video-info">
                  <div className="matches-details-video-icon">🎥</div>
                  <div className="matches-details-video-text">
                    <span className="matches-details-video-name">Defensive Highlights</span>
                    <span className="matches-details-video-meta">4:20 • Mar 16, 2026</span>
                  </div>
                </div>
                <span className="matches-badge matches-badge--yellow">Processing</span>
              </div>
            </div>
          </div>

          {/* Panel 7: Match Notes Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Match Notes</h2>
            <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: "1.6", margin: 0 }}>
              {match.notes || "High-intensity match with excellent defensive plays from both teams. Thunder Strikers dominated the third set."}
            </p>
          </div>

        </div>

        {/* Right Column - Sidebars (Quick Actions & Timeline) */}
        <div className="matches-details-right">
          
          {/* Card 1: Quick Actions */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Quick Actions</h2>
            <div className="matches-quick-actions-panel">
              <button
                type="button"
                onClick={() => navigate(`/matches/upload?matchId=${match.id}`)}
                className="matches-btn-orange"
              >
                📥 Upload Video
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/matches/upload?matchId=${match.id}`)}
                className="matches-btn-blue"
              >
                👁 Open Review
              </button>

              <button
                type="button"
                onClick={() => navigate(`/matches/videos`)}
                className="matches-btn-outline"
                style={{ justifyContent: "center" }}
              >
                📹 View Videos
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="matches-btn-outline-red"
              >
                🗑 Delete Match
              </button>
            </div>
          </div>

          {/* Card 2: Activity Timeline */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Activity Timeline</h2>
            
            <div className="matches-timeline-list">
              <div className="matches-timeline-item">
                <div className="matches-timeline-bullet matches-timeline-bullet--green">
                  ✓
                </div>
                <span className="matches-timeline-act">Video Generated</span>
                <span className="matches-timeline-time">Mar 16 at 2:45 PM</span>
              </div>

              <div className="matches-timeline-item">
                <div className="matches-timeline-bullet matches-timeline-bullet--green">
                  ✓
                </div>
                <span className="matches-timeline-act">Review Approved</span>
                <span className="matches-timeline-time">Mar 16 at 12:30 PM</span>
              </div>

              <div className="matches-timeline-item">
                <div className="matches-timeline-bullet matches-timeline-bullet--blue">
                  ⏳
                </div>
                <span className="matches-timeline-act">Processing Started</span>
                <span className="matches-timeline-time">Mar 16 at 10:35 AM</span>
              </div>

              <div className="matches-timeline-item">
                <div className="matches-timeline-bullet matches-timeline-bullet--blue">
                  📥
                </div>
                <span className="matches-timeline-act">Video Uploaded</span>
                <span className="matches-timeline-time">Mar 16 at 10:30 AM</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="matches-modal-overlay">
          <div className="matches-modal" style={{ maxWidth: "420px" }}>
            <div className="matches-modal-header">
              <h2>Confirm Deletion</h2>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="matches-modal-close">
                ✖
              </button>
            </div>
            
            <div className="matches-modal-body" style={{ padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.5" }}>
                Are you sure you want to permanently delete match <strong>{match.id}</strong> ({match.teams})? This action will remove all tagged events, compiled clips, and timeline statistics.
              </p>
            </div>

            <div className="matches-modal-footer">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="matches-modal-btn-cancel">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDelete} 
                className="matches-btn-danger"
                style={{ padding: "8px 18px" }}
              >
                Yes, Delete Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
