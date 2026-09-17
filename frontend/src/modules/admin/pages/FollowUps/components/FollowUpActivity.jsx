import React from "react";
import { History, Calendar, CheckCircle2, RefreshCw } from "lucide-react";

export const FollowUpActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "completed":
        return <CheckCircle2 size={14} className="text-emerald" />;
      case "rescheduled":
        return <RefreshCw size={14} className="text-amber" />;
      default:
        return <Calendar size={14} className="text-indigo" />;
    }
  };

  return (
    <div className="crm-card followup-activity-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <History size={17} className="text-indigo" /> Recent Follow-up Activity
        </h3>
        <span className="section-subtext">Audit log of recent tasks</span>
      </div>

      <div className="activity-items-list">
        {activities && activities.length > 0 ? (
          activities.map((item) => (
            <div key={item.id} className="activity-mini-item">
              <div className="activity-icon-badge">
                {getActivityIcon(item.type)}
              </div>
              <div className="activity-details">
                <div className="activity-title-line">
                  <strong>{item.leadName}</strong> — <span className="action-text">{item.action}</span>
                </div>
                <div className="activity-sub-line">
                  <span>By {item.user}</span>
                  <span className="dot-sep">•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "20px 10px", textAlign: "center" }}>
            <p style={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
              No recent follow-up activity found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
