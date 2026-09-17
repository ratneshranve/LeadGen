import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Save } from "lucide-react";

export const RolePermissionsTab = ({ role = "Sales Employee", onSave }) => {
  const isMasterAdmin = role === "Master Admin";

  const [permissions, setPermissions] = useState({
    viewLeads: true,
    createLeads: true,
    editLeads: true,
    deleteLeads: isMasterAdmin || role === "Admin",
    assignLeads: isMasterAdmin || role === "Admin" || role === "Sales Manager",

    viewPipeline: true,
    updateStatus: true,

    viewFollowups: true,
    createFollowups: true,
    completeFollowups: true,

    viewReports: isMasterAdmin || role === "Admin" || role === "Sales Manager",
    exportReports: isMasterAdmin || role === "Admin",

    viewTeam: true,
    manageUsers: isMasterAdmin || role === "Admin",

    manageSettings: isMasterAdmin,
  });

  useEffect(() => {
    if (role === "Master Admin") {
      setPermissions({
        viewLeads: true, createLeads: true, editLeads: true, deleteLeads: true, assignLeads: true,
        viewPipeline: true, updateStatus: true,
        viewFollowups: true, createFollowups: true, completeFollowups: true,
        viewReports: true, exportReports: true,
        viewTeam: true, manageUsers: true,
        manageSettings: true,
      });
    }
  }, [role]);

  const handleToggle = (key) => {
    if (isMasterAdmin) return;
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = [
    {
      title: "LEADS MANAGEMENT",
      items: [
        { key: "viewLeads", label: "View Leads" },
        { key: "createLeads", label: "Create Leads" },
        { key: "editLeads", label: "Edit Leads" },
        { key: "deleteLeads", label: "Delete Leads" },
        { key: "assignLeads", label: "Assign Leads" },
      ],
    },
    {
      title: "PIPELINE & KANBAN",
      items: [
        { key: "viewPipeline", label: "View Pipeline" },
        { key: "updateStatus", label: "Update Lead Status" },
      ],
    },
    {
      title: "FOLLOW-UPS & TASKS",
      items: [
        { key: "viewFollowups", label: "View Follow-ups" },
        { key: "createFollowups", label: "Create Follow-ups" },
        { key: "completeFollowups", label: "Complete Follow-ups" },
      ],
    },
    {
      title: "REPORTS & ANALYTICS",
      items: [
        { key: "viewReports", label: "View Reports" },
        { key: "exportReports", label: "Export Data & Reports" },
      ],
    },
    {
      title: "TEAM & USERS",
      items: [
        { key: "viewTeam", label: "View Team" },
        { key: "manageUsers", label: "Manage Users & Accounts" },
      ],
    },
    {
      title: "SYSTEM & CONFIGURATION",
      items: [
        { key: "manageSettings", label: "Manage System Settings" },
      ],
    },
  ];

  return (
    <div className="crm-card role-permissions-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <ShieldCheck size={18} className="text-indigo" /> Role & Permissions Matrix
        </h3>
        {isMasterAdmin && (
          <span className="section-count-pill" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
            <Lock size={12} /> Master Admin (Full Access)
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "4px" }}>
        Configure explicit feature permissions for users with the <strong>{role}</strong> role.
      </p>

      <div className="permissions-groups-grid" style={{ marginTop: "16px" }}>
        {groups.map((group) => (
          <div key={group.title} className="permission-group-box">
            <h4 className="permission-group-title">{group.title}</h4>
            <div className="permission-items-list">
              {group.items.map((item) => (
                <label key={item.key} className="permission-checkbox-label">
                  <input
                    type="checkbox"
                    className="crm-checkbox"
                    checked={permissions[item.key]}
                    disabled={isMasterAdmin}
                    onChange={() => handleToggle(item.key)}
                  />
                  <span className="perm-label-text">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isMasterAdmin && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="crm-btn crm-btn-primary" onClick={() => onSave(permissions)}>
            <Save size={15} /> Save Permission Matrix
          </button>
        </div>
      )}
    </div>
  );
};
