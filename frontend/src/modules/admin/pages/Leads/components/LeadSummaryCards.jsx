import React from "react";
import { Users, UserPlus, Activity, CheckCircle2 } from "lucide-react";

export const LeadSummaryCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: "Total Leads",
      count: metrics.total ?? 0,
      icon: Users,
      color: "var(--brand)",
      bgLight: "var(--bg-subtle)",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "New",
      count: metrics.new ?? 0,
      icon: UserPlus,
      color: "var(--accent-2-deep)",
      bgLight: "var(--bg-subtle)",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Active",
      count: metrics.active ?? 0,
      icon: Activity,
      color: "#0369a1",
      bgLight: "var(--bg-subtle)",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Converted",
      count: metrics.converted ?? 0,
      icon: CheckCircle2,
      color: "#15803d",
      bgLight: "var(--bg-subtle)",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
  ];

  return (
    <div className="summary-cards-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="summary-card"
            style={{
              background: card.cardBg,
              border: `1px solid ${card.borderColor}`,
              boxShadow: card.shadow,
            }}
          >
            <div className="summary-card-icon" style={{ backgroundColor: card.bgLight, color: card.color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
              <Icon size={18} />
            </div>
            <div className="summary-card-info">
              <span className="summary-card-label" style={{ color: "#1e293b", fontWeight: 800 }}>{card.title}</span>
              <h4 className="summary-card-val" style={{ color: "#0f172a", fontWeight: 900 }}>{card.count}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};
