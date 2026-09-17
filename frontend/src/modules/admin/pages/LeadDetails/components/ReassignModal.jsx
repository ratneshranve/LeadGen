import React, { useState } from "react";
import { UserCheck } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { salespersonOptions } from "../../Leads/data/leadsMockData";

export const ReassignModal = ({ isOpen, onClose, currentRep, onConfirm }) => {
  const [selectedRep, setSelectedRep] = useState(currentRep || "Amit Sharma");
  const reps = salespersonOptions.filter((r) => r !== "All");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedRep);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reassign Lead to Sales Employee">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Select the sales employee responsible for handling this lead and future follow-ups:
          </p>

          <div className="form-group">
            <label className="form-label">Sales Employee</label>
            <select
              className="crm-input select-input"
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
            >
              {reps.map((rep) => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              <UserCheck size={15} /> Confirm Reassign
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
