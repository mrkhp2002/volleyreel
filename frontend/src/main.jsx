import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import "./styles/global.css";

// Self-healing check for local storage
const keys = ["volleyreel_tournaments", "volleyreel_matches", "volleyreel_players", "volleyreel_notifications"];
keys.forEach(key => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        console.warn(`Local storage key ${key} was corrupt (not an array). Resetting.`);
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`Local storage key ${key} failed to parse. Resetting.`);
      localStorage.removeItem(key);
    }
  }
});


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </AuthProvider>
);