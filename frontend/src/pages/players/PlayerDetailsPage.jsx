import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { initialPlayers } from "./playersData";
import "../../styles/management.css";
import "../../styles/players.css";

const teamRoutesMap = {
  "Thunder Strikers": "TM-2026-001",
  "Ocean Waves": "TM-2026-002",
  "Sky Hawks": "TM-2026-003",
  "Net Ninjas": "TM-2026-004",
  "Beach Blazers": "TM-2026-005",
  "Court Kings": "TM-2026-001"
};

// Unique background colors for avatars (purple shades for mock coherence)
const avatarBgColors = [
  "#8b5cf6", // Purple
  "#a78bfa", // Light Purple
  "#7c3aed", // Deep Purple
  "#6366f1", // Indigo
  "#4f46e5", // Indigo dark
  "#c084fc"  // Orchid
];

// Helper to get initials
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to get consistent background color index from player name
function getAvatarBg(name) {
  if (!name) return avatarBgColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarBgColors.length;
  return avatarBgColors[index];
}

// Helper to generate consistent mock performance stats from name
function getPlayerPerformanceStats(name) {
  if (!name) return { matches: 24, points: 312, aces: 48, blocks: 56 };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val = Math.abs(hash);
  return {
    matches: (val % 12) + 15,     // 15 - 26 matches
    points: (val % 150) + 200,    // 200 - 349 points
    aces: (val % 25) + 30,        // 30 - 54 aces
    blocks: (val % 35) + 35       // 35 - 69 blocks
  };
}

// Helper to calculate age from DOB string (YYYY-MM-DD)
function calculateAge(dobString) {
  if (!dobString) return "";
  const dob = new Date(dobString);
  if (isNaN(dob)) return "";
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  const years = Math.abs(ageDate.getUTCFullYear() - 1970);
  
  // Format Date of Birth to 'Month DD, YYYY'
  const formattedDOB = dob.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  return `${formattedDOB} (${years} years)`;
}

// Helper to format height to feet/inches
function formatHeight(heightCm) {
  if (!heightCm) return "-";
  const cm = Number(heightCm);
  if (isNaN(cm)) return heightCm;
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remInches = Math.round(inches % 12);
  return `${feet}'${remInches}" (${cm} cm)`;
}

// Helper to format weight to lbs/kg
function formatWeight(weightKg) {
  if (!weightKg) return "-";
  const kg = Number(weightKg);
  if (isNaN(kg)) return weightKg;
  const lbs = Math.round(kg * 2.20462);
  return `${lbs} lbs (${kg} kg)`;
}

// Available Options for Form Dropdowns
const teamOptions = [
  { value: "Thunder Strikers", label: "Thunder Strikers" },
  { value: "Ocean Waves", label: "Ocean Waves" },
  { value: "Sky Hawks", label: "Sky Hawks" },
  { value: "Net Ninjas", label: "Net Ninjas" },
  { value: "Beach Blazers", label: "Beach Blazers" },
  { value: "Court Kings", label: "Court Kings" }
];

const positionOptions = [
  { value: "Spiker", label: "Spiker" },
  { value: "Setter", label: "Setter" },
  { value: "Blocker", label: "Blocker" },
  { value: "Libero", label: "Libero" }
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" }
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" }
];

