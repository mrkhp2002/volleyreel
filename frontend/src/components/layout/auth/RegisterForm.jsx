import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import useAuth from "../../../hooks/useAuth";

const initialForm = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      return "Please complete all required fields.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!form.acceptedTerms) {
      return "Please agree to the Terms of Service and Privacy Policy.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });

      // Automatically sign in the user and redirect to dashboard
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (loginRes.data && loginRes.data.access_token) {
        login({
          email: loginRes.data.email || form.email,
          fullName: loginRes.data.full_name || form.fullName,
          token: loginRes.data.access_token,
        });
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create account right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p>Set up your account to start managing tournaments, teams, and matches</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={form.fullName}
            disabled={loading}
            onChange={(e) => setField("fullName", e.target.value)}
          />
        </div>

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
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        <label htmlFor="role">Role</label>
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
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <input
            id="role"
            type="text"
            placeholder="Coach, Analyst, Organizer"
            value={form.role}
            disabled={loading}
            onChange={(e) => setField("role", e.target.value)}
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
            placeholder="At least 8 characters"
            value={form.password}
            disabled={loading}
            onChange={(e) => setField("password", e.target.value)}
          />
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
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
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            disabled={loading}
            onChange={(e) => setField("confirmPassword", e.target.value)}
          />
        </div>

        <label className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            disabled={loading}
            onChange={(e) => setField("acceptedTerms", e.target.checked)}
          />
          <span>
            I agree to the <a href="#!">Terms of Service</a> and <a href="#!">Privacy Policy</a>
          </span>
        </label>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-switch-text">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
