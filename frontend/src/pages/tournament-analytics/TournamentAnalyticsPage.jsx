import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/analytics.css";

const teamRoutesMap = {
  "Thunder Strikers": "TM-2026-001",
  "Ocean Waves": "TM-2026-002",
  "Sky Hawks": "TM-2026-003",
  "Net Ninjas": "TM-2026-004",
  "Beach Blazers": "TM-2026-005",
  "Court Kings": "TM-2026-001"
};

// Datastores mapping to each tournament filter selection
const database = {
  All: {
    stats: [
      { label: "Total Matches Analyzed", val: "247", tone: "blue", type: "matches" },
      { label: "Avg Match Duration", val: "78m", tone: "teal", type: "duration" },
      { label: "Teams Analyzed", val: "64", tone: "purple", type: "teams" },
      { label: "Active Tournaments", val: "3", tone: "orange", type: "tournaments" },
    ],
    trends: [
      { cx: 50, cy: 140, match: "VM-101", value: "58% Serve Eff." },
      { cx: 130, cy: 110, match: "VM-102", value: "68% Attack Eff." },
      { cx: 210, cy: 130, match: "VM-103", value: "62% Block Rate" },
      { cx: 290, cy: 80, match: "VM-104", value: "76% Pass Accuracy" },
      { cx: 370, cy: 60, match: "VM-105", value: "82% Set Accuracy" },
      { cx: 450, cy: 40, match: "VM-106", value: "88% Overall Eff." },
    ],
    teams: [
      { rank: 1, name: "Thunder Strikers", record: "12W - 2L", winRate: "85.7%" },
      { rank: 2, name: "Ocean Waves", record: "10W - 4L", winRate: "71.4%" },
      { rank: 3, name: "Sky Hawks", record: "9W - 5L", winRate: "64.3%" },
      { rank: 4, name: "Net Ninjas", record: "8W - 6L", winRate: "57.1%" },
    ],
  },
  "Spring Championship 2026": {
    stats: [
      { label: "Total Matches Analyzed", val: "47", tone: "blue", type: "matches" },
      { label: "Avg Match Duration", val: "82m", tone: "teal", type: "duration" },
      { label: "Teams Analyzed", val: "16", tone: "purple", type: "teams" },
      { label: "Active Tournaments", val: "1", tone: "orange", type: "tournaments" },
    ],
    trends: [
      { cx: 50, cy: 150, match: "VM-101", value: "55% Serve Eff." },
      { cx: 130, cy: 130, match: "VM-104", value: "62% Attack Eff." },
      { cx: 210, cy: 90, match: "VM-107", value: "73% Block Rate" },
      { cx: 290, cy: 100, match: "VM-110", value: "70% Pass Accuracy" },
      { cx: 370, cy: 70, match: "VM-113", value: "80% Set Accuracy" },
      { cx: 450, cy: 50, match: "VM-116", value: "85% Overall Eff." },
    ],
    teams: [
      { rank: 1, name: "Thunder Strikers", record: "12W - 2L", winRate: "85.7%" },
      { rank: 2, name: "Net Ninjas", record: "8W - 6L", winRate: "57.1%" },
      { rank: 3, name: "Court Kings", record: "8W - 9L", winRate: "47.1%" },
      { rank: 4, name: "Sky Hawks", record: "4W - 8L", winRate: "33.3%" },
    ],
  },
  "Regional Cup": {
    stats: [
      { label: "Total Matches Analyzed", val: "28", tone: "blue", type: "matches" },
      { label: "Avg Match Duration", val: "74m", tone: "teal", type: "duration" },
      { label: "Teams Analyzed", val: "8", tone: "purple", type: "teams" },
      { label: "Active Tournaments", val: "1", tone: "orange", type: "tournaments" },
    ],
    trends: [
      { cx: 50, cy: 120, match: "VM-201", value: "64% Serve Eff." },
      { cx: 130, cy: 100, match: "VM-202", value: "70% Attack Eff." },
      { cx: 210, cy: 110, match: "VM-203", value: "67% Block Rate" },
      { cx: 290, cy: 80, match: "VM-204", value: "75% Pass Accuracy" },
      { cx: 370, cy: 50, match: "VM-205", value: "85% Set Accuracy" },
      { cx: 450, cy: 30, match: "VM-206", value: "91% Overall Eff." },
    ],
    teams: [
      { rank: 1, name: "Ocean Waves", record: "10W - 4L", winRate: "71.4%" },
      { rank: 2, name: "Sky Hawks", record: "9W - 5L", winRate: "64.3%" },
      { rank: 3, name: "Beach Blazers", record: "9W - 8L", winRate: "52.9%" },
      { rank: 4, name: "Thunder Strikers", record: "3W - 5L", winRate: "37.5%" },
    ],
  },
};

