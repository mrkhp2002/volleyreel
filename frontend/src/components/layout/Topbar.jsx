import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import useAuth from "../../hooks/useAuth";
import useNotifications from "../../hooks/useNotifications";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function Topbar({ onMobileToggle }) {
  const { user, logout } = useAuth();
  const { alerts, unreadCount, handleMarkAsRead } = useNotifications();
  const displayName = user?.fullName || "Coach Admin";
  const displayEmail = user?.email || "admin@volleyreel.com";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onMobileToggle}
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
        <span className="topbar-logo-mark" title="VolleyReel">
          <Logo size="24px" />
        </span>
      </div>

      <div className="topbar-search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search tournaments, teams, players, or match ID..."
          aria-label="Search"
        />
      </div>

      <div className="topbar-actions">
        <div className="topbar-notify-container">
          <button type="button" className="topbar-notify-btn" aria-label="Notifications">
            <BellIcon />
            {unreadCount > 0 && <span className="topbar-notify-dot" />}
          </button>

          <div className="topbar-notify-dropdown">
            <div className="notify-header">
              <span className="notify-header-title">Notifications</span>
              <span className="notify-badge-new">{unreadCount} new</span>
            </div>

            <div className="notify-list">
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.link}
                    onClick={() => handleMarkAsRead(alert.id)}
                    className={`notify-item ${alert.unread ? "unread" : ""}`}
                  >
                    <div className="notify-item-content">
                      <div className="notify-item-title">{alert.title}</div>
                      <div className="notify-item-desc">{alert.desc}</div>
                      <div className="notify-item-time">{alert.time}</div>
                    </div>
                    {alert.unread && <span className="notify-unread-dot" />}
                  </Link>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No notifications
                </div>
              )}
            </div>

            <div className="notify-footer">
              <Link to="/notifications" className="notify-view-all">
                View All Notifications
              </Link>
            </div>
          </div>
        </div>

        <div className="topbar-user-menu-container">
          <div className="topbar-user-pill">
            <span className="topbar-user-pill-icon" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserIcon />
              )}
            </span>
            <span className="topbar-user-name-text">{displayName}</span>
          </div>

          <div className="topbar-user-dropdown">
            <div className="dropdown-user-header">
              <div className="dropdown-user-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UserIcon />
                )}
              </div>
              <div className="dropdown-user-info">
                <div className="dropdown-user-name">{displayName}</div>
                <div className="dropdown-user-email">{displayEmail}</div>
              </div>
            </div>

            <div className="dropdown-divider" />

            <ul className="dropdown-links">
              <li>
                <Link to="/profile" className="dropdown-link-item">
                  <span className="dropdown-link-icon">
                    <UserIcon />
                  </span>
                  <span className="dropdown-link-label">View Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/settings?tab=account" className="dropdown-link-item">
                  <span className="dropdown-link-icon">
                    <SettingsIcon />
                  </span>
                  <span className="dropdown-link-label">Account Settings</span>
                </Link>
              </li>
              <li>
                <Link to="/settings?tab=notifications" className="dropdown-link-item">
                  <span className="dropdown-link-icon">
                    <BellIcon />
                  </span>
                  <span className="dropdown-link-label">Notifications</span>
                </Link>
              </li>
            </ul>

            <div className="dropdown-divider" />

            <div className="dropdown-footer">
              <button onClick={logout} className="dropdown-logout-btn">
                <span className="dropdown-link-icon dropdown-link-icon--danger">
                  <LogoutIcon />
                </span>
                <span className="dropdown-link-label">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
