import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GitMerge,
  Clock,
  Calendar,
  ShieldCheck,
  Share2,
  BarChart3,
  FileSpreadsheet,
  History,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar
} from "../../components/ui/sidebar";
import { motion } from "framer-motion";
import { AdminLogoMark } from "../../components/brand/BrandMark";

export const AdminSidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const mainMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      checkActive: (path) => path === "/admin/dashboard"
    },
    {
      label: "Leads",
      icon: Users,
      path: "/admin/leads",
      checkActive: (path) => path.startsWith("/admin/leads")
    },
    {
      label: "Assignments",
      icon: UserCheck,
      path: "/admin/assignments",
      checkActive: (path) => path === "/admin/assignments"
    },
    {
      label: "Pipeline",
      icon: GitMerge,
      path: "/admin/pipeline",
      checkActive: (path) => path === "/admin/pipeline"
    },
    {
      label: "Follow-ups",
      icon: Clock,
      path: "/admin/follow-ups",
      checkActive: (path) => path.startsWith("/admin/follow")
    },
    {
      label: "Calendar",
      icon: Calendar,
      path: "/admin/calendar",
      checkActive: (path) => path === "/admin/calendar"
    },
    {
      label: "Sales Employees",
      icon: ShieldCheck,
      path: "/admin/sales-employees",
      checkActive: (path) => path.startsWith("/admin/sales-employee") || path.startsWith("/admin/team")
    },
    {
      label: "Lead Sources",
      icon: Share2,
      path: "/admin/lead-sources",
      checkActive: (path) => path.startsWith("/admin/source") || path.startsWith("/admin/lead-source")
    },
  ];

  const systemMenuItems = [
    {
      label: "Reports & Analytics",
      icon: BarChart3,
      path: "/admin/reports",
      checkActive: (path) => path.startsWith("/admin/report")
    },
    {
      label: "Export Data",
      icon: FileSpreadsheet,
      path: "/admin/export",
      checkActive: (path) => path === "/admin/export"
    },
    {
      label: "Activity History",
      icon: History,
      path: "/admin/activity-history",
      checkActive: (path) => path.startsWith("/admin/activit") || path.startsWith("/admin/activity")
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      checkActive: (path) => path === "/admin/notifications"
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
      checkActive: (path) => path === "/admin/settings"
    },
  ];

  return (
    <Sidebar open={isMobileOpen} setOpen={closeMobileSidebar}>
      <SidebarBody>
        <SidebarContent
          mainMenuItems={mainMenuItems}
          systemMenuItems={systemMenuItems}
          location={location}
          handleLogout={handleLogout}
          closeMobileSidebar={closeMobileSidebar}
        />
      </SidebarBody>
    </Sidebar>
  );
};

const SectionLabel = ({ children }) => {
  const { open, animate, openMobile } = useSidebar();
  const show = !animate || open || openMobile;
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="admin-rail-section"
    >
      {show ? children : <span className="admin-rail-section-dash" />}
    </motion.div>
  );
};

const SidebarContent = ({
  mainMenuItems,
  systemMenuItems,
  location,
  handleLogout,
  closeMobileSidebar,
}) => {
  const { open, animate, openMobile } = useSidebar();
  const showText = !animate || open || openMobile;

  return (
    <div className="flex flex-col flex-1 justify-between min-h-full">
      <div className="flex flex-col flex-1">
        {/* Brand */}
        <div className="admin-rail-brand">
          <span className="admin-rail-logo">
            <AdminLogoMark size={30} />
          </span>
          <motion.div
            initial={false}
            animate={{ opacity: showText ? 1 : 0, x: showText ? 0 : -6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col min-w-0 overflow-hidden"
          >
            <span className="admin-rail-brand-name">LeadGen</span>
            <span className="admin-rail-brand-sub">Admin console</span>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4 pt-3" aria-label="Admin navigation">
          <div>
            <SectionLabel>Menu</SectionLabel>
            <div className="flex flex-col gap-1">
              {mainMenuItems.map((item) => (
                <SidebarLink
                  key={item.label}
                  link={{
                    label: item.label,
                    href: item.path,
                    icon: item.icon,
                    isActive: item.checkActive(location.pathname),
                  }}
                  onClick={closeMobileSidebar}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>System</SectionLabel>
            <div className="flex flex-col gap-1">
              {systemMenuItems.map((item) => (
                <SidebarLink
                  key={item.label}
                  link={{
                    label: item.label,
                    href: item.path,
                    icon: item.icon,
                    isActive: item.checkActive(location.pathname),
                  }}
                  onClick={closeMobileSidebar}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Logout */}
      <div className="pt-3 mt-4 border-t border-white/10 flex-shrink-0">
        <button type="button" onClick={handleLogout} className="admin-rail-link admin-rail-logout" title="Logout">
          <span className="admin-rail-icon">
            <LogOut size={18} strokeWidth={1.75} />
          </span>
          <motion.span
            initial={false}
            animate={{ opacity: showText ? 1 : 0, x: showText ? 0 : -6 }}
            transition={{ duration: 0.2 }}
            className="admin-rail-label"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </div>
  );
};
