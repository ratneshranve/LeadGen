import React from "react";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const SourceTableToolbar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSort,
  setSelectedSort,
  onResetFilters,
  selectedCount = 0,
  onBulkDelete,
}) => {
  const statuses = ["All", "Active", "Inactive"];
  const sortOptions = ["Highest Leads", "Lowest Leads", "Highest Conv. Rate", "Newest First"];

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
    selectedSort !== "Highest Leads";

  return (
    <div className="source-table-toolbar" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
      {/* Search Bar */}
      <div className="search-input-wrapper" style={{ flex: 1, minWidth: "220px", marginBottom: "0px" }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="crm-input search-input"
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: "36px", fontSize: "0.8rem" }}
        />
      </div>

      {/* Filter & Sort Controls */}
      <div className="filter-dropdowns-group" style={{ display: "flex", alignItems: "flex-end", gap: "10px", flexWrap: "wrap" }}>
        <div className="filter-select-wrapper" style={{ width: "120px" }}>
          <label style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#7090b0", marginBottom: "4px", display: "block" }}>Status</label>
          <CustomSelect
            size="sm"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statuses}
          />
        </div>

        <div className="filter-select-wrapper" style={{ width: "160px" }}>
          <label style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#7090b0", marginBottom: "4px", display: "block" }}>Sort</label>
          <CustomSelect
            size="sm"
            name="sort"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            options={sortOptions}
          />
        </div>

        {/* Delete Selected Button when checkboxes are checked */}
        {selectedCount > 0 && (
          <button
            type="button"
            className="crm-btn"
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              borderColor: "#fecdd3",
              padding: "6px 12px",
              height: "36px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              alignSelf: "flex-end"
            }}
            onClick={onBulkDelete}
            title="Delete Selected Sources"
          >
            <Trash2 size={15} color="#dc2626" /> Delete Selected ({selectedCount})
          </button>
        )}

        {hasActiveFilters && (
          <button
            className="crm-btn crm-btn-subtle crm-btn-sm reset-filter-btn"
            onClick={onResetFilters}
            title="Clear Filters"
            style={{ height: "36px", padding: "6px 12px", alignSelf: "flex-end" }}
          >
            <RotateCcw size={13} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
