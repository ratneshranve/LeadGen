import React from "react";
import { RotateCcw } from "lucide-react";
import { salespersonOptions } from "../../Leads/data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const CalendarFilters = ({
  selectedAssignee,
  setSelectedAssignee,
  selectedType,
  setSelectedType,
  selectedMonth,
  setSelectedMonth,
  selectedDateFilter,
  setSelectedDateFilter,
  onResetFilters,
  salespersonName,
}) => {
  const reps = ["All", ...salespersonOptions.filter((s) => s !== "All")];
  const types = ["All", "Call", "Meeting", "WhatsApp", "Email"];
  const months = [
    "All", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const hasActive =
    selectedAssignee !== "All" ||
    selectedType !== "All" ||
    selectedMonth !== "All" ||
    selectedDateFilter !== "";

  return (
    <div className="crm-card calendar-filters-card">
      <div
        className="filters-grid"
        style={{
          display: "grid",
          gridTemplateColumns: salespersonName ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr 1fr auto",
          gap: "14px",
          alignItems: "flex-end"
        }}
      >
        {!salespersonName && (
          <div className="filter-select-item">
            <label className="filter-lbl">Assigned To</label>
            <CustomSelect
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              options={reps.map((r) => ({ value: r, label: r }))}
            />
          </div>
        )}

        <div className="filter-select-item">
          <label className="filter-lbl">Activity Type</label>
          <CustomSelect
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={types.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="filter-select-item">
          <label className="filter-lbl">Filter By Month</label>
          <CustomSelect
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={months.map((m) => ({ value: m, label: m }))}
          />
        </div>

        <div className="filter-select-item">
          <label className="filter-lbl">Filter By Specific Date</label>
          <input
            type="date"
            className="crm-input"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            placeholder="Select date"
          />
        </div>

        {hasActive && (
          <button
            className="crm-btn crm-btn-subtle crm-btn-sm reset-filter-btn"
            onClick={onResetFilters}
            style={{ marginBottom: "2px" }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>
    </div>
  );
};
