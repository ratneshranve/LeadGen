import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, GitMerge, Clock, Sparkles } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "add_lead",
      title: "Add New Lead",
      description: "Create a manual lead record in system",
      icon: UserPlus,
      color: "#ff3b19",
      bgColor: "#ffffff",
      tileBg: "linear-gradient(135deg, #ffe5e0 0%, #ffd4cc 100%)",
      borderColor: "#ffb3a6",
      shadow: "0 4px 12px rgba(255, 59, 25, 0.12)",
      btnText: "+ New Lead",
      path: "/admin/leads/add",
    },
    {
      id: "assign_leads",
      title: "Assign Leads",
      description: "Distribute unassigned leads to team",
      icon: UserCheck,
      color: "#0284c7",
      bgColor: "#ffffff",
      tileBg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
      borderColor: "#7dd3fc",
      shadow: "0 4px 12px rgba(2, 132, 199, 0.12)",
      btnText: "Assign Now",
      path: "/admin/assignments",
    },
    {
      id: "view_pipeline",
      title: "View Pipeline",
      description: "Visual Kanban board of lead stages",
      icon: GitMerge,
      color: "#16a34a",
      bgColor: "#ffffff",
      tileBg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      borderColor: "#86efac",
      shadow: "0 4px 12px rgba(22, 163, 74, 0.12)",
      btnText: "Open Board",
      path: "/admin/pipeline",
    },
    {
      id: "create_followup",
      title: "Create Follow-up",
      description: "Schedule reminder call/meeting for rep",
      icon: Clock,
      color: "#b45309",
      bgColor: "#ffffff",
      tileBg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderColor: "#fcd34d",
      shadow: "0 4px 12px rgba(217, 119, 6, 0.12)",
      btnText: "Schedule",
      path: "/admin/follow-ups",
    },
  ];

  return (
    <div className="crm-card quick-actions-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title" style={{ color: "#0f172a", fontWeight: 800 }}>Quick Actions</h2>
          <p className="card-subtitle" style={{ color: "#475569", fontWeight: 600 }}>Fast administrative workflow triggers</p>
        </div>
        <span className="sparkle-badge">
          <Sparkles size={13} /> Admin Panel
        </span>
      </div>

      <div className="actions-grid">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="action-tile"
              onClick={() => navigate(act.path)}
              style={{
                cursor: "pointer",
                background: act.tileBg,
                border: `1.5px solid ${act.borderColor}`,
                boxShadow: act.shadow,
              }}
              title={`Open ${act.title}`}
            >
              <div
                className="action-icon-wrapper"
                style={{ backgroundColor: act.bgColor, color: act.color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
              >
                <Icon size={20} />
              </div>
              <div className="action-info">
                <h4 className="action-title" style={{ color: "#0f172a", fontWeight: 800 }}>{act.title}</h4>
                <p className="action-desc" style={{ color: "#334155", fontWeight: 600 }}>{act.description}</p>
              </div>
              <button
                type="button"
                className="crm-btn action-btn"
                style={{
                  color: "#ffffff",
                  backgroundColor: act.color,
                  border: "none",
                  boxShadow: `0 3px 10px ${act.color}50`,
                  fontWeight: 700,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(act.path);
                }}
              >
                {act.btnText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
