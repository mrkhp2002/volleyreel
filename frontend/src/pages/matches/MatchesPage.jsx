import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import API from "../../services/apiClient";
import "../../styles/matches.css";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatMatch(m, teamsMap, tournamentsMap) {
  const homeTeam = teamsMap[m.home_team_id]?.name || `Team #${m.home_team_id}`;
  const awayTeam = teamsMap[m.away_team_id]?.name || `Team #${m.away_team_id}`;
  const tournament =
    tournamentsMap[m.tournament_id]?.name || `Tournament #${m.tournament_id}`;
  const date = m.created_at
    ? new Date(m.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";
  return {
    ...m,
    id: m.match_id,
    teams: `${homeTeam} vs ${awayTeam}`,
    homeTeam,
    awayTeam,
    tournament,
    date,
    match_status: m.match_status || "upcoming",
    upload: m.video_url ? "Completed" : "Not Uploaded",
    review:
      m.status === "complete"
        ? "Confirmed"
        : m.status === "processing"
        ? "In Review"
        : "Not Started",
    video:
      m.status === "complete" && m.highlight_url
        ? "Ready"
        : m.status === "processing"
        ? "Generating"
        : "Not Generated",
    pipelineStatus: m.status, // pending | processing | complete | failed
  };
}

// ── Badge Components ─────────────────────────────────────────────────────────

function PipelineBadge({ status }) {
  if (status === "complete")
    return <span className="matches-badge matches-badge--green">Complete</span>;
  if (status === "processing")
    return (
      <span
        className="matches-badge matches-badge--blue"
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#60a5fa",
            display: "inline-block",
            flexShrink: 0,
            animation: "vr-pulse 1.4s ease-in-out infinite",
          }}
        />
        Processing
      </span>
    );
  if (status === "failed")
    return <span className="matches-badge matches-badge--red">Failed</span>;
  return <span className="matches-badge matches-badge--muted">Pending</span>;
}

