import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { LeadSummary } from "./components/LeadSummary";
import { LeadPipeline } from "./components/LeadPipeline";
import { LeadInformation } from "./components/LeadInformation";
import { LeadAssignment } from "./components/LeadAssignment";
import { LeadFollowUp } from "./components/LeadFollowUp";
import { LeadNotes } from "./components/LeadNotes";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { ReassignModal } from "./components/ReassignModal";
import { ScheduleFollowupModal } from "./components/ScheduleFollowupModal";
import { ChangeStatusModal } from "./components/ChangeStatusModal";
import { DeleteLeadModal } from "./components/DeleteLeadModal";
import { UpdateLeadModal } from "../Leads/components/UpdateLeadModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { leadsApi } from "../../../../api/leadsApi";
import { followupsApi } from "../../../../api/followupsApi";
import { sourcesApi } from "../../../../api/sourcesApi";
import { categoriesApi } from "../../../../api/categoriesApi";
import { usersApi } from "../../../../api/usersApi";
import { adaptLead } from "../../../../utils/leadAdapter";
import "./LeadDetails.css";

const ACTION_TYPE_MAP = {
  LEAD_CREATED: "created",
  LEAD_ASSIGNED: "assignment",
  LEAD_REASSIGNED: "assignment",
  STATUS_CHANGED: "status_change",
  STAGE_CHANGED: "status_change",
  FOLLOWUP_CREATED: "followup",
  FOLLOWUP_COMPLETED: "followup",
  FOLLOWUP_CANCELLED: "followup",
  NOTE_UPDATED: "note",
  NOTE_ADDED: "note",
};

const formatTimestamp = (dateStr) =>
  new Date(dateStr).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const adaptActivity = (a) => ({
  id: a._id,
  type: ACTION_TYPE_MAP[a.actionType] || "other",
  title: a.title,
  description: a.description,
  user: a.userId?.name || "System",
  timestamp: formatTimestamp(a.createdAt),
});

// Lead.notes (backend/src/models/Lead.model.js) is a single free-text field, not a list.
// "Adding a note" appends a delimited, timestamped entry so the UI can still show a list.
const NOTE_SEP = "\n---\n";
const parseNotes = (notesStr) => {
  if (!notesStr) return [];
  return notesStr.split(NOTE_SEP).filter(Boolean).map((entry, idx) => {
    const match = entry.match(/^\[(.+?)\]\s(.+?):\s([\s\S]*)$/);
    if (match) {
      return { id: `n-${idx}`, timestamp: match[1], author: match[2], content: match[3] };
    }
    return { id: `n-${idx}`, timestamp: "", author: "", content: entry };
  });
};

