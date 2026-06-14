import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import "../../styles/management.css";

// SVG Icons
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

export default function NotificationsPage() {
  const {
    alerts,
    unreadCount,
    totalCount,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDelete,
    handleClearAll
  } = useNotifications();
  const [filter, setFilter] = useState("All");

  const filteredAlerts = useMemo(() => {
    if (filter === "All") return alerts;
    if (filter === "Unread") return alerts.filter((a) => a.unread);
    return alerts.filter((a) => a.category === filter);
  }, [alerts, filter]);

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Main Header */}
      <header className="mgmt-header">
        <div>
          <h1>Notifications</h1>
          <p>View and manage all system logs, AI telemetry reports, and security alerts</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {unreadCount > 0 && (
            <button 
              type="button" 
              className="mgmt-btn mgmt-btn--outline"
              onClick={handleMarkAllRead}
            >
              <CheckIcon />
              Mark All as Read
            </button>
          )}
          {totalCount > 0 && (
            <button 
              type="button" 
              className="mgmt-btn mgmt-btn--danger-outline"
              onClick={handleClearAll}
            >
              <TrashIcon />
              Clear All
            </button>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="mgmt-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
        <div className="mgmt-stat-card">
          <span>Total Notifications</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Unread Feeds</span>
          <strong style={{ color: unreadCount > 0 ? "#3b82f6" : "inherit" }}>{unreadCount}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Active Systems Status</span>
          <strong style={{ color: "#10b981" }}>Operational</strong>
        </div>
      </div>

      {/* Filters Nav */}
      <div className="mgmt-tabs-nav">
        <button 
          onClick={() => setFilter("All")} 
          className={`mgmt-tab-btn ${filter === "All" ? "active" : ""}`}
        >
          All Alerts ({totalCount})
        </button>
        <button 
          onClick={() => setFilter("Unread")} 
          className={`mgmt-tab-btn ${filter === "Unread" ? "active" : ""}`}
        >
          Unread ({unreadCount})
        </button>
        <button 
          onClick={() => setFilter("Ingestion")} 
          className={`mgmt-tab-btn ${filter === "Ingestion" ? "active" : ""}`}
        >
          Ingestion Logs
        </button>
        <button 
          onClick={() => setFilter("Videos")} 
          className={`mgmt-tab-btn ${filter === "Videos" ? "active" : ""}`}
        >
          Highlight Updates
        </button>
        <button 
          onClick={() => setFilter("Reports")} 
          className={`mgmt-tab-btn ${filter === "Reports" ? "active" : ""}`}
        >
          Reports Published
        </button>
      </div>

      {/* Notifications listing card container */}
      <div className="mgmt-card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredAlerts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: alert.unread ? "rgba(59, 130, 246, 0.02)" : "transparent",
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                className="notify-page-item-row"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                  {/* Category circular icon indicator */}
                  <div 
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: `rgba(255,255,255,0.03)`,
                      border: `1px solid rgba(255,255,255,0.08)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: alert.iconColor,
                      boxShadow: `0 0 10px rgba(255,255,255,0.02)`,
                      flexShrink: 0
                    }}
                  >
                    <BellIcon />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Link 
                        to={alert.link} 
                        style={{ 
                          fontSize: "0.95rem", 
                          fontWeight: 700, 
                          color: "#ffffff",
                          textDecoration: "none"
                        }}
                        className="mgmt-table-link"
                      >
                        {alert.title}
                      </Link>
                      {alert.unread && (
                        <span 
                          style={{
                            background: "#3b82f6",
                            color: "#ffffff",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: "10px",
                            boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)"
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {alert.desc}
                    </span>
                    <span style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                      {alert.time} &bull; <span style={{ color: alert.iconColor, fontWeight: 600 }}>{alert.category}</span>
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", zIndex: 2 }}>
                  {alert.unread && (
                    <button 
                      type="button" 
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="mgmt-icon-btn"
                      title="Mark as Read"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <CheckIcon />
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => handleDelete(alert.id)}
                    className="mgmt-icon-btn mgmt-icon-btn--danger"
                    title="Delete Notification"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "48px", height: "48px", opacity: 0.3, marginBottom: "16px" }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3>No Notifications Found</h3>
            <p style={{ fontSize: "0.88rem", margin: "4px 0 0 0" }}>Your inbox is completely clear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