function VideoBadge({ status }) {
  if (status === "Ready")
    return <span className="matches-badge matches-badge--green">Ready</span>;
  if (status === "Generating")
    return <span className="matches-badge matches-badge--blue">Generating</span>;
  return (
    <span className="matches-badge matches-badge--muted">{status}</span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const navigate = useNavigate();

  // Remote data
  const [matches, setMatches] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [tournamentsMap, setTournamentsMap] = useState({});
  const [eventCountsMap, setEventCountsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("All");
  const [selectedUploadStatus, setSelectedUploadStatus] = useState("All");
  const [selectedVideoStatus, setSelectedVideoStatus] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);

  // Upload form
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Edit form
  const [editHomeScore, setEditHomeScore] = useState(0);
  const [editAwayScore, setEditAwayScore] = useState(0);
  const [editStatus, setEditStatus] = useState("pending");
  const [editLoading, setEditLoading] = useState(false);

  // Pipeline
  const [analyzeLoading, setAnalyzeLoading] = useState({});
  const pollingRef = useRef({});

  // Toast
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const triggerToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4500);
  }, []);

  // ── Polling ──────────────────────────────────────────────────────────────

  const startPolling = useCallback(
    (matchId) => {
      if (pollingRef.current[matchId]) return;
      pollingRef.current[matchId] = setInterval(async () => {
        try {
          const res = await API.get(`/pipeline/${matchId}/status`);
          const { status, events_detected, highlight_url } = res.data;
          setMatches((prev) =>
            prev.map((m) => {
              if (m.match_id !== matchId) return m;
              return {
                ...m,
                pipelineStatus: status,
                status,
                highlight_url: highlight_url || m.highlight_url,
                video:
                  status === "complete" && highlight_url
                    ? "Ready"
                    : status === "processing"
                    ? "Generating"
                    : "Not Generated",
                review:
                  status === "complete"
                    ? "Confirmed"
                    : status === "processing"
                    ? "In Review"
                    : "Not Started",
              };
            })
          );
          if (events_detected != null)
            setEventCountsMap((prev) => ({ ...prev, [matchId]: events_detected }));
          if (status === "complete" || status === "failed") {
            clearInterval(pollingRef.current[matchId]);
            delete pollingRef.current[matchId];
            if (status === "complete")
              triggerToast(
                `Pipeline complete for match #${matchId}! ${events_detected} events detected.`
              );
            else triggerToast(`Pipeline failed for match #${matchId}.`, "error");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 10000);
    },
    [triggerToast]
  );

  // ── Load All ─────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [matchesRes, teamsRes, tournsRes, eventsRes] = await Promise.all([
        API.get("/matches"),
        API.get("/teams"),
        API.get("/tournaments"),
        API.get("/events"),
      ]);

      const tMap = {};
      teamsRes.data.forEach((t) => { tMap[t.team_id] = t; });

      const tournMap = {};
      tournsRes.data.forEach((t) => { tournMap[t.tournament_id] = t; });

      const eCounts = {};
      eventsRes.data.forEach((ev) => {
        eCounts[ev.match_id] = (eCounts[ev.match_id] || 0) + 1;
      });

      setTeamsMap(tMap);
      setTournamentsMap(tournMap);
      setEventCountsMap(eCounts);

      const formatted = matchesRes.data.map((m) =>
        formatMatch(m, tMap, tournMap)
      );
      setMatches(formatted);

      formatted.forEach((m) => {
        if (m.pipelineStatus === "processing") startPolling(m.match_id);
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load data. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  useEffect(() => {
    loadAll();
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval);
    };
  }, [loadAll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTournament, selectedUploadStatus, selectedVideoStatus]);

  // ── CRUD ─────────────────────────────────────────────────────────────────



  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim() || !activeMatch) return;
    try {
      setUploadLoading(true);
      // Auto-strip leading/trailing double or single quotes (e.g., "F:\path\file.mp4" -> F:\path\file.mp4)
      const cleanUrl = videoUrl.trim().replace(/^["']|["']$/g, "").trim();

      const res = await API.put(`/matches/${activeMatch.match_id}`, {
        video_url: cleanUrl,
      });
      const upd = formatMatch(res.data, teamsMap, tournamentsMap);
      setMatches((prev) =>
        prev.map((m) => (m.match_id === activeMatch.match_id ? upd : m))
      );
      setIsUploadOpen(false);
      setVideoUrl("");
      triggerToast(`Video URL saved for match #${activeMatch.match_id}!`);
    } catch (err) {
      console.error("Error saving video URL:", err);
      const detail = err?.response?.data?.detail;
      const errorMsg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
          : "Failed to save video URL.";
      triggerToast(errorMsg, "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeMatch) return;
    try {
      setEditLoading(true);
      const res = await API.put(`/matches/${activeMatch.match_id}`, {
        home_score: Number(editHomeScore),
        away_score: Number(editAwayScore),
        status: editStatus,
      });
      const upd = formatMatch(res.data, teamsMap, tournamentsMap);
      setMatches((prev) =>
        prev.map((m) => (m.match_id === activeMatch.match_id ? upd : m))
      );
      setIsEditOpen(false);
      triggerToast(`Match #${activeMatch.match_id} updated.`);
    } catch (err) {
      triggerToast(err?.response?.data?.detail || "Failed to update match.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleAnalyze = async (match) => {
    if (!match.video_url) {
      triggerToast("Set a video URL first.", "error");
      return;
    }
    if (match.pipelineStatus === "processing") {
      triggerToast("Already processing.", "error");
      return;
    }
    try {
      setAnalyzeLoading((p) => ({ ...p, [match.match_id]: true }));
      await API.post(`/pipeline/${match.match_id}/process`);
      setMatches((prev) =>
        prev.map((m) =>
          m.match_id === match.match_id
            ? {
                ...m,
                pipelineStatus: "processing",
                status: "processing",
                review: "In Review",
                video: "Generating",
              }
            : m
        )
      );
      startPolling(match.match_id);
      triggerToast(`AI pipeline started for match #${match.match_id}.`);
    } catch (err) {
      triggerToast(
        err?.response?.data?.detail || "Failed to start pipeline.",
        "error"
      );
    } finally {
      setAnalyzeLoading((p) => ({ ...p, [match.match_id]: false }));
    }
  };

  // ── Modal Openers ────────────────────────────────────────────────────────

  const openEditModal = (m) => {
    setActiveMatch(m);
    setEditHomeScore(m.home_score ?? 0);
    setEditAwayScore(m.away_score ?? 0);
    setEditStatus(m.pipelineStatus || "pending");
    setIsEditOpen(true);
  };
  const openUploadModal = (m) => { setActiveMatch(m); setVideoUrl(m.video_url || ""); setIsUploadOpen(true); };
  const openPlayerModal = (m) => { setActiveMatch(m); setIsPlayerOpen(true); };

  // ── Derived ──────────────────────────────────────────────────────────────

  const tournamentOptions = useMemo(() => [
    { value: "All", label: "All Tournaments" },
    ...Object.values(tournamentsMap).map((t) => ({
      value: t.name,
      label: t.name,
    })),
  ], [tournamentsMap]);

  const filteredMatches = useMemo(
    () =>
      matches.filter((m) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            String(m.match_id).includes(q) ||
            m.tournament.toLowerCase().includes(q) ||
            m.teams.toLowerCase().includes(q)) &&
          (selectedTournament === "All" || m.tournament === selectedTournament) &&
          (selectedUploadStatus === "All" || m.upload === selectedUploadStatus) &&
          (selectedVideoStatus === "All" || m.video === selectedVideoStatus)
        );
      }),
    [matches, search, selectedTournament, selectedUploadStatus, selectedVideoStatus]
  );

  const stats = useMemo(() => ({
    total: matches.length,
    uploaded: matches.filter((m) => !!m.video_url).length,
    processing: matches.filter((m) => m.pipelineStatus === "processing").length,
    complete: matches.filter((m) => m.pipelineStatus === "complete").length,
  }), [matches]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageItems = filteredMatches.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  // ── Render ───────────────────────────────────────────────────────────────

  const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />
      <style>{`@keyframes vr-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.8)}}`}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position:"fixed",bottom:24,right:24,zIndex:2000,
          background:"rgba(15,23,42,.96)",
          border:`1px solid ${toast.type==="error"?"#ef4444":"#10b981"}`,
          color:"#fff",padding:"12px 22px",borderRadius:10,
          display:"flex",alignItems:"center",gap:8,
          fontSize:".88rem",fontWeight:600,
          boxShadow:"0 10px 25px rgba(0,0,0,.5)",
          backdropFilter:"blur(8px)",maxWidth:380,
          animation:"matchesSlideUp .2s ease-out",
        }}>
          <span style={{color:toast.type==="error"?"#ef4444":"#10b981"}}>
            {toast.type==="error"?"✗":"✓"}
          </span> {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="matches-header">
        <div className="matches-header-text">
          <h1>Match List</h1>
          <p>Manage matches, video uploads, AI analysis pipeline &amp; highlights</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={loadAll} className="matches-btn-outline" title="Refresh" style={{padding:"10px 14px"}}>↺</button>
          <button onClick={() => navigate("/matches/create")} className="matches-btn-orange" id="btn-create-match">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Create Match
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="matches-filter-bar">
        <div className="matches-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" placeholder="Search by tournament, team, or match ID..." value={search} onChange={(e) => setSearch(e.target.value)} id="search-match-list"/>
        </div>
        <CustomSelect value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} id="filter-match-tournament" className="matches-filter-select" options={tournamentOptions}/>
        <CustomSelect value={selectedUploadStatus} onChange={(e) => setSelectedUploadStatus(e.target.value)} id="filter-match-upload" className="matches-filter-select"
          options={[{value:"All",label:"All Upload Status"},{value:"Completed",label:"Completed"},{value:"Not Uploaded",label:"Not Uploaded"}]}/>
        <CustomSelect value={selectedVideoStatus} onChange={(e) => setSelectedVideoStatus(e.target.value)} id="filter-match-video" className="matches-filter-select"
          options={[{value:"All",label:"All Video Status"},{value:"Ready",label:"Ready"},{value:"Generating",label:"Generating"},{value:"Not Generated",label:"Not Generated"}]}/>
      </div>

      {/* Stats */}
      <div className="matches-stats-grid">
        {[["Total Matches",stats.total],["With Video",stats.uploaded],["Processing",stats.processing],["Analysis Complete",stats.complete]].map(([label,val])=>(
          <div key={label} className="matches-stat-card">
            <span className="matches-stat-label">{label}</span>
            <span className="matches-stat-value">{loading?"—":val}</span>
          </div>
        ))}
      </div>

      {/* Table panel */}
      <div className="matches-table-panel">
        {loading ? (
          <div style={{padding:"60px",textAlign:"center",color:"var(--text-muted)"}}>
            <div style={{fontSize:"2rem",marginBottom:12}}>⏳</div>
            <p style={{fontWeight:600}}>Loading matches from API...</p>
          </div>
        ) : error ? (
          <div style={{padding:"40px",textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:12}}>⚠️</div>
            <p style={{color:"#ef4444",fontWeight:600,marginBottom:12}}>{error}</p>
            <button onClick={loadAll} className="matches-btn-orange">Retry</button>
          </div>
        ) : (
          <>
            <div className="matches-table-wrap">
              <table className="matches-table">
                <thead>
                  <tr>
                    <th>Match ID</th><th>Tournament</th><th>Teams</th>
                    <th>Score</th><th>Pipeline</th><th>Video</th>
                    <th>Events</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length > 0 ? pageItems.map((match) => (
                    <tr key={match.match_id}>
                      <td>
                        <Link to={`/matches/${match.match_id}`} className="matches-link-id">
                          #{match.match_id}
                        </Link>
                      </td>
                      <td>{match.tournament}</td>
                      <td>
                        <Link to={`/matches/${match.match_id}`} className="matches-teams-cell-link">
                          <div className="matches-teams-cell">
                            {match.homeTeam} <span style={{color:"var(--text-muted)",fontWeight:"normal"}}>vs</span><br/>{match.awayTeam}
                          </div>
                        </Link>
                      </td>
                      <td style={{fontWeight:700,color:"#fff"}}>
                        {match.match_status === "upcoming"
                          ? <span style={{color:"var(--text-muted)",fontWeight:500}}>Not Yet</span>
                          : match.match_status === "live"
                          ? <span style={{color:"#f59e0b",fontWeight:600}}>Pending</span>
                          : `${match.home_score ?? 0} – ${match.away_score ?? 0}`}
                      </td>
                      <td><PipelineBadge status={match.pipelineStatus}/></td>
                      <td><VideoBadge status={match.video}/></td>
                      <td style={{textAlign:"center"}}>
                        <span style={{fontWeight:700,color:(eventCountsMap[match.match_id]||0)>0?"#60a5fa":"var(--text-muted)"}}>
                          {eventCountsMap[match.match_id]||0}
                        </span>
                      </td>
                      <td>
                        <div className="matches-action-cell">
                          {/* View */}
                          <button onClick={() => openPlayerModal(match)} className="matches-action-btn" title="View match" id={`btn-view-${match.match_id}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          {/* Upload */}
                          <button onClick={() => openUploadModal(match)} className="matches-action-btn" title="Set video URL" id={`btn-upload-${match.match_id}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </button>
                          {/* Analyze */}
                          <button
                            onClick={() => handleAnalyze(match)} className="matches-action-btn"
                            title="Analyze video (AI pipeline)" id={`btn-analyze-${match.match_id}`}
                            disabled={!match.video_url||match.pipelineStatus==="processing"||analyzeLoading[match.match_id]}
                            style={{opacity:(!match.video_url||match.pipelineStatus==="processing")?0.35:1,cursor:(!match.video_url||match.pipelineStatus==="processing")?"not-allowed":"pointer"}}
                          >
                            {analyzeLoading[match.match_id]
                              ? <span style={{fontSize:".75rem"}}>…</span>
                              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            }
                          </button>
                          {/* Edit */}
                          <button onClick={() => openEditModal(match)} className="matches-action-btn" title="Edit match" id={`btn-edit-${match.match_id}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {/* Dashboard */}
                          <button
                            onClick={() => navigate(`/matches/${match.match_id}/dashboard`)}
                            className="matches-action-btn" title="Open analytics dashboard" id={`btn-dashboard-${match.match_id}`}
                            style={{opacity:match.pipelineStatus==="complete"?1:0.35}}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" style={{textAlign:"center",padding:"40px",color:"var(--text-muted)"}}>
                        {matches.length===0
                          ? "No matches yet. Click 'Create Match' to get started."
                          : "No matches match your current filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredMatches.length > pageSize && (
              <div className="matches-pagination-bar">
                <span>Showing {(activePage-1)*pageSize+1} to {Math.min(activePage*pageSize,filteredMatches.length)} of {filteredMatches.length} matches</span>
                <div className="matches-pagination-controls">
                  <button type="button" className="matches-page-btn" disabled={activePage===1} onClick={()=>setCurrentPage((p)=>Math.max(1,p-1))}>Previous</button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map((p)=>(
                    <button key={p} type="button" className={`matches-page-btn${p===activePage?" active":""}`} onClick={()=>setCurrentPage(p)}>{p}</button>
                  ))}
                  <button type="button" className="matches-page-btn" disabled={activePage===totalPages} onClick={()=>setCurrentPage((p)=>Math.min(totalPages,p+1))}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>



      {/* ── Upload / Set Video URL Modal ── */}
      {isUploadOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <form onSubmit={handleUploadSubmit} className="matches-modal">
            <div className="matches-modal-header">
              <h2>Set Video URL — Match #{activeMatch.match_id}</h2>
              <button type="button" onClick={()=>{if(!uploadLoading){setIsUploadOpen(false);setVideoUrl("");}}} className="matches-modal-close"><CloseIcon/></button>
            </div>
            <div className="matches-modal-body">
              <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:8,padding:"10px 14px",fontSize:".82rem",color:"#fbbf24",marginBottom:16,lineHeight:1.5}}>
                ⚡ Provide the server-accessible path or URL to the video file. Then use the Analyze (⚡) button to start the AI pipeline.
              </div>
              <div className="matches-modal-field">
                <label htmlFor="m-video-url">Video URL / File Path *</label>
                <input id="m-video-url" type="text" placeholder="e.g. /media/uploads/match.mp4 or https://…" value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} required/>
              </div>
              <div className="matches-modal-field">
                <label>Match</label>
                <input type="text" value={activeMatch.teams} readOnly disabled/>
              </div>
            </div>
            <div className="matches-modal-footer">
              <button type="button" onClick={()=>{setIsUploadOpen(false);setVideoUrl("");}} className="matches-modal-btn-cancel" disabled={uploadLoading}>Cancel</button>
              <button type="submit" className="matches-modal-btn-submit" id="btn-upload-submit" disabled={uploadLoading||!videoUrl.trim()}>
                {uploadLoading?"Saving…":"Save Video URL"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Match Modal ── */}
      {isEditOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <form onSubmit={handleEditSubmit} className="matches-modal" id="form-edit-match">
            <div className="matches-modal-header">
              <h2>Edit Match #{activeMatch.match_id}</h2>
              <button type="button" onClick={()=>setIsEditOpen(false)} className="matches-modal-close"><CloseIcon/></button>
            </div>
            <div className="matches-modal-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="matches-modal-field">
                  <label htmlFor="m-edit-hs">Home Score</label>
                  <input id="m-edit-hs" type="number" min="0" value={editHomeScore} onChange={(e)=>setEditHomeScore(e.target.value)}/>
                </div>
                <div className="matches-modal-field">
                  <label htmlFor="m-edit-as">Away Score</label>
                  <input id="m-edit-as" type="number" min="0" value={editAwayScore} onChange={(e)=>setEditAwayScore(e.target.value)}/>
                </div>
              </div>
              <div className="matches-modal-field">
                <label htmlFor="m-edit-status">Pipeline Status</label>
                <CustomSelect id="m-edit-status" value={editStatus} onChange={(e)=>setEditStatus(e.target.value)} className="matches-modal-select"
                  options={[{value:"pending",label:"Pending"},{value:"processing",label:"Processing"},{value:"complete",label:"Complete"},{value:"failed",label:"Failed"}]}/>
              </div>
            </div>
            <div className="matches-modal-footer">
              <button type="button" onClick={()=>setIsEditOpen(false)} className="matches-modal-btn-cancel">Cancel</button>
              <button type="submit" className="matches-modal-btn-submit" id="btn-edit-submit" disabled={editLoading}>
                {editLoading?"Saving…":"Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── View / Player Modal ── */}
      {isPlayerOpen && activeMatch && (
        <div className="matches-modal-overlay">
          <div className="matches-modal" style={{maxWidth:520}}>
            <div className="matches-modal-header">
              <h2>Match #{activeMatch.match_id}</h2>
              <button type="button" onClick={()=>setIsPlayerOpen(false)} className="matches-modal-close"><CloseIcon/></button>
            </div>
            <div className="matches-modal-body">
              <div style={{background:"rgba(2,6,17,.5)",borderRadius:10,padding:20,border:"1px solid rgba(255,255,255,.07)",marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:".88rem"}}>
                  {[
                    ["Teams",activeMatch.teams],
                    ["Tournament",activeMatch.tournament],
                    ["Score",`${activeMatch.home_score??0} – ${activeMatch.away_score??0}`],
                    ["Status",(activeMatch.pipelineStatus||"pending").toUpperCase()],
                    ["Events",eventCountsMap[activeMatch.match_id]??0],
                    ["Video",activeMatch.video_url?"✓ Set":"Not set"],
                  ].map(([l,v])=>(
                    <div key={l}>
                      <span style={{color:"var(--text-muted)",display:"block",fontSize:".78rem",marginBottom:2}}>{l}</span>
                      <span style={{fontWeight:600,color:"#fff"}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {activeMatch.highlight_url && (
                <div style={{marginBottom:14}}>
                  <p style={{fontSize:".82rem",color:"var(--text-muted)",marginBottom:6}}>Highlight Reel</p>
                  <video controls src={activeMatch.highlight_url} style={{width:"100%",borderRadius:8,background:"#000"}}/>
                </div>
              )}
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="matches-btn-orange" style={{flex:1}}
                  onClick={()=>{setIsPlayerOpen(false);navigate(`/matches/${activeMatch.match_id}/dashboard`);}}>
                  📊 Open Dashboard
                </button>
                {!activeMatch.video_url && (
                  <button className="matches-btn-outline" style={{flex:1}}
                    onClick={()=>{setIsPlayerOpen(false);openUploadModal(activeMatch);}}>
                    📥 Set Video URL
                  </button>
                )}
                {activeMatch.video_url && activeMatch.pipelineStatus!=="processing" && (
                  <button className="matches-btn-blue" style={{flex:1}}
                    onClick={()=>{handleAnalyze(activeMatch);setIsPlayerOpen(false);}}>
                    ⚡ Analyze Video
                  </button>
                )}
              </div>
            </div>
            <div className="matches-modal-footer">
              <button type="button" onClick={()=>setIsPlayerOpen(false)} className="matches-modal-btn-cancel">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
