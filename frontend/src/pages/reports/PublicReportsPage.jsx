import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/reports.css";

// Initial Mock Data
const initialPublicReports = [
  {
    id: "PR-2026-001",
    title: "Spring Championship 2026 - Public Highlights",
    tournament: "Spring Championship 2026",
    date: "Mar 06, 2026",
    views: 1245,
    shares: 87,
    status: "Public",
    stats: {
      matches: 16,
      aces: 58,
      blocks: 74,
      efficiency: "72%",
      skills: [
        { label: "Spikes", val: 82, color: "#f59e0b" },
        { label: "Blocks", val: 68, color: "#3b82f6" },
        { label: "Serves", val: 55, color: "#10b981" },
        { label: "Receptions", val: 78, color: "#8b5cf6" },
      ]
    }
  },
  {
    id: "PR-2026-002",
    title: "Top Performers - Regional Cup",
    tournament: "Regional Cup",
    date: "Mar 10, 2026",
    views: 892,
    shares: 45,
    status: "Public",
    stats: {
      matches: 8,
      aces: 34,
      blocks: 41,
      efficiency: "64%",
      skills: [
        { label: "Spikes", val: 65, color: "#f59e0b" },
        { label: "Blocks", val: 75, color: "#3b82f6" },
        { label: "Serves", val: 42, color: "#10b981" },
        { label: "Receptions", val: 61, color: "#8b5cf6" },
      ]
    }
  },
  {
    id: "PR-2026-003",
    title: "National Schools League - Season Recap",
    tournament: "National Schools League",
    date: "Jan 20, 2026",
    views: 2341,
    shares: 156,
    status: "Public",
    stats: {
      matches: 24,
      aces: 112,
      blocks: 148,
      efficiency: "79%",
      skills: [
        { label: "Spikes", val: 88, color: "#f59e0b" },
        { label: "Blocks", val: 81, color: "#3b82f6" },
        { label: "Serves", val: 70, color: "#10b981" },
        { label: "Receptions", val: 85, color: "#8b5cf6" },
      ]
    }
  },
];

// Available reports to select for sharing
const shareableReports = [
  { title: "Winter League Finals - Season Recap", tournament: "Winter League Finals", type: "Performance Analysis" },
  { title: "Negombo District Tournament Highlights", tournament: "Negombo District Tournament", type: "Tournament Summary" },
  { title: "Under-19 Girls Championship Detail Analysis", tournament: "U-19 Girls Championship", type: "Statistical Report" },
];

