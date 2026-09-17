import React from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Users, CheckCircle2, TrendingUp, ExternalLink, ShieldCheck } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const SourceDetailsModal = ({ isOpen, onClose, source }) => {
  const navigate = useNavigate();

  if (!source) return null;

  const breakdown = [
    { label: "New", count: Math.round(source.leads * 0.25) || 3, color: "#ff3b19" },
    { label: "Contacted", count: Math.round(source.leads * 0.2) || 2, color: "#8b5cf6" },
    { label: "Follow-up", count: Math.round(source.leads * 0.2) || 2, color: "#eab308" },
    { label: "Interested", count: Math.round(source.leads * 0.15) || 1, color: "#06b6d4" },
    { label: "Converted", count: source.converted || 0, color: "#22c55e" },
    { label: "Lost", count: Math.round(source.leads * 0.05) || 0, color: "#ef4444" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lead Source Breakdown">
      <div className="source-details-modal-content">
        {/* Source Identity Header */}
        <div className="source-modal-header-banner">
          <div className="source-title-group">
            <h3 className="source-modal-name">{source.name}</h3>
            <span className="source-modal-type-chip">{source.type || "Advertising"}</span>
          </div>
          <span className={`status-badge-chip ${source.status === "Active" ? "status-active" : "status-inactive"}`}>
            <span className="status-dot" /> {source.status}
          </span>
        </div>

        <div className="dropdown-divider" style={{ margin: "14px 0" }} />

        {/* Top 4 Key Metrics */}
        <div className="source-modal-metrics-grid">
          <div className="source-metric-box">
            <span className="s-val">{source.leads}</span>
            <span className="s-lbl">Total Leads</span>
          </div>

          <div className="source-metric-box">
            <span className="s-val text-indigo">{source.activeLeads || Math.round(source.leads * 0.65)}</span>
            <span className="s-lbl">Active Pipeline</span>
          </div>

          <div className="source-metric-box">
            <span className="s-val text-emerald">{source.converted}</span>
            <span className="s-lbl">Converted</span>
          </div>

          <div className="source-metric-box">
            <span className="s-val text-emerald">{source.rate}%</span>
            <span className="s-lbl">Conversion Rate</span>
          </div>
        </div>

        {/* Lead Status Journey Breakdown */}
        <div className="lead-status-breakdown-section" style={{ marginTop: "16px" }}>
          <span className="info-lbl">Pipeline Stage Breakdown</span>

          <div className="stage-breakdown-cards-grid" style={{ marginTop: "8px" }}>
            {breakdown.map((st) => (
              <div key={st.label} className="stage-mini-box" style={{ borderLeftColor: st.color }}>
                <span className="st-lbl">{st.label}</span>
                <span className="st-val" style={{ color: st.color }}>{st.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action CTA Footer */}
        <div className="modal-actions-footer" style={{ marginTop: "20px" }}>
          <button className="crm-btn crm-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="crm-btn crm-btn-primary"
            onClick={() => {
              onClose();
              navigate(`/admin/leads?source=${encodeURIComponent(source.name)}`);
            }}
          >
            <ExternalLink size={15} /> View Leads in CRM
          </button>
        </div>
      </div>
    </Modal>
  );
};
