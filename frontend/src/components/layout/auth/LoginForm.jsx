import { useState } from "react";
import API from "../../services/apiClient";

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-card">
      <h2>Sign In</h2>
      <p>Access your volleyball analytics dashboard</p>

      <form onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <div className="login-options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <span className="link">Forgot Password?</span>
        </div>

        <button className="btn-primary">Sign In</button>
      </form>

      <p className="signup-text">
        Don’t have an account? <span className="link">Sign Up</span>
      </p>
    </div>
  );
}