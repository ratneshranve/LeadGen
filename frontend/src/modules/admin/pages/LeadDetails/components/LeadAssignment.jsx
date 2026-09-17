import React from "react";
import { UserCheck, Calendar, RefreshCw } from "lucide-react";

export const LeadAssignment = ({ lead, onReassignClick }) => {
  const getInitials = (name) => {
    if (!name) return "RM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="crm-card detail-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <UserCheck size={18} className="text-indigo" /> Assignment
        </h3>
        <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={onReassignClick}>
          <RefreshCw size={13} /> Reassign
        </button>
      </div>

      <div className="assignment-body">
        <div className="rep-profile-row">
          <div className="rep-avatar-lg">{getInitials(lead.salesperson)}</div>
          <div className="rep-info">
            <h4 className="rep-name-heading">{lead.salesperson}</h4>
            <span className="rep-role-badge">Sales Employee</span>
          </div>
        </div>

        <div className="assignment-meta-box">
          <div className="meta-line">
            <Calendar size={13} className="text-muted" />
            <span>Assigned on: <strong>{lead.createdDate || "Aug 25, 2026"}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
