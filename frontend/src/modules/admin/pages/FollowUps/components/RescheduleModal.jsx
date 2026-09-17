import React, { useState, useEffect } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const RescheduleModal = ({ isOpen, onClose, targetFollowup, onConfirm }) => {
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (targetFollowup) {
      setStatus(targetFollowup.status || "Pending");
    }
  }, [targetFollowup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetFollowup) return;

    // Only status is changed, all other details remain unchanged
    onConfirm({
      ...targetFollowup,
      status: status,
      dateLabel: status === "Completed" ? "Completed" : targetFollowup.dateLabel,
    });
  };

  if (!targetFollowup) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Follow-up Status">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Read-Only Lead Details Banner */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                Lead Details (Read-only)
              </span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={12} /> Non-editable
              </span>
            </div>
            <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
              {targetFollowup.leadName}
            </strong>
            <span style={{ fontSize: "0.825rem", color: "#475569" }}>
              {targetFollowup.company || "Direct Client"}
            </span>
          </div>

          {/* Read-Only Fields Grid: Assigned Salesperson & Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Assigned Sales Employee <Lock size={12} color="#94a3b8" />
              </label>
              <input
                type="text"
                className="crm-input"
                value={targetFollowup.assignedTo || "Unassigned"}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Activity Type <Lock size={12} color="#94a3b8" />
              </label>
              <input
                type="text"
                className="crm-input"
                value={targetFollowup.type || "Call"}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* Read-Only Date & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Scheduled Date <Lock size={12} color="#94a3b8" />
              </label>
              <input
                type="text"
                className="crm-input"
                value={targetFollowup.date || "-"}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                Scheduled Time <Lock size={12} color="#94a3b8" />
              </label>
              <input
                type="text"
                className="crm-input"
                value={targetFollowup.time || "-"}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* Read-Only Notes / Agenda */}
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              Follow-up Agenda / Notes <Lock size={12} color="#94a3b8" />
            </label>
            <textarea
              className="crm-input crm-textarea"
              rows={2}
              value={targetFollowup.notes || "No notes provided."}
              readOnly
              disabled
              style={{ backgroundColor: "#f8fafc", color: "#475569", resize: "none", cursor: "not-allowed" }}
            />
          </div>

          {/* Editable Follow-up Status Dropdown */}
          <div className="form-group" style={{ marginTop: "4px" }}>
            <label className="form-label" style={{ fontWeight: 700, color: "#0f172a" }}>
              Follow-up Status <span className="text-req">*</span>
            </label>
            <select
              name="status"
              className="crm-input select-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ fontWeight: 700, borderColor: "#ff3b19" }}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px", display: "block" }}>
              Admin can update follow-up status to Pending or Completed.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary" style={{ fontWeight: 700 }}>
              <CheckCircle2 size={16} /> Update Status
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
