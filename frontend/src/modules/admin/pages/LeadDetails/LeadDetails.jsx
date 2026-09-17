import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit3,
  UserCheck,
  MoreVertical,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { initialLeadsData, getStoredLeads, saveStoredLeads } from "../Leads/data/leadsMockData";
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
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./LeadDetails.css";

export const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  // Find lead in stored leads or initial mock leads
  const storedList = getStoredLeads();
  const foundLead = storedList.find((l) => l.id === leadId) || initialLeadsData.find((l) => l.id === leadId);

  const defaultLead = foundLead || {
    id: leadId || "LD-1015",
    name: "Vikram Aditya",
    company: "Aditya Heavy Machinery",
    phone: "+91 97223 34455",
    email: "vikram@adityamachinery.co.in",
    source: "Manual Entry",
    status: "Lost",
    salesperson: "Rahul Mehta",
    salespersonAvatar: "RM",
    leadType: "Enterprise",
    followupDate: "No follow-up",
    createdDate: "Aug 25, 2026",
    location: "Mumbai, Maharashtra",
  };

  const [lead, setLead] = useState(defaultLead);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // null | "reassign" | "schedule" | "change_status" | "delete"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const moreActionsRef = useRef(null);

  // Close More Actions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock Lead Notes State
  const [notesList, setNotesList] = useState([
    {
      id: "n1",
      content: "Customer is evaluating multiple vendors. Requested a follow-up call next week.",
      author: "Rahul Mehta",
      timestamp: "Aug 28, 2026 · 04:20 PM",
    },
    {
      id: "n2",
      content: "Initial inquiry regarding heavy machinery automation components.",
      author: "System (Auto)",
      timestamp: "Aug 25, 2026 · 10:32 AM",
    },
  ]);

  // Mock Scheduled Follow-up State
  const [followupData, setFollowupData] = useState(
    lead.followupDate !== "No follow-up"
      ? {
          date: "2026-09-03",
          time: "14:30",
          type: "Call",
          notes: "Pricing negotiation and final timeline discussion.",
        }
      : null
  );

  // Mock Activity History Timeline State
  const [activities, setActivities] = useState([
    {
      id: "a6",
      type: "status_change",
      title: "Status Changed",
      description: "Status changed from Interested → Lost (Budget Mismatch)",
      user: "Rahul Mehta",
      timestamp: "Aug 31, 2026 · 05:45 PM",
    },
    {
      id: "a5",
      type: "note",
      title: "Note Added",
      description: '"Customer requested pricing discussion."',
      user: "Rahul Mehta",
      timestamp: "Aug 28, 2026 · 04:20 PM",
    },
    {
      id: "a4",
      type: "followup",
      title: "Follow-up Scheduled",
      description: "Call scheduled for Aug 28, 2026",
      user: "Rahul Mehta",
      timestamp: "Aug 27, 2026 · 03:10 PM",
    },
    {
      id: "a3",
      type: "status_change",
      title: "Status Changed",
      description: "Status changed from New → Contacted",
      user: "Rahul Mehta",
      timestamp: "Aug 26, 2026 · 11:20 AM",
    },
    {
      id: "a2",
      type: "assignment",
      title: "Lead Assigned",
      description: "Assigned to Rahul Mehta",
      user: "Rajesh Kumar (Admin)",
      timestamp: "Aug 25, 2026 · 10:35 AM",
    },
    {
      id: "a1",
      type: "created",
      title: "Lead Created",
      description: `${lead.name} was added as a new lead`,
      user: "System (Manual Entry)",
      timestamp: "Aug 25, 2026 · 10:32 AM",
    },
  ]);

  // Save / Update Lead Handler (Updates LeadDetails state, initialLeadsData array & LocalStorage)
  const handleSaveLead = (updatedLeadData) => {
    const newLeadObject = {
      ...lead,
      ...updatedLeadData,
      name: updatedLeadData.name || lead.name,
      company: updatedLeadData.company || lead.company,
      leadType: updatedLeadData.leadType || updatedLeadData.type || lead.leadType,
      type: updatedLeadData.leadType || updatedLeadData.type || lead.leadType,
      email: updatedLeadData.email || lead.email,
      phone: updatedLeadData.phone || lead.phone,
      source: updatedLeadData.source || lead.source,
      status: updatedLeadData.status || lead.status,
      salesperson: updatedLeadData.salesperson || updatedLeadData.assignedTo || lead.salesperson,
      assignedTo: updatedLeadData.salesperson || updatedLeadData.assignedTo || lead.salesperson,
      location: updatedLeadData.location || lead.location || "Mumbai, Maharashtra"
    };

    // 1. Update local component state
    setLead(newLeadObject);

    // 2. Persist in LocalStorage
    const currentStored = getStoredLeads();
    const updatedList = currentStored.map((l) =>
      l.id === newLeadObject.id ? { ...l, ...newLeadObject } : l
    );

    // If it wasn't in stored leads, push it
    if (!currentStored.some((l) => l.id === newLeadObject.id)) {
      updatedList.push(newLeadObject);
    }
    saveStoredLeads(updatedList);

    // 3. Mutate initialLeadsData in-place for instant everywhere visibility
    const mockIdx = initialLeadsData.findIndex((l) => l.id === newLeadObject.id);
    if (mockIdx !== -1) {
      initialLeadsData[mockIdx] = { ...initialLeadsData[mockIdx], ...newLeadObject };
    }

    // 4. Log Activity
    const newAct = {
      id: `a-${Date.now()}`,
      type: "note",
      title: "Lead Details Updated",
      description: `Lead info (Name: ${newLeadObject.name}, Category: ${newLeadObject.leadType}, Company: ${newLeadObject.company}) updated by Admin`,
      user: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);

    // 5. Toast Feedback
    setToastMessage(`Lead '${newLeadObject.name}' details updated successfully!`);
    setIsToastOpen(true);
    setIsEditModalOpen(false);
  };

  // Handler: Status change
  const handleStatusChange = (newStatus) => {
    const prevStatus = lead.status;
    const updated = { ...lead, status: newStatus };
    setLead(updated);

    // Persist
    const currentStored = getStoredLeads();
    const updatedList = currentStored.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l));
    saveStoredLeads(updatedList);

    setActiveModal(null);

    const newAct = {
      id: `a-${Date.now()}`,
      type: "status_change",
      title: "Status Changed",
      description: `Status changed from ${prevStatus} → ${newStatus}`,
      user: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handler: Reassign Salesperson
  const handleConfirmReassign = (newRep) => {
    const prevRep = lead.salesperson;
    const updated = { ...lead, salesperson: newRep, assignedTo: newRep };
    setLead(updated);

    // Persist
    const currentStored = getStoredLeads();
    const updatedList = currentStored.map((l) => (l.id === lead.id ? { ...l, salesperson: newRep, assignedTo: newRep } : l));
    saveStoredLeads(updatedList);

    setActiveModal(null);

    const newAct = {
      id: `a-${Date.now()}`,
      type: "assignment",
      title: "Lead Reassigned",
      description: `Reassigned from ${prevRep} to ${newRep}`,
      user: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handler: Schedule Follow-up
  const handleConfirmFollowup = (followup) => {
    setFollowupData(followup);
    setLead((prev) => ({ ...prev, followupDate: `${followup.date}, ${followup.time}` }));
    setActiveModal(null);

    const newAct = {
      id: `a-${Date.now()}`,
      type: "followup",
      title: "Follow-up Scheduled",
      description: `${followup.type} task scheduled for ${followup.date} at ${followup.time}`,
      user: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handler: Add Note
  const handleAddNote = (text) => {
    const newNote = {
      id: `n-${Date.now()}`,
      content: text,
      author: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setNotesList((prev) => [newNote, ...prev]);

    const newAct = {
      id: `a-${Date.now()}`,
      type: "note",
      title: "Note Added",
      description: `"${text}"`,
      user: "Rajesh Kumar (Admin)",
      timestamp: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Handler: Confirm Delete
  const handleConfirmDelete = () => {
    setActiveModal(null);
    const currentStored = getStoredLeads();
    const updatedList = currentStored.filter((l) => l.id !== lead.id);
    saveStoredLeads(updatedList);
    navigate("/admin/leads");
  };

  return (
    <div className="lead-details-page">
      {/* Toast Feedback */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Interactive Edit Lead Details Modal */}
      <ProfileEditCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={lead}
        type="lead"
        onSave={handleSaveLead}
        onDelete={handleConfirmDelete}
      />

      {/* Modals */}
      <ReassignModal
        isOpen={activeModal === "reassign"}
        onClose={() => setActiveModal(null)}
        currentRep={lead.salesperson}
        onConfirm={handleConfirmReassign}
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
          {/* Read-only Lead Information with Interactive Edit Action */}
          <LeadInformation
            lead={lead}
            onEditClick={() => setIsEditModalOpen(true)}
          />

          {/* Lead Notes Section */}
          <LeadNotes
            notesList={notesList}
            onAddNote={handleAddNote}
          />

          {/* Activity History Timeline */}
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column (Side ~40%) */}
        <div className="workspace-column-right">
          {/* Salesperson Assignment Card */}
          <LeadAssignment
            lead={lead}
            onReassignClick={() => setActiveModal("reassign")}
          />

          {/* Scheduled Follow-up Card */}
          <LeadFollowUp
            followup={followupData}
            onScheduleClick={() => setActiveModal("schedule")}
          />
        </div>
      </div>
    </div>
  );
};
