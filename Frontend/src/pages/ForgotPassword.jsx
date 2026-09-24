import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>Salon OS</h1>
          <p>Every client, every formula, every stylist — one record.</p>
        </div>

        <div className="login-form-panel">
          <h2>Reset your password</h2>

          {submitted ? (
            <p className="login-subtitle">
              If that email is registered, a reset link has been sent. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="login-subtitle">Enter your email to receive a reset link</p>

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

              <button type="submit">Send reset link</button>
            </form>
          )}

          <Link to="/login" className="forgot-link" style={{ marginTop: "16px" }}>
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;