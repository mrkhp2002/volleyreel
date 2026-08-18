import { createContext, useState, useEffect, useMemo } from "react";
import API from "../services/apiClient";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadRealNotifications() {
      try {
        const [tournamentsRes, matchesRes, teamsRes] = await Promise.all([
          API.get("/tournaments/").catch(() => ({ data: [] })),
          API.get("/matches/").catch(() => ({ data: [] })),
          API.get("/teams/").catch(() => ({ data: [] }))
        ]);

        const realTournaments = Array.isArray(tournamentsRes.data) ? tournamentsRes.data : [];
        const realMatches = Array.isArray(matchesRes.data) ? matchesRes.data : [];
        const realTeams = Array.isArray(teamsRes.data) ? teamsRes.data : [];

        const teamsMap = {};
        realTeams.forEach(t => { teamsMap[t.team_id] = t.name; });

        const realAlerts = [];

        // 1. Real Matches Notifications
        realMatches.forEach((m, idx) => {
          const homeName = teamsMap[m.home_team_id] || `Team #${m.home_team_id || "A"}`;
          const awayName = teamsMap[m.away_team_id] || `Team #${m.away_team_id || "B"}`;
          const matchLabel = `${homeName} vs ${awayName}`;

          if (m.highlight_url || m.status === "complete") {
            realAlerts.push({
              id: `match-vid-${m.match_id}`,
              title: "Highlight video completed",
              desc: `${matchLabel} highlight video ready for review`,
              time: `${(idx + 1) * 15}m ago`,
              timeAgo: `${(idx + 1) * 15}m ago`,
              category: "Videos",
              unread: true,
              link: "/matches/videos",
              iconColor: "#10b981"
            });
          } else {
            realAlerts.push({
              id: `match-ingest-${m.match_id}`,
              title: "Match video uploaded",
              desc: `Match #${m.match_id} (${matchLabel}) ingested for AI analysis`,
              time: `${(idx + 1) * 25}m ago`,
              timeAgo: `${(idx + 1) * 25}m ago`,
              category: "Ingestion",
              unread: true,
              link: "/matches",
              iconColor: "#3b82f6"
            });
          }
        });

        // 2. Real Tournaments Notifications
        realTournaments.forEach((t, idx) => {
          realAlerts.push({
            id: `tourn-rpt-${t.id}`,
            title: `${t.name} report published`,
            desc: `Tournament report and analytics ready`,
            time: `${(idx + 1)}h ago`,
            timeAgo: `${(idx + 1)}h ago`,
            category: "Reports",
            unread: false,
            link: "/reports/tournament",
            iconColor: "#8b5cf6"
          });

          realAlerts.push({
            id: `tourn-active-${t.id}`,
            title: `Tournament active`,
            desc: `${t.name} scheduled at ${t.location || 'Main Arena'}`,
            time: `${(idx + 2)}h ago`,
            timeAgo: `${(idx + 2)}h ago`,
            category: "Tournaments",
            unread: false,
            link: "/tournaments",
            iconColor: "#f59e0b"
          });
        });

        // 3. Real Teams Notifications
        realTeams.forEach((team, idx) => {
          realAlerts.push({
            id: `team-reg-${team.team_id}`,
            title: "New team registered",
            desc: `${team.name} roster registered in database`,
            time: `${idx + 1} day ago`,
            timeAgo: `${idx + 1} day ago`,
            category: "Teams",
            unread: false,
            link: "/teams",
            iconColor: "#3b82f6"
          });
        });

        // 4. Default Security Alert for current logged in session
        realAlerts.push({
          id: "sec-session-active",
          title: "Account session authenticated",
          desc: "Secure login session active from current device",
          time: "Just now",
          timeAgo: "Just now",
          category: "Security",
          unread: false,
          link: "/profile",
          iconColor: "#ef4444"
        });

        // Read state persisted in local storage
        let storedReadIds = [];
        try {
          const stored = localStorage.getItem("volleyreel_read_notifications");
          if (stored) storedReadIds = JSON.parse(stored);
        } catch (e) {}

        const finalAlerts = realAlerts.map(a => ({
          ...a,
          unread: storedReadIds.includes(a.id) ? false : a.unread
        }));

        setAlerts(finalAlerts);
        // Clear legacy notification cache to ensure data consistency
        localStorage.removeItem("volleyreel_notifications");
      } catch (err) {
        console.error("Error loading real notifications:", err);
      }
    }

    loadRealNotifications();
  }, []);

  const unreadCount = useMemo(() => alerts.filter((a) => a.unread).length, [alerts]);
  const totalCount = alerts.length;

  const handleMarkAsRead = (id) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, unread: false } : a));
      try {
        const readIds = updated.filter(a => !a.unread).map(a => a.id);
        localStorage.setItem("volleyreel_read_notifications", JSON.stringify(readIds));
      } catch (e) {}
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => {
      const updated = prev.map((a) => ({ ...a, unread: false }));
      try {
        const readIds = updated.map(a => a.id);
        localStorage.setItem("volleyreel_read_notifications", JSON.stringify(readIds));
      } catch (e) {}
      return updated;
    });
  };

  const handleDelete = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAll = () => {
    setAlerts([]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        alerts,
        unreadCount,
        totalCount,
        handleMarkAsRead,
        handleMarkAllRead,
        handleDelete,
        handleClearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
