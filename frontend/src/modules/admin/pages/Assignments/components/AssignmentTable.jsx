import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, RefreshCw, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const AssignmentTable = ({
  leads,
  selectedLeadIds,
  onSelectAll,
  onSelectLead,
  isAllSelected,
  onOpenAssignModal,
}) => {
  const navigate = useNavigate();

  // Pagination state inside AssignmentTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination to page 1 if leads list length or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [leads.length]);

  const getInitials = (name) => {
    if (!name || name === "Unassigned") return "UA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const totalItems = leads.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = leads.slice(startIndex, startIndex + pageSize);

  const startItem = totalItems === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const isCurrentPageAllSelected =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((l) => selectedLeadIds.includes(l.id));

  const handleSelectCurrentPageAll = () => {
    if (isCurrentPageAllSelected) {
      // Unselect current page items
      const pageIds = paginatedLeads.map((l) => l.id);
      const updated = selectedLeadIds.filter((id) => !pageIds.includes(id));
      onSelectAll(updated);
    } else {
      // Select current page items
      const pageIds = paginatedLeads.map((l) => l.id);
      const updated = Array.from(new Set([...selectedLeadIds, ...pageIds]));
      onSelectAll(updated);
    }
  };

  return (
    <div className="table-wrapper-with-pagination">
      <div className="table-responsive-container">
        <table className="crm-table assignment-table">
          <thead>
            <tr>
              <th className="col-checkbox" style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  checked={isCurrentPageAllSelected}
                  onChange={handleSelectCurrentPageAll}
                  className="crm-checkbox"
                />
              </th>
              <th style={{ width: "240px" }}>LEAD DETAILS</th>
              <th style={{ width: "130px" }}>SOURCE</th>
              <th style={{ width: "120px" }}>STATUS</th>
              <th style={{ width: "190px" }}>CURRENT ASSIGNEE (OWNER)</th>
              <th style={{ width: "120px" }}>CREATED</th>
              <th className="col-actions text-center" style={{ width: "160px" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const isUnassigned = !lead.salesperson || lead.salesperson === "Unassigned";

                return (
                  <tr key={lead.id} className={isSelected ? "row-selected" : ""}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectLead(lead.id)}
                        className="crm-checkbox"
                      />
                    </td>

                    {/* Lead Details */}
                    <td>
                      <div className="lead-name-cell">
                        <span
                          className="lead-name-text"
                          style={{ fontWeight: 700, color: "#0f172a" }}
                        >
                          {lead.name}
                        </span>
                        <span className="lead-company" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {lead.company}
                        </span>
                      </div>
                    </td>

                    {/* Source */}
                    <td>
                      <span className="source-tag">{lead.source}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <Badge status={lead.status} />
                    </td>

                    {/* Current Assignee (Owner) */}
                    <td>
                      {isUnassigned ? (
                        <span className="unassigned-badge" style={{ color: "#ef4444", background: "#fef2f2", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                          <UserX size={12} /> Unassigned
                        </span>
                      ) : (
                        <div className="assignee-cell" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="assignee-avatar" style={{ background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.725rem", fontWeight: 800, boxShadow: "0 2px 6px rgba(255, 69, 34, 0.25)" }}>
                            {getInitials(lead.salesperson)}
                          </span>
                          <span className="assignee-name" style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.825rem" }}>
                            {lead.salesperson}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td>
                      <span className="created-date" style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {lead.createdDate || "Aug 25, 2026"}
                      </span>
                    </td>

                    {/* Actions: Direct Assign/Reassign Button ONLY (Eye Button Removed) */}
                    <td className="col-actions text-center">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isUnassigned ? (
                          <button
                            type="button"
                            className="crm-btn crm-btn-primary crm-btn-xs"
                            onClick={() => onOpenAssignModal([lead.id])}
                            title="Assign Lead to Sales Employee"
                            style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem" }}
                          >
                            <UserCheck size={13} /> Assign
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="crm-btn crm-btn-secondary crm-btn-xs"
                            onClick={() => onOpenAssignModal([lead.id])}
                            title="Reassign Lead to another Sales Employee"
                            style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem", borderColor: "#cbd5e1" }}
                          >
                            <RefreshCw size={13} color="#ff3b19" /> Reassign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="empty-table-cell text-center" style={{ padding: "40px", color: "#64748b" }}>
                  No lead records found matching current assignment filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar for Lead Assignment Table */}
      <div className="pagination-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #e2e8f0", marginTop: "4px" }}>
        <div className="pagination-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="pagination-info" style={{ fontSize: "0.825rem", color: "#64748b" }}>
            Showing <strong style={{ color: "#0f172a" }}>{startItem}-{endItem}</strong> of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> leads
          </span>

          <div className="page-size-selector" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.825rem", color: "#64748b" }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="crm-input"
              style={{ height: "32px", fontSize: "0.8rem", padding: "0 24px 0 8px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="pagination-right" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            className="crm-btn crm-btn-secondary crm-btn-xs"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            title="Previous Page"
            style={{ padding: "6px 10px", opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            <ChevronLeft size={15} /> Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Only show reasonable number of page buttons
            if (totalPages > 7 && Math.abs(currentPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
              return null;
            }
            return (
              <button
                key={pageNum}
                className={`crm-btn crm-btn-xs ${currentPage === pageNum ? "crm-btn-primary" : "crm-btn-secondary"}`}
                onClick={() => setCurrentPage(pageNum)}
                style={{ padding: "4px 10px", minWidth: "30px", fontWeight: currentPage === pageNum ? 800 : 500 }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="crm-btn crm-btn-secondary crm-btn-xs"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Next Page"
            style={{ padding: "6px 10px", opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
