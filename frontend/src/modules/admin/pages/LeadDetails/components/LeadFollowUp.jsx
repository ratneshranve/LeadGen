import React from "react";
import { Calendar, Clock, Phone, Video, MessageSquare, Mail, Plus } from "lucide-react";

export const LeadFollowUp = ({ followup, onScheduleClick }) => {
  const getChannelIcon = (type) => {
    switch (type) {
      case "Call":
        return <Phone size={14} />;
      case "WhatsApp":
        return <MessageSquare size={14} />;
      case "Meeting":
        return <Video size={14} />;
      default:
        return <Mail size={14} />;
    }
  };

  return (
    <div className="crm-card detail-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <Calendar size={18} className="text-indigo" /> Follow-up
        </h3>
        <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={onScheduleClick}>
          <Plus size={14} /> Schedule Follow-up
        </button>
      </div>

      <div className="followup-card-body">
        {followup ? (
          <div className="active-followup-box">
            <div className="followup-top-meta">
              <span className={`channel-badge ${followup.type.toLowerCase()}`}>
                {getChannelIcon(followup.type)} {followup.type}
              </span>
              <div className="followup-time-pill">
                <Calendar size={12} /> {followup.date} at {followup.time}
              </div>
            </div>

            {followup.notes && (
              <p className="followup-notes-text">"{followup.notes}"</p>
            )}
          </div>
        ) : (
          <div className="no-followup-box">
            <Calendar size={28} className="text-subtle" />
            <p className="no-followup-text">No follow-up scheduled</p>
            <button className="crm-btn crm-btn-subtle crm-btn-sm" onClick={onScheduleClick}>
              + Add Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
