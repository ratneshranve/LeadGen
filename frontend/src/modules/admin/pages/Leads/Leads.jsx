import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, useParams } from "react-router-dom";
import { Plus, Share2, X } from "lucide-react";
import { initialLeadsData, getStoredLeads, saveStoredLeads, getCustomSources } from "./data/leadsMockData";
import { LeadSummaryCards } from "./components/LeadSummaryCards";
import { LeadFilters } from "./components/LeadFilters";
import { LeadsTable } from "./components/LeadsTable";
import { LeadsEmptyState } from "./components/LeadsEmptyState";
import { LeadsPagination } from "./components/LeadsPagination";
import { BulkActionBar } from "./components/BulkActionBar";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { LeadDetailsModal } from "./components/LeadDetailsModal";
import { AddLeadModal } from "./components/AddLeadModal";
import { UpdateLeadModal } from "./components/UpdateLeadModal";
import { AddBulkLeadsModal } from "./components/AddBulkLeadsModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { Modal } from "../../../../components/ui/Modal";
import "./Leads.css";

export const Leads = ({ forceOpenAddModal = false, forceOpenUpdateModal = false, forceOpenAddBulkModal = false, forceOpenDetailsModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const initialStatusParam = searchParams.get("status") || "All";

  const [leadsList, setLeadsList] = useState(getStoredLeads);

  useEffect(() => {
    saveStoredLeads(leadsList);
  }, [leadsList]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(forceOpenAddModal);
  const [isUpdateLeadModalOpen, setIsUpdateLeadModalOpen] = useState(forceOpenUpdateModal);
  const [isAddBulkModalOpen, setIsAddBulkModalOpen] = useState(forceOpenAddBulkModal);
  const [leadToUpdate, setLeadToUpdate] = useState(null);
  const [newSourceName, setNewSourceName] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const isDetailsRoute = location.pathname.includes("/admin/leads/leadDetails") ||
                         location.pathname.includes("/admin/leads/details") ||
                         forceOpenDetailsModal ||
                         Boolean(params.leadId);

  const getLeadFromUrlOrStorage = (id) => {
    const allLeads = getStoredLeads();
    if (id) {
      const found = allLeads.find((l) => String(l.id).toLowerCase() === String(id).toLowerCase());
      if (found) return found;
    }
    return allLeads.length > 0 ? allLeads[0] : null;
  };

  const [activeModal, setActiveModal] = useState(() => {
    return isDetailsRoute ? "edit_lead_card" : null;
  });

  const [targetLead, setTargetLead] = useState(() => {
    if (isDetailsRoute) {
      const urlId = searchParams.get("id") || params.leadId;
      return getLeadFromUrlOrStorage(urlId);
    }
    return null;
  });

  useEffect(() => {
    if (isDetailsRoute) {
      const urlId = searchParams.get("id") || params.leadId;
      const found = getLeadFromUrlOrStorage(urlId);
      if (found) {
        setTargetLead(found);
        setActiveModal("edit_lead_card");
      }
    }
  }, [location.pathname, searchParams, forceOpenDetailsModal, params.leadId]);

  useEffect(() => {
    if (location.pathname === "/admin/leads/addBulk" || forceOpenAddBulkModal) {
      setIsAddBulkModalOpen(true);
    }
  }, [location.pathname, forceOpenAddBulkModal]);

  useEffect(() => {
    if (location.pathname === "/admin/leads/update" || forceOpenUpdateModal) {
      const leadId = searchParams.get("id");
      if (leadId) {
        const found = leadsList.find((l) => l.id === leadId);
        if (found) setLeadToUpdate(found);
      } else if (leadsList.length > 0 && !leadToUpdate) {
        setLeadToUpdate(leadsList[0]);
      }
      setIsUpdateLeadModalOpen(true);
    }
  }, [location.pathname, searchParams, forceOpenUpdateModal]);

  const handleOpenAddBulkModal = () => {
    setIsAddBulkModalOpen(true);
    if (location.pathname !== "/admin/leads/addBulk") {
      navigate("/admin/leads/addBulk");
    }
  };

  const handleCloseAddBulkModal = () => {
    setIsAddBulkModalOpen(false);
    if (location.pathname === "/admin/leads/addBulk") {
      navigate("/admin/leads");
    }
  };

  const handleOpenAddLeadModal = () => {
    setIsAddLeadModalOpen(true);
    if (location.pathname !== "/admin/leads/add") {
      navigate("/admin/leads/add");
    }
  };

  const handleCloseAddLeadModal = () => {
    setIsAddLeadModalOpen(false);
    if (location.pathname === "/admin/leads/add") {
      navigate("/admin/leads");
    }
  };

  const handleCreateNewLead = (newLead) => {
    const updated = [newLead, ...leadsList];
    setLeadsList(updated);
    saveStoredLeads(updated);
    setToastMessage(`New lead '${newLead.name}' created successfully with status 'New'!`);
    setIsToastOpen(true);
    handleCloseAddLeadModal();
  };

  const handleCreateBulkLeads = (newLeads) => {
    const updated = [...newLeads, ...leadsList];
    setLeadsList(updated);
    saveStoredLeads(updated);
    setToastMessage(`Successfully generated and added ${newLeads.length} unassigned bulk leads!`);
    setIsToastOpen(true);
    handleCloseAddBulkModal();
  };

  const handleEditLead = (lead) => {
    setLeadToUpdate(lead);
    setIsUpdateLeadModalOpen(true);
    navigate(`/admin/leads/update?id=${lead.id}`);
  };

  const handleCloseUpdateLeadModal = () => {
    setIsUpdateLeadModalOpen(false);
    setLeadToUpdate(null);
    if (location.pathname === "/admin/leads/update") {
      navigate("/admin/leads");
    }
  };

  const handleUpdateLeadSubmit = (updatedLead) => {
    const updatedList = leadsList.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeadsList(updatedList);
    saveStoredLeads(updatedList);
    setToastMessage(`Lead '${updatedLead.name}' updated successfully!`);
    setIsToastOpen(true);
    handleCloseUpdateLeadModal();
  };

  // Filter State initialized with deep link query parameter
  const defaultFilters = {
    status: initialStatusParam,
    source: "All",
    salesperson: "All",
    leadType: "All",
    conversionStatus: "All",
    createdDate: "",
    followupDate: "",
  };
  const [filters, setFilters] = useState(defaultFilters);

  // Sync filters when searchParams status changes
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus) {
      setFilters((prev) => ({ ...prev, status: urlStatus }));
    }
  }, [searchParams]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters(defaultFilters);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" ||
      filters.status !== "All" ||
      filters.source !== "All" ||
      filters.salesperson !== "All" ||
      filters.leadType !== "All" ||
      filters.conversionStatus !== "All" ||
      filters.createdDate !== "" ||
      filters.followupDate !== ""
    );
  }, [searchTerm, filters]);

  // Compute Metrics for Summary Cards
  const summaryMetrics = useMemo(() => {
    const total = leadsList.length;
    const newCount = leadsList.filter((l) => l.status === "New").length;
    const activeCount = leadsList.filter(
      (l) => l.status === "Contacted" || l.status === "Follow-up" || l.status === "Interested"
    ).length;
    const convertedCount = leadsList.filter((l) => l.status === "Converted").length;

    return { total, new: newCount, active: activeCount, converted: convertedCount };
  }, [leadsList]);

  // Filter and Sort Pipeline
  const filteredLeads = useMemo(() => {
    return leadsList.filter((lead) => {
      // Search match
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(term);
        const matchesCompany = lead.company.toLowerCase().includes(term);
        const matchesPhone = lead.phone.includes(term);
        const matchesEmail = lead.email.toLowerCase().includes(term);

        if (!matchesName && !matchesCompany && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      // Quick Filters & Status Filter (Active status excludes Lost leads)
      if (filters.status === "Active") {
        if (lead.status === "Lost") return false;
      } else if (filters.status !== "All" && lead.status !== filters.status) {
        return false;
      }
      if (filters.source !== "All" && lead.source !== filters.source) return false;
      if (filters.salesperson !== "All" && lead.salesperson !== filters.salesperson) return false;
      if (filters.leadType !== "All" && lead.leadType !== filters.leadType) return false;
      if (filters.conversionStatus !== "All" && lead.conversionStatus !== filters.conversionStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortOption === "newest") return b.id.localeCompare(a.id);
      if (sortOption === "oldest") return a.id.localeCompare(b.id);
      if (sortOption === "name_asc") return a.name.localeCompare(b.name);
      if (sortOption === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [leadsList, searchTerm, filters, sortOption]);

  // Paginated Subset
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Checkbox selection handlers
  const handleSelectLead = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(paginatedLeads.map((l) => l.id));
    }
  };

  const isAllSelected =
    paginatedLeads.length > 0 && selectedLeadIds.length === paginatedLeads.length;

  const handleViewLead = (leadOrId) => {
    const leadObj = typeof leadOrId === "object" && leadOrId !== null
      ? leadOrId
      : leadsList.find((l) => l.id === leadOrId);
    if (leadObj) {
      setTargetLead(leadObj);
      setActiveModal("view_lead");
      navigate(`/admin/leads/leadDetails?id=${leadObj.id}`);
    }
  };

  const handleCloseDetailsModal = () => {
    setActiveModal(null);
    setTargetLead(null);
    if (isDetailsRoute) {
      navigate("/admin/leads");
    }
  };

  const handleAssignLead = (lead) => {
    setTargetLead(lead);
    setActiveModal("assign_lead");
  };

  const handleDeleteLead = (lead) => {
    setTargetLead(lead);
    setActiveModal("delete_lead");
  };

  // Bulk Operations
  const handleConfirmBulkDelete = () => {
    const deletedCount = selectedLeadIds.length;
    const updated = leadsList.filter((l) => !selectedLeadIds.includes(l.id));
    setLeadsList(updated);
    saveStoredLeads(updated);
    setSelectedLeadIds([]);
    setActiveModal(null);
    setToastMessage(`${deletedCount} lead(s) deleted successfully!`);
    setIsToastOpen(true);
  };

  const handleConfirmSingleDelete = () => {
    if (targetLead) {
      const updated = leadsList.filter((l) => l.id !== targetLead.id);
      setLeadsList(updated);
      saveStoredLeads(updated);
      setToastMessage(`Lead '${targetLead.name}' deleted successfully!`);
      setIsToastOpen(true);
      setTargetLead(null);
      setActiveModal(null);
    }
  };

  const handleCreateSource = (e) => {
    e.preventDefault();
    const nameStr = newSourceName.trim();
    if (!nameStr) {
      setSourceError("Source name is required.");
      return;
    }
    const currentSources = getCustomSources();
    if (currentSources.includes(nameStr)) {
      setSourceError("Source already exists.");
      return;
    }

    const updated = [...currentSources, nameStr];
    localStorage.setItem("leadflow_custom_sources", JSON.stringify(updated));

    setToastMessage(`New lead source '${nameStr}' created successfully!`);
    setIsToastOpen(true);
    setNewSourceName("");
    setSourceError("");
    setIsSourceModalOpen(false);
  };

  return (
    <div className="leads-page">
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Page Header Banner */}
      <div className="leads-page-header">
        <div className="header-text-container">
          <h1 className="page-heading">Leads</h1>
          <p className="page-subheading">
            Manage, assign and track all your leads in one place.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={handleOpenAddBulkModal}
            style={{
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              borderColor: "#bbf7d0",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={16} /> Add Bulk Leads
          </button>

          <button
            className="crm-btn crm-btn-primary add-lead-btn"
            onClick={handleOpenAddLeadModal}
          >
            <Plus size={16} /> Add New Lead
          </button>
        </div>
      </div>

      {/* Modal for Creating New Lead Source directly from Leads Page */}
      {isSourceModalOpen && (
        <div className="modal-overlay show" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="crm-card" style={{ width: "90%", maxWidth: "420px", padding: "24px", background: "#ffffff", borderRadius: "14px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #cbd5e1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Share2 size={18} color="#ff3b19" /> Add New Lead Source
              </h3>
              <button
                type="button"
                onClick={() => { setIsSourceModalOpen(false); setSourceError(""); }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSource}>
              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label className="form-label" style={{ fontSize: "0.825rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Source Name <span className="text-req">*</span>
                </label>
                <input
                  type="text"
                  className="crm-input"
                  placeholder="e.g. LinkedIn Ads, Cold Calling, Trade Show"
                  value={newSourceName}
                  onChange={(e) => { setNewSourceName(e.target.value); setSourceError(""); }}
                  autoFocus
                />
                {sourceError && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{sourceError}</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  onClick={() => { setIsSourceModalOpen(false); setSourceError(""); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn crm-btn-primary"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4 Compact Summary Metrics Cards */}
      <LeadSummaryCards metrics={summaryMetrics} />

      {/* Search & Filters Toolbar */}
      <LeadFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        selectedCount={selectedLeadIds.length}
        onBulkDelete={() => setActiveModal("bulk_delete")}
      />

      {/* Main Table or Empty State */}
      <div className="crm-card leads-table-card">
        {filteredLeads.length > 0 ? (
          <>
            <LeadsTable
              leads={paginatedLeads}
              selectedLeadIds={selectedLeadIds}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
              onViewLead={handleViewLead}
              onEditLead={handleEditLead}
              onAssignLead={handleAssignLead}
              onDeleteLead={handleDeleteLead}
            />

            <LeadsPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalItems={filteredLeads.length}
            />
          </>
        ) : (
          <LeadsEmptyState onResetFilters={handleResetFilters} />
        )}
      </div>

      {/* Read-Only Lead Details Pop-Up Card */}
      <LeadDetailsModal
        isOpen={(activeModal === "edit_lead_card" || activeModal === "view_lead" || isDetailsRoute) && (targetLead !== null || leadsList.length > 0)}
        onClose={handleCloseDetailsModal}
        lead={targetLead || leadsList[0]}
      />

      {/* Add Bulk Unassigned Leads Modal */}
      <AddBulkLeadsModal
        isOpen={isAddBulkModalOpen || forceOpenAddBulkModal || location.pathname === "/admin/leads/addBulk"}
        onClose={handleCloseAddBulkModal}
        onAddBulkLeads={handleCreateBulkLeads}
      />

      {/* Add New Lead Card Overlay Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen || forceOpenAddModal || location.pathname === "/admin/leads/add"}
        onClose={handleCloseAddLeadModal}
        onAddLead={handleCreateNewLead}
      />

      {/* Update Lead Card Overlay Modal */}
      <UpdateLeadModal
        isOpen={isUpdateLeadModalOpen || forceOpenUpdateModal || location.pathname === "/admin/leads/update"}
        onClose={handleCloseUpdateLeadModal}
        targetLead={leadToUpdate || targetLead || leadsList[0]}
        onUpdateLead={handleUpdateLeadSubmit}
      />



      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={activeModal === "delete_lead" && targetLead !== null}
        onClose={() => setActiveModal(null)}
        title="Delete Lead Record"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
            Are you sure you want to delete lead <strong>{targetLead?.name}</strong>? This action will remove the lead record from the table.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#e11d48" }} onClick={handleConfirmSingleDelete}>Delete Lead</button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={activeModal === "bulk_delete"}
        onClose={() => setActiveModal(null)}
        title="Confirm Delete"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "#1b2559", lineHeight: "1.5" }}>
            Are you sure you want to delete all <strong>{selectedLeadIds.length}</strong> selected lead records? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c" }} onClick={handleConfirmBulkDelete}>
              Yes (Delete)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
