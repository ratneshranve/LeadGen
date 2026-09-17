import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const DeleteSourceModal = ({ isOpen, onClose, source, onConfirmDelete }) => {
  if (!source) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Lead Source">
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
              Delete "{source.name}"?
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Are you sure you want to delete this source? Existing leads tagged with this source will remain in your CRM.
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
            onClick={() => onConfirmDelete(source.id)}
          >
            <Trash2 size={15} /> Delete Source
          </button>
        </div>
      </div>
    </Modal>
  );
};
