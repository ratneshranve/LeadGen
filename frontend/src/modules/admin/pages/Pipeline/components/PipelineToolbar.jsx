import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { leadSourceOptions, leadTypeOptions, salespersonOptions } from "../../Leads/data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const PipelineToolbar = ({
  searchQuery,
  setSearchQuery,
  selectedAssignee,
  setSelectedAssignee,
  selectedSource,
  setSelectedSource,
  selectedType,
  setSelectedType,
  onResetFilters,
}) => {
  const assigneeOptions = ["All", "Unassigned", ...salespersonOptions.filter((s) => s !== "All")];

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedAssignee !== "All" ||
    selectedSource !== "All" ||
    selectedType !== "All";

  return (
    <div className="crm-card pipeline-toolbar-card" style={{ padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        {/* Search Bar */}
        <div className="pipeline-search-wrapper" style={{ minWidth: "260px", flex: "1 1 260px" }}>
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="crm-input search-input"
            placeholder="Search leads by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns in Single Horizontal Line with Inline Labels */}
        <div className="toolbar-filters-flex" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label className="filter-label" style={{ fontSize: "0.775rem", fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
              Assigned To:
            </label>
            <div style={{ width: "145px" }}>
              <CustomSelect
                size="sm"
                name="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                options={assigneeOptions}
              />
            </div>
          </div>

          <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label className="filter-label" style={{ fontSize: "0.775rem", fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
              Source:
            </label>
            <div style={{ width: "135px" }}>
              <CustomSelect
                size="sm"
                name="source"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                options={leadSourceOptions}
              />
            </div>
          </div>

          <div className="filter-item" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label className="filter-label" style={{ fontSize: "0.775rem", fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
              Lead Type:
            </label>
            <div style={{ width: "135px" }}>
              <CustomSelect
                size="sm"
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={leadTypeOptions}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              className="crm-btn crm-btn-subtle crm-btn-sm reset-btn"
              onClick={onResetFilters}
              title="Reset Filters"
              style={{ padding: "6px 12px" }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