export default function PublicReportsPage() {
  const { user } = useAuth();
  const [publicReports, setPublicReports] = useState(initialPublicReports);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  
  // Form state
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  // Filtering
  const filteredReports = useMemo(() => {
    return publicReports.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.tournament.toLowerCase().includes(query)
      );
    });
  }, [publicReports, searchQuery]);

  // Handle sharing action
  const handleShareReportSubmit = (e) => {
    e.preventDefault();
    const sourceReport = shareableReports[selectedReportIndex];
    if (!sourceReport) return;

    // Check if already shared
    const isAlreadyShared = publicReports.some(
      (r) => r.title === sourceReport.title
    );
    if (isAlreadyShared) {
      setIsShareOpen(false);
      showToast(`"${sourceReport.title}" is already shared publicly.`);
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const newPublicReport = {
      id: `PR-2026-0${publicReports.length + 1}`,
      title: sourceReport.title,
      tournament: sourceReport.tournament,
      date: formattedDate,
      views: 0,
      shares: 0,
      status: "Public",
      stats: {
        matches: Math.floor(Math.random() * 10) + 5,
        aces: Math.floor(Math.random() * 40) + 10,
        blocks: Math.floor(Math.random() * 50) + 15,
        efficiency: `${Math.floor(Math.random() * 25) + 60}%`,
        skills: [
          { label: "Spikes", val: Math.floor(Math.random() * 30) + 60, color: "#f59e0b" },
          { label: "Blocks", val: Math.floor(Math.random() * 30) + 60, color: "#3b82f6" },
          { label: "Serves", val: Math.floor(Math.random() * 30) + 40, color: "#10b981" },
          { label: "Receptions", val: Math.floor(Math.random() * 30) + 60, color: "#8b5cf6" },
        ]
      }
    };

    setPublicReports([newPublicReport, ...publicReports]);
    setIsShareOpen(false);
    showToast(`Shared "${sourceReport.title}" to public reports portal`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleOpenPreview = (report) => {
    // Increment view count simulation
    setPublicReports(prev => 
      prev.map(r => r.id === report.id ? { ...r, views: r.views + 1 } : r)
    );
    setActiveReport({ ...report, views: report.views + 1 });
    setIsPreviewOpen(true);
  };

  const handleSocialShareSimulate = (report) => {
    // Increment share count simulation
    setPublicReports(prev => 
      prev.map(r => r.id === report.id ? { ...r, shares: r.shares + 1 } : r)
    );
    showToast(`Shared link to "${report.title}" copied to clipboard!`);
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
          <h1>Public Reports</h1>
          <p>Publicly shared tournament reports and highlights</p>
        </div>
        {user?.role !== "public_user" && (
          <button 
            onClick={() => setIsShareOpen(true)} 
            className="reports-btn-orange"
            id="btn-share-report"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Report
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
        <div className="reports-search-wrapper" style={{ width: "100%" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search public reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-public-reports"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="reports-grid">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="reports-card">
              {/* Top image/icon box */}
              <div className="reports-card-thumb">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              {/* Card Body */}
              <div className="reports-card-body">
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
                  <span className="reports-badge reports-badge--green">{report.status}</span>
                </div>
                <div className="reports-card-header">
                  <span className="reports-card-title">{report.title}</span>
                  <div className="reports-card-meta">
                    <span>{report.tournament}</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="reports-card-footer">
                <div className="reports-card-stats">
                  <div className="reports-stat-item" title="Views">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{report.views}</span>
                  </div>
                  <div 
                    className="reports-stat-item" 
                    title="Copy Link to Share"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSocialShareSimulate(report)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>{report.shares}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenPreview(report)}
                  className="reports-btn-view"
                  id={`btn-public-view-${report.id}`}
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "span 3", textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "rgba(15, 23, 42, 0.2)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.05)" }}>
            No public reports found matching your search.
          </div>
        )}
      </div>

      {/* Modal: Share Report */}
      {isShareOpen && (
        <div className="reports-modal-overlay">
          <form onSubmit={handleShareReportSubmit} className="reports-modal" id="form-share-report">
            <div className="reports-modal-header">
              <h2>Share Report to Public Portal</h2>
              <button 
                type="button" 
                onClick={() => setIsShareOpen(false)} 
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
                <label>Select Analytical Report to Share</label>
                <CustomSelect
                  value={selectedReportIndex}
                  onChange={(e) => setSelectedReportIndex(Number(e.target.value))}
                  options={shareableReports.map((report, idx) => ({
                    value: idx,
                    label: `${report.title} (${report.tournament})`
                  }))}
                  id="modal-select-share"
                  className="reports-modal-select"
                />
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                By clicking Share, you agree to make this performance statistics dashboard publicly viewable to all registered platform users and team spectators.
              </p>
            </div>

            <div className="reports-modal-footer">
              <button 
                type="button" 
                onClick={() => setIsShareOpen(false)} 
                className="reports-modal-btn-cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="reports-modal-btn-submit"
                id="btn-submit-share"
              >
                Share Publicly
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Details */}
      {isPreviewOpen && activeReport && (
        <div className="reports-modal-overlay">
          <div className="reports-modal" style={{ maxWidth: "620px" }}>
            <div className="reports-modal-header">
              <h2>Public Highlight Dashboard: {activeReport.title}</h2>
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
                  <span className="reports-preview-label">Public Views</span>
                  <span className="reports-preview-value">{activeReport.views}</span>
                </div>
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Aces Recorded</span>
                  <span className="reports-preview-value">{activeReport.stats.aces}</span>
                </div>
                <div className="reports-preview-box">
                  <span className="reports-preview-label">Match Efficiency</span>
                  <span className="reports-preview-value" style={{ color: "#10b981" }}>
                    {activeReport.stats.efficiency}
                  </span>
                </div>

                <div className="reports-preview-chart-container">
                  <span className="reports-preview-chart-title">Public Performance Metrics</span>
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
                  handleSocialShareSimulate(activeReport);
                }} 
                className="reports-modal-btn-submit"
              >
                Copy Shareable Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
