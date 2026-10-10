import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { House, Users, Kanban, Clock } from "lucide-react";
import "./SalesLayout.css";

// Floating ink dock for phones & tablets; the active tab is a lime pill that
// glides between items.
export const SalesBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/sales/dashboard", label: "Home", icon: House },
    { path: "/sales/leads", label: "Leads", icon: Users },
    { path: "/sales/pipeline", label: "Pipeline", icon: Kanban },
    { path: "/sales/follow-ups", label: "Follow ups", icon: Clock },
  ];

  return (
    <nav className="sales-bottom-nav" aria-label="Sales Navigation">
      <div className="sales-stylish-pill-dock">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/sales/dashboard" && location.pathname === "/sales") ||
            (item.path === "/sales/leads" && location.pathname.startsWith("/sales/leads")) ||
            (item.path === "/sales/follow-ups" && location.pathname.startsWith("/sales/follow")) ||
            (item.path === "/sales/pipeline" && location.pathname.startsWith("/sales/pipeline"));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sales-pill-item ${isActive ? "active" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="sales-stylish-pill-active"
                  className="sales-pill-active-bg"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon size={15} className="sales-pill-icon" />
              <span className="sales-pill-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
