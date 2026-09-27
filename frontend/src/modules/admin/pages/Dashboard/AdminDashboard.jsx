import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { KPICards } from "../../components/KPICards/KPICards";
import { LeadStatusChart } from "../../components/LeadStatusChart/LeadStatusChart";
import { TeamPerformance } from "../../components/TeamPerformance/TeamPerformance";
import { RecentActivities } from "../../components/RecentActivities/RecentActivities";
import { QuickActions } from "../../components/QuickActions/QuickActions";
import { dashboardApi } from "../../../../api/dashboardApi";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    dashboardApi
      .getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load dashboard data.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
        <Loader2 size={24} className="spin-icon" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page" style={{ padding: 24 }}>
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "14px 18px", borderRadius: 10 }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Top 6 KPI Summary Cards */}
      <KPICards kpi={stats.kpi} />

      {/* Main Grid Row 1: Lead Status Chart & Quick Actions */}
      <div className="dashboard-grid grid-row-1">
        <div className="grid-col-main">
          <LeadStatusChart statusDistribution={stats.statusDistribution} />
        </div>
        <div className="grid-col-side">
          <QuickActions />
        </div>
      </div>

      {/* Main Grid Row 2: Team Performance */}
      <div className="dashboard-row-full">
        <TeamPerformance teamPerformance={stats.teamPerformance} />
      </div>

      {/* Main Grid Row 3: Recent Activities Feed */}
      <div className="dashboard-row-full">
        <RecentActivities activities={stats.recentActivities} />
      </div>
    </div>
  );
};
