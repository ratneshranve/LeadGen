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
    { title: "Total Leads", count: total, icon: Users, color: "#4338ca", bg: "#ffffff", cardBg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", borderColor: "#a5b4fc", shadow: "0 4px 12px rgba(79, 70, 229, 0.12)" },
    { title: "New", count: newCount, icon: Sparkles, color: "#ff3b19", bg: "#ffffff", cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)", borderColor: "#ffb3a6", shadow: "0 4px 12px rgba(255, 59, 25, 0.12)" },
    { title: "Contacted", count: contactedCount, icon: PhoneCall, color: "#0369a1", bg: "#ffffff", cardBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", borderColor: "#7dd3fc", shadow: "0 4px 12px rgba(2, 132, 199, 0.12)" },
    { title: "Follow-up", count: followupCount, icon: Clock, color: "#b45309", bg: "#ffffff", cardBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderColor: "#fcd34d", shadow: "0 4px 12px rgba(217, 119, 6, 0.12)" },
    { title: "Interested", count: interestedCount, icon: Heart, color: "#7e22ce", bg: "#ffffff", cardBg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", borderColor: "#d8b4fe", shadow: "0 4px 12px rgba(147, 51, 234, 0.12)" },
    { title: "Converted", count: convertedCount, icon: CheckCircle2, color: "#15803d", bg: "#ffffff", cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", borderColor: "#86efac", shadow: "0 4px 12px rgba(22, 163, 74, 0.12)" },
    { title: "Lost", count: lostCount, icon: XCircle, color: "#b91c1c", bg: "#ffffff", cardBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", borderColor: "#fca5a5", shadow: "0 4px 12px rgba(220, 38, 38, 0.12)" },
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
              border: `1.5px solid ${c.borderColor}`,
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
