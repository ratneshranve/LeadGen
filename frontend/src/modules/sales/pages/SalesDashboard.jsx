import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  Kanban,
  Calendar,
  Loader2,
  Target,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { dashboardApi } from "../../../api/dashboardApi";
import { followupsApi } from "../../../api/followupsApi";
import { FloatingStack } from "../../../components/brand/BrandMark";
import { Marquee } from "../../../components/motion/Marquee";
import { Reveal } from "../../../components/motion/Reveal";
import { CountUp } from "../../../components/motion/CountUp";
import "./SalesPages.css";

export const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const salesName = user?.name ? user.name.split(" ")[0] : "Representative";

  const [kpi, setKpi] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Both endpoints auto-scope to the logged-in salesperson's own leads/follow-ups.
    Promise.all([
      dashboardApi.getStats().then((data) => setKpi(data.kpi)),
      followupsApi.getAll({ status: "Pending", limit: 5, sort: "scheduledAt" }).then((data) => {
        setTodayTasks(
          (data.followUps || []).map((f) => ({
            lead: f.leadId?.name || "Lead",
            company: f.leadId?.company || "Direct Prospect",
            type: f.type,
            time: new Date(f.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            phone: f.leadId?.phone || "",
          }))
        );
      }),
    ])
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const safeKpi = kpi || { totalLeads: 0, activeLeads: 0, pendingFollowUps: 0, convertedLeads: 0 };

  if (isLoading) {
    return (
      <div className="sales-page-container" style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Loader2 size={24} className="spin-icon" />
      </div>
    );
  }

  const statCards = [
    {
      id: "leads",
      title: "My Leads",
      value: safeKpi.totalLeads,
      note: "Assigned to you",
      detail: "Every prospect routed to you — open a lead to call, WhatsApp or move it forward.",
      icon: Users,
      path: "/sales/leads",
    },
    {
      id: "prospects",
      title: "Prospects",
      value: safeKpi.activeLeads,
      note: "In pipeline",
      detail: "Leads currently moving through your stages. Drag them along as conversations progress.",
      icon: Activity,
      path: "/sales/pipeline",
    },
    {
      id: "followups",
      title: "Follow-ups",
      value: safeKpi.pendingFollowUps,
      note: `${safeKpi.overdueFollowUps || 0} overdue`,
      detail: "Calls, meetings and reminders waiting on you. Clear the overdue ones first.",
      icon: Clock,
      path: "/sales/follow-ups",
    },
    {
      id: "won",
      title: "Converted",
      value: safeKpi.convertedLeads,
      note: "Won deals",
      detail: "Deals you've closed. Every conversion feeds your performance score.",
      icon: CheckCircle2,
      path: "/sales/leads?status=Converted",
    },
  ];

  const tickerItems = [
    `${safeKpi.totalLeads} leads assigned`,
    `${safeKpi.activeLeads} in pipeline`,
    `${safeKpi.pendingFollowUps} follow-ups pending`,
    `${safeKpi.convertedLeads} deals won`,
    ...todayTasks.map((t) => `${t.time} · ${t.lead}`),
  ];

  const shortcuts = [
    { label: "My Leads Directory", desc: "Manage and view assigned prospects", icon: Users, path: "/sales/leads" },
    { label: "Sales Pipeline Stages", desc: "Track stage movements and progress", icon: Kanban, path: "/sales/pipeline" },
    { label: "Sales Calendar", desc: "Review meeting schedule and events", icon: Calendar, path: "/sales/calendar" },
  ];

  return (
    <div className="sales-page-container sales-home">
      {/* Hero */}
      <section className="sh-hero">
        <div className="sh-hero-copy">
          <span className="sh-eyebrow">Hi {salesName} — here's your day</span>
          <h2 className="sh-hero-title">
            <span className="sh-line">Your pipeline</span>
            <span className="sh-line">
              <span className="sh-inline-chip" aria-hidden="true">
                <Target size={20} />
              </span>
              is in motion
            </span>
            <span className="sh-line">today.</span>
          </h2>

          <button type="button" className="sh-dot-link" onClick={() => navigate("/sales/follow-ups")}>
            <span className="sh-dot-link-dot">
              <ArrowRight size={11} />
            </span>
            View follow-ups
          </button>

          <p className="sh-hero-sub">
            {safeKpi.pendingFollowUps} follow-ups are waiting and {safeKpi.activeLeads} prospects are moving through
            your stages. Pick up where you left off.
          </p>
        </div>

        <FloatingStack className="sh-hero-art" />
      </section>

      {/* Ticker band */}
      <Reveal as="section" className="sh-band">
        <div className="sh-band-head">
          <h3 className="sh-section-title sh-section-title--light">Today's pulse</h3>
          <span className="sh-band-note">Live from your book of leads</span>
        </div>
        <Marquee speed={36} gap={10}>
          {tickerItems.map((item, i) => (
            <span key={`${item}-${i}`} className="sh-ticker-chip">
              <span className="sh-ticker-dot" />
              {item}
            </span>
          ))}
        </Marquee>
      </Reveal>

      {/* Numbers — notched cards that flood lime on hover */}
      <Reveal as="section" className="sh-numbers">
        <div className="sh-section-head">
          <h3 className="sh-section-title">Your numbers</h3>
          <p className="sh-section-sub">Tap a card to jump straight into the work behind it.</p>
        </div>

        <div className="sh-card-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button type="button" key={card.id} className="sh-card" onClick={() => navigate(card.path)}>
                <span className="sh-card-tab">/{String(index + 1).padStart(2, "0")}</span>
                <span className="sh-card-icon">
                  <Icon size={26} strokeWidth={1.6} />
                </span>
                <span className="sh-card-value">
                  <CountUp value={card.value} />
                </span>
                <span className="sh-card-title">{card.title}</span>
                <span className="sh-card-note">{card.note}</span>
                <span className="sh-card-detail">
                  {card.detail}
                  <span className="sh-card-more">
                    <span className="sh-dot-link-dot">
                      <ArrowRight size={11} />
                    </span>
                    Open
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Schedule + shortcuts */}
      <Reveal className="sales-dashboard-two-col">
        <div className="sh-panel">
          <div className="sh-panel-head">
            <h3 className="sh-panel-title">
              Today's schedule <span className="sh-count">{todayTasks.length}</span>
            </h3>
            <button type="button" className="sh-text-btn" onClick={() => navigate("/sales/follow-ups")}>
              See all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="sh-task-list">
            {todayTasks.length === 0 && (
              <div className="sh-empty">No pending follow-ups. You're all caught up.</div>
            )}
            {todayTasks.map((task, idx) => (
              <div key={idx} className="sales-mobile-task-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="sales-task-left-content">
                  <div className="sales-task-icon-circle">
                    <Clock size={16} />
                  </div>
                  <div className="sales-task-meta">
                    <h4 className="sales-task-lead-name">{task.lead}</h4>
                    <span className="sales-task-details">{task.company} · {task.type}</span>
                  </div>
                </div>

                <div className="sales-task-actions">
                  <a
                    href={`tel:${task.phone}`}
                    className="btn-mobile-call"
                    title="Call Lead"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={12} />
                  </a>
                  <a
                    href={`https://wa.me/${task.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-mobile-wa"
                    title="WhatsApp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare size={12} />
                  </a>
                  <span className="sales-task-time-badge">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sh-panel sh-panel--ink">
          <div className="sh-panel-head">
            <h3 className="sh-panel-title">Quick shortcuts</h3>
          </div>
          <div className="sh-shortcuts">
            {shortcuts.map((s, i) => {
              const Icon = s.icon;
              return (
                <button type="button" key={s.path} className="sh-shortcut" onClick={() => navigate(s.path)}>
                  <span className="sh-shortcut-index">/{String(i + 1).padStart(2, "0")}</span>
                  <span className="sh-shortcut-icon">
                    <Icon size={16} />
                  </span>
                  <span className="sh-shortcut-text">
                    <strong>{s.label}</strong>
                    <span>{s.desc}</span>
                  </span>
                  <ArrowUpRight size={16} className="sh-shortcut-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
};
