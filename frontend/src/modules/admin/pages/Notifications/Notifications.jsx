import React, { useState, useEffect } from "react";
import { CheckCheck, Users, Calendar, ArrowRightLeft, CheckCircle2, Eye, Activity, FileText, Bell } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { initialLeadsData } from "../Leads/data/leadsMockData";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./Notifications.css";

export const initialNotificationsData = [
  // ==========================================
  // --- ADMIN NOTIFICATIONS (Sales Employee Work & Lead Assignments) ---
  // ==========================================
  {
    id: "notif-adm-1",
    type: "ASSIGNMENT",
    title: "Lead Assigned to Sales Employee",
    description: "Lead 'Rahul Sharma (Rahul Traders)' was assigned to Sales Employee Amit Sharma.",
    time: "2 minutes ago",
    read: false,
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    category: "Leads",
    targetRole: "admin",
    actor: "Amit Sharma",
  },
  {
    id: "notif-adm-2",
    type: "FOLLOW-UP",
    title: "Follow-up Call Completed",
    description: "Sales Employee Neha Verma completed follow-up call with 'Anjali Gupta (Global Tech Labs)'.",
    time: "15 minutes ago",
    read: false,
    leadId: "LD-1002",
    leadName: "Anjali Gupta",
    company: "Global Tech Labs",
    category: "Follow-ups",
    targetRole: "admin",
    actor: "Neha Verma",
  },
  {
    id: "notif-adm-3",
    type: "PIPELINE",
    title: "Pipeline Stage Updated by Sales Employee",
    description: "Sales Employee Amit Sharma moved lead 'Rahul Sharma (Rahul Traders)' from New → Contacted.",
    time: "25 minutes ago",
    read: false,
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    category: "Pipeline",
    targetRole: "admin",
    actor: "Amit Sharma",
  },
  {
    id: "notif-adm-4",
    type: "ASSIGNMENT",
    title: "Lead Assigned to Sales Employee",
    description: "Lead 'Suresh Patel (Patel Chemicals)' was assigned to Sales Employee Neha Verma.",
    time: "45 minutes ago",
    read: false,
    leadId: "LD-1004",
    leadName: "Suresh Patel",
    company: "Patel Chemicals",
    category: "Leads",
    targetRole: "admin",
    actor: "Neha Verma",
  },
  {
    id: "notif-adm-5",
    type: "FOLLOW-UP",
    title: "Follow-up Scheduled by Sales Employee",
    description: "Sales Employee Priya Singh scheduled a follow-up meeting with 'Riya Kapoor (Kapoor Architect Studio)' for Today at 6:15 PM.",
    time: "1 hour ago",
    read: false,
    leadId: "LD-1003",
    leadName: "Riya Kapoor",
    company: "Kapoor Architect Studio",
    category: "Follow-ups",
    targetRole: "admin",
    actor: "Priya Singh",
  },
  {
    id: "notif-adm-6",
    type: "RECENT ACTIVITY",
    title: "Activity Note Logged by Sales Employee",
    description: "Sales Employee Rahul Mehta logged note on 'Vikram Aditya (Aditya Machinery)': 'Client requested revised commercial proposal'.",
    time: "2 hours ago",
    read: false,
    leadId: "LD-1015",
    leadName: "Vikram Aditya",
    company: "Aditya Heavy Machinery",
    category: "Pipeline",
    targetRole: "admin",
    actor: "Rahul Mehta",
  },
  {
    id: "notif-adm-7",
    type: "STATUS",
    title: "Deal Converted by Sales Employee",
    description: "Sales Employee Rahul Mehta converted deal 'Rohit Kumar (Kumar & Sons)' to Converted / Won.",
    time: "3 hours ago",
    read: false,
    leadId: "LD-1007",
    leadName: "Rohit Kumar",
    company: "Kumar & Sons Retail",
    category: "Leads",
    targetRole: "admin",
    actor: "Rahul Mehta",
  },
  {
    id: "notif-adm-8",
    type: "PIPELINE",
    title: "Pipeline Stage Updated by Sales Employee",
    description: "Sales Employee Amit Sharma moved 'Anjali Gupta (Global Tech Labs)' to Interested stage.",
    time: "4 hours ago",
    read: false,
    leadId: "LD-1002",
    leadName: "Anjali Gupta",
    company: "Global Tech Labs",
    category: "Pipeline",
    targetRole: "admin",
    actor: "Amit Sharma",
  },

  // ==========================================
  // --- SALES PERSON SPECIFIC NOTIFICATIONS (Targeted ONLY to respective Sales Person) ---
  // ==========================================

  // Amit Sharma's Notifications:
  {
    id: "notif-s1",
    type: "NEW LEAD",
    title: "New lead assigned to you",
    description: "Rahul Sharma (Rahul Traders) was assigned to you by Admin.",
    time: "2 minutes ago",
    read: false,
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    category: "Leads",
    targetRole: "sales",
    targetUser: "Amit Sharma",
  },
  {
    id: "notif-s2",
    type: "FOLLOW-UP",
    title: "Follow-up due today",
    description: "Follow-up call with Rahul Sharma is scheduled for Today at 4:00 PM.",
    time: "15 minutes ago",
    read: false,
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    category: "Follow-ups",
    targetRole: "sales",
    targetUser: "Amit Sharma",
  },
  {
    id: "notif-s3",
    type: "ASSIGNMENT",
    title: "New lead assigned to you",
    description: "Anjali Gupta (Global Tech Labs) was assigned to you by Admin.",
    time: "1 hour ago",
    read: false,
    leadId: "LD-1002",
    leadName: "Anjali Gupta",
    company: "Global Tech Labs",
    category: "Leads",
    targetRole: "sales",
    targetUser: "Amit Sharma",
  },

  // Neha Verma's Notifications:
  {
    id: "notif-s4",
    type: "NEW LEAD",
    title: "New lead assigned to you",
    description: "Suresh Patel (Patel Chemicals) was assigned to you by Admin.",
    time: "30 minutes ago",
    read: false,
    leadId: "LD-1004",
    leadName: "Suresh Patel",
    company: "Patel Chemicals",
    category: "Leads",
    targetRole: "sales",
    targetUser: "Neha Verma",
  },
  {
    id: "notif-s5",
    type: "FOLLOW-UP",
    title: "Follow-up due today",
    description: "Follow-up meeting with Suresh Patel is scheduled for Today at 2:30 PM.",
    time: "45 minutes ago",
    read: false,
    leadId: "LD-1004",
    leadName: "Suresh Patel",
    company: "Patel Chemicals",
    category: "Follow-ups",
    targetRole: "sales",
    targetUser: "Neha Verma",
  },

  // Rahul Mehta's Notifications:
  {
    id: "notif-s6",
    type: "ASSIGNMENT",
    title: "Lead reassigned to you",
    description: "Vikram Aditya (Aditya Machinery) was reassigned to you by Admin.",
    time: "1 hour ago",
    read: false,
    leadId: "LD-1015",
    leadName: "Vikram Aditya",
    company: "Aditya Heavy Machinery",
    category: "Leads",
    targetRole: "sales",
    targetUser: "Rahul Mehta",
  },

  // Priya Singh's Notifications:
  {
    id: "notif-s7",
    type: "NEW LEAD",
    title: "New lead assigned to you",
    description: "Riya Kapoor (Kapoor Architect Studio) was assigned to you by Admin.",
    time: "2 hours ago",
    read: false,
    leadId: "LD-1003",
    leadName: "Riya Kapoor",
    company: "Kapoor Architect Studio",
    category: "Leads",
    targetRole: "sales",
    targetUser: "Priya Singh",
  },
];

