import { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import { generateTournamentPDF } from "../../utils/pdfReportGenerator";
import apiClient from "../../services/apiClient";
import "../../styles/reports.css";

const defaultInitialReports = [
  {
    id: "TR-2026-01",
    title: "Spring Championship 2026 - Final Report",
    tournament: "Spring Championship 2026",
    date: "Aug 15, 2026",
    type: "Tournament Summary",
    status: "Published",
    match_format: "Best of 5 Sets (25 Point Rally Score)",
    stats: {
      matches: 14,
      aces: 42,
      blocks: 56,
      efficiency: "74%",
      skills: [
        { label: "Spikes", val: 82, color: "#f59e0b" },
        { label: "Blocks", val: 68, color: "#3b82f6" },
        { label: "Serves", val: 76, color: "#10b981" },
        { label: "Receptions", val: 70, color: "#8b5cf6" }
      ]
    }
  },
  {
    id: "TR-2026-02",
    title: "National Varsity League 2026 - Mid-Season Analytics",
    tournament: "National Varsity League 2026",
    date: "Aug 10, 2026",
    type: "Performance Analysis",
    status: "Published",
    match_format: "Best of 3 Sets",
    stats: {
      matches: 18,
      aces: 51,
      blocks: 64,
      efficiency: "69%",
      skills: [
        { label: "Spikes", val: 74, color: "#f59e0b" },
        { label: "Blocks", val: 72, color: "#3b82f6" },
        { label: "Serves", val: 65, color: "#10b981" },
        { label: "Receptions", val: 78, color: "#8b5cf6" }
      ]
    }
  },
  {
    id: "TR-2026-03",
    title: "Summer Volleyball Open 2026 - Statistical Breakdown",
    tournament: "Summer Volleyball Open 2026",
    date: "Jul 28, 2026",
    type: "Statistical Report",
    status: "Published",
    match_format: "Best of 5 Sets",
    stats: {
      matches: 9,
      aces: 28,
      blocks: 39,
      efficiency: "63%",
      skills: [
        { label: "Spikes", val: 68, color: "#f59e0b" },
        { label: "Blocks", val: 60, color: "#3b82f6" },
        { label: "Serves", val: 70, color: "#10b981" },
        { label: "Receptions", val: 65, color: "#8b5cf6" }
      ]
    }
  }
];

export default function TournamentReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState(defaultInitialReports);
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

  // Fetch real tournaments from API backend if available
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await apiClient.get("/tournaments");
        if (response.data && Array.isArray(response.data)) {
          setDbTournaments(response.data);
          if (response.data.length > 0 && !newTournament) {
            setNewTournament(response.data[0].name);
          }
        }
      } catch (err) {
        // Fallback silently if API not authenticated or unavailable
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

    const newReport = {
      id: newId,
      title: newTitle.trim(),
      tournament: newTournament.trim(),
      date: formattedDate,
      type: newType,
      status: "Published",
      match_format: "Best of 5 Sets (Rally Score)",
      stats: {
        matches: Math.floor(Math.random() * 12) + 6,
        aces: Math.floor(Math.random() * 40) + 20,
        blocks: Math.floor(Math.random() * 50) + 25,
        efficiency: `${Math.floor(Math.random() * 25) + 65}%`,
        skills: [
          { label: "Spikes", val: Math.floor(Math.random() * 30) + 60, color: "#f59e0b" },
          { label: "Blocks", val: Math.floor(Math.random() * 30) + 55, color: "#3b82f6" },
          { label: "Serves", val: Math.floor(Math.random() * 30) + 50, color: "#10b981" },
          { label: "Receptions", val: Math.floor(Math.random() * 30) + 60, color: "#8b5cf6" },
        ]
      }
    };

    // Prepend to list
    setReports([newReport, ...reports]);
    
    // Clear inputs and close
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

            <div className="reports-modal-body">
              <div className="reports-preview-grid">
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Matches Tracked</span>
                  <span className="reports-preview-value">{activeReport.stats.matches}</span>
                </div>
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Total Aces</span>
                  <span className="reports-preview-value">{activeReport.stats.aces}</span>
                </div>
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Total Blocks</span>
                  <span className="reports-preview-value">{activeReport.stats.blocks}</span>
                </div>
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Execution Efficiency</span>
                  <span className="reports-preview-value" style={{ color: "#10b981" }}>
                    {activeReport.stats.efficiency}
                  </span>
                </div>

                <div className="reports-preview-chart-container">
                  <span className="reports-preview-chart-title">Skill Category Scores</span>
                  <div className="reports-chart-bar-list">
                    {activeReport.stats.skills.map((skill) => (
                      <div key={skill.label} className="reports-chart-bar-row">
                        <span className="reports-chart-bar-label">{skill.label}</span>
                        <div className="reports-chart-bar-bg">
                          <div 
                            className="reports-chart-bar-fill" 
                            style={{ 
                              width: `${skill.val}%`, 
                              backgroundColor: skill.color,
                              boxShadow: `0 0 8px ${skill.color}55`
                            }}
                          />
                        </div>
                        <span className="reports-chart-bar-val">{skill.val}</span>
                      </div>
                    ))}
                  </div>
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
