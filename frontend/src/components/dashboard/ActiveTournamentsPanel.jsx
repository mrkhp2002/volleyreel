import { Link } from "react-router-dom";

const statusClass = {
  Ongoing: "dash-badge dash-badge--ongoing",
  Upcoming: "dash-badge dash-badge--upcoming",
  Completed: "dash-badge dash-badge--completed",
};

export default function ActiveTournamentsPanel({ tournaments }) {
  return (
    <section className="dash-panel">
      <header className="dash-panel-header">
        <div>
          <h2>Active Tournaments</h2>
          <p>Current tournament status</p>
        </div>
      </header>

      <ul className="dash-tournament-list">
        {tournaments.map((tournament) => (
          <li key={tournament.name} className="dash-tournament-item">
            <div className="dash-tournament-top">
              <h3>{tournament.name}</h3>
              <span className={statusClass[tournament.status] || "dash-badge"}>
                {tournament.status}
              </span>
            </div>
            <p className="dash-tournament-date">{tournament.dateRange}</p>
            <p className="dash-tournament-teams">
              <UsersIcon />
              {tournament.teams}
            </p>
          </li>
        ))}
      </ul>

      <Link to="/tournaments" className="dash-panel-footer-link">
        View All Tournaments
      </Link>
    </section>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
