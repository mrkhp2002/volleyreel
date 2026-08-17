import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/leaderboards.css";

const teamRoutesMap = {};
const playerRoutesMap = {};

const teamRankings = [];
const playerRankings = [];

export default function LeaderboardsPage() {
  const [selectedTournament, setSelectedTournament] = useState("All");
  const [selectedDivision, setSelectedDivision] = useState("All");

  // Filter rankings dynamically
  const filteredTeams = useMemo(() => {
    return teamRankings.filter((t) => {
      const matchTourney = selectedTournament === "All" || t.tournament === selectedTournament;
      const matchDiv = selectedDivision === "All" || t.division === selectedDivision;
      return matchTourney && matchDiv;
    });
  }, [selectedTournament, selectedDivision]);

  const filteredPlayers = useMemo(() => {
    return playerRankings.filter((p) => {
      const matchTourney = selectedTournament === "All" || p.tournament === selectedTournament;
      const matchDiv = selectedDivision === "All" || p.division === selectedDivision;
      return matchTourney && matchDiv;
    });
  }, [selectedTournament, selectedDivision]);

  // Highlights state calculated dynamically based on filters
  const highlights = useMemo(() => {
    return {
      improved: { title: "N/A", subtitle: "No data available" },
      streak: { title: "N/A", subtitle: "No data available" },
      scorer: { title: "N/A", subtitle: "No data available" },
    };
  }, [selectedTournament]);

  return (
    <div className="leaderboards-page">
      {/* Glow backgrounds */}
      <div className="leaderboard-glow leaderboard-glow--1" />
      <div className="leaderboard-glow leaderboard-glow--2" />

      {/* Page Header */}
      <header className="leaderboard-header">
        <h1>Leaderboards</h1>
        <p>Top performing teams and players across all tournaments</p>
      </header>

      {/* Filters */}
      <div className="leaderboard-filter-bar">
        <CustomSelect 
          value={selectedTournament} 
          onChange={(e) => setSelectedTournament(e.target.value)}
          id="filter-leaderboard-tournament"
          className="leaderboard-filter-select"
          options={[
            { value: "All", label: "All Tournaments" },
            { value: "Spring Championship 2026", label: "Spring Championship 2026" },
            { value: "Regional Cup", label: "Regional Cup" }
          ]}
        />

        <CustomSelect 
          value={selectedDivision} 
          onChange={(e) => setSelectedDivision(e.target.value)}
          id="filter-leaderboard-division"
          className="leaderboard-filter-select"
          options={[
            { value: "All", label: "All Divisions" },
            { value: "Premier Division", label: "Premier Division" },
            { value: "Division 1", label: "Division 1" },
            { value: "Division 2", label: "Division 2" }
          ]}
        />
      </div>

      {/* Rankings Grid */}
      <div className="leaderboard-grid">
        {/* Left Column: Team Rankings */}
        <section className="leaderboard-card">
          <header className="leaderboard-card-header">
            <div className="leaderboard-card-icon leaderboard-card-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="leaderboard-card-title">
              <h2>Team Rankings</h2>
              <p>Based on overall performance</p>
            </div>
          </header>

          <div className="leaderboard-list">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => {
                let rankClass = "leaderboard-rank--other";
                if (team.rank === 1) rankClass = "leaderboard-rank--1";
                else if (team.rank === 2) rankClass = "leaderboard-rank--2";
                else if (team.rank === 3) rankClass = "leaderboard-rank--3";

                return (
                  <div key={team.name} className="leaderboard-item">
                    <div className="leaderboard-item-left">
                      <div className={`leaderboard-rank ${rankClass}`}>
                        {team.rank}
                      </div>
                      <div className="leaderboard-item-details">
                        <Link to={`/teams/${teamRoutesMap[team.name] || "TM-2026-001"}`} className="leaderboard-item-name-link">
                          {team.name}
                        </Link>
                        <span className="leaderboard-item-subtext">{team.record}</span>
                      </div>
                    </div>

                    <div className="leaderboard-item-stats">
                      <span className="leaderboard-item-stat-val leaderboard-item-stat-val--blue">
                        {team.points} points
                      </span>
                      <span className="leaderboard-item-stat-lbl">
                        {team.winRate} win rate
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                No team stats match selected filters.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Top Scorers */}
        <section className="leaderboard-card">
          <header className="leaderboard-card-header">
            <div className="leaderboard-card-icon leaderboard-card-icon--orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div className="leaderboard-card-title">
              <h2>Top Scorers</h2>
              <p>Individual player rankings</p>
            </div>
          </header>

          <div className="leaderboard-list">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => {
                let rankClass = "leaderboard-rank--other";
                if (player.rank === 1) rankClass = "leaderboard-rank--1";
                else if (player.rank === 2) rankClass = "leaderboard-rank--2";
                else if (player.rank === 3) rankClass = "leaderboard-rank--3";

                return (
                  <div key={player.name} className="leaderboard-item">
                    <div className="leaderboard-item-left">
                      <div className={`leaderboard-rank ${rankClass}`}>
                        {player.rank}
                      </div>
                      <div className="leaderboard-item-details">
                        <Link to={`/players/${playerRoutesMap[player.name] || "PL-2026-001"}`} className="leaderboard-item-name-link">
                          {player.name}
                        </Link>
                        <Link to={`/teams/${teamRoutesMap[player.team] || "TM-2026-001"}`} className="leaderboard-item-subtext-link">
                          {player.team}
                        </Link>
                      </div>
                    </div>

                    <div className="leaderboard-item-stats">
                      <span className="leaderboard-item-stat-val leaderboard-item-stat-val--orange">
                        {player.points}
                      </span>
                      <span className="leaderboard-item-stat-lbl">
                        {player.matches} matches
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                No player stats match selected filters.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Highlights Grid */}
      <footer className="leaderboard-highlights">
        {/* Most Improved */}
        <article className="leaderboard-highlight-card">
          <div className="leaderboard-highlight-header">
            <div className="leaderboard-highlight-icon leaderboard-highlight-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <span>Most Improved</span>
          </div>
          <div className="leaderboard-highlight-body">
            <span className="leaderboard-highlight-title">{highlights.improved.title}</span>
            <span className="leaderboard-highlight-subtitle">{highlights.improved.subtitle}</span>
          </div>
        </article>

        {/* Longest Win Streak */}
        <article className="leaderboard-highlight-card">
          <div className="leaderboard-highlight-header">
            <div className="leaderboard-highlight-icon leaderboard-highlight-icon--orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span>Longest Win Streak</span>
          </div>
          <div className="leaderboard-highlight-body">
            <span className="leaderboard-highlight-title">{highlights.streak.title}</span>
            <span className="leaderboard-highlight-subtitle">{highlights.streak.subtitle}</span>
          </div>
        </article>

        {/* Highest Scorer */}
        <article className="leaderboard-highlight-card">
          <div className="leaderboard-highlight-header">
            <div className="leaderboard-highlight-icon leaderboard-highlight-icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span>Highest Scorer</span>
          </div>
          <div className="leaderboard-highlight-body">
            <span className="leaderboard-highlight-title">{highlights.scorer.title}</span>
            <span className="leaderboard-highlight-subtitle">{highlights.scorer.subtitle}</span>
          </div>
        </article>
      </footer>
    </div>
  );
}
