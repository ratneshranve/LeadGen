import React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const DiscardModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discard Unsaved Changes?">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#fff1f2",
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertCircle size={22} />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.4 }}>
            You have unsaved form changes. If you discard now, your entered lead details will be lost.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>
            Keep Editing
          </button>
          <button
            className="crm-btn crm-btn-primary"
            style={{ backgroundColor: "#e11d48" }}
            onClick={onConfirm}
          >
            Discard
          </button>
        </div>
      </div>
    </Modal>
  );
};
