import React from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Video,
  CheckSquare,
  CheckCircle2,
  Edit3,
  Trash2
} from "lucide-react";

export const FollowUpTable = ({
  followups,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onMarkCompleted,
  onEditReschedule,
  onDeleteSingle,
  canDelete = true,
  onViewLead
}) => {
  const isAllSelected =
    followups.length > 0 && followups.every((item) => selectedIds.includes(item.id));

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call":
        return <Phone size={13} />;
      case "WhatsApp":
        return <MessageSquare size={13} />;
      case "Email":
        return <Mail size={13} />;
      case "Meeting":
        return <Video size={13} />;
      default:
        return <CheckSquare size={13} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "AS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="crm-card table-wrapper-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="table-responsive">
        <table className="crm-table followup-table">
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="crm-checkbox"
                />
              </th>
              <th>LEAD</th>
              <th>FOLLOW-UP AGENDA</th>
              <th>TYPE</th>
              <th>ASSIGNED TO</th>
              <th>DATE & TIME</th>
              <th>STATUS</th>
              <th style={{ textAlign: "right", paddingRight: "24px" }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {followups.length > 0 ? (
              followups.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isCompleted = item.status === "Completed";
                const isOverdue = item.status === "Overdue";
                const isToday = item.dateLabel === "Today" || item.date === "Sep 02, 2026" || item.dateStr === "2026-09-02";

                return (
                  <tr
                    key={item.id}
                    className={`followup-row ${isSelected ? "row-selected" : ""} ${
                      isCompleted ? "row-completed" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow(item.id)}
                        className="crm-checkbox"
                      />
                    </td>

                    {/* Lead Name & Company */}
                    <td>
                      <div className="lead-name-cell">
                        <span
                          className="lead-name-link"
                          style={{ fontWeight: 700, color: "#ff3b19", cursor: "pointer" }}
                          onClick={() => {
                            if (onViewLead) {
                              onViewLead(item);
                            }
                          }}
                          title="Click to view lead detail card"
                        >
                          {item.leadName}
                        </span>
                        <span className="lead-company" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {item.company}
                        </span>
                      </div>
                    </td>

                    {/* Follow-up Agenda / Notes */}
                    <td>
                      <p className="followup-notes-preview">
                        "{item.notes || "Follow-up discussion scheduled."}"
                      </p>
                    </td>

                    {/* Type */}
                    <td>
                      <span className={`channel-pill-sm ${item.type.toLowerCase()}`}>
                        {getTypeIcon(item.type)} {item.type}
                      </span>
                    </td>

                    {/* Assigned Salesperson */}
                    <td>
                      <div className="assignee-cell" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="assignee-avatar" style={{ background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.725rem", fontWeight: 800, boxShadow: "0 2px 6px rgba(255, 69, 34, 0.25)" }}>
                          {getInitials(item.assignedTo)}
                        </span>
                        <span className="assignee-name" style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.825rem" }}>
                          {item.assignedTo}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td>
                      <div className="date-time-cell">
                        <span className={`date-text ${isOverdue ? "text-overdue" : ""}`}>
                          {isToday && <span className="today-badge">Today</span>}
                          {item.date}
                        </span>
                        <span className="time-text">{item.time}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`followup-status-badge status-${item.status.toLowerCase()}`}>
                        {isCompleted && <CheckCircle2 size={12} />}
                        {item.status}
                      </span>
                    </td>

                    {/* Action CTAs: Only Update and Delete icons */}
                    <td style={{ textAlign: "right", paddingRight: "24px" }}>
                      <div className="action-buttons-flex" style={{ justifyContent: "flex-end" }}>
                        {/* Update Follow-up Button */}
                        <button
                          className="action-btn btn-reschedule"
                          onClick={() => onEditReschedule(item)}
                          title="Update Follow-up Status"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Delete Single Button */}
                        {canDelete && (
                          <button
                            className="action-btn btn-delete"
                            onClick={() => onDeleteSingle(item)}
                            title="Delete Follow-up"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="empty-table-cell">
                  <div className="empty-state-box">
                    <p style={{ fontWeight: 600, color: "#64748b" }}>No follow-up tasks found.</p>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Try adjusting your search query or status filter.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
