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
  Zap,
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
      <SidebarBody className="justify-between min-h-full flex flex-col">
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

const SidebarContent = ({
  mainMenuItems,
  systemMenuItems,
  location,
  handleLogout,
  closeMobileSidebar,
}) => {
  const { open, animate } = useSidebar();

  return (
    <div className="flex flex-col flex-1 justify-between min-h-full">
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 py-3 mb-2 border-b border-white/10 flex-shrink-0">
          <div className="w-10 h-10 bg-[#ff3b19] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff3b19]/35 flex-shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <motion.div
            animate={{
              display: animate ? (open ? "flex" : "none") : "flex",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.2 }}
            className="flex flex-col min-w-0 overflow-hidden"
          >
            <span className="font-extrabold text-white text-base tracking-tight whitespace-nowrap">
              LeadGen
            </span>
          </motion.div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-5 py-2">
          {/* Main Menu Section */}
          <div>
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-[0.65rem] font-extrabold text-white/45 tracking-widest px-3 mb-2 uppercase"
            >
              MENU
            </motion.div>
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

          {/* System Section */}
          <div>
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-[0.65rem] font-extrabold text-white/45 tracking-widest px-3 mb-2 uppercase"
            >
              SYSTEM & SETTINGS
            </motion.div>
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
        </div>
      </div>

      {/* Sidebar Footer Logout Button */}
      <div className="pt-3 mt-auto border-t border-white/10 flex-shrink-0 pb-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all duration-200 group/logout"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 text-white">
            <LogOut size={17} />
          </div>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </div>
  );
};
