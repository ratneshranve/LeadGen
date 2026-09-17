import React from "react";
import { Edit3, Trash2, Phone, Mail, Calendar } from "lucide-react";

export const UserDirectoryTable = ({
  users,
  selectedUserIds = [],
  onSelectUser,
  onSelectAll,
  isAllSelected,
  onViewUserCard,
  onEditUser,
  onDeleteUser,
}) => {
  const getInitials = (name) => {
    if (!name) return "SP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getRoleBadgeClass = (role) => {
    return role === "Admin" ? "role-master-admin" : "role-rep";
  };

  const formatDob = (dobStr) => {
    if (!dobStr) return "15 Aug 1995";
    try {
      const date = new Date(dobStr);
      if (isNaN(date.getTime())) return dobStr;
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
      return dobStr;
    }
  };

  return (
    <div className="table-responsive-container">
      <table className="crm-table user-directory-table">
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
            <th style={{ minWidth: "180px" }}>FULL NAME</th>
            <th style={{ minWidth: "140px" }}>PHONE NUMBER</th>
            <th style={{ minWidth: "180px" }}>EMAIL ADDRESS</th>
            <th style={{ minWidth: "130px" }}>DATE OF BIRTH</th>
            <th style={{ minWidth: "120px" }}>ACCOUNT STATUS</th>
            <th style={{ minWidth: "130px" }}>ROLE</th>
            <th className="col-actions text-center" style={{ width: "100px" }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => {
              const displayRole = u.role === "Sales Person" || u.role === "Sales Representative" || !u.role ? "Sales Employee" : u.role;
              const isSelected = selectedUserIds.includes(u.id);

              return (
                <tr
                  key={u.id}
                  className={isSelected ? "selected-row" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => onViewUserCard && onViewUserCard(u)}
                >
                  {/* Row Checkbox */}
                  <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="crm-checkbox"
                      checked={isSelected}
                      onChange={() => onSelectUser && onSelectUser(u.id)}
                    />
                  </td>

                  {/* Full Name */}
                  <td>
                    <div className="user-profile-cell">
                      <span className="user-avatar-sm" style={{ background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)", color: "#fff", fontWeight: 800 }}>
                        {getInitials(u.name)}
                      </span>
                      <div className="user-info-text">
                        <span className="user-name-link" style={{ fontWeight: 700, color: "var(--text-main)" }}>
                          {u.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone Number */}
                  <td>
                    <span style={{ color: "var(--text-main)", fontWeight: 600, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Phone size={12} color="#ff3b19" /> {u.phone || "+91 98765 00000"}
                    </span>
                  </td>

                  {/* Email Address */}
                  <td>
                    <span style={{ color: "var(--text-main)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Mail size={12} color="#8e8e93" /> {u.email}
                    </span>
                  </td>

                  {/* Date of Birth (DOB) */}
                  <td>
                    <span style={{ color: "var(--text-main)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                      <Calendar size={12} color="#ff3b19" /> {formatDob(u.dob)}
                    </span>
                  </td>

                  {/* Account Status Badge */}
                  <td>
                    <span className={`status-badge-chip ${u.status === "Active" ? "status-active" : "status-inactive"}`}>
                      <span className="status-dot" /> {u.status}
                    </span>
                  </td>

                  {/* Role Badge */}
                  <td>
                    <span className={`role-badge-chip ${getRoleBadgeClass(displayRole)}`}>
                      {displayRole}
                    </span>
                  </td>

                  {/* Actions (Edit & Delete Icons) */}
                  <td className="col-actions text-center" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onEditUser ? onEditUser(u) : onViewUserCard && onViewUserCard(u)}
                        title="Edit Sales Employee Details"
                        style={{ padding: "6px 8px", borderRadius: "8px" }}
                      >
                        <Edit3 size={15} color="#ff3b19" />
                      </button>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => onDeleteUser && onDeleteUser(u)}
                        title="Delete Sales Employee"
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
              <td colSpan={8} className="empty-table-cell text-center" style={{ padding: "40px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  No sales employees found
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
