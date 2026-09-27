import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { FollowUpSummary } from "./components/FollowUpSummary";
import { FollowUpToolbar } from "./components/FollowUpToolbar";
import { FollowUpTable } from "./components/FollowUpTable";
import { ScheduleFollowUpModal } from "./components/ScheduleFollowUpModal";
import { RescheduleModal } from "./components/RescheduleModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { LeadDetailsModal } from "../Leads/components/LeadDetailsModal";
import { FollowUpActivity } from "./components/FollowUpActivity";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { followupsApi } from "../../../../api/followupsApi";
import { leadsApi } from "../../../../api/leadsApi";
import { adaptFollowUp } from "../../../../utils/followupAdapter";
import { adaptLead } from "../../../../utils/leadAdapter";
import "./FollowUps.css";

export const FollowUps = ({ salespersonName, forceOpenScheduleModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const canDelete = isAdmin && !salespersonName;

  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignedLeadsList, setAssignedLeadsList] = useState([]);

  const fetchFollowups = useCallback(() => {
    setIsLoading(true);
    return followupsApi
      .getAll({ limit: 200 })
      .then((data) => setFollowups((data.followUps || []).map(adaptFollowUp)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const fetchAssignedLeads = useCallback(() => {
    leadsApi
      .getAll({ limit: 200 })
      .then((data) => setAssignedLeadsList((data.leads || []).map(adaptLead).filter((l) => l.assignedTo)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFollowups();
    fetchAssignedLeads();
  }, [fetchFollowups, fetchAssignedLeads]);

  // Modals States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Sync route /admin/follow-ups/addFollow-up
  useEffect(() => {
    if (location.pathname === "/admin/follow-ups/addFollow-up" || forceOpenScheduleModal) {
      setIsScheduleModalOpen(true);
    }
  }, [location.pathname, forceOpenScheduleModal]);

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
    if (location.pathname !== "/admin/follow-ups/addFollow-up") {
      navigate("/admin/follow-ups/addFollow-up");
    }
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    if (location.pathname === "/admin/follow-ups/addFollow-up") {
      navigate("/admin/follow-ups");
    }
  };

  // Toolbar & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals States
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [deleteMode, setDeleteMode] = useState("single"); // "single" | "bulk"

  // Lead Detail Card Modal State
  const [selectedLeadForCard, setSelectedLeadForCard] = useState(null);
  const [isLeadCardOpen, setIsLeadCardOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  // Compute Stats for FollowUpSummary Component
  const relevantFollowups = salespersonName
    ? followups.filter((f) => f.assignedTo === salespersonName)
    : followups;

  const stats = {
    today: relevantFollowups.filter((f) => f.dateLabel === "Today" && f.status !== "Completed").length,
    upcoming: relevantFollowups.filter((f) => f.dateLabel === "Upcoming" && f.status !== "Completed").length,
    overdue: relevantFollowups.filter((f) => f.dateLabel === "Overdue" && f.status !== "Completed").length,
    completed: relevantFollowups.filter((f) => f.status === "Completed").length,
  };

  // 1. Action: Select / Unselect Rows
  const handleSelectAll = () => {
    if (selectedIds.length === filteredFollowups.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFollowups.map((f) => f.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // 2. Action: View Lead Details (real lead, via API)
  const handleViewLeadDetails = (item) => {
    if (!item.leadId) return;
    leadsApi
      .getById(item.leadId)
      .then((data) => {
        setSelectedLeadForCard(adaptLead(data.lead));
        setIsLeadCardOpen(true);
      })
      .catch(() => showToast("Failed to load lead details."));
  };

  // 3. Action: Mark Single as Completed
  const handleMarkCompleted = (id) => {
    const item = followups.find((f) => f.id === id);
    followupsApi
      .complete(id)
      .then(() => {
        setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, status: "Completed", dateLabel: "Completed" } : f)));
        showToast(`Follow-up with ${item?.leadName || "lead"} marked as completed!`);
      })
      .catch((err) => showToast(err.message || "Failed to update follow-up."));
  };

  // 4. Action: Bulk Mark All Selected as Completed
  const handleBulkComplete = () => {
    if (selectedIds.length === 0) return;
    Promise.allSettled(selectedIds.map((id) => followupsApi.complete(id))).then(() => {
      setFollowups((prev) => prev.map((f) => (selectedIds.includes(f.id) ? { ...f, status: "Completed", dateLabel: "Completed" } : f)));
      showToast(`${selectedIds.length} follow-up task(s) marked as completed!`);
      setSelectedIds([]);
    });
  };

  // 5. Action: Schedule New Follow-up
  const handleScheduleConfirm = (newFollowup) => {
    const lead = assignedLeadsList.find((l) => l.id === newFollowup.leadId);
    if (!lead) {
      showToast("Please select a valid assigned lead.");
      return;
    }
    const scheduledAt = new Date(`${newFollowup.date}T${newFollowup.time}`);

    followupsApi
      .create({
        leadId: lead.id,
        assignedTo: lead.assignedTo,
        type: newFollowup.type,
        scheduledAt: scheduledAt.toISOString(),
        notes: newFollowup.notes,
      })
      .then((created) => {
        setFollowups((prev) => [adaptFollowUp(created), ...prev]);
        setSearchQuery("");
        setSelectedStatus("All");
        setSelectedAssignee("All");
        setSelectedType("All");
        setSelectedDateFilter("All");
        setCurrentPage(1);
        showToast(`New follow-up scheduled for ${lead.name}`);
        handleCloseScheduleModal();
      })
      .catch((err) => showToast(err.message || "Failed to schedule follow-up."));
  };

  // 6. Action: Reschedule / Edit Follow-up (status change)
  const handleEditRescheduleClick = (item) => {
    setTargetItem(item);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleConfirm = (updatedData) => {
    if (!targetItem) return;
    followupsApi
      .update(targetItem.id, { status: updatedData.status })
      .then((updated) => {
        setFollowups((prev) => prev.map((f) => (f.id === targetItem.id ? adaptFollowUp(updated) : f)));
        showToast(`Follow-up status updated to '${updatedData.status}' for ${targetItem.leadName}`);
        setIsRescheduleModalOpen(false);
        setTargetItem(null);
      })
      .catch((err) => showToast(err.message || "Failed to update follow-up."));
  };

  // 7. Action: Delete Single / Bulk
  const handleDeleteSingleClick = (item) => {
    if (!canDelete) return;
    setTargetItem(item);
    setDeleteMode("single");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBulkClick = () => {
    if (!canDelete) return;
    setDeleteMode("bulk");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteMode === "single" && targetItem) {
      followupsApi
        .remove(targetItem.id)
        .then(() => {
          setFollowups((prev) => prev.filter((item) => item.id !== targetItem.id));
          setSelectedIds((prev) => prev.filter((id) => id !== targetItem.id));
          showToast(`Follow-up with ${targetItem.leadName} deleted.`);
        })
        .catch((err) => showToast(err.message || "Failed to delete follow-up."));
    } else if (deleteMode === "bulk") {
      Promise.allSettled(selectedIds.map((id) => followupsApi.remove(id))).then(() => {
        setFollowups((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        showToast(`${selectedIds.length} follow-ups deleted successfully.`);
        setSelectedIds([]);
      });
    }
    setIsDeleteModalOpen(false);
    setTargetItem(null);
  };

  // Filtered Follow-ups Computation
  const filteredFollowups = followups.filter((item) => {
    if (salespersonName && item.assignedTo !== salespersonName) return false;

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchLead = item.leadName.toLowerCase().includes(query);
      const matchCompany = item.company.toLowerCase().includes(query);
      const matchNotes = item.notes.toLowerCase().includes(query);
      const matchPhone = item.phone ? item.phone.includes(query) : false;
      if (!matchLead && !matchCompany && !matchNotes && !matchPhone) return false;
    }

    if (selectedStatus !== "All" && item.status !== selectedStatus) return false;
    if (selectedAssignee !== "All" && item.assignedTo !== selectedAssignee) return false;
    if (selectedType !== "All" && item.type !== selectedType) return false;
    if (selectedDateFilter !== "All" && item.dateLabel !== selectedDateFilter) return false;

    return true;
  });

  const totalItems = filteredFollowups.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPaginatedFollowups = filteredFollowups.slice(startIndex, endIndex);

  return (
    <div className="admin-followups-page">
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseScheduleModal}
        leadsList={assignedLeadsList}
        onConfirm={handleScheduleConfirm}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        targetFollowup={targetItem}
        onConfirm={handleRescheduleConfirm}
      />

      {canDelete && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          count={deleteMode === "bulk" ? selectedIds.length : 1}
        />
      )}

      <LeadDetailsModal
        isOpen={isLeadCardOpen}
        onClose={() => setIsLeadCardOpen(false)}
        lead={selectedLeadForCard}
      />

      <div
        className="followups-page-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", width: "100%" }}
      >
        <div>
          <p className="page-desc" style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Track, schedule, and complete client follow-ups across your sales team.
          </p>
        </div>

        <button
          type="button"
          className="crm-btn crm-btn-primary btn-schedule-cta"
          onClick={handleOpenScheduleModal}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px",
            fontSize: "0.85rem", fontWeight: 700, backgroundColor: "#ff3b19", borderColor: "#e63010",
            borderRadius: "10px", marginLeft: "auto", boxShadow: "0 4px 12px rgba(255, 59, 25, 0.25)", cursor: "pointer",
          }}
        >
          <Plus size={16} /> Schedule Follow-up
        </button>
      </div>

      <FollowUpSummary stats={stats} />

      <div className="crm-card followups-table-container" style={{ padding: "20px" }}>
        <FollowUpToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedDateFilter={selectedDateFilter}
          setSelectedDateFilter={setSelectedDateFilter}
          selectedCount={selectedIds.length}
          onBulkComplete={handleBulkComplete}
          onBulkDelete={handleDeleteBulkClick}
          canDelete={canDelete}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedStatus("All");
            setSelectedAssignee("All");
            setSelectedType("All");
            setSelectedDateFilter("All");
          }}
          salespersonName={salespersonName}
        />

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} className="spin-icon" />
          </div>
        ) : (
          <>
            <FollowUpTable
              followups={currentPaginatedFollowups}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onMarkCompleted={handleMarkCompleted}
              onEditReschedule={handleEditRescheduleClick}
              onDeleteSingle={handleDeleteSingleClick}
              canDelete={canDelete}
              onViewLead={handleViewLeadDetails}
            />

            {totalItems > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ fontSize: "0.825rem", color: "#64748b" }}>
                  Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
                  <strong>{endIndex}</strong> of <strong>{totalItems}</strong> tasks
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    className="crm-btn crm-btn-secondary crm-btn-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <span className="page-number-active">{currentPage}</span>
                  <button
                    className="crm-btn crm-btn-secondary crm-btn-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FollowUpActivity activities={[]} />
    </div>
  );
};
