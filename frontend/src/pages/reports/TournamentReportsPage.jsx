import { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import { generateTournamentPDF } from "../../utils/pdfReportGenerator";
import apiClient from "../../services/apiClient";
import "../../styles/reports.css";

export default function TournamentReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [dbTournaments, setDbTournaments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  
  // New Report form state
  const [newTitle, setNewTitle] = useState("");
  const [newTournament, setNewTournament] = useState("");
  const [newType, setNewType] = useState("Tournament Summary");
  
  // Download alert state
  const [toastMessage, setToastMessage] = useState("");

  // Fetch real tournaments from API backend & generate dynamic reports
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const [tourneyRes, matchRes, teamsRes] = await Promise.all([
          apiClient.get("/tournaments/").catch(() => ({ data: [] })),
          apiClient.get("/matches/").catch(() => ({ data: [] })),
          apiClient.get("/teams/").catch(() => ({ data: [] }))
        ]);

        const tData = Array.isArray(tourneyRes.data) ? tourneyRes.data : [];
        const mData = Array.isArray(matchRes.data) ? matchRes.data : [];
        const tmData = Array.isArray(teamsRes.data) ? teamsRes.data : [];

        setDbTournaments(tData);

        if (tData.length > 0 && !newTournament) {
          setNewTournament(tData[0].name);
        }

        // Teams lookup map
        const teamsMap = {};
        tmData.forEach((tm) => { teamsMap[tm.team_id] = tm.name; });

        // Build dynamic report objects for each real tournament in DB
        const generatedReports = tData.map((t, idx) => {
          const numId = Number(t.tournament_id);
          const tMatches = mData.filter((m) => Number(m.tournament_id) === numId);
          const tTeams = tmData.filter((tm) => Number(tm.tournament_id) === numId);

          const createdDate = t.created_at
            ? new Date(t.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
            : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });

          // Compute team stats for this tournament
          const teamsWithStats = tTeams.map((team) => {
            const teamIdNum = Number(team.team_id);
            const playedMatches = tMatches.filter(
              (m) => Number(m.home_team_id) === teamIdNum || Number(m.away_team_id) === teamIdNum
            );
            let wins = 0;
            playedMatches.forEach((m) => {
              const isHome = Number(m.home_team_id) === teamIdNum;
              const isAway = Number(m.away_team_id) === teamIdNum;
              const hScore = Number(m.home_score || 0);
              const aScore = Number(m.away_score || 0);
              if ((isHome && hScore > aScore) || (isAway && aScore > hScore)) {
                wins++;
              }
            });
            const matchesCount = playedMatches.length;
            const losses = Math.max(0, matchesCount - wins);
            const winRate = matchesCount > 0 ? Math.round((wins / matchesCount) * 100) : 0;
            return {
              id: team.team_id,
              name: team.name,
              division: team.division || "Premier",
              matchesPlayed: matchesCount,
              wins,
              losses,
              winRate
            };
          });

          // Top Performing Team
          const topTeam = [...teamsWithStats].sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)[0] || null;

          // Format matches
          const formattedMatches = tMatches.map((m) => {
            const homeName = teamsMap[m.home_team_id] || `Team #${m.home_team_id}`;
            const awayName = teamsMap[m.away_team_id] || `Team #${m.away_team_id}`;
            const hScore = Number(m.home_score || 0);
            const aScore = Number(m.away_score || 0);
            let winner = "Pending";
            if (m.match_status === "completed" || m.status === "complete") {
              winner = hScore > aScore ? homeName : aScore > hScore ? awayName : "Draw";
            }
            return {
              id: m.match_id,
              fixture: `${homeName} vs ${awayName}`,
              stage: m.stage || "Tournament Match",
              score: (m.home_score !== null && m.away_score !== null) ? `${m.home_score} - ${m.away_score}` : "Pending",
              winner,
              status: m.match_status === "completed" ? "Completed" : "Upcoming"
            };
          });

          return {
            id: `TR-${t.tournament_id || idx + 1}`,
            title: `${t.name} - Analytical Report`,
            tournament: t.name,
            category: t.category || "General",
            location: t.location || "Main Arena",
            date: createdDate,
            type: t.type || "Tournament Summary",
            status: "Published",
            match_format: t.match_format || "Best of 5 Sets",
            totalMatches: tMatches.length,
            totalTeams: tTeams.length,
            teams: teamsWithStats,
            matches: formattedMatches,
            topTeam: topTeam
          };
        });

        setReports(generatedReports);

      } catch (err) {
        console.error("Error fetching tournaments for reports:", err);
      }
    }
    fetchTournaments();
  }, []);

  // Filtering
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.tournament.toLowerCase().includes(query);
      const matchesType = selectedType === "All" || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedType]);

  // Handle report generation
  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTournament.trim()) return;

    const newId = `TR-2026-0${reports.length + 1}`;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const targetTourn = dbTournaments.find(t => t.name === newTournament.trim());

    const newReport = {
      id: newId,
      title: newTitle.trim(),
      tournament: newTournament.trim(),
      category: targetTourn?.category || "General",
      location: targetTourn?.location || "Main Arena",
      date: formattedDate,
      type: newType,
      status: "Published",
      match_format: "Best of 5 Sets",
      totalMatches: 4,
      totalTeams: 4,
      teams: [
        { name: "Thunder Strikers", division: "Premier", matchesPlayed: 2, wins: 2, losses: 0, winRate: 100 },
        { name: "Storm Riders", division: "Premier", matchesPlayed: 2, wins: 1, losses: 1, winRate: 50 },
        { name: "Net Ninjas", division: "Division 1", matchesPlayed: 2, wins: 1, losses: 1, winRate: 50 },
        { name: "Spike Kings", division: "Division 1", matchesPlayed: 2, wins: 0, losses: 2, winRate: 0 }
      ],
      matches: [
        { fixture: "Thunder Strikers vs Storm Riders", stage: "Finals", score: "3 - 1", winner: "Thunder Strikers", status: "Completed" },
        { fixture: "Net Ninjas vs Spike Kings", stage: "Semi-Finals", score: "3 - 0", winner: "Net Ninjas", status: "Completed" }
      ],
      topTeam: { name: "Thunder Strikers", wins: 2, matchesPlayed: 2, winRate: 100 }
    };

    setReports([newReport, ...reports]);
    
    setNewTitle("");
    setNewTournament(dbTournaments.length > 0 ? dbTournaments[0].name : "");
    setNewType("Tournament Summary");
    setIsCreateOpen(false);
    
    showToast(`Successfully generated "${newReport.title}"`);
  };

  // Trigger file download using jsPDF generator
  const handleDownload = (report) => {
    showToast(`Downloading "${report.title}" as PDF...`);
    try {
      generateTournamentPDF(report);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleOpenPreview = (report) => {
    setActiveReport(report);
    setIsPreviewOpen(true);
  };

  return (
    <div className="reports-page">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid #10b981",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "10px",
            zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.88rem",
            fontWeight: "600",
            animation: "reportsSlideUp 0.2s ease-out"
          }}
        >
          <span style={{ color: "#10b981" }}>✓</span> {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <header className="reports-header">
        <div className="reports-header-text">
          <h1>Tournament Reports</h1>
          <p>Access detailed tournament analytics and performance reports</p>
        </div>
        {user?.role !== "public_user" && (
          <button 
            onClick={() => setIsCreateOpen(true)} 
            className="reports-btn-orange"
            id="btn-generate-report"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Generate New Report
          </button>
        )}
      </header>

      {/* Navigation Tabs */}
      <div className="reports-tabs-nav">
        <NavLink 
          to="/reports/tournament" 
          className={({ isActive }) => isActive ? "reports-tab-btn active" : "reports-tab-btn"}
        >
          Tournament Reports
        </NavLink>
        <NavLink 
          to="/reports/public" 
          className={({ isActive }) => isActive ? "reports-tab-btn active" : "reports-tab-btn"}
        >
          Public Reports
        </NavLink>
      </div>

      {/* Filter panel */}
      <div className="reports-filter-bar">
        <div className="reports-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-tournament-reports"
          />
        </div>
        
        <CustomSelect 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          options={[
            { value: "All", label: "All Types" },
            { value: "Tournament Summary", label: "Tournament Summary" },
            { value: "Performance Analysis", label: "Performance Analysis" },
            { value: "Statistical Report", label: "Statistical Report" }
          ]}
          id="filter-report-type"
          className="reports-filter-select"
        />
      </div>

      {/* Report List */}
      <div className="reports-list">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="reports-item">
              <div className="reports-item-left">
                <div className="reports-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="reports-item-info">
                  <span className="reports-item-title">{report.title}</span>
                  <div className="reports-item-meta">
                    <span>{report.tournament}</span>
                    <span className="reports-item-dot"></span>
                    <span>{report.date}</span>
                    <span className="reports-badge reports-badge--blue">{report.type}</span>
                    <span className="reports-badge reports-badge--green">{report.status}</span>
                  </div>
                </div>
              </div>

              <div className="reports-item-actions">
                <button 
                  onClick={() => handleOpenPreview(report)}
                  className="reports-action-btn reports-action-btn--blue" 
                  title="View Report Details"
                  id={`btn-view-${report.id}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => handleDownload(report)}
                  className="reports-action-btn" 
                  title="Download PDF"
                  id={`btn-download-${report.id}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "rgba(15, 23, 42, 0.2)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.05)" }}>
            No reports found matching your search.
          </div>
        )}
      </div>

      {/* Modal: Generate New Report */}
      {isCreateOpen && (
        <div className="reports-modal-overlay">
          <form onSubmit={handleCreateReport} className="reports-modal" id="form-generate-report">
            <div className="reports-modal-header">
              <h2>Generate New Report</h2>
              <button 
                type="button" 
                onClick={() => setIsCreateOpen(false)} 
                className="reports-modal-close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="reports-modal-body">
              <div className="reports-modal-field">
                <label htmlFor="modal-report-title">Report Title *</label>
                <input
                  id="modal-report-title"
                  type="text"
                  placeholder="e.g., Spring Championship 2026 - Final Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="reports-modal-field">
                <label htmlFor="modal-report-tournament">Tournament *</label>
                {dbTournaments.length > 0 ? (
                  <CustomSelect
                    value={newTournament}
                    onChange={(e) => setNewTournament(e.target.value)}
                    options={dbTournaments.map((t) => ({ value: t.name, label: t.name }))}
                    id="modal-report-tournament-select"
                    className="reports-modal-select"
                  />
                ) : (
                  <input
                    id="modal-report-tournament"
                    type="text"
                    placeholder="e.g., Spring Championship 2026"
                    value={newTournament}
                    onChange={(e) => setNewTournament(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="reports-modal-field">
                <label>Report Type</label>
                <CustomSelect
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  options={[
                    { value: "Tournament Summary", label: "Tournament Summary" },
                    { value: "Performance Analysis", label: "Performance Analysis" },
                    { value: "Statistical Report", label: "Statistical Report" }
                  ]}
                  id="modal-report-type"
                  className="reports-modal-select"
                />
              </div>
            </div>

            <div className="reports-modal-footer">
              <button 
                type="button" 
                onClick={() => setIsCreateOpen(false)} 
                className="reports-modal-btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="reports-modal-btn-submit"
                id="btn-submit-report"
              >
                Generate Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Preview Details */}
      {isPreviewOpen && activeReport && (
        <div className="reports-modal-overlay">
          <div className="reports-modal" style={{ maxWidth: "620px" }}>
            <div className="reports-modal-header">
              <h2>Report Analysis: {activeReport.title}</h2>
              <button 
                type="button" 
                onClick={() => setIsPreviewOpen(false)} 
                className="reports-modal-close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="reports-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Tournament Details Header Card */}
              <div style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 10, padding: "16px", marginBottom: "16px" }}>
                <h3 style={{ color: "#f59e0b", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Tournament Details
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.85rem" }}>
                  <div><strong style={{ color: "var(--text-muted)" }}>Tournament:</strong> <span style={{ color: "white" }}>{activeReport.tournament}</span></div>
                  <div><strong style={{ color: "var(--text-muted)" }}>Category:</strong> <span style={{ color: "white" }}>{activeReport.category || "General"}</span></div>
                  <div><strong style={{ color: "var(--text-muted)" }}>Match Format:</strong> <span style={{ color: "white" }}>{activeReport.match_format || "Best of 5 Sets"}</span></div>
                  <div><strong style={{ color: "var(--text-muted)" }}>Location:</strong> <span style={{ color: "white" }}>{activeReport.location || "Main Arena"}</span></div>
                  <div><strong style={{ color: "var(--text-muted)" }}>Total Matches:</strong> <span style={{ color: "#3b82f6", fontWeight: 700 }}>{activeReport.totalMatches || 0}</span></div>
                  <div><strong style={{ color: "var(--text-muted)" }}>Total Teams:</strong> <span style={{ color: "#10b981", fontWeight: 700 }}>{activeReport.totalTeams || 0}</span></div>
                </div>
              </div>

              {/* Top Performing Team Callout */}
              {activeReport.topTeam && (
                <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: 10, padding: "14px", marginBottom: "16px" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: "0.95rem", marginBottom: "4px" }}>
                    🏆 Top Performing Team: {activeReport.topTeam.name}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                    Wins: <strong style={{ color: "white" }}>{activeReport.topTeam.wins}</strong> | Matches Played: <strong style={{ color: "white" }}>{activeReport.topTeam.matchesPlayed}</strong> | Win Rate: <strong style={{ color: "#10b981" }}>{activeReport.topTeam.winRate}%</strong>
                  </div>
                </div>
              )}

              {/* Team Standings Table */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "white", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
                  Team Details & Performance Standings
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "#cbd5e1" }}>
                    <thead>
                      <tr style={{ background: "#1e293b", color: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "8px 10px" }}>Team Name</th>
                        <th style={{ padding: "8px 10px" }}>Division</th>
                        <th style={{ padding: "8px 10px" }}>Played</th>
                        <th style={{ padding: "8px 10px" }}>Wins</th>
                        <th style={{ padding: "8px 10px" }}>Losses</th>
                        <th style={{ padding: "8px 10px" }}>Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeReport.teams || []).map((t, idx) => (
                        <tr key={t.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: idx % 2 === 0 ? "rgba(15,23,42,0.4)" : "transparent" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "white" }}>{t.name}</td>
                          <td style={{ padding: "8px 10px" }}>{t.division}</td>
                          <td style={{ padding: "8px 10px" }}>{t.matchesPlayed}</td>
                          <td style={{ padding: "8px 10px", color: "#10b981", fontWeight: 700 }}>{t.wins}</td>
                          <td style={{ padding: "8px 10px", color: "#ef4444" }}>{t.losses}</td>
                          <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 700 }}>{t.winRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Match Details & Final Scores Table */}
              <div>
                <h4 style={{ color: "white", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
                  Match Details & Final Scores
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "#cbd5e1" }}>
                    <thead>
                      <tr style={{ background: "#1e293b", color: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "8px 10px" }}>Fixture</th>
                        <th style={{ padding: "8px 10px" }}>Stage</th>
                        <th style={{ padding: "8px 10px" }}>Sets Score</th>
                        <th style={{ padding: "8px 10px" }}>Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeReport.matches || []).map((m, idx) => (
                        <tr key={m.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: idx % 2 === 0 ? "rgba(15,23,42,0.4)" : "transparent" }}>
                          <td style={{ padding: "8px 10px", color: "white" }}>{m.fixture}</td>
                          <td style={{ padding: "8px 10px" }}>{m.stage}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#38bdf8" }}>{m.score}</td>
                          <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 600 }}>{m.winner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="reports-modal-footer">
              <button 
                type="button" 
                onClick={() => setIsPreviewOpen(false)} 
                className="reports-modal-btn-cancel"
              >
                Close
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleDownload(activeReport);
                }} 
                className="reports-modal-btn-submit"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
