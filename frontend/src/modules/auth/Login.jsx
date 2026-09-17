import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      setIsLoading(false);
      navigate(result.redirectUrl);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Invalid email or password.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Unique Centered Logo (Text-free) */}
        <div className="login-brand-header-center">
          <div className="login-logo-box-centered">
            <Zap size={26} color="#ffffff" />
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading-group">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Validation Error Alert */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form without autofill */}
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                id="loginEmail"
                type="email"
                name="email"
                autoComplete="off"
                className="crm-input icon-padded"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label" htmlFor="loginPassword">Password *</label>
              <Link to="/forgot-password" className="forgot-pass-link">Forgot Password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                id="loginPassword"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className="crm-input icon-padded pass-padded"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                className="crm-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="crm-btn btn-signin-aqua"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>



        {/* Footer */}
        <footer className="login-footer">
          <p>© 2026 All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};
