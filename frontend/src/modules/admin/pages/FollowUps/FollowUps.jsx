import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getStoredLeads, saveStoredLeads, initialLeadsData } from "../Leads/data/leadsMockData";
import { FollowUpSummary } from "./components/FollowUpSummary";
import { FollowUpToolbar } from "./components/FollowUpToolbar";
import { FollowUpTable } from "./components/FollowUpTable";
import { ScheduleFollowUpModal } from "./components/ScheduleFollowUpModal";
import { RescheduleModal } from "./components/RescheduleModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { FollowUpActivity } from "./components/FollowUpActivity";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./FollowUps.css";

// Helper to format date and label
const formatFollowupDate = (dateStr) => {
  if (!dateStr) return { date: "Sep 02, 2026", dateLabel: "Today" };
  if (dateStr.includes(",")) return { date: dateStr, dateLabel: "Upcoming" };

  try {
    const [year, month, day] = dateStr.split("-");
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    let dateLabel = "Upcoming";
    if (dateStr === "2026-09-02" || dateStr === "2026-09-03") {
      dateLabel = "Today";
    } else if (dateStr === "2026-09-04") {
      dateLabel = "Tomorrow";
    }
    return { date: formatted, dateLabel };
  } catch (e) {
    return { date: dateStr, dateLabel: "Upcoming" };
  }
};

const DEFAULT_FOLLOWUPS = [
    {
      id: "fu-101",
      leadId: "LD-1001",
      leadName: "Rahul Sharma",
      company: "Rahul Traders",
      type: "Call",
      notes: "Product requirement call & pricing options discussion.",
      assignedTo: "Amit Sharma",
      date: "Sep 02, 2026",
      dateLabel: "Today",
      time: "16:00",
      status: "Pending",
    },
    {
      id: "fu-102",
      leadId: "LD-1004",
      leadName: "Suresh Patel",
      company: "Patel Chemicals & Solvents",
      type: "Call",
      notes: "Pricing negotiation and final timeline discussion.",
      assignedTo: "Amit Sharma",
      date: "Sep 02, 2026",
      dateLabel: "Today",
      time: "14:30",
      status: "Pending",
    },
    {
      id: "fu-103",
      leadId: "LD-1002",
      leadName: "Priya Verma",
      company: "Apex Logistics LLP",
      type: "Meeting",
      notes: "In-person product demonstration and team pitch.",
      assignedTo: "Neha Verma",
      date: "Sep 03, 2026",
      dateLabel: "Tomorrow",
      time: "11:30",
      status: "Pending",
    },
    {
      id: "fu-104",
      leadId: "LD-1003",
      leadName: "Amit Mehta",
      company: "Mehta Auto Corp",
      type: "WhatsApp",
      notes: "Send updated machinery catalog and quotation PDF.",
      assignedTo: "Rahul Mehta",
      date: "Sep 03, 2026",
      dateLabel: "Upcoming",
      time: "10:00",
      status: "Pending",
    },
    {
      id: "fu-105",
      leadId: "LD-1004",
      leadName: "Suresh Patel",
      company: "Patel Chemicals & Solvents",
      type: "Call",
      notes: "Follow up call regarding contract agreement terms.",
      assignedTo: "Amit Sharma",
      date: "Sep 03, 2026",
      dateLabel: "Upcoming",
      time: "14:30",
      status: "Pending",
    },
    {
      id: "fu-106",
      leadId: "LD-1010",
      leadName: "Neha Singh",
      company: "Singh Tech Solutions",
      type: "Meeting",
      notes: "Technical architecture evaluation meeting.",
      assignedTo: "Priya Singh",
      date: "Sep 04, 2026",
      dateLabel: "Upcoming",
      time: "15:00",
      status: "Pending",
    },
    {
      id: "fu-107",
      leadId: "LD-1012",
      leadName: "Pooja Sharma",
      company: "Sharma Global Retail",
      type: "Call",
      notes: "Initial discovery call on product features.",
      assignedTo: "Priya Singh",
      date: "Sep 05, 2026",
      dateLabel: "Upcoming",
      time: "12:00",
      status: "Pending",
    },
    {
      id: "fu-108",
      leadId: "LD-1005",
      leadName: "Deepa Nair",
      company: "Greenfield Organics",
      type: "Meeting",
      notes: "Consultation call completed cleanly.",
      assignedTo: "Neha Verma",
      date: "Aug 31, 2026",
      dateLabel: "Completed",
      time: "12:00",
      status: "Completed",
    },
    {
      id: "fu-109",
      leadId: "LD-1009",
      leadName: "Mohit Verma",
      company: "Verma Retail Mart",
      type: "WhatsApp",
      notes: "Follow up on sample delivery status.",
      assignedTo: "Priya Singh",
      date: "Sep 01, 2026",
      dateLabel: "Yesterday",
      time: "17:30",
      status: "Pending",
    },
    {
      id: "fu-110",
      leadId: "LD-1010",
      leadName: "Sneha Agarwal",
      company: "Agarwal Tech Solutions",
      type: "Task",
      notes: "Prepare custom RFP proposal document.",
      assignedTo: "Neha Verma",
      date: "Sep 01, 2026",
      dateLabel: "Yesterday",
      time: "18:00",
      status: "Pending",
    },
];

