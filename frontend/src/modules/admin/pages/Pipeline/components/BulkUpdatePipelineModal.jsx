import React, { useState } from "react";
import { Layers, Save, X, Users } from "lucide-react";
import { stages } from "./PipelineTable";

export const BulkUpdatePipelineModal = ({ isOpen, onClose, selectedCount = 0, onBulkUpdateStage }) => {
  const [selectedStage, setSelectedStage] = useState("New");

  if (!isOpen || selectedCount === 0) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onBulkUpdateStage(selectedStage);
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
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "modalFadeIn 0.2s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
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
                Edit Pipeline Stage
              </h2>
              <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                Bulk update stage for assigned leads
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

        {/* Modal Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Selected Count Indicator Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                backgroundColor: "#fff1ee",
                border: "1px solid #ffd2c7",
                borderRadius: "12px",
                color: "#ff3b19"
              }}
            >
              <Users size={20} color="#ff3b19" />
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ff3b19", display: "block" }}>
                  Selected Assigned Leads
                </span>
                <strong style={{ fontSize: "0.95rem", color: "#141416" }}>
                  {selectedCount} assigned lead{selectedCount > 1 ? "s" : ""} selected
                </strong>
              </div>
            </div>

            {/* PIPELINE STAGE DROPDOWN SELECT */}
            <div className="form-group">
              <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#141416", display: "block", marginBottom: "8px" }}>
                Select New Pipeline Stage <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Layers size={18} style={{ position: "absolute", left: "12px", color: "#ff3b19" }} />
                <select
                  className="crm-input select-input"
                  style={{ paddingLeft: "38px", height: "44px", fontSize: "0.9rem", fontWeight: 700, borderColor: "#ff3b19" }}
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
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
              style={{ borderRadius: "10px", padding: "8px 20px", fontWeight: 700 }}
            >
              <Save size={16} /> Update Pipeline Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
