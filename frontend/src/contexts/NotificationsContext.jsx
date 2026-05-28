import { createContext, useState, useEffect, useMemo } from "react";

export const NotificationsContext = createContext();

const initialAlerts = [
  {
    id: "n-1",
    title: "Match uploaded successfully",
    desc: "VM-2026-004 is ready for review",
    time: "2m ago",
    timeAgo: "2m ago",
    category: "Ingestion",
    unread: true,
    link: "/matches/upload?matchId=VM-2026-004",
    iconColor: "#3b82f6"
  },
  {
    id: "n-2",
    title: "Event review pending",
    desc: "VM-2026-002 requires manual review",
    time: "15m ago",
    timeAgo: "15m ago",
    category: "Ingestion",
    unread: true,
    link: "/matches/upload?matchId=VM-2026-002",
    iconColor: "#f59e0b"
  },
  {
    id: "n-3",
    title: "Highlight video completed",
    desc: "Thunder Strikers vs Ocean Waves",
    time: "1h ago",
    timeAgo: "1h ago",
    category: "Videos",
    unread: true,
    link: "/matches/videos",
    iconColor: "#10b981"
  },
  {
    id: "n-4",
    title: "Regional Cup report published",
    desc: "Tournament report available",
    time: "3h ago",
    timeAgo: "3h ago",
    category: "Reports",
    unread: false,
    link: "/reports/tournament",
    iconColor: "#8b5cf6"
  },
  {
    id: "n-5",
    title: "Password changed successfully",
    desc: "Your account credentials were updated from an IP in Colombo",
    time: "1 day ago",
    timeAgo: "1 day ago",
    category: "Security",
    unread: false,
    link: "/profile",
    iconColor: "#ef4444"
  },
  {
    id: "n-6",
    title: "New team registered",
    desc: "Eagle Spikers joined the Premier Division",
    time: "2 days ago",
    timeAgo: "2 days ago",
    category: "Teams",
    unread: false,
    link: "/teams",
    iconColor: "#3b82f6"
  },
  {
    id: "n-7",
    title: "Tournament registration deadline",
    desc: "Regional Cup entry closes in 24 hours",
    time: "3 days ago",
    timeAgo: "3 days ago",
    category: "Tournaments",
    unread: false,
    link: "/tournaments",
    iconColor: "#f59e0b"
  }
];

export const NotificationsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem("volleyreel_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading notifications from localStorage", e);
    }
    return initialAlerts;
  });

  useEffect(() => {
    localStorage.setItem("volleyreel_notifications", JSON.stringify(alerts));
  }, [alerts]);

  const unreadCount = useMemo(() => alerts.filter((a) => a.unread).length, [alerts]);
  const totalCount = alerts.length;

  const handleMarkAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
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
