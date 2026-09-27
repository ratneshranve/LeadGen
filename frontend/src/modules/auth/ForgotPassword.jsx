import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { authApi } from "../../api/authApi";
import "./Login.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
      setMessage(res.message || "Password reset instructions sent.");
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Failed to send reset instructions.");
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

        {!isSubmitted ? (
          <>
            <div className="login-heading-group">
              <h1 className="login-title">Reset your password</h1>
              <p className="login-subtitle">
                Enter your registered email address and we'll help you reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 12px", borderRadius: 8, fontSize: "0.82rem", marginBottom: 12 }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="resetEmail">Email Address *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    id="resetEmail"
                    type="email"
                    className="crm-input icon-padded"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="crm-btn crm-btn-primary btn-signin-submit"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 size={16} className="spin-icon" /> Sending Link...</> : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle2 size={42} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h2 className="login-title" style={{ fontSize: "1.25rem" }}>Check your inbox</h2>
            <p className="login-subtitle" style={{ margin: "8px 0 20px" }}>{message}</p>
            <Link to="/reset-password/mock-token" className="crm-btn crm-btn-subtle" style={{ width: "100%" }}>
              Proceed to Password Reset
            </Link>
          </div>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: "0.8rem", color: "var(--primary-600)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
