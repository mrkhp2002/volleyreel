import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/matches.css";
import API from "../../services/apiClient";

// Convert a backend file path to a full URL the browser can load.
// e.g. "media/highlights/match_1/match_1_highlight_reel.mp4"
//   → "http://localhost:8000/media/highlights/match_1/match_1_highlight_reel.mp4"
function toVideoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\//, "");
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "http://localhost:8000/api";
  // Strip /api suffix to get the server root
  const serverRoot = base.replace(/\/api\/?$/, "");
  return `${serverRoot}/${clean}`;
}

// Get team label from teamsMap or fall back to "Team #N"
function teamLabel(teamId, teamsMap) {
  if (!teamId) return "Unknown";
  return teamsMap[teamId]?.name || `Team #${teamId}`;
}

export default function MatchesVideosPage() {
  const [toast, setToast] = useState("");

  // ── API data ─────────────────────────────────────────────────────────────
  const [allMatches, setAllMatches] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Video preview modal ───────────────────────────────────────────────────
  const [activeVideo, setActiveVideo] = useState(null); // full match object

  // ── Filters ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // ── Playback ─────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  // ── Simulated playhead when native video unavailable ─────────────────────
  useEffect(() => {
    let iv;
    if (isPlaying) {
      iv = setInterval(() => {
        setPlayProgress((p) => (p >= 100 ? 0 : p + 1));
      }, 250);
    }
    return () => clearInterval(iv);
  }, [isPlaying]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── Load matches + teams on mount ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [matchRes, teamRes] = await Promise.all([
          API.get("/matches/"),
          API.get("/teams/"),
        ]);

        const tMap = {};
        (teamRes.data || []).forEach((t) => { tMap[t.team_id] = t; });
        setTeamsMap(tMap);

        // Keep ALL matches — we'll show only those with highlight_url
        setAllMatches(matchRes.data || []);
      } catch (err) {
        setLoadError(
          err?.response?.data?.detail ||
            "Failed to load videos. Is the backend running?"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Matches that have generated highlights ────────────────────────────────
  const videoMatches = useMemo(
    () => allMatches.filter((m) => !!m.highlight_url),
    [allMatches]
  );

  // ── Build display card for each match ─────────────────────────────────────
  const videoCards = useMemo(
    () =>
      videoMatches.map((m) => ({
        matchId: m.match_id,
        title: `${teamLabel(m.home_team_id, teamsMap)} vs ${teamLabel(m.away_team_id, teamsMap)}`,
        homeTeam: teamLabel(m.home_team_id, teamsMap),
        awayTeam: teamLabel(m.away_team_id, teamsMap),
        status: "ready",
        highlight_url: m.highlight_url,
        videoSrc: toVideoUrl(m.highlight_url),
        createdAt: m.created_at
          ? new Date(m.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        pipelineStatus: m.status,
      })),
    [videoMatches, teamsMap]
  );

  // ── Filtered cards ────────────────────────────────────────────────────────
  const filteredCards = useMemo(() => {
    return videoCards.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.homeTeam.toLowerCase().includes(q) ||
        v.awayTeam.toLowerCase().includes(q) ||
        String(v.matchId).includes(q);
      const matchStatus = filterStatus === "All" || v.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [videoCards, searchQuery, filterStatus]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalVideos = videoCards.length;
  const readyVideos = videoCards.filter((v) => v.status === "ready").length;

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownload = (card) => {
    if (!card.videoSrc) { triggerToast("No video file available to download."); return; }
    const a = document.createElement("a");
    a.href = card.videoSrc;
    a.download = `match_${card.matchId}_highlights.mp4`;
    a.click();
    triggerToast(`Downloading match #${card.matchId} highlights…`);
  };

  const handleShare = (card) => {
    const url = card.videoSrc || window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    triggerToast("Video URL copied to clipboard!");
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
            background: "rgba(15,23,42,0.9)", border: "1px solid #10b981",
            color: "#fff", padding: "12px 24px", borderRadius: 10, zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,.5)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.88rem", fontWeight: 600, animation: "matchesSlideUp .2s ease-out",
          }}
        >
          <span style={{ color: "#10b981" }}>✓</span> {toast}
        </div>
      )}

      {/* Header */}
      <header className="matches-header" style={{ marginBottom: 20 }}>
        <div className="matches-header-text">
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2rem", fontWeight: 700 }}>
            Generated Videos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            View, manage, and export generated match highlight videos
          </p>
        </div>
      </header>

      {/* Loading / Error */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Loading highlight videos…</p>
        </div>
      )}

      {!loading && loadError && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: 12 }}>{loadError}</p>
          <button onClick={() => window.location.reload()} className="matches-btn-orange">Retry</button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {/* Search & Filter Bar */}
          <div className="matches-videos-filter-bar">
            <div className="matches-videos-search-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search by team name or match ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="input-video-search"
              />
            </div>
            <CustomSelect
              className="matches-videos-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="select-video-status"
              options={[
                { value: "All", label: "All Statuses" },
                { value: "ready", label: "Ready" },
              ]}
            />
          </div>

          {/* Empty state */}
          {filteredCards.length === 0 ? (
            <div
              style={{
                textAlign: "center", padding: "60px 20px",
                background: "rgba(2,6,17,0.6)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, margin: "0 auto", maxWidth: 500,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎬</div>
              <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: "1.1rem" }}>
                {searchQuery ? "No videos match your search." : "No highlight videos generated yet."}
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem", lineHeight: 1.6 }}>
                {searchQuery
                  ? "Try a different search term."
                  : "Confirm events in Upload & Event Review, then click \"Compile Highlights\" to generate your first video."}
              </p>
              {!searchQuery && (
                <Link to="/matches/upload" className="matches-btn-orange" style={{ textDecoration: "none", display: "inline-block" }}>
                  Go to Upload &amp; Event Review
                </Link>
              )}
            </div>
          ) : (
            <div className="matches-videos-grid">
              {filteredCards.map((card) => (
                <div className="matches-video-card" key={card.matchId}>
                  {/* Thumbnail */}
                  <div
                    className="matches-video-card-thumbnail"
                    onClick={() => { setActiveVideo(card); setIsPlaying(false); setPlayProgress(0); }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg className="matches-video-card-play-icon" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20" />
                    </svg>
                    <div className="matches-video-card-badge matches-video-card-badge--ready">
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      <span style={{ marginLeft: 4 }}>Ready</span>
                    </div>
                    <div className="matches-video-card-duration">Match #{card.matchId}</div>
                  </div>

                  {/* Info */}
                  <div className="matches-video-card-info">
                    <h3 className="matches-video-card-title">{card.title}</h3>
                    <span className="matches-video-card-tournament">Match #{card.matchId}</span>
                    <span className="matches-video-card-meta">Highlight Reel • {card.createdAt}</span>
                  </div>

                  {/* Actions */}
                  <div className="matches-video-card-actions">
                    <button
                      type="button"
                      onClick={() => { setActiveVideo(card); setIsPlaying(false); setPlayProgress(0); }}
                      className="matches-video-btn-preview"
                      id={`btn-preview-${card.matchId}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(card)}
                      className="matches-video-btn-action"
                      title="Download"
                      id={`btn-download-${card.matchId}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(card)}
                      className="matches-video-btn-action"
                      title="Copy share link"
                      id={`btn-share-${card.matchId}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Library Summary */}
          <section className="matches-video-library-summary" style={{ marginTop: 24 }}>
            <h2 className="matches-video-library-summary-title">Video Library Summary</h2>
            <div className="matches-video-library-summary-row">
              <div className="matches-video-library-summary-item">
                <span className="matches-video-library-summary-num matches-video-library-summary-num--total">
                  {totalVideos}
                </span>
                <span className="matches-video-library-summary-label">Total Videos</span>
              </div>
              <div className="matches-video-library-summary-item">
                <span className="matches-video-library-summary-num matches-video-library-summary-num--ready">
                  {readyVideos}
                </span>
                <span className="matches-video-library-summary-label">Ready</span>
              </div>
              <div className="matches-video-library-summary-item">
                <span className="matches-video-library-summary-num matches-video-library-summary-num--generating">
                  0
                </span>
                <span className="matches-video-library-summary-label">Generating</span>
              </div>
              <div className="matches-video-library-summary-item">
                <span className="matches-video-library-summary-num matches-video-library-summary-num--failed">
                  0
                </span>
                <span className="matches-video-library-summary-label">Failed</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Preview Modal — uses real HTML5 video */}
      {activeVideo && (
        <div className="matches-modal-overlay" onClick={() => { setActiveVideo(null); setIsPlaying(false); }}>
          <div
            className="matches-modal"
            style={{ maxWidth: 680 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="matches-modal-header">
              <h2>Preview — {activeVideo.title}</h2>
              <button
                type="button"
                onClick={() => { setActiveVideo(null); setIsPlaying(false); }}
                className="matches-modal-close"
              >
                ✖
              </button>
            </div>

            <div className="matches-modal-body">
              {activeVideo.videoSrc ? (
                /* Real video player */
                <video
                  controls
                  autoPlay
                  src={activeVideo.videoSrc}
                  style={{
                    width: "100%", borderRadius: 10,
                    background: "#000", maxHeight: 380,
                    display: "block",
                  }}
                  onError={() => triggerToast("Could not load video. Check that the backend is serving media files.")}
                />
              ) : (
                /* Fallback mock player */
                <div className="matches-video-player">
                  <div className="matches-video-screen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 64, height: 64, color: "rgba(255,255,255,0.06)", marginBottom: 10 }}>
                      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                    <span style={{ fontWeight: 600 }}>Video file not available</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Path: {activeVideo.highlight_url}</span>
                  </div>
                  <div className="matches-video-controls">
                    <div className="matches-video-track-bg" onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setPlayProgress(Math.floor(((e.clientX - r.left) / r.width) * 100));
                    }}>
                      <div className="matches-video-track-fill" style={{ width: `${playProgress}%` }} />
                    </div>
                    <div className="matches-video-btn-row">
                      <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="matches-modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => handleDownload(activeVideo)}
                className="matches-btn-view"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => { setActiveVideo(null); setIsPlaying(false); }}
                className="matches-modal-btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
