import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Zap,
  LayoutDashboard,
  Users,
  GitMerge,
  Clock,
  Calendar,
  Bell,
  User,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./SalesLayout.css";

export const SalesSidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/sales/dashboard" },
    { label: "My Leads", icon: Users, path: "/sales/leads" },
    { label: "My Pipeline", icon: GitMerge, path: "/sales/pipeline" },
    { label: "My Follow-ups", icon: Clock, path: "/sales/follow-ups" },
    { label: "Calendar", icon: Calendar, path: "/sales/calendar" },
    { label: "Notifications", icon: Bell, path: "/sales/notifications" },
    { label: "My Profile", icon: User, path: "/sales/profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/sales/login");
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div className="mobile-backdrop show" onClick={closeMobileSidebar} />
      )}

      <aside className={`sales-sidebar admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon-centered">
            <Zap size={20} color="#ff3b19" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Lead Management</span>
          </div>
          <button className="mobile-close-btn" onClick={closeMobileSidebar}>
            <X size={18} color="#ffffff" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto" }}>
          <div className="nav-section-label">
            <span>MENU</span>
          </div>

          <ul className="nav-list">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <li key={item.label} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    onClick={closeMobileSidebar}
                  >
                    <span className="nav-icon">
                      <IconComponent size={19} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer Logout Button */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
