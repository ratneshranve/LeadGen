import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CalendarDays, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SalesLogoMark } from "../../components/brand/BrandMark";
import "./SalesLayout.css";

const NAV_ITEMS = [
  { path: "/sales/dashboard", label: "Home", match: (p) => p === "/sales/dashboard" || p === "/sales" },
  { path: "/sales/leads", label: "Leads", match: (p) => p.startsWith("/sales/leads") },
  { path: "/sales/pipeline", label: "Pipeline", match: (p) => p.startsWith("/sales/pipeline") },
  { path: "/sales/follow-ups", label: "Follow-ups", match: (p) => p.startsWith("/sales/follow") },
];

export const SalesHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const path = location.pathname;

  const getScreenDetails = () => {
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
  const firstName = currentSalesperson.split(" ")[0];
  const initials = currentSalesperson.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

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

  return (
    <header className="sales-app-topbar">
      {/* Brand */}
      <div className="sales-topbar-left">
        <button type="button" className="sales-brand" onClick={() => navigate("/sales/dashboard")} title="LeadGen Sales">
          <SalesLogoMark size={30} />
          <span className="sales-brand-word">LeadGen</span>
        </button>
        <div className="sales-topbar-titles">
          <h1 className="sales-topbar-heading" key={title}>{title}</h1>
          <span className="sales-topbar-sub">{subtitle}</span>
        </div>
      </div>

      {/* Cream tab with the capsule navigation (desktop) */}
      <div className="sales-nav-tab">
        <nav className="sales-nav-capsule" aria-label="Sales navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`sales-nav-link ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sales-nav-active"
                    className="sales-nav-active-bg"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="sales-nav-text">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Actions */}
      <div className="sales-topbar-right">
        <button
          type="button"
          className={`sales-topbar-icon-btn ${path.startsWith("/sales/calendar") ? "active" : ""}`}
          onClick={() => navigate("/sales/calendar")}
          title="Calendar"
        >
          <CalendarDays size={17} />
        </button>

        <button
          type="button"
          className={`sales-topbar-icon-btn ${path.startsWith("/sales/notifications") ? "active" : ""}`}
          onClick={() => navigate("/sales/notifications")}
          title="Notifications"
        >
          <Bell size={17} />
          {unreadBadgeCount > 0 && <span className="sales-topbar-badge">{unreadBadgeCount}</span>}
        </button>

        <button
          type="button"
          className={`sales-profile-pill ${path.startsWith("/sales/profile") ? "active" : ""}`}
          onClick={() => navigate("/sales/profile")}
          title="Profile & settings"
        >
          <span className="sales-profile-pill-avatar">{initials}</span>
          <span className="sales-profile-pill-text">{firstName}</span>
          <ArrowUpRight size={14} className="sales-profile-pill-arrow" />
        </button>
      </div>
    </header>
  );
};
