import React from "react";
import { Calendar, Clock, Phone, MessageSquare, Mail, Video, CheckSquare, UserCheck } from "lucide-react";

export const TodaySummarySidebar = ({ events, todayDateStr, onEventClick, onScheduleClick, salespersonName }) => {
  const scopedEvents = salespersonName
    ? events.filter((e) => e.assignedTo === salespersonName)
    : events;

  // Compute fallback current date string if not passed
  const currentTodayStr = todayDateStr || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  // Filter Today's Events dynamically based on system date
  const todayEvents = scopedEvents.filter(
    (e) => e.dateStr === currentTodayStr
  );

  const upcomingEvents = scopedEvents
    .filter(
      (e) => e.status === "Pending" && e.dateStr !== currentTodayStr && e.dateStr > currentTodayStr
    )
    .slice(0, 5);

  const totalToday = todayEvents.length;
  const pendingToday = todayEvents.filter((e) => e.status === "Pending").length;
  const completedToday = todayEvents.filter((e) => e.status === "Completed").length;
  const overdueToday = todayEvents.filter((e) => e.status === "Overdue").length;

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call": return <Phone size={12} />;
      case "WhatsApp": return <MessageSquare size={12} />;
      case "Email": return <Mail size={12} />;
      case "Meeting": return <Video size={12} />;
      default: return <CheckSquare size={12} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "SP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="today-summary-sidebar">
      {/* Today's Schedule Card */}
      <div className="crm-card summary-schedule-card">
        <div className="card-header-flex">
          <h3 className="section-title" style={{ fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={17} className="text-indigo" /> Today's Schedule
          </h3>
          <span className="section-count-pill" style={{ backgroundColor: "#e0e7ff", color: "#4338ca", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem" }}>
            {totalToday} Tasks
          </span>
        </div>

        {/* Quick Stat Counter Pills */}
        <div className="today-mini-stats">
          <div className="mini-stat-pill">
            <span className="stat-num">{totalToday}</span>
            <span className="stat-lbl">Total</span>
          </div>
          <div className="mini-stat-pill">
            <span className="stat-num text-indigo">{pendingToday}</span>
            <span className="stat-lbl">Pending</span>
          </div>
          <div className="mini-stat-pill">
            <span className="stat-num text-emerald">{completedToday}</span>
            <span className="stat-lbl">Done</span>
          </div>
          <div className="mini-stat-pill">
            <span className="stat-num text-rose">{overdueToday}</span>
            <span className="stat-lbl">Overdue</span>
          </div>
        </div>

        {/* Today's Activities List */}
        <div className="today-items-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
          {todayEvents.length > 0 ? (
            todayEvents.map((evt) => (
              <div
                key={evt.id}
                className={`today-activity-row type-${evt.type?.toLowerCase()}`}
                onClick={() => onEventClick(evt)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "10px 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Top Row: Time, Type & Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="row-time" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#ff3b19" }}>
                      {evt.time}
                    </span>
                    <span
                      className={`channel-pill-sm ${evt.type?.toLowerCase()}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        backgroundColor: evt.type === "Call" ? "#fff7ed" : evt.type === "Meeting" ? "#fff1ee" : "#f0fdf4",
                        color: evt.type === "Call" ? "#ea580c" : evt.type === "Meeting" ? "#ff3b19" : "#15803d"
                      }}
                    >
                      {getTypeIcon(evt.type)} {evt.type}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "10px",
                      backgroundColor: evt.status === "Completed" ? "#dcfce7" : evt.status === "Overdue" ? "#ffe4e6" : "#f1f5f9",
                      color: evt.status === "Completed" ? "#15803d" : evt.status === "Overdue" ? "#be123c" : "#475569"
                    }}
                  >
                    {evt.status}
                  </span>
                </div>

                {/* Lead Name */}
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                  {evt.leadName} {evt.company && <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>({evt.company})</span>}
                </div>

                {/* Salesperson Name (Always Visible) */}
                <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", paddingTop: "4px", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserCheck size={13} color="#ff3b19" /> Assigned: <strong style={{ color: "#0f172a" }}>{evt.assignedTo || "Amit Sharma"}</strong>
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #ff4522 0%, #e62e0b 100%)",
                      color: "#ffffff",
                      padding: "2px 6px",
                      borderRadius: "50%",
                      boxShadow: "0 2px 5px rgba(255, 69, 34, 0.25)"
                    }}
                  >
                    {getInitials(evt.assignedTo)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-sidebar-box" style={{ padding: "20px", textAlign: "center" }}>
              <Calendar size={24} className="text-subtle" />
              <p className="empty-text" style={{ fontSize: "0.825rem", color: "#64748b", margin: "6px 0" }}>No activities scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Follow-ups Card */}
      <div className="crm-card summary-schedule-card">
        <div className="card-header-flex">
          <h3 className="section-title" style={{ fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={16} className="text-indigo" /> Upcoming Follow-ups
          </h3>
          <span className="section-subtext" style={{ fontSize: "0.75rem", color: "#64748b" }}>Next Tasks</span>
        </div>

        <div className="upcoming-items-list" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="upcoming-item-row"
                onClick={() => onEventClick(evt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #ece7dc",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <div className="upcoming-date-badge" style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fbf9f4", padding: "4px 6px", borderRadius: "6px", minWidth: "75px" }}>
                  <span className="date-str" style={{ fontSize: "0.7rem", fontWeight: 700, color: "#ff3b19" }}>{evt.date}</span>
                  <span className="time-str" style={{ fontSize: "0.68rem", color: "#64748b" }}>{evt.time}</span>
                </div>
                <div className="upcoming-info" style={{ display: "flex", flexDirection: "column" }}>
                  <h4 className="upcoming-lead" style={{ fontSize: "0.825rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{evt.leadName}</h4>
                  <span className="upcoming-type" style={{ fontSize: "0.725rem", color: "#64748b" }}>{evt.type} • <strong>{evt.assignedTo}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-sidebar-box" style={{ padding: "16px", textAlign: "center" }}>
              <p className="empty-text" style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>No upcoming follow-ups</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
