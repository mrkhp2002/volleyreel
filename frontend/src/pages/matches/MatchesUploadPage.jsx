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

  // ── Real matches, teams, tournaments from API ─────────────────────────────
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [selectedTournamentId, setSelectedTournamentId] = useState("all");
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

  // ── Multi-select state ───────────────────────────────────────────────────
  const [selectedEventIds, setSelectedEventIds] = useState(new Set());

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

  // Clear multi-select when match or filters change
  useEffect(() => {
    setSelectedEventIds(new Set());
  }, [selectedMatchId, filterType, filterStatus, searchPlayer]);

  // ── Load matches, teams, tournaments on mount ────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setMatchesLoading(true);
        const [matchesRes, teamsRes, tourneysRes] = await Promise.all([
          API.get("/matches/"),
          API.get("/teams/").catch(() => ({ data: [] })),
          API.get("/tournaments/").catch(() => ({ data: [] })),
        ]);

        const list = matchesRes.data || [];
        const tList = teamsRes.data || [];
        const tournList = tourneysRes.data || [];

        const tMap = {};
        tList.forEach((tm) => {
          tMap[tm.team_id] = tm.name;
        });

        setMatches(list);
        setTeamsMap(tMap);
        setTournaments(tournList);

        const params = new URLSearchParams(location.search);
        const mId = params.get("matchId");
        if (mId && list.some((m) => String(m.match_id) === String(mId))) {
          const matched = list.find((m) => String(m.match_id) === String(mId));
          setSelectedMatchId(String(mId));
          if (matched && matched.tournament_id) {
            setSelectedTournamentId(String(matched.tournament_id));
          }
        } else if (list.length > 0) {
          setSelectedMatchId(String(list[0].match_id));
          if (list[0].tournament_id) {
            setSelectedTournamentId(String(list[0].tournament_id));
          }
        }
      } catch (err) {
        console.error("Failed to load matches and tournament data:", err);
        triggerToast("Failed to load match and tournament details.");
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

  // ── Multi-select & Bulk actions ─────────────────────────────────────────
  const toggleSelectEvent = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const visibleIds = filteredEvents.map((e) => e.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedEventIds.has(id));
    if (allSelected) {
      setSelectedEventIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedEventIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedEventIds(new Set());
  };

  const handleBulkConfirm = () => {
    if (selectedEventIds.size === 0) return;
    setEvents((prev) =>
      prev.map((e) => (selectedEventIds.has(e.id) ? { ...e, status: "Confirmed" } : e))
    );
    triggerToast(`✓ Confirmed ${selectedEventIds.size} selected events!`);
    clearSelection();
  };

  const handleBulkReject = () => {
    if (selectedEventIds.size === 0) return;
    setEvents((prev) =>
      prev.map((e) => (selectedEventIds.has(e.id) ? { ...e, status: "Rejected" } : e))
    );
    triggerToast(`✖ Marked ${selectedEventIds.size} events as Rejected.`);
    clearSelection();
  };

  const handleBulkPending = () => {
    if (selectedEventIds.size === 0) return;
    setEvents((prev) =>
      prev.map((e) => (selectedEventIds.has(e.id) ? { ...e, status: "Pending" } : e))
    );
    triggerToast(`Reset ${selectedEventIds.size} events to Pending.`);
    clearSelection();
  };

  const handleBulkChangeType = (newType) => {
    if (selectedEventIds.size === 0 || !newType) return;
    setEvents((prev) =>
      prev.map((e) => (selectedEventIds.has(e.id) ? { ...e, type: newType } : e))
    );
    if (activeEvent && selectedEventIds.has(activeEvent.id)) {
      setActiveEvent((prev) => ({ ...prev, type: newType }));
    }
    triggerToast(`Updated ${selectedEventIds.size} events to type: ${newType}!`);
  };

  // ── Row actions ──────────────────────────────────────────────────────────
  const handleTypeChange = (id, newType) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, type: newType } : e))
    );
    if (activeEvent && activeEvent.id === id) {
      setActiveEvent((prev) => ({ ...prev, type: newType }));
    }
    triggerToast(`Event #${id} type set to ${newType}!`);
  };

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
    if (!selectedMatchId) {
      triggerToast("No match selected.", "error");
      return;
    }

    // 1. If coach selected events via checkboxes, compile those!
    // 2. Otherwise compile confirmed events
    // 3. If none confirmed or selected, compile all events for this match
    let eventIdsToCompile = [];
    if (selectedEventIds && selectedEventIds.size > 0) {
      eventIdsToCompile = Array.from(selectedEventIds);
    } else {
      const confirmed = events.filter((e) => e.status === "Confirmed").map((e) => e.id);
      eventIdsToCompile = confirmed.length > 0 ? confirmed : events.map((e) => e.id);
    }

    if (eventIdsToCompile.length === 0) {
      triggerToast("No events available to compile into highlights.", "error");
      return;
    }

    try {
      setCompiling(true);
      setCompileProgress(15);
      const iv = setInterval(() => {
        setCompileProgress((p) => {
          if (p >= 85) {
            clearInterval(iv);
            return 85;
          }
          return p + 15;
        });
      }, 300);

      const res = await API.post(`/pipeline/${selectedMatchId}/generate-highlight/`, {
        event_ids: eventIdsToCompile,
      });

      clearInterval(iv);
      setCompileProgress(100);
      triggerToast(`Highlight video compiled successfully with ${res.data.clips_generated || eventIdsToCompile.length} clips!`);
      setTimeout(() => {
        setCompiling(false);
        setCompileProgress(0);
        navigate("/matches/videos");
      }, 900);
    } catch (err) {
      setCompiling(false);
      setCompileProgress(0);
      const detail = err?.response?.data?.detail;
      const errorMsg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
          : "Highlight compilation failed.";
      triggerToast(errorMsg, "error");
    }
  };

  // ── Filtered events ──────────────────────────────────────────────────────
  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const matchSearch = !searchPlayer || e.player.toLowerCase().includes(searchPlayer.toLowerCase());
        const matchType = filterType === "All" || e.type.toLowerCase() === filterType.toLowerCase();
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

  // ── Filter matches by selected tournament ────────────────────────────────
  const filteredMatches = useMemo(() => {
    if (selectedTournamentId === "all" || !selectedTournamentId) {
      return matches;
    }
    return matches.filter((m) => String(m.tournament_id) === String(selectedTournamentId));
  }, [matches, selectedTournamentId]);

  // ── Tournament options for dropdown ───────────────────────────────────────
  const tournamentOptions = useMemo(
    () => [
      { value: "all", label: "All Tournaments" },
      ...tournaments.map((t) => ({
        value: String(t.tournament_id),
        label: `TN-${t.tournament_id} : ${t.name}`,
      })),
    ],
    [tournaments]
  );

  // ── Match options with real team names ────────────────────────────────────
  const matchOptions = useMemo(
    () =>
      filteredMatches.map((m) => {
        const homeName = teamsMap[m.home_team_id] || `Team #${m.home_team_id}`;
        const awayName = teamsMap[m.away_team_id] || `Team #${m.away_team_id}`;
        return {
          value: String(m.match_id),
          label: `#${m.match_id} — ${homeName} vs ${awayName}`,
        };
      }),
    [filteredMatches, teamsMap]
  );

  // ── Tournament Change Handler ─────────────────────────────────────────────
  const handleTournamentChange = (tournId) => {
    setSelectedTournamentId(tournId);
    const available =
      tournId === "all" || !tournId
        ? matches
        : matches.filter((m) => String(m.tournament_id) === String(tournId));
    if (available.length > 0) {
      setSelectedMatchId(String(available[0].match_id));
    } else {
      setSelectedMatchId("");
    }
    setSearchPlayer("");
    setFilterType("All");
    setFilterStatus("All");
    setEditingId(null);
  };

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

      {/* Tournament & Match Selector Card */}
      <div
        className="matches-form-card"
        style={{
          position: "relative",
          zIndex: 50,
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            alignItems: "end",
          }}
        >
          {/* Tournament Selector */}
          <div className="matches-field" style={{ position: "relative", zIndex: 60 }}>
            <label htmlFor="select-upload-tournament" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>🏆 Select Tournament</span>
              {matchesLoading && <span style={{ color: "#6366f1", fontSize: "0.75rem" }}>(loading…)</span>}
            </label>
            <CustomSelect
              id="select-upload-tournament"
              value={selectedTournamentId}
              onChange={(e) => handleTournamentChange(e.target.value)}
              options={tournamentOptions}
              placeholder="Filter by Tournament..."
            />
          </div>

          {/* Match Selector */}
          <div className="matches-field" style={{ position: "relative", zIndex: 60 }}>
            <label htmlFor="select-upload-match" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>🏐 Active Match for Review</span>
              {matchesLoading && <span style={{ color: "#6366f1", fontSize: "0.75rem" }}>(loading…)</span>}
            </label>
            <CustomSelect
              id="select-upload-match"
              value={selectedMatchId}
              onChange={(e) => {
                setSelectedMatchId(e.target.value);
                setSearchPlayer("");
                setFilterType("All");
                setFilterStatus("All");
                setEditingId(null);
              }}
              options={
                matchesLoading
                  ? [{ value: "", label: "Loading matches…" }]
                  : matchOptions.length > 0
                  ? matchOptions
                  : [{ value: "", label: "No matches found for this tournament" }]
              }
              placeholder="Choose a Match..."
            />
          </div>
        </div>

        {activeMatch && (
          <div
            style={{
              fontSize: "0.83rem",
              color: "var(--text-muted)",
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span>
              Match:{" "}
              <strong style={{ color: "#fff" }}>
                #{activeMatch.match_id} — {teamsMap[activeMatch.home_team_id] || `Team #${activeMatch.home_team_id}`} vs{" "}
                {teamsMap[activeMatch.away_team_id] || `Team #${activeMatch.away_team_id}`}
              </strong>
            </span>
            <span>
              Pipeline Status:{" "}
              <strong
                style={{
                  color:
                    pipelineStatus === "complete"
                      ? "#10b981"
                      : pipelineStatus === "processing"
                      ? "#3b82f6"
                      : pipelineStatus === "failed"
                      ? "#ef4444"
                      : "#94a3b8",
                }}
              >
                {pipelineStatus}
              </strong>
            </span>
            <span>
              Events Loaded: <strong style={{ color: "#f59e0b" }}>{events.length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Event Review Layout */}
      <div className="matches-review-layout" style={{ position: "relative", zIndex: 1 }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Event Type:</label>
                  <select
                    value={activeEvent.type}
                    onChange={(e) => handleTypeChange(activeEvent.id, e.target.value)}
                    className={`matches-badge ${
                      activeEvent.type.toLowerCase() === "kill" ? "matches-badge--red" : 
                      activeEvent.type.toLowerCase() === "ace" ? "matches-badge--green" : 
                      activeEvent.type.toLowerCase() === "block" ? "matches-badge--blue" : 
                      activeEvent.type.toLowerCase() === "spike" ? "matches-badge--orange" :
                      activeEvent.type.toLowerCase() === "dig" ? "matches-badge--purple" :
                      "matches-badge--yellow"
                    }`}
                    style={{
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      outline: "none",
                      background: "#0f172a",
                      color: "#ffffff"
                    }}
                  >
                    <option value="Kill" style={{ background: "#0f172a", color: "#f87171" }}>Kill</option>
                    <option value="Ace" style={{ background: "#0f172a", color: "#4ade80" }}>Ace</option>
                    <option value="Block" style={{ background: "#0f172a", color: "#60a5fa" }}>Block</option>
                    <option value="Spike" style={{ background: "#0f172a", color: "#fb923c" }}>Spike</option>
                    <option value="Dig" style={{ background: "#0f172a", color: "#c084fc" }}>Dig</option>
                    <option value="Serve" style={{ background: "#0f172a", color: "#facc15" }}>Serve</option>
                    <option value="Set" style={{ background: "#0f172a", color: "#38bdf8" }}>Set</option>
                    <option value="Reception" style={{ background: "#0f172a", color: "#e2e8f0" }}>Reception</option>
                    <option value="Assist" style={{ background: "#0f172a", color: "#94a3b8" }}>Assist</option>
                  </select>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff", marginLeft: 4 }}>
                    {activeEvent.player}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "#cbd5e1" }}>
                  <span>Time: <strong style={{ color: "#fff" }}>{activeEvent.time}</strong></span>
                  <span>Confidence: <strong style={{ color: "#fff" }}>{activeEvent.confidence}</strong></span>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>
              Tagged Play Events ({filteredEvents.length})
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={handleConfirmAll}
                className="matches-btn-view"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
                  transition: "all 0.2s ease"
                }}
                title="Confirm all events in this match"
              >
                <span>✓</span> Confirm All ({events.length})
              </button>
            </div>
          </div>

          {/* Collective / Bulk Actions Toolbar (Active when 1+ events are selected) */}
          {selectedEventIds.size > 0 && (
            <div
              className="matches-bulk-actions-bar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
                border: "1px solid rgba(59, 130, 246, 0.45)",
                borderRadius: "10px",
                padding: "8px 14px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                animation: "matchesSlideUp 0.2s ease-out"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#3b82f6",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "99px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  ⚡ {selectedEventIds.size} Selected
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Deselect all
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Collective Confirm */}
                <button
                  type="button"
                  onClick={handleBulkConfirm}
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.5)",
                    color: "#34d399",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease"
                  }}
                  title="Confirm all selected events"
                >
                  <span>✓</span> Confirm ({selectedEventIds.size})
                </button>

                {/* Collective Reject */}
                <button
                  type="button"
                  onClick={handleBulkReject}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.5)",
                    color: "#f87171",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease"
                  }}
                  title="Reject all selected events"
                >
                  <span>✖</span> Reject ({selectedEventIds.size})
                </button>

                {/* Collective Reset Pending */}
                <button
                  type="button"
                  onClick={handleBulkPending}
                  style={{
                    background: "rgba(234, 179, 8, 0.2)",
                    border: "1px solid rgba(234, 179, 8, 0.5)",
                    color: "#facc15",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease"
                  }}
                  title="Reset status of all selected events to Pending"
                >
                  <span>🔄</span> Pending
                </button>

                {/* Collective Change Type */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Type:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkChangeType(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="" disabled>Change type...</option>
                    <option value="Kill">Kill</option>
                    <option value="Ace">Ace</option>
                    <option value="Block">Block</option>
                    <option value="Spike">Spike</option>
                    <option value="Dig">Dig</option>
                    <option value="Serve">Serve</option>
                    <option value="Set">Set</option>
                    <option value="Reception">Reception</option>
                    <option value="Assist">Assist</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="matches-event-filters-row" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <input
                type="text" placeholder="Search player…"
                value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ width: 140, minWidth: 120 }}>
              <CustomSelect
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: "All", label: "All Types" },
                  { value: "Kill", label: "Kill" },
                  { value: "Ace", label: "Ace" },
                  { value: "Block", label: "Block" },
                  { value: "Spike", label: "Spike" },
                  { value: "Dig", label: "Dig" },
                  { value: "Serve", label: "Serve" },
                  { value: "Set", label: "Set" },
                  { value: "Reception", label: "Reception" },
                  { value: "Assist", label: "Assist" },
                ]}
                placeholder="Event Type..."
                className="matches-event-select-filter"
              />
            </div>
            <div style={{ width: 130, minWidth: 110 }}>
              <CustomSelect
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: "All", label: "All Status" },
                  { value: "Pending", label: "Pending" },
                  { value: "Confirmed", label: "Confirmed" },
                  { value: "Rejected", label: "Rejected" },
                ]}
                placeholder="Status..."
                className="matches-event-select-filter"
              />
            </div>
          </div>

          {/* Events Table */}
          <div className="matches-event-table-container">
            <table className="matches-event-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={filteredEvents.length > 0 && filteredEvents.every((e) => selectedEventIds.has(e.id))}
                      onChange={handleSelectAll}
                      title="Select / Deselect all visible events"
                      style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#3b82f6" }}
                    />
                  </th>
                  <th>Time</th><th>Type (Selectable)</th><th>Player</th><th>Conf.</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      Loading events…
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => {
                    const isEditing = editingId === evt.id;
                    const isActive = activeEvent && activeEvent.id === evt.id;
                    const isSelected = selectedEventIds.has(evt.id);
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => !isEditing && setActiveEvent(evt)}
                        className={`matches-event-row${isActive ? " active" : ""}`}
                        style={isSelected ? { background: "rgba(59, 130, 246, 0.12)", borderLeft: "3px solid #3b82f6" } : {}}
                      >
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelectEvent(evt.id, e)}
                            title="Select event for bulk action"
                            style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#3b82f6" }}
                          />
                        </td>
                        <td>{evt.time}</td>
                        <td>
                          {isEditing ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <select
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                style={{
                                  background: "#0f172a",
                                  color: "#ffffff",
                                  border: "1px solid #3b82f6",
                                  borderRadius: "6px",
                                  padding: "4px 8px",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  outline: "none"
                                }}
                              >
                                <option value="Kill">Kill</option>
                                <option value="Ace">Ace</option>
                                <option value="Block">Block</option>
                                <option value="Spike">Spike</option>
                                <option value="Dig">Dig</option>
                                <option value="Serve">Serve</option>
                                <option value="Set">Set</option>
                                <option value="Reception">Reception</option>
                                <option value="Assist">Assist</option>
                              </select>
                            </div>
                          ) : (
                            <div onClick={(e) => e.stopPropagation()}>
                              <select
                                value={evt.type}
                                onChange={(e) => handleTypeChange(evt.id, e.target.value)}
                                title="Coach: Click to change event type"
                                className={`matches-badge ${
                                  evt.type.toLowerCase() === "kill" ? "matches-badge--red" : 
                                  evt.type.toLowerCase() === "ace" ? "matches-badge--green" : 
                                  evt.type.toLowerCase() === "block" ? "matches-badge--blue" : 
                                  evt.type.toLowerCase() === "spike" ? "matches-badge--orange" :
                                  evt.type.toLowerCase() === "dig" ? "matches-badge--purple" :
                                  "matches-badge--yellow"
                                }`}
                                style={{
                                  cursor: "pointer",
                                  padding: "3px 6px",
                                  borderRadius: "6px",
                                  fontWeight: 700,
                                  fontSize: "0.78rem",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  outline: "none",
                                  background: "#0f172a",
                                  color: "#ffffff"
                                }}
                              >
                                <option value="Kill" style={{ background: "#0f172a", color: "#f87171" }}>Kill</option>
                                <option value="Ace" style={{ background: "#0f172a", color: "#4ade80" }}>Ace</option>
                                <option value="Block" style={{ background: "#0f172a", color: "#60a5fa" }}>Block</option>
                                <option value="Spike" style={{ background: "#0f172a", color: "#fb923c" }}>Spike</option>
                                <option value="Dig" style={{ background: "#0f172a", color: "#c084fc" }}>Dig</option>
                                <option value="Serve" style={{ background: "#0f172a", color: "#facc15" }}>Serve</option>
                                <option value="Set" style={{ background: "#0f172a", color: "#38bdf8" }}>Set</option>
                                <option value="Reception" style={{ background: "#0f172a", color: "#e2e8f0" }}>Reception</option>
                                <option value="Assist" style={{ background: "#0f172a", color: "#94a3b8" }}>Assist</option>
                              </select>
                            </div>
                          )}
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
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
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
