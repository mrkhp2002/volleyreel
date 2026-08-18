import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../services/apiClient";
import "../../styles/matches.css";

// ── Helpers ────────────────────────────────────────────────────────────────────

function toVideoUrl(path, matchId = null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\//, "");
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "http://localhost:8000/api";
  const serverRoot = base.replace(/\/api\/?$/, "");

  if (clean.startsWith("media/")) {
    return `${serverRoot}/${clean}`;
  }
  if (matchId) {
    return `${base}/matches/${matchId}/video`;
  }
  return `${serverRoot}/${clean}`;
}

function fmtTime(sec) {
  if (sec == null || isNaN(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const TYPE_COLOR = {
  ace:   { bg: "#10b98122", fg: "#10b981", border: "#10b98144" },
  kill:  { bg: "#f59e0b22", fg: "#f59e0b", border: "#f59e0b44" },
  block: { bg: "#3b82f622", fg: "#3b82f6", border: "#3b82f644" },
  spike: { bg: "#f59e0b22", fg: "#f59e0b", border: "#f59e0b44" },
  dig:   { bg: "#8b5cf622", fg: "#8b5cf6", border: "#8b5cf644" },
  serve: { bg: "#06b6d422", fg: "#06b6d4", border: "#06b6d444" },
  error: { bg: "#ef444422", fg: "#ef4444", border: "#ef444444" },
};
function typeColor(type) {
  return TYPE_COLOR[type?.toLowerCase()] || { bg: "#94a3b822", fg: "#94a3b8", border: "#94a3b844" };
}

function EventTypeBadge({ type }) {
  const c = typeColor(type);
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: ".74rem", fontWeight: 700, letterSpacing: ".05em",
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {type || "event"}
    </span>
  );
}

function Spinner({ size = 18 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `${Math.round(size / 6)}px solid rgba(255,255,255,.15)`,
      borderTopColor: "#f59e0b", borderRadius: "50%",
      animation: "vr-spin .7s linear infinite", flexShrink: 0,
    }} />
  );
}

