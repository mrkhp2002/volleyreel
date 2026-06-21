import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "../../styles/admin.css";

// Icons inline to keep it React-only and zero-dependency
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [isHovered, setIsHovered] = useState(false);
  const collapsed = !isHovered;
  const [currentView, setCurrentView] = useState("overview"); // overview, users, jobs, moderation, system_settings, database_backups
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [passwordModal, setPasswordModal] = useState(null); // coach object or null
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // System Settings States
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    platformName: "VolleyReel",
    maintenanceMode: false,
    supportEmail: "support@volleyreel.com",
    aiModel: "VolleyNet-v4.2",
    maxUploadSize: "1GB",
    frameRate: "30fps",
    mfaRequired: true,
    rateLimit: 120,
    allowedFormats: "mp4, mov"
  });

  // Database Backups States
  const [backups, setBackups] = useState([
    { id: "BK-1001", date: "2026-05-28 02:00", size: "74.8 KB", createdBy: "System (Auto)", status: "Completed" },
    { id: "BK-1002", date: "2026-05-27 02:00", size: "73.2 KB", createdBy: "System (Auto)", status: "Completed" },
    { id: "BK-1003", date: "2026-05-26 14:10", size: "72.5 KB", createdBy: "System Admin", status: "Completed" },
    { id: "BK-1004", date: "2026-05-25 02:00", size: "71.9 KB", createdBy: "System (Auto)", status: "Completed" }
  ]);
  const [restoreModal, setRestoreModal] = useState(null); // backup object or null
  const [restoring, setRestoring] = useState(false);
  const [restoreConfirmInput, setRestoreConfirmInput] = useState("");

  // Close menus when clicking outside
  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock Database
  const [coaches, setCoaches] = useState([
    { id: "C-101", name: "David Miller", email: "d.miller@volleyballclub.com", role: "Head Coach", status: "Active" },
    { id: "C-102", name: "Sarah Connor", email: "sarah.c@volleyschool.edu", role: "Assistant Coach", status: "Active" },
    { id: "C-103", name: "Kenji Sato", email: "k.sato@nationalteam.jp", role: "Head Coach", status: "Pending Verification" },
    { id: "C-104", name: "Elena Rostova", email: "elena.r@spikers.org", role: "Video Analyst", status: "Active" },
    { id: "C-105", name: "Marcus Aurelius", email: "m.aurelius@romeclub.it", role: "Head Coach", status: "Suspended" },
    { id: "C-106", name: "Chloe Dupont", email: "c.dupont@parisvolley.fr", role: "Assistant Coach", status: "Active" }
  ]);

  const [jobs, setJobs] = useState([
    { id: "JOB-9021", uploadedBy: "David Miller", filename: "final_match_colombo.mp4", status: "Failed", date: "2026-05-28 14:32", error: "Audio/Video desync detected on frame 2400" },
    { id: "JOB-9022", uploadedBy: "Sarah Connor", filename: "training_sets_review.mp4", status: "Completed", date: "2026-05-28 17:15", error: "" },
    { id: "JOB-9023", uploadedBy: "Kenji Sato", filename: "tokyo_v_osaka_set1.mp4", status: "Processing", date: "2026-05-28 23:45", error: "" },
    { id: "JOB-9024", uploadedBy: "Elena Rostova", filename: "jump_serve_compilation.mov", status: "Pending", date: "2026-05-29 00:02", error: "" },
    { id: "JOB-9025", uploadedBy: "David Miller", filename: "semi_final_replay.mp4", status: "Failed", date: "2026-05-28 11:22", error: "VGA format not supported, H264 required" },
    { id: "JOB-9026", uploadedBy: "Chloe Dupont", filename: "scouting_rotations.mp4", status: "Completed", date: "2026-05-27 19:40", error: "" }
  ]);

  const [flaggedItems, setFlaggedItems] = useState([
    { id: "MOD-301", title: "National Championship - Highlight Spike", uploadedBy: "Marcus Aurelius", reason: "Copyright claim by Broadcaster Network", date: "2026-05-28 09:12", flags: 3 },
    { id: "MOD-302", title: "Locker Room Post-Match Celebration", uploadedBy: "David Miller", reason: "Privacy concern reported by player", date: "2026-05-28 16:30", flags: 1 },
    { id: "MOD-303", title: "Referee argument & red card breakdown", uploadedBy: "Sarah Connor", reason: "Unsportsmanlike actions flagged by moderator", date: "2026-05-27 12:05", flags: 2 }
  ]);

  const failedJobsCount = jobs.filter(j => j.status === "Failed").length;

  // Actions
  const handleGeneratePassword = (coach) => {
    const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let password = "VR-";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordModal(coach);
    setTempPassword(password);
    setCopied(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestartJob = (jobId) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, status: "Pending", error: "" } : job
      )
    );
  };

  const handleApproveVideo = (itemId) => {
    setFlaggedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleRejectVideo = (itemId) => {
    setFlaggedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    alert(`Video ${itemId} has been permanently removed from the platform.`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter lists based on search bar
  const filteredCoaches = coaches.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(j =>
    j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      
      {/* Sidebar Layout */}
      <aside 
        className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="admin-sidebar-header">
          <a href="#" className="admin-brand" onClick={(e) => { e.preventDefault(); setCurrentView("overview"); }}>
            <div className="admin-brand-logo">
              <svg viewBox="0 0 100 100" fill="none" style={{ width: "20px", height: "20px" }}>
                <circle cx="50" cy="50" r="36" fill="#3b82f6" />
                <circle cx="50" cy="50" r="42" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
              </svg>
            </div>
            <div className="admin-brand-text">
              <span className="admin-brand-title">VolleyReel</span>
              <span className="admin-brand-subtitle">Admin System</span>
            </div>
          </a>
        </div>

        <nav className="admin-sidebar-nav">
          <button 
            className={`admin-nav-item ${currentView === "overview" ? "active" : ""}`}
            onClick={() => { setCurrentView("overview"); setSearchQuery(""); }}
          >
            <span className="admin-nav-icon"><GridIcon /></span>
            <span className="admin-nav-label">System Overview</span>
          </button>

          <button 
            className={`admin-nav-item ${currentView === "users" ? "active" : ""}`}
            onClick={() => { setCurrentView("users"); setSearchQuery(""); }}
          >
            <span className="admin-nav-icon"><UsersIcon /></span>
            <span className="admin-nav-label">User Management</span>
          </button>

          <button 
            className={`admin-nav-item ${currentView === "jobs" ? "active" : ""}`}
            onClick={() => { setCurrentView("jobs"); setSearchQuery(""); }}
          >
            <span className="admin-nav-icon"><TerminalIcon /></span>
            <span className="admin-nav-label">AI Job Queue</span>
          </button>

          <button 
            className={`admin-nav-item ${currentView === "moderation" ? "active" : ""}`}
            onClick={() => { setCurrentView("moderation"); setSearchQuery(""); }}
          >
            <span className="admin-nav-icon"><ShieldAlertIcon /></span>
            <span className="admin-nav-label">Content Moderation</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon"><LogOutIcon /></span>
            <span className="admin-nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="admin-main-container">
        
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-search">
            <span className="admin-nav-icon"><SearchIcon /></span>
            <input 
              type="text" 
              placeholder={
                currentView === "users" ? "Search coaches..." : 
                currentView === "jobs" ? "Search processing jobs..." : 
                "Search matches, uploaders, statuses..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-header-actions">
            
            {/* Notifications Bell (Job Failures) */}
            <div className="admin-profile-menu" ref={notifyRef}>
              <button 
                type="button" 
                className="admin-header-btn" 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Failed Job Notifications"
              >
                <BellIcon />
                {failedJobsCount > 0 && <span className="admin-header-badge" />}
              </button>

              {notificationsOpen && (
                <div className="admin-notify-dropdown">
                  <div className="admin-notify-header">
                    <span className="admin-notify-title">Failed Processing Alerts</span>
                    <span className="admin-notify-count">{failedJobsCount} Failed</span>
                  </div>
                  <div className="admin-notify-list">
                    {jobs.filter(j => j.status === "Failed").map(job => (
                      <div 
                        key={job.id} 
                        className="admin-notify-item" 
                        onClick={() => { setCurrentView("jobs"); setNotificationsOpen(false); }}
                      >
                        <div className="admin-notify-icon-box danger">
                          <ShieldAlertIcon />
                        </div>
                        <div className="admin-notify-text">
                          <span className="admin-notify-msg">Job <strong>{job.id}</strong> failure on file: {job.filename}</span>
                          <span className="admin-notify-time">{job.date}</span>
                        </div>
                      </div>
                    ))}
                    {failedJobsCount === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs">All AI processing jobs completed or running normally.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="admin-profile-menu" ref={profileRef}>
              <button 
                type="button" 
                className="admin-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="admin-avatar">SA</div>
                <div className="admin-profile-info">
                  <span className="admin-profile-name">System Admin</span>
                  <span className="admin-profile-role">Administrator</span>
                </div>
              </button>

              {profileOpen && (
                <div className="admin-dropdown-menu">
                  <button className="admin-dropdown-item" onClick={() => { setCurrentView("system_settings"); setProfileOpen(false); setSearchQuery(""); }}>
                    <svg className="admin-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    System Settings
                  </button>
                  <button className="admin-dropdown-item" onClick={() => { setCurrentView("database_backups"); setProfileOpen(false); setSearchQuery(""); }}>
                    <svg className="admin-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                    </svg>
                    Database Backups
                  </button>
                  <div className="admin-dropdown-divider" />
                  <button className="admin-dropdown-item text-red-600" onClick={handleLogout}>
                    <svg className="admin-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content">

          {/* Banner notification for failed jobs */}
          {failedJobsCount > 0 && currentView === "overview" && (
            <div className="admin-alert-banner">
              <div className="admin-alert-banner-text">
                <span style={{ width: "18px", height: "18px" }}><ShieldAlertIcon /></span>
                <span>Attention: <strong>{failedJobsCount} video processing tasks</strong> have failed in the AI execution queue. Please review and restart them below.</span>
              </div>
              <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => setCurrentView("jobs")}>
                View Queue
              </button>
            </div>
          )}

          {/* DYNAMIC VIEWS */}

          {/* 1. OVERVIEW VIEW */}
          {currentView === "overview" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">System Overview</h1>
                <p className="admin-page-subtitle">Overall analytics performance metrics, job health, and registered coaches directory preview.</p>
              </div>

              {/* KPI Row */}
              <div className="admin-kpi-grid">
                
                {/* KPI 1 */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">TOTAL REGISTERED COACHES</span>
                    <span className="admin-kpi-icon-box blue"><UsersIcon /></span>
                  </div>
                  <div className="admin-kpi-body">
                    <span className="admin-kpi-value">{coaches.length}</span>
                    <div className="admin-sparkline-container">
                      <svg viewBox="0 0 100 30" width="100%" height="100%">
                        <path d="M0,25 Q15,10 30,22 T60,5 T90,20 L100,18" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">MATCHES ANALYZED</span>
                    <span className="admin-kpi-icon-box success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                        <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                    </span>
                  </div>
                  <div className="admin-kpi-body">
                    <span className="admin-kpi-value">1,894</span>
                    <div className="admin-sparkline-container">
                      <svg viewBox="0 0 100 30" width="100%" height="100%">
                        <path d="M0,28 L20,20 L40,25 L60,12 L80,18 L100,5" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">ACTIVE AI JOBS</span>
                    <span className="admin-kpi-icon-box orange"><TerminalIcon /></span>
                  </div>
                  <div className="admin-kpi-body">
                    <span className="admin-kpi-value">{jobs.filter(j => j.status === "Processing" || j.status === "Pending").length}</span>
                    <div className="admin-sparkline-container">
                      <svg viewBox="0 0 100 30" width="100%" height="100%">
                        <path d="M0,15 L20,15 L40,8 L60,25 L80,12 L100,15" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">SYSTEM UPTIME</span>
                    <span className="admin-kpi-icon-box blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    </span>
                  </div>
                  <div className="admin-kpi-body">
                    <span className="admin-kpi-value">99.98%</span>
                    <div className="admin-sparkline-container">
                      <svg viewBox="0 0 100 30" width="100%" height="100%">
                        <path d="M0,5 L25,5 L50,6 L75,5 L100,5" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>

              {/* Coaches Directory Preview */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">
                    <span className="admin-nav-icon" style={{ width: "18px", height: "18px" }}><UsersIcon /></span>
                    Registered Coaches Preview
                  </h2>
                  <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => setCurrentView("users")}>
                    Manage All Coaches
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coaches.slice(0, 3).map((coach) => (
                        <tr key={coach.id}>
                          <td><strong>{coach.name}</strong></td>
                          <td>{coach.email}</td>
                          <td>{coach.role}</td>
                          <td>
                            <span className={`admin-badge ${
                              coach.status === "Active" ? "success" : 
                              coach.status === "Suspended" ? "danger" : "warning"
                            }`}>
                              {coach.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              type="button" 
                              className="admin-btn admin-btn-warning admin-btn-xs"
                              onClick={() => handleGeneratePassword(coach)}
                            >
                              <span style={{ width: "12px", height: "12px", display: "inline-block" }}><LockIcon /></span>
                              Generate Temp Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live AI Job Queue Preview */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">
                    <span className="admin-nav-icon" style={{ width: "18px", height: "18px" }}><TerminalIcon /></span>
                    AI Job Queue Live Status
                  </h2>
                  <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => setCurrentView("jobs")}>
                    Detailed Job Monitor
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Job ID</th>
                        <th>Uploaded By</th>
                        <th>Filename</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.slice(0, 4).map((job) => (
                        <tr key={job.id}>
                          <td><code>{job.id}</code></td>
                          <td>{job.uploadedBy}</td>
                          <td>{job.filename}</td>
                          <td>
                            <span className={`admin-badge ${
                              job.status === "Completed" ? "success" : 
                              job.status === "Processing" ? "info" : 
                              job.status === "Pending" ? "muted" : "danger"
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td>{job.date}</td>
                          <td>
                            {job.status === "Failed" ? (
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-primary admin-btn-xs"
                                onClick={() => handleRestartJob(job.id)}
                              >
                                <span style={{ width: "12px", height: "12px", display: "inline-block" }}><RefreshIcon /></span>
                                Restart Job
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 2. USER MANAGEMENT FULL VIEW */}
          {currentView === "users" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">User Management</h1>
                <p className="admin-page-subtitle">Browse and manage platform users, register credentials, monitor role distributions, or issue password resets.</p>
              </div>

              <div className="admin-section-card">
                <div className="admin-filter-bar">
                  <div className="admin-filter-search">
                    <span className="admin-nav-icon"><SearchIcon /></span>
                    <input 
                      type="text" 
                      placeholder="Search coaches by name, email, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="admin-btn admin-btn-primary" onClick={() => alert("Creating a new user profile form placeholder.")}>
                    + Add New Coach
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Coach ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoaches.map((coach) => (
                        <tr key={coach.id}>
                          <td><code>{coach.id}</code></td>
                          <td><strong>{coach.name}</strong></td>
                          <td>{coach.email}</td>
                          <td>{coach.role}</td>
                          <td>
                            <span className={`admin-badge ${
                              coach.status === "Active" ? "success" : 
                              coach.status === "Suspended" ? "danger" : "warning"
                            }`}>
                              {coach.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-warning admin-btn-xs"
                                onClick={() => handleGeneratePassword(coach)}
                              >
                                <span style={{ width: "12px", height: "12px", display: "inline-block" }}><LockIcon /></span>
                                Generate Temp Password
                              </button>
                              
                              {coach.status === "Suspended" ? (
                                <button 
                                  type="button" 
                                  className="admin-btn admin-btn-secondary admin-btn-xs"
                                  onClick={() => {
                                    setCoaches(coaches.map(c => c.id === coach.id ? { ...c, status: "Active" } : c));
                                  }}
                                >
                                  Activate
                                </button>
                              ) : (
                                <button 
                                  type="button" 
                                  className="admin-btn admin-btn-danger admin-btn-xs"
                                  onClick={() => {
                                    setCoaches(coaches.map(c => c.id === coach.id ? { ...c, status: "Suspended" } : c));
                                  }}
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCoaches.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-slate-400">No coaches found matching search: "{searchQuery}"</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 3. AI JOB QUEUE FULL VIEW */}
          {currentView === "jobs" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">AI Video Processing Queue</h1>
                <p className="admin-page-subtitle">Monitor server jobs compiling video track analytics, review logs, and re-run failed jobs.</p>
              </div>

              <div className="admin-section-card">
                <div className="admin-filter-bar">
                  <div className="admin-filter-search">
                    <span className="admin-nav-icon"><SearchIcon /></span>
                    <input 
                      type="text" 
                      placeholder="Search jobs by ID, file, status, uploader..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="admin-btn admin-btn-secondary" onClick={() => setSearchQuery("")}>Clear Filters</button>
                    <button className="admin-btn admin-btn-secondary" onClick={() => setSearchQuery("Failed")}>Failed Jobs ({failedJobsCount})</button>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Job ID</th>
                        <th>Uploaded By</th>
                        <th>Filename</th>
                        <th>Upload Timestamp</th>
                        <th>Queue Status</th>
                        <th>System Diagnostics</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job.id}>
                          <td><code>{job.id}</code></td>
                          <td><strong>{job.uploadedBy}</strong></td>
                          <td>{job.filename}</td>
                          <td>{job.date}</td>
                          <td>
                            <span className={`admin-badge ${
                              job.status === "Completed" ? "success" : 
                              job.status === "Processing" ? "info" : 
                              job.status === "Pending" ? "muted" : "danger"
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td>
                            {job.status === "Failed" ? (
                              <span className="text-red-500 font-mono text-xs" style={{ color: "var(--admin-danger)" }}>
                                {job.error}
                              </span>
                            ) : job.status === "Completed" ? (
                              <span className="text-slate-400 text-xs">Processed successfully in 2m 15s</span>
                            ) : job.status === "Processing" ? (
                              <span className="text-blue-500 text-xs font-semibold animate-pulse" style={{ color: "var(--admin-accent-blue)" }}>
                                Running AI pipeline (42% complete)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Waiting in execution queue</span>
                            )}
                          </td>
                          <td>
                            {job.status === "Failed" ? (
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-primary admin-btn-xs"
                                onClick={() => handleRestartJob(job.id)}
                              >
                                <span style={{ width: "12px", height: "12px", display: "inline-block" }}><RefreshIcon /></span>
                                Restart Job
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredJobs.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-8 text-slate-400">No processing jobs found matching query.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 4. CONTENT MODERATION FULL VIEW */}
          {currentView === "moderation" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Content Moderation & Review</h1>
                <p className="admin-page-subtitle">Review matches, clips, or files flagged by players, coaches, or automated filters.</p>
              </div>

              <div className="admin-section-card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">
                    <span className="admin-nav-icon" style={{ width: "18px", height: "18px" }}><ShieldAlertIcon /></span>
                    Flagged Videos Awaiting Admin Action ({flaggedItems.length} items)
                  </h2>
                </div>

                {flaggedItems.length > 0 ? (
                  <div className="admin-moderation-grid">
                    {flaggedItems.map(item => (
                      <div key={item.id} className="admin-mod-card">
                        
                        {/* Mock video clip display */}
                        <div className="admin-mod-video-preview">
                          <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "40px", height: "40px" }}>
                              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                            <span>[Video Placeholder - {item.id}]</span>
                          </div>
                          
                          <span className="admin-badge danger admin-mod-reason-badge">
                            {item.flags} Flag{item.flags > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="admin-mod-body">
                          <h3 className="admin-mod-title">{item.title}</h3>
                          <div className="admin-mod-meta">
                            <span>Uploaded by: <strong>{item.uploadedBy}</strong></span>
                            <span>Reason: <span className="text-red-500" style={{ color: "var(--admin-danger)" }}>{item.reason}</span></span>
                            <span>Reported date: {item.date}</span>
                          </div>

                          <div className="admin-mod-actions">
                            <button 
                              type="button" 
                              className="admin-btn admin-btn-secondary admin-btn-xs"
                              onClick={() => handleApproveVideo(item.id)}
                            >
                              <span style={{ width: "12px", height: "12px", display: "inline-block", color: "var(--admin-success)" }}><CheckIcon /></span>
                              Keep Safe
                            </button>
                            <button 
                              type="button" 
                              className="admin-btn admin-btn-danger admin-btn-xs"
                              onClick={() => handleRejectVideo(item.id)}
                            >
                              <span style={{ width: "12px", height: "12px", display: "inline-block" }}><CrossIcon /></span>
                              Remove
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <div style={{ width: "48px", height: "48px", margin: "0 auto 12px auto", color: "var(--admin-success)" }}><CheckIcon /></div>
                    <h3>Content moderation queue is empty!</h3>
                    <p className="text-xs mt-2">All uploaded videos have been checked and passed security profiles.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 5. SYSTEM SETTINGS VIEW */}
          {currentView === "system_settings" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">System Settings</h1>
                <p className="admin-page-subtitle">Configure VolleyReel platform properties, AI processing defaults, security keys, and maintenance toggles.</p>
              </div>

              {settingsSaved && (
                <div className="admin-alert-banner" style={{ backgroundColor: "var(--admin-success-light)", borderColor: "rgba(16, 185, 129, 0.25)", color: "var(--admin-success)", marginBottom: "20px" }}>
                  <div className="admin-alert-banner-text">
                    <span style={{ width: "18px", height: "18px", display: "inline-block" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>System settings successfully updated! Changes are live across all coach profiles.</span>
                  </div>
                  <button className="admin-modal-close" onClick={() => setSettingsSaved(false)} style={{ color: "var(--admin-success)" }}>×</button>
                </div>
              )}

              <div className="admin-section-card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">Global Configuration Details</h2>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 4000); }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Grid System */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    
                    {/* General Settings */}
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--admin-accent-orange)", borderBottom: "1px solid var(--border-admin)", paddingBottom: "6px" }}>General Setup</h3>
                      <div className="admin-form-group">
                        <label htmlFor="platformName">Platform Name</label>
                        <input 
                          id="platformName"
                          type="text" 
                          className="admin-form-input" 
                          value={systemSettings.platformName}
                          onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label htmlFor="supportEmail">Support Email</label>
                        <input 
                          id="supportEmail"
                          type="email" 
                          className="admin-form-input" 
                          value={systemSettings.supportEmail}
                          onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                        <input 
                          id="maintenanceMode"
                          type="checkbox" 
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <label htmlFor="maintenanceMode" style={{ margin: 0, cursor: "pointer", textTransform: "none", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-admin-main)" }}>
                          Enable Global Maintenance Mode
                        </label>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-admin-muted)", margin: "4px 0 0 26px" }}>Blocks coaches from uploading videos and schedules offline messages.</p>
                    </div>

                    {/* AI Pipeline Settings */}
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--admin-accent-orange)", borderBottom: "1px solid var(--border-admin)", paddingBottom: "6px" }}>AI Processing Rules</h3>
                      <div className="admin-form-group">
                        <label htmlFor="aiModel">Volleyball Track AI Model</label>
                        <select 
                          id="aiModel"
                          className="admin-form-input animate-none" 
                          style={{ background: "var(--bg-admin-sidebar)" }}
                          value={systemSettings.aiModel}
                          onChange={(e) => setSystemSettings({ ...systemSettings, aiModel: e.target.value })}
                        >
                          <option value="VolleyNet-v4.2">VolleyNet-v4.2 (Default Active)</option>
                          <option value="VolleyNet-v3.8">VolleyNet-v3.8 (Legacy Stable)</option>
                          <option value="High-Precision Track-v2">High-Precision Track-v2 (Experimental)</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label htmlFor="maxUploadSize">Max Video File Size</label>
                        <select 
                          id="maxUploadSize"
                          className="admin-form-input animate-none"
                          style={{ background: "var(--bg-admin-sidebar)" }}
                          value={systemSettings.maxUploadSize}
                          onChange={(e) => setSystemSettings({ ...systemSettings, maxUploadSize: e.target.value })}
                        >
                          <option value="500MB">500 Megabytes (MB)</option>
                          <option value="1GB">1 Gigabyte (GB)</option>
                          <option value="2GB">2 Gigabytes (GB)</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label htmlFor="frameRate">Target Inference Frame Rate</label>
                        <select 
                          id="frameRate"
                          className="admin-form-input animate-none"
                          style={{ background: "var(--bg-admin-sidebar)" }}
                          value={systemSettings.frameRate}
                          onChange={(e) => setSystemSettings({ ...systemSettings, frameRate: e.target.value })}
                        >
                          <option value="30fps">30 Frames Per Second (Standard)</option>
                          <option value="60fps">60 Frames Per Second (High Definition)</option>
                        </select>
                      </div>
                    </div>

                    {/* Security & Access */}
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "16px", color: "var(--admin-accent-orange)", borderBottom: "1px solid var(--border-admin)", paddingBottom: "6px" }}>Security & Network</h3>
                      <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                        <input 
                          id="mfaRequired"
                          type="checkbox" 
                          checked={systemSettings.mfaRequired}
                          onChange={(e) => setSystemSettings({ ...systemSettings, mfaRequired: e.target.checked })}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <label htmlFor="mfaRequired" style={{ margin: 0, cursor: "pointer", textTransform: "none", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-admin-main)" }}>
                          Require Multi-Factor Auth (MFA)
                        </label>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-admin-muted)", margin: "4px 0 16px 26px" }}>Forces all registered coaches to link verification apps.</p>
                      
                      <div className="admin-form-group">
                        <label htmlFor="rateLimit">API Rate Limit (Requests/Min)</label>
                        <input 
                          id="rateLimit"
                          type="number" 
                          className="admin-form-input" 
                          value={systemSettings.rateLimit}
                          onChange={(e) => setSystemSettings({ ...systemSettings, rateLimit: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label htmlFor="allowedFormats">Allowed Upload Formats</label>
                        <input 
                          id="allowedFormats"
                          type="text" 
                          className="admin-form-input" 
                          value={systemSettings.allowedFormats}
                          onChange={(e) => setSystemSettings({ ...systemSettings, allowedFormats: e.target.value })}
                          placeholder="e.g. mp4, mov"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Form Actions Footer */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-admin)", paddingTop: "16px", marginTop: "12px" }}>
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={() => {
                      setSystemSettings({
                        platformName: "VolleyReel",
                        maintenanceMode: false,
                        supportEmail: "support@volleyreel.com",
                        aiModel: "VolleyNet-v4.2",
                        maxUploadSize: "1GB",
                        frameRate: "30fps",
                        mfaRequired: true,
                        rateLimit: 120,
                        allowedFormats: "mp4, mov"
                      });
                    }}>
                      Reset Defaults
                    </button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      Save System Settings
                    </button>
                  </div>

                </form>
              </div>
            </>
          )}

          {/* 6. DATABASE BACKUPS VIEW */}
          {currentView === "database_backups" && (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Database Management & Backups</h1>
                <p className="admin-page-subtitle">Schedule database dumps, view storage allocations, restore to past states, or manually trigger full SQLite system backups.</p>
              </div>

              {/* Stats/Status Row */}
              <div className="admin-kpi-grid">
                
                {/* SQLite Health */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">SQLITE SYSTEM STATUS</span>
                    <span className="admin-badge success">Online</span>
                  </div>
                  <div className="admin-kpi-body" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                    <span className="admin-kpi-value" style={{ fontSize: "1.4rem" }}>Stable Connection</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-admin-muted)" }}>Target File: <code>volleyreel.db</code></span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-admin-muted)" }}>Database File Size: <strong>76.0 KB</strong></span>
                  </div>
                </div>

                {/* Backups Summary */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">BACKUP ARCHIVES HEALTH</span>
                    <span className="admin-nav-icon" style={{ width: "16px", height: "16px", color: "var(--admin-accent-orange)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </span>
                  </div>
                  <div className="admin-kpi-body" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                    <span className="admin-kpi-value" style={{ fontSize: "1.4rem" }}>{backups.length} Recovery Points</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-admin-muted)" }}>Last Backup: <strong>{backups[0]?.date || "Never"}</strong></span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-admin-muted)" }}>Storage Allocation: <strong>~292 KB</strong></span>
                  </div>
                </div>

              </div>

              {/* Logs Card */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">
                    <span className="admin-nav-icon" style={{ width: "18px", height: "18px" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                      </svg>
                    </span>
                    Database Backup History
                  </h2>
                  <button 
                    className="admin-btn admin-btn-primary admin-btn-xs"
                    onClick={() => {
                      const newId = `BK-${Math.floor(1005 + Math.random() * 9000)}`;
                      const now = new Date();
                      const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                      const sizeString = `${(75.5 + Math.random()).toFixed(1)} KB`;
                      const newBackup = {
                        id: newId,
                        date: dateString,
                        size: sizeString,
                        createdBy: "System Admin",
                        status: "Completed"
                      };
                      setBackups([newBackup, ...backups]);
                      alert(`Manual database backup ${newId} has been successfully compiled and stored.`);
                    }}
                  >
                    + Trigger Manual Backup
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Backup ID</th>
                        <th>Created Timestamp</th>
                        <th>Archive Size</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((bk) => (
                        <tr key={bk.id}>
                          <td><code>{bk.id}</code></td>
                          <td>{bk.date}</td>
                          <td>{bk.size}</td>
                          <td>{bk.createdBy}</td>
                          <td>
                            <span className="admin-badge success">{bk.status}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button 
                                className="admin-btn admin-btn-secondary admin-btn-xs"
                                onClick={() => alert(`Downloading SQL script ${bk.id}.sql file to your computer.`)}
                              >
                                Download
                              </button>
                              <button 
                                className="admin-btn admin-btn-warning admin-btn-xs"
                                onClick={() => { setRestoreModal(bk); setRestoreConfirmInput(""); }}
                              >
                                Restore
                              </button>
                              <button 
                                className="admin-btn admin-btn-danger admin-btn-xs"
                                onClick={() => {
                                  if (confirm(`Confirm deletion of backup archive ${bk.id}?`)) {
                                    setBackups(backups.filter(b => b.id !== bk.id));
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* PASSWORD OVERLAY MODAL */}
      {passwordModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Temporary Credentials Issued</h3>
              <button className="admin-modal-close" onClick={() => setPasswordModal(null)}>×</button>
            </div>
            
            <div className="admin-modal-body">
              <p className="text-sm text-slate-500 mb-4" style={{ fontSize: "0.85rem", color: "var(--text-admin-muted)", margin: "0 0 16px 0" }}>
                A temporary secure password has been generated for <strong>{passwordModal.name}</strong> ({passwordModal.email}). Please copy this password and share it with the coach.
              </p>

              <div className="admin-form-group">
                <label>Temporary Password</label>
                <div className="admin-copy-box">
                  <input 
                    type="text" 
                    readOnly 
                    className="admin-copy-text" 
                    value={tempPassword} 
                  />
                  <button 
                    type="button" 
                    className="admin-copy-btn"
                    onClick={handleCopyPassword}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setPasswordModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE DATABASE MODAL */}
      {restoreModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Restore Database State</h3>
              <button 
                className="admin-modal-close" 
                onClick={() => { if (!restoring) setRestoreModal(null); }}
                disabled={restoring}
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-body">
              {restoring ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 0" }}>
                  <div className="admin-spinner" style={{ marginBottom: "16px" }}></div>
                  <p style={{ color: "var(--text-admin-main)", fontSize: "0.9rem", fontWeight: "500" }}>Restoring backup {restoreModal.id}...</p>
                  <p style={{ color: "var(--text-admin-muted)", fontSize: "0.75rem", marginTop: "4px" }}>Rebuilding tables and indexes. Please do not close this window.</p>
                </div>
              ) : (
                <>
                  <div className="admin-alert-banner" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.25)", color: "#ef4444", marginBottom: "16px", padding: "10px 12px", borderRadius: "8px" }}>
                    <div className="admin-alert-banner-text" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "18px", height: "18px", display: "inline-block", flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                      <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>Critical Action Warning</span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: "0.85rem", color: "var(--text-admin-muted)", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                    You are about to restore the system database using archive <strong>{restoreModal.id}</strong> (Created on {restoreModal.date}). This will overwrite all current system settings, matches, and coach configurations.
                  </p>

                  <div className="admin-form-group">
                    <label htmlFor="confirmBackupId" style={{ fontSize: "0.8rem", color: "var(--text-admin-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      To confirm, type <strong>{restoreModal.id}</strong> below:
                    </label>
                    <input 
                      id="confirmBackupId"
                      type="text" 
                      className="admin-form-input" 
                      placeholder={restoreModal.id}
                      value={restoreConfirmInput}
                      onChange={(e) => setRestoreConfirmInput(e.target.value)}
                      style={{ marginTop: "8px" }}
                      autoComplete="off"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button 
                className="admin-btn admin-btn-secondary" 
                onClick={() => setRestoreModal(null)}
                disabled={restoring}
              >
                Cancel
              </button>
              {!restoring && (
                <button 
                  className="admin-btn admin-btn-danger" 
                  onClick={() => {
                    if (restoreConfirmInput === restoreModal.id) {
                      setRestoring(true);
                      setTimeout(() => {
                        setRestoring(false);
                        setRestoreModal(null);
                        alert(`Database successfully restored to state ${restoreModal.id}.`);
                      }, 1200);
                    }
                  }}
                  disabled={restoreConfirmInput !== restoreModal.id}
                >
                  Confirm Restore
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
