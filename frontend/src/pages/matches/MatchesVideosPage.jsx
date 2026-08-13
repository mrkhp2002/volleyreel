import { useState, useEffect, useMemo } from "react";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/matches.css";

const defaultMockVideos = [];

export default function MatchesVideosPage() {
  const [toast, setToast] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [shareLink, setShareLink] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterTourney, setFilterTourney] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Dynamic videos list
  const [videosList, setVideosList] = useState([]);
  
  // Progress states for generating videos
  const [generatingProgress, setGeneratingProgress] = useState({});

  // Load matches and initialize list
  useEffect(() => {
    const savedMatches = localStorage.getItem("volleyreel_matches");
    let matches = [];
    if (savedMatches) {
      try {
        const parsed = JSON.parse(savedMatches);
        if (Array.isArray(parsed)) {
          matches = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    // Parse matches from local storage that have generated highlights
    const userVideos = matches
      .filter((m) => m.video === "Ready" || m.video === "Generating")
      .map((m) => ({
        id: m.id,
        teams: m.teams,
        tournament: m.tournament,
        type: "Condensed Highlights",
        date: m.date,
        duration: m.duration || "5:20",
        status: m.video === "Ready" ? "ready" : "generating"
      }));

    setVideosList(userVideos);
  }, []);

  // Update generating progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        const next = { ...prev };
        let updated = false;

        videosList.forEach((video) => {
          if (video.status === "generating" || next[video.id] !== undefined) {
            const current = next[video.id] || 40;
            if (current < 100) {
              next[video.id] = current + 10;
              updated = true;
            } else if (current >= 100 && video.status === "generating") {
              // Mark complete in UI
              setVideosList((prevList) =>
                prevList.map((item) =>
                  item.id === video.id ? { ...item, status: "ready" } : item
                )
              );
              triggerToast(`Highlights for ${video.teams} generated successfully!`);
            }
          }
        });

        return updated ? next : prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [videosList]);

  // Seeker timing for mock player
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(30);

  useEffect(() => {
    let playInterval;
    if (isPlaying) {
      playInterval = setInterval(() => {
        setPlayProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 250);
    }
    return () => clearInterval(playInterval);
  }, [isPlaying]);

  // Toast trigger
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleDownload = (teams) => {
    triggerToast(`Starting download: ${teams.replaceAll(" ", "_")}_highlights.mp4`);
  };

  const handleShare = (teams, id) => {
    const mockUrl = `https://volleyreel.com/share/h_${id}`;
    setShareLink(mockUrl);
    triggerToast("Highlights share URL copied to clipboard!");
    navigator.clipboard.writeText(mockUrl).catch(() => {});
  };

  // Retry generation action handler
  const handleRetry = (id) => {
    // Set status to generating
    setVideosList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "generating" } : item))
    );
    setGeneratingProgress((prev) => ({ ...prev, [id]: 0 }));
    triggerToast("Retrying highlights compilation...");
  };

  // Filter videos list
  const filteredVideos = useMemo(() => {
    return videosList.filter((video) => {
      const matchSearch =
        !searchQuery ||
        video.teams.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.tournament.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === "All" || video.type === filterType;
      const matchTourney = filterTourney === "All" || video.tournament === filterTourney;
      const matchStatus = filterStatus === "All" || video.status === filterStatus;

      return matchSearch && matchType && matchTourney && matchStatus;
    });
  }, [videosList, searchQuery, filterType, filterTourney, filterStatus]);

  return (
    <div className="matches-page">
      {/* Decorative overlays */}
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast Popup Alert */}
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

      {/* Page Header */}
      <header className="matches-header" style={{ marginBottom: "20px" }}>
        <div className="matches-header-text">
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2rem", fontWeight: "700" }}>Generated Videos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            View, manage, and export generated match highlight videos
          </p>
        </div>
      </header>

      {/* Search & Filter Bar Section */}
      <div className="matches-videos-filter-bar">
        <div className="matches-videos-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search videos by match name or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-video-search"
          />
        </div>

        <CustomSelect 
          className="matches-videos-filter-select"
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          id="select-video-type"
          options={[
            { value: "All", label: "All Highlight Types" },
            { value: "Full Highlights", label: "Full Highlights" },
            { value: "Team Highlights", label: "Team Highlights" },
            { value: "Key Moments", label: "Key Moments" },
            { value: "Top Plays", label: "Top Plays" },
            { value: "Condensed Highlights", label: "Condensed Highlights" }
          ]}
        />

        <CustomSelect 
          className="matches-videos-filter-select"
          value={filterTourney} 
          onChange={(e) => setFilterTourney(e.target.value)}
          id="select-video-tournament"
          options={[
            { value: "All", label: "All Tournaments" },
            { value: "Spring Championship 2026", label: "Spring Championship 2026" },
            { value: "Regional Cup", label: "Regional Cup" }
          ]}
        />

        <CustomSelect 
          className="matches-videos-filter-select"
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          id="select-video-status"
          options={[
            { value: "All", label: "All Statuses" },
            { value: "ready", label: "Ready" },
            { value: "generating", label: "Generating" },
            { value: "failed", label: "Failed" }
          ]}
        />
      </div>

      {/* Redesigned 3-Column Videos Cards Grid */}
      <div className="matches-videos-grid">
        {filteredVideos.map((video) => (
          <div className="matches-video-card" key={video.id}>
            {/* Card Cover Video Thumbnail */}
            <div className="matches-video-card-thumbnail">
              <svg className="matches-video-card-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20" />
              </svg>
              <div className="matches-video-card-duration">{video.duration}</div>
              <div className={`matches-video-card-badge matches-video-card-badge--${video.status}`}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block"
                }} />
                <span style={{ marginLeft: "4px", textTransform: "capitalize" }}>{video.status}</span>
              </div>
            </div>

            {/* Card Content Information */}
            <div className="matches-video-card-info">
              <h3 className="matches-video-card-title">{video.teams}</h3>
              <span className="matches-video-card-tournament">{video.tournament}</span>
              <span className="matches-video-card-meta">
                {video.type} • {video.date}
              </span>
            </div>

            {/* Action Bottom Section mapping each status state */}
            {video.status === "ready" ? (
              <div className="matches-video-card-actions">
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideo(video);
                    setPlayProgress(20);
                  }}
                  className="matches-video-btn-preview"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(video.teams)}
                  className="matches-video-btn-action"
                  title="Download File"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(video.teams, video.id)}
                  className="matches-video-btn-action"
                  title="Copy share link"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            ) : video.status === "generating" ? (
              <div className="matches-video-card-generating-banner">
                <div className="matches-video-card-generating-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                  </svg>
                  <span>Generating video...</span>
                </div>
                <div className="matches-progress-bar-bg" style={{ height: "4px" }}>
                  <div className="matches-progress-bar-fill" style={{ width: `${generatingProgress[video.id] || 40}%` }}></div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div className="matches-video-card-failed-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Generation failed</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRetry(video.id)}
                  className="matches-video-card-retry-btn"
                >
                  Retry Generation
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredVideos.length === 0 && (
          <div style={{ gridColumn: "span 3", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No generated videos found matching the filters.
          </div>
        )}
      </div>

      {/* Video Library Summary Card (mockup screenshot match) */}
      <section className="matches-video-library-summary" style={{ marginTop: "24px" }}>
        <h2 className="matches-video-library-summary-title">Video Library Summary</h2>
        <div className="matches-video-library-summary-row">
          <div className="matches-video-library-summary-item">
            <span className="matches-video-library-summary-num matches-video-library-summary-num--total">
              31
            </span>
            <span className="matches-video-library-summary-label">Total Videos</span>
          </div>
          <div className="matches-video-library-summary-item">
            <span className="matches-video-library-summary-num matches-video-library-summary-num--ready">
              {videosList.filter((v) => v.status === "ready").length + 23}
            </span>
            <span className="matches-video-library-summary-label">Ready</span>
          </div>
          <div className="matches-video-library-summary-item">
            <span className="matches-video-library-summary-num matches-video-library-summary-num--generating">
              {videosList.filter((v) => v.status === "generating").length + 2}
            </span>
            <span className="matches-video-library-summary-label">Generating</span>
          </div>
          <div className="matches-video-library-summary-item">
            <span className="matches-video-library-summary-num matches-video-library-summary-num--failed">
              {videosList.filter((v) => v.status === "failed").length}
            </span>
            <span className="matches-video-library-summary-label">Failed</span>
          </div>
        </div>
      </section>

      {/* Modal: View Video Preview Seeker */}
      {activeVideo && (
        <div className="matches-modal-overlay">
          <div className="matches-modal" style={{ maxWidth: "640px" }}>
            <div className="matches-modal-header">
              <h2>Playback Preview: {activeVideo.teams} ({activeVideo.type})</h2>
              <button type="button" onClick={() => setActiveVideo(null)} className="matches-modal-close">
                ✖
              </button>
            </div>

            <div className="matches-modal-body">
              <div className="matches-video-player">
                <div className="matches-video-screen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "64px", height: "64px", color: "rgba(255,255,255,0.06)", marginBottom: "10px" }}>
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  <span style={{ fontWeight: 600 }}>{activeVideo.teams}</span>
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{activeVideo.tournament} - {activeVideo.date}</span>
                </div>
                
                <div className="matches-video-controls">
                  <div className="matches-video-track-bg" style={{ cursor: "pointer" }} onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setPlayProgress(Math.floor((clickX / rect.width) * 100));
                  }}>
                    <div className="matches-video-track-fill" style={{ width: `${playProgress}%` }}></div>
                  </div>
                  <div className="matches-video-btn-row">
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span 
                        style={{ cursor: "pointer", fontWeight: "bold" }} 
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play"}
                      </span>
                      <span>🔊</span>
                      <span className="matches-video-time">
                        {`0${Math.floor((playProgress/100) * 5)}:${Math.floor(((playProgress/100)*300)%60).toString().padStart(2, "0")}`} / {activeVideo.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="matches-modal-footer">
              <button 
                type="button" 
                onClick={() => {
                  setActiveVideo(null);
                  setIsPlaying(false);
                }} 
                className="matches-modal-btn-cancel"
              >
                Close Playback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
