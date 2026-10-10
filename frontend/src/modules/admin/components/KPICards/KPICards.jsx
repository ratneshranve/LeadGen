import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { CountUp } from "../../../../components/motion/CountUp";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const KPICards = ({ kpi }) => {
  const navigate = useNavigate();

  const safe = kpi || {
    totalLeads: 0, newLeads: 0, activeLeads: 0, convertedLeads: 0, lostLeads: 0,
    pendingFollowUps: 0, overdueFollowUps: 0, totalEstimatedValue: 0, conversionRate: 0,
  };

  const cards = [
    {
      id: "total",
      label: "Total Leads",
      value: safe.totalLeads,
      subtext: `Est. value ${formatCurrency(safe.totalEstimatedValue)}`,
      icon: Users,
      tone: "brand",
      statusFilter: "All",
    },
    {
      id: "new",
      label: "New Leads",
      value: safe.newLeads,
      subtext: "Awaiting first contact",
      icon: UserPlus,
      tone: "ember",
      statusFilter: "New",
    },
    {
      id: "active",
      label: "Active Leads",
      value: safe.activeLeads,
      subtext: "Currently in pipeline",
      icon: Activity,
      tone: "sky",
      statusFilter: "Active",
    },
    {
      id: "converted",
      label: "Converted",
      value: safe.convertedLeads,
      subtext: `${safe.conversionRate}% conversion rate`,
      icon: CheckCircle2,
      tone: "green",
      statusFilter: "Converted",
    },
    {
      id: "lost",
      label: "Lost Leads",
      value: safe.lostLeads,
      subtext: "Needs review",
      icon: XCircle,
      tone: "red",
      statusFilter: "Lost",
    },
    {
      id: "followup",
      label: "Pending Follow-ups",
      value: safe.pendingFollowUps,
      subtext: `${safe.overdueFollowUps} overdue`,
      icon: Clock,
      tone: "amber",
      statusFilter: "Follow-up",
    },
  ];

  return (
    <div className="kpi-grid lg-stagger">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <button
            type="button"
            key={card.id}
            className={`kpi-card kpi-tone-${card.tone}`}
            onClick={() => navigate(`/admin/leads?status=${card.statusFilter}`)}
            title={`View ${card.label}`}
          >
            <div className="kpi-top">
              <span className="kpi-icon-box">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="kpi-index">/{String(index + 1).padStart(2, "0")}</span>
            </div>

            <div className="kpi-middle">
              <span className="kpi-label">{card.label}</span>
              <h3 className="kpi-value">
                <CountUp value={card.value} />
              </h3>
            </div>

            <div className="kpi-bottom">
              <span className="kpi-subtext">{card.subtext}</span>
              <ArrowUpRight size={15} className="kpi-arrow" />
            </div>
          </button>
        );
      })}
    </div>
  );
};
