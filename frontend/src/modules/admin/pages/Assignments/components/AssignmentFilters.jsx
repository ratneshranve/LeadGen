import React from "react";
import { Search, RotateCcw, UserCheck } from "lucide-react";
import { leadStatusOptions, salespersonOptions } from "../../Leads/data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const AssignmentFilters = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedAssignee,
  setSelectedAssignee,
  onResetFilters,
  selectedCount = 0,
  onBulkAssign,
}) => {
  const assigneeOptions = ["All", "Unassigned", ...salespersonOptions.filter((s) => s !== "All")];

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedStatus !== "All" ||
    selectedAssignee !== "All";

  return (
    <div className="assignment-filters-bar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="crm-input search-input"
          placeholder="Search leads by name, company, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="filter-dropdowns-group">
        <div className="filter-select-wrapper">
          <label className="filter-mini-label">Sales Employee</label>
          <CustomSelect
            size="sm"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            options={assigneeOptions.map((assignee) => ({ value: assignee, label: assignee }))}
            style={{ minWidth: "150px" }}
          />
        </div>

        <div className="filter-select-wrapper">
          <label className="filter-mini-label">Lead Status</label>
          <CustomSelect
            size="sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={leadStatusOptions.map((st) => ({ value: st, label: st }))}
            style={{ minWidth: "130px" }}
          />
        </div>

        {/* Bulk Assign / Reassign Button */}
        {selectedCount > 0 && (
          <button
            type="button"
            className="crm-btn crm-btn-primary"
            style={{ padding: "6px 14px", borderRadius: "8px", fontWeight: 700 }}
            onClick={onBulkAssign}
          >
            <UserCheck size={15} /> Assign / Reassign ({selectedCount})
          </button>
        )}

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
  );
};
