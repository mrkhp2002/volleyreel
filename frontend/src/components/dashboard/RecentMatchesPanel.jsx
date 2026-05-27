import { Link } from "react-router-dom";

const statusClass = {
  Completed: "dash-badge dash-badge--completed",
  Upcoming: "dash-badge dash-badge--upcoming",
};

export default function RecentMatchesPanel({ matches }) {
  return (
    <section className="dash-panel dash-panel--wide">
      <header className="dash-panel-header">
        <div>
          <h2>Recent Matches</h2>
          <p>Latest matches and upcoming fixtures</p>
        </div>
        <Link to="/matches" className="dash-panel-link">
          View All
        </Link>
      </header>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Match ID</th>
              <th>Tournament</th>
              <th>Teams</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id}>
                <td>
                  <Link to={`/matches/${match.id}`} className="dash-table-id">
                    {match.id}
                  </Link>
                </td>
                <td>{match.tournament}</td>
                <td>
                  <Link to={`/matches/${match.id}`} className="dash-table-teams-link">
                    {match.teams}
                  </Link>
                </td>
                <td className="dash-table-score">{match.score}</td>
                <td>
                  <span className={statusClass[match.status] || "dash-badge"}>
                    {match.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
