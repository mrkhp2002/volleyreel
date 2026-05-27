import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import "../../styles/matches.css";

const initialMatchesCopy = [
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

const mockEvents = [
  { id: "e1", time: "00:01:14", type: "Serve", player: "#10 J. Smith", confidence: "96%", status: "Pending", ballCoords: { top: "45%", left: "48%" }, playerBox: { top: "35%", left: "44%", width: "50px", height: "90px", label: "#10 Smith" } },
  { id: "e2", time: "00:01:18", type: "Dig", player: "#04 T. Davis", confidence: "88%", status: "Pending", ballCoords: { top: "72%", left: "32%" }, playerBox: { top: "60%", left: "28%", width: "52px", height: "88px", label: "#04 Davis" } },
  { id: "e3", time: "00:01:21", type: "Set", player: "#07 K. Miller", confidence: "94%", status: "Pending", ballCoords: { top: "35%", left: "58%" }, playerBox: { top: "25%", left: "54%", width: "48px", height: "92px", label: "#07 Miller" } },
  { id: "e4", time: "00:01:23", type: "Spike", player: "#09 M. Jordan", confidence: "97%", status: "Pending", ballCoords: { top: "22%", left: "76%" }, playerBox: { top: "12%", left: "71%", width: "55px", height: "98px", label: "#09 Jordan" } },
  { id: "e5", time: "00:01:24", type: "Block", player: "#12 D. Howard", confidence: "91%", status: "Pending", ballCoords: { top: "24%", left: "78%" }, playerBox: { top: "14%", left: "74%", width: "54px", height: "98px", label: "#12 Howard" } },
  { id: "e6", time: "00:02:40", type: "Serve", player: "#02 A. Carter", confidence: "95%", status: "Pending", ballCoords: { top: "44%", left: "51%" }, playerBox: { top: "34%", left: "47%", width: "50px", height: "90px", label: "#02 Carter" } },
  { id: "e7", time: "00:02:44", type: "Dig", player: "#09 M. Jordan", confidence: "93%", status: "Pending", ballCoords: { top: "68%", left: "65%" }, playerBox: { top: "56%", left: "61%", width: "52px", height: "92px", label: "#09 Jordan" } },
  { id: "e8", time: "00:02:47", type: "Set", player: "#04 T. Davis", confidence: "90%", status: "Pending", ballCoords: { top: "34%", left: "38%" }, playerBox: { top: "24%", left: "34%", width: "48px", height: "88px", label: "#04 Davis" } },
  { id: "e9", time: "00:02:50", type: "Spike", player: "#10 J. Smith", confidence: "95%", status: "Pending", ballCoords: { top: "21%", left: "24%" }, playerBox: { top: "10%", left: "20%", width: "52px", height: "94px", label: "#10 Smith" } }
];

export default function MatchesUploadPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  // Load matches
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");

  // Events list & filters
  const [events, setEvents] = useState(mockEvents);
  const [activeEvent, setActiveEvent] = useState(mockEvents[0]);
  const [searchPlayer, setSearchPlayer] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [editPlayer, setEditPlayer] = useState("");

  // Upload/Processing Flow States
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // AI Pipeline States
  const [aiStage, setAiStage] = useState(0); // 0: Idle, 1: Calibration, 2: Players, 3: Ball, 4: Events, 5: Done
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(25); // Seeker position %
  const [playTime, setPlayTime] = useState("00:01:14");

  const location = useLocation();

  // Load data on mount and check query params
  useEffect(() => {
    const saved = localStorage.getItem("volleyreel_matches");
    let list = initialMatchesCopy;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setMatches(list);
    
    // Check if matchId query parameter exists
    const params = new URLSearchParams(location.search);
    const mId = params.get("matchId");
    
    if (mId && list.some(m => m.id === mId)) {
      setSelectedMatchId(mId);
    } else if (list.length > 0) {
      setSelectedMatchId(list[0].id);
    }
  }, [location]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  // Seeker map based on active event time
  useEffect(() => {
    if (activeEvent) {
      setPlayTime(activeEvent.time);
      // Map timestamps roughly to percentages
      if (activeEvent.id === "e1") setPlayProgress(20);
      else if (activeEvent.id === "e2") setPlayProgress(25);
      else if (activeEvent.id === "e3") setPlayProgress(30);
      else if (activeEvent.id === "e4") setPlayProgress(33);
      else if (activeEvent.id === "e5") setPlayProgress(35);
      else if (activeEvent.id === "e6") setPlayProgress(60);
      else if (activeEvent.id === "e7") setPlayProgress(65);
      else if (activeEvent.id === "e8") setPlayProgress(70);
      else if (activeEvent.id === "e9") setPlayProgress(75);
    }
  }, [activeEvent]);

  // Simulated Player Playhead
  useEffect(() => {
    let playInterval;
    if (isPlaying) {
      playInterval = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 0.5;
          // Approximate timestamp update
          const mins = Math.floor((next / 100) * 5);
          const secs = Math.floor(((next / 100) * 300) % 60);
          setPlayTime(`00:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
          return next;
        });
      }, 200);
    }
    return () => clearInterval(playInterval);
  }, [isPlaying]);

  // Toast trigger
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Select dragover
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setUploadFile("court_feed_main_cam.mp4");
    triggerToast("Match video dropped successfully!");
  };

  // Run upload + AI sequence
  const startIngestion = () => {
    if (!uploadFile) {
      triggerToast("Please choose a volleyball video feed file first.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    const upInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(upInterval);
          setIsUploading(false);
          setUploadCompleted(true);
          triggerToast("Video upload complete! Starting AI model detection...");
          startAIPipeline();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // AI stages animation pipeline
  const startAIPipeline = () => {
    setAiStage(1);
    setCalibrationProgress(0);

    const interval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          setAiStage((stage) => {
            if (stage >= 4) {
              clearInterval(interval);
              // Save completion back to matches
              const updatedMatches = matches.map((m) =>
                m.id === selectedMatchId ? { ...m, upload: "Completed", review: "In Review" } : m
              );
              setMatches(updatedMatches);
              localStorage.setItem("volleyreel_matches", JSON.stringify(updatedMatches));
              triggerToast("AI analysis complete! 9 events calibrated.");
              return 5; // pipeline finished
            }
            // Transition to next stage
            return stage + 1;
          });
          return 0; // reset phase percentage
        }
        return prev + 25; // 4 ticks per stage
      });
    }, 400);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = !searchPlayer || e.player.toLowerCase().includes(searchPlayer.toLowerCase());
      const matchType = filterType === "All" || e.type === filterType;
      const matchStatus = filterStatus === "All" || e.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [events, searchPlayer, filterType, filterStatus]);

  // Actions on rows
  const handleConfirmEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "Confirmed" } : e))
    );
    triggerToast("Event confirmed!");
  };

  const handleRejectEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "Rejected" } : e))
    );
    triggerToast("Event marked as rejected.");
  };

  const handleEditClick = (event) => {
    setEditingId(event.id);
    setEditType(event.type);
    setEditPlayer(event.player);
  };

  const handleSaveEdit = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, type: editType, player: editPlayer } : e))
    );
    setEditingId(null);
    triggerToast("Event details updated.");
  };

  const handleConfirmAll = () => {
    setEvents((prev) => prev.map((e) => ({ ...e, status: "Confirmed" })));
    triggerToast("All events successfully confirmed!");
  };

  const handleExportCSV = () => {
    const headers = "Event ID,Time,Type,Player,Confidence,Status\n";
    const rows = events
      .map((e) => `${e.id},${e.time},${e.type},${e.player},${e.confidence},${e.status}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedMatchId}_tagged_events.csv`;
    link.click();
    triggerToast("Exported tagged events CSV!");
  };

  // Compile video pipeline
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  const handleCompileHighlights = () => {
    setCompiling(true);
    setCompileProgress(0);

    const interval = setInterval(() => {
      setCompileProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCompiling(false);
          // Mark match ready
          const updatedMatches = matches.map((m) =>
            m.id === selectedMatchId ? { ...m, upload: "Completed", review: "Confirmed", video: "Ready" } : m
          );
          setMatches(updatedMatches);
          localStorage.setItem("volleyreel_matches", JSON.stringify(updatedMatches));
          
          triggerToast("Highlights compiled! Opening Generated Videos.");
          setTimeout(() => {
            navigate("/matches/videos");
          }, 800);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="matches-page">
      {/* Ambient glows */}
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast popup */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid #3b82f6",
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
          <span style={{ color: "#3b82f6" }}>✓</span> {toast}
        </div>
      )}

      {/* Header */}
      <header className="matches-header">
        <div className="matches-header-text">
          <h1>Upload & Event Review</h1>
          <p>Calibrate camera angles, ingest main court feeds, and verify tagged volleyball plays</p>
        </div>
      </header>

      {/* Match Selector */}
      <div className="matches-form-card" style={{ gap: "12px", padding: "16px 24px" }}>
        <div className="matches-field" style={{ maxWidth: "320px" }}>
          <label htmlFor="select-upload-match">Active Match for Review</label>
          <CustomSelect
            id="select-upload-match"
            value={selectedMatchId}
            onChange={(e) => {
              setSelectedMatchId(e.target.value);
              // reset uploader states
              setUploadFile(null);
              setIsUploading(false);
              setUploadCompleted(false);
              setAiStage(0);
            }}
            options={matches.map((m) => ({
              value: m.id,
              label: `${m.id} - ${m.teams} (${m.tournament})`
            }))}
          />
        </div>
      </div>

      {activeMatch && activeMatch.upload !== "Completed" && !uploadCompleted && aiStage < 5 ? (
        /* Video Ingestion Flow Panel */
        <section className="matches-form-card" style={{ padding: "40px" }}>
          <h2 className="matches-form-card-title">Video Feed Ingestion</h2>
          
          {isUploading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <span style={{ fontWeight: 600, display: "block", marginBottom: "12px" }}>Uploading {uploadFile}...</span>
              <div className="matches-progress-bar-bg" style={{ maxWidth: "450px", margin: "0 auto" }}>
                <div className="matches-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "10px" }}>
                {uploadProgress}% Ingested
              </span>
            </div>
          ) : aiStage > 0 && aiStage < 5 ? (
            /* AI Processing Status Phase Timeline */
            <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
              <h3 style={{ fontSize: "1rem", color: "#ffffff", marginBottom: "20px", textAlign: "center" }}>
                Running AI Volleyball Detection Pipeline...
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { stage: 1, label: "Calibrating Court Geometry Lines" },
                  { stage: 2, label: "Detecting Active Player IDs & Jersey Tags" },
                  { stage: 3, label: "Tracking Ball Velocity & High Trajectories" },
                  { stage: 4, label: "Segmenting Action Beats (Serves/Spikes/Sets)" }
                ].map((item) => (
                  <div key={item.stage} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: aiStage >= item.stage ? 1 : 0.4 }}>
                    <div 
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: aiStage > item.stage ? "#10b981" : aiStage === item.stage ? "#3b82f6" : "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        color: "#ffffff",
                        boxShadow: aiStage === item.stage ? "0 0 10px rgba(59,130,246,0.5)" : "none"
                      }}
                    >
                      {aiStage > item.stage ? "✓" : item.stage}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: "600" }}>{item.label}</span>
                      {aiStage === item.stage && (
                        <div className="matches-progress-bar-bg" style={{ marginTop: "6px", height: "6px" }}>
                          <div className="matches-progress-bar-fill" style={{ width: `${calibrationProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {aiStage > item.stage ? "Done" : aiStage === item.stage ? `${calibrationProgress}%` : "Waiting"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div 
              className="matches-upload-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ padding: "40px" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
              {uploadFile ? (
                <>
                  <strong style={{ color: "#ffffff" }}>Ready to ingest: {uploadFile}</strong>
                  <p>Click the button below to start AI court analysis</p>
                </>
              ) : (
                <>
                  <strong>Drag and drop high-speed main court recording</strong>
                  <p>or drag file here</p>
                </>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button 
                  type="button" 
                  onClick={() => setUploadFile("court_feed_main_cam.mp4")}
                  className="matches-btn-view"
                  style={{ padding: "8px 16px" }}
                >
                  Choose File
                </button>
                <button 
                  type="button" 
                  disabled={!uploadFile}
                  onClick={startIngestion}
                  className="matches-btn-orange"
                  style={{ padding: "8px 18px" }}
                >
                  Start AI Ingestion
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Event Review Layout (Player + Tag Table) */
        <div className="matches-review-layout">
          {/* Left Column: Player & Calibration Grid */}
          <div className="matches-video-review-panel">
            <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>
              Calibrated Court Timeline Seeker
            </h2>
            
            <div className="matches-calibration-screen">
              {/* Calibration Grid lines */}
              <div className={`matches-calibration-grid${isPlaying ? " matches-calibration-grid-active" : ""}`} />
              
              {/* Dynamic CV Overlays */}
              {activeEvent && (
                <>
                  {/* Ball tracking circle */}
                  <div 
                    className="matches-court-ball-tracker" 
                    style={{ 
                      top: activeEvent.ballCoords.top, 
                      left: activeEvent.ballCoords.left 
                    }} 
                  />
                  {/* Player detection bounding box */}
                  <div 
                    className="matches-court-player-box" 
                    style={{ 
                      top: activeEvent.playerBox.top, 
                      left: activeEvent.playerBox.left,
                      width: activeEvent.playerBox.width,
                      height: activeEvent.playerBox.height
                    }}
                  >
                    {activeEvent.playerBox.label}
                  </div>
                </>
              )}

              {/* Big playback visual */}
              <svg className="screen-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>

              <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", gap: "6px" }}>
                <span className="matches-badge matches-badge--blue" style={{ background: "rgba(37,99,235,0.85)" }}>
                  CAM-01 High
                </span>
                <span className="matches-badge matches-badge--green" style={{ background: "rgba(16,185,129,0.85)" }}>
                  Calibration Active
                </span>
              </div>
            </div>

            {/* Timeline Seeker Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="matches-video-track-bg" style={{ cursor: "pointer" }} onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                setPlayProgress(Math.floor((clickX / rect.width) * 100));
              }}>
                <div className="matches-video-track-fill" style={{ width: `${playProgress}%` }}></div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <button 
                    type="button" 
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ffffff", fontSize: "1.1rem" }}
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </button>
                  <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Seeker: {playTime} / 05:40</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>VolleyReel Vision Engine v2.1</span>
              </div>
            </div>
          </div>

          {/* Right Column: Events Tagging List */}
          <div className="matches-event-list-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="matches-form-card-title" style={{ border: "none", paddingBottom: 0, margin: 0 }}>
                Tagged Play Events ({filteredEvents.length})
              </h2>
              <button 
                type="button" 
                onClick={handleConfirmAll} 
                className="matches-btn-view"
                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
              >
                Confirm All
              </button>
            </div>

            {/* Filter Bar */}
            <div className="matches-event-filters-row">
              <input
                type="text"
                placeholder="Search player..."
                value={searchPlayer}
                onChange={(e) => setSearchPlayer(e.target.value)}
                style={{ flex: 1 }}
              />
              <CustomSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: "All", label: "All Types" },
                  { value: "Serve", label: "Serve" },
                  { value: "Dig", label: "Dig" },
                  { value: "Set", label: "Set" },
                  { value: "Spike", label: "Spike" },
                  { value: "Block", label: "Block" }
                ]}
                className="matches-event-select-filter"
              />
              <CustomSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: "All", label: "All Status" },
                  { value: "Pending", label: "Pending" },
                  { value: "Confirmed", label: "Confirmed" },
                  { value: "Rejected", label: "Rejected" }
                ]}
                className="matches-event-select-filter"
              />
            </div>

            {/* Event Table Wrap */}
            <div className="matches-event-table-container">
              <table className="matches-event-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Player</th>
                    <th>Conf.</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((evt) => {
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
                                  { value: "Serve", label: "Serve" },
                                  { value: "Dig", label: "Dig" },
                                  { value: "Set", label: "Set" },
                                  { value: "Spike", label: "Spike" },
                                  { value: "Block", label: "Block" }
                                ]}
                              />
                            </div>
                          ) : (
                            evt.type
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="matches-event-select-edit" 
                              value={editPlayer}
                              onChange={(e) => setEditPlayer(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            evt.player
                          )}
                        </td>
                        <td>{evt.confidence}</td>
                        <td>
                          <span 
                            className={`matches-badge ${
                              evt.status === "Confirmed" 
                                ? "matches-badge--green" 
                                : evt.status === "Rejected" 
                                ? "matches-badge--red" 
                                : "matches-badge--yellow"
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="matches-event-actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                type="button" 
                                onClick={() => handleSaveEdit(evt.id)} 
                                className="matches-event-btn matches-event-btn--confirm"
                                title="Save"
                              >
                                Save
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditingId(null)} 
                                className="matches-event-btn"
                                title="Cancel"
                              >
                                ✖
                              </button>
                            </div>
                          ) : (
                            <div className="matches-event-actions" onClick={(e) => e.stopPropagation()}>
                              <button 
                                type="button" 
                                onClick={() => handleConfirmEvent(evt.id)} 
                                className="matches-event-btn matches-event-btn--confirm"
                                title="Confirm"
                              >
                                ✓
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleRejectEvent(evt.id)} 
                                className="matches-event-btn matches-event-btn--reject"
                                title="Reject"
                              >
                                ✖
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleEditClick(evt)} 
                                className="matches-event-btn matches-event-btn--edit"
                                title="Edit"
                              >
                                ✎
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Event Footer Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
              <button 
                type="button" 
                onClick={handleExportCSV} 
                className="matches-modal-btn-cancel" 
                style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
              >
                Export CSV Taglist
              </button>
              
              {compiling ? (
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                    Compiling confirmed plays: {compileProgress}%
                  </span>
                  <div className="matches-progress-bar-bg" style={{ height: "8px" }}>
                    <div className="matches-progress-bar-fill" style={{ width: `${compileProgress}%`, background: "linear-gradient(90deg, #a78bfa, #8b5cf6)" }}></div>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={handleCompileHighlights} 
                  className="matches-btn-purple"
                  style={{ flex: 1, alignSelf: "stretch" }}
                >
                  Compile Highlights
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
