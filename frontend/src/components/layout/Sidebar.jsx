import { NavLink } from 'react-router-dom';

const navigationGroups = [
  {
    title: "MAIN",
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '📊' }
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { to: '/tournaments', label: 'Tournaments', icon: '🏆' },
      { to: '/teams', label: 'Teams', icon: '👥' },
      { to: '/players', label: 'Players', icon: '🏃' },
      { to: '/matches', label: 'Matches', icon: '🏐' }
    ]
  },
  {
    title: "ANALYTICS",
    items: [
      { to: '/tournament-analytics', label: 'Analytics', icon: '📈' },
      { to: '/reports', label: 'Reports', icon: '📋' },
      { to: '/leaderboards', label: 'Leaderboards', icon: '🎖️' }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo">🏐</span>
        <span className="brand-text">VolleyReel</span>
      </div>
      
      <nav className="sidebar-nav">
        {navigationGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <span className="nav-group-title">{group.title}</span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <span className="version">v0.1.0 (Beta)</span>
      </div>
    </aside>
  );
}
