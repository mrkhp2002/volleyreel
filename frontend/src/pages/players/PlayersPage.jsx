import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { ViewIcon, EditIcon, TrashIcon, PlusIcon } from "../../components/common/TableActionIcons";
import { initialPlayers, baseStats } from "./playersData";
import "../../styles/management.css";
import "../../styles/players.css";

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

// Available Options for Dropdowns
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

export default function PlayersPage() {
  // Persistence state
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("volleyreel_players");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialPlayers;
  });

  useEffect(() => {
    localStorage.setItem("volleyreel_players", JSON.stringify(players));
  }, [players]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("add") === "true") {
      setIsAddOpen(true);
    }
  }, [location]);

  // Search & filter states
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activePlayer, setActivePlayer] = useState(null); // Used for editing & viewing

  // Image upload reference
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Form inputs state
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

  // Reset form helper
  const resetForm = () => {
    setFormName("");
    setFormTeam("");
    setFormPosition("");
    setFormJersey("");
    setFormDOB("");
    setFormGender("Male");
    setFormContact("");
    setFormEmail("");
    setFormHeight("");
    setFormWeight("");
    setFormAddress("");
    setFormStatus("Active");
    setPhotoPreview(null);
  };

  // Open Edit Modal helper
  const openEditModal = (player) => {
    setActivePlayer(player);
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

  // Open View Modal helper
  const openViewModal = (player) => {
    setActivePlayer(player);
    setIsViewOpen(true);
  };

  // Handle Photo upload / drop
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

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        player.name.toLowerCase().includes(q) ||
        player.team.toLowerCase().includes(q) ||
        player.position.toLowerCase().includes(q);

      const matchesTeam = teamFilter === "All" || player.team === teamFilter;
      const matchesPosition = positionFilter === "All" || player.position === positionFilter;
      const matchesStatus = statusFilter === "All" || player.status === statusFilter;

      return matchesSearch && matchesTeam && matchesPosition && matchesStatus;
    });
  }, [players, search, teamFilter, positionFilter, statusFilter]);

  // Paginated items
  const paginatedPlayers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPlayers.slice(startIndex, startIndex + pageSize);
  }, [filteredPlayers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, teamFilter, positionFilter, statusFilter]);

  // Compute dynamic stats by offsetting base stats
  const stats = useMemo(() => {
    const diffCount = players.length - initialPlayers.length;

    // Active diff
    const activeInitialsCount = initialPlayers.filter((p) => p.status === "Active").length;
    const activeCurrentCount = players.filter((p) => p.status === "Active").length;
    const diffActive = activeCurrentCount - activeInitialsCount;

    // Teams diff
    const uniqueTeamsInitial = new Set(initialPlayers.map((p) => p.team));
    const uniqueTeamsCurrent = new Set(players.map((p) => p.team));
    const diffTeams = uniqueTeamsCurrent.size - uniqueTeamsInitial.size;

    return {
      totalPlayers: baseStats.totalPlayers + diffCount,
      activePlayers: baseStats.activePlayers + diffActive,
      teamsCovered: baseStats.teamsCovered + diffTeams,
      recentlyAdded: baseStats.recentlyAdded + (diffCount > 0 ? diffCount : 0)
    };
  }, [players]);

  // Actions: Add Player submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formTeam || !formPosition) {
      alert("Please complete the required fields.");
      return;
    }

    const newPlayer = {
      id: `PL-2026-0${Date.now().toString().slice(-3)}`,
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

    setPlayers([newPlayer, ...players]);
    setIsAddOpen(false);
    resetForm();
  };

  // Actions: Edit Player submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formTeam || !formPosition || !activePlayer) {
      alert("Please complete the required fields.");
      return;
    }

    const updated = players.map((p) => {
      if (p.id === activePlayer.id) {
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
    resetForm();
    setActivePlayer(null);
  };

  // Actions: Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = players.filter((p) => p.id !== deleteTarget.id);
    setPlayers(updated);
    setDeleteTarget(null);
  };

  return (
    <div className="management-page players-page-container">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Header */}
      <header className="mgmt-header">
        <div>
          <h1>Player Management</h1>
          <p>Manage player profiles, assignments, and statistics</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="mgmt-btn mgmt-btn--primary"
          id="btn-add-player"
        >
          <PlusIcon />
          Add Player
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="mgmt-filter-bar">
        <input
          type="search"
          placeholder="Search players by name, team, or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-players"
          style={{ flex: 2 }}
        />
        <CustomSelect
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          options={[{ value: "All", label: "All Teams" }, ...teamOptions]}
          placeholder="Team"
          className="players-filter-select"
        />
        <CustomSelect
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          options={[{ value: "All", label: "All Positions" }, ...positionOptions]}
          placeholder="Position"
          className="players-filter-select"
        />
        <CustomSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "All", label: "All Status" }, ...statusOptions]}
          placeholder="Status"
          className="players-filter-select"
        />
      </div>

      {/* Stats Summary Cards */}
      <div className="mgmt-stats-row">
        <div className="mgmt-stat-card">
          <span>Total Players</span>
          <strong>{stats.totalPlayers}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Active Players</span>
          <strong>{stats.activePlayers}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Teams Covered</span>
          <strong>{stats.teamsCovered}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Recently Added</span>
          <strong>{stats.recentlyAdded}</strong>
        </div>
      </div>

      {/* Players List Table */}
      <div className="mgmt-table-wrap">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Player Name</th>
              <th>Team</th>
              <th>Position</th>
              <th>Jersey No.</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.length > 0 ? (
              paginatedPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    <div
                      className="players-avatar-circle"
                      style={{
                        backgroundColor: !player.photoUrl ? getAvatarBg(player.name) : "transparent"
                      }}
                    >
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="players-avatar-img" />
                      ) : (
                        getInitials(player.name)
                      )}
                    </div>
                  </td>
                  <td>
                    <Link to={`/players/${player.id}`} className="mgmt-table-link">
                      {player.name}
                    </Link>
                  </td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>#{player.jerseyNumber || "-"}</span>
                  </td>
                  <td>{player.contactNumber || "-"}</td>
                  <td>
                    <span
                      className={`mgmt-badge ${
                        player.status === "Active" ? "mgmt-badge--active" : "mgmt-badge--inactive"
                      }`}
                    >
                      {player.status}
                    </span>
                  </td>
                  <td>
                    <div className="mgmt-table-actions">
                      <button
                        type="button"
                        onClick={() => openViewModal(player)}
                        className="mgmt-icon-btn"
                        title="View details"
                      >
                        <ViewIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(player)}
                        className="mgmt-icon-btn"
                        title="Edit player"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(player)}
                        className="mgmt-icon-btn mgmt-icon-btn--danger"
                        title="Delete player"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No player profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Local Pagination */}
        <div className="mgmt-pagination">
          <span>
            Showing {filteredPlayers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredPlayers.length)} of {filteredPlayers.length} players
          </span>
          <div className="mgmt-pagination-controls">
            <button
              type="button"
              className="mgmt-page-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                className={`mgmt-page-btn ${currentPage === pNum ? "active" : ""}`}
                onClick={() => setCurrentPage(pNum)}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              className="mgmt-page-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: Add New Player */}
      {isAddOpen && (
        <div className="players-modal-overlay" role="dialog" aria-modal="true">
          <form onSubmit={handleAddSubmit} className="players-modal">
            <div className="players-modal-header">
              <h2>Add New Player</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="players-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="players-modal-body">
              <div className="players-form-field">
                <label htmlFor="p-add-name">Player Name <span className="required">*</span></label>
                <input
                  id="p-add-name"
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
                  <label htmlFor="p-add-jersey">Jersey Number</label>
                  <input
                    id="p-add-jersey"
                    type="text"
                    placeholder="e.g., 12"
                    value={formJersey}
                    onChange={(e) => setFormJersey(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-add-dob">Date of Birth</label>
                  <input
                    id="p-add-dob"
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
                  <label htmlFor="p-add-contact">Contact Number</label>
                  <input
                    id="p-add-contact"
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-add-email">Email</label>
                <input
                  id="p-add-email"
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
                  <label htmlFor="p-add-height">Height (cm)</label>
                  <input
                    id="p-add-height"
                    type="number"
                    placeholder="185"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-add-weight">Weight (kg)</label>
                  <input
                    id="p-add-weight"
                    type="number"
                    placeholder="75"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-add-address">Address</label>
                <textarea
                  id="p-add-address"
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
                Save Player
              </button>
              <button
                type="button"
                className="mgmt-btn mgmt-btn--outline"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP MODAL: Edit Player */}
      {isEditOpen && activePlayer && (
        <div className="players-modal-overlay" role="dialog" aria-modal="true">
          <form onSubmit={handleEditSubmit} className="players-modal">
            <div className="players-modal-header">
              <h2>Edit Player</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="players-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="players-modal-body">
              <div className="players-form-field">
                <label htmlFor="p-edit-name">Player Name <span className="required">*</span></label>
                <input
                  id="p-edit-name"
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
                  <label htmlFor="p-edit-jersey">Jersey Number</label>
                  <input
                    id="p-edit-jersey"
                    type="text"
                    placeholder="e.g., 12"
                    value={formJersey}
                    onChange={(e) => setFormJersey(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-edit-dob">Date of Birth</label>
                  <input
                    id="p-edit-dob"
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
                  <label htmlFor="p-edit-contact">Contact Number</label>
                  <input
                    id="p-edit-contact"
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-edit-email">Email</label>
                <input
                  id="p-edit-email"
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
                  <label htmlFor="p-edit-height">Height (cm)</label>
                  <input
                    id="p-edit-height"
                    type="number"
                    placeholder="185"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                  />
                </div>
                <div className="players-form-field">
                  <label htmlFor="p-edit-weight">Weight (kg)</label>
                  <input
                    id="p-edit-weight"
                    type="number"
                    placeholder="75"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="players-form-field">
                <label htmlFor="p-edit-address">Address</label>
                <textarea
                  id="p-edit-address"
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
                onClick={() => {
                  setIsEditOpen(false);
                  resetForm();
                  setActivePlayer(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP MODAL: View Details */}
      {isViewOpen && activePlayer && (
        <div className="players-modal-overlay" role="dialog" aria-modal="true">
          <div className="players-modal" style={{ maxWidth: "650px" }}>
            <div className="players-modal-header">
              <h2>Player Profile Details</h2>
              <button type="button" onClick={() => setIsViewOpen(false)} className="players-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="players-modal-body">
              <div className="players-details-grid">
                <div className="players-details-avatar-col">
                  <div
                    className="players-details-avatar"
                    style={{
                      backgroundColor: !activePlayer.photoUrl ? getAvatarBg(activePlayer.name) : "transparent"
                    }}
                  >
                    {activePlayer.photoUrl ? (
                      <img src={activePlayer.photoUrl} alt={activePlayer.name} />
                    ) : (
                      getInitials(activePlayer.name)
                    )}
                  </div>
                  <span
                    className={`mgmt-badge ${
                      activePlayer.status === "Active" ? "mgmt-badge--active" : "mgmt-badge--inactive"
                    }`}
                  >
                    {activePlayer.status}
                  </span>
                </div>

                <div className="players-details-info-col">
                  <div className="players-details-item">
                    <span className="players-details-label">Player Name</span>
                    <span className="players-details-value" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {activePlayer.name}
                    </span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Player ID</span>
                    <span className="players-details-value">{activePlayer.id}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Team Assignment</span>
                    <span className="players-details-value">{activePlayer.team}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Court Position</span>
                    <span className="players-details-value">{activePlayer.position}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Jersey Number</span>
                    <span className="players-details-value">
                      {activePlayer.jerseyNumber ? `#${activePlayer.jerseyNumber}` : "-"}
                    </span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Gender</span>
                    <span className="players-details-value">{activePlayer.gender || "-"}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Date of Birth</span>
                    <span className="players-details-value">{activePlayer.dateOfBirth || "-"}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Contact Number</span>
                    <span className="players-details-value">{activePlayer.contactNumber || "-"}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Email Address</span>
                    <span className="players-details-value">{activePlayer.email || "-"}</span>
                  </div>

                  <div className="players-details-item">
                    <span className="players-details-label">Height / Weight</span>
                    <span className="players-details-value">
                      {activePlayer.height ? `${activePlayer.height} cm` : "-"} /{" "}
                      {activePlayer.weight ? `${activePlayer.weight} kg` : "-"}
                    </span>
                  </div>

                  <div className="players-details-item players-details-value--full">
                    <span className="players-details-label">Address</span>
                    <span className="players-details-value">{activePlayer.address || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="players-modal-footer">
              <button type="button" className="mgmt-btn mgmt-btn--outline" onClick={() => setIsViewOpen(false)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Delete Confirm */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Player Profile"
        description="Are you sure you want to permanently delete this player profile? This action cannot be undone."
        itemName={deleteTarget ? deleteTarget.name : ""}
        confirmLabel="Delete Profile"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
