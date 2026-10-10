import React from "react";
import { Users, UserX, UserCheck, ShieldCheck } from "lucide-react";

export const AssignmentOverview = ({ stats }) => {
  const cards = [
    {
      title: "Total Leads",
      value: stats.total,
      subtext: "System wide leads",
      icon: Users,
      iconBg: "#ffffff",
      iconColor: "var(--brand)",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Unassigned",
      value: stats.unassigned,
      subtext: "Needs delegation",
      icon: UserX,
      iconBg: "#ffffff",
      iconColor: "#b45309",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Assigned",
      value: stats.assigned,
      subtext: "Active in pipeline",
      icon: UserCheck,
      iconBg: "#ffffff",
      iconColor: "#15803d",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Sales Employees",
      value: stats.salespersonsCount,
      subtext: "Active team members",
      icon: ShieldCheck,
      iconBg: "#ffffff",
      iconColor: "var(--accent-2-deep)",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
  ];

  return (
    <div className="assignment-overview-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="crm-card overview-stat-card"
            style={{
              background: card.cardBg,
              border: `1px solid ${card.borderColor}`,
              boxShadow: card.shadow,
            }}
          >
            <div className="stat-card-inner">
              <div className="stat-info">
                <span className="stat-label" style={{ color: "#1e293b", fontWeight: 800 }}>{card.title}</span>
                <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{card.value}</div>
                <span className="stat-subtext" style={{ color: "#334155", fontWeight: 700 }}>{card.subtext}</span>
              </div>
              <div
                className="stat-icon-wrapper"
                style={{ backgroundColor: card.iconBg, color: card.iconColor, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
