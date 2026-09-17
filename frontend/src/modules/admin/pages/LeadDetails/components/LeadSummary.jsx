import React from "react";
import { Phone, Mail, Building2, Calendar, UserCheck, Share2, Tag } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const LeadSummary = ({ lead }) => {
  const getInitials = (name) => {
    if (!name) return "LD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="crm-card lead-summary-card">
      <div className="summary-left">
        <div className="lead-avatar-xl">{getInitials(lead.name)}</div>
        <div className="lead-header-info">
          <div className="lead-title-row">
            <h2 className="lead-main-name">{lead.name}</h2>
            <Badge status={lead.status} />
          </div>

          <div className="lead-meta-row">
            <span className="meta-item">
              <Building2 size={14} className="text-muted" /> {lead.company}
            </span>
            <span className="meta-sep">•</span>
            <span className="type-badge">{lead.leadType}</span>
            <span className="meta-sep">•</span>
            <span className="source-meta">
              <Share2 size={13} className="text-muted" /> {lead.source}
            </span>
          </div>
        </div>
      </div>

      <div className="summary-right">
        <div className="contact-action-box">
          <a
            href={`tel:${lead.phone}`}
            className="contact-pill-btn"
            title="Call Lead"
            onClick={(e) => { e.preventDefault(); alert(`Dialing ${lead.phone}...`); }}
          >
            <Phone size={14} /> <span>{lead.phone}</span>
          </a>
          <a
            href={`mailto:${lead.email}`}
            className="contact-pill-btn"
            title="Email Lead"
            onClick={(e) => { e.preventDefault(); alert(`Opening mail client for ${lead.email}...`); }}
          >
            <Mail size={14} /> <span className="email-truncate">{lead.email}</span>
          </a>
        </div>

        <div className="summary-details-row">
          <div className="detail-compact-item">
            <UserCheck size={14} className="text-indigo" />
            <span>Assigned: <strong>{lead.salesperson}</strong></span>
          </div>
          <div className="detail-compact-item">
            <Calendar size={14} className="text-muted" />
            <span>Created: {lead.createdDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
