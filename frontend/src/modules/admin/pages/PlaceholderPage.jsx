import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="crm-card" style={{ padding: "40px 24px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "var(--primary-50)",
        color: "var(--primary-600)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px auto"
      }}>
        <Construction size={28} />
      </div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
        {title} Module
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
        {description || `The ${title} module interface will be built in the upcoming phase after final UI/UX approval.`}
      </p>
      <Link to="/admin/dashboard" className="crm-btn crm-btn-primary">
        <ArrowLeft size={16} /> Back to Admin Dashboard
      </Link>
    </div>
  );
};