const PIPELINE_STEPS = [
  { key: "splitting",    label: "Splitting video into chunks" },
  { key: "transcribing", label: "Transcribing audio (Whisper)" },
  { key: "detecting",   label: "Detecting events" },
  { key: "highlights",  label: "Generating highlight clips" },
  { key: "complete",    label: "Complete!" },
];
function pipelineStepIndex(status, elapsed) {
  if (status === "complete") return 4;
  if (status === "failed")   return -1;
  if (status !== "processing") return -1;
  // Approximate step from elapsed poll count (each poll = 10s)
  if (elapsed < 2) return 0;
  if (elapsed < 5) return 1;
  if (elapsed < 9) return 2;
  return 3;
}

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, style }) {
  return (
    <div className="matches-form-card" style={style}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <h2 className="matches-form-card-title" style={{ marginBottom: subtitle ? 2 : 0 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: ".82rem", color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function MatchDashboardPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const highlightVideoRef = useRef(null);
  const pollingRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Remote data ─────────────────────────────────────────────────────────────
  const [match, setMatch]   = useState(null);
  const [events, setEvents] = useState([]);
  const [teamsMap, setTeamsMap]               = useState({});
  const [playersMap, setPlayersMap]           = useState({});
  const [tournamentsMap, setTournamentsMap]   = useState({});

  // ── Page-level loading / error ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Upload state ────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile]         = useState(null);
  const [uploadProgress, setUploadProgress]     = useState(0);   // 0-100
  const [uploadStatus, setUploadStatus]         = useState("idle"); // idle | uploading | success | error
  const [uploadError, setUploadError]           = useState("");

  // ── Pipeline state ──────────────────────────────────────────────────────────
  const [pipelineStatus, setPipelineStatus]     = useState("pending");
  const [pipelineLoading, setPipelineLoading]   = useState(false);
  const [pipelineError, setPipelineError]       = useState("");
  const [pollCount, setPollCount]               = useState(0);
  const [eventsDetected, setEventsDetected]     = useState(0);

  // ── Event selection state ───────────────────────────────────────────────────
  const [selectedEventIds, setSelectedEventIds] = useState(new Set());

  // ── Highlight generation state ──────────────────────────────────────────────
  const [hlGenerating, setHlGenerating]         = useState(false);
  const [hlError, setHlError]                   = useState("");
  const [customHighlightUrl, setCustomHighlightUrl] = useState(null);

  // ── Video player state ──────────────────────────────────────────────────────
  const [activeEventId, setActiveEventId]       = useState(null);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const triggerToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4500);
  }, []);

  // ── Load initial data ────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [matchRes, eventsRes, teamsRes, tournsRes] = await Promise.all([
        API.get(`/matches/${matchId}`),
        API.get("/events"),
        API.get("/teams"),
        API.get("/tournaments"),
      ]);

      const tMap = {};
      teamsRes.data.forEach((t) => { tMap[t.team_id] = t; });

      const tournMap = {};
      tournsRes.data.forEach((t) => { tournMap[t.tournament_id] = t; });

      // Build players map from team rosters
      const pMap = {};
      Object.values(tMap).forEach((team) => {
        if (team.players) team.players.forEach((p) => { pMap[p.player_id] = p; });
      });

      setTeamsMap(tMap);
      setTournamentsMap(tournMap);
      setPlayersMap(pMap);
      setMatch(matchRes.data);
      setPipelineStatus(matchRes.data.status || "pending");

      // Filter events for this match only, sort by timestamp
      const matchEvents = eventsRes.data
        .filter((ev) => ev.match_id === Number(matchId))
        .sort((a, b) => (a.timestamp_sec ?? 0) - (b.timestamp_sec ?? 0));
      setEvents(matchEvents);
      setEventsDetected(matchEvents.length);

      // Auto-select all events when pipeline is complete
      if (matchRes.data.status === "complete") {
        setSelectedEventIds(new Set(matchEvents.map((e) => e.event_id)));
      }

      // Resume polling if still processing
      if (matchRes.data.status === "processing") {
        startPolling();
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load match data.");
    } finally {
      setLoading(false);
    }
  }, [matchId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadData]);

  // ── Pipeline polling ─────────────────────────────────────────────────────────

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/pipeline/${matchId}/status`);
        const { status, events_detected, highlight_url } = res.data;
        setPipelineStatus(status);
        if (events_detected != null) setEventsDetected(events_detected);
        setPollCount((c) => c + 1);

        if (status === "complete") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPipelineLoading(false);
          // Refresh full data to get events list
          const [matchRes, eventsRes] = await Promise.all([
            API.get(`/matches/${matchId}`),
            API.get("/events"),
          ]);
          setMatch(matchRes.data);
          const matchEvents = eventsRes.data
            .filter((ev) => ev.match_id === Number(matchId))
            .sort((a, b) => (a.timestamp_sec ?? 0) - (b.timestamp_sec ?? 0));
          setEvents(matchEvents);
          setEventsDetected(matchEvents.length);
          setSelectedEventIds(new Set(matchEvents.map((e) => e.event_id)));
          if (highlight_url) setCustomHighlightUrl(highlight_url);
          triggerToast(`Pipeline complete! ${matchEvents.length} events detected.`);
        } else if (status === "failed") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPipelineLoading(false);
          setPipelineError("Pipeline failed. Check server logs and try again.");
          triggerToast("Pipeline failed.", "error");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000);
  }, [matchId, triggerToast]);

  // ── 1. VIDEO UPLOAD ──────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadError("");
    setUploadProgress(0);
  };

  const handleUpload = () => {
    if (!selectedFile || !matchId) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadError("");

    // Use raw XMLHttpRequest so we get upload progress events.
    // Axios doesn't expose real upload progress for multipart/form-data reliably.
    const user = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "null"); }
      catch { return null; }
    })();
    const token = user?.access_token;

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const url = `${baseUrl}/matches/${matchId}/upload`;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const updatedMatch = JSON.parse(xhr.responseText);
          setMatch(updatedMatch);
          setPipelineStatus(updatedMatch.status || "pending");
          setUploadStatus("success");
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          triggerToast("Video uploaded successfully!");
        } catch {
          setUploadStatus("success");
          triggerToast("Video uploaded!");
        }
      } else {
        let msg = "Upload failed.";
        try { msg = JSON.parse(xhr.responseText)?.detail || msg; } catch {}
        setUploadStatus("error");
        setUploadError(msg);
        triggerToast(msg, "error");
      }
    });

    xhr.addEventListener("error", () => {
      setUploadStatus("error");
      setUploadError("Network error during upload.");
      triggerToast("Network error during upload.", "error");
    });

    xhr.open("POST", url);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  };

  // ── 2. PIPELINE TRIGGER ──────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!match?.video_url) return;
    try {
      setPipelineLoading(true);
      setPipelineError("");
      setPollCount(0);
      await API.post(`/pipeline/${matchId}/process`);
      setPipelineStatus("processing");
      setMatch((prev) => ({ ...prev, status: "processing" }));
      triggerToast("AI pipeline started! This may take a while.");
      startPolling();
    } catch (err) {
      setPipelineLoading(false);
      const msg = err?.response?.data?.detail || "Failed to start pipeline.";
      setPipelineError(msg);
      triggerToast(msg, "error");
    }
  };

  // ── 3. EVENT SELECTION ───────────────────────────────────────────────────────

  const toggleEvent = (eventId) => {
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };
  const selectAll   = () => setSelectedEventIds(new Set(events.map((e) => e.event_id)));
  const deselectAll = () => setSelectedEventIds(new Set());

  // ── 4. HIGHLIGHT GENERATION ──────────────────────────────────────────────────

  const handleGenerateHighlight = async () => {
    if (selectedEventIds.size === 0) {
      triggerToast("Select at least one event first.", "error");
      return;
    }
    try {
      setHlGenerating(true);
      setHlError("");
      const res = await API.post(`/pipeline/${matchId}/generate-highlight/`, {
        event_ids: [...selectedEventIds],
      });
      const hlUrl = res.data?.highlight_url;
      setCustomHighlightUrl(hlUrl);
      setMatch((prev) => ({ ...prev, highlight_url: hlUrl }));
      const clipCount = res.data?.clips_generated || res.data?.clips_used || selectedEventIds.size;
      triggerToast(`Highlight reel generated successfully with ${clipCount} clips!`);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to generate highlight reel.";
      setHlError(msg);
      triggerToast(msg, "error");
    } finally {
      setHlGenerating(false);
    }
  };

  // ── 5. VIDEO PLAYER seek ─────────────────────────────────────────────────────

  const seekTo = (sec) => {
    if (videoRef.current && sec != null) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
    }
  };
  const handleEventClick = (ev) => {
    setActiveEventId(ev.event_id);
    seekTo(ev.timestamp_sec);
    triggerToast(`Seeking to ${fmtTime(ev.timestamp_sec)} — ${ev.event_type}`);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const homeTeamName   = teamsMap[match?.home_team_id]?.name  || `Team #${match?.home_team_id}`;
  const awayTeamName   = teamsMap[match?.away_team_id]?.name  || `Team #${match?.away_team_id}`;
  const tournamentName = tournamentsMap[match?.tournament_id]?.name || `Tournament #${match?.tournament_id}`;
  const matchDate      = match?.created_at
    ? new Date(match.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const STATUS_COLOR = { complete: "#10b981", processing: "#3b82f6", failed: "#ef4444", pending: "#94a3b8" };
  const statusColor = STATUS_COLOR[pipelineStatus] || "#94a3b8";

  // Pipeline progress step
  const stepIdx = pipelineStepIndex(pipelineStatus, pollCount);

  // Player stats from events
  const playerStats = (() => {
    const stats = {};
    events.forEach((ev) => {
      const pid = ev.player_id;
      if (!pid) return;
      if (!stats[pid]) stats[pid] = { kills: 0, aces: 0, blocks: 0, total: 0 };
      const t = ev.event_type?.toLowerCase();
      if (t === "kill") stats[pid].kills++;
      else if (t === "ace") stats[pid].aces++;
      else if (t === "block") stats[pid].blocks++;
      stats[pid].total++;
    });
    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  })();

  // ── Render: full-page states ──────────────────────────────────────────────────

  if (loading) return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />
      <style>{`@keyframes vr-spin{to{transform:rotate(360deg)}} @keyframes vr-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)" }}>
        <Spinner size={40} /><p style={{ marginTop: 16, fontWeight: 600 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  if (error || !match) return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" /><div className="matches-glow matches-glow--2" />
      <Link to="/matches" className="matches-details-back-link">← Back to Matches</Link>
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</p>
        <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: 16 }}>{error || "Match not found."}</p>
        <button onClick={() => navigate("/matches")} className="matches-btn-orange">Back to Matches</button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      <style>{`
        @keyframes vr-spin { to { transform: rotate(360deg); } }
        @keyframes vr-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes vr-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes matchesSlideUp { from{transform:translateY(12px);opacity:0} to{transform:none;opacity:1} }
        .vr-upload-zone:hover { border-color: rgba(245,158,11,.5) !important; background: rgba(245,158,11,.04) !important; }
        .vr-event-row:hover { background: rgba(255,255,255,.04) !important; }
        .vr-step-done { color: #10b981 !important; }
        .vr-step-active { color: #f59e0b !important; font-weight: 700 !important; }
        .vr-step-pending { color: var(--text-muted) !important; }
      `}</style>

      {/* ── Toast ── */}
      {toast.msg && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 2000,
          background: "rgba(15,23,42,.96)",
          border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
          color: "#fff", padding: "12px 22px", borderRadius: 10,
          display: "flex", alignItems: "center", gap: 8,
          fontSize: ".88rem", fontWeight: 600,
          boxShadow: "0 10px 25px rgba(0,0,0,.5)", backdropFilter: "blur(8px)",
          maxWidth: 380, animation: "matchesSlideUp .2s ease-out",
        }}>
          <span style={{ color: toast.type === "error" ? "#ef4444" : "#10b981" }}>
            {toast.type === "error" ? "✗" : "✓"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Back nav ── */}
      <Link to="/matches" className="matches-details-back-link">← Back to Matches</Link>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,rgba(245,158,11,.12) 0%,rgba(59,130,246,.08) 100%)",
        border: "1px solid rgba(255,255,255,.06)", borderRadius: 16,
        padding: "28px 32px", marginBottom: 4, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: "100%", background: "radial-gradient(circle at right,rgba(245,158,11,.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Match Dashboard</span>
              <span style={{
                background: `${statusColor}22`, color: statusColor,
                border: `1px solid ${statusColor}44`, borderRadius: 20,
                padding: "2px 10px", fontSize: ".75rem", fontWeight: 700,
                letterSpacing: ".05em", textTransform: "uppercase",
              }}>
                {pipelineStatus === "processing"
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Spinner size={10} />&nbsp;Processing</span>
                  : pipelineStatus}
              </span>
            </div>
            <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: "1.9rem", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
              {homeTeamName} <span style={{ color: "rgba(255,255,255,.3)", fontSize: "1.4rem" }}>vs</span> {awayTeamName}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: ".92rem", margin: 0 }}>{tournamentName} · {matchDate}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 20, background: "rgba(2,6,17,.5)", borderRadius: 12, padding: "16px 24px", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "2.2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{match.home_score ?? 0}</span>
                <span style={{ fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 600 }}>{homeTeamName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,.2)", fontSize: "1.4rem" }}>–</div>
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "2.2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{match.away_score ?? 0}</span>
                <span style={{ fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 600 }}>{awayTeamName}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "rgba(2,6,17,.5)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, padding: "5px 12px", fontSize: ".8rem", color: "var(--text-muted)" }}>
                📍 Match TN{match.tournament_id}-M{match.match_id}
              </span>
              <span style={{ background: "rgba(2,6,17,.5)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, padding: "5px 12px", fontSize: ".8rem", color: "var(--text-muted)" }}>
                🎯 {eventsDetected} events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout: left wide + right sidebar ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.8fr) minmax(0,1fr)", gap: 20, alignItems: "start", marginTop: 20 }}>

        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── SECTION 1: Video Upload ── */}
          <SectionCard
            title="① Video Upload"
            subtitle={match.video_url ? `Current video: ${match.video_url}` : "Upload a match video to enable AI analysis."}
          >
            {/* Current video pill */}
            {match.video_url && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: ".82rem" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                <span style={{ color: "#10b981", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {match.video_url.split(/[\\/]/).pop()}
                </span>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>Video on server</span>
              </div>
            )}

            {/* Drop zone / file selector */}
            <div
              className="vr-upload-zone"
              style={{
                border: "2px dashed rgba(255,255,255,.12)", borderRadius: 12,
                padding: "28px 20px", textAlign: "center", cursor: "pointer",
                transition: "all .2s", background: "rgba(2,6,17,.3)", marginBottom: 14,
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) { setSelectedFile(file); setUploadStatus("idle"); setUploadError(""); setUploadProgress(0); }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.avi,.mkv,.webm"
                style={{ display: "none" }}
                onChange={handleFileChange}
                id="video-file-input"
              />
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎬</div>
              {selectedFile ? (
                <>
                  <p style={{ fontWeight: 700, color: "#fff", margin: "0 0 4px", fontSize: ".92rem" }}>{selectedFile.name}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: ".8rem", margin: 0 }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 600, color: "#e2e8f0", margin: "0 0 4px" }}>Click or drag &amp; drop a video file</p>
                  <p style={{ color: "var(--text-muted)", fontSize: ".8rem", margin: 0 }}>MP4, MOV, AVI, MKV, WebM supported</p>
                </>
              )}
            </div>

            {/* Progress bar */}
            {uploadStatus === "uploading" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginBottom: 6, color: "var(--text-muted)" }}>
                  <span>Uploading...</span>
                  <span style={{ fontWeight: 700, color: "#f59e0b" }}>{uploadProgress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 6,
                    background: "linear-gradient(90deg,#f59e0b,#fbbf24)",
                    width: `${uploadProgress}%`, transition: "width .2s",
                    boxShadow: "0 0 8px rgba(245,158,11,.5)",
                  }} />
                </div>
              </div>
            )}

            {/* Status messages */}
            {uploadStatus === "success" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: ".88rem", fontWeight: 600, marginBottom: 14, animation: "vr-fadein .3s ease-out" }}>
                <span>✓</span> Video uploaded successfully!
              </div>
            )}
            {uploadStatus === "error" && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, padding: "8px 14px", color: "#ef4444", fontSize: ".85rem", marginBottom: 14 }}>
                ✗ {uploadError}
              </div>
            )}

            {/* Upload button */}
            <button
              id="btn-upload-video"
              className="matches-btn-orange"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading"
                ? <><Spinner size={16} />&nbsp;Uploading {uploadProgress}%</>
                : <><span>↑</span>&nbsp;Upload Video</>}
            </button>
          </SectionCard>

          {/* ── SECTION 2: Pipeline / Analyze ── */}
          <SectionCard
            title="② AI Analysis Pipeline"
            subtitle="Run Whisper transcription and event detection on the uploaded video."
          >
            {/* Status bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(2,6,17,.5)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,.06)", padding: "12px 16px", marginBottom: 16,
            }}>
              <div>
                <span style={{ fontSize: ".78rem", color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Current Status</span>
                <span style={{
                  fontWeight: 700, fontSize: ".92rem", textTransform: "uppercase",
                  letterSpacing: ".05em", color: statusColor,
                }}>{pipelineStatus}</span>
              </div>
              {eventsDetected > 0 && (
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: ".78rem", color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Events Detected</span>
                  <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#60a5fa" }}>{eventsDetected}</span>
                </div>
              )}
            </div>

            {/* Progress steps (shown while processing) */}
            {pipelineStatus === "processing" && (
              <div style={{
                background: "rgba(59,130,246,.05)", border: "1px solid rgba(59,130,246,.15)",
                borderRadius: 10, padding: "16px 18px", marginBottom: 16,
                animation: "vr-fadein .3s ease-out",
              }}>
                <p style={{ fontSize: ".8rem", fontWeight: 700, color: "#60a5fa", margin: "0 0 12px", letterSpacing: ".05em", textTransform: "uppercase" }}>
                  Pipeline Progress
                </p>
                {PIPELINE_STEPS.map((step, i) => {
                  const done   = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < PIPELINE_STEPS.length - 1 ? 10 : 0 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? "rgba(16,185,129,.15)" : active ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.05)",
                        border: `1px solid ${done ? "#10b98144" : active ? "#f59e0b44" : "rgba(255,255,255,.1)"}`,
                        fontSize: ".75rem", fontWeight: 800,
                        color: done ? "#10b981" : active ? "#f59e0b" : "var(--text-muted)",
                      }}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={done ? "vr-step-done" : active ? "vr-step-active" : "vr-step-pending"} style={{ fontSize: ".88rem" }}>
                        {step.label}
                      </span>
                      {active && <Spinner size={14} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Complete state */}
            {pipelineStatus === "complete" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 16, animation: "vr-fadein .3s ease-out",
              }}>
                <span style={{ fontSize: "1.4rem" }}>🏆</span>
                <div>
                  <p style={{ fontWeight: 700, color: "#10b981", margin: 0, fontSize: ".92rem" }}>Analysis Complete!</p>
                  <p style={{ color: "var(--text-muted)", fontSize: ".8rem", margin: 0 }}>
                    {eventsDetected} events detected. Select events below to generate a highlight reel.
                  </p>
                </div>
              </div>
            )}

            {/* Failed state */}
            {pipelineStatus === "failed" && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, color: "#ef4444", margin: "0 0 4px" }}>Pipeline Failed</p>
                <p style={{ color: "var(--text-muted)", fontSize: ".82rem", margin: 0 }}>
                  {pipelineError || "An error occurred. Check server logs and retry."}
                </p>
              </div>
            )}

            {/* Analyze button */}
            <button
              id="btn-analyze-video"
              className="matches-btn-orange"
              style={{
                width: "100%", justifyContent: "center",
                opacity: (!match.video_url || pipelineStatus === "processing") ? 0.4 : 1,
                cursor: (!match.video_url || pipelineStatus === "processing") ? "not-allowed" : "pointer",
              }}
              onClick={handleAnalyze}
              disabled={!match.video_url || pipelineStatus === "processing" || pipelineLoading}
            >
              {pipelineLoading || pipelineStatus === "processing"
                ? <><Spinner size={16} />&nbsp;Analyzing… (polling every 10s)</>
                : pipelineStatus === "complete"
                ? <>⚡ Re-Analyze Video</>
                : <>⚡ Analyze Video</>}
            </button>

            {!match.video_url && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".8rem", marginTop: 8, marginBottom: 0 }}>
                ↑ Upload a video first to enable analysis.
              </p>
            )}
          </SectionCard>

          {/* ── SECTION 3: Events List ── */}
          {(pipelineStatus === "complete" || events.length > 0) && (
            <SectionCard
              title="③ Detected Events"
              subtitle={`${events.length} events found. Select the ones you want in your highlight reel.`}
            >
              {/* Select controls */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: ".88rem", color: "var(--text-muted)" }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>{selectedEventIds.size}</span> of {events.length} selected
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={selectAll} className="matches-btn-outline" style={{ padding: "6px 14px", fontSize: ".8rem" }} id="btn-select-all-events">
                    Select All
                  </button>
                  <button onClick={deselectAll} className="matches-btn-outline" style={{ padding: "6px 14px", fontSize: ".8rem" }} id="btn-deselect-all-events">
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Events list */}
              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                  <p>No events found. Run the AI pipeline to detect events.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                  {events.map((ev) => {
                    const selected = selectedEventIds.has(ev.event_id);
                    const active   = activeEventId === ev.event_id;
                    const c = typeColor(ev.event_type);
                    return (
                      <div
                        key={ev.event_id}
                        className="vr-event-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "36px 1fr auto",
                          gap: 10, alignItems: "center",
                          padding: "10px 12px", borderRadius: 10,
                          background: active
                            ? "rgba(245,158,11,.1)"
                            : selected
                            ? "rgba(59,130,246,.07)"
                            : "rgba(2,6,17,.4)",
                          border: `1px solid ${active ? "rgba(245,158,11,.3)" : selected ? "rgba(59,130,246,.2)" : "rgba(255,255,255,.05)"}`,
                          transition: "all .15s", cursor: "pointer",
                          animation: "vr-fadein .2s ease-out",
                        }}
                        onClick={() => toggleEvent(ev.event_id)}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${selected ? "#3b82f6" : "rgba(255,255,255,.2)"}`,
                          background: selected ? "#3b82f6" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .15s",
                        }}>
                          {selected && <span style={{ color: "#fff", fontSize: ".7rem", fontWeight: 800 }}>✓</span>}
                        </div>

                        {/* Event info */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <EventTypeBadge type={ev.event_type} />
                            <span style={{ fontFamily: "monospace", fontSize: ".82rem", fontWeight: 700, color: "#f59e0b" }}>
                              {fmtTime(ev.timestamp_sec)}
                            </span>
                            {ev.player_id && playersMap[ev.player_id] && (
                              <span style={{ fontSize: ".8rem", color: "#94a3b8", fontWeight: 600 }}>
                                👤 {playersMap[ev.player_id].name}
                              </span>
                            )}
                            {ev.confidence != null && (
                              <span style={{
                                fontSize: ".75rem", fontWeight: 700,
                                color: ev.confidence >= 0.8 ? "#10b981" : ev.confidence >= 0.5 ? "#f59e0b" : "#ef4444",
                                background: ev.confidence >= 0.8 ? "rgba(16,185,129,.1)" : ev.confidence >= 0.5 ? "rgba(245,158,11,.1)" : "rgba(239,68,68,.1)",
                                padding: "1px 6px", borderRadius: 4,
                              }}>
                                {Math.round(ev.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          {ev.transcript_snippet && (
                            <p style={{
                              margin: 0, fontSize: ".78rem", color: "var(--text-muted)",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontStyle: "italic",
                            }}>
                              "{ev.transcript_snippet}"
                            </p>
                          )}
                        </div>

                        {/* Seek button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEventClick(ev); }}
                          style={{
                            background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.2)",
                            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                            color: "#f59e0b", fontSize: ".78rem", fontWeight: 700,
                            flexShrink: 0, transition: "all .15s",
                          }}
                          id={`btn-seek-event-${ev.event_id}`}
                          title="Seek video to this event"
                        >
                          ▶
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {/* ── SECTION 4: Highlight Generation ── */}
          {(pipelineStatus === "complete" || events.length > 0) && (
            <SectionCard
              title="④ Generate Highlight Reel"
              subtitle="Concatenate selected events into a single MP4 highlight video."
            >
              {hlError && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: ".85rem", marginBottom: 14 }}>
                  ✗ {hlError}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  flex: 1, background: "rgba(2,6,17,.5)", border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Selected Events</span>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: selectedEventIds.size > 0 ? "#60a5fa" : "var(--text-muted)" }}>
                    {selectedEventIds.size} <span style={{ fontWeight: 400, fontSize: ".85rem", color: "var(--text-muted)" }}>/ {events.length}</span>
                  </span>
                </div>
                <button
                  id="btn-generate-highlight"
                  className="matches-btn-orange"
                  style={{
                    flex: 2, justifyContent: "center",
                    opacity: (selectedEventIds.size === 0 || hlGenerating) ? 0.4 : 1,
                    cursor: (selectedEventIds.size === 0 || hlGenerating) ? "not-allowed" : "pointer",
                  }}
                  onClick={handleGenerateHighlight}
                  disabled={selectedEventIds.size === 0 || hlGenerating}
                >
                  {hlGenerating
                    ? <><Spinner size={16} />&nbsp;Generating…</>
                    : <>🎬 Generate Highlight Reel ({selectedEventIds.size} events)</>}
                </button>
              </div>

              {/* Generated highlight player OR Not generated notice */}
              {(customHighlightUrl || match.highlight_url) ? (
                <div style={{ animation: "vr-fadein .4s ease-out", marginTop: "14px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                    background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: ".82rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>Highlight reel ready!</span>
                      <span style={{ color: "var(--text-muted)", fontSize: ".78rem" }}>
                        ({(customHighlightUrl || match.highlight_url).split(/[\\/]/).pop()})
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={toVideoUrl(customHighlightUrl || match.highlight_url, match.match_id)}
                        download={`match_${match.match_id}_highlights.mp4`}
                        style={{
                          textDecoration: "none",
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          color: "#34d399",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        ⬇ Download MP4
                      </a>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#000000",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    <video
                      ref={highlightVideoRef}
                      controls
                      preload="metadata"
                      src={toVideoUrl(customHighlightUrl || match.highlight_url, match.match_id)}
                      style={{ width: "100%", maxHeight: "380px", aspectRatio: "16/9", display: "block", objectFit: "contain", background: "#000" }}
                      onError={() => triggerToast("Highlight video could not be loaded.", "error")}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    marginTop: "12px",
                  }}
                >
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>🎬</span>
                  <p style={{ color: "#ffffff", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 4px" }}>
                    Highlight Video Not Generated Yet
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
                    Select the tagged events above and click <strong>Generate Highlight Reel</strong> to compile your custom highlight reel video.
                  </p>
                </div>
              )}
            </SectionCard>
          )}
        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Video Player ── */}
          <SectionCard title="⑤ Match Video" subtitle="Live video footage and playback" style={{ padding: "20px 20px 16px", overflow: "hidden" }}>
            {match.video_url ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#000000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <video
                    ref={videoRef}
                    controls
                    preload="metadata"
                    src={toVideoUrl(match.video_url, match.match_id)}
                    style={{
                      width: "100%",
                      maxHeight: "340px",
                      aspectRatio: "16/9",
                      display: "block",
                      objectFit: "contain",
                      background: "#000",
                    }}
                    onError={() => triggerToast("Match video could not be loaded from server.", "error")}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    flexWrap: "wrap",
                    gap: 6
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <strong style={{ color: "#10b981" }}>✓ Video Online</strong>
                    <span>• Click <strong style={{ color: "#f59e0b" }}>▶</strong> on any event to seek</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    {match.video_url.split(/[\\/]/).pop()}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "rgba(2,6,17,0.5)",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "2.8rem" }}>📹</span>
                <div>
                  <h4 style={{ color: "#ffffff", fontWeight: 700, margin: "0 0 6px", fontSize: "1.05rem" }}>
                    No Match Video Uploaded Yet
                  </h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", margin: "0 0 16px", maxWidth: "290px", lineHeight: 1.5 }}>
                    Upload full match video footage to play back rallies and detect play events automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const uploadInput = document.getElementById("video-file-input");
                    if (uploadInput) {
                      uploadInput.click();
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="matches-btn-orange"
                  style={{ padding: "9px 20px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                >
                  <span>↑</span> Upload Match Video
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── Match Details (Clean non-overlapping layout) ── */}
          <SectionCard title="Match Details">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ["Match ID", `#${match.match_id}`],
                ["Tournament", tournamentName],
                ["Home Team", homeTeamName],
                ["Away Team", awayTeamName],
                ["Score", `${match.home_score ?? 0} – ${match.away_score ?? 0}`],
                ["Date", matchDate],
                ["Status", pipelineStatus.toUpperCase()],
                ["Events Tagged", eventsDetected],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.86rem",
                      color: "#ffffff",
                      fontWeight: 700,
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={String(val)}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Player Stats (shown once pipeline complete) ── */}
          {playerStats.length > 0 && (
            <SectionCard title="Top Players">
              {playerStats.slice(0, 5).map(([pid, s]) => (
                <div key={pid} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: ".8rem", color: "#fff",
                  }}>
                    {(playersMap[pid]?.name || `P${pid}`).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: "#fff", margin: "0 0 2px", fontSize: ".88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {playersMap[pid]?.name || `Player #${pid}`}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["K", s.kills, "#f59e0b"], ["A", s.aces, "#10b981"], ["B", s.blocks, "#3b82f6"]].map(([l, v, c]) => (
                        v > 0 && (
                          <span key={l} style={{ fontSize: ".75rem", color: c, fontWeight: 700, background: `${c}18`, borderRadius: 4, padding: "1px 5px" }}>
                            {l}:{v}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: "#60a5fa", fontSize: "1rem" }}>{s.total}</span>
                </div>
              ))}
            </SectionCard>
          )}

          {/* ── Quick Actions ── */}
          <SectionCard title="Quick Actions">
            <div className="matches-quick-actions-panel">
              <button className="matches-btn-outline" onClick={() => navigate("/matches")}>← Match List</button>
              <button className="matches-btn-outline" onClick={() => navigate(`/matches/${matchId}`)}>📋 Match Details</button>
              {events.length > 0 && (
                <button className="matches-btn-blue" onClick={() => { selectAll(); triggerToast(`${events.length} events selected.`); }}>
                  ✓ Select All Events
                </button>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
