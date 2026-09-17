import React, { useState } from "react";
import { UserCheck } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { salespersonOptions } from "../../Leads/data/leadsMockData";

export const AssignLeadsModal = ({ isOpen, onClose, selectedCount, onConfirm }) => {
  const [selectedRep, setSelectedRep] = useState("");
  const [error, setError] = useState("");

  const reps = salespersonOptions.filter((r) => r !== "All");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRep) {
      setError("Please select a sales employee.");
      return;
    }
    setError("");
    onConfirm(selectedRep);
    setSelectedRep("");
  };

  const handleClose = () => {
    setError("");
    setSelectedRep("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Leads">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            padding: "10px 14px",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.825rem",
            color: "var(--text-main)"
          }}>
            <strong>{selectedCount} lead{selectedCount > 1 ? "s" : ""} selected</strong> for assignment.
          </div>

          <div className="form-group">
            <label className="form-label">
              Assign to Sales Employee <span className="text-req">*</span>
            </label>
            <select
              className={`crm-input select-input ${error ? "input-error" : ""}`}
              value={selectedRep}
              onChange={(e) => {
                setSelectedRep(e.target.value);
                if (e.target.value) setError("");
              }}
            >
              <option value="">-- Select Sales Employee --</option>
              {reps.map((rep) => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
            {error ? (
              <span className="error-text">{error}</span>
            ) : (
              <p className="helper-text">
                Selected leads will be assigned to the chosen sales employee.
              </p>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              <UserCheck size={15} /> Assign Leads
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
