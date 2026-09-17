import React from "react";
import { User, Phone, Mail, Tag, Share2, Building2, MapPin, Edit3 } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const LeadInformation = ({ lead, onEditClick }) => {
  return (
    <div className="crm-card detail-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <User size={18} className="text-indigo" /> Lead Information
        </h3>
        <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={onEditClick}>
          <Edit3 size={14} /> Edit Information
        </button>
      </div>

      <div className="detail-grid">
        <div className="info-item">
          <span className="info-label">Full Name</span>
          <span className="info-value font-bold">{lead.name}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Mobile Number</span>
          <div className="info-value-row">
            <Phone size={14} className="text-muted" />
            <span>{lead.phone}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Email Address</span>
          <div className="info-value-row">
            <Mail size={14} className="text-muted" />
            <span>{lead.email}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Lead Category / Type</span>
          <span className="type-pill-sm">{lead.leadType}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Lead Source</span>
          <div className="info-value-row">
            <Share2 size={14} className="text-muted" />
            <span>{lead.source}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Company / Organization</span>
          <div className="info-value-row">
            <Building2 size={14} className="text-muted" />
            <span>{lead.company}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Location</span>
          <div className="info-value-row">
            <MapPin size={14} className="text-muted" />
            <span>{lead.location || "Mumbai, Maharashtra"}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Current Pipeline Status</span>
          <Badge status={lead.status} />
        </div>
      </div>
    </div>
  );
};
