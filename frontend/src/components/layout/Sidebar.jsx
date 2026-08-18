import { useEffect, useState } from "react";
import Logo from "../common/Logo";
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
];

const tournamentsNavGroup = {
  key: "tournaments",
  label: "Tournaments",
  icon: <TrophyIcon />,
  basePath: "/tournaments",
  children: [
    { to: "/tournaments", label: "Tournament List", end: true },
    { to: "/tournaments/create", label: "Create Tournament" },
  ],
};

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

const playersNavGroup = {
  key: "players",
  label: "Players",
  icon: <UserIcon />,
  basePath: "/players",
  children: [
    { to: "/players", label: "Player Management", end: true },
  ],
};

const matchesNavGroup = {
  key: "matches",
  label: "Matches",
  icon: <ListIcon />,
  basePath: "/matches",
  children: [
    { to: "/matches", label: "Match List", end: true },
    { to: "/matches/create", label: "Create Match" },
    { to: "/matches/upload", label: "Upload & Review" },
    { to: "/matches/videos", label: "Generated Videos" },
  ],
};

const reportsNavGroup = {
  key: "reports",
  label: "Reports",
  icon: <FileIcon />,
  basePath: "/reports",
  children: [
    { to: "/reports/tournament", label: "Tournament Reports" },
    { to: "/reports/public", label: "Public Reports" },
  ],
};

const simpleNavItemsAfter = [
  { to: "/tournament-analytics", label: "Tournament Analytics", icon: <ChartIcon /> },
];

const simpleNavItemsBottom = [
  { to: "/leaderboards", label: "Leaderboards", icon: <MedalIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

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

function NavGroup({ group, isOpen, onToggle, onMouseEnter, onMouseLeave, isSectionActive, collapsed }) {
  return (
    <div 
      className={`sidebar-nav-group${isOpen ? " open" : ""}${isSectionActive ? " active-group" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        className="sidebar-nav-item sidebar-nav-group-toggle"
        onClick={onToggle}
        title={collapsed ? group.label : undefined}
        aria-expanded={isOpen}
      >
        <span className="sidebar-nav-icon">{group.icon}</span>
        <span className="sidebar-nav-label">{group.label}</span>
        <ChevronRight className="nav-chevron nav-chevron--expand" />
      </button>

      {!collapsed && isOpen && (
        <div className="sidebar-nav-sub">
          {group.children.map((child) => (
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
  );
}

export default function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose, onMouseEnter, onMouseLeave }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const rawRole = (user?.role || "coach").toLowerCase();
  const isPlayer = rawRole === "player" || rawRole === "public_user" || rawRole === "viewer";
  const displayName = user?.fullName || (isPlayer ? "Player Athlete" : "Coach Admin");
  const displayEmail = user?.email || "";

  const tournamentsGroupData = {
    ...tournamentsNavGroup,
    children: isPlayer
      ? tournamentsNavGroup.children.filter((c) => c.to === "/tournaments")
      : tournamentsNavGroup.children,
  };

  const teamsGroupData = {
    ...teamsNavGroup,
    children: isPlayer
      ? teamsNavGroup.children.filter((c) => c.to === "/teams")
      : teamsNavGroup.children,
  };

  const matchesGroupData = {
    ...matchesNavGroup,
    children: isPlayer
      ? matchesNavGroup.children.filter((c) => c.to === "/matches" || c.to === "/matches/videos")
      : matchesNavGroup.children,
  };

  const isTournamentsSection = location.pathname.startsWith("/tournaments");
  const [tournamentsOpen, setTournamentsOpen] = useState(isTournamentsSection);

  const isTeamsSection = location.pathname.startsWith("/teams");
  const [teamsOpen, setTeamsOpen] = useState(isTeamsSection);

  const isPlayersSection = location.pathname.startsWith("/players");
  const [playersOpen, setPlayersOpen] = useState(isPlayersSection);

  const isMatchesSection = location.pathname.startsWith("/matches");
  const [matchesOpen, setMatchesOpen] = useState(isMatchesSection);

  const isReportsSection = location.pathname.startsWith("/reports");
  const [reportsOpen, setReportsOpen] = useState(isReportsSection);

  useEffect(() => {
    setTournamentsOpen(isTournamentsSection);
  }, [isTournamentsSection]);

  useEffect(() => {
    setTeamsOpen(isTeamsSection);
  }, [isTeamsSection]);

  useEffect(() => {
    setPlayersOpen(isPlayersSection);
  }, [isPlayersSection]);

  useEffect(() => {
    setMatchesOpen(isMatchesSection);
  }, [isMatchesSection]);

  useEffect(() => {
    setReportsOpen(isReportsSection);
  }, [isReportsSection]);

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onMobileClose} />}
      <aside 
        className={`sidebar${collapsed ? " sidebar--collapsed" : ""}${mobileOpen ? " sidebar--mobile-open" : ""}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark" title="VolleyReel">
              <Logo size="24px" />
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
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onMobileClose}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

      <div className="sidebar-scroll">
        <nav className="sidebar-nav" aria-label="Main navigation">
          {simpleNavItems.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          <NavGroup 
            group={tournamentsGroupData} 
            isOpen={tournamentsOpen} 
            onToggle={() => setTournamentsOpen(prev => !prev)} 
            onMouseEnter={() => setTournamentsOpen(true)}
            onMouseLeave={() => !isTournamentsSection && setTournamentsOpen(false)}
            isSectionActive={isTournamentsSection} 
            collapsed={collapsed} 
          />

          <NavGroup 
            group={teamsGroupData} 
            isOpen={teamsOpen} 
            onToggle={() => setTeamsOpen(prev => !prev)} 
            onMouseEnter={() => setTeamsOpen(true)}
            onMouseLeave={() => !isTeamsSection && setTeamsOpen(false)}
            isSectionActive={isTeamsSection} 
            collapsed={collapsed} 
          />

          <NavGroup 
            group={playersNavGroup} 
            isOpen={playersOpen} 
            onToggle={() => setPlayersOpen(prev => !prev)} 
            onMouseEnter={() => setPlayersOpen(true)}
            onMouseLeave={() => !isPlayersSection && setPlayersOpen(false)}
            isSectionActive={isPlayersSection} 
            collapsed={collapsed} 
          />

          <NavGroup 
            group={matchesGroupData} 
            isOpen={matchesOpen} 
            onToggle={() => setMatchesOpen(prev => !prev)} 
            onMouseEnter={() => setMatchesOpen(true)}
            onMouseLeave={() => !isMatchesSection && setMatchesOpen(false)}
            isSectionActive={isMatchesSection} 
            collapsed={collapsed} 
          />

          {simpleNavItemsAfter.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          <NavGroup 
            group={reportsNavGroup} 
            isOpen={reportsOpen} 
            onToggle={() => setReportsOpen(prev => !prev)} 
            onMouseEnter={() => setReportsOpen(true)}
            onMouseLeave={() => !isReportsSection && setReportsOpen(false)}
            isSectionActive={isReportsSection} 
            collapsed={collapsed} 
          />

          {simpleNavItemsBottom.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="sidebar-footer-block">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" title={displayName} style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
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
    </>
  );
}
