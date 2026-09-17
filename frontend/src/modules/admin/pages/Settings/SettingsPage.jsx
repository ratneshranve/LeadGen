
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Bell,
  Kanban,
  Save,
  Plus,
  Trash2,
  Sliders,
  UserPlus,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { Modal } from "../../../../components/ui/Modal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { AddEditUserModal } from "../TeamUsers/components/AddEditUserModal";
import "./SettingsPage.css";

export const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user, updateUserProfile } = useAuth();

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Admin Profile State synced with AuthContext User
  const [profileData, setProfileData] = useState({
    name: user?.name || "Rajesh Kumar",
    email: user?.email || "admin@leadflow.com",
    phone: user?.mobile || "+91 98765 00001",
    dob: "1990-05-15",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.mobile || prev.phone,
      }));
    }
  }, [user]);

  const [showPassword, setShowPassword] = useState(false);

  // Add Salesperson Modal State
  const [showAddSalespersonModal, setShowAddSalespersonModal] = useState(false);

  // Pipeline Stages State
  const [pipelineStages, setPipelineStages] = useState([
    { id: 1, name: "New", color: "#3b82f6" },
    { id: 2, name: "Contacted", color: "#8b5cf6" },
    { id: 3, name: "Follow-up", color: "#eab308" },
    { id: 4, name: "Interested", color: "#06b6d4" },
    { id: 5, name: "Converted", color: "#22c55e" },
    { id: 6, name: "Lost", color: "#ef4444" },
  ]);

  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState("");

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    try {
      updateUserProfile({
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.phone,
        password: profileData.password,
      });

      setProfileData((prev) => ({ ...prev, password: "" }));
      setToastMessage("Profile & login credentials updated! Use new email & password for next login.");
      setIsToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || "Failed to update profile credentials.");
      setIsToastOpen(true);
    }
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setToastMessage("Settings updated successfully");
    setIsToastOpen(true);
  };

  const handleAddStage = (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    setPipelineStages((prev) => [
      ...prev,
      { id: Date.now(), name: newStageName, color: "#6366f1" },
    ]);
    setNewStageName("");
    setShowAddStageModal(false);
    setToastMessage("Pipeline stage added successfully");
    setIsToastOpen(true);
  };

  const handleDeleteStage = (id) => {
    setPipelineStages((prev) => prev.filter((s) => s.id !== id));
    setToastMessage("Pipeline stage removed");
    setIsToastOpen(true);
  };

  const handleConfirmSaveSalesperson = (userObj) => {
    const savedTeamUsers = localStorage.getItem("leadflow_mock_team_users");
    const currentList = savedTeamUsers ? JSON.parse(savedTeamUsers) : [];
    const newUser = {
      id: `u-${Date.now()}`,
      name: userObj.name,
      email: userObj.email,
      phone: userObj.phone || "+91 98765 00000",
      role: userObj.role || "Sales Person",
      status: "Active",
      assignedLeads: 0,
      activeLeads: 0,
      followups: 0,
      converted: 0,
      maxCapacity: userObj.maxCapacity || 50,
      createdAt: "Sep 01, 2026",
      lastActive: "Just now",
    };
    const updatedList = [newUser, ...currentList];
    localStorage.setItem("leadflow_mock_team_users", JSON.stringify(updatedList));

    setShowAddSalespersonModal(false);
    setToastMessage(`New salesperson '${userObj.name}' added successfully!`);
    setIsToastOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "RK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "pipeline", label: "Pipeline", icon: Kanban },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "lead-mgmt", label: "Lead Management", icon: Sliders },
  ];

  return (
    <div className="settings-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      {/* Add Salesperson Modal */}
      <AddEditUserModal
        isOpen={showAddSalespersonModal}
        onClose={() => setShowAddSalespersonModal(false)}
        targetUser={null}
        onConfirm={handleConfirmSaveSalesperson}
      />

      {/* Add Stage Modal */}
      <Modal isOpen={showAddStageModal} onClose={() => setShowAddStageModal(false)} title="Add Pipeline Stage">
        <form onSubmit={handleAddStage}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Stage Name *</label>
              <input
                type="text"
                className="crm-input"
                placeholder="e.g. Negotiation, Trialing..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddStageModal(false)}>Cancel</button>
              <button type="submit" className="crm-btn crm-btn-primary">Add Stage</button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Description Banner */}
      <div className="settings-header-banner">
        <p className="page-desc">Manage your CRM preferences, profile details, and pipeline configuration.</p>
      </div>

      {/* Settings Split Layout */}
      <div className="settings-split-grid">
        {/* Left Settings Sidebar */}
        <div className="crm-card settings-tabs-sidebar" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #cbd5e1" }}>
          <div className="sidebar-tabs-list">
            {tabs.map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  className={`settings-nav-item ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <IconComp size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Settings Content Panel */}
        <div className="settings-content-area">
          {activeTab === "profile" && (
            <div className="crm-card settings-panel-card" style={{ background: "linear-gradient(135deg, #fafaf9 0%, #f4f4f5 100%)", border: "1px solid #cbd5e1", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)" }}>
              <div className="card-header-flex">
                <h3 className="section-title">My Profile</h3>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Admin Header Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="profile-avatar-lg">
                    {getInitials(profileData.name)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1b2559", margin: 0 }}>
                      {profileData.name}
                    </h4>
                    <span className="role-badge-chip role-master-admin" style={{ marginTop: "4px" }}>
                      Master Admin
                    </span>
                  </div>
                </div>

                {/* Profile Fields Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "8px" }}>
                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="crm-input"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="crm-input"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="crm-input"
                      placeholder="+91 98765 00000"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label className="form-label">Date of Birth (DOB) *</label>
                    <input
                      type="date"
                      name="dob"
                      className="crm-input"
                      value={profileData.dob}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                {/* Password Change Field */}
                <div className="form-group" style={{ marginTop: "4px" }}>
                  <label className="form-label">New Password (Leave blank to keep unchanged)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="crm-input"
                      placeholder="Enter new password..."
                      value={profileData.password}
                      onChange={handleProfileChange}
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b"
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button type="submit" className="crm-btn crm-btn-primary">
                    <Save size={15} /> Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "pipeline" && (
            <div className="crm-card settings-panel-card" style={{ background: "linear-gradient(135deg, #fafaf9 0%, #f4f4f5 100%)", border: "1px solid #cbd5e1", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)" }}>
              <div className="card-header-flex">
                <h3 className="section-title">Pipeline Stages Configuration</h3>
                <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={() => setShowAddStageModal(true)}>
                  <Plus size={14} /> Add Stage
                </button>
              </div>

              <div className="stages-list-stack" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {pipelineStages.map((st, idx) => (
                  <div key={st.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#ffffff", borderRadius: "var(--radius-sm)", borderLeft: `4px solid ${st.color}`, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{idx + 1}. {st.name}</span>
                    <button className="action-menu-btn text-rose" onClick={() => handleDeleteStage(st.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="crm-card settings-panel-card" style={{ background: "linear-gradient(135deg, #fafaf9 0%, #f4f4f5 100%)", border: "1px solid #cbd5e1", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)" }}>
              <h3 className="section-title" style={{ color: "#0f172a" }}>Notification Preferences</h3>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  "New Lead Assigned Alerts",
                  "Follow-up Reminders (15m before)",
                  "Lead Pipeline Stage Updates",
                  "Deal Conversion Notifications",
                  "Daily Digest Email",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{item}</span>
                    <input type="checkbox" className="crm-checkbox" defaultChecked />
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button className="crm-btn crm-btn-primary" onClick={handleSaveGeneral}><Save size={15} /> Save Preferences</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lead-mgmt" && (
            <div className="crm-card settings-panel-card" style={{ background: "linear-gradient(135deg, #fafaf9 0%, #f4f4f5 100%)", border: "1px solid #cbd5e1", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)" }}>
              <h3 className="section-title" style={{ color: "#0f172a" }}>Lead Management Rules</h3>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>Duplicate Lead Prevention</strong>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Check for duplicate phone numbers and emails on creation</p>
                  </div>
                  <input type="checkbox" className="crm-checkbox" defaultChecked />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#ffffff", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>Round-Robin Auto Assignment</strong>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Automatically assign unassigned incoming leads to sales team</p>
                  </div>
                  <input type="checkbox" className="crm-checkbox" defaultChecked />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
