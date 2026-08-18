import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/management.css"; // Reuse general layout styles

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Form states - Profile loaded from real logged in user context
  const [profileName, setProfileName] = useState(user?.fullName || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileClub, setProfileClub] = useState(user?.club || "");
  const [profileRole, setProfileRole] = useState(user?.role || "Coach");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);

  // Platform tab states
  const [sensitivity, setSensitivity] = useState(85);
  const [courtDetection, setCourtDetection] = useState(true);
  const [ballTracking, setBallTracking] = useState(true);
  const [matchFormat, setMatchFormat] = useState("Best of 5 Sets");
  const [setRules, setSetRules] = useState("25 Point Rally Score");

  // Notifications tab states
  const [digestPref, setDigestPref] = useState("Weekly Digest");
  const [notifyAI, setNotifyAI] = useState(true);
  const [notifyInvite, setNotifyInvite] = useState(true);
  const [notifyRoster, setNotifyRoster] = useState(true);
  const [notifyReports, setNotifyReports] = useState(true);

  // Security tab states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || user.email || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
      setProfileClub(user.club || "");
      setProfileRole(user.role || "Coach");
      if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser({
      fullName: profileName,
      phone: profilePhone,
      club: profileClub,
      role: profileRole,
      avatarUrl: avatarPreview
    });
    showToast("Profile settings saved successfully!");
  };

  const handlePlatformSave = (e) => {
    e.preventDefault();
    showToast("Platform configurations updated!");
  };

  const handleNotificationsSave = (e) => {
    e.preventDefault();
    showToast("Notification preferences updated!");
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Please enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    showToast("Security credentials successfully changed!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setAvatarPreview(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to sync tab clicks to URLSearchParams
  const handleTabClick = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideIn 0.3s ease"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "16px", height: "16px" }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <header className="mgmt-header">
        <div>
          <h1>System Settings</h1>
          <p>Customize your profile, configure default match preferences, and manage notification feeds</p>
        </div>
      </header>

      {/* Settings Navigation Tabs */}
      <div className="mgmt-tabs-nav">
        <button 
          type="button"
          onClick={() => handleTabClick("profile")} 
          className={`mgmt-tab-btn ${activeTab === "profile" ? "active" : ""}`}
        >
          Profile Settings
        </button>
        <button 
          type="button"
          onClick={() => handleTabClick("platform")} 
          className={`mgmt-tab-btn ${activeTab === "platform" ? "active" : ""}`}
        >
          Platform Defaults
        </button>
        <button 
          type="button"
          onClick={() => handleTabClick("notifications")} 
          className={`mgmt-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
        >
          Notifications
        </button>
        <button 
          type="button"
          onClick={() => handleTabClick("security")} 
          className={`mgmt-tab-btn ${activeTab === "security" ? "active" : ""}`}
        >
          Security & Account
        </button>
      </div>

      {/* Settings Tab Panes */}
      <div className="mgmt-settings-pane" style={{ position: "relative", zIndex: 1 }}>
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="mgmt-card" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "30px", padding: "30px" }}>
              
              {/* Avatar upload section */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div style={{ position: "relative" }}>
                  <div 
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "2px dashed rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden"
                    }}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar Preview" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "48px", height: "48px", opacity: 0.3 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid #080b16",
                      boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)"
                    }}
                    title="Change Photo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      style={{ display: "none" }} 
                    />
                  </label>
                </div>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px 0" }}>{profileName}</h3>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "12px" }}>
                    {profileRole}
                  </span>
                </div>
              </div>

              {/* Profile Details Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 className="mgmt-card-title" style={{ marginTop: 0 }}>Personal Biography</h3>
                
                <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                      required
                    />
                  </div>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      readOnly 
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        opacity: 0.6,
                        cursor: "not-allowed",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)} 
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                    />
                  </div>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Club Affiliation</label>
                    <input 
                      type="text" 
                      value={profileClub} 
                      onChange={(e) => setProfileClub(e.target.value)} 
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Roster Role</label>
                  <CustomSelect 
                    value={profileRole} 
                    onChange={(e) => setProfileRole(e.target.value)}
                    options={[
                      { value: "Coach", label: "Coach" },
                      { value: "Assistant Coach", label: "Assistant Coach" },
                      { value: "Analyst", label: "Analyst" },
                      { value: "Player", label: "Player" },
                      { value: "Admin", label: "Administrator" }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="mgmt-btn mgmt-btn--primary">
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "platform" && (
          <form onSubmit={handlePlatformSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="mgmt-card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="mgmt-card-title" style={{ marginTop: 0 }}>Computer Vision (CV) Options</h3>
                
                {/* Calibration Sensitivity */}
                <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.85)" }}>
                      Event Extraction Calibration Threshold
                    </label>
                    <strong style={{ color: "var(--secondary, #3b82f6)" }}>{sensitivity}% Sensitivity</strong>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={sensitivity} 
                    onChange={(e) => setSensitivity(Number(e.target.value))} 
                    style={{
                      width: "100%",
                      height: "6px",
                      borderRadius: "3px",
                      background: "rgba(255,255,255,0.1)",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  />
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Higher sensitivity yields denser telemetry logs but may increase false event classifications in low-resolution video feeds.
                  </p>
                </div>

                {/* Tracking checklist */}
                <ul className="mgmt-settings-list" style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="court-detect"
                      type="checkbox"
                      checked={courtDetection}
                      onChange={(e) => setCourtDetection(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="court-detect" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      Auto-detect court boundary lines in new match video uploads (Computer Vision auto-calibration)
                    </label>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="ball-track"
                      type="checkbox"
                      checked={ballTracking}
                      onChange={(e) => setBallTracking(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="ball-track" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      Enable 3D volleyball trajectory modeling to automatically clip rallies and highlights
                    </label>
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                <h3 className="mgmt-card-title">Default Roster & Rallies Setup</h3>
                
                <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Default Match Format</label>
                    <CustomSelect 
                      value={matchFormat}
                      onChange={(e) => setMatchFormat(e.target.value)}
                      options={[
                        { value: "Best of 5 Sets", label: "Best of 5 Sets" },
                        { value: "Best of 3 Sets", label: "Best of 3 Sets" }
                      ]}
                    />
                  </div>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Default Set Rules</label>
                    <CustomSelect 
                      value={setRules}
                      onChange={(e) => setSetRules(e.target.value)}
                      options={[
                        { value: "25 Point Rally Score", label: "25 Point Rally Score" },
                        { value: "21 Point Rally Score", label: "21 Point Rally Score" },
                        { value: "15 Point Rally Score", label: "15 Point Rally Score" }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="mgmt-btn mgmt-btn--primary">
                Save Platform Preferences
              </button>
            </div>
          </form>
        )}

        {activeTab === "notifications" && (
          <form onSubmit={handleNotificationsSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="mgmt-card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="mgmt-card-title" style={{ marginTop: 0 }}>System Digest Feeds</h3>
                <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "400px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Email Digest Frequencies</label>
                  <CustomSelect 
                    value={digestPref}
                    onChange={(e) => setDigestPref(e.target.value)}
                    options={[
                      { value: "Daily Digest", label: "Send Daily Summaries" },
                      { value: "Weekly Digest", label: "Send Weekly Summaries" },
                      { value: "None", label: "Do Not Send Digests (Alerts Only)" }
                    ]}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                <h3 className="mgmt-card-title">Instant Notification Triggers</h3>
                <ul className="mgmt-settings-list" style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="notify-ai"
                      type="checkbox"
                      checked={notifyAI}
                      onChange={(e) => setNotifyAI(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="notify-ai" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      AI video calibration completed (Highlights, telemetry overlays, and rallies are ready)
                    </label>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="notify-invite"
                      type="checkbox"
                      checked={notifyInvite}
                      onChange={(e) => setNotifyInvite(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="notify-invite" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      New tournament invitations, registration requests, or match scheduling alerts
                    </label>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="notify-roster"
                      type="checkbox"
                      checked={notifyRoster}
                      onChange={(e) => setNotifyRoster(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="notify-roster" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      Team roster amendments (When players are added, edited, or registered on my club profile)
                    </label>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input 
                      id="notify-reports"
                      type="checkbox"
                      checked={notifyReports}
                      onChange={(e) => setNotifyReports(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="notify-reports" style={{ cursor: "pointer", fontSize: "0.88rem" }}>
                      Tournament analytical review sharing reports are published publicly
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="mgmt-btn mgmt-btn--primary">
                Save Notification Settings
              </button>
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSecuritySave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="mgmt-card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div>
                <h3 className="mgmt-card-title" style={{ marginTop: 0 }}>Update Account Credentials</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "450px" }}>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                      required={newPassword.length > 0}
                    />
                  </div>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                      required={currentPassword.length > 0}
                    />
                  </div>
                  <div className="mgmt-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#fff",
                        outline: "none"
                      }}
                      required={currentPassword.length > 0}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ borderTop: "1px solid rgba(239, 68, 68, 0.15)", paddingTop: "20px" }}>
                <h3 style={{ color: "#ef4444", fontSize: "1.12rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", margin: "0 0 10px 0" }}>
                  ⚠️ Danger Zone
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.86rem", color: "var(--text-muted)" }}>
                  Permanently delete your user profile and purge all registered match highlights, telemetry feeds, and data dashboards. This action is irreversible.
                </p>
                <button 
                  type="button" 
                  onClick={() => {
                    if (confirm("Are you absolutely sure you want to permanently delete your VolleyReel account? All telemetry logs and match schedules will be lost forever.")) {
                      alert("Purging account databases...");
                    }
                  }}
                  className="mgmt-btn mgmt-btn--danger"
                  style={{ padding: "8px 16px" }}
                >
                  Delete Account Profile
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="mgmt-btn mgmt-btn--primary">
                Update Password Credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
