import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import "./AdminLayout.css";

export const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="admin-layout-root">
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={closeMobileSidebar}
      />
      <div className="main-wrapper">
        <AdminHeader toggleMobileSidebar={toggleMobileSidebar} />
        <main className="content-body">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
