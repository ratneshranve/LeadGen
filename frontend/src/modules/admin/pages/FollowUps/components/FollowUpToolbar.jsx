import React from "react";
import { Search, RotateCcw, CheckCircle2, Trash2 } from "lucide-react";
import { salespersonOptions } from "../../Leads/data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const FollowUpToolbar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedAssignee,
  setSelectedAssignee,
  selectedType,
  setSelectedType,
  selectedDateFilter,
  setSelectedDateFilter,
  onResetFilters,
  salespersonName,
  selectedCount = 0,
  onBulkComplete,
  onBulkDelete,
  canDelete = false,
}) => {
  const reps = ["All", ...salespersonOptions.filter((s) => s !== "All")];
  const types = ["All", "Call", "WhatsApp", "Email", "Meeting", "Task"];
  const statuses = ["All", "Pending", "Completed", "Overdue"];
  const dateOptions = ["All", "Today", "Tomorrow", "This Week", "Overdue"];

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
    selectedAssignee !== "All" ||
    selectedType !== "All" ||
    selectedDateFilter !== "All";

  return (
    <div className="followup-toolbar-container" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
      {/* Selected Items Bulk Actions Action Banner */}
      {selectedCount > 0 && (
        <div
          className="bulk-actions-banner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d" }}>
              {selectedCount} item(s) selected
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="crm-btn crm-btn-success crm-btn-sm"
              onClick={onBulkComplete}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                borderColor: "#15803d",
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <CheckCircle2 size={14} /> Mark All as Completed ({selectedCount})
            </button>

            {canDelete && onBulkDelete && (
              <button
                type="button"
                className="crm-btn crm-btn-danger crm-btn-sm"
                onClick={onBulkDelete}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  borderColor: "#dc2626",
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <Trash2 size={14} /> Delete Selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Filter & Search Bar */}
      <div className="followup-toolbar-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        {/* Search Input */}
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: "260px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="crm-input search-input"
            placeholder="Search by lead name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-dropdowns-group" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="filter-select-wrapper" style={{ width: "130px" }}>
            <label className="filter-mini-label">Status</label>
            <CustomSelect
              size="sm"
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statuses}
            />
          </div>

          {!salespersonName && (
            <div className="filter-select-wrapper" style={{ width: "140px" }}>
              <label className="filter-mini-label">Assigned To</label>
              <CustomSelect
                size="sm"
                name="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                options={reps}
              />
            </div>
          )}

          <div className="filter-select-wrapper" style={{ width: "130px" }}>
            <label className="filter-mini-label">Type</label>
            <CustomSelect
              size="sm"
              name="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={types}
            />
          </div>

          <div className="filter-select-wrapper" style={{ width: "130px" }}>
            <label className="filter-mini-label">Date Filter</label>
            <CustomSelect
              size="sm"
              name="dateFilter"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              options={dateOptions}
            />
          </div>

          {hasActiveFilters && (
            <button
              className="crm-btn crm-btn-subtle crm-btn-sm reset-filter-btn"
              onClick={onResetFilters}
              title="Reset Filters"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
