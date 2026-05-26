import useAuth from "../../hooks/useAuth";

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

export default function Topbar() {
  const { user } = useAuth();
  const displayName = user?.fullName || "Coach Admin";

  return (
    <header className="topbar">
      <div className="topbar-search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search tournaments, teams, players, or match ID..."
          aria-label="Search"
        />
      </div>

      <div className="topbar-actions">
        <button type="button" className="topbar-notify-btn" aria-label="Notifications">
          <BellIcon />
          <span className="topbar-notify-dot" />
        </button>

        <div className="topbar-user-pill">
          <span className="topbar-user-pill-icon">
            <UserIcon />
          </span>
          <span>{displayName}</span>
        </div>
      </div>
    </header>
  );
}
