import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import API from "../../services/apiClient";
import "../../styles/analytics.css";

export default function TournamentAnalyticsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tourneyRes, teamRes, matchRes] = await Promise.all([
          API.get("/tournaments/").catch(() => ({ data: [] })),
          API.get("/teams/").catch(() => ({ data: [] })),
          API.get("/matches/").catch(() => ({ data: [] }))
        ]);

        setTournaments(Array.isArray(tourneyRes.data) ? tourneyRes.data : []);
        setTeams(Array.isArray(teamRes.data) ? teamRes.data : []);
        setMatches(Array.isArray(matchRes.data) ? matchRes.data : []);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter teams and matches by selected tournament
  const activeTourneyObj = useMemo(() => {
    if (selectedTournament === "All") return null;
    return tournaments.find((t) => t.name === selectedTournament) || null;
  }, [tournaments, selectedTournament]);

  const activeTeams = useMemo(() => {
    if (!activeTourneyObj) return teams;
    return teams.filter((t) => t.tournament_id === activeTourneyObj.tournament_id);
  }, [teams, activeTourneyObj]);

  const activeMatches = useMemo(() => {
    if (!activeTourneyObj) return matches;
    return matches.filter((m) => m.tournament_id === activeTourneyObj.tournament_id);
  }, [matches, activeTourneyObj]);

  // Compute live team standings
  const teamStandings = useMemo(() => {
    const map = {};
    activeTeams.forEach((team) => {
      map[team.team_id] = {
        id: team.team_id,
        name: team.name,
        wins: 0,
        losses: 0,
        matches: 0
      };
    });

    activeMatches.forEach((m) => {
      if (m.home_score !== null && m.away_score !== null) {
        const homeId = m.home_team_id;
        const awayId = m.away_team_id;
        if (map[homeId]) {
          map[homeId].matches += 1;
          if (m.home_score > m.away_score) map[homeId].wins += 1;
          else if (m.home_score < m.away_score) map[homeId].losses += 1;
        }
        if (map[awayId]) {
          map[awayId].matches += 1;
          if (m.away_score > m.home_score) map[awayId].wins += 1;
          else if (m.away_score < m.home_score) map[awayId].losses += 1;
        }
      }
    });

    const list = Object.values(map);
    list.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    return list.map((t, idx) => ({
      rank: idx + 1,
      name: t.name,
      id: t.id,
      record: `${t.wins}W - ${t.losses}L`,
      winRate: t.matches > 0 ? `${Math.round((t.wins / t.matches) * 100)}%` : "0%"
    }));
  }, [activeTeams, activeMatches]);

  // Compute trend points for SVG graph
  const trendPoints = useMemo(() => {
    if (activeMatches.length === 0) return [];

    const width = 400; // drawable width (50 to 450)
    const step = activeMatches.length > 1 ? width / (activeMatches.length - 1) : 0;

    return activeMatches.slice(0, 10).map((m, idx) => {
      const cx = 50 + idx * step;
      const h = m.home_score || 0;
      const a = m.away_score || 0;
      const total = h + a;
      // Map score to Y position (20 to 180)
      const cy = total > 0 ? Math.max(30, Math.min(170, 180 - (h / (total || 1)) * 120)) : 100;
      return {
        cx,
        cy,
        match: `VM-${m.match_id || idx + 1}`,
        value: `${m.home_team?.name || 'Home'} vs ${m.away_team?.name || 'Away'} (${h}-${a})`
      };
    });
  }, [activeMatches]);

  const { linePath, areaPath } = useMemo(() => {
    if (trendPoints.length === 0) return { linePath: "", areaPath: "" };
    const line = trendPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.cx} ${p.cy}`).join(" ");
    const area = `${line} L ${trendPoints[trendPoints.length - 1].cx} 200 L ${trendPoints[0].cx} 200 Z`;
    return { linePath: line, areaPath: area };
  }, [trendPoints]);

  const renderStatIcon = (type) => {
    switch (type) {
      case "matches":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case "duration":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        );
      case "teams":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "tournaments":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
            <path d="M12 2a4 4 0 0 1 4 4v6H8V6a4 4 0 0 1 4-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const tournamentOptions = useMemo(() => {
    const list = [{ value: "All", label: "All Tournaments" }];
    tournaments.forEach((t) => {
      list.push({ value: t.name, label: t.name });
    });
    return list;
  }, [tournaments]);

  const statsList = [
    { label: "Total Matches Analyzed", val: String(activeMatches.length), tone: "blue", type: "matches" },
    { label: "Avg Match Duration", val: activeMatches.length > 0 ? "75m" : "0m", tone: "teal", type: "duration" },
    { label: "Teams Analyzed", val: String(activeTeams.length), tone: "purple", type: "teams" },
    { label: "Active Tournaments", val: String(selectedTournament === "All" ? tournaments.length : 1), tone: "orange", type: "tournaments" },
  ];

  return (
    <div className="analytics-page">
      {/* Glow Backdrops */}
      <div className="analytics-glow analytics-glow--1" />
      <div className="analytics-glow analytics-glow--2" />

      {/* Header */}
      <header className="analytics-header">
        <h1>Tournament Analytics</h1>
        <p>Comprehensive analytics and insights across all tournaments</p>
      </header>

      {/* Filter Selector */}
      <div className="analytics-filter-row">
        <CustomSelect
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          options={tournamentOptions}
          id="filter-analytics-tournament"
          className="analytics-filter-select"
        />
      </div>

      {/* Stat Cards Grid */}
      <div className="analytics-stats-grid">
        {statsList.map((stat) => (
          <div key={stat.label} className="analytics-stat-card">
            <div className="analytics-stat-copy">
              <span className="analytics-stat-label">{stat.label}</span>
              <span className="analytics-stat-value">{stat.val}</span>
            </div>
            <div className={`analytics-stat-icon analytics-stat-icon--${stat.tone}`}>
              {renderStatIcon(stat.type)}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & List Layout */}
      <div className="analytics-main-grid">
        {/* SVG Match Performance Line Graph */}
        <section className="analytics-panel">
          <h2>Match Performance Trends</h2>
          
          <div className="analytics-chart-container">
            {tooltip && (
              <div 
                className="analytics-chart-tooltip"
                style={{ 
                  left: `${(tooltip.cx / 500) * 100}%`, 
                  top: `${(tooltip.cy / 200) * 100}%`,
                  opacity: 1
                }}
              >
                <span className="analytics-chart-tooltip-header">Match {tooltip.match}</span>
                <span className="analytics-chart-tooltip-body">{tooltip.value}</span>
              </div>
            )}

            <svg 
              viewBox="0 0 500 200" 
              className="analytics-chart-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="analytics-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              <line x1="50" y1="20" x2="450" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="140" x2="450" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="200" x2="450" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {areaPath && (
                <path 
                  key={`area-${selectedTournament}`}
                  d={areaPath} 
                  className="analytics-chart-area" 
                />
              )}

              {linePath && (
                <path 
                  key={`line-${selectedTournament}`}
                  d={linePath} 
                  className="analytics-chart-line" 
                />
              )}

              {trendPoints.map((pt, idx) => (
                <circle
                  key={`${pt.match}-${idx}`}
                  cx={pt.cx}
                  cy={pt.cy}
                  className="analytics-chart-point"
                  onMouseEnter={() => setTooltip(pt)}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </svg>
          </div>
        </section>

        {/* Top Performing Teams List */}
        <section className="analytics-panel">
          <h2>Top Performing Teams</h2>
          <div className="analytics-team-list">
            {teamStandings.length > 0 ? (
              teamStandings.map((team) => (
                <div key={team.id || team.name} className="analytics-team-row">
                  <div className="analytics-team-row-left">
                    <span className="analytics-team-rank">#{team.rank}</span>
                    <div className="analytics-team-details">
                      <Link to={`/teams/${team.id}`} className="analytics-team-name-link">
                        {team.name}
                      </Link>
                      <span className="analytics-team-record">{team.record}</span>
                    </div>
                  </div>
                  <div className="analytics-team-stats">
                    <span className="analytics-team-winrate">{team.winRate}</span>
                    <span className="analytics-team-lbl">Win Rate</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-muted)", padding: "20px", textAlign: "center" }}>
                No team standings recorded yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Interactive Tournament Breakdown Table */}
      <section className="analytics-breakdown-panel">
        <h2>Tournament Breakdown</h2>
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Matches</th>
                <th>Teams</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length > 0 ? (
                tournaments.map((t) => {
                  const tMatches = matches.filter((m) => m.tournament_id === t.tournament_id).length;
                  const tTeams = teams.filter((tm) => tm.tournament_id === t.tournament_id).length;
                  const isActive = selectedTournament === t.name;

                  return (
                    <tr 
                      key={t.tournament_id} 
                      onClick={() => setSelectedTournament(isActive ? "All" : t.name)}
                      className={isActive ? "analytics-table-row--active" : ""}
                    >
                      <td><strong>{t.name}</strong></td>
                      <td>{tMatches}</td>
                      <td>{tTeams}</td>
                      <td>
                        <span className="analytics-badge analytics-badge--blue">{t.status || "Active"}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                    No tournaments available in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
