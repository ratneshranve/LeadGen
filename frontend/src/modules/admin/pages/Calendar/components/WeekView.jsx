import React from "react";
import { Phone, MessageSquare, Mail, Video, CheckSquare } from "lucide-react";

export const WeekView = ({ events, onEventClick, onAddEventForDate, currentDate, todayDateStr }) => {
  const baseDate = currentDate || new Date();
  const dayOfWeek = (baseDate.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - dayOfWeek);

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNamesShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const currentTodayStr = todayDateStr || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${dayNum}`;
    const label = `${monthNamesShort[d.getMonth()]} ${dayNum}`;
    return {
      dayName: dayNamesShort[i],
      dateStr,
      label,
      isToday: dateStr === currentTodayStr,
    };
  });

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
      case "Call": return <Phone size={12} />;
      case "WhatsApp": return <MessageSquare size={12} />;
      case "Email": return <Mail size={12} />;
      case "Meeting": return <Video size={12} />;
      default: return <CheckSquare size={12} />;
    }
  };

  return (
    <div className="week-view-container">
      {/* 7 Header Columns */}
      <div className="week-header-row">
        <div className="time-col-header">Time</div>
        {weekDays.map((day) => (
          <div key={day.dateStr} className={`week-day-header ${day.isToday ? "today-header" : ""}`}>
            <span className="week-day-name">{day.dayName}</span>
            <span className="week-day-date">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Hourly Grid Track */}
      <div className="week-grid-body">
        {hours.map((hour) => {
          const slotHour = getHourFromTimeStr(hour);

          return (
            <div key={hour} className="week-time-row">
              <div className="time-slot-label">{hour}</div>
              {weekDays.map((day) => {
                const matchingEvents = events.filter((e) => {
                  const matchDate = e.dateStr === day.dateStr || e.date.includes(day.label);
                  const eventHour = getHourFromTimeStr(e.time);
                  return matchDate && (eventHour === slotHour);
                });

                return (
                  <div
                    key={day.dateStr}
                    className="week-slot-cell"
                  >
                    {matchingEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className={`week-event-chip type-${evt.type?.toLowerCase()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(evt);
                        }}
                      >
                        {getTypeIcon(evt.type)} <span>{evt.leadName}</span> ({evt.time})
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
