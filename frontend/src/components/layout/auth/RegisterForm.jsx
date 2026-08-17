import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import useAuth from "../../../hooks/useAuth";
import CustomSelect from "../../common/CustomSelect";

const initialForm = {
  fullName: "",
  email: "",
  role: "",
  teamId: "",
  teamName: "",
  position: "Outside Hitter",
  jerseyNumber: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Teams state for player role
  const [teamsList, setTeamsList] = useState([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const teamDropdownRef = useRef(null);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Close team dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target)) {
        setIsTeamDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch existing teams when role is 'player'
  useEffect(() => {
    if (form.role === "player") {
      const fetchTeams = async () => {
        try {
          const res = await API.get("/auth/teams").catch(() => API.get("/teams/"));
          if (Array.isArray(res.data)) {
            setTeamsList(res.data);
          }
        } catch (e) {
          console.error("Error loading teams for registration:", e);
        }
      };
      fetchTeams();
    }
  }, [form.role]);

  // Filter teams based on search query
  const filteredTeams = teamsList.filter((t) => {
    if (!teamSearchQuery) return true;
    const q = teamSearchQuery.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.coach && t.coach.toLowerCase().includes(q)) ||
      (t.club_name && t.club_name.toLowerCase().includes(q)) ||
      (t.division && t.division.toLowerCase().includes(q))
    );
  });

  const validateForm = () => {
    if (!form.fullName || !form.email || !form.role || !form.password || !form.confirmPassword) {
      return "Please complete all required fields.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!form.acceptedTerms) {
      return "Please agree to the Terms of Service and Privacy Policy.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const chosenRole = (form.role || "coach").toLowerCase();

      const payload = {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
        role: chosenRole,
      };

      if (chosenRole === "player" && form.teamId) {
        payload.team_id = Number(form.teamId);
        payload.position = form.position || "Outside Hitter";
        payload.jersey_number = form.jerseyNumber ? Number(form.jerseyNumber) : 7;
      }

      await API.post("/auth/register", payload);

      // Automatically sign in the user
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (loginRes.data && loginRes.data.access_token) {
        const userRole = (loginRes.data.role || chosenRole).toLowerCase();
        
        login({
          email: loginRes.data.email || form.email,
          fullName: loginRes.data.full_name || form.fullName,
          access_token: loginRes.data.access_token,
          role: userRole,
          team_id: loginRes.data.team_id || (form.teamId ? Number(form.teamId) : null),
          team_name: loginRes.data.team_name || form.teamName || (selectedTeam ? selectedTeam.name : ""),
        });

        // Store player specific details in local profile
        if (userRole === "player") {
          const profileExtra = {
            club: form.teamName || (selectedTeam ? selectedTeam.name : ""),
            position: form.position || "Outside Hitter",
            jerseyNumber: form.jerseyNumber || "7",
            phone: "",
            address: "",
            city: selectedTeam?.club_name || "",
            country: "",
            height: "6'1\" (185 cm)",
            dominantHand: "Right",
            joinedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            lastActive: "Active Now"
          };
          localStorage.setItem("volleyreel_profile_extra", JSON.stringify(profileExtra));
          navigate("/profile");
        } else if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create account right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: "460px" }}>
      <h2>Create Account</h2>
      <p>Set up your account to get started with VolleyReel</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={form.fullName}
            disabled={loading}
            onChange={(e) => setField("fullName", e.target.value)}
          />
        </div>

        <label htmlFor="email">Email Address</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            disabled={loading}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        <label>Role</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <CustomSelect
            value={form.role}
            onChange={(e) => {
              const val = e.target.value;
              setField("role", val);
              if (val !== "player") {
                setSelectedTeam(null);
                setField("teamId", "");
                setField("teamName", "");
              }
            }}
            options={[
              { value: "coach", label: "Coach" },
              { value: "player", label: "Player" },
            ]}
            placeholder="Select your role..."
            id="role"
            className="auth-custom-select"
          />
        </div>

        {/* Dynamic Searchable Team Section for Player Role */}
        {form.role === "player" && (
          <div className="auth-team-section" ref={teamDropdownRef}>
            <div className="auth-team-section-header">
              <span className="auth-team-section-title">Team &amp; Athletic Profile</span>
              {selectedTeam ? (
                <span className="auth-team-status-tag">✓ Attached</span>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Required for roster</span>
              )}
            </div>

            {selectedTeam ? (
              <div className="auth-selected-team-card">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="auth-team-avatar">
                    {selectedTeam.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="auth-team-name">{selectedTeam.name}</div>
                    <div className="auth-team-meta">
                      {selectedTeam.division || "Premier"} {selectedTeam.coach ? `• Coach ${selectedTeam.coach}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(null);
                    setField("teamId", "");
                    setField("teamName", "");
                  }}
                  className="auth-team-change-btn"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="auth-team-search-wrap">
                <div className="input-group-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search existing team by name, coach or division..."
                    value={teamSearchQuery}
                    onChange={(e) => {
                      setTeamSearchQuery(e.target.value);
                      setIsTeamDropdownOpen(true);
                    }}
                    onFocus={() => setIsTeamDropdownOpen(true)}
                  />
                </div>

                {isTeamDropdownOpen && (
                  <div className="auth-team-dropdown-list">
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map((team) => (
                        <div
                          key={team.team_id}
                          className="auth-team-item"
                          onClick={() => {
                            setSelectedTeam(team);
                            setField("teamId", team.team_id);
                            setField("teamName", team.name);
                            setIsTeamDropdownOpen(false);
                            setTeamSearchQuery("");
                          }}
                        >
                          <div className="auth-team-item-info">
                            <div className="auth-team-avatar">
                              {team.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="auth-team-name">{team.name}</div>
                              <div className="auth-team-meta">
                                {team.division || "Premier"} {team.coach ? `• Coach ${team.coach}` : ""}
                              </div>
                            </div>
                          </div>
                          <span className="auth-team-select-btn">Select</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                        {teamsList.length === 0 ? "No teams found in the system." : "No matching team found."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Position & Jersey # Grid */}
            <div className="auth-player-attrs-grid">
              <div>
                <label htmlFor="position" style={{ margin: "4px 0 6px", fontSize: "0.8rem" }}>Position</label>
                <div className="input-group-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  <CustomSelect
                    value={form.position}
                    onChange={(e) => setField("position", e.target.value)}
                    options={[
                      { value: "Outside Hitter", label: "Outside Hitter" },
                      { value: "Opposite Hitter", label: "Opposite Hitter" },
                      { value: "Middle Blocker", label: "Middle Blocker" },
                      { value: "Setter", label: "Setter" },
                      { value: "Libero", label: "Libero" },
                    ]}
                    placeholder="Select Position"
                    id="position"
                    className="auth-custom-select"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="jerseyNumber" style={{ margin: "4px 0 6px", fontSize: "0.8rem" }}>Jersey Number</label>
                <div className="input-group-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <line x1="4" y1="15" x2="20" y2="15" />
                    <line x1="10" y1="3" x2="8" y2="21" />
                    <line x1="16" y1="3" x2="14" y2="21" />
                  </svg>
                  <input
                    id="jerseyNumber"
                    type="number"
                    min="0"
                    max="99"
                    placeholder="e.g. 7"
                    value={form.jerseyNumber}
                    onChange={(e) => setField("jerseyNumber", e.target.value)}
                    style={{ height: "47px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <label htmlFor="password">Password</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={form.password}
            disabled={loading}
            onChange={(e) => setField("password", e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            disabled={loading}
            onChange={(e) => setField("confirmPassword", e.target.value)}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <label className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            disabled={loading}
            onChange={(e) => setField("acceptedTerms", e.target.checked)}
          />
          <span>
            I agree to the <a href="#!">Terms of Service</a> and <a href="#!">Privacy Policy</a>
          </span>
        </label>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-switch-text">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
