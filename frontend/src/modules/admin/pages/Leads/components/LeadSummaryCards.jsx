import React from "react";
import { Users, UserPlus, Activity, CheckCircle2 } from "lucide-react";

export const LeadSummaryCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: "Total Leads",
      count: metrics.total ?? 0,
      icon: Users,
      color: "#ff3b19",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 4px 14px rgba(255, 59, 25, 0.12)",
    },
    {
      title: "New",
      count: metrics.new ?? 0,
      icon: UserPlus,
      color: "#c2410c",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
      borderColor: "#fdba74",
      shadow: "0 4px 14px rgba(234, 88, 12, 0.12)",
    },
    {
      title: "Active",
      count: metrics.active ?? 0,
      icon: Activity,
      color: "#0369a1",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
      borderColor: "#7dd3fc",
      shadow: "0 4px 14px rgba(2, 132, 199, 0.12)",
    },
    {
      title: "Converted",
      count: metrics.converted ?? 0,
      icon: CheckCircle2,
      color: "#15803d",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 4px 14px rgba(22, 163, 74, 0.12)",
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
              border: `1.5px solid ${card.borderColor}`,
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
