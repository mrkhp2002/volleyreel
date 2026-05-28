import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const SIDEBAR_STORAGE_KEY = "volleyreel-sidebar-collapsed";

export default function AppLayout() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar drawer automatically on page transitions
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell app-shell--sidebar-collapsed">
      <Sidebar
        collapsed={!isHovered}
        onToggle={() => {}}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <div className="main-content">
        <Topbar onMobileToggle={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
