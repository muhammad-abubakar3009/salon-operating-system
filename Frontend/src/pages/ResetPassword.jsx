import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import "./Login.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Invalid reset link");
      return;
    }

    try {
      await apiClient.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || "Failed to reset password";
      setErrorMessage(message);
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
          <h2>Set a new password</h2>

          {success ? (
            <p className="login-subtitle">Password reset. Redirecting to login...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <p style={{ color: "var(--brick)", fontSize: "13px", marginBottom: "12px" }}>
                  {errorMessage}
                </p>
              )}

              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button type="submit">Reset password</button>
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

export default ResetPassword;