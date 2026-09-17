import React from "react";
import { Plus, Phone, MessageSquare, Mail, Video, CheckSquare } from "lucide-react";

export const MonthView = ({
  events,
  onEventClick,
  onAddEventForDate,
  currentDate = new Date(2026, 8, 1),
  todayDateStr = "2026-09-01",
}) => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  // Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Previous month filler days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const mStr = prevM < 10 ? `0${prevM}` : `${prevM}`;
    const dStr = day < 10 ? `0${day}` : `${day}`;
    calendarCells.push({
      dayNumber: day,
      dateStr: `${prevY}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    const dStr = i < 10 ? `0${i}` : `${i}`;
    calendarCells.push({
      dayNumber: i,
      dateStr: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
    });
  }

  // Next month filler days to complete 35 or 42 grid cells
  const totalSoFar = calendarCells.length;
  const targetTotal = totalSoFar > 35 ? 42 : 35;
  const remainingCells = targetTotal - totalSoFar;

  for (let i = 1; i <= remainingCells; i++) {
    const nextM = (month + 2) > 12 ? 1 : (month + 2);
    const nextY = (month + 2) > 12 ? year + 1 : year;
    const mStr = nextM < 10 ? `0${nextM}` : `${nextM}`;
    const dStr = i < 10 ? `0${i}` : `${i}`;
    calendarCells.push({
      dayNumber: i,
      dateStr: `${nextY}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "Call":
        return <Phone size={11} />;
      case "WhatsApp":
        return <MessageSquare size={11} />;
      case "Email":
        return <Mail size={11} />;
      case "Meeting":
        return <Video size={11} />;
      default:
        return <CheckSquare size={11} />;
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
    <div className="month-calendar-container">
      {/* 7 Header Columns */}
      <div className="month-grid-header">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-name-cell">
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="month-grid-body">
        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateStr === todayDateStr;
          const dayEvents = events.filter((e) => {
            if (e.dateStr) return e.dateStr === cell.dateStr;
            return cell.isCurrentMonth && e.date.includes(`Sep ${cell.dayNumber}`);
          });

          return (
            <div
              key={idx}
              className={`month-day-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${isToday ? "today-cell" : ""}`}
            >
              {/* Day Header Bar */}
              <div className="day-cell-top">
                <span className={`day-number ${isToday ? "today-number" : ""}`}>
                  {cell.dayNumber}
                  {isToday && <span className="today-badge-chip">Today</span>}
                </span>
              </div>

              {/* Day Scheduled Events */}
              <div className="day-events-list">
                {dayEvents.map((evt) => {
                  const isCompleted = evt.status === "Completed";
                  const isOverdue = evt.status === "Overdue";

                  return (
                    <div
                      key={evt.id}
                      className={`calendar-event-card type-${evt.type?.toLowerCase()} ${
                        isCompleted ? "event-completed" : ""
                      } ${isOverdue ? "event-overdue" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                      }}
                      title={`${evt.type} with ${evt.leadName} (${evt.time})`}
                    >
                      <div className="event-card-top">
                        <span className="event-icon">{getTypeIcon(evt.type)}</span>
                        <span className="event-lead-name">{evt.leadName}</span>
                      </div>

                      <div className="event-card-bottom">
                        <span className="event-time-text">{evt.time}</span>
                        <span className="event-rep-initials">{getInitials(evt.assignedTo)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
