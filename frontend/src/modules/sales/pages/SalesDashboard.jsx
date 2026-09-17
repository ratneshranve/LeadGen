import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Clock, CheckCircle2, Phone, MessageSquare, ArrowRight, Sparkles, Kanban, Calendar } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./SalesPages.css";

export const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const salesName = user?.name ? user.name.split(" ")[0] : "Representative";

  const todayTasks = [
    { lead: "Rahul Sharma", company: "Rahul Traders", type: "Call", time: "11:30 AM", phone: "+91 98765 43210" },
    { lead: "Suresh Patel", company: "Patel Chemicals", type: "Demo", time: "02:15 PM", phone: "+91 98765 11111" },
    { lead: "Vikram Aditya", company: "Aditya Enterprises", type: "Meeting", time: "04:00 PM", phone: "+91 98765 22222" },
  ];

  return (
    <div className="sales-page-container">
      {/* Mobile App Hero Welcome Card */}
      <div className="sales-mobile-hero">
        <div className="sales-hero-text">
          <h2>Hi, {salesName}! 👋</h2>
          <p>Here is your sales overview for today.</p>
        </div>
        <div className="sales-hero-badge">
          <Sparkles size={12} style={{ display: "inline", marginRight: "3px" }} />
          Active Rep
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="sales-mobile-kpi-grid">
        {/* Card 1: My Leads */}
        <div
          className="sales-mobile-kpi-card"
          onClick={() => navigate("/sales/leads")}
          style={{ background: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)", border: "1.5px solid #ffb3a6", boxShadow: "0 6px 16px rgba(255, 59, 25, 0.15)" }}
        >
          <div className="sales-kpi-top-row">
            <span className="sales-kpi-title" style={{ color: "#1e293b", fontWeight: 800 }}>My Leads</span>
            <div className="sales-kpi-icon-halo" style={{ background: "#ffffff", color: "#ff3b19", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
              <Users size={16} />
            </div>
          </div>
          <div className="sales-kpi-num" style={{ color: "#0f172a", fontWeight: 900 }}>42</div>
          <span style={{ fontSize: "0.685rem", color: "#c2410c", fontWeight: 800 }}>+3 this week</span>
        </div>

        {/* Card 2: Active Prospects */}
        <div
          className="sales-mobile-kpi-card"
          onClick={() => navigate("/sales/pipeline")}
          style={{ background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "1.5px solid #fdba74", boxShadow: "0 6px 16px rgba(234, 88, 12, 0.15)" }}
        >
          <div className="sales-kpi-top-row">
            <span className="sales-kpi-title" style={{ color: "#1e293b", fontWeight: 800 }}>Prospects</span>
            <div className="sales-kpi-icon-halo" style={{ background: "#ffffff", color: "#c2410c", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
              <Activity size={16} />
            </div>
          </div>
          <div className="sales-kpi-num" style={{ color: "#0f172a", fontWeight: 900 }}>28</div>
          <span style={{ fontSize: "0.685rem", color: "#c2410c", fontWeight: 800 }}>In pipeline</span>
        </div>

        {/* Card 3: Follow-ups */}
        <div
          className="sales-mobile-kpi-card"
          onClick={() => navigate("/sales/follow-ups")}
          style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "1.5px solid #fcd34d", boxShadow: "0 6px 16px rgba(217, 119, 6, 0.15)" }}
        >
          <div className="sales-kpi-top-row">
            <span className="sales-kpi-title" style={{ color: "#1e293b", fontWeight: 800 }}>Follow-ups</span>
            <div className="sales-kpi-icon-halo" style={{ background: "#ffffff", color: "#b45309", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="sales-kpi-num" style={{ color: "#0f172a", fontWeight: 900 }}>5</div>
          <span style={{ fontSize: "0.685rem", color: "#b45309", fontWeight: 800 }}>Due today</span>
        </div>

        {/* Card 4: Converted */}
        <div
          className="sales-mobile-kpi-card"
          onClick={() => navigate("/sales/leads?status=Converted")}
          style={{ background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "1.5px solid #86efac", boxShadow: "0 6px 16px rgba(22, 163, 74, 0.15)" }}
        >
          <div className="sales-kpi-top-row">
            <span className="sales-kpi-title" style={{ color: "#1e293b", fontWeight: 800 }}>Converted</span>
            <div className="sales-kpi-icon-halo" style={{ background: "#ffffff", color: "#15803d", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="sales-kpi-num" style={{ color: "#0f172a", fontWeight: 900 }}>6</div>
          <span style={{ fontSize: "0.685rem", color: "#15803d", fontWeight: 800 }}>Won deals</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="sales-dashboard-two-col">
        {/* Left: Today's Schedule Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Today's Schedule ({todayTasks.length})
            </h3>
            <button
              type="button"
              onClick={() => navigate("/sales/follow-ups")}
              style={{
                background: "none",
                border: "none",
                color: "#ff3b19",
                fontSize: "0.775rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              See All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {todayTasks.map((task, idx) => (
              <div key={idx} className="sales-mobile-task-card">
                <div className="sales-task-left-content">
                  <div className="sales-task-icon-circle">
                    <Clock size={16} />
                  </div>
                  <div className="sales-task-meta">
                    <h4 className="sales-task-lead-name" style={{ color: "#0f172a", fontWeight: 800 }}>{task.lead}</h4>
                    <span className="sales-task-details" style={{ color: "#334155", fontWeight: 600 }}>{task.company} · {task.type}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

        {/* Right: Quick Action Navigation Shortcuts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Quick Shortcuts
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              onClick={() => navigate("/sales/leads")}
              style={{
                background: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
                border: "1.5px solid #ffb3a6",
                borderLeft: "5px solid #ff3b19",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 59, 25, 0.12)"
              }}
            >
              <div style={{ background: "#ffffff", color: "#ff3b19", padding: "8px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Users size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "0.825rem", color: "#0f172a", fontWeight: 800, display: "block" }}>My Leads Directory</strong>
                <span style={{ fontSize: "0.7rem", color: "#334155", fontWeight: 600 }}>Manage and view assigned prospects</span>
              </div>
              <ArrowRight size={14} color="#ff3b19" />
            </div>

            <div
              onClick={() => navigate("/sales/pipeline")}
              style={{
                background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                border: "1.5px solid #86efac",
                borderLeft: "5px solid #16a34a",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.12)"
              }}
            >
              <div style={{ background: "#ffffff", color: "#16a34a", padding: "8px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Kanban size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "0.825rem", color: "#0f172a", fontWeight: 800, display: "block" }}>Sales Pipeline Stages</strong>
                <span style={{ fontSize: "0.7rem", color: "#334155", fontWeight: 600 }}>Track stage movements and progress</span>
              </div>
              <ArrowRight size={14} color="#16a34a" />
            </div>

            <div
              onClick={() => navigate("/sales/calendar")}
              style={{
                background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
                border: "1.5px solid #fdba74",
                borderLeft: "5px solid #ea580c",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.12)"
              }}
            >
              <div style={{ background: "#ffffff", color: "#ea580c", padding: "8px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                <Calendar size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "0.825rem", color: "#0f172a", fontWeight: 800, display: "block" }}>Sales Calendar</strong>
                <span style={{ fontSize: "0.7rem", color: "#334155", fontWeight: 600 }}>Review meeting schedule and events</span>
              </div>
              <ArrowRight size={14} color="#ea580c" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
