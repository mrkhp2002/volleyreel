import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/apiClient";
import CustomSelect from "../../components/common/CustomSelect";
import { PlusIcon } from "../../components/common/TableActionIcons";
import "../../styles/management.css";

const initialForm = {
  teamId: "TM-2026-006",
  name: "",
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
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() =>
    initialTeam
      ? {
          ...initialForm,
          teamId: initialTeam.id,
          name: initialTeam.name,
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
        }
      : initialForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      setLoading(true);
      if (!isEdit) {
        await API.post("/teams/", {
          name: form.name.trim(),
          coach: form.coach || null,
          club_name: form.clubName || null,
        });
      }
      navigate(isEdit ? `/teams/${form.teamId}` : "/teams");
    } catch (err) {
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

      {error && (
        <div className="mgmt-card" style={{ color: "#b91c1c", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="mgmt-card">
          <h2 className="mgmt-card-title">Team Details</h2>
          <div className="mgmt-form-grid">
            <div className="mgmt-field">
              <label htmlFor="teamId">
                Team ID <span className="required">*</span>
              </label>
              <input
                id="teamId"
                value={form.teamId}
                onChange={(e) => setField("teamId", e.target.value)}
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
