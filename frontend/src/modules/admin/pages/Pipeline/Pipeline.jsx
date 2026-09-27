import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PipelineTable } from "./components/PipelineTable";
import { UpdatePipelineModal } from "./components/UpdatePipelineModal";
import { BulkUpdatePipelineModal } from "./components/BulkUpdatePipelineModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { leadsApi } from "../../../../api/leadsApi";
import { adaptLead } from "../../../../utils/leadAdapter";
import "./Pipeline.css";

export const Pipeline = ({ forceOpenUpdateModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatePipelineModalOpen, setIsUpdatePipelineModalOpen] = useState(forceOpenUpdateModal);
  const [leadToUpdatePipeline, setLeadToUpdatePipeline] = useState(null);

  // Bulk Update State
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkSelectedLeadIds, setBulkSelectedLeadIds] = useState([]);
  const [selectedPipelineLeadIds, setSelectedPipelineLeadIds] = useState([]);

  const fetchLeads = useCallback(() => {
    setIsLoading(true);
    return leadsApi
      .getAll({ limit: 200 })
      .then((data) => setLeads((data.leads || []).map(adaptLead)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (leads.length === 0) return;
    if (location.pathname === "/admin/pipeline/updatePipeline" || forceOpenUpdateModal) {
      const leadId = searchParams.get("id");
      const currentLeads = leads;
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

    leadsApi
      .bulkActions({ leadIds: bulkSelectedLeadIds, action: "status", status: newStage })
      .then(() => {
        setLeads((prev) => prev.map((l) => (bulkSelectedLeadIds.includes(l.id) ? { ...l, status: newStage } : l)));
        setToastMessage(`Pipeline stage updated to '${newStage}' for ${count} assigned lead(s)`);
        setIsToastOpen(true);
        setIsBulkUpdateModalOpen(false);
        setBulkSelectedLeadIds([]);
        setSelectedPipelineLeadIds([]); // Automatically unselect checkboxes after changing pipeline stages!
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to update leads.");
        setIsToastOpen(true);
      });
  };

  // Action: Move single lead to target stage
  const handleMoveStage = (leadId, newStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    leadsApi
      .update(leadId, { status: newStage })
      .then(() => {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStage } : l)));
        setToastMessage(`Pipeline stage updated to '${newStage}' for '${lead.name}'`);
        setIsToastOpen(true);
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to update lead stage.");
        setIsToastOpen(true);
      });
  };

  const handleConfirmUpdateStage = (leadId, newStage) => {
    handleMoveStage(leadId, newStage);
    handleCloseUpdateModal();
  };

  // Action: Delete Single Lead
  const handleDeleteLead = (leadId) => {
    const leadToDelete = leads.find((l) => l.id === leadId);
    leadsApi
      .remove(leadId)
      .then(() => {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        setToastMessage(leadToDelete ? `Lead '${leadToDelete.name}' deleted` : "Lead deleted");
        setIsToastOpen(true);
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to delete lead.");
        setIsToastOpen(true);
      });
  };

  // Action: Delete Bulk Leads
  const handleDeleteBulk = (idsToDelete) => {
    leadsApi
      .bulkActions({ leadIds: idsToDelete, action: "delete" })
      .then(() => {
        setLeads((prev) => prev.filter((l) => !idsToDelete.includes(l.id)));
        setToastMessage(`${idsToDelete.length} lead(s) deleted successfully`);
        setIsToastOpen(true);
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to delete leads.");
        setIsToastOpen(true);
      });
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
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={24} className="spin-icon" />
        </div>
      ) : (
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
      )}
    </div>
  );
};
