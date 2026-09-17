import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { kpiMetricsByDateRange } from "../../data/dashboardMockData";

export const KPICards = ({ dateRange = "this_month" }) => {
  const navigate = useNavigate();
  const currentMetrics = kpiMetricsByDateRange[dateRange] || kpiMetricsByDateRange.this_month;

  const cards = [
    {
      id: "total",
      key: "totalLeads",
      data: currentMetrics.totalLeads,
      icon: Users,
      color: "#ff3b19",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 6px 16px rgba(255, 59, 25, 0.15)",
      statusFilter: "All",
    },
    {
      id: "new",
      key: "newLeads",
      data: currentMetrics.newLeads,
      icon: UserPlus,
      color: "#c2410c",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
      borderColor: "#fdba74",
      shadow: "0 6px 16px rgba(234, 88, 12, 0.15)",
      statusFilter: "New",
    },
    {
      id: "active",
      key: "activeLeads",
      data: currentMetrics.activeLeads,
      icon: Activity,
      color: "#0369a1",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
      borderColor: "#7dd3fc",
      shadow: "0 6px 16px rgba(2, 132, 199, 0.15)",
      statusFilter: "Active",
    },
    {
      id: "converted",
      key: "convertedLeads",
      data: currentMetrics.convertedLeads,
      icon: CheckCircle2,
      color: "#15803d",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 6px 16px rgba(22, 163, 74, 0.15)",
      statusFilter: "Converted",
    },
    {
      id: "lost",
      key: "lostLeads",
      data: currentMetrics.lostLeads,
      icon: XCircle,
      color: "#b91c1c",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      borderColor: "#fca5a5",
      shadow: "0 6px 16px rgba(220, 38, 38, 0.15)",
      statusFilter: "Lost",
    },
    {
      id: "followup",
      key: "pendingFollowups",
      data: currentMetrics.pendingFollowups,
      icon: Clock,
      color: "#b45309",
      bgLight: "#ffffff",
      cardBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fcd34d",
      shadow: "0 6px 16px rgba(217, 119, 6, 0.15)",
      statusFilter: "Follow-up",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const { value, label, change, isPositive, subtext } = card.data;

        return (
          <div
            key={card.id}
            className="kpi-card"
            style={{
              cursor: "pointer",
              background: card.cardBg,
              border: `1.5px solid ${card.borderColor}`,
              boxShadow: card.shadow,
            }}
            onClick={() => navigate(`/admin/leads?status=${card.statusFilter}`)}
            title={`Click to view ${label}`}
          >
            <div className="kpi-top">
              <div className="kpi-icon-box" style={{ backgroundColor: card.bgLight, color: card.color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Icon size={18} />
              </div>
              <div className={`kpi-badge ${isPositive ? "kpi-badge-pos" : "kpi-badge-neg"}`}>
                {isPositive ? <TrendingUp size={11} /> : <AlertCircle size={11} />}
                <span>{change}</span>
              </div>
            </div>

            <div className="kpi-middle">
              <span className="kpi-label" style={{ color: "#1e293b", fontWeight: 800 }}>{label}</span>
              <h3 className="kpi-value" style={{ color: "#0f172a", fontWeight: 900 }}>{value.toLocaleString()}</h3>
            </div>

            <div className="kpi-bottom">
              <span className="kpi-subtext" style={{ color: "#334155", fontWeight: 700 }}>{subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
