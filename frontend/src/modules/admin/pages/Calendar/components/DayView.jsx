import React from "react";
import { Phone, MessageSquare, Mail, Video, CheckSquare, Clock, Building2, Plus } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const DayView = ({ events, onEventClick, onAddEventForDate, todayDateStr, dateLabel }) => {
  const currentTodayStr = todayDateStr || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const currentLabel = dateLabel || (() => {
    const d = new Date();
    const monthNamesLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${monthNamesLong[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
  })();

  const hours = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ];

  const getHourFromTimeStr = (timeStr) => {
    if (!timeStr) return -1;
    const str = timeStr.trim().toUpperCase();
    const isPM = str.includes("PM");
    const isAM = str.includes("AM");
    const clean = str.replace(/[^0-9:]/g, "");
    const parts = clean.split(":");
    let h = parseInt(parts[0], 10);
    if (isNaN(h)) return -1;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call": return <Phone size={14} />;
      case "WhatsApp": return <MessageSquare size={14} />;
      case "Email": return <Mail size={14} />;
      case "Meeting": return <Video size={14} />;
      default: return <CheckSquare size={14} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "AS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="day-view-container">
      <div className="day-view-header">
        <h3 className="day-view-title">{currentLabel} Schedule</h3>
      </div>

      <div className="day-timeline-body">
        {hours.map((hour) => {
          const slotHour = getHourFromTimeStr(hour);
          const slotEvents = events.filter((e) => {
            const matchDate = e.dateStr === currentTodayStr;
            const eventHour = getHourFromTimeStr(e.time);
            return matchDate && (eventHour === slotHour);
          });

          return (
            <div key={hour} className="day-timeline-row">
              <div className="day-hour-label">{hour}</div>
              <div className="day-slot-content">
                {slotEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`day-event-card type-${evt.type?.toLowerCase()}`}
                    onClick={() => onEventClick(evt)}
                  >
                    <div className="card-left">
                      <span className={`channel-pill-sm ${evt.type?.toLowerCase()}`}>
                        {getTypeIcon(evt.type)} {evt.type}
                      </span>
                      <div className="card-text">
                        <h4 className="card-lead-name">{evt.leadName}</h4>
                        <span className="card-company-name">
                          <Building2 size={12} /> {evt.company}
                        </span>
                      </div>
                    </div>

                    <div className="card-right">
                      <div className="time-badge">
                        <Clock size={12} /> {evt.time}
                      </div>
                      <div className="rep-badge">
                        <span className="rep-avatar-xs">{getInitials(evt.assignedTo)}</span>
                        <span>{evt.assignedTo}</span>
                      </div>
                      <Badge status={evt.leadStatus || "Follow-up"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
