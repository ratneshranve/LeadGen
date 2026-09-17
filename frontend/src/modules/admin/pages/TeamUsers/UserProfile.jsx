import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Edit3,
  UserX,
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck
} from "lucide-react";
import { RolePermissionsTab } from "./components/RolePermissionsTab";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { UpdateSalesEmployeeModal } from "./components/UpdateSalesEmployeeModal";
import "./TeamUsers.css";

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Initial Mock Users
  const defaultUsersList = [
    {
      id: "u-1",
      name: "Amit Sharma",
      email: "amit@leadflow.com",
      phone: "+91 98765 11111",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 42,
      activeLeads: 28,
      followups: 5,
      converted: 6,
      maxCapacity: 50,
      createdAt: "Feb 14, 2026",
      lastActive: "Today, 10:30 AM",
    },
    {
      id: "u-2",
      name: "Neha Verma",
      email: "neha@leadflow.com",
      phone: "+91 98765 22222",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 38,
      activeLeads: 24,
      followups: 4,
      converted: 8,
      maxCapacity: 50,
      createdAt: "Feb 18, 2026",
      lastActive: "Today, 11:15 AM",
    },
    {
      id: "u-3",
      name: "Rahul Mehta",
      email: "rahul@leadflow.com",
      phone: "+91 98765 33333",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 46,
      activeLeads: 31,
      followups: 7,
      converted: 9,
      maxCapacity: 50,
      createdAt: "Mar 02, 2026",
      lastActive: "Today, 09:45 AM",
    },
    {
      id: "u-4",
      name: "Priya Singh",
      email: "priya@leadflow.com",
      phone: "+91 98765 44444",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: 35,
      activeLeads: 22,
      followups: 3,
      converted: 6,
      maxCapacity: 50,
      createdAt: "Mar 15, 2026",
      lastActive: "Yesterday",
    },
  ];

  // Users State initialized from LocalStorage
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_mock_team_users");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultUsersList;
  });

  // Keep LocalStorage synced
  useEffect(() => {
    try {
      localStorage.setItem("leadflow_mock_team_users", JSON.stringify(usersList));
    } catch (e) {}
  }, [usersList]);

  // Find target user
  const user = usersList.find((u) => u.id === userId) || usersList[0];

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "leads" | "permissions"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const conversionRate = user.assignedLeads > 0
    ? ((user.converted / user.assignedLeads) * 100).toFixed(1)
    : "0.0";

  const getInitials = (name) => {
    if (!name) return "SP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Handler: Save User Details / Status
  const handleSaveUser = (updatedUserData) => {
    const updatedUser = {
      ...user,
      ...updatedUserData,
      status: updatedUserData.status || user.status,
    };

    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? updatedUser : u))
    );

    setToastMessage(`Sales user '${updatedUser.name}' status set to ${updatedUser.status}`);
    setIsToastOpen(true);
    setIsEditModalOpen(false);
  };

  // Handler: Toggle Active / Deactive Status Directly
  const handleToggleStatus = () => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const updatedUser = { ...user, status: newStatus };

    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? updatedUser : u))
    );

    setToastMessage(`Sales user account set to ${newStatus}`);
    setIsToastOpen(true);
  };

  return (
    <div className="user-profile-page">
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Edit Profile Modal */}
      <UpdateSalesEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        targetUser={user}
        onUpdateUser={handleSaveUser}
      />

      {/* Back Button & Navigation */}
      <div className="profile-top-nav">
        <button
          className="crm-btn crm-btn-secondary crm-btn-sm"
          onClick={() => navigate("/admin/team-users")}
        >
          <ArrowLeft size={15} /> Back to Team Directory
        </button>
      </div>

      {/* Profile Header Identity Card */}
      <div className="crm-card profile-identity-card">
        <div className="identity-flex-main">
          <div className="profile-avatar-lg">{getInitials(user.name)}</div>

          <div className="profile-identity-details">
            <div className="name-status-row">
              <h2 className="user-profile-fullname">{user.name}</h2>
              <span className={`status-badge-chip ${user.status === "Active" ? "status-active" : "status-inactive"}`}>
                <span className="status-dot" /> {user.status}
              </span>
            </div>

            <span className="user-profile-role">{user.role || "Sales Employee"}</span>

            <div className="contact-meta-row">
              <span>{user.email}</span>
              <span className="dot-sep">•</span>
              <span>{user.phone || "+91 98765 43210"}</span>
              <span className="dot-sep">•</span>
              <span>Joined {user.createdAt || "Jan 10, 2026"}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions-flex">
          <button
            className="crm-btn crm-btn-secondary"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit3 size={15} /> Edit Profile & Status
          </button>
          <button
            className={`crm-btn ${user.status === "Active" ? "crm-btn-secondary text-rose" : "crm-btn-primary"}`}
            onClick={handleToggleStatus}
          >
            {user.status === "Active" ? (
              <>
                <UserX size={15} /> Deactivate
              </>
            ) : (
              <>
                <UserCheck size={15} /> Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Metric Performance Cards */}
      <div className="profile-metrics-grid">
        <div className="crm-card overview-stat-card">
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label">Assigned Leads</span>
              <div className="stat-value">{user.assignedLeads || 0}</div>
              <span className="stat-subtext">Total allocated</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#4f46e5" }}>
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card">
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label">Active Leads</span>
              <div className="stat-value text-indigo">{user.activeLeads || 0}</div>
              <span className="stat-subtext">In active pipeline</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "#fff1ee", color: "#ff3b19" }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card">
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label">Follow-ups</span>
              <div className="stat-value text-amber">{user.followups || 0}</div>
              <span className="stat-subtext">Scheduled interactions</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", color: "#d97706" }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card">
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label">Converted Leads</span>
              <div className="stat-value text-emerald">{user.converted || 0}</div>
              <span className="stat-subtext">Deals closed</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", color: "#16a34a" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card">
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label">Conversion Rate</span>
              <div className="stat-value text-emerald">{conversionRate}%</div>
              <span className="stat-subtext">Lead-to-deal ratio</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", color: "#16a34a" }}>
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="profile-tabs-header">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Recent Activity
        </button>
        <button
          className={`tab-btn ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          Assigned Leads
        </button>
        <button
          className={`tab-btn ${activeTab === "permissions" ? "active" : ""}`}
          onClick={() => setActiveTab("permissions")}
        >
          Role & Permissions
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="crm-card profile-section-card">
          <div className="card-header-flex">
            <h3 className="section-title">
              <History size={18} className="text-indigo" /> Recent User Activity
            </h3>
            <span className="section-subtext">Audit history for {user.name}</span>
          </div>

          <div className="activity-items-list" style={{ marginTop: "14px" }}>
            <div className="activity-mini-item">
              <div className="activity-icon-badge">
                <CheckCircle2 size={14} className="text-emerald" />
              </div>
              <div className="activity-details">
                <div className="activity-title-line">
                  Account status updated to <strong>{user.status}</strong>
                </div>
                <div className="activity-sub-line">Today, 10:30 AM</div>
              </div>
            </div>

            <div className="activity-mini-item">
              <div className="activity-icon-badge">
                <Clock size={14} className="text-indigo" />
              </div>
              <div className="activity-details">
                <div className="activity-title-line">
                  Completed follow-up with <strong>Suresh Patel</strong>
                </div>
                <div className="activity-sub-line">Yesterday, 4:20 PM</div>
              </div>
            </div>

            <div className="activity-mini-item">
              <div className="activity-icon-badge">
                <CheckCircle2 size={14} className="text-emerald" />
              </div>
              <div className="activity-details">
                <div className="activity-title-line">
                  Converted lead <strong>Rohit Kumar</strong> to Won
                </div>
                <div className="activity-sub-line">Aug 28, 2026 · 02:15 PM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="crm-card profile-section-card">
          <div className="card-header-flex">
            <h3 className="section-title">
              <Users size={18} className="text-indigo" /> Recently Assigned Leads
            </h3>
            <span className="section-count-pill">{user.assignedLeads || 0} Leads</span>
          </div>

          <div className="table-responsive-container" style={{ marginTop: "14px" }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th>Next Follow-up</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span
                      className="lead-name-link"
                      onClick={() => navigate("/admin/leads/LD-1001")}
                    >
                      Rahul Sharma
                    </span>
                  </td>
                  <td>Rahul Traders</td>
                  <td><Badge status="New" /></td>
                  <td>Sep 01, 2026</td>
                  <td>Today, 4:00 PM</td>
                </tr>
                <tr>
                  <td>
                    <span
                      className="lead-name-link"
                      onClick={() => navigate("/admin/leads/LD-1004")}
                    >
                      Suresh Patel
                    </span>
                  </td>
                  <td>Patel Chemicals</td>
                  <td><Badge status="Contacted" /></td>
                  <td>Aug 30, 2026</td>
                  <td>Sep 03, 2:30 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <RolePermissionsTab
          role={user.role}
          onSave={() => {
            setToastMessage("Role permissions saved successfully");
            setIsToastOpen(true);
          }}
        />
      )}
    </div>
  );
};
