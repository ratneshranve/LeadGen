import React from "react";
import { SearchX, RotateCcw } from "lucide-react";

export const LeadsEmptyState = ({ onResetFilters }) => {
  return (
    <div className="leads-empty-state">
      <div className="empty-icon-circle">
        <SearchX size={32} />
      </div>
      <h3 className="empty-title">No leads found</h3>
      <p className="empty-subtitle">
        We couldn't find any leads matching your current search terms or filter criteria.
      </p>
      <button className="crm-btn crm-btn-primary" onClick={onResetFilters}>
        <RotateCcw size={15} /> Clear All Filters
      </button>
    </div>
  );
};
