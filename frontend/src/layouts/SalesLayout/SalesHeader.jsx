import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Zap, Settings, LayoutDashboard, Users, Kanban, Clock, CalendarDays } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./SalesLayout.css";

export const SalesHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getScreenDetails = () => {
    const path = location.pathname;
    if (path.startsWith("/sales/leads")) return { title: "My Leads", subtitle: "Assigned contacts" };
    if (path.startsWith("/sales/pipeline")) return { title: "Sales Pipeline", subtitle: "Stages & prospects" };
    if (path.startsWith("/sales/follow-ups")) return { title: "Follow-ups", subtitle: "Tasks & agenda" };
    if (path.startsWith("/sales/calendar")) return { title: "Calendar", subtitle: "Schedule & timeline" };
    if (path.startsWith("/sales/notifications")) return { title: "Notifications", subtitle: "Activity alerts" };
    if (path.startsWith("/sales/profile/updateProfile")) return { title: "Update Profile", subtitle: "Edit account details" };
    if (path.startsWith("/sales/profile")) return { title: "My Profile", subtitle: "Account details" };
    return { title: "Sales Home", subtitle: `Welcome, ${user?.name?.split(" ")[0] || "Sales Employee"}` };
  };

  const { title, subtitle } = getScreenDetails();
  const currentSalesperson = user?.name || "Amit Sharma";

  // Dynamic unread count
  const getUnreadNotifCount = () => {
    try {
      const saved = localStorage.getItem("leadflow_v3_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => {
            if (n.read) return false;
            if (n.targetRole === "admin") return false;
            if (n.targetUser && n.targetUser !== "all" && n.targetUser !== currentSalesperson) return false;
            return true;
          }).length;
        }
      }
    } catch (e) {}
    return 3;
  };

  const unreadBadgeCount = getUnreadNotifCount();

  const desktopNavItems = [
    { path: "/sales/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/sales/leads", label: "Leads", icon: Users },
    { path: "/sales/pipeline", label: "Pipeline", icon: Kanban },
    { path: "/sales/follow-ups", label: "Follow-ups", icon: Clock },
  ];

  return (
    <header className="sales-app-topbar">
      <div className="sales-topbar-left">
        <div className="sales-app-logo-badge" onClick={() => navigate("/sales/dashboard")} title="LeadGen Sales">
          <Zap size={18} color="#ffffff" />
        </div>
        <div className="sales-topbar-titles">
          <h1 className="sales-topbar-heading">{title}</h1>
          <span className="sales-topbar-sub">{subtitle}</span>
        </div>
      </div>

      {/* Desktop / Large Laptop Header Navigation (Converts footer into header on >=1024px) */}
      <nav className="sales-desktop-header-nav" aria-label="Desktop Navigation">
        {desktopNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/sales/leads" && location.pathname.startsWith("/sales/leads")) ||
            (item.path === "/sales/pipeline" && location.pathname.startsWith("/sales/pipeline")) ||
            (item.path === "/sales/follow-ups" && location.pathname.startsWith("/sales/follow"));

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`sales-desktop-nav-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sales-topbar-right">
        {/* Calendar Icon Button (To the left of Notification Icon) */}
        <button
          type="button"
          className="sales-topbar-icon-btn calendar-btn"
          onClick={() => navigate("/sales/calendar")}
          title="Calendar Schedule"
          style={{
            background: location.pathname.startsWith("/sales/calendar") ? "#fff1ee" : "#ffffff",
            color: location.pathname.startsWith("/sales/calendar") ? "#ff3b19" : "#475569",
            borderColor: location.pathname.startsWith("/sales/calendar") ? "#ffd2c7" : "#ece7dc",
          }}
        >
          <CalendarDays size={18} />
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="sales-topbar-icon-btn"
          onClick={() => navigate("/sales/notifications")}
          title="Notifications"
          style={{
            borderColor: location.pathname.startsWith("/sales/notifications") ? "#ffd2c7" : "#ece7dc",
            background: location.pathname.startsWith("/sales/notifications") ? "#fff1ee" : "#ffffff",
            color: location.pathname.startsWith("/sales/notifications") ? "#ff3b19" : "#475569",
          }}
        >
          <Bell size={18} />
          {unreadBadgeCount > 0 && <span className="sales-topbar-badge">{unreadBadgeCount}</span>}
        </button>

        {/* Settings Icon Button (Profile & Settings) */}
        <button
          type="button"
          className="sales-topbar-icon-btn settings-btn"
          onClick={() => navigate("/sales/profile")}
          title="Profile & Settings"
          style={{
            background: location.pathname.startsWith("/sales/profile") ? "#fff1ee" : "#ffffff",
            color: location.pathname.startsWith("/sales/profile") ? "#ff3b19" : "#475569",
            borderColor: location.pathname.startsWith("/sales/profile") ? "#ffd2c7" : "#ece7dc",
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
