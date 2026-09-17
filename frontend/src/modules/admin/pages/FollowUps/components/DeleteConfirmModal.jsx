import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, count = 1 }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Follow-up Record">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: "#fff1f2",
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
              Delete {count > 1 ? `${count} selected follow-ups` : "this follow-up"}?
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "2px" }}>
              This action cannot be undone. The task record will be permanently removed.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="crm-btn crm-btn-primary"
            style={{ backgroundColor: "#e11d48" }}
            onClick={onConfirm}
          >
            <Trash2 size={15} /> Delete {count > 1 ? "Follow-ups" : "Follow-up"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
