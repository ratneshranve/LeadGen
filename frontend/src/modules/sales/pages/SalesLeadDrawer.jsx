import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  MapPin,
  UserCheck
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";

export const SalesLeadDrawer = ({ lead, isOpen, onClose }) => {
  const [noteText, setNoteText] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  if (!lead || !isOpen) return null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setToastMessage(`Note added for ${lead.name}`);
    setIsToastOpen(true);
    setNoteText("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lead Details — ${lead.name}`}>
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <div className="lead-drawer-container" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Drawer Header Banner */}
        <div className="drawer-header-summary" style={{ paddingBottom: "10px" }}>
          <div className="avatar-circle-lg">
            {lead.name ? lead.name.split(" ").map((n) => n[0]).join("") : "LD"}
          </div>
          <div className="drawer-title-group">
            <h3 className="drawer-lead-name" style={{ fontSize: "1.1rem", fontWeight: 800 }}>{lead.name}</h3>
            <span className="drawer-company">{lead.company || "Enterprise Account"}</span>
            <div className="drawer-badge-flex" style={{ marginTop: "4px" }}>
              <span className={`badge badge-${lead.status ? lead.status.toLowerCase().replace(/[^a-z]/g, "") : "new"}`}>
                {lead.status || "New"}
              </span>
              <span className="source-tag">{lead.source || "Google Ads"}</span>
              <span className="type-badge-sm">{lead.type || "Enterprise"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="drawer-quick-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href={`tel:${lead.phone}`} className="crm-btn crm-btn-secondary crm-btn-xs">
            <Phone size={14} className="text-emerald" /> Call
          </a>
          <a href={`https://wa.me/${lead.phone ? lead.phone.replace(/[^0-9]/g, "") : ""}`} target="_blank" rel="noreferrer" className="crm-btn crm-btn-secondary crm-btn-xs">
            <MessageSquare size={14} className="text-whatsapp" /> WhatsApp
          </a>
          <a href={`mailto:${lead.email}`} className="crm-btn crm-btn-secondary crm-btn-xs">
            <Mail size={14} className="text-indigo" /> Email
          </a>
          <button className="crm-btn crm-btn-secondary crm-btn-xs" onClick={() => alert(`Scheduling follow-up for ${lead.name}`)}>
            <Calendar size={14} className="text-amber" /> Schedule Follow-up
          </button>
        </div>

        {/* Details Grid */}
        <div className="drawer-details-grid" style={{ padding: "10px 12px", gap: "10px" }}>
          <div className="detail-item">
            <span className="lbl"><Phone size={12} /> Phone</span>
            <strong>{lead.phone || "+91 98765 43210"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><Mail size={12} /> Email</span>
            <strong>{lead.email || "client@company.com"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><MapPin size={12} /> Location</span>
            <strong>{lead.city || "Mumbai, India"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><UserCheck size={12} /> Assigned To</span>
            <strong>Amit Sharma</strong>
          </div>
        </div>

        {/* Notes Section (Notes List below Add Note removed as requested) */}
        <div className="drawer-notes-section" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h4 className="section-subtitle" style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>
            <FileText size={15} /> Notes & Discussion
          </h4>

          <form onSubmit={handleAddNote} className="note-input-form">
            <textarea
              className="crm-input note-textarea"
              placeholder="Add a new note or call summary..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              style={{ fontSize: "0.825rem", padding: "8px 10px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
              <button type="submit" className="crm-btn crm-btn-primary crm-btn-xs">
                Add Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
