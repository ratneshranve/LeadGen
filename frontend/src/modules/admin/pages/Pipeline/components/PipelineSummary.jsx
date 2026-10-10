import React from "react";
import { Users, Sparkles, PhoneCall, Clock, Heart, CheckCircle2, XCircle } from "lucide-react";

export const PipelineSummary = ({ leads }) => {
  const countStage = (status) => leads.filter((l) => l.status === status).length;

  const total = leads.length;
  const newCount = countStage("New");
  const contactedCount = countStage("Contacted");
  const followupCount = countStage("Follow-up");
  const interestedCount = countStage("Interested");
  const convertedCount = countStage("Converted");
  const lostCount = countStage("Lost");

  const cards = [
    { title: "Total Leads", count: total, icon: Users, color: "#4338ca", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#a5b4fc", shadow: "0 4px 12px rgba(79, 70, 229, 0.12)" },
    { title: "New", count: newCount, icon: Sparkles, color: "var(--brand)", bg: "#ffffff", cardBg: "var(--surface-gradient)", borderColor: "var(--brand-border)", shadow: "0 4px 12px rgb(var(--brand-rgb) / 0.12)" },
    { title: "Contacted", count: contactedCount, icon: PhoneCall, color: "#0369a1", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#7dd3fc", shadow: "0 4px 12px rgba(2, 132, 199, 0.12)" },
    { title: "Follow-up", count: followupCount, icon: Clock, color: "#b45309", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#fcd34d", shadow: "0 4px 12px rgba(217, 119, 6, 0.12)" },
    { title: "Interested", count: interestedCount, icon: Heart, color: "#7e22ce", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#d8b4fe", shadow: "0 4px 12px rgba(147, 51, 234, 0.12)" },
    { title: "Converted", count: convertedCount, icon: CheckCircle2, color: "#15803d", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#86efac", shadow: "0 4px 12px rgba(22, 163, 74, 0.12)" },
    { title: "Lost", count: lostCount, icon: XCircle, color: "#b91c1c", bg: "#ffffff", cardBg: "var(--bg-surface)", borderColor: "#fca5a5", shadow: "0 4px 12px rgba(220, 38, 38, 0.12)" },
  ];

  return (
    <div className="pipeline-summary-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="crm-card summary-mini-card"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.borderColor}`,
              boxShadow: c.shadow,
              borderRadius: "14px",
            }}
          >
            <div className="summary-card-inner">
              <div className="summary-card-info">
                <span className="summary-card-label" style={{ color: "#1e293b", fontWeight: 800 }}>{c.title}</span>
                <span className="summary-card-count" style={{ color: "#0f172a", fontWeight: 900 }}>
                  {c.count}
                </span>
              </div>
              <div className="summary-card-icon" style={{ backgroundColor: c.bg, color: c.color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Icon size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
