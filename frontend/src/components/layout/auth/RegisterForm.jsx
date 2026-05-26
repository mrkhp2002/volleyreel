import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";

const initialForm = {
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

export default function RegisterForm() {
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
      navigate("/login");
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
        <input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={form.fullName}
          disabled={loading}
          onChange={(e) => setField("fullName", e.target.value)}
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          disabled={loading}
          onChange={(e) => setField("email", e.target.value)}
        />

        <label htmlFor="role">Role</label>
        <input
          id="role"
          type="text"
          placeholder="Coach, Analyst, Organizer"
          value={form.role}
          disabled={loading}
          onChange={(e) => setField("role", e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          disabled={loading}
          onChange={(e) => setField("password", e.target.value)}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          disabled={loading}
          onChange={(e) => setField("confirmPassword", e.target.value)}
        />

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

        <button className="btn-primary auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-switch-text">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
