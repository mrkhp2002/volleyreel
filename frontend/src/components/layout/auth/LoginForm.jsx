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
          token: res.data.access_token,
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

        <label htmlFor="password">Password</label>
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

        <div className="auth-options-row">
          <label>
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <span className="auth-link">Forgot Password?</span>
        </div>

        <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="auth-switch-text">
        Don’t have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
}