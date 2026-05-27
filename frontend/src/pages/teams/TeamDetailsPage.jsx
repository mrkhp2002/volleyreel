import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { EditIcon, TrashIcon } from "../../components/common/TableActionIcons";
import { getTeamByRouteId } from "./teamsData";
import "../../styles/management.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const badgeClass = {
  Active: "mgmt-badge mgmt-badge--active",
  Scheduled: "mgmt-badge mgmt-badge--scheduled",
  Completed: "mgmt-badge mgmt-badge--completed",
};

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const team = getTeamByRouteId(teamId);

  if (!team) {
    return (
      <div className="management-page">
        <Link to="/teams" className="mgmt-back-link">
          ← Back to Teams
        </Link>
        <h1>Team not found</h1>
        <p>The team you are looking for does not exist.</p>
      </div>
    );
  }

  const handleDelete = () => {
    setShowDelete(false);
    navigate("/teams");
  };

  return (
    <div className="management-page">
      <Link to="/teams" className="mgmt-back-link">
        ← Back to Teams
      </Link>

      <header className="mgmt-header">
        <div>
          <h1>Team Details</h1>
          <p>View comprehensive team information and statistics</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to={`/teams/${team.id}/edit`} className="mgmt-btn mgmt-btn--outline">
            <EditIcon />
            Edit Team
          </Link>
          <button
            type="button"
            className="mgmt-btn mgmt-btn--danger"
            onClick={() => setShowDelete(true)}
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </header>

      <div className="mgmt-details-grid">
        <div>
          <section className="mgmt-card">
            <div className="mgmt-detail-hero">
              <div>
                <h2>{team.name}</h2>
                <span className={badgeClass[team.status] || "mgmt-badge"}>
                  {team.status}
                </span>
              </div>
              <span style={{ fontSize: "2rem" }}>🏐</span>
            </div>
            <div className="mgmt-form-grid" style={{ marginTop: 16 }}>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Team ID</span>
                <p>
                  <strong>{team.id}</strong>
                </p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Division</span>
                <p>
                  <strong>{team.division}</strong>
                </p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Category</span>
                <p>
                  <strong>{team.category}</strong>
                </p>
              </div>
              <div>
                <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Club</span>
                <p>
                  <strong>{team.clubName}</strong>
                </p>
              </div>
            </div>
          </section>

          <section className="mgmt-card">
            <h2 className="mgmt-card-title">Location & Coach</h2>
            <div className="mgmt-info-row">
              <MapIcon />
              <div>
                <strong>Home Venue</strong>
                <p style={{ color: "#64748b", margin: 0 }}>
                  {team.homeVenue}, {team.city}
                </p>
              </div>
            </div>
            <div className="mgmt-info-row">
              <UserIcon />
              <div>
                <strong>Head Coach</strong>
                <p style={{ color: "#64748b", margin: 0 }}>{team.coach}</p>
              </div>
            </div>
            <div className="mgmt-info-row">
              <CalendarIcon />
              <div>
                <strong>Founded</strong>
                <p style={{ color: "#64748b", margin: 0 }}>{team.foundedYear}</p>
              </div>
            </div>
          </section>

          <section className="mgmt-card">
            <h2 className="mgmt-card-title">Team Setup</h2>
            <div className="mgmt-mini-stats">
              <div className="mgmt-mini-stat">
                <span>Roster Limit</span>
                <strong>{team.rosterLimit}</strong>
              </div>
              <div className="mgmt-mini-stat">
                <span>Registered Players</span>
                <strong className="text-blue">{team.registeredPlayers}</strong>
              </div>
              <div className="mgmt-mini-stat">
                <span>Matches Played</span>
                <strong>{team.matchesPlayed}</strong>
              </div>
              <div className="mgmt-mini-stat">
                <span>Wins</span>
                <strong className="text-green">{team.wins}</strong>
              </div>
            </div>
          </section>

          <section className="mgmt-card">
            <h2 className="mgmt-card-title">Description</h2>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>{team.description}</p>
          </section>

          <section className="mgmt-card">
            <div className="mgmt-section-header">
              <h3>Registered Players</h3>
              <Link to="/players" className="mgmt-section-link">
                View All Players
              </Link>
            </div>
            <div className="mgmt-table-wrap" style={{ border: "none", boxShadow: "none" }}>
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Position</th>
                    <th>Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player) => (
                    <tr key={player.name}>
                      <td>
                        <strong>{player.name}</strong>
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
            </div>
          </section>

          <section className="mgmt-card">
            <div className="mgmt-section-header">
              <h3>Linked Matches</h3>
              <Link to="/matches" className="mgmt-section-link">
                View All Matches
              </Link>
            </div>
            <div className="mgmt-table-wrap" style={{ border: "none", boxShadow: "none" }}>
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Match ID</th>
                    <th>Teams</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.matches.map((match) => (
                    <tr key={match.id}>
                      <td>
                        <Link to={`/matches/${match.id}`} className="mgmt-table-link">
                          {match.id}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/matches/${match.id}`} className="mgmt-table-link" style={{ fontWeight: "normal", color: "inherit", textDecoration: "none" }}>
                          {match.teams}
                        </Link>
                      </td>
                      <td>{match.date}</td>
                      <td>
                        <span className={badgeClass[match.status] || "mgmt-badge"}>
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="mgmt-card">
          <h2 className="mgmt-card-title">Quick Actions</h2>
          <div className="mgmt-quick-actions">
            <Link to={`/teams/${team.id}/edit`} className="mgmt-btn mgmt-btn--primary mgmt-btn--block">
              <EditIcon />
              Edit Team
            </Link>
            <button
              type="button"
              className="mgmt-btn mgmt-btn--danger-outline mgmt-btn--block"
              onClick={() => setShowDelete(true)}
            >
              <TrashIcon />
              Delete Team
            </button>
            <Link to="/players" className="mgmt-btn mgmt-btn--outline mgmt-btn--block">
              View Players
            </Link>
            <Link to="/matches" className="mgmt-btn mgmt-btn--outline mgmt-btn--block">
              View Matches
            </Link>
          </div>
        </aside>
      </div>

      <DeleteConfirmModal
        open={showDelete}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone and will remove all associated roster data."
        itemName={team.name}
        confirmLabel="Delete Team"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
