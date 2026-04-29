import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/matches', label: 'Matches' },
  { to: '/tournament-analytics', label: 'Tournament Analytics' },
  { to: '/reports', label: 'Reports' },
  { to: '/leaderboards', label: 'Leaderboards' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>VolleyReel</h2>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
