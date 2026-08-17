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
  const [tournamentsMap, setTournamentsMap] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Video preview modal ───────────────────────────────────────────────────
  const [activeVideo, setActiveVideo] = useState(null); // full match card object

  // ── Filters ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTournament, setFilterTournament] = useState("all");
  const [filterStatus, setFilterStatus] = useState("All");

  // ── Toast ─────────────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // ── Load matches, teams, tournaments on mount ────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const [matchRes, teamRes, tournRes] = await Promise.all([
          API.get("/matches/"),
          API.get("/teams/").catch(() => ({ data: [] })),
          API.get("/tournaments/").catch(() => ({ data: [] })),
        ]);

        const tMap = {};
        (teamRes.data || []).forEach((t) => {
          tMap[t.team_id] = t;
        });
        setTeamsMap(tMap);

        const tournsMap = {};
        const tournList = tournRes.data || [];
        tournList.forEach((tr) => {
          tournsMap[tr.tournament_id] = tr;
        });
        setTournamentsMap(tournsMap);
        setTournaments(tournList);

        // Keep all matches — we filter for matches that have highlight_url
        setAllMatches(matchRes.data || []);
      } catch (err) {
        console.error("Failed to load videos:", err);
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
      videoMatches.map((m) => {
        const tourn = tournamentsMap[m.tournament_id];
        return {
          matchId: m.match_id,
          tournamentId: m.tournament_id,
          tournamentName: tourn ? tourn.name : `Tournament #${m.tournament_id}`,
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
        };
      }),
    [videoMatches, teamsMap, tournamentsMap]
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
        v.tournamentName.toLowerCase().includes(q) ||
        String(v.matchId).includes(q);

      const matchTourn =
        filterTournament === "all" ||
        String(v.tournamentId) === String(filterTournament);

      const matchStatus =
        filterStatus === "All" || v.status.toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchTourn && matchStatus;
    });
  }, [videoCards, searchQuery, filterTournament, filterStatus]);

  // ── Tournament filter options ─────────────────────────────────────────────
  const tournamentOptions = useMemo(
    () => [
      { value: "all", label: "All Tournaments" },
      ...tournaments.map((t) => ({
        value: String(t.tournament_id),
        label: t.name,
      })),
    ],
    [tournaments]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalVideos = videoCards.length;
  const readyVideos = videoCards.filter((v) => v.status === "ready").length;

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownload = (card) => {
    if (!card.videoSrc) {
      triggerToast("No video file available to download.");
      return;
    }
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
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid #10b981",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 10,
            zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,.5)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.88rem",
            fontWeight: 600,
            animation: "matchesSlideUp .2s ease-out",
          }}
        >
          <span style={{ color: "#10b981" }}>✓</span> {toast}
        </div>
      )}

      {/* Header */}
      <header className="matches-header" style={{ marginBottom: 12 }}>
        <div className="matches-header-text">
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2rem", fontWeight: 700 }}>
            Generated Videos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            View, manage, and export compiled match highlight videos
          </p>
        </div>
        <Link
          to="/matches/upload"
          className="matches-btn-orange"
          style={{ textDecoration: "none" }}
        >
          <span>⚡</span> Review &amp; Compile Highlights
        </Link>
      </header>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Loading highlight videos…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 16,
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: "#f87171", fontWeight: 700, fontSize: "1.15rem", marginBottom: 8 }}>
            Failed to Load Videos
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 0 }}>
            {loadError}
          </p>
        </div>
      )}

      {/* Empty state when no highlight videos exist anywhere */}
      {!loading && !loadError && videoCards.length === 0 && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: "3.2rem", marginBottom: 16 }}>🎬</div>
          <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>
            No Highlight Videos Generated Yet
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.92rem",
              maxWidth: 520,
              margin: "0 auto 24px auto",
              lineHeight: 1.6,
            }}
          >
            Highlight reels are generated by combining detected match events. Go to{" "}
            <strong>Upload &amp; Event Review</strong> to tag, confirm events, and click{" "}
            <strong>Compile Highlights</strong> to generate your highlight videos.
          </p>
          <Link
            to="/matches/upload"
            className="matches-btn-orange"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <span>⚡</span> Review Events &amp; Compile Highlights
          </Link>
        </div>
      )}

      {/* Main content when highlights exist */}
      {!loading && !loadError && videoCards.length > 0 && (
        <>
          {/* Search & Filter Bar */}
          <div
            className="matches-videos-filter-bar"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div className="matches-videos-search-wrapper" style={{ flex: 1, minWidth: 200 }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search by team name or match ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="input-video-search"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ width: 180, minWidth: 150 }}>
              <CustomSelect
                className="matches-videos-filter-select"
                value={filterTournament}
                onChange={(e) => setFilterTournament(e.target.value)}
                id="select-video-tournament"
                options={tournamentOptions}
                placeholder="Filter Tournament..."
              />
            </div>
            <div style={{ width: 140, minWidth: 120 }}>
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
          </div>

          {/* Empty search filter result */}
          {filteredCards.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(2,6,17,0.6)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                margin: "0 auto",
                maxWidth: 500,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: "1.1rem" }}>
                No videos match your search
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: 0,
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                Try adjusting your search criteria or clear the filters.
              </p>
            </div>
          ) : (
            <div className="matches-videos-grid">
              {filteredCards.map((card) => (
                <div className="matches-video-card" key={card.matchId}>
                  {/* Thumbnail with real video preview */}
                  <div
                    className="matches-video-card-thumbnail"
                    onClick={() => setActiveVideo(card)}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      background: "#000",
                    }}
                  >
                    {card.videoSrc ? (
                      <video
                        src={card.videoSrc}
                        preload="metadata"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <svg className="matches-video-card-play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20" />
                      </svg>
                    </div>
                    <div className="matches-video-card-badge matches-video-card-badge--ready">
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "currentColor",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ marginLeft: 4 }}>Ready</span>
                    </div>
                    <div className="matches-video-card-duration">Match #{card.matchId}</div>
                  </div>

                  {/* Info */}
                  <div className="matches-video-card-info">
                    <h3 className="matches-video-card-title">{card.title}</h3>
                    <span className="matches-video-card-tournament">{card.tournamentName}</span>
                    <span className="matches-video-card-meta">
                      Highlight Reel • Match #{card.matchId} • {card.createdAt}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="matches-video-card-actions">
                    <button
                      type="button"
                      onClick={() => setActiveVideo(card)}
                      className="matches-video-btn-preview"
                      id={`btn-preview-${card.matchId}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{ width: 16, height: 16 }}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(card)}
                      className="matches-video-btn-action"
                      title="Download highlight reel"
                      id={`btn-download-${card.matchId}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 18, height: 18 }}
                      >
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
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 18, height: 18 }}
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
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
            </div>
          </section>
        </>
      )}

      {/* Preview Modal — Real HTML5 playable video */}
      {activeVideo && (
        <div
          className="matches-modal-overlay"
          onClick={() => setActiveVideo(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="matches-modal"
            style={{
              width: "100%",
              maxWidth: "1060px",
              maxHeight: "92vh",
              background: "linear-gradient(145deg, #0d1527 0%, #080d1a 100%)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.15)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="matches-modal-header"
              style={{
                padding: "18px 26px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>🎬</span>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Highlight Reel — {activeVideo.title}
                  </h2>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {activeVideo.tournamentName} • Match #{activeVideo.matchId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="matches-modal-close"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.2s ease",
                }}
              >
                ✖
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="matches-modal-body"
              style={{
                padding: "20px 26px",
                maxHeight: "72vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {activeVideo.videoSrc ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
                  }}
                >
                  <video
                    controls
                    autoPlay
                    src={activeVideo.videoSrc}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "560px",
                      aspectRatio: "16/9",
                      display: "block",
                      objectFit: "contain",
                      background: "#000",
                    }}
                    onError={() =>
                      triggerToast(
                        "Could not load video file. Ensure the backend media folder is available."
                      )
                    }
                  />
                </div>
              ) : (
                <div className="matches-video-player" style={{ minHeight: "360px" }}>
                  <div className="matches-video-screen">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ width: 64, height: 64, color: "rgba(255,255,255,0.08)", marginBottom: 10 }}
                    >
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                    <span style={{ fontWeight: 600 }}>Video file not available</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                      Path: {activeVideo.highlight_url}
                    </span>
                  </div>
                </div>
              )}

              {/* Match details metadata row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "12px 18px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  fontSize: "0.86rem",
                }}
              >
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    Tournament: <strong style={{ color: "#ffffff", marginLeft: 4 }}>{activeVideo.tournamentName}</strong>
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    Match: <strong style={{ color: "#ffffff", marginLeft: 4 }}>#{activeVideo.matchId}</strong>
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    Created: <strong style={{ color: "#ffffff", marginLeft: 4 }}>{activeVideo.createdAt}</strong>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    ● 1080p HD Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer with Beautiful Download Button */}
            <div
              className="matches-modal-footer"
              style={{
                padding: "16px 26px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(10, 16, 30, 0.6)",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(activeVideo)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#ffffff",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  id={`btn-modal-download-${activeVideo.matchId}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 18, height: 18 }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Video (MP4)</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShare(activeVideo)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 16, height: 16 }}
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Copy Share Link</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="matches-modal-btn-cancel"
                style={{
                  padding: "9px 20px",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
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
