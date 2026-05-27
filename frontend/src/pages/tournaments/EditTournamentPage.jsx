import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import { initialTournaments } from "./tournamentsData";
import "../../styles/management.css";

// SVG Upload Icon
function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "32px", height: "32px", color: "var(--secondary, #3b82f6)", marginBottom: "12px" }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const typeOptions = [
  { value: "Round Robin", label: "Round Robin" },
  { value: "Knockout", label: "Knockout" },
  { value: "Double Elimination", label: "Double Elimination" }
];

const categoryOptions = [
  { value: "Men's Senior", label: "Men's Senior" },
  { value: "Women's Senior", label: "Women's Senior" },
  { value: "Mixed Senior", label: "Mixed Senior" },
  { value: "Under 19", label: "Under 19" },
  { value: "Under 17", label: "Under 17" },
  { value: "Men's Open", label: "Men's Open" },
  { value: "Women's Open", label: "Women's Open" }
];

const formatOptions = [
  { value: "Best of 5 Sets", label: "Best of 5 Sets" },
  { value: "Best of 3 Sets", label: "Best of 3 Sets" }
];

const rulesOptions = [
  { value: "25 Point Rally Score", label: "25 Point Rally Score" },
  { value: "21 Point Rally Score", label: "21 Point Rally Score" },
  { value: "15 Point Rally Score", label: "15 Point Rally Score" }
];

const statusOptions = [
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" }
];

