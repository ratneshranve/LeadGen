import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCheck, Sparkles, UserPlus } from "lucide-react";
import { initialLeadsData, getStoredLeads, saveStoredLeads } from "../Leads/data/leadsMockData";
import { AssignmentOverview } from "./components/AssignmentOverview";
import { SalespersonWorkload } from "./components/SalespersonWorkload";
import { AssignmentFilters } from "./components/AssignmentFilters";
import { AssignmentTable } from "./components/AssignmentTable";
import { AssignLeadsModal } from "./components/AssignLeadsModal";
import { AssignUnassignedLeadsModal } from "./components/AssignUnassignedLeadsModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./Assignments.css";

export const Assignments = ({ forceOpenAssignModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [leads, setLeads] = useState(getStoredLeads);

  useEffect(() => {
    saveStoredLeads(leads);
  }, [leads]);

  // Salesperson Workload State initialized from LocalStorage (or initial mock team)
  const [repsWorkload, setRepsWorkload] = useState(() => {
    try {
      const savedUsers = localStorage.getItem("leadflow_mock_team_users");
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const salesReps = parsed.filter((u) => u.role !== "Admin" && u.role !== "Master Admin");
          if (salesReps.length > 0) {
            return salesReps.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email || `${u.name.toLowerCase().replace(/\s+/g, ".")}@leadflow.com`,
              phone: u.phone || "+91 98765 00000",
              role: u.role || "Sales Employee",
              assigned: u.assignedLeads !== undefined ? u.assignedLeads : 35,
              active: u.activeLeads !== undefined ? u.activeLeads : 22,
              followups: u.followups !== undefined ? u.followups : 4,
              converted: u.converted !== undefined ? u.converted : 6,
              status: u.status || "Active",
            }));
          }
        }
      }
    } catch (e) {}
    return [
      { id: "sp-1", name: "Rahul Mehta", email: "rahul@leadflow.com", phone: "+91 98765 33333", role: "Sales Employee", assigned: 46, active: 31, followups: 7, converted: 9, status: "Active" },
      { id: "sp-2", name: "Amit Sharma", email: "amit@leadflow.com", phone: "+91 98765 11111", role: "Sales Employee", assigned: 42, active: 28, followups: 5, converted: 6, status: "Active" },
      { id: "sp-3", name: "Neha Verma", email: "neha@leadflow.com", phone: "+91 98765 22222", role: "Sales Employee", assigned: 38, active: 24, followups: 4, converted: 8, status: "Active" },
      { id: "sp-4", name: "Priya Singh", email: "priya@leadflow.com", phone: "+91 98765 44444", role: "Sales Employee", assigned: 35, active: 22, followups: 3, converted: 6, status: "Active" },
    ];
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");

  // Selection & Modal States
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkUnassignedModalOpen, setIsBulkUnassignedModalOpen] = useState(forceOpenAssignModal);
  const [targetLeadIds, setTargetLeadIds] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/admin/assignments/assignLeads" || forceOpenAssignModal) {
      setIsBulkUnassignedModalOpen(true);
    }
  }, [location.pathname, forceOpenAssignModal]);

  const handleOpenBulkUnassignedModal = () => {
    setIsBulkUnassignedModalOpen(true);
    if (location.pathname !== "/admin/assignments/assignLeads") {
      navigate("/admin/assignments/assignLeads");
    }
  };

  const handleCloseBulkUnassignedModal = () => {
    setIsBulkUnassignedModalOpen(false);
    if (location.pathname === "/admin/assignments/assignLeads") {
      navigate("/admin/assignments");
    }
  };

  // Filtered Leads Calculation
  const filteredLeads = leads.filter((lead) => {
    // Search filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchName = lead.name.toLowerCase().includes(query);
      const matchCompany = lead.company ? lead.company.toLowerCase().includes(query) : false;
      const matchPhone = lead.phone ? lead.phone.includes(query) : false;
      const matchEmail = lead.email ? lead.email.toLowerCase().includes(query) : false;
      if (!matchName && !matchCompany && !matchPhone && !matchEmail) return false;
    }

    // Status filter
    if (selectedStatus !== "All" && lead.status !== selectedStatus) {
      return false;
    }

    // Source filter
    if (selectedSource !== "All" && lead.source !== selectedSource) {
      return false;
    }

    // Current Assignee filter
    if (selectedAssignee !== "All") {
      if (selectedAssignee === "Unassigned") {
        if (lead.salesperson && lead.salesperson !== "Unassigned") return false;
      } else if (lead.salesperson !== selectedAssignee) {
        return false;
      }
    }

    return true;
  });

  // Calculate Overview Stats
  const totalCount = leads.length;
  const unassignedLeads = leads.filter(l => !l.salesperson || l.salesperson === "Unassigned");
  const unassignedCount = unassignedLeads.length;
  const assignedCount = totalCount - unassignedCount;

  // Handlers for Checkbox Selection
  const handleSelectAll = (updatedIds) => {
    if (Array.isArray(updatedIds)) {
      setSelectedLeadIds(updatedIds);
    } else {
      if (selectedLeadIds.length === filteredLeads.length) {
        setSelectedLeadIds([]);
      } else {
        setSelectedLeadIds(filteredLeads.map((l) => l.id));
      }
    }
  };

  const handleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // Open Assign Modal for batch or single row
  const handleOpenAssignModal = (idsToAssign = null) => {
    const target = idsToAssign || selectedLeadIds;
    if (!target || target.length === 0) return;
    setTargetLeadIds(target);
    setIsAssignModalOpen(true);
  };

  // Confirm Lead Assignment from general modal or table
  const handleConfirmAssignment = (newRep) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (targetLeadIds.includes(lead.id)) {
          return { ...lead, salesperson: newRep };
        }
        return lead;
      })
    );

    setRepsWorkload((prev) =>
      prev.map((rep) => {
        if (rep.name === newRep) {
          return {
            ...rep,
            assigned: rep.assigned + targetLeadIds.length,
            active: rep.active + targetLeadIds.length,
          };
        }
        return rep;
      })
    );

    const count = targetLeadIds.length;
    setToastMessage(`${count} lead${count > 1 ? "s" : ""} assigned to ${newRep} successfully`);
    setIsToastOpen(true);

    setSelectedLeadIds([]);
    setTargetLeadIds([]);
    setIsAssignModalOpen(false);
  };

  // Confirm Bulk Unassigned Assignment from dedicated "Assign Lead" button modal
  const handleConfirmBulkUnassigned = (idsToAssign, targetSalesperson) => {
    if (!idsToAssign || idsToAssign.length === 0 || !targetSalesperson) return;

    setLeads((prev) =>
      prev.map((lead) => {
        if (idsToAssign.includes(lead.id)) {
          return { ...lead, salesperson: targetSalesperson };
        }
        return lead;
      })
    );

    setRepsWorkload((prev) =>
      prev.map((rep) => {
        if (rep.name === targetSalesperson) {
          return {
            ...rep,
            assigned: rep.assigned + idsToAssign.length,
            active: rep.active + idsToAssign.length,
          };
        }
        return rep;
      })
    );

    const count = idsToAssign.length;
    setToastMessage(`${count} lead${count > 1 ? "s" : ""} assigned to ${targetSalesperson} successfully`);
    setIsToastOpen(true);
    setSelectedLeadIds([]);
    handleCloseBulkUnassignedModal();
  };

  const isAllSelected = filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length;

  return (
    <div className="assignments-page">
      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* General Selection Assignment Modal */}
      <AssignLeadsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedCount={targetLeadIds.length}
        onConfirm={handleConfirmAssignment}
      />

      {/* Dedicated Bulk Leads Assignment Modal ("Assign Leads" button feature) */}
      <AssignUnassignedLeadsModal
        isOpen={isBulkUnassignedModalOpen || forceOpenAssignModal || location.pathname === "/admin/assignments/assignLeads"}
        onClose={handleCloseBulkUnassignedModal}
        allLeads={leads}
        unassignedLeads={unassignedLeads}
        onConfirmAssign={handleConfirmBulkUnassigned}
      />

      {/* Header Description */}
      <div className="assignments-header-banner">
        <div className="header-text-group">
          <p className="page-desc">
            Assign and reassign leads to sales team members, track salesperson workload, status, and lead ownership.
          </p>
        </div>
      </div>

      {/* 1. Overview Summary Cards */}
      <AssignmentOverview
        stats={{
          total: totalCount,
          unassigned: unassignedCount,
          assigned: assignedCount,
          salespersonsCount: repsWorkload.length,
        }}
      />

      {/* 2. Lead Assignment Main Section Card (FIRST) */}
      <div className="crm-card lead-assignment-main-card">
        <div className="card-header-flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <UserCheck size={18} className="text-indigo" style={{ flexShrink: 0 }} />
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                Lead Assignment
              </h3>
            </div>
            <span className="section-count-pill">{filteredLeads.length} Leads</span>
          </div>

          {/* Dedicated "Assign Leads" Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              onClick={handleOpenBulkUnassignedModal}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 6px rgba(52, 97, 253, 0.2)"
              }}
              title="Assign leads to a sales employee"
            >
              <UserPlus size={16} /> Assign Leads
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <AssignmentFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedStatus("All");
            setSelectedAssignee("All");
          }}
          selectedCount={selectedLeadIds.length}
          onBulkAssign={() => handleOpenAssignModal()}
        />

        {/* Assignment Lead Data Table with Pagination & No Eye Button */}
        <AssignmentTable
          leads={filteredLeads}
          selectedLeadIds={selectedLeadIds}
          onSelectAll={handleSelectAll}
          onSelectLead={handleSelectLead}
          isAllSelected={isAllSelected}
          onOpenAssignModal={(ids) => handleOpenAssignModal(ids)}
        />
      </div>

      {/* 3. Salesperson Workload Table (SECOND) */}
      <SalespersonWorkload repsWorkload={repsWorkload} />
    </div>
  );
};
