import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import API from "../../services/apiClient"; // API එක Import කළා
import "../../styles/management.css";

// SVG Icons
function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z" />
    </svg>
  );
}

const badgeClass = {
  Active: "mgmt-badge mgmt-badge--active",
  Inactive: "mgmt-badge mgmt-badge--inactive",
  Draft: "mgmt-badge mgmt-badge--upcoming",
};

// Maps roster player name to mock player ID for details redirect
const playerRoutesMap = {
  "James Anderson": "PL-2026-001",
  "Sarah Kim": "PL-2026-002",
  "Michael Chen": "PL-2026-003",
  "Emily Davis": "PL-2026-004",
  "David Martinez": "PL-2026-005",
  "Lisa Thompson": "PL-2026-006",
  "Alex Rivera": "PL-2026-001",
  "Chris Lee": "PL-2026-003",
  "Jordan Smith": "PL-2026-002",
  "Sam Patel": "PL-2026-004"
};

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  // Database එකෙන් එන දත්ත තියාගන්න States
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Database එකෙන් Team විස්තර ගෙන ඒම
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await API.get(`/teams/${teamId}`);
        const t = response.data;


        setTeam({
          id: String(t.team_id),
          name: t.name,
          tournamentId: t.tournament_id,
          coach: t.coach || "Not Assigned",
          clubName: t.club_name || "-",
          city: t.city || "Colombo",
          status: t.status || "Active",
          description: t.description || "No description provided.",
          players: [],
          matchesPlayed: 0,
          wins: 0
        });
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  // Generate stable mock coach information
  const coachInfo = useMemo(() => {
    if (!team) return null;
    const cleanCoach = team.coach || "Head Coach";
    const cleanTeam = team.name || "VolleyReel";
    const coachSlug = cleanCoach.toLowerCase().replace(/\s+/g, ".");
    const teamSlug = cleanTeam.toLowerCase().replace(/\s+/g, "");
    return {
      phone: "+1 (555) 123-4567",
      email: `coach.${coachSlug}@${teamSlug}.com`
    };
  }, [team]);

  // 2. Database eken delete Team 
  const handleDelete = async () => {
    try {
      await API.delete(`/teams/${teamId}`);
      setShowDelete(false);
      alert("Team deleted successfully!");
      navigate("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team.");
    }
  };

  if (loading) {
    return <div className="management-page" style={{ padding: "40px", color: "white", textAlign: "center" }}>Loading team details...</div>;
  }

  if (!team) {
    return (
      <div className="management-page" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="mgmt-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Team Profile Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            The requested team ID "{teamId}" could not be loaded or has been deleted.
          </p>
          <Link to="/teams" className="mgmt-btn mgmt-btn--primary">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const winRate = team.matchesPlayed > 0
    ? Math.round((team.wins / team.matchesPlayed) * 100)
    : 0;

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Back link */}
      <Link to="/teams" className="mgmt-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Teams
      </Link>

      {/* Header Block */}
      <header className="mgmt-header">
        <div>
          <h1>Team Details</h1>
          <p>View comprehensive team information and roster</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={`/teams/${team.id}/edit`} className="mgmt-btn mgmt-btn--outline">
            Edit Team
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
                <h2 style={{ fontSize: "1.42rem", margin: 0, fontWeight: 800 }}>{team.name}</h2>
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  <Link to={`/tournaments/${team.tournamentId}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                    Tournament ID: TN-{team.tournamentId}
                  </Link>
                </span>
                <div style={{ display: "flex" }}>
                  <span className={badgeClass[team.status] || "mgmt-badge"}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="mgmt-details-stats-row">
              <div className="mgmt-card-stat-box mgmt-card-stat-box--blue">
                <strong>{team.players?.length || 0}</strong>
                <span>Total Players</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--purple">
                <strong>{team.matchesPlayed}</strong>
                <span>Matches Played</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--green">
                <strong>{team.wins}</strong>
                <span>Wins</span>
              </div>
              <div className="mgmt-card-stat-box mgmt-card-stat-box--yellow">
                <strong>{winRate}%</strong>
                <span>Win Rate</span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Basic Information</h3>
            <div className="mgmt-info-grid">
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Team ID</span>
                <span className="mgmt-info-value">TM-{team.id}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Club Name</span>
                <span className="mgmt-info-value">{team.clubName}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Tournament</span>
                <span className="mgmt-info-value">
                  <Link to={`/tournaments/${team.tournamentId}`} style={{ color: "var(--secondary)", textDecoration: "none" }}>
                    View Tournament (TN-{team.tournamentId})
                  </Link>
                </span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Status</span>
                <span className="mgmt-info-value">{team.status}</span>
              </div>
            </div>
          </div>

          {/* Coach Information */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Coach Information</h3>
            <div className="mgmt-info-grid">
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Coach Name</span>
                <span className="mgmt-info-value">{team.coach || "Not Assigned"}</span>
              </div>
              <div className="mgmt-info-item">
                <span className="mgmt-info-label">Contact Number</span>
                <span className="mgmt-info-value">{coachInfo.phone}</span>
              </div>
              <div className="mgmt-info-item" style={{ gridColumn: "span 2" }}>
                <span className="mgmt-info-label">Email Address</span>
                <span className="mgmt-info-value">{coachInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Team Description */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Team Description</h3>
            <p style={{ color: "#cbd5e1", lineHeight: 1.6, margin: 0, fontSize: "0.92rem" }}>
              {team.description}
            </p>
          </div>

          {/* Players in Team Roster */}
          <div className="mgmt-card">
            <div className="mgmt-section-header" style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: 700 }}>Players in Team</h3>
              <Link to="/players" className="mgmt-section-link">
                View All Players
              </Link>
            </div>

            {team.players && team.players.length > 0 ? (
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Position</th>
                    <th>Jersey #</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player) => (
                    <tr key={player.name}>
                      <td>
                        <Link
                          to={`/players/${playerRoutesMap[player.name] || "PL-2026-001"}`}
                          className="mgmt-table-link"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td>{player.position}</td>
                      <td>{player.number}</td>
                      <td>
                        <span className="mgmt-badge mgmt-badge--active">
                          {player.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontStyle: "italic", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                No players added to this team yet.
              </div>
            )}
          </div>

          {/* Recent Performance Matches - Hardcoded for UI visual purposes */}
          <div className="mgmt-card">
            <div className="mgmt-section-header" style={{ marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: 700 }}>Recent Matches</h3>
              <Link to="/matches" className="mgmt-section-link">
                View All Matches
              </Link>
            </div>
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>
                      vs{" "}
                      <Link to="/teams/TM-2026-002" className="mgmt-table-link">
                        Ocean Waves
                      </Link>
                    </span>
                    <span className="mgmt-recent-matches-score">Mar 15, 2026</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>Won 3-1</span>
                    <span className="mgmt-recent-matches-score">25-20, 22-25, 25-18, 25-22</span>
                  </td>
                </tr>
              </tbody>
            </table>
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
                to={`/teams/${team.id}/edit`}
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
                Edit Team
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
                Delete Team
              </button>
              <Link to="/players" className="mgmt-btn mgmt-btn--outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                View Players
              </Link>
              <Link to="/tournament-analytics" className="mgmt-btn mgmt-btn--outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                View Analytics
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal Overlay */}
      <DeleteConfirmModal
        open={showDelete}
        title="Delete Team Profile"
        description="Are you sure you want to permanently delete this team profile? This action cannot be undone and will remove all associated roster details."
        itemName={team.name}
        confirmLabel="Delete Team"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}