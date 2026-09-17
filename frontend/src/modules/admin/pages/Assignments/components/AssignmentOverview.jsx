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
      iconColor: "#ff3b19",
      cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 4px 14px rgba(255, 59, 25, 0.12)",
    },
    {
      title: "Unassigned",
      value: stats.unassigned,
      subtext: "Needs delegation",
      icon: UserX,
      iconBg: "#ffffff",
      iconColor: "#b45309",
      cardBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fcd34d",
      shadow: "0 4px 14px rgba(217, 119, 6, 0.12)",
    },
    {
      title: "Assigned",
      value: stats.assigned,
      subtext: "Active in pipeline",
      icon: UserCheck,
      iconBg: "#ffffff",
      iconColor: "#15803d",
      cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 4px 14px rgba(22, 163, 74, 0.12)",
    },
    {
      title: "Sales Employees",
      value: stats.salespersonsCount,
      subtext: "Active team members",
      icon: ShieldCheck,
      iconBg: "#ffffff",
      iconColor: "#c2410c",
      cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
      borderColor: "#fdba74",
      shadow: "0 4px 14px rgba(234, 88, 12, 0.12)",
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
              border: `1.5px solid ${card.borderColor}`,
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
