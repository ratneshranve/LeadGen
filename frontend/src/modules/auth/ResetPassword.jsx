import React, { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Layers, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { authApi } from "../../api/authApi";
import "./Login.css";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password, "admin@leadflow.com");
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="login-logo-box">
            <Layers size={24} color="#ffffff" />
          </div>
          <div className="login-brand-title">
            <span className="name">LeadGen</span>
            <span className="badge">CRM</span>
          </div>
        </div>

        {!isSuccess ? (
          <>
            <div className="login-heading-group">
              <h1 className="login-title">Set new password</h1>
              <p className="login-subtitle">
                Please enter a new password for your account.
              </p>
            </div>

            {error && (
              <div className="login-error-alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="newPass">New Password *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="newPass"
                    type={showPassword ? "text" : "password"}
                    className="crm-input icon-padded pass-padded"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPass">Confirm New Password *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    id="confirmPass"
                    type={showPassword ? "text" : "password"}
                    className="crm-input icon-padded"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="crm-btn crm-btn-primary btn-signin-submit"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 size={16} className="spin-icon" /> Resetting...</> : "Update Password"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle2 size={42} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Password Reset Complete</h2>
            <p className="login-subtitle" style={{ margin: "8px 0 20px" }}>
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <button className="crm-btn crm-btn-primary" style={{ width: "100%" }} onClick={() => navigate("/login")}>
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
