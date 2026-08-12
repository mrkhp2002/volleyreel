import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../services/apiClient";
import "../../styles/matches.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(sec) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function EventTypeBadge({ type }) {
  const colors = {
    ace: "#10b981",
    kill: "#f59e0b",
    block: "#3b82f6",
    spike: "#f59e0b",
    dig: "#8b5cf6",
    serve: "#06b6d4",
    error: "#ef4444",
  };
  const color = colors[type?.toLowerCase()] || "#94a3b8";
  return (
    <span style={{
      display:"inline-block",padding:"2px 10px",borderRadius:20,
      fontSize:".76rem",fontWeight:700,letterSpacing:".04em",
      background:`${color}22`,color,border:`1px solid ${color}44`,
      textTransform:"uppercase",
    }}>
      {type}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MatchDashboardPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [playersMap, setPlayersMap] = useState({});
  const [teamsMap, setTeamsMap] = useState({});
  const [tournamentsMap, setTournamentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | stats | highlights
  const [toast, setToast] = useState("");

  const triggerToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  // ── Load Data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!matchId) return;
    (async () => {
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

        setTeamsMap(tMap);
        setTournamentsMap(tournMap);
        setMatch(matchRes.data);

        // Filter events for this match only
        const matchEvents = eventsRes.data
          .filter((ev) => ev.match_id === Number(matchId))
          .sort((a, b) => a.timestamp_sec - b.timestamp_sec);
        setEvents(matchEvents);

        // Build players map from team players if available
        const pMap = {};
        const homeTeam = tMap[matchRes.data.home_team_id];
        const awayTeam = tMap[matchRes.data.away_team_id];
        if (homeTeam?.players) homeTeam.players.forEach((p) => { pMap[p.player_id] = p; });
        if (awayTeam?.players) awayTeam.players.forEach((p) => { pMap[p.player_id] = p; });
        setPlayersMap(pMap);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load match data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  // ── Seek video to timestamp ───────────────────────────────────────────────

  const seekTo = (sec) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
    }
    setActiveEventId(null);
  };

  const handleEventClick = (event) => {
    setActiveEventId(event.event_id);
    seekTo(event.timestamp_sec);
    triggerToast(`Seeking to ${fmtTime(event.timestamp_sec)} — ${event.event_type}`);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────

  const playerStats = (() => {
    const stats = {};
    events.forEach((ev) => {
      const pid = ev.player_id;
      if (!pid) return;
      if (!stats[pid]) stats[pid] = { player_id: pid, kills: 0, aces: 0, blocks: 0, digs: 0, spikes: 0, errors: 0, total: 0 };
      const t = ev.event_type?.toLowerCase();
      if (t === "kill") stats[pid].kills++;
      else if (t === "ace") stats[pid].aces++;
      else if (t === "block") stats[pid].blocks++;
      else if (t === "dig") stats[pid].digs++;
      else if (t === "spike") stats[pid].spikes++;
      else if (t === "error") stats[pid].errors++;
      stats[pid].total++;
    });
    return Object.values(stats).sort((a, b) => b.total - a.total);
  })();

  const eventTypeCounts = (() => {
    const c = {};
    events.forEach((ev) => { const t = ev.event_type || "unknown"; c[t] = (c[t] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  })();

  // ── Render helpers ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-glow matches-glow--1" />
        <div className="matches-glow matches-glow--2" />
        <div style={{padding:"80px",textAlign:"center",color:"var(--text-muted)"}}>
          <div style={{fontSize:"2.5rem",marginBottom:16}}>⏳</div>
          <p style={{fontWeight:600,fontSize:"1.1rem"}}>Loading match dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="matches-page">
        <div className="matches-glow matches-glow--1" />
        <div className="matches-glow matches-glow--2" />
        <Link to="/matches" className="matches-details-back-link">← Back to Matches</Link>
        <div style={{padding:"60px",textAlign:"center"}}>
          <div style={{fontSize:"2rem",marginBottom:12}}>⚠️</div>
          <p style={{color:"#ef4444",fontWeight:600,marginBottom:16}}>{error||"Match not found."}</p>
          <button onClick={()=>navigate("/matches")} className="matches-btn-orange">Back to Matches</button>
        </div>
      </div>
    );
  }

  const homeTeamName = teamsMap[match.home_team_id]?.name || `Team #${match.home_team_id}`;
  const awayTeamName = teamsMap[match.away_team_id]?.name || `Team #${match.away_team_id}`;
  const tournamentName = tournamentsMap[match.tournament_id]?.name || `Tournament #${match.tournament_id}`;
  const matchDate = match.created_at ? new Date(match.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";

  const tabStyle = (tab) => ({
    padding:"10px 22px", borderRadius:8, fontWeight:600, fontSize:".88rem",
    cursor:"pointer", border:"none",
    background: activeTab===tab ? "rgba(245,158,11,0.18)" : "transparent",
    color: activeTab===tab ? "#fbbf24" : "var(--text-muted)",
    borderBottom: activeTab===tab ? "2px solid #f59e0b" : "2px solid transparent",
    transition:"all .2s",
  });

  const statusColor = { complete:"#10b981", processing:"#3b82f6", failed:"#ef4444", pending:"#94a3b8" };

  return (
    <div className="matches-page">
      <div className="matches-glow matches-glow--1" />
      <div className="matches-glow matches-glow--2" />

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:2000,background:"rgba(15,23,42,.96)",border:"1px solid #10b981",color:"#fff",padding:"12px 22px",borderRadius:10,display:"flex",alignItems:"center",gap:8,fontSize:".88rem",fontWeight:600,boxShadow:"0 10px 25px rgba(0,0,0,.5)",backdropFilter:"blur(8px)",maxWidth:380,animation:"matchesSlideUp .2s ease-out"}}>
          <span style={{color:"#10b981"}}>✓</span> {toast}
        </div>
      )}

      {/* Back */}
      <Link to="/matches" className="matches-details-back-link">← Back to Matches</Link>

      {/* Match Hero Header */}
      <div style={{background:"linear-gradient(135deg,rgba(245,158,11,.12) 0%,rgba(59,130,246,.08) 100%)",border:"1px solid rgba(255,255,255,.06)",borderRadius:16,padding:"28px 32px",marginBottom:4,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:300,height:"100%",background:"radial-gradient(circle at right,rgba(245,158,11,.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:".78rem",fontWeight:600,color:"var(--text-muted)",letterSpacing:".08em",textTransform:"uppercase"}}>Match Dashboard</span>
              <span style={{background:`${statusColor[match.status]||"#94a3b8"}22`,color:statusColor[match.status]||"#94a3b8",border:`1px solid ${statusColor[match.status]||"#94a3b8"}44`,borderRadius:20,padding:"2px 10px",fontSize:".75rem",fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>
                {match.status}
              </span>
            </div>
            <h1 style={{fontFamily:"Outfit,sans-serif",fontSize:"1.9rem",fontWeight:800,color:"#fff",margin:"0 0 4px"}}>
              {homeTeamName} <span style={{color:"rgba(255,255,255,.3)",fontSize:"1.4rem"}}>vs</span> {awayTeamName}
            </h1>
            <p style={{color:"var(--text-muted)",fontSize:".92rem",margin:0}}>{tournamentName} · {matchDate}</p>
          </div>

          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <div style={{display:"flex",gap:20,background:"rgba(2,6,17,.5)",borderRadius:12,padding:"16px 24px",border:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{textAlign:"center"}}>
                <span style={{display:"block",fontSize:"2.2rem",fontWeight:800,color:"#fff",lineHeight:1}}>{match.home_score??0}</span>
                <span style={{fontSize:".75rem",color:"var(--text-muted)",fontWeight:600}}>{homeTeamName}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",color:"rgba(255,255,255,.2)",fontSize:"1.4rem",fontWeight:300}}>–</div>
              <div style={{textAlign:"center"}}>
                <span style={{display:"block",fontSize:"2.2rem",fontWeight:800,color:"#fff",lineHeight:1}}>{match.away_score??0}</span>
                <span style={{fontSize:".75rem",color:"var(--text-muted)",fontWeight:600}}>{awayTeamName}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <span style={{background:"rgba(2,6,17,.5)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"5px 12px",fontSize:".8rem",color:"var(--text-muted)"}}>
                📍 Match #{match.match_id}
              </span>
              <span style={{background:"rgba(2,6,17,.5)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"5px 12px",fontSize:".8rem",color:"var(--text-muted)"}}>
                🎯 {events.length} events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)",gap:20,alignItems:"start"}}>

        {/* Left col: Video + Tabs */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Video Player */}
          <div className="matches-form-card" style={{padding:0,overflow:"hidden"}}>
            {match.video_url || match.highlight_url ? (
              <video
                ref={videoRef}
                controls
                src={activeTab==="highlights" && match.highlight_url ? match.highlight_url : match.video_url || match.highlight_url}
                style={{width:"100%",display:"block",background:"#000",maxHeight:480}}
                onError={() => triggerToast("Video could not be loaded.")}
              />
            ) : (
              <div style={{height:280,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,background:"rgba(2,6,17,.6)"}}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                <p style={{color:"var(--text-muted)",fontSize:".9rem",fontWeight:600}}>No video uploaded yet</p>
                <button className="matches-btn-orange" onClick={()=>navigate(`/matches`)}>
                  Go to Matches to Upload
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="matches-form-card" style={{padding:0}}>
            <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"0 4px"}}>
              {["timeline","stats","highlights"].map((tab)=>(
                <button key={tab} style={tabStyle(tab)} onClick={()=>setActiveTab(tab)}>
                  {tab==="timeline"?"⏱ Timeline":tab==="stats"?"📊 Player Stats":"🎬 Highlights"}
                </button>
              ))}
            </div>

            <div style={{padding:"20px 24px",minHeight:240}}>

              {/* Timeline Tab */}
              {activeTab==="timeline" && (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <h3 style={{margin:0,fontSize:"1rem",fontWeight:700,color:"#fff"}}>Event Timeline</h3>
                    <span style={{fontSize:".8rem",color:"var(--text-muted)"}}>{events.length} events · click to seek</span>
                  </div>
                  {events.length === 0 ? (
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)"}}>
                      <p>No events detected yet. Run the AI pipeline to analyze the video.</p>
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:380,overflowY:"auto"}}>
                      {events.map((ev)=>(
                        <div
                          key={ev.event_id}
                          onClick={()=>handleEventClick(ev)}
                          style={{
                            display:"flex",alignItems:"center",gap:12,
                            padding:"10px 14px",borderRadius:10,cursor:"pointer",
                            background:activeEventId===ev.event_id?"rgba(245,158,11,.12)":"rgba(2,6,17,.4)",
                            border:`1px solid ${activeEventId===ev.event_id?"rgba(245,158,11,.3)":"rgba(255,255,255,.05)"}`,
                            transition:"all .18s",
                          }}
                          onMouseEnter={(e)=>{if(activeEventId!==ev.event_id)e.currentTarget.style.background="rgba(255,255,255,.04)"}}
                          onMouseLeave={(e)=>{if(activeEventId!==ev.event_id)e.currentTarget.style.background="rgba(2,6,17,.4)"}}
                        >
                          <span style={{fontFamily:"monospace",fontSize:".82rem",fontWeight:700,color:"#f59e0b",minWidth:44,flexShrink:0}}>
                            {fmtTime(ev.timestamp_sec)}
                          </span>
                          <EventTypeBadge type={ev.event_type}/>
                          <span style={{fontSize:".85rem",color:"#e2e8f0",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {ev.transcript_snippet || `Event #${ev.event_id}`}
                          </span>
                          {ev.confidence && (
                            <span style={{fontSize:".75rem",color:"var(--text-muted)",flexShrink:0}}>
                              {Math.round(ev.confidence*100)}%
                            </span>
                          )}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Tab */}
              {activeTab==="stats" && (
                <div>
                  <h3 style={{margin:"0 0 16px",fontSize:"1rem",fontWeight:700,color:"#fff"}}>Player Statistics</h3>
                  {playerStats.length === 0 ? (
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)"}}>
                      <p>No player stats available. Run the AI pipeline to detect events.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{overflowX:"auto"}}>
                        <table className="matches-table" style={{fontSize:".84rem"}}>
                          <thead>
                            <tr>
                              <th>Player</th>
                              <th style={{textAlign:"center"}}>Kills</th>
                              <th style={{textAlign:"center"}}>Aces</th>
                              <th style={{textAlign:"center"}}>Blocks</th>
                              <th style={{textAlign:"center"}}>Digs</th>
                              <th style={{textAlign:"center"}}>Spikes</th>
                              <th style={{textAlign:"center"}}>Errors</th>
                              <th style={{textAlign:"center"}}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {playerStats.map((ps)=>(
                              <tr key={ps.player_id}>
                                <td>
                                  <span style={{fontWeight:600,color:"#fff"}}>
                                    {playersMap[ps.player_id]?.name || `Player #${ps.player_id}`}
                                  </span>
                                </td>
                                <td style={{textAlign:"center",color:"#f59e0b",fontWeight:700}}>{ps.kills}</td>
                                <td style={{textAlign:"center",color:"#10b981",fontWeight:700}}>{ps.aces}</td>
                                <td style={{textAlign:"center",color:"#3b82f6",fontWeight:700}}>{ps.blocks}</td>
                                <td style={{textAlign:"center",color:"#8b5cf6",fontWeight:700}}>{ps.digs}</td>
                                <td style={{textAlign:"center",color:"#f59e0b",fontWeight:700}}>{ps.spikes}</td>
                                <td style={{textAlign:"center",color:"#ef4444",fontWeight:700}}>{ps.errors}</td>
                                <td style={{textAlign:"center",fontWeight:700,color:"#cbd5e1"}}>{ps.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Event type breakdown */}
                      <div style={{marginTop:24}}>
                        <h4 style={{fontSize:".9rem",fontWeight:700,color:"#fff",marginBottom:12}}>Event Breakdown</h4>
                        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                          {eventTypeCounts.map(([type,count])=>(
                            <div key={type} style={{background:"rgba(2,6,17,.5)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
                              <EventTypeBadge type={type}/>
                              <span style={{fontWeight:700,color:"#fff"}}>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Highlights Tab */}
              {activeTab==="highlights" && (
                <div>
                  <h3 style={{margin:"0 0 16px",fontSize:"1rem",fontWeight:700,color:"#fff"}}>Highlight Reel</h3>
                  {match.highlight_url ? (
                    <>
                      <video
                        controls
                        src={match.highlight_url}
                        style={{width:"100%",borderRadius:10,background:"#000",marginBottom:12}}
                      />
                      <p style={{fontSize:".82rem",color:"var(--text-muted)",lineHeight:1.5}}>
                        AI-generated highlight reel combining the top {events.length} detected events.
                      </p>
                    </>
                  ) : (
                    <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)"}}>
                      <p>No highlight reel generated yet.</p>
                      {match.status !== "complete" && (
                        <p style={{fontSize:".82rem"}}>Run the AI pipeline to generate highlights.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col: Info + Quick Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Match Info */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Match Details</h2>
            <div className="matches-info-grid">
              {[
                ["Match ID",`#${match.match_id}`],
                ["Tournament",tournamentName],
                ["Home Team",homeTeamName],
                ["Away Team",awayTeamName],
                ["Date",matchDate],
                ["Events",events.length],
              ].map(([label,val])=>(
                <div key={label} className="matches-info-item">
                  <span className="matches-info-label">{label}</span>
                  <span className="matches-info-val">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Card */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Pipeline Status</h2>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".88rem",color:"var(--text-muted)"}}>Status</span>
                <span style={{
                  background:`${statusColor[match.status]||"#94a3b8"}22`,
                  color:statusColor[match.status]||"#94a3b8",
                  border:`1px solid ${statusColor[match.status]||"#94a3b8"}44`,
                  borderRadius:20,padding:"3px 12px",fontSize:".8rem",fontWeight:700,
                  textTransform:"uppercase",letterSpacing:".05em",
                }}>{match.status}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".88rem",color:"var(--text-muted)"}}>Video</span>
                <span style={{fontSize:".88rem",fontWeight:600,color:match.video_url?"#10b981":"#94a3b8"}}>
                  {match.video_url?"✓ Uploaded":"Not uploaded"}
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".88rem",color:"var(--text-muted)"}}>Highlights</span>
                <span style={{fontSize:".88rem",fontWeight:600,color:match.highlight_url?"#10b981":"#94a3b8"}}>
                  {match.highlight_url?"✓ Generated":"Not generated"}
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".88rem",color:"var(--text-muted)"}}>Transcript</span>
                <span style={{fontSize:".88rem",fontWeight:600,color:match.transcript?"#10b981":"#94a3b8"}}>
                  {match.transcript?"✓ Available":"Not available"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="matches-form-card">
            <h2 className="matches-form-card-title">Quick Actions</h2>
            <div className="matches-quick-actions-panel">
              <button className="matches-btn-outline" onClick={()=>navigate(`/matches`)}>
                ← Back to Match List
              </button>
              <button className="matches-btn-outline" onClick={()=>navigate(`/matches/${matchId}`)}>
                📋 View Match Details
              </button>
              {events.length > 0 && (
                <button
                  className="matches-btn-blue"
                  onClick={()=>{setActiveTab("timeline");if(events[0])handleEventClick(events[0]);}}
                >
                  ▶ Play from First Event
                </button>
              )}
              {match.highlight_url && (
                <button className="matches-btn-orange" onClick={()=>setActiveTab("highlights")}>
                  🎬 View Highlight Reel
                </button>
              )}
            </div>
          </div>

          {/* Recent Events Mini-list */}
          {events.length > 0 && (
            <div className="matches-form-card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h2 className="matches-form-card-title" style={{border:"none",paddingBottom:0,margin:0}}>Recent Events</h2>
                <button style={{background:"none",border:"none",color:"#3b82f6",fontSize:".82rem",cursor:"pointer",fontWeight:600}} onClick={()=>setActiveTab("timeline")}>
                  View all →
                </button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {events.slice(0,6).map((ev)=>(
                  <div
                    key={ev.event_id}
                    onClick={()=>handleEventClick(ev)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:"rgba(2,6,17,.4)",border:"1px solid rgba(255,255,255,.05)",transition:"background .15s"}}
                    onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                    onMouseLeave={(e)=>e.currentTarget.style.background="rgba(2,6,17,.4)"}
                  >
                    <span style={{fontFamily:"monospace",fontSize:".78rem",color:"#f59e0b",fontWeight:700,minWidth:38}}>
                      {fmtTime(ev.timestamp_sec)}
                    </span>
                    <EventTypeBadge type={ev.event_type}/>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:"auto",flexShrink:0}}>
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
