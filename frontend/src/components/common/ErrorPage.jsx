import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, LayoutDashboard, RotateCcw, Info, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./ErrorPage.css";

export const ErrorPage = ({
  error = null,
  onReset = null,
  is404 = false,
  customTitle = null,
  customMessage = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine if user should be redirected to admin or sales dashboard
  const isSalesSection =
    location.pathname.startsWith("/sales") || user?.role === "SALES_REPRESENTATIVE";
  const dashboardPath = isSalesSection ? "/sales/dashboard" : "/admin/dashboard";
  const dashboardLabel = isSalesSection ? "Go to Sales Dashboard" : "Go to Dashboard";

  const handleGoDashboard = () => {
    if (onReset) onReset();
    navigate(dashboardPath);
  };

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const title =
    customTitle || (is404 ? "Page Not Found (404)" : "Oops! Something Went Wrong");
  const message =
    customMessage ||
    (is404
      ? "The page you are looking for does not exist or might have been moved."
      : "We encountered an unexpected issue while loading this section. Don't worry, your data is safe and untouched.");

  return (
    <div className="error-page-container">
      <div className="error-card-wrapper">
        <div className="error-icon-halo">
          <AlertTriangle size={38} />
        </div>

        <h2 className="error-title-main">{title}</h2>
        <p className="error-desc-text">{message}</p>

        <div className="error-suggestion-box">
          <Info size={18} color="#ff3b19" style={{ flexShrink: 0 }} />
          <span>
            We suggest returning to your <strong>Dashboard</strong> to navigate smoothly to active modules.
          </span>
        </div>

        <div className="error-actions-row">
          <button
            type="button"
            className="error-btn-primary"
            onClick={handleGoDashboard}
          >
            <LayoutDashboard size={17} /> {dashboardLabel}
          </button>

          <button
            type="button"
            className="error-btn-secondary"
            onClick={handleReload}
          >
            <RotateCcw size={16} /> Reload Page
          </button>
        </div>

        {error && error.message && (
          <details className="error-details-accordion">
            <summary className="error-details-summary">Technical details (click to expand)</summary>
            <div className="error-stack-preview">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
