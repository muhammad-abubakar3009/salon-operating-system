import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid email or password");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>Salon OS</h1>
          <p>Every client, every formula, every stylist — one record.</p>
        </div>

        <form className="login-form-panel" onSubmit={handleLogin}>
          <h2>Sign in</h2>
          <p className="login-subtitle">Staff access only</p>

          {errorMessage && (
            <p style={{ color: "var(--brick)", fontSize: "13px", marginBottom: "12px" }}>
              {errorMessage}
            </p>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

          <button type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}

export default Login;