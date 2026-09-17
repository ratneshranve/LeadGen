import React, { useState } from "react";
import { ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const ReassignUserLeadsModal = ({
  isOpen,
  onClose,
  user,
  allUsers,
  onConfirmReassign,
}) => {
  if (!user) return null;

  const salesReps = allUsers.filter(
    (u) =>
      u.id !== user.id &&
      (u.role === "Sales Employee" || u.role === "Sales Representative" || u.role === "Sales Person" || u.role === "Sales Manager") &&
      u.status === "Active"
  );

  const [targetRepId, setTargetRepId] = useState(salesReps[0]?.id || "");

  const selectedRep = salesReps.find((r) => r.id === targetRepId) || salesReps[0];

  const currentCount = selectedRep ? selectedRep.assignedLeads || 0 : 0;
  const newCount = currentCount + user.assignedLeads;
  const isOverCapacity = newCount > 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetRepId) return;
    onConfirmReassign(user.id, targetRepId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reassign Leads">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Current User Overview */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              color: "var(--text-main)",
            }}
          >
            Reassigning <strong>{user.assignedLeads} leads</strong> currently assigned to{" "}
            <strong>{user.name}</strong> ({user.role}).
          </div>

          {/* Select New Sales Employee */}
          <div className="form-group">
            <label className="form-label">
              Select Destination Sales Employee *
            </label>
            <select
              className="crm-input select-input"
              value={targetRepId}
              onChange={(e) => setTargetRepId(e.target.value)}
            >
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name} (Current: {rep.assignedLeads}/50 leads)
                </option>
              ))}
            </select>
          </div>

          {/* Workload Preview Card */}
          {selectedRep && (
            <div
              style={{
                padding: "14px",
                backgroundColor: isOverCapacity ? "#fff1f2" : "#f0fdf4",
                border: `1px solid ${isOverCapacity ? "#fecdd3" : "#bbf7d0"}`,
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                }}
              >
                <span>{selectedRep.name}'s Workload Preview:</span>
                <span style={{ color: isOverCapacity ? "#e11d48" : "#16a34a" }}>
                  {currentCount}/50 → {newCount}/50 leads ({Math.round((newCount / 50) * 100)}%)
                </span>
              </div>

              {isOverCapacity && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.775rem",
                    color: "#e11d48",
                    marginTop: "2px",
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>Warning: Reassigning will exceed standard capacity (50 leads).</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              <ArrowRightLeft size={15} /> Confirm & Reassign Leads
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
