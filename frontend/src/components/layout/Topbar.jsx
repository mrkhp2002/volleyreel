import useAuth from "../../hooks/useAuth";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon">🔍</span>
        <input placeholder="Search tournaments, teams, players, or match ID..." />
      </div>
      
      <div className="topbar-actions">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.fullName || "Coach Admin"}</span>
            <span className="user-role">{user?.email || "admin@volleyreel.com"}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={logout} title="Sign Out">
          Sign Out
        </button>
      </div>
    </header>
  );
}
