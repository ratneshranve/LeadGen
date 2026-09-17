import React from "react";
import { Share2, Users, CheckCircle2, TrendingUp } from "lucide-react";

export const SourceSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Sources",
      count: stats.totalSources,
      subtext: "Active lead sources",
      icon: Share2,
      color: "#ff3b19",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 4px 14px rgba(255, 59, 25, 0.12)",
    },
    {
      title: "Total Leads",
      count: stats.totalLeads,
      subtext: "Leads from all sources",
      icon: Users,
      color: "#c2410c",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
      borderColor: "#fdba74",
      shadow: "0 4px 14px rgba(234, 88, 12, 0.12)",
    },
    {
      title: "Converted Leads",
      count: stats.convertedLeads,
      subtext: "Successfully converted",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 4px 14px rgba(22, 163, 74, 0.12)",
    },
    {
      title: "Best Performing Source",
      count: stats.bestSource,
      subtext: "Highest conversion rate",
      icon: TrendingUp,
      color: "#7e22ce",
      bg: "#ffffff",
      cardBg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
      borderColor: "#d8b4fe",
      shadow: "0 4px 14px rgba(147, 51, 234, 0.12)",
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
              border: `1.5px solid ${c.borderColor}`,
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
