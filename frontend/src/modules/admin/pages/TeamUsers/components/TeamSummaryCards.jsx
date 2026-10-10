import React from "react";
import { Users, UserCheck, Activity, CheckCircle2 } from "lucide-react";

export const TeamSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: "TOTAL SALES USERS",
      count: stats.total,
      subtext: "System registered users",
      icon: Users,
      color: "var(--brand)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "ACTIVE SALES EMPLOYEES",
      count: stats.active,
      subtext: "Active lead handlers",
      icon: UserCheck,
      color: "#b45309",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "ASSIGNED LEADS",
      count: stats.assignedLeads || 31,
      subtext: "Allocated in pipeline",
      icon: Activity,
      color: "var(--accent-2-deep)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "CONVERTED DEALS",
      count: stats.convertedDeals || 10,
      subtext: "Deals won by sales team",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
  ];

  return (
    <div className="team-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="crm-card overview-stat-card"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.borderColor}`,
              boxShadow: c.shadow,
              padding: "16px 20px",
              borderRadius: "16px",
            }}
          >
            <div className="stat-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="stat-info">
                <span className="stat-label" style={{ fontSize: "0.725rem", fontWeight: 800, color: "#1e293b", letterSpacing: "0.05em" }}>{c.title}</span>
                <div className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: "2px 0" }}>{c.count}</div>
                <span className="stat-subtext" style={{ fontSize: "0.725rem", fontWeight: 700, color: "#334155" }}>{c.subtext}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: c.bg, color: c.color, width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
