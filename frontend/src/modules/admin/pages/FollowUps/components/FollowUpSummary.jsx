import React from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const FollowUpSummary = ({ stats }) => {
  const cards = [
    {
      title: "Today's Follow-ups",
      count: stats.today,
      subtext: "Scheduled for today",
      icon: Calendar,
      color: "#ff3b19",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 4px 14px rgba(255, 59, 25, 0.12)",
    },
    {
      title: "Upcoming",
      count: stats.upcoming,
      subtext: "Future scheduled tasks",
      icon: Clock,
      color: "#c2410c",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
      borderColor: "#fdba74",
      shadow: "0 4px 14px rgba(234, 88, 12, 0.12)",
    },
    {
      title: "Overdue",
      count: stats.overdue,
      subtext: "Action required immediately",
      icon: AlertTriangle,
      color: "#b91c1c",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      borderColor: "#fca5a5",
      shadow: "0 4px 14px rgba(220, 38, 38, 0.12)",
    },
    {
      title: "Completed",
      count: stats.completed,
      subtext: "Finished interactions",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 4px 14px rgba(22, 163, 74, 0.12)",
    },
  ];

  return (
    <div className="followup-summary-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="crm-card overview-stat-card"
            style={{
              background: c.cardBg,
              border: `1.5px solid ${c.borderColor}`,
              boxShadow: c.shadow,
              borderRadius: "16px",
            }}
          >
            <div className="stat-card-inner">
              <div className="stat-info">
                <span className="stat-label" style={{ color: "#1e293b", fontWeight: 800 }}>{c.title}</span>
                <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{c.count}</div>
                <span className="stat-subtext" style={{ color: "#334155", fontWeight: 700 }}>{c.subtext}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: c.bg, color: c.color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
