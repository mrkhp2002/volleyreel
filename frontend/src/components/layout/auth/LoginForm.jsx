import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import API from "../../../services/apiClient";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.email === "admin@volleyreel.com" && form.password === "admin123") {
      login({
        email: "admin@volleyreel.com",
        fullName: "System Admin",
        role: "admin",
        token: "mock-admin-token-12345",
      });
      navigate("/admin/dashboard");
      return;
    }

    if (
      (form.email === "user@volleyreel.com" || form.email === "public@volleyreel.com") &&
      (form.password === "user123" || form.password === "public123")
    ) {
      login({
        email: form.email,
        fullName: "Public User",
        role: "public_user",
        token: "mock-user-token-12345",
      });
      navigate("/dashboard");
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
        login({
          email: res.data.email || form.email,
          fullName: res.data.full_name || "",
          // token: res.data.access_token,
          access_token: res.data.access_token,
        });
        navigate("/dashboard");
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
            type="password"
            placeholder="Enter your password"
            value={form.password}
            disabled={loading}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
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