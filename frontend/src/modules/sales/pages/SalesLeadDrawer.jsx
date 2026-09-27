import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  MapPin,
  UserCheck,
  Sparkles,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";
import { leadsApi } from "../../../api/leadsApi";

export const SalesLeadDrawer = ({ lead, isOpen, onClose, onScheduleFollowUp }) => {
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // AI Assistant state (SOP section 29: AI suggests -> rep reviews -> rep sends)
  const [aiDraft, setAiDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiError, setAiError] = useState("");

  if (!lead || !isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    leadsApi
      .addInteraction(lead.id, { channel: "note", note: noteText.trim() })
      .then(() => {
        showToast(`Note added for ${lead.name}`);
        setNoteText("");
      })
      .catch((err) => showToast(err.message || "Failed to add note."))
      .finally(() => setIsSavingNote(false));
  };

  const handleGenerateDraft = () => {
    setIsDrafting(true);
    setAiError("");
    leadsApi
      .generateAiDraft(lead.id)
      .then((data) => setAiDraft(data.draft))
      .catch((err) => setAiError(err.message || "AI drafting is unavailable right now."))
      .finally(() => setIsDrafting(false));
  };

  const handleApproveAndSend = () => {
    if (!aiDraft.trim()) return;
    setIsSavingNote(true);
    leadsApi
      .addInteraction(lead.id, { channel: "ai_draft_approved", note: aiDraft.trim() })
      .then(() => {
        showToast("Reply approved and logged as an interaction.");
        setAiDraft("");
      })
      .catch((err) => showToast(err.message || "Failed to save the approved reply."))
      .finally(() => setIsSavingNote(false));
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
            <span className="drawer-company">{lead.company || "Direct Prospect"}</span>
            <div className="drawer-badge-flex" style={{ marginTop: "4px" }}>
              <span className={`badge badge-${lead.status ? lead.status.toLowerCase().replace(/[^a-z]/g, "") : "new"}`}>
                {lead.status || "New"}
              </span>
              <span className="source-tag">{lead.source || "Unknown"}</span>
              {lead.score !== null && lead.score !== undefined && (
                <span className="type-badge-sm" title={`${lead.priority || ""} priority`}>
                  Score: {lead.score}/100
                </span>
              )}
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
          {onScheduleFollowUp && (
            <button className="crm-btn crm-btn-secondary crm-btn-xs" onClick={() => onScheduleFollowUp(lead)}>
              <Calendar size={14} className="text-amber" /> Schedule Follow-up
            </button>
          )}
        </div>

        {/* Details Grid */}
        <div className="drawer-details-grid" style={{ padding: "10px 12px", gap: "10px" }}>
          <div className="detail-item">
            <span className="lbl"><Phone size={12} /> Phone</span>
            <strong>{lead.phone || "N/A"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><Mail size={12} /> Email</span>
            <strong>{lead.email || "N/A"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><MapPin size={12} /> Company</span>
            <strong>{lead.company || "N/A"}</strong>
          </div>
          <div className="detail-item">
            <span className="lbl"><UserCheck size={12} /> Assigned To</span>
            <strong>{lead.salesperson || "Unassigned"}</strong>
          </div>
        </div>

        {/* AI Assistant Section (SOP section 28-30) */}
        <div className="drawer-notes-section" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h4 className="section-subtitle" style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={15} color="#9333ea" /> AI Response Assistant
          </h4>

          {!aiDraft && !isDrafting && (
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-xs"
              onClick={handleGenerateDraft}
              style={{ alignSelf: "flex-start" }}
            >
              <Sparkles size={13} /> Generate AI Draft
            </button>
          )}

          {isDrafting && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#64748b" }}>
              <Loader2 size={14} className="spin-icon" /> Drafting a reply based on this lead's requirement...
            </div>
          )}

          {aiError && (
            <div style={{ fontSize: "0.8rem", color: "#b91c1c", background: "#fef2f2", padding: "8px 10px", borderRadius: 8 }}>
              {aiError} You can still write a reply manually below.
            </div>
          )}

          {aiDraft && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <textarea
                className="crm-input note-textarea"
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
                rows={5}
                style={{ fontSize: "0.825rem", padding: "8px 10px", background: "#faf5ff", borderColor: "#e9d5ff" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="crm-btn crm-btn-secondary crm-btn-xs" onClick={handleGenerateDraft} disabled={isDrafting}>
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button type="button" className="crm-btn crm-btn-primary crm-btn-xs" onClick={handleApproveAndSend} disabled={isSavingNote}>
                  <Check size={12} /> Approve & Log as Sent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
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
              <button type="submit" className="crm-btn crm-btn-primary crm-btn-xs" disabled={isSavingNote}>
                {isSavingNote ? <Loader2 size={12} className="spin-icon" /> : "Add Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
