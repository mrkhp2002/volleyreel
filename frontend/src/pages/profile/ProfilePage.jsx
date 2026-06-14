import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/management.css";
import "../../styles/profile.css";

// SVG Icons
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Load from context with fallback defaults
  const fullName = user?.fullName || "Coach Admin";
  const email = user?.email || "admin@volleyreel.com";
  const role = user?.role || "Administrator";

  // Additional profile states persisted in localStorage
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("volleyreel_profile_extra");
    const defaultData = {
      phone: "+1 (555) 123-4567",
      club: "VolleyReel Analytics Platform",
      address: "123 Sports Avenue",
      city: "Los Angeles",
      country: "United States",
      joinedDate: "January 15, 2024",
      lastActive: "March 18, 2026 at 10:30 AM",
      avatarUrl: null
    };

    if (saved) {
      try {
        return { ...defaultData, ...JSON.parse(saved) };
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
  const [manageSecurityOpen, setManageSecurityOpen] = useState(false);
  const [editPrefKey, setEditPrefKey] = useState(null); // 'notifications' | 'language' | 'theme' | 'sidebar'

  // Modal form states - Profile
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formClub, setFormClub] = useState("");
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
      setFormPhone(profileData.phone);
      setFormClub(profileData.club);
      setFormAddress(profileData.address);
      setFormCity(profileData.city);
      setFormCountry(profileData.country);
      setFormAvatar(profileData.avatarUrl);
    }
  }, [editProfileOpen, firstNameVal, lastNameVal, profileData]);

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
    updateUser({ fullName: updatedFullName });

    // Update Profile Extra details
    setProfileData((prev) => ({
      ...prev,
      phone: formPhone.trim(),
      club: formClub.trim(),
      address: formAddress.trim(),
      city: formCity.trim(),
      country: formCountry.trim(),
      avatarUrl: formAvatar
    }));

    setEditProfileOpen(false);
    showToast("User Profile details successfully updated!");
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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <h1>User Profile</h1>
          <p>Manage your personal information and account details</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            type="button" 
            className="mgmt-btn mgmt-btn--primary"
            onClick={() => setEditProfileOpen(true)}
          >
            <EditIcon />
            Edit Profile
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
          
          {/* Card 1: Profile Summary Card */}
          <div className="mgmt-card" style={{ padding: "24px" }}>
            <div className="profile-summary-header">
              <div className="profile-summary-avatar-wrap">
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" />
                ) : (
                  firstNameVal.charAt(0) || "U"
                )}
              </div>
              <div className="profile-summary-info">
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>{fullName}</h2>
                  <div className="profile-summary-badges">
                    <span className="mgmt-badge mgmt-badge--ongoing">{role}</span>
                    <span className="mgmt-badge mgmt-badge--completed">Active</span>
                  </div>
                </div>
                
                <div className="profile-summary-details">
                  <div className="profile-summary-detail-item">
                    <MailIcon />
                    <span>{email}</span>
                  </div>
                  <div className="profile-summary-detail-item">
                    <PhoneIcon />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="profile-summary-detail-item">
                    <BuildingIcon />
                    <span>{profileData.club}</span>
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

          {/* Card 2: Personal Information Card */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Personal Information</h3>
            <div className="profile-label-value-grid">
              <div className="profile-info-block">
                <span className="profile-info-label">First Name</span>
                <span className="profile-info-value">{firstNameVal || "-"}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Last Name</span>
                <span className="profile-info-value">{lastNameVal || "-"}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{email}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Phone Number</span>
                <span className="profile-info-value">{profileData.phone}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{profileData.address}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">City</span>
                <span className="profile-info-value">{profileData.city}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Country</span>
                <span className="profile-info-value">{profileData.country}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Account Information Card */}
          <div className="mgmt-card">
            <h3 className="mgmt-card-title">Account Information</h3>
            <div className="profile-label-value-grid">
              <div className="profile-info-block">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">{role}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Account Type</span>
                <span className="profile-info-value">Premium</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Joined Date</span>
                <span className="profile-info-value">{profileData.joinedDate}</span>
              </div>
              <div className="profile-info-block">
                <span className="profile-info-label">Last Login</span>
                <span className="profile-info-value">March 18, 2026 at 9:30 AM</span>
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
            <h3 className="mgmt-card-title" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              <ShieldIcon />
              Security
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Password Last Changed
                </span>
                <strong style={{ fontSize: "0.95rem", color: "#ffffff" }}>February 10, 2026</strong>
              </div>

              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Two-Factor Authentication
                </span>
                <span className="mgmt-badge mgmt-badge--inactive">Not Enabled</span>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Active Session
                </span>
                <strong style={{ fontSize: "0.95rem", color: "#ffffff" }}>1 device</strong>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setManageSecurityOpen(true)}
              className="mgmt-btn mgmt-btn--block"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 15px rgba(13, 148, 136, 0.2)",
                marginTop: "4px"
              }}
            >
              Manage Security
            </button>
          </div>

          {/* Card 6: Activity Summary Card */}
          <div className="mgmt-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="mgmt-card-title" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
              Activity Summary
            </h3>
            
            <div className="profile-activity-cards-list">
              <div className="profile-activity-stat-card profile-activity-stat-card--amber">
                <span>Reports Created</span>
                <strong>45</strong>
              </div>

              <div className="profile-activity-stat-card profile-activity-stat-card--blue">
                <span>Matches Managed</span>
                <strong>128</strong>
              </div>

              <div className="profile-activity-stat-card profile-activity-stat-card--teal">
                <span>Tournaments Managed</span>
                <strong>12</strong>
              </div>
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
                March 18, 2026 at 9:30 AM
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}

      {/* Modal 1: Edit Profile details overlay */}
      {editProfileOpen && (
        <div className="profile-modal-overlay" onClick={() => setEditProfileOpen(false)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
            <h3>
              <EditIcon />
              Edit User Profile Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="profile-modal-form">
              {/* Form Grid */}
              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-first">First Name</label>
                  <input 
                    id="p-first"
                    type="text" 
                    value={formFirstName} 
                    onChange={(e) => setFormFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-last">Last Name</label>
                  <input 
                    id="p-last"
                    type="text" 
                    value={formLastName} 
                    onChange={(e) => setFormLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-phone">Phone Number</label>
                  <input 
                    id="p-phone"
                    type="text" 
                    value={formPhone} 
                    onChange={(e) => setFormPhone(e.target.value)} 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-club">Club Affiliation</label>
                  <input 
                    id="p-club"
                    type="text" 
                    value={formClub} 
                    onChange={(e) => setFormClub(e.target.value)} 
                  />
                </div>
              </div>

              <div className="mgmt-field">
                <label htmlFor="p-addr">Address</label>
                <input 
                  id="p-addr"
                  type="text" 
                  value={formAddress} 
                  onChange={(e) => setFormAddress(e.target.value)} 
                />
              </div>

              <div className="mgmt-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="mgmt-field">
                  <label htmlFor="p-city">City</label>
                  <input 
                    id="p-city"
                    type="text" 
                    value={formCity} 
                    onChange={(e) => setFormCity(e.target.value)} 
                  />
                </div>
                <div className="mgmt-field">
                  <label htmlFor="p-cntry">Country</label>
                  <input 
                    id="p-cntry"
                    type="text" 
                    value={formCountry} 
                    onChange={(e) => setFormCountry(e.target.value)} 
                  />
                </div>
              </div>

              <div className="mgmt-field">
                <label>Upload Profile Picture</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
                  <div 
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden"
                    }}
                  >
                    {formAvatar ? (
                      <img src={formAvatar} alt="Upload Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "?"
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }} 
                  />
                </div>
              </div>

              <div className="profile-modal-footer">
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
                  Save Profile
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
                <label htmlFor="p-cur">Current Password</label>
                <input 
                  id="p-cur"
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className="mgmt-field">
                <label htmlFor="p-new">New Password</label>
                <input 
                  id="p-new"
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className="mgmt-field">
                <label htmlFor="p-conf">Confirm New Password</label>
                <input 
                  id="p-conf"
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
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

      {/* Modal 3: Manage Security Settings */}
      {manageSecurityOpen && (
        <div className="profile-modal-overlay" onClick={() => setManageSecurityOpen(false)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <h3>
              <ShieldIcon />
              Manage Security Controls
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Adjust advanced authorization parameters for your VolleyReel Analytics account.
              </p>
              
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <strong style={{ fontSize: "0.9rem" }}>Two-Factor Authentication (2FA)</strong>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Require a verification code sent to your phone/authenticator app upon signing in.
                </p>
                <button 
                  type="button" 
                  className="mgmt-btn mgmt-btn--outline"
                  style={{ width: "fit-content", padding: "6px 12px", fontSize: "0.8rem" }}
                  onClick={() => {
                    alert("Toggling 2FA configurations setup wizard...");
                    setManageSecurityOpen(false);
                  }}
                >
                  Enable Two-Factor
                </button>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <strong style={{ fontSize: "0.9rem" }}>Purge Active Sessions</strong>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Revoke authorization keys on all other browser sessions and devices.
                </p>
                <button 
                  type="button" 
                  className="mgmt-btn mgmt-btn--danger-outline"
                  style={{ width: "fit-content", padding: "6px 12px", fontSize: "0.8rem" }}
                  onClick={() => {
                    showToast("All other active sessions revoked.");
                    setManageSecurityOpen(false);
                  }}
                >
                  Log Out Other Devices
                </button>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button 
                type="button" 
                className="mgmt-btn mgmt-btn--outline"
                onClick={() => setManageSecurityOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Preference Option */}
      {editPrefKey && (
        <div className="profile-modal-overlay" onClick={() => setEditPrefKey(null)}>
          <div className="profile-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Adjust Preference
            </h3>
            
            <form onSubmit={handleSavePreference} className="profile-modal-form">
              <div className="mgmt-field">
                <label>
                  {editPrefKey === "notifications" && "Notification Feed Preferences"}
                  {editPrefKey === "language" && "Preferred Language"}
                  {editPrefKey === "theme" && "UI Theme Selection"}
                  {editPrefKey === "sidebarMode" && "Sidebar Layout Mode"}
                </label>
                
                {editPrefKey === "notifications" && (
                  <CustomSelect 
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Email notifications enabled", label: "Email notifications enabled" },
                      { value: "Push notifications enabled", label: "Push notifications enabled" },
                      { value: "Disabled", label: "Mute all alert notifications" }
                    ]}
                  />
                )}

                {editPrefKey === "language" && (
                  <CustomSelect 
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "English (US)", label: "English (US)" },
                      { value: "Spanish", label: "Spanish (Español)" },
                      { value: "French", label: "French (Français)" },
                      { value: "German", label: "German (Deutsch)" }
                    ]}
                  />
                )}

                {editPrefKey === "theme" && (
                  <CustomSelect 
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Dark", label: "Dark Mode (Recommended)" },
                      { value: "Light", label: "Light Mode" }
                    ]}
                  />
                )}

                {editPrefKey === "sidebarMode" && (
                  <CustomSelect 
                    value={prefValue}
                    onChange={(e) => setPrefValue(e.target.value)}
                    options={[
                      { value: "Expanded", label: "Expanded Sidebar Nav" },
                      { value: "Collapsed", label: "Icon-only Sidebar Rail" }
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
