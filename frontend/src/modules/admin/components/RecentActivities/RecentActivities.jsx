import React from "react";
import {
  UserPlus,
  UserCheck,
  CheckCircle2,
  Calendar,
  RefreshCw,
  XCircle,
  Clock
} from "lucide-react";
import { recentActivitiesData } from "../../data/dashboardMockData";
import { Badge } from "../../../../components/ui/Badge";

export const RecentActivities = () => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "converted":
        return <CheckCircle2 size={16} color="#16a34a" />;
      case "followup":
        return <Calendar size={16} color="#d97706" />;
      case "new_lead":
        return <UserPlus size={16} color="#ff3b19" />;
      case "assigned":
        return <UserCheck size={16} color="#9333ea" />;
      case "status_changed":
        return <RefreshCw size={16} color="#0891b2" />;
      case "lost":
        return <XCircle size={16} color="#e11d48" />;
      default:
        return <Clock size={16} color="#64748b" />;
    }
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
        {recentActivitiesData.map((act) => (
          <div key={act.id} className="timeline-item">
            <div className="timeline-icon-box">
              {getActivityIcon(act.type)}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="activity-title">{act.title}</span>
                <span className="activity-time">{act.time}</span>
              </div>

              <p className="activity-desc">{act.description}</p>

              <div className="activity-meta">
                <span className="meta-lead">Lead: <strong>{act.leadName}</strong></span>
                <span className="meta-divider">•</span>
                <span className="meta-user">By {act.userName}</span>
                {act.badgeType && (
                  <Badge status={act.badgeType} className="meta-badge" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
