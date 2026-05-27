import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/matches.css";

// Initial Mock Match List
const initialMatches = [
  { id: "VM-2026-001", tournament: "Spring Championship 2026", teams: "Thunder Strikers vs Ocean Waves", date: "Mar 15, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-002", tournament: "Regional Cup", teams: "Sky Hawks vs Net Ninjas", date: "Mar 14, 2026", upload: "Processing", review: "In Review", video: "Not Generated" },
  { id: "VM-2026-003", tournament: "Spring Championship 2026", teams: "Beach Blazers vs Court Kings", date: "Mar 13, 2026", upload: "Failed", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-004", tournament: "Regional Cup", teams: "Thunder Strikers vs Sky Hawks", date: "Mar 12, 2026", upload: "Completed", review: "Completed", video: "Generating" },
  { id: "VM-2026-005", tournament: "Spring Championship 2026", teams: "Net Ninjas vs Beach Blazers", date: "Mar 11, 2026", upload: "Not Uploaded", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-006", tournament: "Spring Championship 2026", teams: "Thunder Strikers vs Court Kings", date: "Mar 10, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-007", tournament: "Regional Cup", teams: "Ocean Waves vs Beach Blazers", date: "Mar 09, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-008", tournament: "Regional Cup", teams: "Sky Hawks vs Court Kings", date: "Mar 08, 2026", upload: "Completed", review: "Completed", video: "Ready" },
  { id: "VM-2026-009", tournament: "Spring Championship 2026", teams: "Net Ninjas vs Thunder Strikers", date: "Mar 07, 2026", upload: "Processing", review: "In Review", video: "Not Generated" },
  { id: "VM-2026-010", tournament: "Regional Cup", teams: "Ocean Waves vs Net Ninjas", date: "Mar 06, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
  { id: "VM-2026-011", tournament: "Regional Cup", teams: "Beach Blazers vs Sky Hawks", date: "Mar 05, 2026", upload: "Failed", review: "Not Started", video: "Not Generated" },
  { id: "VM-2026-012", tournament: "Spring Championship 2026", teams: "Court Kings vs Ocean Waves", date: "Mar 04, 2026", upload: "Completed", review: "Confirmed", video: "Ready" },
];

export default function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem("volleyreel_matches");
    return saved ? JSON.parse(saved) : initialMatches;
  });

  useEffect(() => {
    localStorage.setItem("volleyreel_matches", JSON.stringify(matches));
  }, [matches]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("All");
  const [selectedUploadStatus, setSelectedUploadStatus] = useState("All");
  const [selectedVideoStatus, setSelectedVideoStatus] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);

  // Form inputs
  const [newId, setNewId] = useState("");
  const [newTournament, setNewTournament] = useState("Spring Championship 2026");
  const [newTeamA, setNewTeamA] = useState("");
  const [newTeamB, setNewTeamB] = useState("");
  const [newDate, setNewDate] = useState("");

  // Edit form inputs
  const [editTeams, setEditTeams] = useState("");
  const [editDate, setEditDate] = useState("");

  // Upload simulation state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Alert toast
  const [toast, setToast] = useState("");

  // Helper Toast trigger
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 4000);
  };

  // Filter Match list
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !q ||
        m.id.toLowerCase().includes(q) ||
        m.tournament.toLowerCase().includes(q) ||
        m.teams.toLowerCase().includes(q);

      const matchesTourney = selectedTournament === "All" || m.tournament === selectedTournament;
      const matchesUpload = selectedUploadStatus === "All" || m.upload === selectedUploadStatus;
      const matchesVideo = selectedVideoStatus === "All" || m.video === selectedVideoStatus;

      return matchesSearch && matchesTourney && matchesUpload && matchesVideo;
    });
  }, [matches, search, selectedTournament, selectedUploadStatus, selectedVideoStatus]);

  // Recalculate statistics dynamically from full database
  const stats = useMemo(() => {
    const total = filteredMatches.length;
    const uploaded = filteredMatches.filter(m => m.upload === "Completed").length;
    const review = filteredMatches.filter(m => m.review === "In Review").length;
    const generated = filteredMatches.filter(m => m.video === "Ready").length;

    return { total, uploaded, review, generated };
  }, [filteredMatches]);

  // Page slice
  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => {
    return filteredMatches.slice((activePage - 1) * pageSize, activePage * pageSize);
  }, [filteredMatches, activePage]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTournament, selectedUploadStatus, selectedVideoStatus]);

  // Submit Match Creation
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newId.trim() || !newTeamA.trim() || !newTeamB.trim() || !newDate) return;

    const formattedDate = new Date(newDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const newMatch = {
      id: newId.trim().toUpperCase(),
      tournament: newTournament,
      teams: `${newTeamA.trim()} vs ${newTeamB.trim()}`,
      date: formattedDate,
      upload: "Not Uploaded",
      review: "Not Started",
      video: "Not Generated",
    };

    setMatches([newMatch, ...matches]);
    setIsCreateOpen(false);
    setNewId("");
    setNewTeamA("");
    setNewTeamB("");
    setNewDate("");
    triggerToast(`Match ${newMatch.id} successfully created!`);
  };

  // Submit Match Editing
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTeams.trim() || !editDate.trim()) return;

    setMatches(prev => 
      prev.map(m => m.id === activeMatch.id ? { ...m, teams: editTeams.trim(), date: editDate.trim() } : m)
    );
    setIsEditOpen(false);
    triggerToast(`Updated match ${activeMatch.id} details.`);
  };

  // Simulate File uploading process
  const triggerUploadSimulation = () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setMatches(prevMatches => 
              prevMatches.map(m => m.id === activeMatch.id ? { ...m, upload: "Completed", review: "In Review" } : m)
            );
            setIsUploading(false);
            setIsUploadOpen(false);
            setUploadFile(null);
            triggerToast(`Video upload complete for ${activeMatch.id}!`);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const openEditModal = (match) => {
    setActiveMatch(match);
    setEditTeams(match.teams);
    setEditDate(match.date);
    setIsEditOpen(true);
  };

  const openUploadModal = (match) => {
    setActiveMatch(match);
    setIsUploadOpen(true);
  };

  const openPlayerModal = (match) => {
    setActiveMatch(match);
    setIsPlayerOpen(true);
  };

  // Rendering styled upload status badge
  const renderUploadBadge = (status) => {
    switch (status) {
      case "Completed":
        return <span className="matches-badge matches-badge--green">Completed</span>;
      case "Processing":
        return <span className="matches-badge matches-badge--blue">Processing</span>;
      case "Failed":
        return <span className="matches-badge matches-badge--red">Failed</span>;
      default:
        return <span className="matches-badge matches-badge--muted">{status}</span>;
    }
  };

  const renderReviewBadge = (status) => {
    switch (status) {
      case "Confirmed":
      case "Completed":
        return <span className="matches-badge matches-badge--green">{status}</span>;
      case "In Review":
        return <span className="matches-badge matches-badge--yellow">In Review</span>;
      default:
        return <span className="matches-badge matches-badge--muted">{status}</span>;
    }
  };

  const renderVideoBadge = (status) => {
    switch (status) {
      case "Ready":
        return <span className="matches-badge matches-badge--green">Ready</span>;
      case "Generating":
        return <span className="matches-badge matches-badge--blue">Generating</span>;
      default:
        return <span className="matches-badge matches-badge--muted">{status}</span>;
    }
  };

  return (
    <div className="matches-page">
      {/* Glow overlays */}
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast Alert Banner */}
      {toast && (
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
            animation: "matchesSlideUp 0.2s ease-out"
          }}
        >
          <span style={{ color: "#10b981" }}>✓</span> {toast}
        </div>
      )}

      {/* Main Header */}
      <header className="matches-header">
        <div className="matches-header-text">
          <h1>Match List</h1>
          <p>Manage created matches, uploads, reviews, and generated videos</p>
        </div>
        <button 
          onClick={() => navigate("/matches/create")} 
          className="matches-btn-orange"
          id="btn-create-match"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Create Match
        </button>
      </header>

      {/* Search and filter inputs panel */}
      <div className="matches-filter-bar">
        <div className="matches-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by tournament, team, or match ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-match-list"
          />
        </div>

        <select 
          value={selectedTournament} 
          onChange={(e) => setSelectedTournament(e.target.value)}
          id="filter-match-tournament"
        >
          <option value="All">All Tournaments</option>
          <option value="Spring Championship 2026">Spring Championship 2026</option>
          <option value="Regional Cup">Regional Cup</option>
        </select>

        <select 
          value={selectedUploadStatus} 
          onChange={(e) => setSelectedUploadStatus(e.target.value)}
          id="filter-match-upload"
        >
          <option value="All">All Upload Status</option>
          <option value="Completed">Completed</option>
          <option value="Processing">Processing</option>
          <option value="Failed">Failed</option>
          <option value="Not Uploaded">Not Uploaded</option>
        </select>

        <select 
          value={selectedVideoStatus} 
          onChange={(e) => setSelectedVideoStatus(e.target.value)}
          id="filter-match-video"
        >
          <option value="All">All Video Status</option>
          <option value="Ready">Ready</option>
          <option value="Generating">Generating</option>
          <option value="Not Generated">Not Generated</option>
        </select>
      </div>

      {/* Stat Cards Grid */}
      <div className="matches-stats-grid">
        <div className="matches-stat-card">
          <span className="matches-stat-label">Total Matches</span>
          <span className="matches-stat-value">{stats.total}</span>
        </div>
        <div className="matches-stat-card">
          <span className="matches-stat-label">Uploaded Matches</span>
          <span className="matches-stat-value">{stats.uploaded}</span>
        </div>
        <div className="matches-stat-card">
          <span className="matches-stat-label">Under Review</span>
          <span className="matches-stat-value">{stats.review}</span>
        </div>
        <div className="matches-stat-card">
          <span className="matches-stat-label">Videos Generated</span>
          <span className="matches-stat-value">{stats.generated}</span>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="matches-table-panel">
        <div className="matches-table-wrap">
          <table className="matches-table">
            <thead>
              <tr>
                <th>Match ID</th>
                <th>Tournament</th>
                <th>Teams</th>
                <th>Match Date</th>
                <th>Upload Status</th>
                <th style={{ minWidth: "100px" }}>Review Status</th>
                <th>Video</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((match) => (
                  <tr key={match.id}>
                    <td>
                      <a href="#!" onClick={() => openPlayerModal(match)} className="matches-link-id">
                        {match.id}
                      </a>
                    </td>
                    <td>{match.tournament}</td>
                    <td>
                      <div className="matches-teams-cell">
                        {match.teams.split(" vs ")[0]} <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>vs</span>
                        <br />
                        {match.teams.split(" vs ")[1]}
                      </div>
                    </td>
                    <td>{match.date}</td>
                    <td>{renderUploadBadge(match.upload)}</td>
                    <td>{renderReviewBadge(match.review)}</td>
                    <td>{renderVideoBadge(match.video)}</td>
                    <td>
                      <div className="matches-action-cell">
                        <button 
                          onClick={() => openPlayerModal(match)} 
                          className="matches-action-btn" 
                          title="View Video Highlights"
                          id={`btn-view-${match.id}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        {match.upload === "Not Uploaded" || match.upload === "Failed" ? (
                          <button 
                            onClick={() => openUploadModal(match)} 
                            className="matches-action-btn" 
                            title="Upload Match Video"
                            id={`btn-upload-${match.id}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </button>
                        ) : match.upload === "Completed" ? (
                          <button 
                            onClick={() => openPlayerModal(match)} 
                            className="matches-action-btn" 
                            title="Review video clips"
                            id={`btn-review-${match.id}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 7l-7 5 7 5V7z" />
                              <rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                          </button>
                        ) : null}

                        <button 
                          onClick={() => openEditModal(match)} 
                          className="matches-action-btn" 
                          title="Edit details"
                          id={`btn-edit-${match.id}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No matches found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredMatches.length > 0 && (
          <div className="matches-pagination-bar">
            <span>
              Showing {(activePage - 1) * pageSize + 1} to{" "}
              {Math.min(activePage * pageSize, filteredMatches.length)} of {filteredMatches.length} matches
            </span>
            <div className="matches-pagination-controls">
              <button 
                type="button" 
                className="matches-page-btn" 
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageIdx) => (
                <button
                  key={pageIdx}
                  type="button"
                  className={`matches-page-btn${pageIdx === activePage ? " active" : ""}`}
                  onClick={() => setCurrentPage(pageIdx)}
                >
                  {pageIdx}
                </button>
              ))}
              <button 
                type="button" 
                className="matches-page-btn" 
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Match */}
      {isCreateOpen && (
        <div className="matches-modal-overlay">
          <form onSubmit={handleCreateSubmit} className="matches-modal" id="form-create-match">
            <div className="matches-modal-header">
              <h2>Create New Match</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="matches-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="matches-modal-body">
              <div className="matches-modal-field">
                <label htmlFor="m-create-id">Match ID *</label>
                <input
                  id="m-create-id"
                  type="text"
                  placeholder="e.g., VM-2026-013"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  required
                />
              </div>

              <div className="matches-modal-field">
                <label htmlFor="m-create-tournament">Tournament</label>
                <select
                  id="m-create-tournament"
                  value={newTournament}
                  onChange={(e) => setNewTournament(e.target.value)}
                >
                  <option value="Spring Championship 2026">Spring Championship 2026</option>
                  <option value="Regional Cup">Regional Cup</option>
                </select>
              </div>

              <div className="matches-modal-field">
                <label htmlFor="m-create-teama">Team A *</label>
                <input
                  id="m-create-teama"
                  type="text"
                  placeholder="e.g., Thunder Strikers"
                  value={newTeamA}
                  onChange={(e) => setNewTeamA(e.target.value)}
                  required
                />
              </div>

              <div className="matches-modal-field">
                <label htmlFor="m-create-teamb">Team B *</label>
                <input
                  id="m-create-teamb"
                  type="text"
                  placeholder="e.g., Ocean Waves"
                  value={newTeamB}
                  onChange={(e) => setNewTeamB(e.target.value)}
                  required
                />
              </div>

              <div className="matches-modal-field">
                <label htmlFor="m-create-date">Match Date *</label>
                <input
                  id="m-create-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="matches-modal-footer">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="matches-modal-btn-cancel">Cancel</button>
              <button type="submit" className="matches-modal-btn-submit" id="btn-create-submit">Save Match</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Video Player */}
      {isPlayerOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <div className="matches-modal" style={{ maxWidth: "640px" }}>
            <div className="matches-modal-header">
              <h2>Match Player: {activeMatch.id} Highlights</h2>
              <button type="button" onClick={() => setIsPlayerOpen(false)} className="matches-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="matches-modal-body">
              <div className="matches-video-player">
                <div className="matches-video-screen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  <span style={{ fontWeight: 600 }}>{activeMatch.teams}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{activeMatch.tournament} - {activeMatch.date}</span>
                </div>

                <div className="matches-video-controls">
                  <div className="matches-video-track-bg">
                    <div className="matches-video-track-fill"></div>
                  </div>
                  <div className="matches-video-btn-row">
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ cursor: "pointer" }}>⏸</span>
                      <span>🔊</span>
                      <span className="matches-video-time">02:14 / 05:40</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>1.0x</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                Analyzing camera angles for serve line cross detection. High-precision AI trackers have flagged 14 events ready for review.
              </p>
            </div>

            <div className="matches-modal-footer">
              <button type="button" onClick={() => setIsPlayerOpen(false)} className="matches-modal-btn-cancel">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Video */}
      {isUploadOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <div className="matches-modal">
            <div className="matches-modal-header">
              <h2>Upload Match Video: {activeMatch.id}</h2>
              <button type="button" onClick={() => { if (!isUploading) setIsUploadOpen(false); }} className="matches-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="matches-modal-body">
              {!isUploading ? (
                <>
                  <div className="matches-upload-zone" onClick={() => setUploadFile("match_feed.mp4")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {uploadFile ? (
                      <>
                        <strong>Selected file: {uploadFile}</strong>
                        <p>Click to choose a different video file</p>
                      </>
                    ) : (
                      <>
                        <strong>Choose match recording or drag here</strong>
                        <p>MP4, MOV or AVI formats supported (Max 1GB)</p>
                      </>
                    )}
                  </div>
                  <div className="matches-modal-field" style={{ marginTop: "10px" }}>
                    <label>Selected Tournament</label>
                    <input type="text" value={activeMatch.tournament} readOnly disabled />
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Uploading {uploadFile}...</span>
                  <div className="matches-progress-bar-bg">
                    <div className="matches-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "8px" }}>
                    {uploadProgress}% Uploaded
                  </span>
                </div>
              )}
            </div>

            <div className="matches-modal-footer">
              <button 
                type="button" 
                onClick={() => setIsUploadOpen(false)} 
                className="matches-modal-btn-cancel"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={triggerUploadSimulation} 
                className="matches-modal-btn-submit"
                disabled={isUploading || !uploadFile}
                id="btn-upload-submit"
              >
                Start Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Match */}
      {isEditOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <form onSubmit={handleEditSubmit} className="matches-modal" id="form-edit-match">
            <div className="matches-modal-header">
              <h2>Edit Match Details: {activeMatch.id}</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="matches-modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="matches-modal-body">
              <div className="matches-modal-field">
                <label htmlFor="m-edit-teams">Teams Description</label>
                <input
                  id="m-edit-teams"
                  type="text"
                  value={editTeams}
                  onChange={(e) => setEditTeams(e.target.value)}
                  required
                />
              </div>

              <div className="matches-modal-field">
                <label htmlFor="m-edit-date">Match Date</label>
                <input
                  id="m-edit-date"
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="matches-modal-footer">
              <button type="button" onClick={() => setIsEditOpen(false)} className="matches-modal-btn-cancel">Cancel</button>
              <button type="submit" className="matches-modal-btn-submit" id="btn-edit-submit">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
