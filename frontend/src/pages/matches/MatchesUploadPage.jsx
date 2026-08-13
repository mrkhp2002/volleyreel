import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/matches.css";
import API from "../../services/apiClient";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtTimestamp(sec) {
  if (sec == null) return "--:--";
  const s = Number(sec);
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toVideoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\//, "");
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "http://localhost:8000/api";
  const serverRoot = base.replace(/\/api\/?$/, "");
  return `${serverRoot}/${clean}`;
}

export default function MatchesUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState("");

  const videoRef = useRef(null);

  // ── Real matches from API ────────────────────────────────────────────────
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState("");

  // ── Events from API ──────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [searchPlayer, setSearchPlayer] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // ── Inline edit state ────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [editPlayer, setEditPlayer] = useState("");

  // ── Compile highlights state ─────────────────────────────────────────────
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── Load matches on mount ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setMatchesLoading(true);
        const res = await API.get("/matches/");
        const list = res.data || [];
        setMatches(list);

        const params = new URLSearchParams(location.search);
        const mId = params.get("matchId");
        if (mId && list.some((m) => String(m.match_id) === String(mId))) {
          setSelectedMatchId(String(mId));
        } else if (list.length > 0) {
          setSelectedMatchId(String(list[0].match_id));
        }
      } catch (err) {
        console.error("Failed to load matches:", err);
        triggerToast("Failed to load matches.");
      } finally {
        setMatchesLoading(false);
      }
    };
    load();
  }, [location.search]);

  // ── Load events whenever selected match changes ──────────────────────────
  useEffect(() => {
    if (!selectedMatchId) { setEvents([]); return; }
    const load = async () => {
      try {
        setEventsLoading(true);
        const res = await API.get("/events/");
        const all = res.data || [];
        const matchEvents = all
          .filter((e) => String(e.match_id) === String(selectedMatchId))
          .map((e) => ({
            id: e.event_id,
            time: fmtTimestamp(e.timestamp_sec),
            type: capitalizeFirst(e.event_type),
            player:
              e.player_id != null ? `Player #${e.player_id}` : "Unknown",
            confidence:
              e.confidence != null
                ? `${Math.round(Number(e.confidence) * 100)}%`
                : "--",
            status: "Pending",
            clip_url: e.clip_url,
            transcript_snippet: e.transcript_snippet,
          }));
        setEvents(matchEvents);
        if (matchEvents.length > 0) setActiveEvent(matchEvents[0]);
        else setActiveEvent(null);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    load();
  }, [selectedMatchId]);

  // ── Active match object ──────────────────────────────────────────────────
  const activeMatch = useMemo(
    () => matches.find((m) => String(m.match_id) === String(selectedMatchId)) || null,
    [matches, selectedMatchId]
  );

  // ── Pipeline status for the selected match ───────────────────────────────
  const pipelineStatus = activeMatch?.status || "pending";

  const activeEventClipUrl = useMemo(() => {
    if (!activeEvent || !activeEvent.clip_url) return null;
    return toVideoUrl(activeEvent.clip_url);
  }, [activeEvent]);

  // ── Video Autoplay ───────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current && activeEventClipUrl) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [activeEventClipUrl]);

  // ── Row actions ──────────────────────────────────────────────────────────
  const handleConfirmEvent = (id) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "Confirmed" } : e));
    triggerToast("Event confirmed!");
  };
  const handleRejectEvent = (id) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "Rejected" } : e));
    triggerToast("Event marked as rejected.");
  };
  const handleEditClick = (evt) => { setEditingId(evt.id); setEditType(evt.type); setEditPlayer(evt.player); };
  const handleSaveEdit = (id) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, type: editType, player: editPlayer } : e));
    setEditingId(null);
    triggerToast("Event details updated.");
  };
  const handleConfirmAll = () => {
    setEvents((prev) => prev.map((e) => ({ ...e, status: "Confirmed" })));
    triggerToast("All events successfully confirmed!");
  };

  // ── Export CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = "Event ID,Time,Type,Player,Confidence,Status\n";
    const rows = events
      .map((e) => `${e.id},${e.time},${e.type},${e.player},${e.confidence},${e.status}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `match_${selectedMatchId}_events.csv`;
    link.click();
    triggerToast("Exported tagged events CSV!");
  };

  // ── Compile highlights ───────────────────────────────────────────────────
  const handleCompileHighlights = async () => {
    if (!selectedMatchId) { triggerToast("No match selected."); return; }
    const confirmedIds = events
      .filter((e) => e.status === "Confirmed")
      .map((e) => e.id);
    if (confirmedIds.length === 0) {
      triggerToast("Confirm at least one event before compiling.");
      return;
    }
    try {
      setCompiling(true);
      setCompileProgress(0);
      // Show fake progress while API call is in-flight
      const iv = setInterval(() => {
        setCompileProgress((p) => {
          if (p >= 80) { clearInterval(iv); return 80; }
          return p + 20;
        });
      }, 300);
      await API.post(`/pipeline/${selectedMatchId}/generate-highlight/`, {
        event_ids: confirmedIds,
      });
      clearInterval(iv);
      setCompileProgress(100);
      triggerToast("Highlights compiled successfully!");
      setTimeout(() => { setCompiling(false); setCompileProgress(0); navigate("/matches/videos"); }, 800);
    } catch (err) {
      setCompiling(false);
      triggerToast(err?.response?.data?.detail || "Highlight compilation failed.");
    }
  };

  // ── Filtered events ──────────────────────────────────────────────────────
  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const matchSearch = !searchPlayer || e.player.toLowerCase().includes(searchPlayer.toLowerCase());
        const matchType = filterType === "All" || e.type === filterType;
        const matchStatus = filterStatus === "All" || e.status === filterStatus;
        return matchSearch && matchType && matchStatus;
      }),
    [events, searchPlayer, filterType, filterStatus]
  );

  // ── Pipeline status message for events panel ─────────────────────────────
  const eventsEmptyMsg = (() => {
    if (eventsLoading) return null;
    if (pipelineStatus === "processing")
      return "AI pipeline is running. Check back in a few minutes.";
    if (pipelineStatus === "pending" || pipelineStatus === "not_started" || !pipelineStatus)
      return "Pipeline not started. Click the ⚡ lightning bolt in Match List to start analysis.";
    if (pipelineStatus === "failed")
      return "Pipeline failed. Re-trigger from Match List.";
    if (pipelineStatus === "complete" && events.length === 0)
      return "No events detected in this match.";
    return null;
  })();

  // ── Match options for dropdown ────────────────────────────────────────────
  const matchOptions = useMemo(
    () =>
      matches.map((m) => ({
        value: String(m.match_id),
        label: `#${m.match_id} — Team #${m.home_team_id} vs Team #${m.away_team_id}`,
      })),
    [matches]
  );

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24,
            background: "rgba(15,23,42,0.9)", border: "1px solid #3b82f6",
            color: "#fff", padding: "12px 24px", borderRadius: 10, zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,.5)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.88rem", fontWeight: 600, animation: "matchesSlideUp .2s ease-out",
          }}
        >
          <span style={{ color: "#3b82f6" }}>✓</span> {toast}
        </div>
      )}

      {/* Header */}
      <header className="matches-header">
        <div className="matches-header-text">
          <h1>Upload &amp; Event Review</h1>
          <p>Review AI-detected volleyball events and compile highlight videos</p>
        </div>
      </header>

      {/* Match Selector */}
      <div className="matches-form-card" style={{ gap: 12, padding: "16px 24px" }}>
        <div className="matches-field" style={{ maxWidth: 360 }}>
          <label htmlFor="select-upload-match">
            Active Match for Review
            {matchesLoading && <span style={{ marginLeft: 8, color: "#6366f1", fontSize: "0.75rem" }}>loading…</span>}
          </label>
          <CustomSelect
            id="select-upload-match"
            value={selectedMatchId}
            onChange={(e) => {
              setSelectedMatchId(e.target.value);
              setSearchPlayer(""); setFilterType("All"); setFilterStatus("All");
              setEditingId(null);
            }}
            options={
              matchesLoading
                ? [{ value: "", label: "Loading matches…" }]
                : matchOptions.length > 0
                ? matchOptions
                : [{ value: "", label: "No matches found" }]
            }
          />
        </div>
        {activeMatch && (
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            <span>Pipeline status: <strong style={{ color: pipelineStatus === "complete" ? "#10b981" : pipelineStatus === "processing" ? "#3b82f6" : pipelineStatus === "failed" ? "#ef4444" : "#94a3b8" }}>{pipelineStatus}</strong></span>
            <span>Events loaded: <strong style={{ color: "#fff" }}>{events.length}</strong></span>
          </div>
        )}
      </div>

      {/* Event Review Layout */}
      <div className="matches-review-layout">
        {/* Left Column: Real Video Preview */}
        <div className="matches-video-review-panel">
          <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>
            Event Video Clip
          </h2>

          <div className="matches-calibration-screen" style={{ display: "flex", flexDirection: "column", background: "rgba(2,6,17,0.8)" }}>
            {!activeEvent ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.5 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <p>Click an event to preview its clip</p>
              </div>
            ) : !activeEventClipUrl ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.8 }}>
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                  <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
                </svg>
                <p>No clip available for this event</p>
              </div>
            ) : (
              <div style={{ flex: 1, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video
                  ref={videoRef}
                  src={activeEventClipUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "contain", background: "#000" }}
                />
              </div>
            )}
          </div>

          {activeEvent && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(15,23,42,0.6)", padding: "12px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className={`matches-badge ${
                    activeEvent.type.toLowerCase() === "kill" ? "matches-badge--red" : 
                    activeEvent.type.toLowerCase() === "ace" ? "matches-badge--green" : 
                    activeEvent.type.toLowerCase() === "block" ? "matches-badge--blue" : 
                    "matches-badge--muted"
                  }`}>
                    {activeEvent.type}
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                    {activeEvent.player}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <span>Time: {activeEvent.time}</span>
                  <span>Confidence: {activeEvent.confidence}</span>
                </div>
              </div>
              {activeEvent.transcript_snippet && (
                <div style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                  "{activeEvent.transcript_snippet}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Events Tagging List */}
        <div className="matches-event-list-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>
              Tagged Play Events ({filteredEvents.length})
            </h2>
            <button type="button" onClick={handleConfirmAll} className="matches-btn-view" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
              Confirm All
            </button>
          </div>

          {/* Filter Bar */}
          <div className="matches-event-filters-row">
            <input
              type="text" placeholder="Search player…"
              value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
              style={{ flex: 1 }}
            />
            <CustomSelect
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: "All", label: "All Types" },
                { value: "Kill", label: "Kill" }, { value: "Ace", label: "Ace" },
                { value: "Block", label: "Block" }, { value: "Dig", label: "Dig" },
                { value: "Serve", label: "Serve" }, { value: "Spike", label: "Spike" },
                { value: "Set", label: "Set" },
              ]}
              className="matches-event-select-filter"
            />
            <CustomSelect
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "All", label: "All Status" },
                { value: "Pending", label: "Pending" },
                { value: "Confirmed", label: "Confirmed" },
                { value: "Rejected", label: "Rejected" },
              ]}
              className="matches-event-select-filter"
            />
          </div>

          {/* Events Table */}
          <div className="matches-event-table-container">
            <table className="matches-event-table">
              <thead>
                <tr>
                  <th>Time</th><th>Type</th><th>Player</th><th>Conf.</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      Loading events…
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => {
                    const isEditing = editingId === evt.id;
                    const isActive = activeEvent && activeEvent.id === evt.id;
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => !isEditing && setActiveEvent(evt)}
                        className={`matches-event-row${isActive ? " active" : ""}`}
                      >
                        <td>{evt.time}</td>
                        <td>
                          {isEditing ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <CustomSelect
                                className="matches-event-select-edit"
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                options={[
                                  { value: "Kill", label: "Kill" }, { value: "Ace", label: "Ace" },
                                  { value: "Block", label: "Block" }, { value: "Dig", label: "Dig" },
                                  { value: "Serve", label: "Serve" }, { value: "Spike", label: "Spike" },
                                  { value: "Set", label: "Set" },
                                ]}
                              />
                            </div>
                          ) : evt.type}
                        </td>
                        <td>
                          {isEditing ? (
                            <input type="text" className="matches-event-select-edit" value={editPlayer} onChange={(e) => setEditPlayer(e.target.value)} onClick={(e) => e.stopPropagation()} />
                          ) : evt.player}
                        </td>
                        <td>{evt.confidence}</td>
                        <td>
                          <span className={`matches-badge ${evt.status === "Confirmed" ? "matches-badge--green" : evt.status === "Rejected" ? "matches-badge--red" : "matches-badge--yellow"}`}>
                            {evt.status}
                          </span>
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="matches-event-actions" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => handleSaveEdit(evt.id)} className="matches-event-btn matches-event-btn--confirm" title="Save">Save</button>
                              <button type="button" onClick={() => setEditingId(null)} className="matches-event-btn" title="Cancel">✖</button>
                            </div>
                          ) : (
                            <div className="matches-event-actions" onClick={(e) => e.stopPropagation()}>
                              <button type="button" onClick={() => handleConfirmEvent(evt.id)} className="matches-event-btn matches-event-btn--confirm" title="Confirm">✓</button>
                              <button type="button" onClick={() => handleRejectEvent(evt.id)} className="matches-event-btn matches-event-btn--reject" title="Reject">✖</button>
                              <button type="button" onClick={() => handleEditClick(evt)} className="matches-event-btn matches-event-btn--edit" title="Edit">✎</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                      {eventsEmptyMsg || "No events match your filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer actions */}
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button type="button" onClick={handleExportCSV} className="matches-modal-btn-cancel" style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>
              Export CSV Taglist
            </button>
            {compiling ? (
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                  Compiling highlights: {compileProgress}%
                </span>
                <div className="matches-progress-bar-bg" style={{ height: 8 }}>
                  <div className="matches-progress-bar-fill" style={{ width: `${compileProgress}%`, background: "linear-gradient(90deg,#a78bfa,#8b5cf6)" }} />
                </div>
              </div>
            ) : (
              <button type="button" onClick={handleCompileHighlights} className="matches-btn-purple" style={{ flex: 1, alignSelf: "stretch" }}>
                Compile Highlights
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
