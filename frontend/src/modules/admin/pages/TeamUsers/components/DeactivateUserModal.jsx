import React from "react";
import { AlertTriangle, UserX, ArrowRightLeft } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const DeactivateUserModal = ({
  isOpen,
  onClose,
  user,
  onConfirmDeactivate,
  onOpenReassign,
}) => {
  if (!user) return null;

  const hasLeads = user.assignedLeads > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate User Account">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
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
              Deactivate {user.name}?
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "4px" }}>
              This user will no longer be able to log into the CRM. Existing historical activities will remain intact.
            </p>
          </div>
        </div>

        {hasLeads && (
          <div style={{
            padding: "12px 14px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.825rem", fontWeight: 700, color: "#b45309" }}>
              <AlertTriangle size={15} /> Active Lead Allocation Warning
            </div>
            <p style={{ fontSize: "0.8rem", color: "#92400e", margin: 0 }}>
              This user currently has <strong>{user.assignedLeads} assigned leads</strong>. Would you like to reassign these leads before deactivating?
            </p>
            <button
              className="crm-btn crm-btn-secondary crm-btn-xs"
              style={{ alignSelf: "flex-start", marginTop: "4px" }}
              onClick={() => {
                onClose();
                onOpenReassign(user);
              }}
            >
              <ArrowRightLeft size={13} /> Reassign Leads Now
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="crm-btn crm-btn-primary"
            style={{ backgroundColor: "#e11d48" }}
            onClick={() => onConfirmDeactivate(user.id)}
          >
            <UserX size={15} /> Deactivate User
          </button>
        </div>
      </div>
    </Modal>
  );
};