export const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activities, setActivities] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salespeople, setSalespeople] = useState([]);

  const [activeModal, setActiveModal] = useState(null); // null | "reassign" | "schedule" | "change_status" | "delete"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  const fetchLead = useCallback(() => {
    if (!leadId) return Promise.resolve();
    setIsLoading(true);
    return leadsApi
      .getById(leadId)
      .then((data) => {
        setLead(adaptLead(data.lead));
        setLoadError("");
      })
      .catch((err) => setLoadError(err.message || "Failed to load lead."))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  const fetchActivities = useCallback(() => {
    if (!leadId) return;
    leadsApi
      .getActivities(leadId, { limit: 50 })
      .then((data) => setActivities((data.activities || []).map(adaptActivity)))
      .catch(() => {});
  }, [leadId]);

  const fetchFollowUps = useCallback(() => {
    if (!leadId) return;
    followupsApi
      .getForLead(leadId)
      .then((data) => setFollowUps(data || []))
      .catch(() => {});
  }, [leadId]);

  useEffect(() => {
    fetchLead();
    fetchActivities();
    fetchFollowUps();
    sourcesApi.getAll().then((data) => setSources(data || [])).catch(() => {});
    categoriesApi.getAll().then((data) => setCategories(data || [])).catch(() => {});
    usersApi.getSalespeople().then((data) => setSalespeople(data.users || [])).catch(() => {});
  }, [fetchLead, fetchActivities, fetchFollowUps]);

  const moreActionsRef = useRef(null);

  if (isLoading) {
    return (
      <div className="lead-details-page" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Loader2 size={24} className="spin-icon" />
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="lead-details-page" style={{ padding: 24 }}>
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "14px 18px", borderRadius: 10 }}>
          {loadError || "Lead not found."}
        </div>
        <button className="crm-btn crm-btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate("/admin/leads")}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
      </div>
    );
  }

  const notesList = parseNotes(lead.notes);
  const nextFollowUp = followUps.find((f) => f.status === "Pending");
  const followupForCard = nextFollowUp
    ? {
        type: nextFollowUp.type,
        date: new Date(nextFollowUp.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        time: new Date(nextFollowUp.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        notes: nextFollowUp.notes,
      }
    : null;

  // Handler: Status change (via the horizontal pipeline bar or Change Status modal)
  const handleStatusChange = (newStatus) => {
    leadsApi
      .update(lead.id, { status: newStatus })
      .then((updated) => {
        setLead(adaptLead(updated));
        setActiveModal(null);
        fetchActivities();
        showToast(`Status changed to '${newStatus}'.`);
      })
      .catch((err) => showToast(err.message || "Failed to change status."));
  };

  // Handler: Reassign Salesperson
  const handleConfirmReassign = (newRepId) => {
    if (!newRepId) return;
    leadsApi
      .assign(lead.id, newRepId)
      .then((data) => {
        setLead(adaptLead(data.lead));
        setActiveModal(null);
        fetchActivities();
        showToast("Lead reassigned successfully.");
      })
      .catch((err) => showToast(err.message || "Failed to reassign lead."));
  };

  // Handler: Schedule Follow-up
  const handleConfirmFollowup = (followup) => {
    const scheduledAt = new Date(`${followup.date}T${followup.time}`);
    followupsApi
      .create({
        leadId: lead.id,
        assignedTo: lead.assignedTo,
        type: followup.type,
        scheduledAt: scheduledAt.toISOString(),
        notes: followup.notes,
      })
      .then(() => {
        setActiveModal(null);
        fetchFollowUps();
        fetchActivities();
        fetchLead();
        showToast("Follow-up scheduled successfully.");
      })
      .catch((err) => showToast(err.message || "Failed to schedule follow-up."));
  };

  // Handler: Add Note (appended into Lead.notes - see parseNotes() above)
  const handleAddNote = (text) => {
    const entry = `[${formatTimestamp(new Date())}] Admin: ${text}`;
    const newNotes = lead.notes ? `${entry}${NOTE_SEP}${lead.notes}` : entry;
    leadsApi
      .update(lead.id, { notes: newNotes })
      .then((updated) => {
        setLead(adaptLead(updated));
        fetchActivities();
      })
      .catch((err) => showToast(err.message || "Failed to add note."));
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = () => {
    leadsApi
      .remove(lead.id)
      .then(() => navigate("/admin/leads"))
      .catch((err) => showToast(err.message || "Failed to delete lead."));
  };

  // Handler: Save edited lead info (reuses the same real UpdateLeadModal as the Leads list page)
  const handleSaveLead = ({ id, ...payload }) => {
    leadsApi
      .update(id, payload)
      .then((updated) => {
        setLead(adaptLead(updated));
        fetchActivities();
        setIsEditModalOpen(false);
        showToast("Lead details updated successfully!");
      })
      .catch((err) => showToast(err.message || "Failed to update lead."));
  };

  return (
    <div className="lead-details-page">
      {/* Toast Feedback */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Edit Lead Details (real, same modal used on the Leads list page) */}
      <UpdateLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        targetLead={lead}
        onUpdateLead={handleSaveLead}
        sources={sources}
        salespeople={salespeople}
        categories={categories}
      />

      {/* Modals */}
      <ReassignModal
        isOpen={activeModal === "reassign"}
        onClose={() => setActiveModal(null)}
        currentAssignedTo={lead.assignedTo}
        onConfirm={handleConfirmReassign}
        salespeople={salespeople}
      />

      <ScheduleFollowupModal
        isOpen={activeModal === "schedule"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirmFollowup}
      />

      <ChangeStatusModal
        isOpen={activeModal === "change_status"}
        onClose={() => setActiveModal(null)}
        currentStatus={lead.status}
        onConfirm={handleStatusChange}
      />

      <DeleteLeadModal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirmDelete}
        leadName={lead.name}
      />

      {/* Top Header Actions Bar */}
      <div className="details-header-actions-bar">
        <button className="crm-btn crm-btn-secondary btn-back" onClick={() => navigate("/admin/leads")}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
        <button className="crm-btn crm-btn-secondary" style={{ borderColor: "#fecdd3", color: "#dc2626" }} onClick={() => setActiveModal("delete")}>
          Delete Lead
        </button>
      </div>

      {/* 1. Top Lead Identity Summary Card */}
      <LeadSummary lead={lead} />

      {/* 2. Horizontal Lead Progress Pipeline Bar */}
      <LeadPipeline
        currentStatus={lead.status}
        onStatusChange={handleStatusChange}
      />

      {/* 3. Main Workspace Grid Layout (Two Column) */}
      <div className="details-workspace-grid">
        {/* Left Column (Main ~60%) */}
        <div className="workspace-column-left">
          <LeadInformation
            lead={lead}
            onEditClick={() => setIsEditModalOpen(true)}
          />

          <LeadNotes
            notesList={notesList}
            onAddNote={handleAddNote}
          />

          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column (Side ~40%) */}
        <div className="workspace-column-right">
          <LeadAssignment
            lead={lead}
            onReassignClick={() => setActiveModal("reassign")}
          />

          <LeadFollowUp
            followup={followupForCard}
            onScheduleClick={() => setActiveModal("schedule")}
          />
        </div>
      </div>
    </div>
  );
};