export default function EditTournamentPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Round Robin");
  const [category, setCategory] = useState("Men's Senior");
  const [description, setDescription] = useState("");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [organizer, setOrganizer] = useState("");

  const [teamLimit, setTeamLimit] = useState(16);
  const [groupsCount, setGroupsCount] = useState(4);
  const [matchFormat, setMatchFormat] = useState("Best of 5 Sets");
  const [setRules, setSetRules] = useState("25 Point Rally Score");
  const [status, setStatus] = useState("Upcoming");

  const [bannerPreview, setBannerPreview] = useState(null);
  const [notes, setNotes] = useState("");

  // Checkbox settings
  const [publicVis, setPublicVis] = useState(true);
  const [reportSharing, setReportSharing] = useState(true);
  const [leaderboard, setLeaderboard] = useState(true);

  // Populate data
  useEffect(() => {
    if (tournament) {
      setName(tournament.name || "");
      setType(tournament.type || "Round Robin");
      setCategory(tournament.category || "Men's Senior");
      setDescription(tournament.description || "");
      setStartDate(tournament.startDate || "");
      setEndDate(tournament.endDate || "");
      setRegDeadline(tournament.registrationDeadline || "");
      setVenue(tournament.location || "");
      setCity(tournament.city || "");
      setOrganizer(tournament.organizerName || "");
      setTeamLimit(tournament.teamLimit || 16);
      setGroupsCount(tournament.groupsCount || 4);
      setMatchFormat(tournament.matchFormat || "Best of 5 Sets");
      setSetRules(tournament.setRules || "25 Point Rally Score");
      setStatus(tournament.status || "Upcoming");
      setBannerPreview(tournament.bannerUrl || null);
      setNotes(tournament.notes || "");
      setPublicVis(tournament.publicVisibility !== false);
      setReportSharing(tournament.allowReportSharing !== false);
      setLeaderboard(tournament.enableLeaderboard !== false);
    }
  }, [tournament]);

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

  // File choice handler
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Tournament Name is required.");
      return;
    }
    if (!startDate || !endDate) {
      alert("Start Date and End Date are required.");
      return;
    }

    const updatedTournaments = tournaments.map((t) => {
      if (t.id === tournamentId) {
        return {
          ...t,
          name: name.trim(),
          type,
          category,
          description: description.trim(),
          startDate,
          endDate,
          registrationDeadline: regDeadline,
          location: venue.trim(),
          city: city.trim(),
          organizerName: organizer.trim(),
          teamLimit: Number(teamLimit),
          groupsCount: Number(groupsCount),
          matchFormat,
          setRules,
          status,
          bannerUrl: bannerPreview,
          notes: notes.trim(),
          publicVisibility: publicVis,
          allowReportSharing: reportSharing,
          enableLeaderboard: leaderboard
        };
      }
      return t;
    });

    localStorage.setItem("volleyreel_tournaments", JSON.stringify(updatedTournaments));
    navigate("/tournaments");
  };

  return (
    <div className="management-page">
      {/* Ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Header */}
      <header className="mgmt-header">
        <div>
          <h1>Edit Tournament</h1>
          <p>Modify the details, schedule, or setup rules of the tournament</p>
        </div>
      </header>

      {/* Shared Page Navigation Tabs */}
      <div className="mgmt-tabs-nav">
        <Link to="/tournaments" className="mgmt-tab-btn">
          Tournament Directory
        </Link>
        <Link to="/tournaments/create" className="mgmt-tab-btn">
          Create Tournament
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mgmt-form" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Section 1: Tournament Details */}
        <fieldset className="mgmt-card" style={{ border: "none", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <legend className="mgmt-card-title" style={{ fontSize: "1.05rem", fontWeight: 700, paddingBottom: "10px", width: "100%" }}>
            Tournament Details
          </legend>
          
          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label>Tournament ID</label>
              <input type="text" value={tournamentId} readOnly style={{ opacity: 0.7, cursor: "not-allowed" }} />
            </div>
            <div className="mgmt-field">
              <label htmlFor="t-name">Tournament Name <span className="required">*</span></label>
              <input
                id="t-name"
                type="text"
                placeholder="e.g., Spring Championship 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label>Tournament Type</label>
              <CustomSelect
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={typeOptions}
              />
            </div>
            <div className="mgmt-field">
              <label>Tournament Category</label>
              <CustomSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
              />
            </div>
          </div>

          <div className="mgmt-field mgmt-form-grid--full">
            <label htmlFor="t-desc">Description</label>
            <textarea
              id="t-desc"
              placeholder="Brief description of the tournament..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </fieldset>

        {/* Section 2: Schedule and Venue */}
        <fieldset className="mgmt-card" style={{ border: "none", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <legend className="mgmt-card-title" style={{ fontSize: "1.05rem", fontWeight: 700, paddingBottom: "10px", width: "100%" }}>
            Schedule and Venue
          </legend>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="t-start">Start Date <span className="required">*</span></label>
              <input
                id="t-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="t-end">End Date <span className="required">*</span></label>
              <input
                id="t-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="t-deadline">Registration Deadline</label>
              <input
                id="t-deadline"
                type="date"
                value={regDeadline}
                onChange={(e) => setRegDeadline(e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="t-venue">Venue / Location</label>
              <input
                id="t-venue"
                type="text"
                placeholder="e.g., Central Sports Complex"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="t-city">City</label>
              <input
                id="t-city"
                type="text"
                placeholder="e.g., Colombo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="t-organizer">Organizer Name</label>
              <input
                id="t-organizer"
                type="text"
                placeholder="e.g., National Volleyball Federation"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {/* Section 3: Tournament Setup */}
        <fieldset className="mgmt-card" style={{ border: "none", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <legend className="mgmt-card-title" style={{ fontSize: "1.05rem", fontWeight: 700, paddingBottom: "10px", width: "100%" }}>
            Tournament Setup
          </legend>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="t-limit">Team Limit</label>
              <input
                id="t-limit"
                type="number"
                value={teamLimit}
                onChange={(e) => setTeamLimit(Number(e.target.value))}
                min="2"
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="t-groups">Number of Groups</label>
              <input
                id="t-groups"
                type="number"
                value={groupsCount}
                onChange={(e) => setGroupsCount(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label>Match Format</label>
              <CustomSelect
                value={matchFormat}
                onChange={(e) => setMatchFormat(e.target.value)}
                options={formatOptions}
              />
            </div>
            <div className="mgmt-field">
              <label>Set Rules</label>
              <CustomSelect
                value={setRules}
                onChange={(e) => setSetRules(e.target.value)}
                options={rulesOptions}
              />
            </div>
          </div>

          <div className="mgmt-field">
            <label>Status</label>
            <CustomSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </fieldset>

        {/* Section 4: Branding and Media */}
        <fieldset className="mgmt-card" style={{ border: "none", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <legend className="mgmt-card-title" style={{ fontSize: "1.05rem", fontWeight: 700, paddingBottom: "10px", width: "100%" }}>
            Branding and Media
          </legend>

          <div className="mgmt-field">
            <label>Upload Tournament Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            {bannerPreview ? (
              <div className="mgmt-upload-zone" style={{ padding: "10px", position: "relative" }}>
                <img
                  src={bannerPreview}
                  alt="Banner Preview"
                  style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }}
                />
                <button
                  type="button"
                  onClick={() => setBannerPreview(null)}
                  className="mgmt-page-btn"
                  style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(15, 23, 42, 0.8)", minWidth: "30px", height: "30px", padding: 0 }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="mgmt-upload-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ cursor: "pointer" }}
              >
                <UploadCloudIcon />
                <strong>Upload Tournament Banner</strong>
                <p>Drag and drop an image here or click to browse</p>
                <button type="button" className="mgmt-btn mgmt-btn--outline" style={{ padding: "6px 16px", marginTop: "10px" }}>
                  Choose Image
                </button>
                <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>Recommended: 1200x400px, PNG or JPG (Max 5MB)</p>
              </div>
            )}
          </div>
        </fieldset>

        {/* Section 5: Notes and Additional Settings */}
        <fieldset className="mgmt-card" style={{ border: "none", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <legend className="mgmt-card-title" style={{ fontSize: "1.05rem", fontWeight: 700, paddingBottom: "10px", width: "100%" }}>
            Notes and Additional Settings
          </legend>

          <div className="mgmt-field">
            <label htmlFor="t-notes">Notes</label>
            <textarea
              id="t-notes"
              placeholder="Additional notes or instructions for the tournament..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mgmt-field" style={{ marginTop: "10px" }}>
            <ul className="mgmt-settings-list">
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  id="t-public"
                  type="checkbox"
                  checked={publicVis}
                  onChange={(e) => setPublicVis(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="t-public" style={{ fontWeight: "normal", cursor: "pointer" }}>
                  Public visibility - Tournament will be visible to all users
                </label>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  id="t-sharing"
                  type="checkbox"
                  checked={reportSharing}
                  onChange={(e) => setReportSharing(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="t-sharing" style={{ fontWeight: "normal", cursor: "pointer" }}>
                  Allow report sharing - Enable sharing of tournament reports
                </label>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  id="t-lboard"
                  type="checkbox"
                  checked={leaderboard}
                  onChange={(e) => setLeaderboard(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="t-lboard" style={{ fontWeight: "normal", cursor: "pointer" }}>
                  Enable automatic leaderboard - Auto-update leaderboard based on match results
                </label>
              </li>
            </ul>
          </div>
        </fieldset>

        {/* Footer buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/tournaments")}
            className="mgmt-btn mgmt-btn--outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="mgmt-btn mgmt-btn--primary"
          >
            Update Tournament
          </button>
        </div>
      </form>
    </div>
  );
}
