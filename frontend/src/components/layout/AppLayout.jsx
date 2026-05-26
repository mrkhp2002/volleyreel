import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const SIDEBAR_STORAGE_KEY = "volleyreel-sidebar-collapsed";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [sidebarCollapsed]);

  return (
    <div className={`app-shell${sidebarCollapsed ? " app-shell--sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="main-content">
        <Topbar />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
