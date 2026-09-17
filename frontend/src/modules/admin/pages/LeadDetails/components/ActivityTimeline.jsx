import React, { useState } from "react";
import {
  History,
  UserPlus,
  UserCheck,
  RefreshCw,
  Calendar,
  FileText,
  XCircle,
  Clock
} from "lucide-react";

export const ActivityTimeline = ({ activities }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Status Changes", "Assignments", "Follow-ups", "Notes"];

  const getActivityIcon = (type) => {
    switch (type) {
      case "created":
        return <UserPlus size={15} className="text-blue" />;
      case "assignment":
        return <UserCheck size={15} className="text-purple" />;
      case "status_change":
        return <RefreshCw size={15} className="text-teal" />;
      case "followup":
        return <Calendar size={15} className="text-amber" />;
      case "note":
        return <FileText size={15} className="text-indigo" />;
      case "lost":
        return <XCircle size={15} className="text-rose" />;
      default:
        return <Clock size={15} className="text-muted" />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Status Changes" && act.type === "status_change") return true;
    if (activeFilter === "Assignments" && act.type === "assignment") return true;
    if (activeFilter === "Follow-ups" && act.type === "followup") return true;
    if (activeFilter === "Notes" && act.type === "note") return true;
    return false;
  });

  return (
    <div className="crm-card detail-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <History size={18} className="text-indigo" /> Activity History
        </h3>

        {/* Filter Pills */}
        <div className="activity-filter-pills">
          {filters.map((f) => (
            <button
              key={f}
              className={`activity-filter-btn ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-container">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((item) => (
            <div key={item.id} className="timeline-row">
              <div className="timeline-node">
                {getActivityIcon(item.type)}
              </div>
              <div className="timeline-body-box">
                <div className="timeline-title-row">
                  <span className="timeline-action-title">{item.title}</span>
                  <span className="timeline-timestamp">{item.timestamp}</span>
                </div>
                <p className="timeline-desc">{item.description}</p>
                {item.user && (
                  <span className="timeline-user">By {item.user}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-timeline-text">No activity history for this category.</div>
        )}
      </div>
    </div>
  );
};
