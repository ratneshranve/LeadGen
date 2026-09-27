import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Bell,
  Menu,
  LogOut
} from "lucide-react";
import { adminProfile } from "../../modules/admin/data/dashboardMockData";
import { initialLeadsData } from "../../modules/admin/pages/Leads/data/leadsMockData";

export const AdminHeader = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const searchRef = useRef(null);

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
    if (path.startsWith("/admin/team")) return { title: "Sales Employees" };
    if (path.startsWith("/admin/source") || path.startsWith("/admin/lead-source")) return { title: "Lead Sources" };
    if (path.startsWith("/admin/report")) return { title: "Reports & Analytics" };
    if (path === "/admin/import-export") return { title: "Import / Export" };
    if (path.startsWith("/admin/activit")) return { title: "Activity History" };
    if (path === "/admin/notifications") return { title: "Notifications" };
    if (path === "/admin/settings") return { title: "Settings" };
    return { title: "Admin Dashboard" };
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

        {/* Header Title & Clean "Lead Management" Subtitle (No trailing slashes) */}
        <div className="header-title-container">
          <h1 className="header-title">{title}</h1>
          <span className="crumb-active" style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: 500 }}>
            LeadGen
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Active Search Input with Live Results Overlay */}
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
              className="search-input"
            />
          </div>

          {/* Active Search Dropdown Overlay */}
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

        {/* Action Controls */}
        <div className="header-actions">
          {/* Notification Bell (Clicking navigates directly to Notifications Page) */}
          <button
            className="icon-btn"
            onClick={() => navigate("/admin/notifications")}
            title="Notifications"
          >
            <Bell size={19} />
            {adminUnreadCount > 0 && (
              <span className="notif-badge">{adminUnreadCount}</span>
            )}
          </button>

          {/* Admin Avatar Logo Only (Clicking opens Admin Settings) */}
          <button
            type="button"
            className="icon-btn profile-avatar-only-btn"
            onClick={() => navigate("/admin/settings")}
            title="Admin Profile & Settings"
            style={{ width: "40px", height: "40px", padding: 0, border: "none", background: "none", cursor: "pointer" }}
          >
            <div className="avatar-wrapper" style={{ width: "38px", height: "38px" }}>
              <span className="avatar-initials">
                {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "RK"}
              </span>
              <span className="status-online" />
            </div>
          </button>

          {/* Visible Logout Button Right Next to Profile */}
          <button
            className="icon-btn logout-header-btn"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={18} color="#ef4444" />
          </button>
        </div>
      </div>
    </header>
  );
};
