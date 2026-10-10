import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, GitMerge, Clock, ArrowRight } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "add_lead",
      title: "Add New Lead",
      description: "Create a manual lead record in system",
      icon: UserPlus,
      btnText: "New lead",
      path: "/admin/leads/add",
    },
    {
      id: "assign_leads",
      title: "Assign Leads",
      description: "Distribute unassigned leads to team",
      icon: UserCheck,
      btnText: "Assign",
      path: "/admin/assignments",
    },
    {
      id: "view_pipeline",
      title: "View Pipeline",
      description: "Visual Kanban board of lead stages",
      icon: GitMerge,
      btnText: "Open board",
      path: "/admin/pipeline",
    },
    {
      id: "create_followup",
      title: "Create Follow-up",
      description: "Schedule reminder call/meeting for rep",
      icon: Clock,
      btnText: "Schedule",
      path: "/admin/follow-ups",
    },
  ];

  return (
    <div className="crm-card quick-actions-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Quick Actions</h2>
          <p className="card-subtitle">Fast administrative workflow triggers</p>
        </div>
        <span className="sparkle-badge">
          <span className="sparkle-dot" /> Shortcuts
        </span>
      </div>

      <div className="actions-grid">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              type="button"
              key={act.id}
              className="action-tile"
              onClick={() => navigate(act.path)}
              title={`Open ${act.title}`}
            >
              <span className="action-index">/{String(index + 1).padStart(2, "0")}</span>
              <span className="action-icon-wrapper">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="action-info">
                <span className="action-title">{act.title}</span>
                <span className="action-desc">{act.description}</span>
              </span>
              <span className="action-btn">
                {act.btnText}
                <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
