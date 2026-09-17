import React, { useState } from "react";
import { History, Clock, User, FileText, ArrowRightLeft, ShieldCheck, Eye, Search, Filter } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { LeadsPagination } from "../Leads/components/LeadsPagination";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import "./ActivityHistory.css";

export const ActivityHistory = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Expanded Activity Log Dataset with standardized timestamps
  const [activities] = useState([
    {
      id: "act-101",
      dateTime: "Sep 03, 2026 at 01:25 PM",
      user: "Rajesh Kumar",
      action: "Exported Data",
      module: "System",
      leadName: "CRM Lead Export",
      description: "Exported 184 leads records in CSV file format",
      status: "Completed",
      ip: "192.168.1.45",
      prevVal: "None",
      newVal: "leads_export_sep.csv",
    },
    {
      id: "act-102",
      dateTime: "Sep 03, 2026 at 11:40 AM",
      user: "Amit Sharma",
      action: "Created Lead",
      module: "Leads",
      leadName: "Karan Johar",
      description: "Added new lead Karan Johar for Johar Productions",
      status: "Completed",
      ip: "192.168.1.88",
      prevVal: "None",
      newVal: "Karan Johar (LD-1008)",
    },
    {
      id: "act-103",
      dateTime: "Sep 02, 2026 at 04:15 PM",
      user: "Neha Verma",
      action: "Updated Status",
      module: "Pipeline",
      leadName: "Suresh Patel",
      description: "Changed status from Contacted to Interested",
      status: "Completed",
      ip: "192.168.1.50",
      prevVal: "Status: Contacted",
      newVal: "Status: Interested",
    },
    {
      id: "act-104",
      dateTime: "Sep 02, 2026 at 02:30 PM",
      user: "Rahul Mehta",
      action: "Assigned Lead",
      module: "Assignments",
      leadName: "Vikram Aditya",
      description: "Re-assigned lead from Priya Singh to Rahul Mehta",
      status: "Completed",
      ip: "192.168.1.12",
      prevVal: "Assigned: Priya Singh",
      newVal: "Assigned: Rahul Mehta",
    },
    {
      id: "act-105",
      dateTime: "Sep 01, 2026 at 10:30 AM",
      user: "Rajesh Kumar",
      action: "Created Lead",
      module: "Leads",
      leadName: "Rahul Sharma",
      description: "Created a new lead manually for Rahul Traders",
      status: "Completed",
      ip: "192.168.1.45",
      prevVal: "None",
      newVal: "Rahul Sharma (LD-1001)",
    },
    {
      id: "act-106",
      dateTime: "Aug 31, 2026 at 04:20 PM",
      user: "Priya Singh",
      action: "Scheduled Follow-up",
      module: "Follow-ups",
      leadName: "Ananya Roy",
      description: "Scheduled product demo call for Sep 04, 2026 at 03:00 PM",
      status: "Completed",
      ip: "192.168.1.33",
      prevVal: "No follow-up",
      newVal: "Demo: Sep 04, 03:00 PM",
    },
    {
      id: "act-107",
      dateTime: "Aug 30, 2026 at 05:00 PM",
      user: "Rajesh Kumar",
      action: "Updated User",
      module: "System",
      leadName: "Sales Employee Profile",
      description: "Updated profile details and contact info for Ujjawal Kumar",
      status: "Completed",
      ip: "192.168.1.45",
      prevVal: "Role: Sales Executive",
      newVal: "Role: Sales Employee",
    },
    {
      id: "act-108",
      dateTime: "Aug 29, 2026 at 11:10 AM",
      user: "Amit Sharma",
      action: "Updated Status",
      module: "Pipeline",
      leadName: "Deepak Gupta",
      description: "Marked lead as Converted with revenue ₹4.8L",
      status: "Completed",
      ip: "192.168.1.88",
      prevVal: "Status: Interested",
      newVal: "Status: Converted",
    },
  ]);

  const filteredActivities = activities.filter((item) => {
    if (selectedTab !== "All") {
      if (selectedTab === "Status Changes" && item.action !== "Updated Status") return false;
      if (selectedTab === "Assignments" && item.action !== "Assigned Lead") return false;
      if (selectedTab === "Follow-ups" && item.action !== "Scheduled Follow-up") return false;
      if (selectedTab === "System" && item.module !== "System") return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchLead = item.leadName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchUser = item.user.toLowerCase().includes(q);
      if (!matchLead && !matchDesc && !matchUser) return false;
    }

    if (selectedUser !== "All" && item.user !== selectedUser) return false;

    return true;
  });

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="activity-history-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      {/* Activity Details Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Audit Event Details">
        {selectedActivity && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="audit-detail-header">
              <span className="role-badge-chip role-rep">{selectedActivity.module}</span>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{selectedActivity.action}</h4>
            </div>

            <div className="audit-grid-box">
              <div className="audit-item"><span className="lbl">Performed By:</span><strong>{selectedActivity.user}</strong></div>
              <div className="audit-item"><span className="lbl">Date & Time:</span><span>{selectedActivity.dateTime}</span></div>
              <div className="audit-item"><span className="lbl">IP Address:</span><code>{selectedActivity.ip}</code></div>
              <div className="audit-item"><span className="lbl">Target Entity:</span><strong>{selectedActivity.leadName}</strong></div>
            </div>

            <div className="diff-comparison-box">
              <span className="lbl">State Audit Diff</span>
              <div className="diff-row">
                <div className="prev-val"><span>Previous:</span> <code>{selectedActivity.prevVal}</code></div>
                <div className="new-val"><span>Updated:</span> <code>{selectedActivity.newVal}</code></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <button className="crm-btn crm-btn-primary" onClick={() => setShowDetailModal(false)}>Close Audit Log</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Description Banner */}
      <div className="act-header-banner">
        <p className="page-desc">Track all important actions performed across your CRM.</p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="act-kpi-grid">
        <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #93c5fd", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.12)" }}>
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Total Activities</span>
              <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>1,248</div>
              <span className="stat-subtext" style={{ color: "#1e3a8a", fontWeight: 700 }}>Lifetime audit logs</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
              <History size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #fff1ee 0%, #ffe2dc 100%)", border: "1px solid #ffc4b8", boxShadow: "0 4px 14px rgba(255, 59, 25, 0.12)" }}>
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Today's Logs</span>
              <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>36</div>
              <span className="stat-subtext" style={{ color: "#991b1b", fontWeight: 700 }}>Recent interactions</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "#ffe2dc", color: "#e63010", border: "1px solid #ffc4b8" }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)" }}>
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Lead Updates</span>
              <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>482</div>
              <span className="stat-subtext" style={{ color: "#9a3412", fontWeight: 700 }}>Pipeline stage moves</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" }}>
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #86efac", boxShadow: "0 4px 14px rgba(34, 197, 94, 0.12)" }}>
          <div className="stat-card-inner">
            <div className="stat-info">
              <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Assignments</span>
              <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>214</div>
              <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>Rep allocations</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
              <ArrowRightLeft size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Activity Timeline Section */}
      <div className="crm-card act-table-card" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #cbd5e1", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)" }}>
        {/* Tabs */}
        <div className="act-tabs-bar">
          {["All", "Status Changes", "Assignments", "Follow-ups", "System"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${selectedTab === t ? "active" : ""}`}
              onClick={() => {
                setSelectedTab(t);
                setCurrentPage(1);
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="act-toolbar">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="crm-input search-input"
              placeholder="Search audit trail by lead or user..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <CustomSelect
            size="sm"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "All", label: "All Users" },
              { value: "Rajesh Kumar", label: "Rajesh Kumar" },
              { value: "Amit Sharma", label: "Amit Sharma" },
              { value: "Neha Verma", label: "Neha Verma" },
              { value: "Rahul Mehta", label: "Rahul Mehta" },
            ]}
            style={{ minWidth: "140px" }}
          />
        </div>

        {/* Table */}
        <div className="table-responsive-container" style={{ marginTop: "14px" }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Entity / Lead</th>
                <th>Description</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((act) => (
                  <tr key={act.id}>
                    <td><span className="date-sub-text" style={{ fontWeight: 600, color: "#1b2559" }}>{act.dateTime}</span></td>
                    <td><strong>{act.user}</strong></td>
                    <td><span className="role-badge-chip role-master-admin">{act.action}</span></td>
                    <td><span className="role-badge-chip role-manager">{act.module}</span></td>
                    <td><strong>{act.leadName}</strong></td>
                    <td><span className="followup-notes-preview">"{act.description}"</span></td>
                    <td className="text-right">
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-xs"
                        onClick={() => {
                          setSelectedActivity(act);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: "30px", color: "#64748b" }}>
                    No audit activities found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {filteredActivities.length > 0 && (
          <LeadsPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={filteredActivities.length}
          />
        )}
      </div>
    </div>
  );
};
