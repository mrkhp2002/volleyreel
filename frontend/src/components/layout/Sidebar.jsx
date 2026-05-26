import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

const simpleNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: <GridIcon /> },
  { to: "/tournaments", label: "Tournaments", icon: <TrophyIcon /> },
];

const teamsNavGroup = {
  key: "teams",
  label: "Teams",
  icon: <UsersIcon />,
  basePath: "/teams",
  children: [
    { to: "/teams", label: "Team List", end: true },
    { to: "/teams/create", label: "Create Team" },
  ],
};

const simpleNavItemsAfter = [
  { to: "/players", label: "Players", icon: <UserIcon /> },
  { to: "/matches", label: "Matches", icon: <ListIcon /> },
  { to: "/tournament-analytics", label: "Tournament Analytics", icon: <ChartIcon /> },
  { to: "/reports", label: "Reports", icon: <FileIcon /> },
  { to: "/leaderboards", label: "Leaderboards", icon: <MedalIcon /> },
];

function ChevronRight({ className = "nav-chevron" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        isActive ? "sidebar-nav-item active" : "sidebar-nav-item"
      }
    >
      <span className="sidebar-nav-icon">{item.icon}</span>
      <span className="sidebar-nav-label">{item.label}</span>
      <ChevronRight />
    </NavLink>
  );
}

export default function Sidebar({ collapsed = false, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const displayName = user?.fullName || "Coach Admin";
  const displayEmail = user?.email || "admin@volleyreel.com";

  const isTeamsSection = location.pathname.startsWith("/teams");
  const [teamsOpen, setTeamsOpen] = useState(isTeamsSection);

  useEffect(() => {
    if (isTeamsSection) {
      setTeamsOpen(true);
    }
  }, [isTeamsSection]);

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark" title="VolleyReel">
            🏐
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">VolleyReel</span>
            <span className="sidebar-brand-subtitle">Analytics Platform</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="sidebar-scroll">
        <nav className="sidebar-nav" aria-label="Main navigation">
          {simpleNavItems.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          <div className={`sidebar-nav-group${teamsOpen ? " open" : ""}${isTeamsSection ? " active-group" : ""}`}>
            <button
              type="button"
              className="sidebar-nav-item sidebar-nav-group-toggle"
              onClick={() => setTeamsOpen((prev) => !prev)}
              title={collapsed ? teamsNavGroup.label : undefined}
              aria-expanded={teamsOpen}
            >
              <span className="sidebar-nav-icon">{teamsNavGroup.icon}</span>
              <span className="sidebar-nav-label">{teamsNavGroup.label}</span>
              <ChevronRight className="nav-chevron nav-chevron--expand" />
            </button>

            {!collapsed && teamsOpen && (
              <div className="sidebar-nav-sub">
                {teamsNavGroup.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    end={child.end}
                    className={({ isActive }) =>
                      isActive ? "sidebar-nav-sub-item active" : "sidebar-nav-sub-item"
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {simpleNavItemsAfter.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="sidebar-footer-block">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" title={displayName}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">{displayName}</p>
              <p className="sidebar-user-email">{displayEmail}</p>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
            title="Logout"
          >
            <LogoutIcon />
            <span className="sidebar-logout-label">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