// Summary breakdowns list
const breakdowns = [
  { name: "Spring Championship 2026", matches: 47, teams: 16, avgScore: "3.2 - 1.8", clips: "124 clips" },
  { name: "Regional Cup", matches: 28, teams: 8, avgScore: "3.1 - 1.9", clips: "87 clips" },
];

export default function TournamentAnalyticsPage() {
  const [selectedTournament, setSelectedTournament] = useState("All");
  
  // State variables for showing custom SVG tooltip
  const [tooltip, setTooltip] = useState(null);

  // Retrieve matching active database
  const activeData = useMemo(() => {
    return database[selectedTournament] || database.All;
  }, [selectedTournament]);

  // Construct SVG paths dynamically
  const { linePath, areaPath } = useMemo(() => {
    const points = activeData.trends;
    if (points.length === 0) return { linePath: "", areaPath: "" };

    const line = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.cx} ${p.cy}`).join(" ");
    const area = `${line} L ${points[points.length - 1].cx} 200 L ${points[0].cx} 200 Z`;

    return { linePath: line, areaPath: area };
  }, [activeData]);

  // Render match analytics icons
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
          options={[
            { value: "All", label: "All Tournaments" },
            { value: "Spring Championship 2026", label: "Spring Championship 2026" },
            { value: "Regional Cup", label: "Regional Cup" }
          ]}
          id="filter-analytics-tournament"
          className="analytics-filter-select"
        />
      </div>

      {/* Stat Cards Grid */}
      <div className="analytics-stats-grid">
        {activeData.stats.map((stat) => (
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
            {/* Custom Tooltip */}
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
              {/* Gradients */}
              <defs>
                <linearGradient id="analytics-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="20" x2="450" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="140" x2="450" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="50" y1="200" x2="450" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {/* Shaded Area Under Line */}
              {areaPath && (
                <path 
                  key={`area-${selectedTournament}`}
                  d={areaPath} 
                  className="analytics-chart-area" 
                />
              )}

              {/* Glowing Line Path */}
              {linePath && (
                <path 
                  key={`line-${selectedTournament}`}
                  d={linePath} 
                  className="analytics-chart-line" 
                />
              )}

              {/* Points markers */}
              {activeData.trends.map((pt, idx) => (
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
            {activeData.teams.map((team) => (
              <div key={team.name} className="analytics-team-row">
                <div className="analytics-team-row-left">
                  <span className="analytics-team-rank">#{team.rank}</span>
                  <div className="analytics-team-details">
                    <Link to={`/teams/${teamRoutesMap[team.name] || "TM-2026-001"}`} className="analytics-team-name-link">
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
            ))}
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
                <th>Avg Score</th>
                <th>Highlights</th>
              </tr>
            </thead>
            <tbody>
              {breakdowns.map((row) => {
                const isActive = selectedTournament === row.name;
                return (
                  <tr 
                    key={row.name} 
                    onClick={() => setSelectedTournament(isActive ? "All" : row.name)}
                    className={isActive ? "analytics-table-row--active" : ""}
                  >
                    <td><strong>{row.name}</strong></td>
                    <td>{row.matches}</td>
                    <td>{row.teams}</td>
                    <td>{row.avgScore}</td>
                    <td>
                      <a href="#!" onClick={(e) => e.stopPropagation()} className="analytics-table-link">
                        {row.clips}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
