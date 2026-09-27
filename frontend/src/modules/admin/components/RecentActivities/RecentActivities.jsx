import React from "react";
import {
  UserPlus,
  UserCheck,
  RefreshCw,
  Clock
} from "lucide-react";

// Maps backend/src/models/Activity.model.js actionType values to an icon.
const ICON_BY_ACTION = {
  LEAD_CREATED: { Icon: UserPlus, color: "#ff3b19" },
  LEAD_ASSIGNED: { Icon: UserCheck, color: "#9333ea" },
  LEAD_REASSIGNED: { Icon: UserCheck, color: "#9333ea" },
  STATUS_CHANGED: { Icon: RefreshCw, color: "#0891b2" },
  STAGE_CHANGED: { Icon: RefreshCw, color: "#0891b2" },
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const RecentActivities = ({ activities = [] }) => {
  const getActivityIcon = (actionType) => {
    const match = ICON_BY_ACTION[actionType];
    if (match) {
      const { Icon, color } = match;
      return <Icon size={16} color={color} />;
    }
    return <Clock size={16} color="#64748b" />;
  };

  return (
    <div className="crm-card activity-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Recent Activities</h2>
          <p className="card-subtitle">Live stream of lead events and team actions</p>
        </div>
        <span className="live-dot-badge">
          <span className="pulse-dot" /> Live Feed
        </span>
      </div>

      <div className="activity-timeline">
        {activities.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            No recent activity yet.
          </div>
        )}
        {activities.map((act) => (
          <div key={act._id} className="timeline-item">
            <div className="timeline-icon-box">
              {getActivityIcon(act.actionType)}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="activity-title">{act.title}</span>
                <span className="activity-time">{timeAgo(act.createdAt)}</span>
              </div>

              <p className="activity-desc">{act.description}</p>

              <div className="activity-meta">
                {act.leadId && (
                  <>
                    <span className="meta-lead">Lead: <strong>{act.leadId.name}</strong></span>
                    <span className="meta-divider">•</span>
                  </>
                )}
                <span className="meta-user">By {act.userId?.name || "System"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
