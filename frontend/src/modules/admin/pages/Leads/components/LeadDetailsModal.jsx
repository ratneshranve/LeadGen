import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Globe, Calendar, Building, UserX, UserCheck, ExternalLink } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { Badge } from "../../../../../components/ui/Badge";

export const LeadDetailsModal = ({ isOpen, onClose, lead }) => {
  const navigate = useNavigate();
  if (!isOpen || !lead) return null;

  const assignedName = lead.salesperson || "Unassigned";
  const isUnassigned = assignedName === "Unassigned";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Details" maxWidth="600px">
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Header Profile Summary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "14px",
            border: "1px solid #e2e8f0"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              fontWeight: 800,
              boxShadow: "0 4px 14px rgba(255, 59, 25, 0.35)"
            }}
          >
            {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {lead.name}
              </h3>
              <Badge status={lead.status || "New"} />
            </div>
            <p style={{ fontSize: "0.825rem", color: "#64748b", margin: "4px 0 0 0", fontWeight: 600 }}>
              {lead.company || "No Company Specified"} • Category: <span style={{ color: "#ff3b19" }}>{lead.category || lead.leadType || "SMB"}</span>
            </p>
          </div>
        </div>

        {/* Lead Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "0.85rem" }}>
          {/* Phone */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Phone size={13} color="#ff3b19" /> Phone Number
            </span>
            <strong style={{ color: "#0f172a", fontSize: "0.9rem" }}>{lead.phone || "N/A"}</strong>
          </div>

          {/* Email */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Mail size={13} color="#ff3b19" /> Email Address
            </span>
            <strong style={{ color: "#0f172a", fontSize: "0.9rem" }}>{lead.email || "N/A"}</strong>
          </div>

          {/* Source */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Globe size={13} color="#ff3b19" /> Lead Source
            </span>
            <span className="source-tag" style={{ display: "inline-block", marginTop: "2px" }}>{lead.source || "Website"}</span>
          </div>

          {/* Assigned Salesperson / Status */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              {isUnassigned ? <UserX size={13} color="#dc2626" /> : <UserCheck size={13} color="#16a34a" />} Assigned Employee Status
            </span>
            {isUnassigned ? (
              <span style={{ color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fecdd3", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, display: "inline-block" }}>
                Unassigned
              </span>
            ) : (
              <strong style={{ color: "#0f172a", fontSize: "0.9rem" }}>{assignedName}</strong>
            )}
          </div>

          {/* Company */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Building size={13} color="#ff3b19" /> Company / Organization
            </span>
            <strong style={{ color: "#0f172a" }}>{lead.company || "N/A"}</strong>
          </div>

          {/* Created Date */}
          <div style={{ padding: "12px 14px", backgroundColor: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Calendar size={13} color="#ff3b19" /> Created Date
            </span>
            <strong style={{ color: "#0f172a" }}>{lead.createdDate || "Aug 25, 2026"}</strong>
          </div>
        </div>

        {/* Footer: Close + link to the full details page (notes, activity timeline, follow-ups) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            className="crm-btn crm-btn-subtle"
            onClick={() => { onClose(); navigate(`/admin/leads/${lead.id}/edit`); }}
            style={{ padding: "8px 16px", fontWeight: 700, borderRadius: "8px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ExternalLink size={14} /> View Full Details
          </button>
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={onClose}
            style={{ padding: "8px 24px", fontWeight: 700, borderRadius: "8px", fontSize: "0.85rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
