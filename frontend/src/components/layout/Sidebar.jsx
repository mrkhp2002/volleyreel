import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  GridIcon,
  TrophyIcon,
  UsersIcon,
  UserIcon,
  ListIcon,
  ChartIcon,
  FileIcon,
  MedalIcon,
} from "../dashboard/icons";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <GridIcon /> },
  { to: "/tournaments", label: "Tournaments", icon: <TrophyIcon /> },
  { to: "/teams", label: "Teams", icon: <UsersIcon /> },
  { to: "/players", label: "Players", icon: <UserIcon /> },
  { to: "/matches", label: "Matches", icon: <ListIcon /> },
  { to: "/tournament-analytics", label: "Tournament Analytics", icon: <ChartIcon /> },
  { to: "/reports", label: "Reports", icon: <FileIcon /> },
  { to: "/leaderboards", label: "Leaderboards", icon: <MedalIcon /> },
];

function ChevronRight() {
  return (
    <svg className="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const displayName = user?.fullName || "Coach Admin";
  const displayEmail = user?.email || "admin@volleyreel.com";

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">🏐</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">VolleyReel</span>
            <span className="sidebar-brand-subtitle">Analytics Platform</span>
          </div>
          <button type="button" className="sidebar-collapse-btn" aria-label="Collapse sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "sidebar-nav-item active" : "sidebar-nav-item"
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              <ChevronRight />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="sidebar-user-name">{displayName}</p>
            <p className="sidebar-user-email">{displayEmail}</p>
          </div>
        </div>
        <button type="button" className="sidebar-logout-btn" onClick={logout}>
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}
