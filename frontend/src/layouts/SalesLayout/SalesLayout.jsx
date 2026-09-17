import React from "react";
import { Outlet } from "react-router-dom";
import { SalesHeader } from "./SalesHeader";
import { SalesBottomNav } from "./SalesBottomNav";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";
import "./SalesLayout.css";

export const SalesLayout = () => {
  return (
    <div className="sales-app-wrapper">
      <div className="sales-app-container">
        {/* Mobile Top Bar */}
        <SalesHeader />

        {/* Scrollable Mobile App Body */}
        <main className="sales-app-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <SalesBottomNav />
      </div>
    </div>
  );
};
