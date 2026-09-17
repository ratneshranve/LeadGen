import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Share2, Tag, UserCheck, Layers, Save, X, AlertCircle } from "lucide-react";
import { stages } from "./PipelineTable";

export const UpdatePipelineModal = ({ isOpen, onClose, lead, onUpdateStage }) => {
  const [selectedStage, setSelectedStage] = useState("New");

  useEffect(() => {
    if (isOpen && lead) {
      setSelectedStage(lead.status || lead.stage || "New");
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const assignedName = lead.salesperson || lead.assignedTo || "Unassigned";
  const isUnassigned = !assignedName || assignedName === "Unassigned";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUnassigned) return;
    onUpdateStage(lead.id, selectedStage);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "modalFadeIn 0.2s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #ff3b19 0%, #e63010 100%)",
            color: "#ffffff",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Update Pipeline Stage
              </h2>
              <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                Editing pipeline stage for {lead.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Unassigned Warning Alert Banner */}
            {isUnassigned && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "10px",
                  color: "#991b1b",
                  fontSize: "0.825rem",
                  fontWeight: 600
                }}
              >
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>
                  This lead is unassigned. Pipeline stage can only be changed after assigning the lead to a sales employee from the <strong>Assignments</strong> page.
                </span>
              </div>
            )}

            {/* Read-Only Lead Name */}
            <div className="form-group">
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                Full Name <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  type="text"
                  className="crm-input"
                  style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                  value={lead.name || ""}
                  readOnly
                />
              </div>
            </div>

            {/* Read-Only Phone & Email Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Phone Number <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Phone size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="crm-input"
                    style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                    value={lead.phone || "N/A"}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Email Address <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="crm-input"
                    style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                    value={lead.email || "N/A"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Read-Only Lead Source & Category Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Lead Source <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Share2 size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="crm-input"
                    style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                    value={lead.source || "Website"}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Lead Category <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Tag size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="crm-input"
                    style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                    value={lead.category || lead.leadType || "SMB"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Read-Only Assigned Employee */}
            <div className="form-group">
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                Assigned Sales Employee <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <UserCheck size={16} style={{ position: "absolute", left: "12px", color: isUnassigned ? "#ef4444" : "#94a3b8" }} />
                <input
                  type="text"
                  className="crm-input"
                  style={{
                    paddingLeft: "38px",
                    backgroundColor: isUnassigned ? "#fef2f2" : "#f1f5f9",
                    borderColor: isUnassigned ? "#fecdd3" : "#e2e8f0",
                    cursor: "default",
                    color: isUnassigned ? "#dc2626" : "#334155",
                    fontWeight: 700
                  }}
                  value={assignedName}
                  readOnly
                />
              </div>
            </div>

            {/* PIPELINE STAGE DROPDOWN (Editable for Assigned, Disabled for Unassigned) */}
            <div
              className="form-group"
              style={{
                marginTop: "4px",
                backgroundColor: isUnassigned ? "#f8fafc" : "#eff6ff",
                padding: "14px",
                borderRadius: "12px",
                border: `1px solid ${isUnassigned ? "#cbd5e1" : "#bfdbfe"}`
              }}
            >
              <label style={{ fontSize: "0.85rem", fontWeight: 800, color: isUnassigned ? "#71717a" : "#ff3b19", display: "block", marginBottom: "8px" }}>
                Pipeline Stage {isUnassigned ? <span style={{ fontSize: "0.725rem", color: "#dc2626" }}>(Disabled for Unassigned Lead)</span> : <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Layers size={18} style={{ position: "absolute", left: "12px", color: isUnassigned ? "#a1a1aa" : "#ff3b19" }} />
                <select
                  className="crm-input select-input"
                  style={{
                    paddingLeft: "38px",
                    height: "42px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    borderColor: isUnassigned ? "#ece7dc" : "#ff3b19",
                    backgroundColor: isUnassigned ? "#fbf9f4" : "#ffffff",
                    cursor: isUnassigned ? "not-allowed" : "pointer",
                    color: isUnassigned ? "#71717a" : "#141416"
                  }}
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  disabled={isUnassigned}
                >
                  {stages.map((st) => (
                    <option key={st.key} value={st.key}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              onClick={onClose}
              style={{ borderRadius: "10px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={isUnassigned}
              style={{
                borderRadius: "10px",
                padding: "8px 20px",
                fontWeight: 700,
                opacity: isUnassigned ? 0.55 : 1,
                cursor: isUnassigned ? "not-allowed" : "pointer"
              }}
            >
              <Save size={16} /> Update Pipeline Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
