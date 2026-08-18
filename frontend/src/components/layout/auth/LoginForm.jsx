import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import API from "../../../services/apiClient";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      // Backend expects OAuth2 form data (username, password) or JSON depending on handler.
      // Let's standardise the backend login to accept JSON with email/password.
      const res = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (res.data && res.data.access_token) {
        const userRole = (res.data.role || (form.email === "admin@volleyreel.com" ? "admin" : "coach")).toLowerCase();
        login({
          email: res.data.email || form.email,
          fullName: res.data.full_name || "",
          access_token: res.data.access_token,
          role: userRole,
          team_id: res.data.team_id || null,
          team_name: res.data.team_name || "",
        });

        if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else if (userRole === "player") {
          navigate("/profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid credentials returned from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.detail ||
        "Failed to sign in. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign In</h2>
      <p>Access your volleyball analytics dashboard</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            disabled={loading}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <label htmlFor="password">Password</label>
        <div className="input-group-wrapper">
          <svg
            className="input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            disabled={loading}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="auth-options-row">
          <label>
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="auth-switch-text">
        Don’t have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
}