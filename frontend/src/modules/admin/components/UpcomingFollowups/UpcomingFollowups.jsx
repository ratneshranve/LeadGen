import React from "react";
import { Phone, MessageSquare, Video, Calendar, AlertTriangle } from "lucide-react";
import { upcomingFollowupsData } from "../../data/dashboardMockData";
import { Badge } from "../../../../components/ui/Badge";

export const UpcomingFollowups = () => {
  const getChannelIcon = (type) => {
    switch (type) {
      case "Call":
        return <Phone size={14} />;
      case "WhatsApp":
        return <MessageSquare size={14} />;
      case "Meeting":
      case "Demo":
        return <Video size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };

  return (
    <div className="crm-card followups-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Today's & Upcoming Follow-ups</h2>
          <p className="card-subtitle">Scheduled interactions requiring sales action</p>
        </div>
        <button className="text-link-btn">View All (45) →</button>
      </div>

      <div className="followup-list">
        {upcomingFollowupsData.map((item) => (
          <div
            key={item.id}
            className={`followup-item ${item.isOverdue ? "overdue-border" : ""}`}
          >
            <div className="followup-left">
              <div className={`channel-badge ${item.type.toLowerCase()}`}>
                {getChannelIcon(item.type)}
                <span>{item.type}</span>
              </div>

              <div className="followup-info">
                <div className="lead-name-row">
                  <span className="followup-lead-name">{item.leadName}</span>
                  {item.isOverdue && (
                    <span className="overdue-tag">
                      <AlertTriangle size={11} /> OVERDUE
                    </span>
                  )}
                </div>
                <div className="followup-sub-row">
                  <span>{item.contactPerson} ({item.phone})</span>
                  <span className="dot-sep">•</span>
                  <span>Sales Employee: <strong>{item.salesperson}</strong></span>
                </div>
              </div>
            </div>

            <div className="followup-right">
              <div className="time-badge">
                <Calendar size={13} />
                <span>{item.scheduledAt}</span>
              </div>

              <span
                className={`priority-pill ${
                  item.priority === "High" ? "p-high" : item.priority === "Medium" ? "p-medium" : "p-normal"
                }`}
              >
                {item.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
