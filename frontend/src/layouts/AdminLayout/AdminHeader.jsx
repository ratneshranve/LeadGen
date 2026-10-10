import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { initialLeadsData } from "../../modules/admin/pages/Leads/data/leadsMockData";

export const AdminHeader = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Dynamic Header Title (Breadcrumb simplified to "Lead Management")
  const getHeaderDetails = () => {
    const path = location.pathname;
    if (path === "/admin/leads/add") return { title: "Add New Lead" };
    if (path.match(/\/admin\/leads\/[^/]+$/)) return { title: "Lead Details" };
    if (path.startsWith("/admin/leads")) return { title: "Leads" };
    if (path === "/admin/assignments") return { title: "Assignments" };
    if (path === "/admin/pipeline") return { title: "Pipeline" };
    if (path.startsWith("/admin/follow")) return { title: "Follow-ups" };
    if (path === "/admin/calendar") return { title: "Calendar" };
    if (path.startsWith("/admin/team") || path.startsWith("/admin/sales-employee")) return { title: "Sales Employees" };
    if (path.startsWith("/admin/source") || path.startsWith("/admin/lead-source")) return { title: "Lead Sources" };
    if (path.startsWith("/admin/report")) return { title: "Reports & Analytics" };
    if (path === "/admin/import-export" || path === "/admin/export") return { title: "Export Data" };
    if (path.startsWith("/admin/activit")) return { title: "Activity History" };
    if (path === "/admin/notifications") return { title: "Notifications" };
    if (path === "/admin/settings") return { title: "Settings" };
    return { title: "Dashboard" };
  };

  const { title } = getHeaderDetails();

  // Dynamic unread count for Admin (Work done by sales persons & lead assignments)
  const getAdminUnreadNotifCount = () => {
    try {
      const saved = localStorage.getItem("leadflow_v3_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => !n.read && n.targetRole !== "sales").length;
        }
      }
    } catch (e) {}
    return 8;
  };

  const adminUnreadCount = getAdminUnreadNotifCount();

  // Search filtering logic
  const searchResults = searchQuery.trim()
    ? initialLeadsData.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.phone.includes(searchQuery)
      )
    : [];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Close search overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // "/" focuses the lead search from anywhere outside a text field
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const displayName = user?.name || "Admin";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = user?.role === "MASTER_ADMIN" ? "Master admin" : "Administrator";

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="mobile-toggle-btn"
          onClick={toggleMobileSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-container">
          <span className="header-breadcrumb">
            LeadGen <ChevronRight size={12} className="crumb-separator" /> <span className="crumb-active">{title}</span>
          </span>
          <h1 className="header-title" key={title}>{title}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Live lead search */}
        <div className="header-search-wrapper" ref={searchRef} style={{ position: "relative" }}>
          <div className="header-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search leads, phone, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchOverlay(true);
              }}
              onFocus={() => setShowSearchOverlay(true)}
              ref={searchInputRef}
              className="search-input"
            />
            <kbd className="search-kbd">/</kbd>
          </div>

          {showSearchOverlay && searchQuery.trim().length > 0 && (
            <div className="search-results-overlay">
              <div className="search-results-header">
                <span>Search Results ({searchResults.length})</span>
              </div>
              {searchResults.length > 0 ? (
                <ul className="search-results-list">
                  {searchResults.slice(0, 5).map((lead) => (
                    <li
                      key={lead.id}
                      className="search-result-item"
                      onClick={() => {
                        setShowSearchOverlay(false);
                        setSearchQuery("");
                        navigate(`/admin/leads/${lead.id}`);
                      }}
                    >
                      <div className="result-avatar">{lead.name ? lead.name[0] : "L"}</div>
                      <div className="result-info">
                        <strong>{lead.name}</strong>
                        <span>{lead.company} · {lead.phone}</span>
                      </div>
                      <span className={`badge badge-${lead.status.toLowerCase().replace(/[^a-z]/g, "")}`}>
                        {lead.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-search-results">
                  No matching leads found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => navigate("/admin/settings")}
            title="Help & settings"
          >
            <HelpCircle size={18} strokeWidth={1.75} />
          </button>

          <button
            className="icon-btn"
            onClick={() => navigate("/admin/notifications")}
            title="Notifications"
          >
            <Bell size={18} strokeWidth={1.75} />
            {adminUnreadCount > 0 && (
              <span className="notif-badge">{adminUnreadCount > 9 ? "9+" : adminUnreadCount}</span>
            )}
          </button>

          <span className="header-divider" aria-hidden="true" />

          <button
            type="button"
            className="profile-btn"
            onClick={() => navigate("/admin/settings")}
            title="Admin profile & settings"
          >
            <span className="avatar-wrapper">
              <span className="avatar-initials">{initials}</span>
              <span className="status-online" />
            </span>
            <span className="profile-info-text">
              <span className="profile-name">{displayName}</span>
              <span className="profile-role">{roleLabel}</span>
            </span>
          </button>

          <button
            className="icon-btn logout-header-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
};
