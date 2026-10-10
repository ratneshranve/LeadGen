import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import { PageTransition, sectionKeyFromPath } from "../../components/motion/PageTransition";
import "./AdminLayout.css";

export const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

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
            <PageTransition panel="admin" sectionKey={sectionKeyFromPath(location.pathname)}>
              <Outlet />
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
