import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Plus, Download, Share2 } from "lucide-react";
import { SourceSummaryCards } from "./components/SourceSummaryCards";
import { SourcePerformanceCards } from "./components/SourcePerformanceCards";
import { SourceAnalyticsChart } from "./components/SourceAnalyticsChart";
import { SourceTableToolbar } from "./components/SourceTableToolbar";
import { SourceDirectoryTable } from "./components/SourceDirectoryTable";
import { AddLeadSourceModal } from "./components/AddLeadSourceModal";
import { UpdateLeadSourceModal } from "./components/UpdateLeadSourceModal";
import { SourceDetailsModal } from "./components/SourceDetailsModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { Modal } from "../../../../components/ui/Modal";
import "./LeadSources.css";

export const LeadSources = ({ forceOpenAddModal = false, forceOpenUpdateModal = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialSources = [
    {
      id: "src-1",
      name: "Google Ads",
      type: "Advertising",
      leads: 42,
      activeLeads: 28,
      converted: 8,
      rate: 19,
      status: "Active",
      createdAt: "Jan 12, 2026",
      description: "Paid search engine marketing campaigns via Google Adwords.",
    },
    {
      id: "src-2",
      name: "Meta Ads",
      type: "Advertising",
      leads: 38,
      activeLeads: 25,
      converted: 6,
      rate: 16,
      status: "Active",
      createdAt: "Jan 18, 2026",
      description: "Facebook & Instagram targeted lead generation campaigns.",
    },
    {
      id: "src-3",
      name: "Website",
      type: "Website",
      leads: 31,
      activeLeads: 20,
      converted: 5,
      rate: 16,
      status: "Active",
      createdAt: "Jan 20, 2026",
      description: "Inbound lead inquiries from contact form and live chat.",
    },
    {
      id: "src-4",
      name: "Referral",
      type: "Referral",
      leads: 27,
      activeLeads: 18,
      converted: 4,
      rate: 15,
      status: "Active",
      createdAt: "Feb 02, 2026",
      description: "Word-of-mouth client referrals and partner networks.",
    },
    {
      id: "src-5",
      name: "WhatsApp",
      type: "Messaging",
      leads: 21,
      activeLeads: 14,
      converted: 1,
      rate: 5,
      status: "Active",
      createdAt: "Feb 10, 2026",
      description: "Direct WhatsApp Business incoming inquiries.",
    },
    {
      id: "src-6",
      name: "Manual Entry",
      type: "Manual",
      leads: 15,
      activeLeads: 9,
      converted: 0,
      rate: 0,
      status: "Active",
      createdAt: "Feb 15, 2026",
      description: "Manually entered leads from trade shows and events.",
    },
    {
      id: "src-7",
      name: "LinkedIn",
      type: "Social Media",
      leads: 7,
      activeLeads: 5,
      converted: 0,
      rate: 0,
      status: "Active",
      createdAt: "Mar 01, 2026",
      description: "B2B outbound messaging and LinkedIn lead forms.",
    },
  ];

  const [sources, setSources] = useState(() => {
    const saved = localStorage.getItem("leadflow_mock_sources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) return parsed;
      } catch (e) {}
    }
    return initialSources;
  });

  // Sync sources with localStorage
  useEffect(() => {
    localStorage.setItem("leadflow_mock_sources", JSON.stringify(sources));
  }, [sources]);

  // Toolbar States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Highest Leads");

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetSource, setTargetSource] = useState(null);
  const [sourceToUpdate, setSourceToUpdate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(forceOpenAddModal);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(forceOpenUpdateModal);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSingleDeleteOpen, setIsSingleDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Route Sync for /admin/lead-sources/add & /admin/lead-sources/update
  useEffect(() => {
    if (location.pathname === "/admin/lead-sources/add" || forceOpenAddModal) {
      setIsAddModalOpen(true);
    }
  }, [location.pathname, forceOpenAddModal]);

  useEffect(() => {
    if (location.pathname === "/admin/lead-sources/update" || forceOpenUpdateModal) {
      const sourceId = searchParams.get("id");
      if (sourceId) {
        const found = sources.find((s) => s.id === sourceId);
        if (found) setSourceToUpdate(found);
      } else if (sources.length > 0 && !sourceToUpdate) {
        setSourceToUpdate(sources[0]);
      }
      setIsUpdateModalOpen(true);
    }
  }, [location.pathname, searchParams, forceOpenUpdateModal]);

  // Summary Metrics
  const totalSourcesCount = sources.length;
  const totalLeadsSum = sources.reduce((acc, curr) => acc + (curr.leads || 0), 0);
  const convertedLeadsSum = sources.reduce((acc, curr) => acc + (curr.converted || 0), 0);
  const bestPerformingSourceObj = [...sources].sort((a, b) => (b.rate || 0) - (a.rate || 0))[0];
  const bestSourceTitle = bestPerformingSourceObj ? bestPerformingSourceObj.name : "Google Ads";

  // Filtered & Sorted Sources List
  const filteredSources = useMemo(() => {
    return sources
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (query) {
          const matchName = item.name.toLowerCase().includes(query);
          const matchType = item.type ? item.type.toLowerCase().includes(query) : false;
          if (!matchName && !matchType) return false;
        }
        if (selectedStatus !== "All" && item.status !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "Highest Leads") return (b.leads || 0) - (a.leads || 0);
        if (selectedSort === "Lowest Leads") return (a.leads || 0) - (b.leads || 0);
        if (selectedSort === "Highest Conv. Rate") return (b.rate || 0) - (a.rate || 0);
        if (selectedSort === "Newest First") return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  }, [sources, searchQuery, selectedStatus, selectedSort]);

  // Checkbox Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredSources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSources.map((s) => s.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = filteredSources.length > 0 && selectedIds.length === filteredSources.length;

  // Add Source Modal Handlers
  const handleOpenAddSource = () => {
    setIsAddModalOpen(true);
    if (location.pathname !== "/admin/lead-sources/add") {
      navigate("/admin/lead-sources/add");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (location.pathname === "/admin/lead-sources/add") {
      navigate("/admin/lead-sources");
    }
  };

  const handleCreateSourceSubmit = (newSource) => {
    setSources((prev) => [newSource, ...prev]);

    // Save to custom sources list for Add Lead dropdowns
    try {
      const stored = localStorage.getItem("leadflow_custom_sources");
      const currentList = stored ? JSON.parse(stored) : ["Meta Ads", "Google Ads", "Website", "WhatsApp", "Referral", "Manual Entry"];
      if (!currentList.includes(newSource.name)) {
        localStorage.setItem("leadflow_custom_sources", JSON.stringify([...currentList, newSource.name]));
      }
    } catch (e) {}

    setToastMessage(`Lead source '${newSource.name}' created successfully!`);
    setIsToastOpen(true);
    handleCloseAddModal();
  };

  // Update Source Modal Handlers
  const handleOpenEditSource = (sourceToEdit) => {
    setSourceToUpdate(sourceToEdit);
    setIsUpdateModalOpen(true);
    navigate(`/admin/lead-sources/update?id=${sourceToEdit.id}`);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSourceToUpdate(null);
    if (location.pathname === "/admin/lead-sources/update") {
      navigate("/admin/lead-sources");
    }
  };

  const handleUpdateSourceSubmit = (updatedSource) => {
    setSources((prev) =>
      prev.map((s) => (s.id === updatedSource.id ? updatedSource : s))
    );
    setToastMessage(`Lead source '${updatedSource.name}' updated successfully!`);
    setIsToastOpen(true);
    handleCloseUpdateModal();
  };

  // Details Modal Handler
  const handleOpenDetails = (sourceToView) => {
    setTargetSource(sourceToView);
    setIsDetailsModalOpen(true);
  };

  // Delete Modal Handlers
  const handleOpenSingleDelete = (sourceToDelete) => {
    setTargetSource(sourceToDelete);
    setIsSingleDeleteOpen(true);
  };

  const handleConfirmSingleDelete = () => {
    if (targetSource) {
      setSources((prev) => prev.filter((s) => s.id !== targetSource.id));
      setSelectedIds((prev) => prev.filter((id) => id !== targetSource.id));
      setToastMessage(`Lead source '${targetSource.name}' deleted successfully!`);
      setIsToastOpen(true);
      setIsSingleDeleteOpen(false);
      setTargetSource(null);
    }
  };

  const handleOpenBulkDelete = () => {
    setIsBulkDeleteOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const deletedCount = selectedIds.length;
    setSources((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setIsBulkDeleteOpen(false);
    setToastMessage(`${deletedCount} lead source(s) deleted successfully!`);
    setIsToastOpen(true);
  };

  const handleToggleStatus = (sourceToToggle) => {
    const newStatus = sourceToToggle.status === "Active" ? "Inactive" : "Active";
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceToToggle.id ? { ...s, status: newStatus } : s
      )
    );
    setToastMessage(`Source "${sourceToToggle.name}" ${newStatus === "Active" ? "activated" : "deactivated"}`);
    setIsToastOpen(true);
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ["Source Name", "Type", "Leads", "Active Leads", "Converted", "Conversion Rate (%)", "Status", "Created Date"];
    const rows = filteredSources.map((s) => [
      `"${s.name}"`,
      `"${s.type}"`,
      s.leads || 0,
      s.activeLeads || Math.round((s.leads || 0) * 0.65),
      s.converted || 0,
      `${s.rate || 0}%`,
      `"${s.status}"`,
      `"${s.createdAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lead_sources_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Lead sources data exported to CSV");
    setIsToastOpen(true);
  };

  return (
    <div className="lead-sources-page">
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Add Lead Source Card Modal */}
      <AddLeadSourceModal
        isOpen={isAddModalOpen || forceOpenAddModal || location.pathname === "/admin/lead-sources/add"}
        onClose={handleCloseAddModal}
        existingSources={sources}
        onAddSource={handleCreateSourceSubmit}
      />

      {/* Update Lead Source Card Modal */}
      <UpdateLeadSourceModal
        isOpen={isUpdateModalOpen || forceOpenUpdateModal || location.pathname === "/admin/lead-sources/update"}
        onClose={handleCloseUpdateModal}
        targetSource={sourceToUpdate || targetSource || sources[0]}
        existingSources={sources}
        onUpdateSource={handleUpdateSourceSubmit}
      />

      {/* Source Details Modal */}
      <SourceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        source={targetSource}
      />

      {/* Single Delete Confirmation Modal */}
      <Modal
        isOpen={isSingleDeleteOpen && targetSource !== null}
        onClose={() => setIsSingleDeleteOpen(false)}
        title="Confirm Delete Lead Source"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "#1b2559", lineHeight: "1.5" }}>
            Are you sure you want to delete lead source <strong>{targetSource?.name}</strong> ({targetSource?.type})? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setIsSingleDeleteOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c" }} onClick={handleConfirmSingleDelete}>
              Yes (Delete)
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        title="Confirm Delete"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "0.875rem", color: "#1b2559", lineHeight: "1.5" }}>
            Are you sure you want to delete all <strong>{selectedIds.length}</strong> selected lead sources? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button className="crm-btn crm-btn-secondary" onClick={() => setIsBulkDeleteOpen(false)}>Cancel</button>
            <button className="crm-btn crm-btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c" }} onClick={handleConfirmBulkDelete}>
              Yes (Delete)
            </button>
          </div>
        </div>
      </Modal>

      {/* Header Banner */}
      <div className="sources-header-banner">
        <div className="header-text-group">
          <p className="page-desc">
            Manage and analyze where your leads are coming from.
          </p>
        </div>

        {/* Top-Right CTA Actions */}
        <div className="header-actions-group">
          <button
            type="button"
            className="crm-btn crm-btn-primary btn-add-source-cta"
            onClick={handleOpenAddSource}
          >
            <Plus size={16} /> Add Source
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (4 Metric Cards) */}
      <SourceSummaryCards
        stats={{
          totalSources: totalSourcesCount,
          totalLeads: totalLeadsSum,
          convertedLeads: convertedLeadsSum,
          bestSource: bestSourceTitle,
        }}
      />

      {/* 1st Position: All Lead Sources Data Table */}
      <div className="crm-card source-directory-card">
        <div className="card-header-flex">
          <h3 className="section-title">
            <Share2 size={18} className="text-indigo" /> All Lead Sources
          </h3>
          <span className="section-count-pill">{filteredSources.length} Sources</span>
        </div>

        {/* Toolbar */}
        <SourceTableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedStatus("All");
            setSelectedSort("Highest Leads");
          }}
          selectedCount={selectedIds.length}
          onBulkDelete={handleOpenBulkDelete}
        />

        {/* Data Table */}
        <SourceDirectoryTable
          sources={filteredSources}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllSelected}
          onOpenDetails={handleOpenDetails}
          onOpenEdit={handleOpenEditSource}
          onToggleStatus={handleToggleStatus}
          onOpenDelete={handleOpenSingleDelete}
        />
      </div>

      {/* 2nd Position: Source Performance Section */}
      <SourcePerformanceCards
        sources={sources}
        onOpenDetails={handleOpenDetails}
        onOpenEdit={handleOpenEditSource}
        onToggleStatus={handleToggleStatus}
        onOpenDelete={handleOpenSingleDelete}
      />

      {/* 3rd Position: Lead Source Analytics Bar Chart Card */}
      <SourceAnalyticsChart sources={sources} />
    </div>
  );
};
