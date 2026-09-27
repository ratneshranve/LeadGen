import React, { useState, useEffect } from "react";
import { UserCheck } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

// salespeople: real backend list [{ _id, name }]. Emits the selected user's _id.
export const ReassignModal = ({ isOpen, onClose, currentAssignedTo, onConfirm, salespeople = [] }) => {
  const [selectedRep, setSelectedRep] = useState(currentAssignedTo || "");

  useEffect(() => {
    if (isOpen) setSelectedRep(currentAssignedTo || salespeople[0]?._id || "");
  }, [isOpen, currentAssignedTo, salespeople]);

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
              {salespeople.map((rep) => (
                <option key={rep._id} value={rep._id}>{rep.name}</option>
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
