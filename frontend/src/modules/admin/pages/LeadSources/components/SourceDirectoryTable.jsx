import React from "react";
import {
  Share2,
  Globe,
  Share,
  Users,
  MessageSquare,
  FileSpreadsheet,
  FolderKanban,
  Edit3,
  Trash2
} from "lucide-react";

export const SourceDirectoryTable = ({
  sources,
  selectedIds,
  onSelectAll,
  onSelectRow,
  isAllSelected,
  onOpenDetails,
  onOpenEdit,
  onOpenDelete,
}) => {
  const getSourceIcon = (name, type) => {
    const n = name.toLowerCase();
    if (n.includes("google")) return <Share2 size={15} className="icon-google" />;
    if (n.includes("meta") || n.includes("facebook")) return <Share size={15} className="icon-meta" />;
    if (n.includes("website") || type === "Website") return <Globe size={15} className="icon-website" />;
    if (n.includes("referral")) return <Users size={15} className="icon-referral" />;
    if (n.includes("whatsapp")) return <MessageSquare size={15} className="icon-whatsapp" />;
    if (n.includes("manual")) return <FileSpreadsheet size={15} className="icon-manual" />;
    if (n.includes("linkedin")) return <Globe size={15} className="icon-linkedin" />;
    return <FolderKanban size={15} className="icon-other" />;
  };

  return (
    <div className="table-responsive-container">
      <table className="crm-table source-directory-table">
        <thead>
          <tr>
            <th className="col-checkbox" style={{ width: "40px" }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="crm-checkbox"
              />
            </th>
            <th style={{ width: "220px" }}>Source</th>
            <th style={{ width: "110px" }}>Leads</th>
            <th style={{ width: "120px" }}>Active Leads</th>
            <th style={{ width: "110px" }}>Converted</th>
            <th style={{ width: "140px" }}>Conversion Rate</th>
            <th style={{ width: "110px" }}>Status</th>
            <th style={{ width: "130px" }}>Created</th>
            <th className="col-actions text-center" style={{ width: "120px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sources.length > 0 ? (
            sources.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <tr key={item.id} className={isSelected ? "row-selected" : ""} style={{ cursor: "pointer" }} onClick={() => onOpenEdit(item)}>
                  <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(item.id)}
                      className="crm-checkbox"
                    />
                  </td>

                  {/* Source Name & Icon */}
                  <td>
                    <div className="source-table-cell">
                      <span className="source-icon-badge">
                        {getSourceIcon(item.name, item.type)}
                      </span>
                      <div className="source-name-flex">
                        <span className="source-name-link" style={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.name}
                        </span>
                        <span className="source-type-subtext">{item.type || "Advertising"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Leads Count */}
                  <td>
                    <span className="count-bold-text">{item.leads}</span>
                  </td>

                  {/* Active Leads */}
                  <td>
                    <span className="count-subtle-text">{item.activeLeads || Math.round(item.leads * 0.65)}</span>
                  </td>

                  {/* Converted */}
                  <td>
                    <span className="count-emerald-text">{item.converted}</span>
                  </td>

                  {/* Conversion Rate */}
                  <td>
                    <span className="count-indigo-text">{item.rate}%</span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`status-badge-chip ${item.status === "Active" ? "status-active" : "status-inactive"}`}>
                      <span className="status-dot" /> {item.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td>
                    <span className="date-sub-text">{item.createdAt || "Jan 12, 2026"}</span>
                  </td>

                  {/* Direct Action Buttons: Edit Pencil & Delete Trash */}
                  <td className="col-actions text-center" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onOpenEdit(item)}
                        title="Edit Source & Change Status/Name"
                        style={{ padding: "6px 10px", borderRadius: "8px" }}
                      >
                        <Edit3 size={15} color="#ff3b19" />
                      </button>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onOpenDelete(item)}
                        title="Delete Source"
                        style={{ padding: "6px 10px", borderRadius: "8px", borderColor: "#fecdd3", backgroundColor: "#fef2f2" }}
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
              <td colSpan={9} className="empty-table-cell text-center" style={{ padding: "40px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  No lead sources found
                </p>
                <span style={{ fontSize: "0.775rem", color: "var(--text-subtle)", display: "block", marginTop: "2px" }}>
                  Try adjusting your search or filters.
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
