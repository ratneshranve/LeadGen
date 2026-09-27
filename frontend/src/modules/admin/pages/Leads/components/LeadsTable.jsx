import React from "react";
import { Phone, Mail, Calendar, Globe, MessageSquare, Share2, Search, Edit3, Trash2 } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const LeadsTable = ({
  leads,
  selectedLeadIds,
  onSelectLead,
  onSelectAll,
  isAllSelected,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onResetFilters
}) => {
  const getSourceIcon = (source) => {
    switch (source) {
      case "Meta Ads":
        return <span className="source-icon meta-icon">f</span>;
      case "Google Ads":
        return <span className="source-icon google-icon">G</span>;
      case "Website":
        return <Globe size={13} className="source-icon web-icon" />;
      case "WhatsApp":
        return <MessageSquare size={13} className="source-icon wa-icon" />;
      case "Referral":
        return <Share2 size={13} className="source-icon ref-icon" />;
      default:
        return <Search size={13} className="source-icon manual-icon" />;
    }
  };

  const getCategoryStyles = (category = "SMB") => {
    const cat = category.toUpperCase();
    if (cat.includes("ENTERPRISE")) {
      return { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" };
    }
    if (cat.includes("STARTUP")) {
      return { bg: "#f3e8ff", color: "#7e22ce", border: "#e9d5ff" };
    }
    if (cat.includes("RETAIL")) {
      return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
    }
    if (cat.includes("REAL ESTATE")) {
      return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
    }
    return { bg: "#f1f5f9", color: "#334155", border: "#cbd5e1" };
  };

  return (
    <div className="table-responsive leads-table-wrapper">
      <table className="crm-table leads-data-table">
        <thead>
          <tr>
            <th style={{ width: "40px", textAlign: "center" }}>
              <input
                type="checkbox"
                className="crm-checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
              />
            </th>
            <th style={{ minWidth: "160px" }}>FULL NAME</th>
            <th style={{ minWidth: "150px" }}>PHONE NUMBER</th>
            <th style={{ minWidth: "180px" }}>EMAIL ADDRESS</th>
            <th style={{ minWidth: "130px" }}>LEAD SOURCE</th>
            <th style={{ minWidth: "110px" }}>LEAD STATUS</th>
            <th style={{ minWidth: "120px" }}>LEAD CATEGORY</th>
            <th style={{ minWidth: "110px" }}>AI SCORE</th>
            <th style={{ minWidth: "180px" }}>ASSIGNED SALES EMPLOYEE</th>
            <th style={{ minWidth: "100px", textAlign: "center" }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {leads && leads.length > 0 ? (
            leads.map((lead) => {
              const isSelected = selectedLeadIds ? selectedLeadIds.includes(lead.id) : false;
              const categoryName = lead.category || lead.leadType || "SMB";
              const catStyle = getCategoryStyles(categoryName);
              const assignedName = lead.salesperson || "Unassigned";

              return (
                <tr
                  key={lead.id}
                  className={isSelected ? "selected-row" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => onViewLead && onViewLead(lead)}
                >
                  <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="crm-checkbox"
                      checked={isSelected}
                      onChange={() => onSelectLead && onSelectLead(lead.id)}
                    />
                  </td>

                  {/* Full Name */}
                  <td>
                    <span style={{ fontWeight: 700, color: "#1b2559", fontSize: "0.875rem" }}>
                      {lead.name}
                    </span>
                  </td>

                  {/* Phone Number */}
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "#1b2559", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Phone size={12} color="#7090b0" /> {lead.phone}
                    </span>
                  </td>

                  {/* Email Address */}
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "#1b2559", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Mail size={12} color="#7090b0" /> {lead.email}
                    </span>
                  </td>

                  {/* Lead Source */}
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {getSourceIcon(lead.source)}
                      <span style={{ fontSize: "0.825rem", color: "#1b2559", fontWeight: 600 }}>
                        {lead.source}
                      </span>
                    </div>
                  </td>

                  {/* Lead Status Badge */}
                  <td>
                    <Badge status={lead.status} />
                  </td>

                  {/* Lead Category */}
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        fontSize: "0.725rem",
                        fontWeight: 700,
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        backgroundColor: catStyle.bg,
                        color: catStyle.color,
                        border: `1px solid ${catStyle.border}`
                      }}
                    >
                      {categoryName}
                    </span>
                  </td>

                  {/* AI Lead Score / Priority (ML scoring service - null until scored) */}
                  <td>
                    {lead.score !== null && lead.score !== undefined ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 9px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          borderRadius: "6px",
                          backgroundColor: lead.priority === "High" ? "#f0fdf4" : lead.priority === "Medium" ? "#fffbeb" : "#f1f5f9",
                          color: lead.priority === "High" ? "#15803d" : lead.priority === "Medium" ? "#b45309" : "#475569",
                          border: `1px solid ${lead.priority === "High" ? "#bbf7d0" : lead.priority === "Medium" ? "#fde68a" : "#e2e8f0"}`,
                        }}
                        title={`${lead.priority || ""} priority`}
                      >
                        {lead.score}/100
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Scoring…</span>
                    )}
                  </td>

                  {/* Assigned Sales Employee */}
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        {assignedName !== "Unassigned" ? assignedName.charAt(0) : "U"}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.825rem" }}>
                        {assignedName}
                      </span>
                    </div>
                  </td>

                  {/* Row Actions (Edit & Delete Icons) */}
                  <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onEditLead && onEditLead(lead)}
                        title="Edit Lead Details"
                        style={{ padding: "6px 8px", borderRadius: "8px" }}
                      >
                        <Edit3 size={15} color="#ff3b19" />
                      </button>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onDeleteLead && onDeleteLead(lead)}
                        title="Delete Lead"
                        style={{ padding: "6px 8px", borderRadius: "8px", borderColor: "#fecdd3", backgroundColor: "#fef2f2" }}
                      >
                        <Trash2 size={15} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={10} className="empty-table-cell text-center" style={{ padding: "45px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "2rem" }}>📂</span>
                  <p style={{ fontSize: "0.925rem", color: "#334155", fontWeight: 700, margin: 0 }}>
                    No leads found matching your criteria
                  </p>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Try clearing search or selecting a different status/source filter.
                  </span>
                  {onResetFilters && (
                    <button
                      type="button"
                      className="crm-btn crm-btn-secondary crm-btn-sm"
                      onClick={onResetFilters}
                      style={{ marginTop: "6px", borderRadius: "8px" }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
