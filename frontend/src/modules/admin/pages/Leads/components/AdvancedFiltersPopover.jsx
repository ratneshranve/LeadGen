import React from "react";
import { X, Filter, RotateCcw, Check } from "lucide-react";
import {
  leadStatusOptions,
  leadSourceOptions,
  salespersonOptions,
  leadTypeOptions,
  conversionStatusOptions
} from "../data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const AdvancedFiltersPopover = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onClear,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="advanced-filters-backdrop" onClick={onClose}>
      <div className="advanced-filters-popover" onClick={(e) => e.stopPropagation()}>
        <div className="popover-header">
          <div className="popover-title-row">
            <Filter size={16} className="text-indigo" />
            <h3>Advanced Filters</h3>
          </div>
          <button className="popover-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="popover-body">
          {/* Lead Status */}
          <div className="filter-group">
            <label className="filter-label">Lead Status</label>
            <CustomSelect
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={leadStatusOptions.map((opt) => ({ value: opt, label: opt }))}
            />
          </div>

          {/* Lead Source */}
          <div className="filter-group">
            <label className="filter-label">Lead Source</label>
            <CustomSelect
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              options={leadSourceOptions.map((opt) => ({ value: opt, label: opt }))}
            />
          </div>

          {/* Assigned Sales Employee */}
          <div className="filter-group">
            <label className="filter-label">Assigned Sales Employee</label>
            <CustomSelect
              value={filters.salesperson}
              onChange={(e) => setFilters({ ...filters, salesperson: e.target.value })}
              options={salespersonOptions.map((opt) => ({ value: opt, label: opt }))}
            />
          </div>

          {/* Lead Type */}
          <div className="filter-group">
            <label className="filter-label">Lead Type</label>
            <CustomSelect
              value={filters.leadType}
              onChange={(e) => setFilters({ ...filters, leadType: e.target.value })}
              options={leadTypeOptions.map((opt) => ({ value: opt, label: opt }))}
            />
          </div>

          {/* Conversion Status */}
          <div className="filter-group">
            <label className="filter-label">Conversion Status</label>
            <CustomSelect
              value={filters.conversionStatus}
              onChange={(e) => setFilters({ ...filters, conversionStatus: e.target.value })}
              options={conversionStatusOptions.map((opt) => ({ value: opt, label: opt }))}
            />
          </div>

          {/* Created Date Filter */}
          <div className="filter-group">
            <label className="filter-label">Created Date</label>
            <input
              type="date"
              className="crm-input"
              value={filters.createdDate || ""}
              onChange={(e) => setFilters({ ...filters, createdDate: e.target.value })}
            />
          </div>

          {/* Follow-up Date Filter */}
          <div className="filter-group">
            <label className="filter-label">Follow-up Date</label>
            <input
              type="date"
              className="crm-input"
              value={filters.followupDate || ""}
              onChange={(e) => setFilters({ ...filters, followupDate: e.target.value })}
            />
          </div>
        </div>

        <div className="popover-footer">
          <button className="crm-btn crm-btn-secondary" onClick={onClear}>
            <RotateCcw size={14} /> Clear Filters
          </button>
          <button className="crm-btn crm-btn-primary" onClick={onApply}>
            <Check size={14} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
