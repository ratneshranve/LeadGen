import React from "react";
import { Search, RotateCcw, Trash2, Calendar } from "lucide-react";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const UserDirectoryToolbar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedSort,
  setSelectedSort,
  dobFilter,
  setDobFilter,
  onResetFilters,
  selectedCount = 0,
  onBulkDelete,
}) => {
  const statuses = ["All", "Active", "Inactive"];
  const sortOptions = ["Newest First", "Name A-Z", "Name Z-A"];

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
    selectedSort !== "Newest First" ||
    (dobFilter && dobFilter !== "");

  return (
    <div className="user-directory-toolbar" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
      {/* Search Input */}
      <div className="search-input-wrapper" style={{ flex: 1, minWidth: "220px", marginBottom: "0px" }}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="crm-input search-input"
          placeholder="Search sales employees by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: "36px", fontSize: "0.8rem" }}
        />
      </div>

      {/* Filter Dropdowns & Actions */}
      <div className="filter-dropdowns-group" style={{ display: "flex", alignItems: "flex-end", gap: "10px", flexWrap: "wrap" }}>
        {/* DOB Filter Input */}
        <div className="filter-select-wrapper">
          <label style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#7090b0", marginBottom: "4px", display: "block" }}>
            DOB
          </label>
          <input
            type="date"
            className="crm-input select-input"
            value={dobFilter || ""}
            onChange={(e) => setDobFilter(e.target.value)}
            style={{ padding: "4px 8px", fontSize: "0.8rem", height: "36px", borderRadius: "8px", minWidth: "130px" }}
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="filter-select-wrapper">
          <label style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#7090b0", marginBottom: "4px", display: "block" }}>
            Status
          </label>
          <CustomSelect
            size="sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statuses.map((st) => ({ value: st, label: st }))}
            style={{ minWidth: "110px" }}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="filter-select-wrapper">
          <label style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "#7090b0", marginBottom: "4px", display: "block" }}>
            Sort
          </label>
          <CustomSelect
            size="sm"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            options={sortOptions.map((so) => ({ value: so, label: so }))}
            style={{ minWidth: "130px" }}
          />
        </div>

        {/* Delete Selected Button */}
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
            title="Delete Selected Sales Employees"
          >
            <Trash2 size={15} color="#dc2626" /> Delete ({selectedCount})
          </button>
        )}

        {/* Clear Filters Button */}
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
