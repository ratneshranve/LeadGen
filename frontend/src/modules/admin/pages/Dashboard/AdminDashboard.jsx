import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Download, CalendarDays } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { Reveal } from "../../../../components/motion/Reveal";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

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
        <div className="dashboard-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Greeting row */}
      <div className="dashboard-hero">
        <div>
          <span className="hero-date"><CalendarDays size={13} /> {today}</span>
          <h2 className="hero-title">{greeting}, {firstName}</h2>
          <p className="hero-subtitle">Here's how your lead pipeline is moving today.</p>
        </div>
        <div className="hero-controls">
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => navigate("/admin/export")}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="crm-btn crm-btn-primary lg-shine" onClick={() => navigate("/admin/leads/add")}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Top 6 KPI Summary Cards */}
      <KPICards kpi={stats.kpi} />

      {/* Main Grid Row 1: Lead Status Chart & Quick Actions */}
      <Reveal className="dashboard-grid grid-row-1">
        <div className="grid-col-main">
          <LeadStatusChart statusDistribution={stats.statusDistribution} />
        </div>
        <div className="grid-col-side">
          <QuickActions />
        </div>
      </Reveal>

      {/* Main Grid Row 2: Team Performance */}
      <Reveal className="dashboard-row-full">
        <TeamPerformance teamPerformance={stats.teamPerformance} />
      </Reveal>

      {/* Main Grid Row 3: Recent Activities Feed */}
      <Reveal className="dashboard-row-full">
        <RecentActivities activities={stats.recentActivities} />
      </Reveal>
    </div>
  );
};
