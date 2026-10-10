import React from "react";
import { Share2, Users, CheckCircle2, TrendingUp } from "lucide-react";

export const SourceSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Sources",
      count: stats.totalSources,
      subtext: "Active lead sources",
      icon: Share2,
      color: "var(--brand)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Total Leads",
      count: stats.totalLeads,
      subtext: "Leads from all sources",
      icon: Users,
      color: "var(--accent-2-deep)",
      bg: "#ffffff",
      cardBg: "var(--surface-gradient)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Converted Leads",
      count: stats.convertedLeads,
      subtext: "Successfully converted",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
    {
      title: "Best Performing Source",
      count: stats.bestSource,
      subtext: "Highest conversion rate",
      icon: TrendingUp,
      color: "#7e22ce",
      bg: "#ffffff",
      cardBg: "var(--bg-surface)",
      borderColor: "var(--border-color)",
      shadow: "var(--shadow-sm)",
    },
  ];

  return (
    <div className="source-summary-grid">
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
                <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900, fontSize: typeof c.count === "string" ? "1.25rem" : "1.75rem" }}>
                  {c.count}
                </div>
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
