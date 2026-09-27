import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";
import { AssignmentOverview } from "./components/AssignmentOverview";
import { SalespersonWorkload } from "./components/SalespersonWorkload";
import { AssignmentFilters } from "./components/AssignmentFilters";
import { AssignmentTable } from "./components/AssignmentTable";
import { AssignLeadsModal } from "./components/AssignLeadsModal";
import { AssignUnassignedLeadsModal } from "./components/AssignUnassignedLeadsModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { leadsApi } from "../../../../api/leadsApi";
import { usersApi } from "../../../../api/usersApi";
import { adaptLead } from "../../../../utils/leadAdapter";
import "./Assignments.css";

export const Assignments = ({ forceOpenAssignModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [leads, setLeads] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(() => {
    setIsLoading(true);
    return Promise.all([
      leadsApi.getAll({ limit: 200 }).then((data) => setLeads((data.leads || []).map(adaptLead))),
      usersApi.getSalespeople().then((data) => setSalespeople(data.users || [])),
    ])
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive per-salesperson workload directly from the real leads list.
  const repsWorkload = useMemo(() => {
    return salespeople.map((rep) => {
      const repLeads = leads.filter((l) => l.assignedTo === rep._id);
      const active = repLeads.filter((l) => ["New", "Contacted", "Follow-up", "Interested"].includes(l.status)).length;
      const converted = repLeads.filter((l) => l.status === "Converted").length;
      return {
        id: rep._id,
        name: rep.name,
        email: rep.email,
        phone: rep.phone || "",
        role: "Sales Employee",
        assigned: repLeads.length,
        active,
        followups: 0,
        converted,
        status: rep.status === "active" ? "Active" : "Inactive",
      };
    });
  }, [leads, salespeople]);

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
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchName = lead.name.toLowerCase().includes(query);
      const matchCompany = lead.company ? lead.company.toLowerCase().includes(query) : false;
      const matchPhone = lead.phone ? lead.phone.includes(query) : false;
      const matchEmail = lead.email ? lead.email.toLowerCase().includes(query) : false;
      if (!matchName && !matchCompany && !matchPhone && !matchEmail) return false;
    }

    if (selectedStatus !== "All" && lead.status !== selectedStatus) return false;
    if (selectedSource !== "All" && lead.source !== selectedSource) return false;

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
  const unassignedLeads = leads.filter((l) => !l.assignedTo);
  const unassignedCount = unassignedLeads.length;
  const assignedCount = totalCount - unassignedCount;

  const handleSelectAll = (updatedIds) => {
    if (Array.isArray(updatedIds)) {
      setSelectedLeadIds(updatedIds);
    } else if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleOpenAssignModal = (idsToAssign = null) => {
    const target = idsToAssign || selectedLeadIds;
    if (!target || target.length === 0) return;
    setTargetLeadIds(target);
    setIsAssignModalOpen(true);
  };

  const assignLeadsTo = (leadIds, repId) => {
    return leadsApi.bulkActions({ leadIds, action: "assign", assignedTo: repId });
  };

  // Confirm Lead Assignment from general modal or table
  const handleConfirmAssignment = (repId) => {
    const repName = salespeople.find((r) => r._id === repId)?.name || "the sales employee";
    assignLeadsTo(targetLeadIds, repId)
      .then(() => {
        setLeads((prev) => prev.map((lead) => (targetLeadIds.includes(lead.id) ? { ...lead, assignedTo: repId, salesperson: repName } : lead)));
        const count = targetLeadIds.length;
        setToastMessage(`${count} lead${count > 1 ? "s" : ""} assigned to ${repName} successfully`);
        setIsToastOpen(true);
        setSelectedLeadIds([]);
        setTargetLeadIds([]);
        setIsAssignModalOpen(false);
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to assign leads.");
        setIsToastOpen(true);
      });
  };

  // Confirm Bulk Unassigned Assignment from dedicated "Assign Leads" button modal
  const handleConfirmBulkUnassigned = (idsToAssign, repId) => {
    if (!idsToAssign || idsToAssign.length === 0 || !repId) return;
    const repName = salespeople.find((r) => r._id === repId)?.name || "the sales employee";

    assignLeadsTo(idsToAssign, repId)
      .then(() => {
        setLeads((prev) => prev.map((lead) => (idsToAssign.includes(lead.id) ? { ...lead, assignedTo: repId, salesperson: repName } : lead)));
        const count = idsToAssign.length;
        setToastMessage(`${count} lead${count > 1 ? "s" : ""} assigned to ${repName} successfully`);
        setIsToastOpen(true);
        setSelectedLeadIds([]);
        handleCloseBulkUnassignedModal();
      })
      .catch((err) => {
        setToastMessage(err.message || "Failed to assign leads.");
        setIsToastOpen(true);
      });
  };

  const isAllSelected = filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length;

  return (
    <div className="assignments-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <AssignLeadsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedCount={targetLeadIds.length}
        onConfirm={handleConfirmAssignment}
        salespeople={salespeople}
      />

      <AssignUnassignedLeadsModal
        isOpen={isBulkUnassignedModalOpen || forceOpenAssignModal || location.pathname === "/admin/assignments/assignLeads"}
        onClose={handleCloseBulkUnassignedModal}
        allLeads={leads}
        unassignedLeads={unassignedLeads}
        onConfirmAssign={handleConfirmBulkUnassigned}
        salespeople={salespeople}
      />

      <div className="assignments-header-banner">
        <div className="header-text-group">
          <p className="page-desc">
            Assign and reassign leads to sales team members, track salesperson workload, status, and lead ownership.
          </p>
        </div>
      </div>

      <AssignmentOverview
        stats={{ total: totalCount, unassigned: unassignedCount, assigned: assignedCount, salespersonsCount: repsWorkload.length }}
      />

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

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              onClick={handleOpenBulkUnassignedModal}
              style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 6px rgba(52, 97, 253, 0.2)" }}
              title="Assign leads to a sales employee"
            >
              <UserPlus size={16} /> Assign Leads
            </button>
          </div>
        </div>

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

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} className="spin-icon" />
          </div>
        ) : (
          <AssignmentTable
            leads={filteredLeads}
            selectedLeadIds={selectedLeadIds}
            onSelectAll={handleSelectAll}
            onSelectLead={handleSelectLead}
            isAllSelected={isAllSelected}
            onOpenAssignModal={(ids) => handleOpenAssignModal(ids)}
          />
        )}
      </div>

      <SalespersonWorkload repsWorkload={repsWorkload} />
    </div>
  );
};
