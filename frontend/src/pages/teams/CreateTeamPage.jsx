import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/apiClient";
import CustomSelect from "../../components/common/CustomSelect";
import { PlusIcon } from "../../components/common/TableActionIcons";
import "../../styles/management.css";

const initialForm = {
  teamId: "TM-2026-006",
  name: "",
  tournament_id: "",
  division: "",
  category: "",
  description: "",
  coach: "",
  clubName: "",
  city: "",
  homeVenue: "",
  foundedYear: "",
  rosterLimit: "15",
  status: "Active",
  notes: "",
};

export default function CreateTeamPage({ mode = "create", initialTeam = null }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const urlTournamentId = searchParams.get("tournament");

  const isEdit = mode === "edit";

  const [form, setForm] = useState(() =>
    initialTeam
      ? {
        ...initialForm,
        teamId: initialTeam.id,
        name: initialTeam.name,
        tournament_id: initialTeam.tournament_id || "",
        division: initialTeam.division || "",
        category: initialTeam.category || "",
        coach: initialTeam.coach || "",
        clubName: initialTeam.clubName || "",
        city: initialTeam.city || "",
        homeVenue: initialTeam.homeVenue || "",
        foundedYear: initialTeam.foundedYear || "",
        rosterLimit: String(initialTeam.rosterLimit || "15"),
        status: initialTeam.status || "Active",
        description: initialTeam.description || "",
        notes: initialTeam.notes || "",
      }
      : { ...initialForm, tournament_id: urlTournamentId || "" }
  );

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Database eken Tournaments (Dropdown ekata daanawa)
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await API.get("/tournaments/");
        setTournaments(response.data);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!form.tournament_id) {
      setError("Please select a Tournament for this team.");
      return;
    }

    try {
      setLoading(true);

      // Backend ekata yawana data geenna (Payload)
      const payload = {
        name: form.name.trim(),
        tournament_id: Number(form.tournament_id),
        coach: form.coach.trim() || null,
        club_name: form.clubName.trim() || null,
        division: form.division.trim() || null,
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        city: form.city.trim() || null,
        home_venue: form.homeVenue.trim() || null,
        founded_year: form.foundedYear.trim() || null,
        roster_limit: Number(form.rosterLimit) || 15,
        status: form.status || "Active",
        notes: form.notes.trim() || null,
      };

      if (!isEdit) {
        // Create (POST)
        await API.post("/teams/", payload);
        alert("Team created successfully!");
        navigate("/teams");
      } else {
        // Update (PUT)
        await API.put(`/teams/${initialTeam.id}`, payload);
        alert("Team updated successfully!");
        navigate(`/teams/${initialTeam.id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-page">
      <header className="mgmt-header">
        <div>
          <h1>{isEdit ? "Edit Team" : "Create Team"}</h1>
          <p>
            {isEdit
              ? "Update team information, roster settings, and branding"
              : "Set up a new volleyball team for rosters, matches, and analytics"}
          </p>
        </div>
      </header>

      {tournaments.length === 0 && (
        <div style={{ padding: "20px 24px", marginBottom: 20, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>🏆</span>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fbbf24", margin: 0 }}>No Active Tournaments Found</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
            You need to create a tournament before assigning teams.
          </p>
          <Link to="/tournaments/create" className="mgmt-btn mgmt-btn--primary" style={{ textDecoration: "none", marginTop: 4 }}>
            + Create a Tournament
          </Link>
        </div>
      )}

      {error && (
        <div className="mgmt-card" style={{ color: "#ef4444", marginBottom: 16, border: "1px solid #ef4444" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Team Details</h2>
          <div className="mgmt-form-grid">

            {/* Tournament Dropdown */}
            <div className="mgmt-field mgmt-form-grid--full">
              <label htmlFor="tournament_id">
                Assign to Tournament <span className="required">*</span>
              </label>
              <select
                id="tournament_id"
                value={form.tournament_id}
                onChange={(e) => setField("tournament_id", e.target.value)}
                required
                className="mgmt-filter-select"
                style={{ width: "100%", padding: "10px", backgroundColor: "var(--surface)", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
              >
                <option value="">-- Choose a Tournament --</option>
                {tournaments.map((t) => (
                  <option key={t.tournament_id} value={t.tournament_id}>
                    TN-{t.tournament_id} : {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mgmt-field">
              <label htmlFor="teamId">Team ID</label>
              <input
                id="teamId"
                value={form.teamId}
                onChange={(e) => setField("teamId", e.target.value)}
                disabled={isEdit} // Edit කරද්දී ID එක වෙනස් කරන්න බැරි වෙන්න දාලා තියෙන්නේ
              />
            </div>

            <div className="mgmt-field">
              <label htmlFor="name">
                Team Name <span className="required">*</span>
              </label>
              <input
                id="name"
                placeholder="e.g., Thunder Strikers"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>

            <div className="mgmt-field">
              <label htmlFor="division">Division</label>
              <input
                id="division"
                placeholder="e.g., Premier"
                value={form.division}
                onChange={(e) => setField("division", e.target.value)}
              />
            </div>

            <div className="mgmt-field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                placeholder="e.g., Men's Senior"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              />
            </div>

            <div className="mgmt-field mgmt-form-grid--full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Brief description of the team..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Coach & Location</h2>
          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="coach">Head Coach</label>
              <input
                id="coach"
                placeholder="e.g., John Anderson"
                value={form.coach}
                onChange={(e) => setField("coach", e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="clubName">Club Name</label>
              <input
                id="clubName"
                placeholder="e.g., Thunder Volleyball Club"
                value={form.clubName}
                onChange={(e) => setField("clubName", e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="homeVenue">Home Venue</label>
              <input
                id="homeVenue"
                placeholder="e.g., Central Sports Complex"
                value={form.homeVenue}
                onChange={(e) => setField("homeVenue", e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                placeholder="e.g., Colombo"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label htmlFor="foundedYear">Founded Year</label>
              <input
                id="foundedYear"
                placeholder="e.g., 2018"
                value={form.foundedYear}
                onChange={(e) => setField("foundedYear", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Team Setup</h2>
          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="rosterLimit">Roster Limit</label>
              <input
                id="rosterLimit"
                type="number"
                value={form.rosterLimit}
                onChange={(e) => setField("rosterLimit", e.target.value)}
              />
            </div>
            <div className="mgmt-field">
              <label>Status</label>
              <CustomSelect
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Draft", label: "Draft" }
                ]}
                id="status"
                className="mgmt-field-select"
              />
            </div>
          </div>
        </section>

        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Branding and Media</h2>
          <div className="mgmt-upload-zone">
            <p>
              <strong>Upload Team Logo</strong>
            </p>
            <p>Drag and drop an image here or click to browse</p>
            <button type="button" className="mgmt-btn mgmt-btn--outline">
              Choose Image
            </button>
            <p>Recommended: 400x400px, PNG or JPG (Max 2MB)</p>
          </div>
        </section>

        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Notes and Additional Settings</h2>
          <div className="mgmt-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              placeholder="Additional notes or instructions for the team..."
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </div>
          <ul className="mgmt-settings-list">
            <li>Public visibility — Team will be visible to all users</li>
            <li>Allow roster sharing — Enable sharing of team roster reports</li>
            <li>Enable match notifications — Notify coach when matches are scheduled</li>
          </ul>
        </section>

        <div className="mgmt-form-footer">
          <Link to="/teams" className="mgmt-btn mgmt-btn--outline">
            Cancel
          </Link>
          <div className="mgmt-form-footer-right">
            <button type="button" className="mgmt-btn mgmt-btn--outline">
              Save as Draft
            </button>
            <button type="submit" className="mgmt-btn mgmt-btn--primary" disabled={loading}>
              <PlusIcon />
              {loading ? "Saving..." : isEdit ? "Update Team" : "Save Team"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}