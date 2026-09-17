import React from "react";
import { KPICards } from "../../components/KPICards/KPICards";
import { LeadStatusChart } from "../../components/LeadStatusChart/LeadStatusChart";
import { TeamPerformance } from "../../components/TeamPerformance/TeamPerformance";
import { RecentActivities } from "../../components/RecentActivities/RecentActivities";
import { QuickActions } from "../../components/QuickActions/QuickActions";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Top 6 KPI Summary Cards */}
      <KPICards dateRange="this_month" />

      {/* Main Grid Row 1: Lead Status Chart & Quick Actions */}
      <div className="dashboard-grid grid-row-1">
        <div className="grid-col-main">
          <LeadStatusChart dateRange="this_month" />
        </div>
        <div className="grid-col-side">
          <QuickActions />
        </div>
      </div>

      {/* Main Grid Row 2: Team Performance */}
      <div className="dashboard-row-full">
        <TeamPerformance />
      </div>

      {/* Main Grid Row 3: Recent Activities Feed */}
      <div className="dashboard-row-full">
        <RecentActivities />
      </div>
    </div>
  );
};
