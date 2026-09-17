import React, { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  Eye,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  PhoneCall,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";
import { leadSourceOptions, leadTypeOptions, salespersonOptions } from "../../Leads/data/leadsMockData";
import { Badge } from "../../../../../components/ui/Badge";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

// Stage Config Array
export const stages = [
  { key: "New", label: "New", color: "#ff3b19", bg: "#fff1ee", icon: Sparkles },
  { key: "Contacted", label: "Contacted", color: "#8b5cf6", bg: "#f5f3ff", icon: PhoneCall },
  { key: "Follow-up", label: "Follow-up", color: "#d97706", bg: "#fffbeb", icon: Clock },
  { key: "Interested", label: "Interested", color: "#0891b2", bg: "#ecfeff", icon: Heart },
  { key: "Converted", label: "Converted", color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  { key: "Lost", label: "Lost", color: "#dc2626", bg: "#fff1f2", icon: XCircle },
];

export const PipelineTable = ({
  leads = [],
  isAdmin = true,
  selectedIds: propSelectedIds,
  setSelectedIds: propSetSelectedIds,
  onViewLead,
  onMoveStage,
  onOpenUpdateModal,
  onOpenBulkUpdateModal,
  onDeleteLead,
  onDeleteBulk,
}) => {
  // Toolbar Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");

  // Selection & Bulk Actions State (supports controlled or local state)
  const [internalSelectedIds, setInternalSelectedIds] = useState([]);
  const selectedIds = propSelectedIds !== undefined ? propSelectedIds : internalSelectedIds;
  const setSelectedIds = propSetSelectedIds || setInternalSelectedIds;
  const [bulkStage, setBulkStage] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stage Summary Counts
  const stageCounts = useMemo(() => {
    const counts = { All: leads.length };
    stages.forEach((s) => {
      counts[s.key] = leads.filter((l) => (l.status || l.stage) === s.key).length;
    });
    return counts;
  }, [leads]);

  // Filtering Calculation
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const currentStage = lead.status || lead.stage || "New";

      // Stage Filter
      if (selectedStage !== "All" && currentStage !== selectedStage) {
        return false;
      }

      // Source Filter
      if (selectedSource !== "All" && lead.source !== selectedSource) {
        return false;
      }

      // Lead Type Filter
      const leadType = lead.leadType || lead.type || "SMB";
      if (selectedType !== "All" && leadType !== selectedType) {
        return false;
      }

      // Assigned To Filter (Admin Only)
      if (isAdmin && selectedAssignee !== "All") {
        const rep = lead.salesperson || lead.assignedTo || "Unassigned";
        if (selectedAssignee === "Unassigned") {
          if (rep && rep !== "Unassigned") return false;
        } else if (rep !== selectedAssignee) {
          return false;
        }
      }

      // Date / Follow-up Filter
      if (selectedDateFilter !== "All") {
        const followup = lead.nextFollowUp || "";
        if (selectedDateFilter === "Today" && !followup.toLowerCase().includes("today")) return false;
        if (selectedDateFilter === "This Week" && (!followup || followup === "-")) return false;
        if (selectedDateFilter === "This Month" && (!followup || followup === "-")) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = lead.name ? lead.name.toLowerCase().includes(q) : false;
        const matchCompany = lead.company ? lead.company.toLowerCase().includes(q) : false;
        const matchPhone = lead.phone ? lead.phone.includes(q) : false;
        const matchEmail = lead.email ? lead.email.toLowerCase().includes(q) : false;
        if (!matchName && !matchCompany && !matchPhone && !matchEmail) return false;
      }

      return true;
    });
  }, [leads, selectedStage, selectedSource, selectedType, selectedAssignee, selectedDateFilter, searchQuery, isAdmin]);

  // Pagination Calculation
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Assigned Leads on Current Page
  const assignedPaginatedLeads = useMemo(() => {
    return paginatedLeads.filter((l) => {
      const rep = l.salesperson || l.assignedTo || "Unassigned";
      return rep !== "Unassigned";
    });
  }, [paginatedLeads]);

  const isAllAssignedSelected =
    assignedPaginatedLeads.length > 0 &&
    assignedPaginatedLeads.every((l) => selectedIds.includes(l.id));

  // Active filters check
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStage !== "All" ||
    selectedSource !== "All" ||
    selectedType !== "All" ||
    selectedAssignee !== "All" ||
    selectedDateFilter !== "All";

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStage("All");
    setSelectedSource("All");
    setSelectedType("All");
    setSelectedAssignee("All");
    setSelectedDateFilter("All");
    setCurrentPage(1);
  };

  // Checkbox Selection Handlers (Only Assigned Leads can be checked)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(assignedPaginatedLeads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (leadOrId) => {
    const leadId = typeof leadOrId === "object" ? leadOrId.id : leadOrId;
    const leadObj = leads.find((l) => l.id === leadId);
    const rep = leadObj ? (leadObj.salesperson || leadObj.assignedTo || "Unassigned") : "Unassigned";
    if (rep === "Unassigned") return;

    setSelectedIds((prev) =>
      prev.includes(leadId) ? prev.filter((i) => i !== leadId) : [...prev, leadId]
    );
  };

  // Bulk Stage Change Handler
  const handleBulkStageChange = (newStage) => {
    if (!newStage || selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      onMoveStage(id, newStage);
    });
    setSelectedIds([]);
    setBulkStage("");
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteBulk) {
      onDeleteBulk(selectedIds);
    } else if (onDeleteLead) {
      selectedIds.forEach((id) => onDeleteLead(id));
    }
    setSelectedIds([]);
  };

  const getStageColorStyle = (stageName) => {
    const st = stages.find((s) => s.key === stageName) || stages[0];
    return {
      color: st.color,
      backgroundColor: st.bg,
      border: `1px solid ${st.color}40`,
      fontWeight: 700,
    };
  };

  const getInitials = (nameStr) => {
    if (!nameStr || nameStr === "Unassigned") return "UA";
    return nameStr.split(" ").map((n) => n[0]).join("").substring(0, 2);
  };

  return (
    <div className="pipeline-table-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Stage Summary Cards (Compact Clickable Row) */}
      <div
        className="pipeline-stage-summary-bar"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px"
        }}
      >
        <div
          className={`crm-card stage-summary-pill ${selectedStage === "All" ? "active-pill" : ""}`}
          onClick={() => {
            setSelectedStage("All");
            setCurrentPage(1);
          }}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            border: selectedStage === "All" ? "2px solid var(--primary-600)" : "1px solid var(--border-color)",
            backgroundColor: selectedStage === "All" ? "rgba(79, 70, 229, 0.05)" : "#fff",
            borderRadius: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.725rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Total Leads
            </span>
            <Users size={15} color="#4f46e5" />
          </div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b", marginTop: "2px", display: "block" }}>
            {stageCounts.All}
          </span>
        </div>

        {stages.map((st) => {
          const Icon = st.icon;
          const isSelected = selectedStage === st.key;
          return (
            <div
              key={st.key}
              className={`crm-card stage-summary-pill ${isSelected ? "active-pill" : ""}`}
              onClick={() => {
                setSelectedStage(isSelected ? "All" : st.key);
                setCurrentPage(1);
              }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                border: isSelected ? `2px solid ${st.color}` : "1px solid var(--border-color)",
                backgroundColor: isSelected ? st.bg : "#fff",
                borderRadius: "8px",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.725rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  {st.label}
                </span>
                <Icon size={15} color={st.color} />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: st.color, marginTop: "2px", display: "block" }}>
                {stageCounts[st.key] || 0}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Single Consolidated Toolbar */}
      <div className="crm-card pipeline-toolbar-card" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div className="pipeline-search-wrapper" style={{ position: "relative", minWidth: "260px", flex: "1 1 260px" }}>
            <Search size={15} className="search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              className="crm-input search-input"
              placeholder="Search leads by name, phone, email or company..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: "36px", width: "100%" }}
            />
          </div>

          {/* Filters Group */}
          <div className="toolbar-filters-flex" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Stage Filter */}
            <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Stage:</label>
              <CustomSelect
                size="sm"
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "All", label: "All Stages" },
                  ...stages.map((s) => ({ value: s.key, label: s.label }))
                ]}
                style={{ width: "auto", minWidth: "120px" }}
              />
            </div>

            {/* Source Filter */}
            <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Source:</label>
              <CustomSelect
                size="sm"
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setCurrentPage(1);
                }}
                options={leadSourceOptions.map((opt) => ({ value: opt, label: opt }))}
                style={{ width: "auto", minWidth: "120px" }}
              />
            </div>

            {/* Lead Type Filter */}
            <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Type:</label>
              <CustomSelect
                size="sm"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                options={leadTypeOptions.map((opt) => ({ value: opt, label: opt }))}
                style={{ width: "auto", minWidth: "110px" }}
              />
            </div>

            {/* Assigned To Filter (Admin Only) */}
            {isAdmin && (
              <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Assigned To:</label>
                <CustomSelect
                  size="sm"
                  value={selectedAssignee}
                  onChange={(e) => {
                    setSelectedAssignee(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "All", label: "All Sales Employees" },
                    { value: "Unassigned", label: "Unassigned" },
                    ...salespersonOptions.filter((s) => s !== "All").map((rep) => ({ value: rep, label: rep }))
                  ]}
                  style={{ width: "auto", minWidth: "140px" }}
                />
              </div>
            )}

            {/* Date / Follow-up Filter */}
            <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Date:</label>
              <CustomSelect
                size="sm"
                value={selectedDateFilter}
                onChange={(e) => {
                  setSelectedDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "All", label: "All Dates" },
                  { value: "Today", label: "Today's Follow-up" },
                  { value: "This Week", label: "Has Follow-up" },
                ]}
                style={{ width: "auto", minWidth: "120px" }}
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                className="crm-btn crm-btn-subtle crm-btn-sm"
                onClick={handleResetFilters}
                title="Reset Filters"
                style={{ padding: "5px 12px", fontSize: "0.775rem" }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedIds.length > 0 && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 14px",
              backgroundColor: "#eef2ff",
              border: "1px solid #c7d2fe",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "#3730a3" }}>
              {selectedIds.length} assigned lead{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="crm-btn crm-btn-primary crm-btn-xs"
                onClick={() => onOpenBulkUpdateModal && onOpenBulkUpdateModal(selectedIds, () => setSelectedIds([]))}
                style={{ borderRadius: "8px", padding: "6px 16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Edit3 size={14} /> Edit Pipeline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Scalable CRM Pipeline Data Table */}
      <div className="crm-card sales-section-card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="table-responsive-container" style={{ overflowX: "auto" }}>
          <table className="crm-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ width: "40px", padding: "12px 16px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={isAllAssignedSelected}
                    onChange={handleSelectAll}
                    disabled={assignedPaginatedLeads.length === 0}
                    style={{ cursor: assignedPaginatedLeads.length > 0 ? "pointer" : "not-allowed" }}
                    title={assignedPaginatedLeads.length === 0 ? "No assigned leads on this page" : "Select all assigned leads"}
                  />
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", minWidth: "180px" }}>Lead Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Company / Organization</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Source</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Lead Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Stage</th>
                {isAdmin && <th style={{ padding: "12px 16px", textAlign: "left" }}>Assigned To</th>}
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Last Activity</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>Created On</th>
                <th style={{ padding: "12px 16px", textAlign: "center", width: "90px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((l) => {
                  const leadStage = l.status || l.stage || "New";
                  const leadType = l.leadType || l.type || "SMB";
                  const repName = l.salesperson || l.assignedTo || "Unassigned";
                  const isSelected = selectedIds.includes(l.id);

                  return (
                    <tr
                      key={l.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                        transition: "background-color 0.15s ease"
                      }}
                      className="pipeline-table-row"
                    >
                      {/* Checkbox (Only for Assigned Leads) */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(l)}
                          disabled={repName === "Unassigned"}
                          style={{
                            cursor: repName === "Unassigned" ? "not-allowed" : "pointer",
                            opacity: repName === "Unassigned" ? 0.35 : 1
                          }}
                          title={repName === "Unassigned" ? "Only assigned leads can be selected for pipeline changes" : ""}
                        />
                      </td>

                      {/* Lead Name & Phone */}
                      <td style={{ padding: "12px 16px", minWidth: "180px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong
                            onClick={() => onViewLead && onViewLead(l.id)}
                            style={{
                              fontSize: "0.9rem",
                              color: "#0f172a",
                              cursor: "pointer",
                              fontWeight: 700,
                              whiteSpace: "nowrap"
                            }}
                            className="hover-primary-text"
                          >
                            {l.name}
                          </strong>
                          {l.phone && (
                            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "1px" }}>
                              {l.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company */}
                      <td style={{ padding: "12px 16px" }}>
                        <strong style={{ fontSize: "0.825rem", color: "#334155" }}>
                          {l.company || "-"}
                        </strong>
                      </td>

                      {/* Source */}
                      <td style={{ padding: "12px 16px" }}>
                        <span className="source-tag" style={{ fontSize: "0.75rem" }}>
                          {l.source || "Website"}
                        </span>
                      </td>

                      {/* Lead Type */}
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: "0.725rem",
                            fontWeight: 700,
                            borderRadius: "5px",
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1"
                          }}
                        >
                          {leadType}
                        </span>
                      </td>

                      {/* Stage (Read-Only Badge in Table) */}
                      <td style={{ padding: "12px 16px" }}>
                        <Badge status={leadStage} />
                      </td>

                      {/* Assigned To (Admin Mode Only) */}
                      {isAdmin && (
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background:
                                  repName === "Unassigned"
                                    ? "#94a3b8"
                                    : "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)",
                                color: "#ffffff",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow:
                                  repName === "Unassigned"
                                    ? "none"
                                    : "0 2px 6px rgba(255, 69, 34, 0.25)",
                              }}
                            >
                              {getInitials(repName)}
                            </div>
                            <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#334155" }}>
                              {repName}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Last Activity */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "0.775rem", color: "#64748b" }}>
                          {l.lastActivity || "2 hours ago"}
                        </span>
                      </td>

                      {/* Created On */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "0.775rem", color: "#64748b" }}>
                          {l.createdDate || l.date || "Aug 24, 2026"}
                        </span>
                      </td>

                      {/* Actions: Single Update Icon Button (Only for Assigned Leads) */}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        {repName !== "Unassigned" ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <button
                              type="button"
                              className="crm-btn crm-btn-secondary crm-btn-xs"
                              onClick={() => onOpenUpdateModal && onOpenUpdateModal(l.id)}
                              title="Update Pipeline Stage"
                              style={{ padding: "6px 9px", color: "#ff3b19", borderColor: "#ffd2c7", borderRadius: "8px" }}
                            >
                              <Edit3 size={15} color="#ff3b19" />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} style={{ padding: "48px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>
                      No pipeline leads found matching your search or filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={handleResetFilters}
                        style={{ marginTop: "12px" }}
                      >
                        <RotateCcw size={14} /> Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        {filteredLeads.length > 0 && (
          <div
            style={{
              padding: "14px 20px",
              background: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            {/* Left: Counts */}
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLeads.length)} to{" "}
              {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
            </div>

            {/* Right: Page Size & Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.775rem", color: "#64748b" }}>Rows per page:</span>
                <CustomSelect
                  size="sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 10, label: "10" },
                    { value: 25, label: "25" },
                    { value: 50, label: "50" },
                  ]}
                  style={{ width: "70px", minWidth: "70px" }}
                />
              </div>

              {/* Page Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  className="crm-btn crm-btn-secondary crm-btn-xs"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "4px 8px", opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className={`crm-btn crm-btn-xs ${pg === currentPage ? "crm-btn-primary" : "crm-btn-secondary"}`}
                    onClick={() => setCurrentPage(pg)}
                    style={{ padding: "4px 9px", minWidth: "28px" }}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  className="crm-btn crm-btn-secondary crm-btn-xs"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "4px 8px", opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
