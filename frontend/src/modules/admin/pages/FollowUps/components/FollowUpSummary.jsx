import React from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export const FollowUpSummary = ({ stats }) => {
  const cards = [
    {
      title: "Today's Follow-ups",
      count: stats.today,
      subtext: "Scheduled for today",
      icon: Calendar,
      color: "var(--brand)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Upcoming",
      count: stats.upcoming,
      subtext: "Future scheduled tasks",
      icon: Clock,
      color: "var(--accent-2-deep)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Overdue",
      count: stats.overdue,
      subtext: "Action required immediately",
      icon: AlertTriangle,
      color: "#b91c1c",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Completed",
      count: stats.completed,
      subtext: "Finished interactions",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
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
              border: `1px solid ${c.borderColor}`,
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
