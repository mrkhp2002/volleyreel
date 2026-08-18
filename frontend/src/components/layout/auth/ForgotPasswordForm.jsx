import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      // Placeholder until backend reset endpoint is available.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess(
        "If an account exists for this email, you will receive a password reset link shortly."
      );
      setEmail("");
    } catch {
      setError("Unable to send reset link right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <p>Enter your email address and we&apos;ll send you a password reset link</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="reset-email">Email Address</label>
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
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="auth-back-link">
        <Link to="/login">← Back to Sign In</Link>
      </p>
    </div>
  );
}
