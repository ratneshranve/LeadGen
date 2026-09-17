import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { getStoredLeads, saveStoredLeads } from "../Leads/data/leadsMockData";
import { PipelineTable } from "./components/PipelineTable";
import { UpdatePipelineModal } from "./components/UpdatePipelineModal";
import { BulkUpdatePipelineModal } from "./components/BulkUpdatePipelineModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./Pipeline.css";

export const Pipeline = ({ forceOpenUpdateModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [leads, setLeads] = useState(getStoredLeads);
  const [isUpdatePipelineModalOpen, setIsUpdatePipelineModalOpen] = useState(forceOpenUpdateModal);
  const [leadToUpdatePipeline, setLeadToUpdatePipeline] = useState(null);

  // Bulk Update State
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkSelectedLeadIds, setBulkSelectedLeadIds] = useState([]);
  const [selectedPipelineLeadIds, setSelectedPipelineLeadIds] = useState([]);

  useEffect(() => {
    saveStoredLeads(leads);
  }, [leads]);

  useEffect(() => {
    if (location.pathname === "/admin/pipeline/updatePipeline" || forceOpenUpdateModal) {
      const leadId = searchParams.get("id");
      const currentLeads = getStoredLeads();
      let found = null;
      if (leadId) {
        found = currentLeads.find((l) => String(l.id).toLowerCase() === String(leadId).toLowerCase());
      }
      if (!found) {
        found = currentLeads.find((l) => (l.salesperson || l.assignedTo || "Unassigned") !== "Unassigned");
      }

      const assignedName = found ? (found.salesperson || found.assignedTo || "Unassigned") : "Unassigned";
      if (found && assignedName !== "Unassigned") {
        setLeadToUpdatePipeline(found);
        setIsUpdatePipelineModalOpen(true);
      } else {
        setIsUpdatePipelineModalOpen(false);
        setLeadToUpdatePipeline(null);
        if (location.pathname === "/admin/pipeline/updatePipeline") {
          navigate("/admin/pipeline", { replace: true });
        }
      }
    }
  }, [location.pathname, searchParams, forceOpenUpdateModal]);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const handleOpenUpdateModal = (leadId) => {
    const target = leads.find((l) => l.id === leadId);
    const assignedName = target ? (target.salesperson || target.assignedTo || "Unassigned") : "Unassigned";
    if (target && assignedName !== "Unassigned") {
      setLeadToUpdatePipeline(target);
      setIsUpdatePipelineModalOpen(true);
      if (location.pathname !== "/admin/pipeline/updatePipeline") {
        navigate(`/admin/pipeline/updatePipeline?id=${target.id}`);
      }
    }
  };

  const handleCloseUpdateModal = () => {
    setIsUpdatePipelineModalOpen(false);
    setLeadToUpdatePipeline(null);
    if (location.pathname === "/admin/pipeline/updatePipeline") {
      navigate("/admin/pipeline");
    }
  };

  const handleOpenBulkUpdateModal = (selectedIds) => {
    if (selectedIds && selectedIds.length > 0) {
      setBulkSelectedLeadIds(selectedIds);
      setIsBulkUpdateModalOpen(true);
    }
  };

  const handleConfirmBulkUpdateStage = (newStage) => {
    if (!newStage || bulkSelectedLeadIds.length === 0) return;
    const count = bulkSelectedLeadIds.length;

    setLeads((prev) =>
      prev.map((l) => {
        if (bulkSelectedLeadIds.includes(l.id)) {
          const transitionEntry = {
            from: l.status || l.stage || "New",
            to: newStage,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          };
          const updatedHistory = [transitionEntry, ...(l.history || [])];
          return { ...l, status: newStage, stage: newStage, history: updatedHistory };
        }
        return l;
      })
    );

    setToastMessage(`Pipeline stage updated to '${newStage}' for ${count} assigned lead(s)`);
    setIsToastOpen(true);
    setIsBulkUpdateModalOpen(false);
    setBulkSelectedLeadIds([]);
    setSelectedPipelineLeadIds([]); // Automatically unselect checkboxes after changing pipeline stages!
  };

  // Action: Move single lead to target stage with transition history tracking
  const handleMoveStage = (leadId, newStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const currentStageVal = lead.status || lead.stage || "New";

    const transitionEntry = {
      from: currentStageVal,
      to: newStage,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedHistory = [transitionEntry, ...(l.history || [])];
          return { ...l, status: newStage, stage: newStage, history: updatedHistory };
        }
        return l;
      })
    );

    setToastMessage(`Pipeline stage updated to '${newStage}' for '${lead.name}'`);
    setIsToastOpen(true);
  };

  const handleConfirmUpdateStage = (leadId, newStage) => {
    handleMoveStage(leadId, newStage);
    handleCloseUpdateModal();
  };

  // Action: Delete Single Lead
  const handleDeleteLead = (leadId) => {
    const leadToDelete = leads.find((l) => l.id === leadId);
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setToastMessage(leadToDelete ? `Lead '${leadToDelete.name}' deleted` : "Lead deleted");
    setIsToastOpen(true);
  };

  // Action: Delete Bulk Leads
  const handleDeleteBulk = (idsToDelete) => {
    setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
    setToastMessage(`${idsToDelete.length} lead(s) deleted successfully`);
    setIsToastOpen(true);
  };

  return (
    <div className="pipeline-page">
      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Single Lead Update Pipeline Stage Modal Overlay */}
      <UpdatePipelineModal
        isOpen={isUpdatePipelineModalOpen || forceOpenUpdateModal || location.pathname === "/admin/pipeline/updatePipeline"}
        onClose={handleCloseUpdateModal}
        lead={leadToUpdatePipeline || leads[0]}
        onUpdateStage={handleConfirmUpdateStage}
      />

      {/* Bulk Update Pipeline Stage Modal Overlay */}
      <BulkUpdatePipelineModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        selectedCount={bulkSelectedLeadIds.length}
        onBulkUpdateStage={handleConfirmBulkUpdateStage}
      />

      {/* Header Description */}
      <div className="pipeline-header-banner">
        <div className="header-text-group">
          <p className="page-desc">
            Manage and track leads in table format through every stage of your sales pipeline.
          </p>
        </div>
      </div>

      {/* Professional Scalable Pipeline Data Table (Admin Mode) */}
      <PipelineTable
        leads={leads}
        isAdmin={true}
        selectedIds={selectedPipelineLeadIds}
        setSelectedIds={setSelectedPipelineLeadIds}
        onOpenUpdateModal={handleOpenUpdateModal}
        onOpenBulkUpdateModal={handleOpenBulkUpdateModal}
        onMoveStage={handleMoveStage}
        onDeleteLead={handleDeleteLead}
        onDeleteBulk={handleDeleteBulk}
      />
    </div>
  );
};
