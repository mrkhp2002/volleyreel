import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function MatchesCreatePage() {
  const navigate = useNavigate();

  // Toast notifications
  const [toast, setToast] = useState("");

  // Section 1: Match Details
  const [matchId, setMatchId] = useState("VM-2026-013");
  const [tournamentName, setTournamentName] = useState("Spring Championship 2026");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [matchDate, setMatchDate] = useState("2026-03-15");
  const [matchTime, setMatchTime] = useState("18:30");
  const [venue, setVenue] = useState("");
  const [stage, setStage] = useState("Group Stage");
  const [notes, setNotes] = useState("");

  // Section 2 & 3: File Upload & Upload Details
  const [fileName, setFileName] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [duration, setDuration] = useState("");
  const [scoreA, setScoreA] = useState("3");
  const [scoreB, setScoreB] = useState("1");
  const [uploadNotes, setUploadNotes] = useState("");

  // Interactive flow states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  
  // AI event detection states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [detectedCount, setDetectedCount] = useState("--");
  const [confidenceScore, setConfidenceScore] = useState("--");
  const [reviewStatus, setReviewStatus] = useState("Not Started");

  // Video generation states
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoType, setVideoType] = useState("Condensed Highlights");
  const [confirmedOnly, setConfirmedOnly] = useState(true);

  // Trigger simulated file selection
  const handleSelectFile = () => {
    const defaultTitle = `${teamA || "Thunder Strikers"} vs ${teamB || "Ocean Waves"} - Match Video`;
    setFileName("match_feed.mp4");
    setVideoTitle(defaultTitle);
    setCameraAngle("Court-side High");
    setDuration("1:32:15");
    setScoreA("3");
    setScoreB("1");
    triggerToast("Match video file selected. Details pre-filled!");
  };

  // Trigger simulated file dragover
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleSelectFile();
  };

  // Simulated upload & AI execution sequence
  const startUploadAndAI = () => {
    if (!fileName) {
      triggerToast("Please choose a match video file to upload.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          setUploadCompleted(true);
          triggerToast("Upload completed! Running AI event detection...");
          startAIDetection();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const startAIDetection = () => {
    setIsAnalyzing(true);
    setDetectedCount("--");
    setConfidenceScore("--");
    setReviewStatus("Processing");

    let count = 0;
    const aiInterval = setInterval(() => {
      count += 1;
      if (count >= 10) {
        clearInterval(aiInterval);
        setIsAnalyzing(false);
        setAnalysisCompleted(true);
        setDetectedCount("48");
        setConfidenceScore("94%");
        setReviewStatus("Completed");
        triggerToast("AI analysis complete: 48 events detected!");
      }
    }, 200);
  };

  const startVideoGeneration = () => {
    setIsGeneratingVideo(true);
    setVideoProgress(0);

    const videoInterval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(videoInterval);
          setIsGeneratingVideo(false);
          setVideoGenerated(true);
          triggerToast("Highlights compiled successfully!");
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const saveMatch = (isDraft) => {
    let formattedDate = "TBD";
    if (matchDate) {
      formattedDate = new Date(matchDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }

    let uploadStatus = "Not Uploaded";
    if (uploadCompleted) {
      uploadStatus = "Completed";
    } else if (isUploading) {
      uploadStatus = "Processing";
    } else if (fileName) {
      uploadStatus = "Not Uploaded";
    }

    let reviewStatusVal = "Not Started";
    if (analysisCompleted) {
      reviewStatusVal = "In Review";
    } else if (isAnalyzing) {
      reviewStatusVal = "Processing";
    }

    let videoStatus = "Not Generated";
    if (videoGenerated) {
      videoStatus = "Ready";
    } else if (isGeneratingVideo) {
      videoStatus = "Generating";
    }

    const newMatch = {
      id: matchId.trim().toUpperCase() || `VM-${Date.now().toString().slice(-3)}`,
      tournament: tournamentName || "General Tournament",
      teams: `${teamA.trim() || "Thunder Strikers"} vs ${teamB.trim() || "Ocean Waves"}`,
      date: formattedDate,
      upload: uploadStatus,
      review: reviewStatusVal,
      video: videoStatus,
      venue: venue,
      stage: stage,
      notes: notes,
      fileName: fileName,
      videoTitle: videoTitle,
      cameraAngle: cameraAngle,
      duration: duration,
      scoreA: scoreA,
      scoreB: scoreB,
      uploadNotes: uploadNotes
    };

    const saved = localStorage.getItem("volleyreel_matches");
    const list = saved ? JSON.parse(saved) : initialMatchesCopy;

    const existsIndex = list.findIndex((m) => m.id === newMatch.id);
    let updatedList = [...list];
    if (existsIndex >= 0) {
      updatedList[existsIndex] = { ...updatedList[existsIndex], ...newMatch };
    } else {
      updatedList = [newMatch, ...updatedList];
    }

    localStorage.setItem("volleyreel_matches", JSON.stringify(updatedList));
  };

  const handleSaveMatchDraft = () => {
    triggerToast("Saving match as draft...");
    saveMatch(true);
    setTimeout(() => {
      navigate("/matches");
    }, 1000);
  };

  const handleSaveAndExit = () => {
    triggerToast("Saving match analytics...");
    saveMatch(false);
    setTimeout(() => {
      navigate("/matches");
    }, 1000);
  };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 4000);
  };

  return (
    <div className="matches-page">
      {/* Glow effects */}
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

      {/* Page Header */}
      <header className="analytics-header">
        <h1>Create Match</h1>
        <p>Set up a new volleyball match for analysis and video generation</p>
      </header>

      {/* Section 1: Match Details */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Details</h2>
        <div className="matches-form-grid">
          <div className="matches-field">
            <label htmlFor="form-match-id">Match ID</label>
            <input 
              id="form-match-id"
              type="text" 
              value={matchId} 
              onChange={(e) => setMatchId(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-tournament">Tournament Name</label>
            <input 
              id="form-tournament"
              type="text" 
              placeholder="e.g., Spring Championship 2026"
              value={tournamentName} 
              onChange={(e) => setTournamentName(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-teama">Team A</label>
            <input 
              id="form-teama"
              type="text" 
              placeholder="e.g., Thunder Strikers"
              value={teamA} 
              onChange={(e) => setTeamA(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-teamb">Team B</label>
            <input 
              id="form-teamb"
              type="text" 
              placeholder="e.g., Ocean Waves"
              value={teamB} 
              onChange={(e) => setTeamB(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-date">Match Date</label>
            <input 
              id="form-date"
              type="date" 
              value={matchDate} 
              onChange={(e) => setMatchDate(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-time">Match Time</label>
            <input 
              id="form-time"
              type="time" 
              value={matchTime} 
              onChange={(e) => setMatchTime(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-venue">Venue</label>
            <input 
              id="form-venue"
              type="text" 
              placeholder="e.g., Central Sports Arena"
              value={venue} 
              onChange={(e) => setVenue(e.target.value)} 
            />
          </div>
          <div className="matches-field">
            <label htmlFor="form-stage">Match Stage / Round</label>
            <input 
              id="form-stage"
              type="text" 
              placeholder="e.g., Finals"
              value={stage} 
              onChange={(e) => setStage(e.target.value)} 
            />
          </div>
          <div className="matches-field matches-form-grid--full">
            <label htmlFor="form-notes">Notes</label>
            <textarea 
              id="form-notes"
              rows="3" 
              placeholder="Additional match notes..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Match Upload */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Upload</h2>
        
        {isUploading ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Uploading {fileName}...</span>
            <div className="matches-progress-bar-bg" style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div className="matches-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "8px" }}>
              {uploadProgress}% Uploaded
            </span>
          </div>
        ) : (
          <div 
            className="matches-upload-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ padding: "40px 20px" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            
            {fileName ? (
              <>
                <strong>Selected file: {fileName}</strong>
                <p>Drag another file or click below to change</p>
              </>
            ) : (
              <>
                <strong>Drag and drop match video here</strong>
                <p>or</p>
              </>
            )}
            
            <button 
              type="button" 
              onClick={handleSelectFile}
              className="matches-btn-view"
              style={{ padding: "8px 18px", marginTop: "8px" }}
            >
              Choose File
            </button>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Supported formats: MP4, MOV, AVI (Max 2GB)
            </span>
          </div>
        )}
      </section>

      {/* Section 3: Upload Details */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Upload Details</h2>
        <div className="matches-form-grid">
          <div className="matches-field">
            <label htmlFor="up-title">Video Title</label>
            <input 
              id="up-title"
              type="text" 
              placeholder="e.g., Thunder Strikers vs Ocean Waves - Finals"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              disabled={!fileName}
            />
          </div>
          <div className="matches-field">
            <label htmlFor="up-camera">Camera Angle</label>
            <input 
              id="up-camera"
              type="text" 
              placeholder="e.g., High Court"
              value={cameraAngle}
              onChange={(e) => setCameraAngle(e.target.value)}
              disabled={!fileName}
            />
          </div>
          <div className="matches-field">
            <label htmlFor="up-duration">Duration</label>
            <input 
              id="up-duration"
              type="text" 
              placeholder="e.g., 1:45:30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={!fileName}
            />
          </div>
          <div className="matches-field">
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }} className="matches-field">
                <label htmlFor="up-scorea">Final Score - Team A</label>
                <input 
                  id="up-scorea"
                  type="number" 
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  disabled={!fileName}
                />
              </div>
              <div style={{ flex: 1 }} className="matches-field">
                <label htmlFor="up-scoreb">Final Score - Team B</label>
                <input 
                  id="up-scoreb"
                  type="number" 
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  disabled={!fileName}
                />
              </div>
            </div>
          </div>
          <div className="matches-field matches-form-grid--full">
            <label htmlFor="up-notes">Upload Notes</label>
            <textarea 
              id="up-notes"
              rows="3" 
              placeholder="Additional notes about the video upload..."
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              disabled={!fileName}
            />
          </div>
        </div>
      </section>

      {/* Section 4: Event Review Setup */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Event Review Setup</h2>
        
        {isAnalyzing ? (
          <div className="matches-alert-card matches-alert-card--info">
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/>
            </svg>
            <div>
              <strong>Running AI volleyball event detection...</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>Analyzing feed patterns to trace spikes, passes, serves, and court lines...</p>
            </div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong>Event detection will begin after upload</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>AI will analyze the video and detect volleyball events automatically</p>
            </div>
          </div>
        )}

        <div className="matches-setup-stats-row">
          <div className="matches-setup-stat-box">
            <span className="matches-setup-stat-val">{detectedCount}</span>
            <span className="matches-setup-stat-lbl">Detected Events</span>
          </div>
          <div className="matches-setup-stat-box">
            <span className="matches-setup-stat-val">{confidenceScore}</span>
            <span className="matches-setup-stat-lbl">Confidence Score</span>
          </div>
          <div className="matches-setup-stat-box">
            <span className={`matches-badge ${analysisCompleted ? "matches-badge--green" : isAnalyzing ? "matches-badge--blue" : "matches-badge--muted"}`} style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
              {reviewStatus}
            </span>
            <span className="matches-setup-stat-lbl" style={{ marginTop: "4px" }}>Review Status</span>
          </div>
        </div>

        <button 
          type="button" 
          disabled={!analysisCompleted}
          onClick={() => triggerToast("Navigating to Event Review editor...")}
          className="matches-btn-blue"
          id="btn-go-event-review"
        >
          Go to Event Review
        </button>
      </section>

      {/* Section 5: Generate Video */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Generate Video</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input 
            type="checkbox" 
            id="confirmed-events" 
            checked={confirmedOnly}
            onChange={(e) => setConfirmedOnly(e.target.checked)}
            disabled={!analysisCompleted}
          />
          <label htmlFor="confirmed-events" style={{ fontSize: "0.88rem", fontWeight: "600", cursor: "pointer" }}>
            Include confirmed events only
          </label>
        </div>

        <div className="matches-field" style={{ maxWidth: "300px" }}>
          <label htmlFor="video-type">Video Type</label>
          <input 
            id="video-type"
            type="text" 
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
            disabled={!analysisCompleted}
          />
        </div>

        {isGeneratingVideo ? (
          <div style={{ padding: "10px 0" }}>
            <span style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "0.85rem" }}>Generating highlights compilation...</span>
            <div className="matches-progress-bar-bg" style={{ maxWidth: "300px" }}>
              <div className="matches-progress-bar-fill" style={{ width: `${videoProgress}%`, background: "linear-gradient(90deg, #8b5cf6, #c084fc)" }}></div>
            </div>
          </div>
        ) : videoGenerated ? (
          <div className="matches-alert-card matches-alert-card--info" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)", color: "#34d399" }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <div>
              <strong>Video highlights compilation generated!</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>The highlights reel has been successfully compiled and is ready for playback.</p>
            </div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--gray">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong>Video generation not started</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>Upload and confirm events before generating video</p>
            </div>
          </div>
        )}

        <button 
          type="button" 
          disabled={!analysisCompleted || isGeneratingVideo || videoGenerated}
          onClick={startVideoGeneration}
          className="matches-btn-purple"
          id="btn-generate-video-action"
        >
          Generate Video
        </button>
      </section>

      {/* Page Form Actions Footer */}
      <footer className="matches-form-footer">
        <Link to="/matches" className="matches-modal-btn-cancel" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Cancel
        </Link>
        <div className="matches-form-footer-right">
          <button 
            type="button" 
            onClick={handleSaveMatchDraft}
            className="matches-modal-btn-cancel"
            id="btn-save-match-draft"
          >
            Save Match
          </button>
          
          {uploadCompleted ? (
            <button 
              type="button" 
              onClick={handleSaveAndExit}
              className="matches-btn-orange"
              id="btn-save-upload-complete"
            >
              Save & Complete
            </button>
          ) : (
            <button 
              type="button" 
              onClick={startUploadAndAI}
              className="matches-btn-orange"
              id="btn-save-and-upload"
            >
              Save & Upload
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
