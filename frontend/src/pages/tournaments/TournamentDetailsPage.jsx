import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { initialTournaments } from "./tournamentsData";
import "../../styles/management.css";

// SVG Trophy Icon
function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "32px", height: "32px" }}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z" />
    </svg>
  );
}

const statusClass = {
  Ongoing: "mgmt-badge mgmt-badge--ongoing",
  Upcoming: "mgmt-badge mgmt-badge--upcoming",
  Completed: "mgmt-badge mgmt-badge--completed"
};

// Helper to format date string to "MMM DD, YYYY"
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export default function TournamentDetailsPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  // Load existing tournaments
  const [tournaments, setTournaments] = useState(() => {
    const saved = localStorage.getItem("volleyreel_tournaments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialTournaments;
  });

  const tournament = tournaments.find((t) => t.id === tournamentId);

  const handleDelete = () => {
    const updated = tournaments.filter((t) => t.id !== tournamentId);
    localStorage.setItem("volleyreel_tournaments", JSON.stringify(updated));
    setShowDelete(false);
    navigate("/tournaments");
  };

  if (!tournament) {
    return (
      <div className="management-page" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="mgmt-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Tournament Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            The requested tournament ID "{tournamentId}" could not be loaded or has been deleted.
          </p>
          <Link to="/tournaments" className="mgmt-btn mgmt-btn--primary">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Back link */}
      <Link to="/tournaments" className="mgmt-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Tournaments
      </Link>

      {/* Header Block */}
      <header className="mgmt-header">
        <div>
          <h1>Tournament Details</h1>
          <p>View comprehensive schedule and rules setup for this tournament</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={`/tournaments/${tournament.id}/edit`} className="mgmt-btn mgmt-btn--outline">
            Edit Tournament
          </Link>
          <button
            type="button"
            className="mgmt-btn mgmt-btn--danger"
            onClick={() => setShowDelete(true)}
          >
            Delete
          </button>
        </div>
      </header>

      {/* Grid structure (2 columns on desktop) */}
      <div className="mgmt-details-grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        
        {/* Left column panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Summary Card */}
          <div className="mgmt-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div className="mgmt-trophy-emblem">
                <TrophyIcon />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2 style={{ fontSize: "1.42rem", margin: 0, fontWeight: 800 }}>{tournament.name}</h2>
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {tournament.category} &bull; {tournament.type}
                </span>
                <div style={{ display: "flex" }}>
                  <span className={statusClass[tournament.status] || "mgmt-badge"}>
                    {tournament.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="mgmt-details-stats-row">
              <div className="mgmt-card-stat-box mgmt-card-stat-box--blue">
                <strong>{tournament.teamsCount || 0}</strong>
                <span>Registered Teams</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--purple">
                <strong>{tournament.teamLimit || 16}</strong>
                <span>Roster Limit</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--green">
                <strong>{tournament.groupsCount || 0}</strong>
                <span>Total Groups</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--yellow">
                <strong>{tournament.matchFormat.split(" ")[2] || "5"}</strong>
                <span>Sets Format</span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Basic Information</h3>
            <div className="mgmt-info-grid">
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Tournament ID</span>
                <span className="mgmt-info-value">{tournament.id}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Venue Location</span>
                <span className="mgmt-info-value">{tournament.location || "-"}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Organizer Name</span>
                <span className="mgmt-info-value">{tournament.organizerName || "-"}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Format Type</span>
                <span className="mgmt-info-value">{tournament.type}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Deadlines */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Schedule & Deadlines</h3>
            <div className="mgmt-info-grid">
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Start Date</span>
                <span className="mgmt-info-value">{formatDate(tournament.startDate)}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">End Date</span>
                <span className="mgmt-info-value">{formatDate(tournament.endDate)}</span>
              </div>
              <div className="mgmt-info-item" style={{ gridColumn: "span 2" }}>
                <span className="mgmt-info-label">Registration Deadline</span>
                <span className="mgmt-info-value">{formatDate(tournament.registrationDeadline)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Description</h3>
            <p style={{ color: "#cbd5e1", lineHeight: 1.6, margin: 0, fontSize: "0.92rem" }}>
              {tournament.description || "No description provided for this tournament profile."}
            </p>
          </div>

          {/* Setup Rules & Notes */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Rules & Setup Settings</h3>
            <div className="mgmt-info-grid" style={{ marginBottom: "16px" }}>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Match Format</span>
                <span className="mgmt-info-value">{tournament.matchFormat}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Set Rules</span>
                <span className="mgmt-info-value">{tournament.setRules}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Publicly Visible</span>
                <span className="mgmt-info-value">{tournament.publicVisibility !== false ? "Yes" : "No"}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Auto Leaderboard</span>
                <span className="mgmt-info-value">{tournament.enableLeaderboard !== false ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            
            {tournament.notes && (
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
                <span className="mgmt-info-label" style={{ display: "block", marginBottom: "6px" }}>Additional Organizer Notes</span>
                <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.88rem", fontStyle: "italic" }}>
                  "{tournament.notes}"
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right column Quick Actions sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="mgmt-card">
            <h3 className="mgmt-card-title" style={{ borderBottom: "none", marginBottom: "12px", paddingBottom: 0 }}>
              Quick Actions
            </h3>
            <div className="mgmt-quick-actions">
              <Link
                to={`/tournaments/${tournament.id}/edit`}
                className="mgmt-btn"
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#ffffff",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.2)"
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Details
              </Link>
              <button
                type="button"
                className="mgmt-btn mgmt-btn--danger-outline"
                onClick={() => setShowDelete(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Profile
              </button>
              <Link to="/tournament-analytics" className="mgmt-btn mgmt-btn--outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                View Analytics
              </Link>
              <Link to="/leaderboards" className="mgmt-btn mgmt-btn--outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal Overlay */}
      <DeleteConfirmModal
        open={showDelete}
        title="Delete Tournament Profile"
        description="Are you sure you want to permanently delete this tournament profile? This action cannot be undone and will clear all scheduled matches."
        itemName={tournament.name}
        confirmLabel="Delete Tournament"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
