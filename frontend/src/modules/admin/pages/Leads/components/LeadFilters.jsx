import React, { useState } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, RotateCcw, Trash2 } from "lucide-react";
import { leadStatusOptions, leadTypeOptions } from "../data/leadsMockData";
import { AdvancedFiltersPopover } from "./AdvancedFiltersPopover";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const LeadFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  sortOption,
  setSortOption,
  onResetFilters,
  hasActiveFilters,
  selectedCount = 0,
  onBulkDelete,
  sourceOptions = [],
  salespersonOptions: salespersons = [],
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const sources = sourceOptions;

  return (
    <div className="toolbar-container">
      <div className="toolbar-top-row" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {/* Left: Compact Search Bar */}
        <div className="search-box" style={{ width: "220px", maxWidth: "100%" }}>
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ height: "36px", fontSize: "0.8rem", paddingLeft: "32px" }}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>

        {/* Right Controls: Compact Inline Dropdowns */}
        <div className="toolbar-controls" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Status Quick Filter */}
          <div style={{ width: "135px" }}>
            <CustomSelect
              size="sm"
              name="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: "All", label: "Status: All" },
                { value: "Active", label: "Active Leads" },
                ...leadStatusOptions.filter(s => s !== "All").map((opt) => ({ value: opt, label: opt })),
              ]}
            />
          </div>

          {/* Source Quick Filter */}
          <div style={{ width: "135px" }}>
            <CustomSelect
              size="sm"
              name="source"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              options={[
                { value: "All", label: "Source: All" },
                ...sources.map((opt) => ({ value: opt, label: opt })),
              ]}
            />
          </div>

          {/* Salesperson Quick Filter */}
          <div style={{ width: "135px" }}>
            <CustomSelect
              size="sm"
              name="salesperson"
              value={filters.salesperson}
              onChange={(e) => setFilters({ ...filters, salesperson: e.target.value })}
              options={[
                { value: "All", label: "Rep: All" },
                ...salespersons.map((opt) => ({ value: opt, label: opt })),
              ]}
            />
          </div>

          {/* Lead Type Quick Filter */}
          <div style={{ width: "135px" }}>
            <CustomSelect
              size="sm"
              name="leadType"
              value={filters.leadType}
              onChange={(e) => setFilters({ ...filters, leadType: e.target.value })}
              options={[
                { value: "All", label: "Type: All" },
                ...leadTypeOptions.filter(s => s !== "All").map((opt) => ({ value: opt, label: opt })),
              ]}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ width: "145px" }}>
            <CustomSelect
              size="sm"
              icon={ArrowUpDown}
              name="sortOption"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "name_asc", label: "Name (A-Z)" },
                { value: "name_desc", label: "Name (Z-A)" },
              ]}
            />
          </div>

          {/* More Filters Toggle Button */}
          <button
            className={`crm-btn ${hasActiveFilters ? "crm-btn-subtle" : "crm-btn-secondary"} filter-toggle-btn`}
            onClick={() => setIsAdvancedOpen(true)}
            style={{ height: "36px", padding: "6px 12px", fontSize: "0.8rem" }}
          >
            <SlidersHorizontal size={14} />
            <span>More Filters</span>
            {hasActiveFilters && <span className="active-filter-dot" />}
          </button>

          {/* Clean Delete Selected Button when checkboxes are checked */}
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
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.15)"
              }}
              onClick={onBulkDelete}
              title="Delete Selected Leads"
            >
              <Trash2 size={15} color="#dc2626" /> Delete ({selectedCount})
            </button>
          )}

          {/* Clear Filters Button (If Active) */}
          {hasActiveFilters && (
            <button className="crm-btn crm-btn-secondary reset-btn" onClick={onResetFilters} title="Reset all filters" style={{ height: "36px", padding: "6px 10px" }}>
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Popover Modal/Drawer */}
      <AdvancedFiltersPopover
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onClear={() => {
          onResetFilters();
          setIsAdvancedOpen(false);
        }}
        onApply={() => setIsAdvancedOpen(false)}
      />
    </div>
  );
};