export const Notifications = () => {
  const { user, isAdmin } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  const [selectedTab, setSelectedTab] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Lead Detail Card Modal States
  const [selectedLeadForCard, setSelectedLeadForCard] = useState(null);
  const [isLeadCardOpen, setIsLeadCardOpen] = useState(false);

  // Notification Dataset with Fresh LocalStorage Key v3
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_v3_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialNotificationsData;
  });

  // Sync Notifications to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("leadflow_v3_notifications", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  // 1. Strictly Scoped User Notifications Filter
  const userNotifications = notifications.filter((n) => {
    if (isAdmin) {
      // Rule 1: Admin ONLY receives notifications regarding work done by Sales Persons & Lead Assignments!
      if (n.targetRole === "sales") return false;
      return true;
    } else {
      // Rule 2: Sales Person ONLY receives notifications assigned/targeted specifically to them!
      if (n.targetRole === "admin") return false;
      if (n.targetUser && n.targetUser !== "all" && n.targetUser !== currentSalesperson) {
        return false;
      }
      return true;
    }
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => {
      const isVisible = userNotifications.some((un) => un.id === n.id);
      return isVisible ? { ...n, read: true } : n;
    });
    setNotifications(updated);
    try {
      localStorage.setItem("leadflow_v3_notifications", JSON.stringify(updated));
    } catch (e) {}
    setToastMessage("All your notifications marked as read");
    setIsToastOpen(true);
  };

  const handleMarkSingleRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem("leadflow_v3_notifications", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleViewLeadDetails = (notif) => {
    handleMarkSingleRead(notif.id);

    const foundLead = initialLeadsData.find(
      (l) => l.id === notif.leadId || l.name?.toLowerCase() === notif.leadName?.toLowerCase()
    );

    const leadObject = foundLead || {
      id: notif.leadId || "LD-1001",
      name: notif.leadName || "Lead Contact",
      company: notif.company || "Company",
      email: `${(notif.leadName || "lead").toLowerCase().replace(/\s+/g, ".")}@company.com`,
      phone: "+91 98765 43210",
      status: "Follow-up",
      source: "Website",
      salesperson: notif.actor || currentSalesperson,
    };

    setSelectedLeadForCard(leadObject);
    setIsLeadCardOpen(true);
  };

  const filteredNotifs = userNotifications.filter((n) => {
    if (selectedTab === "Unread") return !n.read;
    if (selectedTab === "Leads") return n.category === "Leads";
    if (selectedTab === "Follow-ups") return n.category === "Follow-ups";
    if (selectedTab === "Pipeline") return n.category === "Pipeline";
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "NEW LEAD": return <Users size={16} className="text-indigo" />;
      case "FOLLOW-UP": return <Calendar size={16} className="text-amber" />;
      case "ASSIGNMENT": return <ArrowRightLeft size={16} className="text-sky" />;
      case "PIPELINE": return <Activity size={16} className="text-purple" />;
      case "RECENT ACTIVITY": return <FileText size={16} className="text-indigo" />;
      case "STATUS": return <CheckCircle2 size={16} className="text-emerald" />;
      default: return <Users size={16} className="text-indigo" />;
    }
  };

  return (
    <div className="notifications-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <ProfileEditCardModal
        isOpen={isLeadCardOpen}
        onClose={() => setIsLeadCardOpen(false)}
        data={selectedLeadForCard}
        type="lead"
      />

      {/* Header Banner */}
      <div className="notif-header-banner">
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            {isAdmin ? "Admin Activity & Lead Work Feed" : `${currentSalesperson}'s Notifications`}
          </h2>
          <p className="page-desc" style={{ marginTop: "4px" }}>
            {isAdmin
              ? "Live notifications for lead assignments, follow-up actions taken, pipeline updates and recent sales employee activities."
              : "Notifications for tasks, lead assignments and follow-ups allocated specifically to you."}
          </p>
        </div>

        {/* Action Button - Only Mark All as Read */}
        <div className="header-actions-group">
          <button className="crm-btn crm-btn-primary" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>
      </div>

      {/* Unread Notifications Box (Compact & Compatible) */}
      <div className="notif-summary-row">
        <div className="summary-pill active-unread" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa", color: "#0f172a" }}>
          <Bell size={14} className="text-primary" />
          <span style={{ color: "#334155", fontWeight: 700 }}>Unread Notifications:</span>
          <strong style={{ color: "#0f172a", fontWeight: 900 }}>{unreadCount}</strong>
        </div>
      </div>

      {/* Main List Card */}
      <div className="crm-card notif-main-card" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1.5px solid #fed7aa", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)" }}>
        {/* Tabs */}
        <div className="notif-tabs-bar">
          {["All", "Unread", "Leads", "Follow-ups", "Pipeline"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${selectedTab === t ? "active" : ""}`}
              onClick={() => setSelectedTab(t)}
            >
              {t} {t === "Unread" && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="notif-items-list">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`notif-item-row ${!n.read ? "unread-row" : ""}`}
                onClick={() => handleMarkSingleRead(n.id)}
              >
                <div className="notif-icon-circle">
                  {getNotifIcon(n.type)}
                </div>

                <div className="notif-content-flex">
                  <div className="title-row">
                    <span className="notif-type-tag">{n.type}</span>
                    <h4 className="notif-title-text">{n.title}</h4>
                  </div>
                  <p className="notif-desc-text">{n.description}</p>
                  <span className="notif-timestamp">{n.time}</span>
                </div>

                <div className="notif-actions-right">
                  {!n.read && <span className="unread-dot" title="Unread" />}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-table-cell text-center" style={{ padding: "40px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                No notifications found for {selectedTab}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
