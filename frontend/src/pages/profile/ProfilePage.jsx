import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import API from "../../services/apiClient";
import "../../styles/management.css";
import "../../styles/profile.css";

// SVG Icons
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
      <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef(null);

  // Normalize role
  const rawRole = (user?.role || "coach").toLowerCase();
  const isPlayer = rawRole === "player";
  const isAdmin = rawRole === "admin";
  const displayRole = isPlayer ? "Player" : isAdmin ? "Administrator" : rawRole === "public_user" ? "Public User" : "Coach";

  // Load from context with fallback defaults
  const fullName = user?.fullName || (isPlayer ? "Player Athlete" : "Coach User");
  const email = user?.email || (isPlayer ? "player@volleyreel.com" : "coach@volleyreel.com");

  // Live Activity Stats from Database
  const [liveStats, setLiveStats] = useState({
    tournamentsManaged: 0,
    matchesManaged: 0,
    reportsCreated: 0,
    lastLogin: "Active Now"
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const statsRes = await API.get("/dashboard/stats");
        if (statsRes.data) {
          setLiveStats((prev) => ({
            ...prev,
            tournamentsManaged: statsRes.data.total_tournaments || 0,
            matchesManaged: statsRes.data.total_matches || 0,
            reportsCreated: statsRes.data.total_tournaments || 0,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile live stats", err);
      }
    }
    fetchStats();
  }, []);

  // Additional profile states persisted in localStorage without hardcoded dummy addresses
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("volleyreel_profile_extra");
    const userTeam = user?.team_name || user?.teamName || "";
    const defaultData = {
      phone: "",
      club: isPlayer ? (userTeam || "Independent / No Team") : "VolleyReel Analytics Platform",
      address: "",
      city: "",
      country: "",
      position: isPlayer ? "Outside Hitter" : "",
      jerseyNumber: isPlayer ? "7" : "",
      height: isPlayer ? "6'1\" (185 cm)" : "",
      dominantHand: "Right",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      lastActive: "Active Now",
      avatarUrl: user?.avatarUrl || null,
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear any old fake dummy data strings if present
        if (parsed.address === "123 Sports Avenue") parsed.address = "";
        if (parsed.city === "Los Angeles") parsed.city = "";
        if (parsed.country === "United States") parsed.country = "";
        if (parsed.phone === "+1 (555) 123-4567") parsed.phone = "";
        if (userTeam && (!parsed.club || parsed.club === "Thunder Strikers VC")) {
          parsed.club = userTeam;
        }
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultData;
  });

  // Sync profile extra data to local storage
  useEffect(() => {
    localStorage.setItem("volleyreel_profile_extra", JSON.stringify(profileData));
  }, [profileData]);

  // Keep avatar synchronized with Auth context
  useEffect(() => {
    if (user?.avatarUrl && user.avatarUrl !== profileData.avatarUrl) {
      setProfileData((prev) => ({ ...prev, avatarUrl: user.avatarUrl }));
    }
  }, [user?.avatarUrl]);

  // Preferences state
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("volleyreel_preferences");
    const defaultPrefs = {
      notifications: "Email notifications enabled",
      language: "English (US)",
      theme: "Dark",
      sidebarMode: "Expanded"
    };

    if (saved) {
      try {
        return { ...defaultPrefs, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return defaultPrefs;
  });

  // Sync preferences to local storage
  useEffect(() => {
    localStorage.setItem("volleyreel_preferences", JSON.stringify(preferences));
  }, [preferences]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Extract first and last names
  const nameParts = fullName.trim().split(/\s+/);
  const firstNameVal = nameParts[0] || "";
  const lastNameVal = nameParts.slice(1).join(" ") || "";

  // Modals state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editPrefKey, setEditPrefKey] = useState(null);

  // Modal form states - Profile
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formClub, setFormClub] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formJerseyNumber, setFormJerseyNumber] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formDominantHand, setFormDominantHand] = useState("Right");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formAvatar, setFormAvatar] = useState(null);

  // Modal form states - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modal form states - Preferences
  const [prefValue, setPrefValue] = useState("");

  // Populate form details when opening modals
  useEffect(() => {
    if (editProfileOpen) {
      setFormFirstName(firstNameVal);
      setFormLastName(lastNameVal);
      setFormPhone(profileData.phone || "");
      setFormClub(profileData.club || "");
      setFormPosition(profileData.position || (isPlayer ? "Outside Hitter" : ""));
      setFormJerseyNumber(profileData.jerseyNumber || (isPlayer ? "7" : ""));
      setFormHeight(profileData.height || "");
      setFormDominantHand(profileData.dominantHand || "Right");
      setFormAddress(profileData.address || "");
      setFormCity(profileData.city || "");
      setFormCountry(profileData.country || "");
      setFormAvatar(profileData.avatarUrl || user?.avatarUrl || null);
    }
  }, [editProfileOpen, firstNameVal, lastNameVal, profileData, user, isPlayer]);

  // Initialize preference value edit state
  useEffect(() => {
    if (editPrefKey) {
      setPrefValue(preferences[editPrefKey]);
    }
  }, [editPrefKey, preferences]);

  // Actions
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedFullName = `${formFirstName.trim()} ${formLastName.trim()}`.trim();
    
    // Update Auth context for synchronized header display
    updateUser({ 
      fullName: updatedFullName,
      avatarUrl: formAvatar,
      role: rawRole
    });

    // Update Profile Extra details
    setProfileData((prev) => ({
      ...prev,
      phone: formPhone.trim(),
      club: formClub.trim(),
      position: formPosition,
      jerseyNumber: formJerseyNumber.trim(),
      height: formHeight.trim(),
      dominantHand: formDominantHand,
      address: formAddress.trim(),
      city: formCity.trim(),
      country: formCountry.trim(),
      avatarUrl: formAvatar
    }));

    setEditProfileOpen(false);
    showToast(`${displayRole} profile details updated successfully!`);
  };

  const handleDirectAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result;
        setProfileData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
        updateUser({ avatarUrl: newAvatarUrl });
        showToast("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Current password is required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }
    setChangePasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated successfully!");
  };

  const handleSavePreference = (e) => {
    e.preventDefault();
    setPreferences((prev) => ({
      ...prev,
      [editPrefKey]: prefValue
    }));
    setEditPrefKey(null);
    showToast("Preference successfully updated!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar display fallback: seed avatar or user uploaded image
  const displayAvatar =
    profileData.avatarUrl ||
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=1d4ed8,3b82f6`;

  return (
    <div className="management-page">
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Toast message alert pop-up */}
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

      {/* Page Header */}
      <header className="mgmt-header">
        <div>
          <h1>{isPlayer ? "Player Profile" : `${displayRole} Profile`}</h1>
          <p>
            {isPlayer 
              ? "Manage your athlete information, playing position, and volleyball profile" 
              : "Manage your personal information and account details"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            type="button" 
            className="mgmt-btn mgmt-btn--primary"
            onClick={() => setEditProfileOpen(true)}
          >
            <EditIcon />
            {isPlayer ? "Edit Player Profile" : "Edit Profile"}
          </button>
          <button 
            type="button" 
            className="mgmt-btn mgmt-btn--outline"
            onClick={() => setChangePasswordOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "14px", height: "14px" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change Password
          </button>
        </div>
      </header>

      {/* Main Grid Panels */}
      <div className="profile-grid">
        
        {/* Left Column Panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Card 1: Profile Summary Card with Profile Picture */}
          <div className="mgmt-card" style={{ padding: "24px" }}>
            <div className="profile-summary-header">
              {/* Profile Avatar Image with Hover Upload Trigger */}
              <div 
                className="profile-summary-avatar-wrap"
                onClick={() => avatarInputRef.current?.click()}
                title="Click to upload/change profile photo"
                style={{ cursor: "pointer" }}
              >
                <img src={displayAvatar} alt={fullName} />
                <div className="profile-avatar-overlay-btn" title="Change Photo">
                  <CameraIcon />
                  <span style={{ marginLeft: "4px" }}>Change</span>
                </div>
                <input 
                  ref={avatarInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleDirectAvatarChange} 
                  style={{ display: "none" }} 
                />
              </div>

              <div className="profile-summary-info">
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>{fullName}</h2>
                  <div className="profile-summary-badges">
                    <span 
                      className="mgmt-badge" 
                      style={{ 
                        background: isPlayer ? "rgba(59, 130, 246, 0.18)" : "rgba(245, 158, 11, 0.18)",
                        color: isPlayer ? "#60a5fa" : "#f59e0b",
                        border: isPlayer ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)",
                        fontWeight: 700
                      }}
                    >
                      {displayRole}
                    </span>
                    {isPlayer && profileData.jerseyNumber && (
                      <span className="mgmt-badge mgmt-badge--ongoing" style={{ fontWeight: 800 }}>
                        #{profileData.jerseyNumber}
                      </span>
                    )}
                    <span className="mgmt-badge mgmt-badge--completed">Active</span>
                  </div>
                </div>
                
                <div className="profile-summary-details">
                  <div className="profile-summary-detail-item">
                    <MailIcon />
                    <span>{email}</span>
                  </div>
                  {isPlayer && profileData.position && (
                    <div className="profile-summary-detail-item" style={{ color: "#38bdf8", fontWeight: 600 }}>
                      <TrophyIcon />
                      <span>{profileData.position}</span>
                    </div>
                  )}
                  {profileData.phone ? (
                    <div className="profile-summary-detail-item">
                      <PhoneIcon />
                      <span>{profileData.phone}</span>
                    </div>
                  ) : (
                    <div className="profile-summary-detail-item" style={{ opacity: 0.65 }}>
                      <PhoneIcon />
                      <span>No phone added</span>
                    </div>
                  )}
                  <div className="profile-summary-detail-item">
                    <BuildingIcon />
                    <span>{profileData.club || (isPlayer ? "Thunder Strikers VC" : "VolleyReel Analytics Platform")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-summary-footer">
              <div className="profile-summary-footer-item">
                <CalendarIcon />
                <span>Joined {profileData.joinedDate}</span>
              </div>
              <div className="profile-summary-footer-item">
                <ClockIcon />
                <span>Last Active {profileData.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Personal & Athlete Details Card */}
          <div className="mgmt-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 className="mgmt-card-title" style={{ borderBottom: "none", margin: 0, paddingBottom: 0 }}>
                {isPlayer ? "Athlete & Personal Information" : "Personal Information"}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditProfileOpen(true)}
                className="profile-pref-edit-btn"
                style={{ fontSize: "0.8rem", padding: "4px 10px" }}
              >
                ✎ Edit Details
              </button>
            </div>

            <div className="profile-label-value-grid">
              <div className="profile-info-block">
                <span className="profile-info-label">First Name</span>
                <span className="profile-info-value">{firstNameVal || "—"}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Last Name</span>
                <span className="profile-info-value">{lastNameVal || "—"}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{email}</span>
              </div>

              {/* Player Specific Fields */}
              {isPlayer && (
                <>
                  <div className="profile-info-block">
                    <span className="profile-info-label">Playing Position</span>
                    <span className="profile-info-value" style={{ color: "#38bdf8", fontWeight: 700 }}>
                      {profileData.position || "Outside Hitter"}
                    </span>
                  </div>
                  <div className="profile-info-block">
                    <span className="profile-info-label">Jersey Number</span>
                    <span className="profile-info-value" style={{ color: "#f59e0b", fontWeight: 700 }}>
                      {profileData.jerseyNumber ? `#${profileData.jerseyNumber}` : "Not specified"}
                    </span>
                  </div>
                  <div className="profile-info-block">
                    <span className="profile-info-label">Team / Club</span>
                    <span className="profile-info-value">
                      {profileData.club || "Thunder Strikers VC"}
                    </span>
                  </div>
                  <div className="profile-info-block">
                    <span className="profile-info-label">Height</span>
                    <span className="profile-info-value">
                      {profileData.height || "Not specified"}
                    </span>
                  </div>
                  <div className="profile-info-block">
                    <span className="profile-info-label">Dominant Hand</span>
                    <span className="profile-info-value">
                      {profileData.dominantHand || "Right"}
                    </span>
                  </div>
                </>
              )}
              
              <div className="profile-info-block">
                <span className="profile-info-label">Phone Number</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span className="profile-info-value" style={{ color: profileData.phone ? "#ffffff" : "#64748b", fontStyle: profileData.phone ? "normal" : "italic", fontWeight: profileData.phone ? 700 : 500 }}>
                    {profileData.phone || "Not specified"}
                  </span>
                  {!profileData.phone && (
                    <button type="button" onClick={() => setEditProfileOpen(true)} className="profile-pref-edit-btn" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-info-block">
                <span className="profile-info-label">Address</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span className="profile-info-value" style={{ color: profileData.address ? "#ffffff" : "#64748b", fontStyle: profileData.address ? "normal" : "italic", fontWeight: profileData.address ? 700 : 500 }}>
                    {profileData.address || "Not specified"}
                  </span>
                  {!profileData.address && (
                    <button type="button" onClick={() => setEditProfileOpen(true)} className="profile-pref-edit-btn" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-info-block">
                <span className="profile-info-label">City</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span className="profile-info-value" style={{ color: profileData.city ? "#ffffff" : "#64748b", fontStyle: profileData.city ? "normal" : "italic", fontWeight: profileData.city ? 700 : 500 }}>
                    {profileData.city || "Not specified"}
                  </span>
                  {!profileData.city && (
                    <button type="button" onClick={() => setEditProfileOpen(true)} className="profile-pref-edit-btn" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-info-block">
                <span className="profile-info-label">Country</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span className="profile-info-value" style={{ color: profileData.country ? "#ffffff" : "#64748b", fontStyle: profileData.country ? "normal" : "italic", fontWeight: profileData.country ? 700 : 500 }}>
                    {profileData.country || "Not specified"}
                  </span>
                  {!profileData.country && (
                    <button type="button" onClick={() => setEditProfileOpen(true)} className="profile-pref-edit-btn" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Account Information Card */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Account Information</h3>
            <div className="profile-label-value-grid">
              <div className="profile-info-block">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value" style={{ fontWeight: 700, color: "#60a5fa" }}>{displayRole}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Account Type</span>
                <span className="profile-info-value">Standard Athlete</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Joined Date</span>
                <span className="profile-info-value">{profileData.joinedDate}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Last Login</span>
                <span className="profile-info-value">{liveStats.lastLogin}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Status</span>
                <span className="mgmt-badge mgmt-badge--completed" style={{ width: "fit-content", display: "inline-block" }}>Active</span>
              </div>
            </div>
          </div>

          {/* Card 4: Preferences Card */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Preferences</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="profile-pref-item">
                <div className="profile-pref-info">
                  <span className="profile-pref-title">Notification Preferences</span>
                  <span className="profile-pref-desc">{preferences.notifications}</span>
                </div>
                <button 
                  type="button" 
                  className="profile-pref-edit-btn"
                  onClick={() => setEditPrefKey("notifications")}
                >
                  Edit
                </button>
              </div>

              <div className="profile-pref-item">
                <div className="profile-pref-info">
                  <span className="profile-pref-title">Language</span>
                  <span className="profile-pref-desc">{preferences.language}</span>
                </div>
                <button 
                  type="button" 
                  className="profile-pref-edit-btn"
                  onClick={() => setEditPrefKey("language")}
                >
                  Edit
                </button>
              </div>

              <div className="profile-pref-item">
                <div className="profile-pref-info">
                  <span className="profile-pref-title">Theme</span>
                  <span className="profile-pref-desc">{preferences.theme}</span>
                </div>
                <button 
                  type="button" 
                  className="profile-pref-edit-btn"
                  onClick={() => setEditPrefKey("theme")}
                >
                  Edit
                </button>
              </div>

              <div className="profile-pref-item">
                <div className="profile-pref-info">
                  <span className="profile-pref-title">Sidebar Mode</span>
                  <span className="profile-pref-desc">{preferences.sidebarMode}</span>
                </div>
                <button 
                  type="button" 
                  className="profile-pref-edit-btn"
                  onClick={() => setEditPrefKey("sidebarMode")}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column Panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Card 5: Security Card */}
          <div className="mgmt-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(20, 184, 166, 0.12)", border: "1px solid rgba(20, 184, 166, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6", flexShrink: 0 }}>
                <ShieldIcon />
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>Security &amp; Account</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Authentication &amp; Session Controls</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>
                    Password Last Changed
                  </span>
                  <strong style={{ fontSize: "0.88rem", color: "#ffffff" }}>February 10, 2026</strong>
                </div>
                <button type="button" onClick={() => setChangePasswordOpen(true)} className="profile-pref-edit-btn" style={{ fontSize: "0.78rem" }}>
                  Change
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>
                    Two-Factor Authentication
                  </span>
                  <span className="mgmt-badge mgmt-badge--inactive" style={{ fontSize: "0.72rem" }}>Not Enabled</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>
                  Active Session
                </span>
                <strong style={{ fontSize: "0.88rem", color: "#ffffff" }}>1 Active Device (Current Browser)</strong>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setChangePasswordOpen(true)}
              className="mgmt-btn mgmt-btn--block"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 15px rgba(13, 148, 136, 0.2)",
                marginTop: "4px"
              }}
            >
              Manage Security Settings
            </button>
          </div>

          {/* Card 6: Activity Summary Card */}
          <div className="mgmt-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="mgmt-card-title" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              {isPlayer ? "Player Activity" : "Activity Summary"}
            </h3>
            
            <div className="profile-activity-cards-list">
              {isPlayer ? (
                <>
                  <div className="profile-activity-stat-card profile-activity-stat-card--blue">
                    <span>Matches Played</span>
                    <strong>{liveStats.matchesManaged || 12}</strong>
                  </div>
                  <div className="profile-activity-stat-card profile-activity-stat-card--amber">
                    <span>Highlight Clips</span>
                    <strong>{liveStats.reportsCreated * 4 || 18}</strong>
                  </div>
                  <div className="profile-activity-stat-card profile-activity-stat-card--teal">
                    <span>Tournaments</span>
                    <strong>{liveStats.tournamentsManaged || 2}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-activity-stat-card profile-activity-stat-card--amber">
                    <span>Reports Created</span>
                    <strong>{liveStats.reportsCreated}</strong>
                  </div>
                  <div className="profile-activity-stat-card profile-activity-stat-card--blue">
                    <span>Matches Managed</span>
                    <strong>{liveStats.matchesManaged}</strong>
                  </div>
                  <div className="profile-activity-stat-card profile-activity-stat-card--teal">
                    <span>Tournaments Managed</span>
                    <strong>{liveStats.tournamentsManaged}</strong>
                  </div>
                </>
              )}
            </div>

            <div 
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                padding: "12px",
                textAlign: "center",
                marginTop: "4px"
              }}
            >
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "2px" }}>
                Last Login
              </span>
              <strong style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 700 }}>
                {liveStats.lastLogin}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}

      {/* Modal 1: Edit Profile details overlay */}
      {editProfileOpen && (
        <div className="profile-modal-overlay" onClick={() => setEditProfileOpen(false)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <EditIcon />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                    {isPlayer ? "Edit Player Profile Details" : "Edit User Profile Details"}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
                    {isPlayer ? "Update your athlete position, jersey number, and contact info" : "Update your personal information & contact details"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="profile-modal-form">
              {/* Profile Picture Upload Section */}
              <div className="mgmt-field" style={{ marginBottom: "14px" }}>
                <label>Profile Picture</label>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "6px" }}>
                  <div 
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      border: "2px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }}
                  >
                    {formAvatar ? (
                      <img src={formAvatar} alt="Upload Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (formFirstName[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      style={{ fontSize: "0.82rem", color: "var(--text-muted)" }} 
                    />
                    {formAvatar && (
                      <button
                        type="button"
                        onClick={() => setFormAvatar(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f87171",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                          textDecoration: "underline"
                        }}
                      >
                        Remove custom photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Grid Names */}
              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-first">First Name *</label>
                  <input 
                    id="p-first"
                    type="text" 
                    placeholder="Enter first name"
                    value={formFirstName} 
                    onChange={(e) => setFormFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-last">Last Name *</label>
                  <input 
                    id="p-last"
                    type="text" 
                    placeholder="Enter last name"
                    value={formLastName} 
                    onChange={(e) => setFormLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Player Specific Position & Jersey Fields */}
              {isPlayer && (
                <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="mgmt-field">
                    <label>Position *</label>
                    <CustomSelect
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      options={[
                        { value: "Outside Hitter", label: "Outside Hitter" },
                        { value: "Opposite Spiker", label: "Opposite Spiker" },
                        { value: "Setter", label: "Setter" },
                        { value: "Middle Blocker", label: "Middle Blocker" },
                        { value: "Libero", label: "Libero" },
                        { value: "Defensive Specialist", label: "Defensive Specialist" }
                      ]}
                    />
                  </div>
                  <div className="mgmt-field">
                    <label htmlFor="p-jersey">Jersey Number</label>
                    <input 
                      id="p-jersey"
                      type="text" 
                      placeholder="e.g. 7"
                      value={formJerseyNumber} 
                      onChange={(e) => setFormJerseyNumber(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {/* Player Specific Height & Dominant Hand */}
              {isPlayer && (
                <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="mgmt-field">
                    <label htmlFor="p-height">Height</label>
                    <input 
                      id="p-height"
                      type="text" 
                      placeholder="e.g. 6 ft 2 in (188 cm)"
                      value={formHeight} 
                      onChange={(e) => setFormHeight(e.target.value)} 
                    />
                  </div>
                  <div className="mgmt-field">
                    <label>Dominant Hand</label>
                    <CustomSelect
                      value={formDominantHand}
                      onChange={(e) => setFormDominantHand(e.target.value)}
                      options={[
                        { value: "Right", label: "Right Handed" },
                        { value: "Left", label: "Left Handed" },
                        { value: "Ambidextrous", label: "Ambidextrous" }
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Form Grid Phone & Club */}
              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-phone">Phone Number</label>
                  <input 
                    id="p-phone"
                    type="tel" 
                    placeholder="e.g. +94 77 123 4567 or +91 98765 43210"
                    value={formPhone} 
                    onChange={(e) => setFormPhone(e.target.value)} 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-club">{isPlayer ? "Team / Club" : "Club / Affiliation"}</label>
                  <input 
                    id="p-club"
                    type="text" 
                    placeholder="e.g. Thunder Strikers VC"
                    value={formClub} 
                    onChange={(e) => setFormClub(e.target.value)} 
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mgmt-field">
                <label htmlFor="p-addr">Address</label>
                <input 
                  id="p-addr"
                  type="text" 
                  placeholder="Enter street address (optional)"
                  value={formAddress} 
                  onChange={(e) => setFormAddress(e.target.value)} 
                />
              </div>

              {/* City & Country */}
              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-city">City</label>
                  <input 
                    id="p-city"
                    type="text" 
                    placeholder="e.g. Colombo, Mumbai, London"
                    value={formCity} 
                    onChange={(e) => setFormCity(e.target.value)} 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-cntry">Country</label>
                  <input 
                    id="p-cntry"
                    type="text" 
                    placeholder="e.g. Sri Lanka, India, UK, USA"
                    value={formCountry} 
                    onChange={(e) => setFormCountry(e.target.value)} 
                  />
                </div>
              </div>

              <div className="profile-modal-footer" style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button 
                  type="button" 
                  className="mgmt-btn mgmt-btn--outline"
                  onClick={() => setEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="mgmt-btn mgmt-btn--primary"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Change Password overlay */}
      {changePasswordOpen && (
        <div className="profile-modal-overlay" onClick={() => setChangePasswordOpen(false)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "18px", height: "18px" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password Credentials
            </h3>
            
            <form onSubmit={handleChangePassword} className="profile-modal-form">
              <div className="mgmt-field">
                <label htmlFor="cp-curr">Current Password *</label>
                <input 
                  id="cp-curr"
                  type="password" 
                  placeholder="Enter current password"
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="mgmt-field">
                <label htmlFor="cp-new">New Password *</label>
                <input 
                  id="cp-new"
                  type="password" 
                  placeholder="Enter new password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="mgmt-field">
                <label htmlFor="cp-conf">Confirm New Password *</label>
                <input 
                  id="cp-conf"
                  type="password" 
                  placeholder="Confirm new password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="profile-modal-footer">
                <button 
                  type="button" 
                  className="mgmt-btn mgmt-btn--outline"
                  onClick={() => setChangePasswordOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="mgmt-btn mgmt-btn--primary"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Preferences overlay */}
      {editPrefKey && (
        <div className="profile-modal-overlay" onClick={() => setEditPrefKey(null)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3>Edit {editPrefKey.charAt(0).toUpperCase() + editPrefKey.slice(1)} Preference</h3>
            
            <form onSubmit={handleSavePreference} className="profile-modal-form">
              <div className="mgmt-field">
                <label htmlFor="pref-val">Preference Value</label>
                {editPrefKey === "notifications" && (
                  <CustomSelect
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Email notifications enabled", label: "Email notifications enabled" },
                      { value: "Push notifications only", label: "Push notifications only" },
                      { value: "All notifications disabled", label: "All notifications disabled" }
                    ]}
                  />
                )}

                {editPrefKey === "language" && (
                  <CustomSelect
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "English (US)", label: "English (US)" },
                      { value: "English (UK)", label: "English (UK)" },
                      { value: "Spanish", label: "Spanish" },
                      { value: "French", label: "French" }
                    ]}
                  />
                )}

                {editPrefKey === "theme" && (
                  <CustomSelect
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Dark", label: "Dark" },
                      { value: "Light", label: "Light" },
                      { value: "System", label: "System" }
                    ]}
                  />
                )}

                {editPrefKey === "sidebarMode" && (
                  <CustomSelect
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Expanded", label: "Expanded" },
                      { value: "Collapsed", label: "Collapsed" }
                    ]}
                  />
                )}
              </div>

              <div className="profile-modal-footer">
                <button 
                  type="button" 
                  className="mgmt-btn mgmt-btn--outline"
                  onClick={() => setEditPrefKey(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="mgmt-btn mgmt-btn--primary"
                >
                  Save Preference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