const getStoredFollowups = (fallback) => {
  try {
    const saved = localStorage.getItem("leadflow_mock_followups");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return fallback;
};

export const FollowUps = ({ salespersonName, forceOpenScheduleModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const canDelete = isAdmin && !salespersonName;

  const [followups, setFollowups] = useState(() => getStoredFollowups(DEFAULT_FOLLOWUPS));

  useEffect(() => {
    try {
      localStorage.setItem("leadflow_mock_followups", JSON.stringify(followups));
    } catch (e) {}
  }, [followups]);

  // Read leads and extract ONLY assigned leads for follow-up scheduling
  const [storedLeads, setStoredLeads] = useState(() => getStoredLeads());

  const assignedLeadsList = useMemo(() => {
    return storedLeads.filter((l) => {
      const rep = l.salesperson || l.assignedTo || "Unassigned";
      return rep && rep !== "Unassigned";
    });
  }, [storedLeads]);

  // Modals States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Sync route /admin/follow-ups/addFollow-up
  useEffect(() => {
    if (location.pathname === "/admin/follow-ups/addFollow-up" || forceOpenScheduleModal) {
      setIsScheduleModalOpen(true);
      setStoredLeads(getStoredLeads());
    }
  }, [location.pathname, forceOpenScheduleModal]);

  const handleOpenScheduleModal = () => {
    setStoredLeads(getStoredLeads());
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

  // Activity Log State
  const [activities, setActivities] = useState([
    {
      id: "act-1",
      leadName: "Suresh Patel",
      action: "Follow-up scheduled",
      user: "Amit Sharma",
      timestamp: "Today, 10:30 AM",
      type: "scheduled",
    },
    {
      id: "act-2",
      leadName: "Deepa Nair",
      action: "Follow-up marked as completed",
      user: "Neha Verma",
      timestamp: "Yesterday, 4:20 PM",
      type: "completed",
    },
    {
      id: "act-3",
      leadName: "Vikram Aditya",
      action: "Follow-up rescheduled to Aug 28",
      user: "Rahul Mehta",
      timestamp: "Aug 27, 2026 · 03:10 PM",
      type: "rescheduled",
    },
  ]);

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
    overdue: relevantFollowups.filter((f) => f.status === "Overdue").length,
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

  // 2. Action: View Particular Lead Details Modal
  const handleViewLeadDetails = (item) => {
    const foundLead = initialLeadsData.find(
      (l) => l.id === item.leadId || l.name?.toLowerCase() === item.leadName?.toLowerCase()
    );

    const leadObject = foundLead || {
      id: item.leadId || "LD-1001",
      name: item.leadName || "Lead Contact",
      company: item.company || "",
      email: `${(item.leadName || "lead").toLowerCase().replace(/\s+/g, ".")}@company.com`,
      phone: item.phone || "+91 98765 43210",
      status: item.leadStatus || "Follow-up",
      source: "Website",
      salesperson: item.assignedTo || salespersonName || "Amit Sharma",
    };

    setSelectedLeadForCard(leadObject);
    setIsLeadCardOpen(true);
  };

  // 3. Action: Mark Single as Completed
  const handleMarkCompleted = (id) => {
    setFollowups((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          showToast(`Follow-up with ${item.leadName} marked as completed!`);
          setActivities((actPrev) => [
            {
              id: `act-${Date.now()}`,
              leadName: item.leadName,
              action: "Follow-up marked as completed",
              user: salespersonName || item.assignedTo || "Amit Sharma",
              timestamp: "Just now",
              type: "completed",
            },
            ...actPrev,
          ]);
          return { ...item, status: "Completed", dateLabel: "Completed" };
        }
        return item;
      })
    );
  };

  // 4. Action: Bulk Mark All Selected as Completed
  const handleBulkComplete = () => {
    if (selectedIds.length === 0) return;
    setFollowups((prev) =>
      prev.map((item) => {
        if (selectedIds.includes(item.id)) {
          return { ...item, status: "Completed", dateLabel: "Completed" };
        }
        return item;
      })
    );
    showToast(`${selectedIds.length} follow-up task(s) marked as completed!`);
    setSelectedIds([]);
  };

  // 5. Action: Schedule New Follow-up
  const handleScheduleConfirm = (newFollowup) => {
    const { date: formattedDate, dateLabel } = formatFollowupDate(newFollowup.date);

    const newItem = {
      id: `fu-${Date.now()}`,
      leadId: newFollowup.leadId,
      leadName: newFollowup.leadName,
      company: newFollowup.company,
      type: newFollowup.type,
      notes: newFollowup.notes || "Follow-up scheduled.",
      assignedTo: newFollowup.assignedTo,
      date: formattedDate,
      dateLabel: dateLabel,
      time: newFollowup.time,
      status: "Pending",
    };

    setFollowups((prev) => [newItem, ...prev]);

    // Update lead's nextFollowUp in stored leads so leads and pipeline tables reflect it
    try {
      const stored = getStoredLeads();
      const updatedLeads = stored.map((l) => {
        if (l.id === newFollowup.leadId) {
          return {
            ...l,
            nextFollowUp: `${formattedDate} (${newFollowup.type})`,
          };
        }
        return l;
      });
      saveStoredLeads(updatedLeads);
    } catch (e) {}

    // Reset toolbar filters so the newly created follow-up is immediately visible at the top
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedAssignee("All");
    setSelectedType("All");
    setSelectedDateFilter("All");
    setCurrentPage(1);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        leadName: newFollowup.leadName,
        action: `Follow-up scheduled (${newFollowup.type})`,
        user: newFollowup.assignedTo,
        timestamp: "Just now",
        type: "scheduled",
      },
      ...prev,
    ]);

    showToast(`New follow-up scheduled for ${newFollowup.leadName}`);
    handleCloseScheduleModal();
  };

  // 6. Action: Reschedule / Edit Follow-up
  const handleEditRescheduleClick = (item) => {
    setTargetItem(item);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleConfirm = (updatedData) => {
    if (!targetItem) return;

    setFollowups((prev) =>
      prev.map((item) => {
        if (item.id === targetItem.id) {
          return {
            ...item,
            status: updatedData.status,
            dateLabel: updatedData.status === "Completed" ? "Completed" : (item.dateLabel === "Completed" ? "Upcoming" : item.dateLabel),
          };
        }
        return item;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        leadName: targetItem.leadName,
        action: `Follow-up status updated to ${updatedData.status}`,
        user: targetItem.assignedTo,
        timestamp: "Just now",
        type: updatedData.status === "Completed" ? "completed" : "rescheduled",
      },
      ...prev,
    ]);

    showToast(`Follow-up status updated to '${updatedData.status}' for ${targetItem.leadName}`);
    setIsRescheduleModalOpen(false);
    setTargetItem(null);
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
      setFollowups((prev) => prev.filter((item) => item.id !== targetItem.id));
      setSelectedIds((prev) => prev.filter((id) => id !== targetItem.id));
      showToast(`Follow-up with ${targetItem.leadName} deleted.`);
    } else if (deleteMode === "bulk") {
      setFollowups((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      showToast(`${selectedIds.length} follow-ups deleted successfully.`);
      setSelectedIds([]);
    }
    setIsDeleteModalOpen(false);
    setTargetItem(null);
  };

  // Filtered Follow-ups Computation
  const filteredFollowups = followups.filter((item) => {
    // Salesperson Strict Filter
    if (salespersonName && item.assignedTo !== salespersonName) return false;

    // Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchLead = item.leadName.toLowerCase().includes(query);
      const matchCompany = item.company.toLowerCase().includes(query);
      const matchNotes = item.notes.toLowerCase().includes(query);
      const matchPhone = item.phone ? item.phone.includes(query) : false;
      if (!matchLead && !matchCompany && !matchNotes && !matchPhone) return false;
    }

    // Status Filter
    if (selectedStatus !== "All" && item.status !== selectedStatus) return false;

    // Assignee Filter
    if (selectedAssignee !== "All" && item.assignedTo !== selectedAssignee) return false;

    // Type Filter
    if (selectedType !== "All" && item.type !== selectedType) return false;

    // Date Label Filter
    if (selectedDateFilter !== "All" && item.dateLabel !== selectedDateFilter) return false;

    return true;
  });

  // Calculate Pagination Data
  const totalItems = filteredFollowups.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPaginatedFollowups = filteredFollowups.slice(startIndex, endIndex);

  return (
    <div className="admin-followups-page">
      {/* Toast Feedback */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Modals */}
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
          targetCount={deleteMode === "bulk" ? selectedIds.length : 1}
          leadName={deleteMode === "single" ? targetItem?.leadName : undefined}
        />
      )}

      <ProfileEditCardModal
        isOpen={isLeadCardOpen}
        onClose={() => setIsLeadCardOpen(false)}
        data={selectedLeadForCard}
        type="lead"
      />

      {/* Page Header Banner with Right Aligned CTA Button */}
      <div
        className="followups-page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          width: "100%"
        }}
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
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            fontSize: "0.85rem",
            fontWeight: 700,
            backgroundColor: "#ff3b19",
            borderColor: "#e63010",
            borderRadius: "10px",
            marginLeft: "auto",
            boxShadow: "0 4px 12px rgba(255, 59, 25, 0.25)",
            cursor: "pointer"
          }}
        >
          <Plus size={16} /> Schedule Follow-up
        </button>
      </div>

      {/* 1. Summary Cards Row */}
      <FollowUpSummary stats={stats} />

      {/* 2. Main Follow-ups Table Card */}
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

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              flexWrap: "wrap",
              gap: "12px"
            }}
          >
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
      </div>

      {/* 3. Follow-up Activity History Audit Log */}
      <FollowUpActivity
        activities={
          salespersonName
            ? activities.filter((act) => act.user && act.user.includes(salespersonName))
            : activities
        }
      />
    </div>
  );
};
