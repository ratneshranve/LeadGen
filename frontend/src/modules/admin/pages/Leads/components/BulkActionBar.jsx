import React from "react";
import { UserCheck, RefreshCw, Trash2, X, CheckSquare } from "lucide-react";

export const BulkActionBar = ({
  selectedCount,
  onClearSelection,
  onBulkAssign,
  onBulkStatusChange,
  onBulkDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar">
      <div className="bulk-left">
        <CheckSquare size={18} className="text-indigo" />
        <span className="bulk-count-text">
          <strong>{selectedCount}</strong> {selectedCount === 1 ? "lead" : "leads"} selected
        </span>
      </div>

      <div className="bulk-actions">
        <button className="crm-btn crm-btn-secondary bulk-btn" onClick={onBulkAssign}>
          <UserCheck size={14} /> Assign Rep
        </button>
        <button className="crm-btn crm-btn-secondary bulk-btn" onClick={onBulkStatusChange}>
          <RefreshCw size={14} /> Change Status
        </button>
        <button className="crm-btn crm-btn-secondary bulk-btn text-rose" onClick={onBulkDelete}>
          <Trash2 size={14} /> Delete
        </button>
        <button className="bulk-clear-btn" onClick={onClearSelection} title="Clear Selection">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
