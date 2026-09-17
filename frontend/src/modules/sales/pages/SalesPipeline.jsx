import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ProfileEditCardModal } from "../../../components/common/ProfileEditCardModal";
import { Modal } from "../../../components/ui/Modal";
import {
  Phone,
  MessageSquare,
  ArrowRightLeft,
  Clock,
  Edit3,
  Check
} from "lucide-react";
import { SalesPagination } from "../../../components/common/SalesPagination";
import "./SalesPages.css";

// Stage Definitions with Labels, Keys, and Theme Colors
export const PIPELINE_STAGES = [
  { key: "New", label: "New", color: "#ff3b19", bg: "#fff1ee" },
  { key: "Contacted", label: "Contacted", color: "#8b5cf6", bg: "#f5f3ff" },
  { key: "Follow-up", label: "Follow-up", color: "#d97706", bg: "#fff9e6" },
  { key: "Interested", label: "Interested", color: "#059669", bg: "#ecfdf5" },
  { key: "Converted", label: "Converted", color: "#10b981", bg: "#ecfdf5" },
  { key: "Lost", label: "Lost", color: "#dc2626", bg: "#fef2f2" },
];

export const SalesPipeline = () => {
  const { user } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  const [activeStage, setActiveStage] = useState("New");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update Pipeline Stage Modal state
  const [updatingLead, setUpdatingLead] = useState(null);
  const [targetStage, setTargetStage] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Sales Representative Pipeline Dataset (Scoped to current salesperson)
  const [pipelineLeads, setPipelineLeads] = useState([
    { id: "pipe-1", name: "Rahul Sharma", company: "Rahul Traders", type: "Enterprise", source: "Meta Ads", stage: "New", status: "New", nextFollowUp: "Today, 4:00 PM", phone: "+91 98765 43210", assignedTo: currentSalesperson, lastActivity: "2 hours ago" },
    { id: "pipe-2", name: "Anand Verma", company: "Verma Tech", type: "SMB", source: "Website", stage: "New", status: "New", nextFollowUp: "Today, 5:30 PM", phone: "+91 98765 12121", assignedTo: currentSalesperson, lastActivity: "3 hours ago" },
    { id: "pipe-3", name: "Sunil Kapoor", company: "Kapoor Textiles", type: "SMB", source: "Google Ads", stage: "New", status: "New", nextFollowUp: "Sep 02, 10:00 AM", phone: "+91 98765 34343", assignedTo: currentSalesperson, lastActivity: "5 hours ago" },
    { id: "pipe-4", name: "Suresh Patel", company: "Patel Chemicals & Solvents", type: "SMB", source: "Google Ads", stage: "Contacted", status: "Contacted", nextFollowUp: "Today, 2:30 PM", phone: "+91 98765 11111", assignedTo: currentSalesperson, lastActivity: "Yesterday" },
    { id: "pipe-5", name: "Priya Verma", company: "Apex Logistics LLP", type: "Enterprise", source: "Google Ads", stage: "Contacted", status: "Contacted", nextFollowUp: "Sep 02, 11:30 AM", phone: "+91 98765 22222", assignedTo: currentSalesperson, lastActivity: "1 day ago" },
    { id: "pipe-6", name: "Amit Mehta", company: "Mehta Auto Corp", type: "Enterprise", source: "Website", stage: "Follow-up", status: "Follow-up", nextFollowUp: "Sep 03, 10:00 AM", phone: "+91 98765 33333", assignedTo: currentSalesperson, lastActivity: "2 days ago" },
    { id: "pipe-7", name: "Deepak Rao", company: "Rao Infotech", type: "SMB", source: "WhatsApp", stage: "Follow-up", status: "Follow-up", nextFollowUp: "Sep 03, 11:45 AM", phone: "+91 98765 56565", assignedTo: currentSalesperson, lastActivity: "2 days ago" },
    { id: "pipe-8", name: "Neha Singh", company: "Zenith Software Systems", type: "Enterprise", source: "WhatsApp", stage: "Interested", status: "Interested", nextFollowUp: "Sep 03, 3:00 PM", phone: "+91 98765 44444", assignedTo: currentSalesperson, lastActivity: "3 days ago" },
    { id: "pipe-9", name: "Karan Johar", company: "Johar Media", type: "Enterprise", source: "Referral", stage: "Interested", status: "Interested", nextFollowUp: "Sep 04, 02:00 PM", phone: "+91 98765 78787", assignedTo: currentSalesperson, lastActivity: "3 days ago" },
    { id: "pipe-10", name: "Rohit Kumar", company: "Kumar & Sons Retail", type: "SMB", source: "Referral", stage: "Converted", status: "Converted", nextFollowUp: "Completed", phone: "+91 98765 55555", assignedTo: currentSalesperson, lastActivity: "Aug 29, 2026" },
    { id: "pipe-11", name: "Vikas Jain", company: "Jain Steel Pvt Ltd", type: "SMB", source: "Manual Entry", stage: "Lost", status: "Lost", nextFollowUp: "-", phone: "+91 98765 66666", assignedTo: currentSalesperson, lastActivity: "Aug 25, 2026" },
  ]);

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleMoveStage = (leadId, newStage) => {
    setPipelineLeads((prev) =>
      prev.map((item) =>
        item.id === leadId ? { ...item, stage: newStage, status: newStage } : item
      )
    );
  };

  const handleOpenUpdateModal = (lead) => {
    setUpdatingLead(lead);
    setTargetStage(lead.stage || lead.status || "New");
    setIsUpdateModalOpen(true);
  };

  const handleApplyStage = () => {
    if (!updatingLead || !targetStage) return;
    handleMoveStage(updatingLead.id, targetStage);
    setIsUpdateModalOpen(false);
    setUpdatingLead(null);
  };

  const scopedLeads = pipelineLeads.filter(
    (l) => !l.assignedTo || l.assignedTo === currentSalesperson
  );

  const currentStageLeads = scopedLeads.filter(
    (l) => (l.stage || l.status || "New") === activeStage
  );

  // Pagination for Prospects (Fixed 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStage]);

  const paginatedStageLeads = currentStageLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="sales-page-container">
      {/* Profile / Details Modal - Unified across Sales panel */}
      <ProfileEditCardModal
        isOpen={isDrawerOpen && selectedLead !== null}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }}
        data={selectedLead}
        type="lead"
        onSave={(updatedLead) => {
          setPipelineLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
          );
        }}
      />

      {/* Update Pipeline Stage Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingLead(null);
        }}
        title="Update Pipeline Stage"
        maxWidth="440px"
      >
        {updatingLead && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Prospect Summary Info */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #27272a 0%, #141416 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0
              }}>
                {updatingLead.name ? updatingLead.name.split(" ").map(n => n[0]).join("") : "P"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                  {updatingLead.name}
                </h4>
                <span style={{ fontSize: "0.775rem", color: "#64748b" }}>
                  {updatingLead.company || "Direct Client"}
                </span>
              </div>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#e2e8f0",
                color: "#475569"
              }}>
                {updatingLead.type || "SMB"}
              </span>
            </div>

            {/* Select Stage Grid */}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "8px" }}>
                Select New Stage:
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {PIPELINE_STAGES.map((s) => {
                  const isSelected = targetStage === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setTargetStage(s.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #ff3b19" : "1px solid #ece7dc",
                        background: isSelected ? "#fff1ee" : "#ffffff",
                        color: isSelected ? "#ff3b19" : "#141416",
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "0.825rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: s.color,
                            flexShrink: 0
                          }}
                        />
                        <span>{s.label}</span>
                      </div>
                      {isSelected && <Check size={14} color="#ff3b19" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                className="crm-btn crm-btn-secondary"
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setUpdatingLead(null);
                }}
                style={{ height: "38px", padding: "0 16px", borderRadius: "8px", fontSize: "0.825rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-primary"
                onClick={handleApplyStage}
                style={{
                  height: "38px",
                  padding: "0 22px",
                  borderRadius: "8px",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)",
                  boxShadow: "0 4px 14px rgba(255, 59, 25, 0.28)"
                }}
              >
                <Check size={15} /> Apply
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Horizontal Stage Switcher Carousel with Proper Stage Names and Counts */}
      <div className="sales-pill-carousel" style={{ marginTop: "4px" }}>
        {PIPELINE_STAGES.map((st) => {
          const count = scopedLeads.filter(
            (l) => (l.stage || l.status || "New") === st.key
          ).length;

          return (
            <button
              key={st.key}
              type="button"
              className={`sales-filter-chip ${activeStage === st.key ? "active" : ""}`}
              onClick={() => setActiveStage(st.key)}
            >
              <span>{st.label}</span>
              <span className="sales-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Header Banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          {activeStage} Stage ({currentStageLeads.length})
        </h3>
        <span style={{ fontSize: "0.725rem", color: "#64748b" }}>
          Swipe pills to change stage
        </span>
      </div>

      {/* Stage Prospects List */}
      <div className="sales-lead-cards-list">
        {currentStageLeads.length > 0 ? (
          paginatedStageLeads.map((lead) => {
            const initials = lead.name
              ? lead.name.split(" ").map((n) => n[0]).join("")
              : "P";

            const currentLeadStage = lead.stage || lead.status || "New";
            const currentLeadStageObj = PIPELINE_STAGES.find((s) => s.key === currentLeadStage) || PIPELINE_STAGES[0];

            return (
              <div
                key={lead.id}
                className="sales-mobile-lead-card"
                onClick={() => handleOpenLead(lead)}
              >
                <div className="lead-card-header">
                  <div className="lead-card-avatar-group">
                    <div className="lead-card-avatar">
                      {initials}
                    </div>
                    <div className="lead-card-info">
                      <h4 className="lead-card-name">{lead.name}</h4>
                      <span className="lead-card-company">{lead.company || "Direct Client"}</span>
                    </div>
                  </div>

                  <span className="lead-card-meta-item" style={{ fontSize: "0.7rem" }}>
                    {lead.type || "SMB"}
                  </span>
                </div>

                <div className="lead-card-meta-row">
                  {lead.source && (
                    <span className="lead-card-meta-item">
                      {lead.source}
                    </span>
                  )}
                  {lead.nextFollowUp && lead.nextFollowUp !== "-" && (
                    <span className="lead-card-meta-item" style={{ background: "#fef3c7", color: "#b45309" }}>
                      <Clock size={11} /> {lead.nextFollowUp}
                    </span>
                  )}
                </div>

                {/* Stage Status and Edit Button Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#ffffff",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #fed7aa",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <ArrowRightLeft size={13} color="#64748b" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      Stage:
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: currentLeadStageObj.bg,
                        color: currentLeadStageObj.color,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: currentLeadStageObj.color,
                        }}
                      />
                      {currentLeadStageObj.label}
                    </span>
                  </div>

                  {/* Edit Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpdateModal(lead);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 11px",
                      background: "#ffffff",
                      border: "1px solid #ece7dc",
                      borderRadius: "8px",
                      color: "#ff3b19",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)"
                    }}
                    title="Change Stage"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="lead-card-actions">
                  <span style={{ fontSize: "0.725rem", color: "#94a3b8" }}>
                    Tap card for details
                  </span>

                  <div className="lead-card-action-btns">
                    {lead.phone && (
                      <>
                        <a
                          href={`tel:${lead.phone}`}
                          className="btn-mobile-call"
                          onClick={(e) => e.stopPropagation()}
                          title="Call Lead"
                        >
                          <Phone size={13} />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-mobile-wa"
                          onClick={(e) => e.stopPropagation()}
                          title="WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
              borderRadius: "16px",
              padding: "40px 20px",
              textAlign: "center",
              border: "1.5px dashed #fdba74"
            }}
          >
            <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>No prospects in {activeStage}</p>
            <span style={{ fontSize: "0.775rem", color: "#334155", fontWeight: 600 }}>
              Leads in this stage will appear here automatically.
            </span>
          </div>
        )}
      </div>

      {/* Responsive Pagination - Only < 1 2 > buttons */}
      <SalesPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        totalItems={currentStageLeads.length}
      />
    </div>
  );
};
