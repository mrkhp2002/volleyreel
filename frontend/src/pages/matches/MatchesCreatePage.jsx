import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/matches.css";
import API from "../../services/apiClient";

const SEL = {
  width: "100%",
  background: "rgba(2,6,17,0.8)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  padding: "10px 14px",
  fontSize: "0.9rem",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
};
const SEL_OFF = { ...SEL, opacity: 0.4, cursor: "not-allowed" };

export default function MatchesCreatePage() {
  const navigate = useNavigate();

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  // ── Remote data ─────────────────────────────────────────────────────────────
  const [tournaments, setTournaments] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setDataLoading(true);
        setDataError("");
        const [tRes, tmRes] = await Promise.all([
          API.get("/tournaments/"),
          API.get("/teams/"),
        ]);
        setTournaments(tRes.data || []);
        setAllTeams(tmRes.data || []);
      } catch (err) {
        setDataError(
          err?.response?.data?.detail || "Failed to load tournaments / teams."
        );
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  // ── Match core fields ────────────────────────────────────────────────────────
  const [tournamentId, setTournamentId] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchStatus, setMatchStatus] = useState("upcoming");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [venue, setVenue] = useState("");
  const [stage, setStage] = useState("");
  const [notes, setNotes] = useState("");

  // ── Upload / AI flow state ────────────────────────────────────────────────
  const [fileName, setFileName] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [duration, setDuration] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [detectedCount, setDetectedCount] = useState("--");
  const [confidenceScore, setConfidenceScore] = useState("--");
  const [reviewStatus, setReviewStatus] = useState("Not Started");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoType, setVideoType] = useState("Condensed Highlights");
  const [confirmedOnly, setConfirmedOnly] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const tournamentTeams = useMemo(
    () =>
      tournamentId
        ? allTeams.filter(
            (t) => String(t.tournament_id) === String(tournamentId)
          )
        : allTeams,
    [allTeams, tournamentId]
  );
  const awayTeamOptions = useMemo(
    () =>
      tournamentTeams.filter(
        (t) => String(t.team_id) !== String(homeTeamId)
      ),
    [tournamentTeams, homeTeamId]
  );

  const handleTournamentChange = (e) => {
    setTournamentId(e.target.value);
    setHomeTeamId("");
    setAwayTeamId("");
  };
  const handleHomeTeamChange = (e) => {
    setHomeTeamId(e.target.value);
    if (e.target.value && e.target.value === awayTeamId) setAwayTeamId("");
  };

  // ── File selection simulation ─────────────────────────────────────────────
  const handleSelectFile = () => {
    const h =
      allTeams.find((t) => String(t.team_id) === String(homeTeamId))?.name ||
      "Home";
    const a =
      allTeams.find((t) => String(t.team_id) === String(awayTeamId))?.name ||
      "Away";
    setFileName("match_feed.mp4");
    setVideoTitle(`${h} vs ${a} - Match Video`);
    setCameraAngle("Court-side High");
    setDuration("1:32:15");
    triggerToast("Match video file selected. Details pre-filled!");
  };

  // ── API submit ────────────────────────────────────────────────────────────
  const handleApiSubmit = async () => {
    if (!tournamentId) {
      triggerToast("Please select a tournament.", "error");
      return;
    }
    if (!homeTeamId) {
      triggerToast("Please select a home team.", "error");
      return;
    }
    if (!awayTeamId) {
      triggerToast("Please select an away team.", "error");
      return;
    }
    if (String(homeTeamId) === String(awayTeamId)) {
      triggerToast("Home and away teams must be different.", "error");
      return;
    }
    if (
      matchStatus === "completed" &&
      (homeScore === "" || awayScore === "")
    ) {
      triggerToast("Scores are required for completed matches.", "error");
      return;
    }
    try {
      setSubmitLoading(true);
      await API.post("/matches/", {
        tournament_id: Number(tournamentId),
        home_team_id: Number(homeTeamId),
        away_team_id: Number(awayTeamId),
        match_status: matchStatus,
        status: "pending",
        home_score: matchStatus === "completed" ? Number(homeScore) : null,
        away_score: matchStatus === "completed" ? Number(awayScore) : null,
      });
      triggerToast("Match created successfully!");
      setTimeout(() => navigate("/matches"), 1200);
    } catch (err) {
      triggerToast(
        err?.response?.data?.detail || "Failed to create match.",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />
      <style>{`@keyframes vr-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Toast */}
      {toast.msg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(15,23,42,0.96)",
            border: `1px solid ${
              toast.type === "error" ? "#ef4444" : "#10b981"
            }`,
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 10,
            zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,.5)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.88rem",
            fontWeight: 600,
            animation: "matchesSlideUp .2s ease-out",
            maxWidth: 380,
          }}
        >
          <span
            style={{
              color: toast.type === "error" ? "#ef4444" : "#10b981",
            }}
          >
            {toast.type === "error" ? "✗" : "✓"}
          </span>{" "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="analytics-header">
        <h1>Create Match</h1>
        <p>Set up a new volleyball match for analysis and video generation</p>
      </header>

      {/* Loading banner */}
      {dataLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            marginBottom: 16,
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10,
            color: "#a5b4fc",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          <svg
            style={{
              animation: "vr-spin 1s linear infinite",
              flexShrink: 0,
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="30"
              strokeDashoffset="10"
            />
          </svg>
          Loading tournaments &amp; teams…
        </div>
      )}

      {/* Error banner */}
      {dataError && !dataLoading && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: 16,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: "0.88rem",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span>⚠️</span> {dataError}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginLeft: "auto",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              color: "#fca5a5",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Section 1: Match Details ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Details</h2>
        <div className="matches-form-grid">

          {/* Match Status */}
          <div className="matches-field">
            <label htmlFor="form-match-status">Match Status *</label>
            <select
              id="form-match-status"
              value={matchStatus}
              onChange={(e) => setMatchStatus(e.target.value)}
              style={SEL}
            >
              <option value="upcoming">Upcoming — match has not happened yet</option>
              <option value="live">Live — match is currently in progress</option>
              <option value="completed">Completed — match has finished</option>
            </select>
          </div>

          {/* Tournament dropdown */}
          <div className="matches-field">
            <label htmlFor="form-tournament">
              Tournament *
              {dataLoading && (
                <span
                  style={{
                    marginLeft: 8,
                    color: "#6366f1",
                    fontSize: "0.75rem",
                  }}
                >
                  loading…
                </span>
              )}
            </label>
            <select
              id="form-tournament"
              value={tournamentId}
              onChange={handleTournamentChange}
              disabled={dataLoading}
              style={dataLoading ? SEL_OFF : SEL}
            >
              <option value="">— Select Tournament —</option>
              {tournaments.map((t) => (
                <option
                  key={t.tournament_id}
                  value={String(t.tournament_id)}
                >
                  {t.name}
                </option>
              ))}
            </select>
            {!dataLoading && tournaments.length === 0 && !dataError && (
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#f59e0b",
                  marginTop: 4,
                  display: "block",
                }}
              >
                No tournaments found. Create one first.
              </span>
            )}
          </div>

          {/* Home Team dropdown */}
          <div className="matches-field">
            <label htmlFor="form-home-team">Home Team *</label>
            <select
              id="form-home-team"
              value={homeTeamId}
              onChange={handleHomeTeamChange}
              disabled={dataLoading || !tournamentId}
              style={dataLoading || !tournamentId ? SEL_OFF : SEL}
            >
              <option value="">
                {!tournamentId
                  ? "Select a tournament first"
                  : "— Select Home Team —"}
              </option>
              {tournamentTeams.map((t) => (
                <option key={t.team_id} value={String(t.team_id)}>
                  {t.name}
                </option>
              ))}
            </select>
            {tournamentId && !dataLoading && tournamentTeams.length === 0 && (
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#f59e0b",
                  marginTop: 4,
                  display: "block",
                }}
              >
                No teams in this tournament yet.
              </span>
            )}
          </div>

          {/* Away Team dropdown */}
          <div className="matches-field">
            <label htmlFor="form-away-team">Away Team *</label>
            <select
              id="form-away-team"
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              disabled={dataLoading || !tournamentId || !homeTeamId}
              style={
                dataLoading || !tournamentId || !homeTeamId
                  ? SEL_OFF
                  : SEL
              }
            >
              <option value="">
                {!homeTeamId
                  ? "Select home team first"
                  : "— Select Away Team —"}
              </option>
              {awayTeamOptions.map((t) => (
                <option key={t.team_id} value={String(t.team_id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Score fields — completed only */}
          {matchStatus === "completed" && (
            <>
              <div className="matches-field">
                <label htmlFor="form-home-score">Home Score *</label>
                <input
                  id="form-home-score"
                  type="number"
                  min="0"
                  placeholder="e.g., 25"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  required
                />
              </div>
              <div className="matches-field">
                <label htmlFor="form-away-score">Away Score *</label>
                <input
                  id="form-away-score"
                  type="number"
                  min="0"
                  placeholder="e.g., 20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Info banner for non-completed */}
          {matchStatus !== "completed" && (
            <div className="matches-field matches-form-grid--full">
              <div
                style={{
                  background:
                    matchStatus === "live"
                      ? "rgba(245,158,11,0.08)"
                      : "rgba(99,102,241,0.08)",
                  border: `1px solid ${
                    matchStatus === "live"
                      ? "rgba(245,158,11,0.25)"
                      : "rgba(99,102,241,0.25)"
                  }`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.83rem",
                  color:
                    matchStatus === "live" ? "#fbbf24" : "#a5b4fc",
                  lineHeight: 1.5,
                }}
              >
                {matchStatus === "upcoming"
                  ? "📅 Scores will be entered after the match is completed."
                  : "⚡ Match is live — scores will be set when the match finishes."}
              </div>
            </div>
          )}

          {/* Optional metadata */}
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

      {/* ── Section 2: Match Upload ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Upload</h2>
        {isUploading ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <span
              style={{
                fontWeight: 600,
                display: "block",
                marginBottom: 8,
              }}
            >
              Uploading {fileName}...
            </span>
            <div
              className="matches-progress-bar-bg"
              style={{ maxWidth: 400, margin: "0 auto" }}
            >
              <div
                className="matches-progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginTop: 8,
              }}
            >
              {uploadProgress}% Uploaded
            </span>
          </div>
        ) : (
          <div
            className="matches-upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleSelectFile();
            }}
            style={{ padding: "40px 20px" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
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
              style={{ padding: "8px 18px", marginTop: 8 }}
            >
              Choose File
            </button>
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: 6,
              }}
            >
              Supported formats: MP4, MOV, AVI (Max 2GB)
            </span>
          </div>
        )}
      </section>

      {/* ── Section 3: Upload Details ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Upload Details</h2>
        <div className="matches-form-grid">
          <div className="matches-field">
            <label htmlFor="up-title">Video Title</label>
            <input
              id="up-title"
              type="text"
              placeholder="e.g., Home Team vs Away Team - Finals"
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

      {/* ── Section 4: Event Review Setup ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Event Review Setup</h2>
        {isAnalyzing ? (
          <div className="matches-alert-card matches-alert-card--info">
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                strokeDasharray="30"
                strokeDashoffset="10"
              />
            </svg>
            <div>
              <strong>Running AI volleyball event detection...</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                Analyzing feed patterns to trace spikes, passes, serves, and
                court lines...
              </p>
            </div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--info">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong>Event detection will begin after upload</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                AI will analyze the video and detect volleyball events
                automatically
              </p>
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
            <span
              className={`matches-badge ${
                analysisCompleted
                  ? "matches-badge--green"
                  : isAnalyzing
                  ? "matches-badge--blue"
                  : "matches-badge--muted"
              }`}
              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            >
              {reviewStatus}
            </span>
            <span
              className="matches-setup-stat-lbl"
              style={{ marginTop: 4 }}
            >
              Review Status
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={!analysisCompleted}
          onClick={() =>
            triggerToast("Navigating to Event Review editor...")
          }
          className="matches-btn-blue"
          id="btn-go-event-review"
        >
          Go to Event Review
        </button>
      </section>

      {/* ── Section 5: Generate Video ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Generate Video</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            id="confirmed-events"
            checked={confirmedOnly}
            onChange={(e) => setConfirmedOnly(e.target.checked)}
            disabled={!analysisCompleted}
          />
          <label
            htmlFor="confirmed-events"
            style={{
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Include confirmed events only
          </label>
        </div>
        <div className="matches-field" style={{ maxWidth: 300 }}>
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
            <span
              style={{
                fontWeight: 600,
                display: "block",
                marginBottom: 6,
                fontSize: "0.85rem",
              }}
            >
              Generating highlights compilation...
            </span>
            <div
              className="matches-progress-bar-bg"
              style={{ maxWidth: 300 }}
            >
              <div
                className="matches-progress-bar-fill"
                style={{
                  width: `${videoProgress}%`,
                  background: "linear-gradient(90deg,#8b5cf6,#c084fc)",
                }}
              />
            </div>
          </div>
        ) : videoGenerated ? (
          <div
            className="matches-alert-card matches-alert-card--info"
            style={{
              background: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <div>
              <strong>Video highlights compilation generated!</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                The highlights reel has been successfully compiled and is ready
                for playback.
              </p>
            </div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--gray">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <strong>Video generation not started</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>
                Upload and confirm events before generating video
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          disabled={!analysisCompleted || isGeneratingVideo || videoGenerated}
          onClick={() => {
            setIsGeneratingVideo(true);
            setVideoProgress(0);
            const iv = setInterval(() => {
              setVideoProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(iv);
                  setIsGeneratingVideo(false);
                  setVideoGenerated(true);
                  triggerToast("Highlights compiled successfully!");
                  return 100;
                }
                return prev + 25;
              });
            }, 250);
          }}
          className="matches-btn-purple"
          id="btn-generate-video-action"
        >
          Generate Video
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="matches-form-footer">
        <Link
          to="/matches"
          className="matches-modal-btn-cancel"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Cancel
        </Link>
        <div className="matches-form-footer-right">
          <button
            type="button"
            onClick={handleApiSubmit}
            className="matches-btn-orange"
            id="btn-create-match-submit"
            disabled={
              submitLoading ||
              dataLoading ||
              !tournamentId ||
              !homeTeamId ||
              !awayTeamId
            }
          >
            {submitLoading ? "Creating…" : "Create Match"}
          </button>
          {uploadCompleted ? (
            <button
              type="button"
              onClick={() => {
                triggerToast("Saving match analytics...");
                setTimeout(() => navigate("/matches"), 1000);
              }}
              className="matches-btn-outline"
              id="btn-save-upload-complete"
            >
              Save &amp; Complete
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!fileName) {
                  triggerToast(
                    "Please choose a match video file to upload.",
                    "error"
                  );
                  return;
                }
                setIsUploading(true);
                setUploadProgress(0);
                const iv = setInterval(() => {
                  setUploadProgress((prev) => {
                    if (prev >= 100) {
                      clearInterval(iv);
                      setIsUploading(false);
                      setUploadCompleted(true);
                      triggerToast(
                        "Upload completed! Running AI event detection..."
                      );
                      setIsAnalyzing(true);
                      setDetectedCount("--");
                      setConfidenceScore("--");
                      setReviewStatus("Processing");
                      let c = 0;
                      const ai = setInterval(() => {
                        c++;
                        if (c >= 10) {
                          clearInterval(ai);
                          setIsAnalyzing(false);
                          setAnalysisCompleted(true);
                          setDetectedCount("48");
                          setConfidenceScore("94%");
                          setReviewStatus("Completed");
                          triggerToast(
                            "AI analysis complete: 48 events detected!"
                          );
                        }
                      }, 200);
                      return 100;
                    }
                    return prev + 10;
                  });
                }, 150);
              }}
              className="matches-btn-outline"
              id="btn-save-and-upload"
            >
              Save &amp; Upload
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
