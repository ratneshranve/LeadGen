import React, { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const ChangeStatusModal = ({ isOpen, onClose, currentStatus, onConfirm }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "New");

  const statuses = ["New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedStatus);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Lead Pipeline Status">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Select the new pipeline stage for this lead:
          </p>

          <div className="form-group">
            <label className="form-label">Pipeline Stage</label>
            <select
              className="crm-input select-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              <Check size={15} /> Update Status
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