export default function PlayerDetailsPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  // Load players list
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("volleyreel_players");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialPlayers;
  });

  // Find player
  const player = useMemo(() => {
    return players.find((p) => p.id === playerId);
  }, [players, playerId]);

  // Sync back to local storage on players list modification
  useEffect(() => {
    localStorage.setItem("volleyreel_players", JSON.stringify(players));
  }, [players]);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Edit form state
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formName, setFormName] = useState("");
  const [formTeam, setFormTeam] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formJersey, setFormJersey] = useState("");
  const [formDOB, setFormDOB] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formStatus, setFormStatus] = useState("Active");

  // Pre-fill edit inputs
  const openEditModal = () => {
    if (!player) return;
    setFormName(player.name || "");
    setFormTeam(player.team || "");
    setFormPosition(player.position || "");
    setFormJersey(player.jerseyNumber || "");
    setFormDOB(player.dateOfBirth || "");
    setFormGender(player.gender || "Male");
    setFormContact(player.contactNumber || "");
    setFormEmail(player.email || "");
    setFormHeight(player.height || "");
    setFormWeight(player.weight || "");
    setFormAddress(player.address || "");
    setFormStatus(player.status || "Active");
    setPhotoPreview(player.photoUrl || null);
    setIsEditOpen(true);
  };

  // Handle photo choice
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit edits
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formTeam || !formPosition) {
      alert("Please complete required fields.");
      return;
    }

    const updated = players.map((p) => {
      if (p.id === playerId) {
        return {
          ...p,
          name: formName.trim(),
          team: formTeam,
          position: formPosition,
          jerseyNumber: formJersey,
          contactNumber: formContact,
          status: formStatus,
          email: formEmail,
          dateOfBirth: formDOB,
          gender: formGender,
          height: formHeight,
          weight: formWeight,
          address: formAddress,
          photoUrl: photoPreview
        };
      }
      return p;
    });

    setPlayers(updated);
    setIsEditOpen(false);
  };

  // Submit deletion
  const handleDeleteConfirm = () => {
    const updated = players.filter((p) => p.id !== playerId);
    setPlayers(updated);
    setIsDeleteOpen(false);
    navigate("/players");
  };

  // Stable Mock stats calculation
  const stats = useMemo(() => {
    if (!player) return null;
    return getPlayerPerformanceStats(player.name);
  }, [player]);

  if (!player) {
    return (
      <div className="management-page" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="mgmt-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Player Profile Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            The requested player ID "{playerId}" could not be loaded or has been deleted.
          </p>
          <Link to="/players" className="mgmt-btn mgmt-btn--primary">
            Back to Players List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page players-page-container">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Back Link */}
      <Link to="/players" className="mgmt-back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Players
      </Link>

      {/* Header Block */}
      <header className="mgmt-header">
        <div>
          <h1>Player Details</h1>
          <p>View comprehensive player profile and statistics</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={openEditModal} className="mgmt-btn mgmt-btn--outline" id="btn-header-edit-player">
            Edit Player
          </button>
          <button type="button" onClick={() => setIsDeleteOpen(true)} className="mgmt-btn mgmt-btn--danger" id="btn-header-delete-player">
            Delete
          </button>
        </div>
      </header>

      {/* Main Details Grid */}
      <div className="mgmt-details-grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Left Columns Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Summary Card */}
          <div className="mgmt-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                className="players-details-avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "2rem",
                  borderRadius: "16px",
                  backgroundColor: !player.photoUrl ? getAvatarBg(player.name) : "transparent"
                }}
              >
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.name} />
                ) : (
                  getInitials(player.name)
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2 style={{ fontSize: "1.42rem", margin: 0, fontWeight: 800 }}>{player.name}</h2>
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {player.position} &bull; Jersey #{player.jerseyNumber || "-"}
                </span>
                <div style={{ display: "flex" }}>
                  <span className={`mgmt-badge ${player.status === "Active" ? "mgmt-badge--active" : "mgmt-badge--inactive"}`}>
                    {player.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pastel Metric Stat Boxes */}
            <div className="players-details-stats-row">
              <div className="players-card-stat-box players-card-stat-box--blue">
                <strong>{stats.matches}</strong>
                <span>Matches Played</span>
              </div>
              <div className="players-card-stat-box players-card-stat-box--purple">
                <strong>{stats.points}</strong>
                <span>Points Scored</span>
              </div>
              <div className="players-card-stat-box players-card-stat-box--yellow">
                <strong>{stats.aces}</strong>
                <span>Aces</span>
              </div>
              <div className="players-card-stat-box players-card-stat-box--teal">
                <strong>{stats.blocks}</strong>
                <span>Blocks</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Personal Information</h3>
            <div className="players-info-grid">
              <div className="players-info-item">
                <span className="players-info-label">Player ID</span>
                <span className="players-info-value">{player.id}</span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Full Name</span>
                <span className="players-info-value">{player.name}</span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Date of Birth</span>
                <span className="players-info-value">
                  {player.dateOfBirth ? calculateAge(player.dateOfBirth) : "-"}
                </span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Gender</span>
                <span className="players-info-value">{player.gender || "-"}</span>
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Team Information</h3>
            <div className="players-info-grid">
              <div className="players-info-item">
                <span className="players-info-label">Team</span>
                <span className="players-info-value">
                  <Link to={`/teams/${teamRoutesMap[player.team] || "TM-2026-001"}`} className="mgmt-table-link">
                    {player.team}
                  </Link>
                </span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Tournament</span>
                <span className="players-info-value">Spring Championship 2026</span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Position</span>
                <span className="players-info-value">{player.position}</span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Jersey Number</span>
                <span className="players-info-value">
                  {player.jerseyNumber ? `#${player.jerseyNumber}` : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Details */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Physical Details</h3>
            <div className="players-info-grid">
              <div className="players-info-item">
                <span className="players-info-label">Height</span>
                <span className="players-info-value">
                  {player.height ? formatHeight(player.height) : "-"}
                </span>
              </div>
              <div className="players-info-item">
                <span className="players-info-label">Weight</span>
                <span className="players-info-value">
                  {player.weight ? formatWeight(player.weight) : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Contact Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="players-info-item">
                <span className="players-info-label">Contact Number</span>
                <div className="players-info-value-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="players-info-value">{player.contactNumber || "-"}</span>
                </div>
              </div>

              <div className="players-info-item">
                <span className="players-info-label">Email Address</span>
                <div className="players-info-value-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span className="players-info-value">{player.email || "-"}</span>
                </div>
              </div>

              <div className="players-info-item">
                <span className="players-info-label">Address</span>
                <div className="players-info-value-row" style={{ alignItems: "flex-start" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "3px" }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="players-info-value" style={{ lineHeight: "1.4" }}>
                    {player.address || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance matches */}
          <div className="mgmt-card">
            <div className="mgmt-section-header" style={{ marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: 700 }}>Recent Performance</h3>
              <Link to="/matches" className="mgmt-section-link">
                View All Matches
              </Link>
            </div>
            <table className="players-performance-table">
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Date</th>
                  <th>Points</th>
                  <th>Aces</th>
                  <th>Blocks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>
                    vs{" "}
                    <Link to="/teams/TM-2026-002" className="mgmt-table-link">
                      Ocean Waves
                    </Link>
                  </td>
                  <td>Mar 15, 2026</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>18</td>
                  <td>3</td>
                  <td>4</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>
                    vs{" "}
                    <Link to="/teams/TM-2026-003" className="mgmt-table-link">
                      Sky Hawks
                    </Link>
                  </td>
                  <td>Mar 10, 2026</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>22</td>
                  <td>5</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>
                    vs{" "}
                    <Link to="/teams/TM-2026-004" className="mgmt-table-link">
                      Net Ninjas
                    </Link>
                  </td>
                  <td>Mar 05, 2026</td>
                  <td style={{ fontWeight: 700, color: "#ffffff" }}>15</td>
                  <td>2</td>
                  <td>3</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Columns Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="mgmt-card">
            <h3 className="mgmt-card-title" style={{ borderBottom: "none", marginBottom: "12px", paddingBottom: 0 }}>
              Quick Actions
            </h3>
            <div className="mgmt-quick-actions">
              <button
                type="button"
                onClick={openEditModal}
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
                Edit Player
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="mgmt-btn mgmt-btn--danger-outline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Player
              </button>
              <button
                type="button"
                onClick={() => navigate("/tournament-analytics")}
                className="mgmt-btn mgmt-btn--outline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: Edit Player */}
      {isEditOpen && (
        <div className="players-modal-overlay" role="dialog" aria-modal="true">
          <form onSubmit={handleEditSubmit} className="players-modal">
            <div className="players-modal-header">
              <h2>Edit Player Profile</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="players-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="players-modal-body">
              <div className="players-form-field">
                <label htmlFor="p-edit-name-det">Player Name <span className="required">*</span></label>
                <input
                  id="p-edit-name-det"
                  type="text"
                  placeholder="Full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="players-form-row">
                <div className="players-form-field">
                  <label>Team <span className="required">*</span></label>
                  <CustomSelect
                    value={formTeam}
                    onChange={(e) => setFormTeam(e.target.value)}
                    options={teamOptions}
                    placeholder="Select team..."
                  />
                </div>
                <div className="players-form-field">
                  <label>Position <span className="required">*</span></label>
                  <CustomSelect
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    options={positionOptions}
                    placeholder="Select position..."
                  />
                </div>
              </div>

              <div className="players-form-row">
                <div className="players-form-field">
                  <label htmlFor="p-edit-jersey-det">Jersey Number</label>
                  <input
                    id="p-edit-jersey-det"
                    type="text"
                    placeholder="e.g., 12"
                    value={formJersey}
                    onChange={(e) => setFormJersey(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-edit-dob-det">Date of Birth</label>
                  <input
                    id="p-edit-dob-det"
                    type="date"
                    value={formDOB}
                    onChange={(e) => setFormDOB(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-row">
                <div className="players-form-field">
                  <label>Gender</label>
                  <CustomSelect
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    options={genderOptions}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-edit-contact-det">Contact Number</label>
                  <input
                    id="p-edit-contact-det"
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-edit-email-det">Email</label>
                <input
                  id="p-edit-email-det"
                  type="email"
                  placeholder="player@email.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              {/* Photo Upload Zone */}
              <div className="players-form-field">
                <label>Player Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                {photoPreview ? (
                  <div className="players-upload-zone">
                    <div className="players-upload-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button
                        type="button"
                        className="players-upload-remove-btn"
                        onClick={() => setPhotoPreview(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <span className="players-upload-text">Photo selected</span>
                  </div>
                ) : (
                  <div
                    className="players-upload-zone"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <div className="players-upload-icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="players-upload-text">Upload player photo</span>
                    <button type="button" className="mgmt-btn mgmt-btn--outline" style={{ padding: "6px 12px" }}>
                      Choose File
                    </button>
                    <span className="players-upload-hint">PNG or JPG (Max 2MB)</span>
                  </div>
                )}
              </div>

              <div className="players-form-row">
                <div className="players-form-field">
                  <label htmlFor="p-edit-height-det">Height (cm)</label>
                  <input
                    id="p-edit-height-det"
                    type="number"
                    placeholder="185"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-edit-weight-det">Weight (kg)</label>
                  <input
                    id="p-edit-weight-det"
                    type="number"
                    placeholder="75"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-edit-address-det">Address</label>
                <textarea
                  id="p-edit-address-det"
                  placeholder="Player's address..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div className="players-form-field">
                <label>Status</label>
                <CustomSelect
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  options={statusOptions}
                />
              </div>
            </div>

            <div className="players-modal-footer">
              <button type="submit" className="mgmt-btn mgmt-btn--primary">
                Update Player
              </button>
              <button
                type="button"
                className="mgmt-btn mgmt-btn--outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP MODAL: Delete Confirm */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        title="Delete Player Profile"
        description="Are you sure you want to permanently delete this player profile? This action cannot be undone."
        itemName={player.name}
        confirmLabel="Delete Profile"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
