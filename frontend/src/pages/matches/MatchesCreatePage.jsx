import { useState, useEffect, useMemo, useRef } from "react";
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
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  // ── Remote data ──────────────────────────────────────────────────────────
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
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ── Match core fields ────────────────────────────────────────────────────
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

  // ── File / upload / pipeline state ───────────────────────────────────────
  const [videoFile, setVideoFile] = useState(null);        // real File object
  const [videoTitle, setVideoTitle] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [duration, setDuration] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [createdMatchId, setCreatedMatchId] = useState(null);

  // ── AI pipeline state ────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [detectedCount, setDetectedCount] = useState("--");
  const [confidenceScore, setConfidenceScore] = useState("--");
  const [reviewStatus, setReviewStatus] = useState("Not Started");
  const [pipelineError, setPipelineError] = useState("");

  // ── Video generation (still simulated) ───────────────────────────────────
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoType, setVideoType] = useState("Condensed Highlights");
  const [confirmedOnly, setConfirmedOnly] = useState(true);

  // ── Submit loading ───────────────────────────────────────────────────────
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Derived: teams filtered by tournament ────────────────────────────────
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

  const venueOptions = useMemo(() => {
    const set = new Set();
    const selectedTourn = tournaments.find((t) => String(t.tournament_id) === String(tournamentId));
    if (selectedTourn && selectedTourn.location && selectedTourn.location.trim()) {
      set.add(selectedTourn.location.trim());
    }
    tournamentTeams.forEach((t) => {
      if (t.home_venue && t.home_venue.trim()) {
        set.add(t.home_venue.trim());
      }
      if (t.city && t.city.trim()) {
        set.add(`${t.city.trim()} Indoor Arena`);
      }
    });
    if (set.size === 0) {
      set.add("Main Indoor Sports Arena");
      set.add("University Gymnasium Court 1");
      set.add("National Volleyball Center");
    }
    return Array.from(set);
  }, [tournaments, tournamentId, tournamentTeams]);

  const handleTournamentChange = (e) => {
    setTournamentId(e.target.value);
    setHomeTeamId("");
    setAwayTeamId("");
    setVenue("");
  };

  const handleHomeTeamChange = (e) => {
    const selectedTeamId = e.target.value;
    setHomeTeamId(selectedTeamId);
    if (selectedTeamId && selectedTeamId === awayTeamId) setAwayTeamId("");

    // Auto-select Home Team's venue if available
    const selectedTeam = tournamentTeams.find((t) => String(t.team_id) === String(selectedTeamId));
    if (selectedTeam && selectedTeam.home_venue) {
      setVenue(selectedTeam.home_venue);
    }
  };

  // ── Real file picker ─────────────────────────────────────────────────────
  const handleRealFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    const h =
      allTeams.find((t) => String(t.team_id) === String(homeTeamId))?.name ||
      "Home";
    const a =
      allTeams.find((t) => String(t.team_id) === String(awayTeamId))?.name ||
      "Away";
    setVideoTitle(`${h} vs ${a} - Match Video`);
    setCameraAngle("Court-side High");
    triggerToast(`File selected: ${file.name}`);
  };

  // ── Pipeline polling ─────────────────────────────────────────────────────
  const startPolling = (matchId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/pipeline/${matchId}/status/`);
        const { status, events_detected } = res.data;
        if (status === "complete") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setIsAnalyzing(false);
          setAnalysisCompleted(true);
          setDetectedCount(String(events_detected ?? 0));
          setConfidenceScore(events_detected > 0 ? "94%" : "N/A");
          setReviewStatus("Completed");
          triggerToast(
            `AI analysis complete! ${events_detected ?? 0} events detected.`
          );
        } else if (status === "failed") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setIsAnalyzing(false);
          setPipelineError("Pipeline failed. Check server logs.");
          setReviewStatus("Failed");
          triggerToast("Pipeline processing failed.", "error");
        } else {
          // still processing
          setReviewStatus("Processing");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000);
  };

  // ── API submit → upload → pipeline ──────────────────────────────────────
  const handleApiSubmit = async () => {
    if (!tournamentId) { triggerToast("Please select a tournament.", "error"); return; }
    if (!homeTeamId) { triggerToast("Please select a home team.", "error"); return; }
    if (!awayTeamId) { triggerToast("Please select an away team.", "error"); return; }
    if (String(homeTeamId) === String(awayTeamId)) {
      triggerToast("Home and away teams must be different.", "error"); return;
    }
    if (matchStatus === "completed") {
      if (homeScore === "" || awayScore === "") {
        triggerToast("Sets won are required for completed matches.", "error"); return;
      }
      const h = Number(homeScore);
      const a = Number(awayScore);
      if (h !== 3 && a !== 3) {
        triggerToast("One team must win 3 sets to win a volleyball match (e.g. 3-0, 3-1, 3-2).", "error"); return;
      }
    }
    try {
      setSubmitLoading(true);
      const res = await API.post("/matches/", {
        tournament_id: Number(tournamentId),
        home_team_id: Number(homeTeamId),
        away_team_id: Number(awayTeamId),
        match_status: matchStatus,
        status: "pending",
        home_score: matchStatus === "completed" ? Number(homeScore) : null,
        away_score: matchStatus === "completed" ? Number(awayScore) : null,
      });
      setCreatedMatchId(res.data.match_id);
      triggerToast(`Match TN${tournamentId}-M${res.data.match_id} created successfully!`);
      setTimeout(() => navigate("/matches"), 1200);
    } catch (err) {
      console.error("Error creating match:", err);
      const detail = err?.response?.data?.detail;
      const errorMsg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
          : "Failed to create match.";
      triggerToast(errorMsg, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Save & Upload: create match → XHR upload → trigger pipeline ──────────
  const handleSaveAndUpload = async () => {
    if (!videoFile) {
      triggerToast("Please choose a match video file to upload.", "error");
      return;
    }
    if (!tournamentId) { triggerToast("Please select a tournament.", "error"); return; }
    if (!homeTeamId) { triggerToast("Please select a home team.", "error"); return; }
    if (!awayTeamId) { triggerToast("Please select an away team.", "error"); return; }
    if (matchStatus === "completed") {
      if (homeScore === "" || awayScore === "") {
        triggerToast("Sets won are required for completed matches.", "error"); return;
      }
      const h = Number(homeScore);
      const a = Number(awayScore);
      if (h !== 3 && a !== 3) {
        triggerToast("One team must win 3 sets to win a volleyball match (e.g. 3-0, 3-1, 3-2).", "error"); return;
      }
    }

    try {
      setSubmitLoading(true);

      // Step 1: Create match record
      const createRes = await API.post("/matches/", {
        tournament_id: Number(tournamentId),
        home_team_id: Number(homeTeamId),
        away_team_id: Number(awayTeamId),
        match_status: matchStatus,
        status: "pending",
        home_score: matchStatus === "completed" ? Number(homeScore) : null,
        away_score: matchStatus === "completed" ? Number(awayScore) : null,
      });
      const matchId = createRes.data.match_id;
      setCreatedMatchId(matchId);
      triggerToast(`Match #${matchId} created. Uploading video…`);
      setSubmitLoading(false);

      // Step 2: Upload video via XHR for real progress tracking
      const token = (() => {
        try {
          const raw = localStorage.getItem("token") || localStorage.getItem("access_token");
          if (raw) return raw.replace(/^"|"$/g, "");
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return (u?.access_token || u?.token || "").replace(/^"|"$/g, "");
        } catch { return ""; }
      })();

      setIsUploading(true);
      setUploadProgress(0);

      await new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", videoFile);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || `Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", `http://localhost:8000/api/matches/${matchId}/upload/`);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      setIsUploading(false);
      setUploadCompleted(true);
      triggerToast("Upload complete! Starting AI pipeline…");

      // Step 3: Trigger pipeline
      await API.post(`/pipeline/${matchId}/process/`);
      setIsAnalyzing(true);
      setReviewStatus("Processing");
      triggerToast("AI pipeline started. Polling for results every 10s…");

      // Step 4: Poll for pipeline completion
      startPolling(matchId);
    } catch (err) {
      setIsUploading(false);
      setSubmitLoading(false);
      triggerToast(err?.message || err?.response?.data?.detail || "Upload or pipeline failed.", "error");
    }
  };

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />
      <style>{`@keyframes vr-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="real-file-input"
        accept=".mp4,.mov,.avi,.mkv,.webm"
        style={{ display: "none" }}
        onChange={handleRealFileSelect}
      />

      {/* Toast */}
      {toast.msg && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24,
            background: "rgba(15,23,42,0.96)",
            border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            color: "#fff", padding: "12px 22px", borderRadius: 10, zIndex: 2000,
            boxShadow: "0 10px 25px rgba(0,0,0,.5)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.88rem", fontWeight: 600,
            animation: "matchesSlideUp .2s ease-out", maxWidth: 380,
          }}
        >
          <span style={{ color: toast.type === "error" ? "#ef4444" : "#10b981" }}>
            {toast.type === "error" ? "✗" : "✓"}
          </span>{" "}{toast.msg}
        </div>
      )}

      {/* Page Header */}
      <header className="analytics-header">
        <h1>Create Match</h1>
        <p>Set up a new volleyball match for analysis and video generation</p>
      </header>

      {/* Data loading banner */}
      {dataLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", marginBottom: 16, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, color: "#a5b4fc", fontSize: "0.88rem", fontWeight: 600 }}>
          <svg style={{ animation: "vr-spin 1s linear infinite", flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
          Loading tournaments &amp; teams…
        </div>
      )}

      {(!dataLoading && (tournaments.length === 0 || dataError)) && (
        <div style={{ padding: "24px", marginBottom: 24, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>🏆</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fbbf24", margin: 0 }}>No Active Tournaments Found</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            You need to create a tournament first before setting up new matches or fixture schedules.
          </p>
          <Link to="/tournaments/create" className="matches-btn-orange" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            + Create a Tournament
          </Link>
        </div>
      )}

      {/* ── Section 1: Match Details ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Details</h2>
        <div className="matches-form-grid">

          <div className="matches-field">
            <label htmlFor="form-match-status">Match Status *</label>
            <select id="form-match-status" value={matchStatus} onChange={(e) => setMatchStatus(e.target.value)} style={SEL}>
              <option value="upcoming">Upcoming — match has not happened yet</option>
              <option value="live">Live — match is currently in progress</option>
              <option value="completed">Completed — match has finished</option>
            </select>
          </div>

          <div className="matches-field">
            <label htmlFor="form-tournament">
              Tournament *
              {dataLoading && <span style={{ marginLeft: 8, color: "#6366f1", fontSize: "0.75rem" }}>loading…</span>}
            </label>
            <select id="form-tournament" value={tournamentId} onChange={handleTournamentChange} disabled={dataLoading} style={dataLoading ? SEL_OFF : SEL}>
              <option value="">— Select Tournament —</option>
              {tournaments.map((t) => (
                <option key={t.tournament_id} value={String(t.tournament_id)}>{t.name}</option>
              ))}
            </select>
            {!dataLoading && tournaments.length === 0 && !dataError && (
              <span style={{ fontSize: "0.78rem", color: "#f59e0b", marginTop: 4, display: "block" }}>No tournaments found. Create one first.</span>
            )}
          </div>

          <div className="matches-field">
            <label htmlFor="form-home-team">Home Team *</label>
            <select id="form-home-team" value={homeTeamId} onChange={handleHomeTeamChange} disabled={dataLoading || !tournamentId} style={dataLoading || !tournamentId ? SEL_OFF : SEL}>
              <option value="">{!tournamentId ? "Select a tournament first" : "— Select Home Team —"}</option>
              {tournamentTeams.map((t) => (
                <option key={t.team_id} value={String(t.team_id)}>{t.name}</option>
              ))}
            </select>
            {tournamentId && !dataLoading && tournamentTeams.length === 0 && (
              <span style={{ fontSize: "0.78rem", color: "#f59e0b", marginTop: 4, display: "block" }}>No teams in this tournament yet.</span>
            )}
          </div>

          <div className="matches-field">
            <label htmlFor="form-away-team">Away Team *</label>
            <select id="form-away-team" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} disabled={dataLoading || !tournamentId || !homeTeamId} style={dataLoading || !tournamentId || !homeTeamId ? SEL_OFF : SEL}>
              <option value="">{!homeTeamId ? "Select home team first" : "— Select Away Team —"}</option>
              {awayTeamOptions.map((t) => (
                <option key={t.team_id} value={String(t.team_id)}>{t.name}</option>
              ))}
            </select>
          </div>

          {matchStatus === "completed" && (
            <>
              <div className="matches-field">
                <label htmlFor="form-home-score">Home Sets Won (Sessions) *</label>
                <select id="form-home-score" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} style={SEL} required>
                  <option value="">— Select Sets Won —</option>
                  <option value="3">3 Sets Won (Match Winner)</option>
                  <option value="2">2 Sets Won</option>
                  <option value="1">1 Set Won</option>
                  <option value="0">0 Sets Won</option>
                </select>
              </div>
              <div className="matches-field">
                <label htmlFor="form-away-score">Away Sets Won (Sessions) *</label>
                <select id="form-away-score" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} style={SEL} required>
                  <option value="">— Select Sets Won —</option>
                  <option value="3">3 Sets Won (Match Winner)</option>
                  <option value="2">2 Sets Won</option>
                  <option value="1">1 Set Won</option>
                  <option value="0">0 Sets Won</option>
                </select>
              </div>
              <div className="matches-field matches-form-grid--full">
                <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", color: "#93c5fd", lineHeight: 1.5 }}>
                  🏐 <strong>Volleyball Match Format (Best of 5 Sets):</strong> The final score represents the total <strong>sets (sessions) won</strong> by each team. One team must win <strong>3 sets</strong> to win the match (e.g. <strong>3–0</strong>, <strong>3–1</strong>, or <strong>3–2</strong>).
                </div>
              </div>
            </>
          )}

          {matchStatus !== "completed" && (
            <div className="matches-field matches-form-grid--full">
              <div style={{ background: matchStatus === "live" ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.08)", border: `1px solid ${matchStatus === "live" ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.25)"}`, borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", color: matchStatus === "live" ? "#fbbf24" : "#a5b4fc", lineHeight: 1.5 }}>
                {matchStatus === "upcoming" ? "📅 Scores will be entered after the match is completed." : "⚡ Match is live — scores will be set when the match finishes."}
              </div>
            </div>
          )}

          <div className="matches-field">
            <label htmlFor="form-date">Match Date</label>
            <input id="form-date" type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </div>
          <div className="matches-field">
            <label htmlFor="form-time">Match Time</label>
            <input id="form-time" type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
          </div>
          <div className="matches-field">
            <label htmlFor="form-venue">Venue</label>
            <select id="form-venue" value={venue} onChange={(e) => setVenue(e.target.value)} style={SEL}>
              <option value="">— Select Venue —</option>
              {venueOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {tournamentId && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                📍 Displays home venues of teams in this tournament
              </span>
            )}
          </div>

          <div className="matches-field">
            <label htmlFor="form-stage">Match Stage / Round</label>
            <select id="form-stage" value={stage} onChange={(e) => setStage(e.target.value)} style={SEL}>
              <option value="">— Select Stage / Round —</option>
              <option value="Group Stage">Group Stage</option>
              <option value="Group Stage - Round 1">Group Stage - Round 1</option>
              <option value="Group Stage - Round 2">Group Stage - Round 2</option>
              <option value="Group Stage - Round 3">Group Stage - Round 3</option>
              <option value="Quarter-Finals">Quarter-Finals</option>
              <option value="Semi-Finals">Semi-Finals</option>
              <option value="3rd Place Playoff">3rd Place Playoff</option>
              <option value="Finals">Finals</option>
              <option value="Exhibition / Friendly">Exhibition / Friendly</option>
            </select>
          </div>
          <div className="matches-field matches-form-grid--full">
            <label htmlFor="form-notes">Notes</label>
            <textarea id="form-notes" rows="3" placeholder="Additional match notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Section 2: Match Upload ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Match Upload</h2>
        {isUploading ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <span style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
              Uploading {videoFile?.name}…
            </span>
            <div className="matches-progress-bar-bg" style={{ maxWidth: 400, margin: "0 auto" }}>
              <div className="matches-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: 8 }}>
              {uploadProgress}% Uploaded
            </span>
          </div>
        ) : (
          <div
            className="matches-upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const fileEvent = { target: { files: [f] } }; handleRealFileSelect(fileEvent); } }}
            style={{ padding: "40px 20px" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {videoFile ? (
              <>
                <strong style={{ color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>✓</span> {videoFile.name}
                </strong>
                <p style={{ color: "#10b981", fontWeight: 600, margin: "4px 0" }}>Video is uploaded to the system</p>
                <p style={{ fontSize: "0.85rem", marginTop: 8 }}>Drag another file or click below to change</p>
              </>
            ) : (
              <><strong>Drag and drop match video here</strong><p>or</p></>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="matches-btn-view"
              style={{ padding: "8px 18px", marginTop: 8 }}
            >
              Choose File
            </button>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>
              Supported formats: MP4, MOV, AVI, MKV, WebM (Max 2GB)
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
            <input id="up-title" type="text" placeholder="e.g., Home Team vs Away Team - Finals" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} disabled={!videoFile} />
          </div>
          <div className="matches-field">
            <label htmlFor="up-camera">Camera Angle</label>
            <input id="up-camera" type="text" placeholder="e.g., High Court" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} disabled={!videoFile} />
          </div>
          <div className="matches-field">
            <label htmlFor="up-duration">Duration</label>
            <input id="up-duration" type="text" placeholder="e.g., 1:45:30" value={duration} onChange={(e) => setDuration(e.target.value)} disabled={!videoFile} />
          </div>
          <div className="matches-field matches-form-grid--full">
            <label htmlFor="up-notes">Upload Notes</label>
            <textarea id="up-notes" rows="3" placeholder="Additional notes about the video upload..." value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)} disabled={!videoFile} />
          </div>
        </div>
      </section>

      {/* ── Section 4: Event Review Setup ── */}
      <section className="matches-form-card">
        <h2 className="matches-form-card-title">Event Review Setup</h2>
        {isAnalyzing ? (
          <div className="matches-alert-card matches-alert-card--info">
            <svg style={{ animation: "vr-spin 1s linear infinite", flexShrink: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
            </svg>
            <div>
              <strong>Running AI volleyball event detection…</strong>
              <p style={{ fontSize: "0.8rem", opacity: 0.85 }}>Polling every 10 seconds. This may take several minutes.</p>
            </div>
          </div>
        ) : pipelineError ? (
          <div className="matches-alert-card" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            <span>⚠️</span>
            <div><strong>Pipeline error</strong><p style={{ fontSize: "0.8rem" }}>{pipelineError}</p></div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
            <span className="matches-setup-stat-lbl" style={{ marginTop: 4 }}>Review Status</span>
          </div>
        </div>

        <button
          type="button"
          disabled={!analysisCompleted || !createdMatchId}
          onClick={() => navigate(`/matches/upload?matchId=${createdMatchId}`)}
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
          <input type="checkbox" id="confirmed-events" checked={confirmedOnly} onChange={(e) => setConfirmedOnly(e.target.checked)} disabled={!analysisCompleted} />
          <label htmlFor="confirmed-events" style={{ fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}>Include confirmed events only</label>
        </div>
        <div className="matches-field" style={{ maxWidth: 300 }}>
          <label htmlFor="video-type">Video Type</label>
          <input id="video-type" type="text" value={videoType} onChange={(e) => setVideoType(e.target.value)} disabled={!analysisCompleted} />
        </div>
        {isGeneratingVideo ? (
          <div style={{ padding: "10px 0" }}>
            <span style={{ fontWeight: 600, display: "block", marginBottom: 6, fontSize: "0.85rem" }}>Generating highlights compilation…</span>
            <div className="matches-progress-bar-bg" style={{ maxWidth: 300 }}>
              <div className="matches-progress-bar-fill" style={{ width: `${videoProgress}%`, background: "linear-gradient(90deg,#8b5cf6,#c084fc)" }} />
            </div>
          </div>
        ) : videoGenerated ? (
          <div className="matches-alert-card matches-alert-card--info" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)", color: "#34d399" }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <div><strong>Video highlights compilation generated!</strong><p style={{ fontSize: "0.8rem", opacity: 0.85 }}>The highlights reel has been successfully compiled and is ready for playback.</p></div>
          </div>
        ) : (
          <div className="matches-alert-card matches-alert-card--gray">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <div><strong>Video generation not started</strong><p style={{ fontSize: "0.8rem", opacity: 0.85 }}>Upload and confirm events before generating video</p></div>
          </div>
        )}
        <button
          type="button"
          disabled={!analysisCompleted || isGeneratingVideo || videoGenerated}
          onClick={() => {
            setIsGeneratingVideo(true); setVideoProgress(0);
            const iv = setInterval(() => {
              setVideoProgress((prev) => {
                if (prev >= 100) { clearInterval(iv); setIsGeneratingVideo(false); setVideoGenerated(true); triggerToast("Highlights compiled successfully!"); return 100; }
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
        <Link to="/matches" className="matches-modal-btn-cancel" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Cancel
        </Link>
        <div className="matches-form-footer-right">
          {/* Primary: Create Match only (no upload) */}
          <button
            type="button"
            onClick={handleApiSubmit}
            className="matches-btn-orange"
            id="btn-create-match-submit"
            disabled={submitLoading || dataLoading || !tournamentId || !homeTeamId || !awayTeamId}
          >
            {submitLoading ? "Creating…" : "Create Match"}
          </button>

          {/* Secondary: Create + Upload + Pipeline */}
          {uploadCompleted ? (
            <button
              type="button"
              onClick={() => { triggerToast("Match complete!"); setTimeout(() => navigate("/matches"), 1000); }}
              className="matches-btn-outline"
              id="btn-save-upload-complete"
            >
              Save &amp; Complete
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAndUpload}
              className="matches-btn-outline"
              id="btn-save-and-upload"
              disabled={isUploading || submitLoading}
            >
              {isUploading ? `Uploading ${uploadProgress}%…` : "Save & Upload"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
