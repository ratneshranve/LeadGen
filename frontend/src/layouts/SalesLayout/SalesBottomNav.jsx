import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./SalesLayout.css";

export const SalesBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/sales/dashboard", label: "Home" },
    { path: "/sales/leads", label: "Leads" },
    { path: "/sales/pipeline", label: "Pipeline" },
    { path: "/sales/follow-ups", label: "Follow ups" },
  ];

  return (
    <nav className="sales-bottom-nav" aria-label="Sales Navigation">
      <div className="sales-stylish-pill-dock">
        {navItems.map((item) => {
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
              <span className="sales-pill-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
