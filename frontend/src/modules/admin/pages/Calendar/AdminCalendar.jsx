import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { initialLeadsData } from "../Leads/data/leadsMockData";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { CalendarFilters } from "./components/CalendarFilters";
import { MonthView } from "./components/MonthView";
import { WeekView } from "./components/WeekView";
import { DayView } from "./components/DayView";
import { TodaySummarySidebar } from "./components/TodaySummarySidebar";
import { EventDetailsModal } from "./components/EventDetailsModal";
import { ScheduleFollowUpModal } from "./components/ScheduleFollowUpModal";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";
import { CalendarSkeleton } from "./components/CalendarSkeleton";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import "./Calendar.css";

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayFormattedDateStr = () => {
  const d = new Date();
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(d.getDate()).padStart(2, "0");
  return `${monthNamesShort[d.getMonth()]} ${day}, ${d.getFullYear()}`;
};

const getTodayLongLabel = () => {
  const d = new Date();
  const monthNamesLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = String(d.getDate()).padStart(2, "0");
  return `${monthNamesLong[d.getMonth()]} ${day}, ${d.getFullYear()}`;
};

const defaultInitialEvents = [
  {
    id: "evt-1",
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    type: "Call",
    date: getTodayFormattedDateStr(),
    dateStr: getTodayDateStr(),
    time: "4:00 PM",
    assignedTo: "Amit Sharma",
    status: "Pending",
    leadStatus: "New",
    notes: "Product requirement call & pricing options discussion.",
    reminder: "15 minutes before",
  },
  {
    id: "evt-2",
    leadId: "LD-1004",
    leadName: "Suresh Patel",
    company: "Patel Chemicals & Solvents",
    type: "Call",
    date: getTodayFormattedDateStr(),
    dateStr: getTodayDateStr(),
    time: "2:30 PM",
    assignedTo: "Amit Sharma",
    status: "Pending",
    leadStatus: "Contacted",
    notes: "Pricing negotiation and final timeline discussion.",
    reminder: "30 minutes before",
  },
  {
    id: "evt-3",
    leadId: "LD-1002",
    leadName: "Priya Verma",
    company: "Apex Logistics LLP",
    type: "Meeting",
    date: "Sep 04, 2026",
    dateStr: "2026-09-04",
    time: "11:30 AM",
    assignedTo: "Neha Verma",
    status: "Pending",
    leadStatus: "Contacted",
    notes: "In-person product demonstration and team pitch.",
    reminder: "1 hour before",
  },
  {
    id: "evt-4",
    leadId: "LD-1003",
    leadName: "Amit Mehta",
    company: "Mehta Auto Corp",
    type: "WhatsApp",
    date: "Sep 04, 2026",
    dateStr: "2026-09-04",
    time: "10:00 AM",
    assignedTo: "Rahul Mehta",
    status: "Pending",
    leadStatus: "Follow-up",
    notes: "Send updated machinery catalog and quotation PDF.",
    reminder: "15 minutes before",
  },
  {
    id: "evt-5",
    leadId: "LD-1004",
    leadName: "Suresh Patel",
    company: "Patel Chemicals & Solvents",
    type: "Call",
    date: "Sep 05, 2026",
    dateStr: "2026-09-05",
    time: "2:30 PM",
    assignedTo: "Amit Sharma",
    status: "Pending",
    leadStatus: "Follow-up",
    notes: "Follow up call regarding contract agreement terms.",
    reminder: "30 minutes before",
  },
  {
    id: "evt-6",
    leadId: "LD-1010",
    leadName: "Neha Singh",
    company: "Singh Tech Solutions",
    type: "Meeting",
    date: "Sep 06, 2026",
    dateStr: "2026-09-06",
    time: "3:00 PM",
    assignedTo: "Priya Singh",
    status: "Pending",
    leadStatus: "Interested",
    notes: "Technical architecture evaluation meeting.",
    reminder: "1 hour before",
  },
  {
    id: "evt-7",
    leadId: "LD-1012",
    leadName: "Pooja Sharma",
    company: "Sharma Global Retail",
    type: "Call",
    date: "Sep 07, 2026",
    dateStr: "2026-09-07",
    time: "12:00 PM",
    assignedTo: "Priya Singh",
    status: "Pending",
    leadStatus: "Contacted",
    notes: "Initial discovery call on product features.",
    reminder: "None",
  },
  {
    id: "evt-8",
    leadId: "LD-1001",
    leadName: "Rahul Sharma",
    company: "Rahul Traders",
    type: "Meeting",
    date: "Sep 08, 2026",
    dateStr: "2026-09-08",
    time: "11:00 AM",
    assignedTo: "Amit Sharma",
    status: "Pending",
    leadStatus: "New",
    notes: "Executive presentation at client office.",
    reminder: "1 day before",
  },
  {
    id: "evt-9",
    leadId: "LD-1015",
    leadName: "Vikram Aditya",
    company: "Aditya Heavy Machinery",
    type: "Call",
    date: "Aug 28, 2026",
    dateStr: "2026-08-28",
    time: "3:00 PM",
    assignedTo: "Rahul Mehta",
    status: "Overdue",
    leadStatus: "Lost",
    notes: "Follow up on budget approval from finance team.",
    reminder: "15 minutes before",
  },
  {
    id: "evt-10",
    leadId: "LD-1005",
    leadName: "Deepa Nair",
    company: "Greenfield Organics",
    type: "Meeting",
    date: "Aug 31, 2026",
    dateStr: "2026-08-31",
    time: "4:20 PM",
    assignedTo: "Neha Verma",
    status: "Completed",
    leadStatus: "Follow-up",
    notes: "Consultation call completed cleanly.",
    reminder: "None",
  },
];

export const AdminCalendar = ({ salespersonName }) => {
  // Calendar Events State initialized with LocalStorage Persistence
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_stored_calendar_events");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const todayStr = getTodayDateStr();
          const todayFmt = getTodayFormattedDateStr();
          return parsed.map((evt) => {
            if ((evt.id === "evt-1" || evt.id === "evt-2") && (evt.dateStr === "2026-09-01" || evt.dateStr === "2026-09-02")) {
              return { ...evt, date: todayFmt, dateStr: todayStr };
            }
            return evt;
          });
        }
      }
    } catch (e) {}
    return defaultInitialEvents;
  });

  // Persist Events to LocalStorage on Change
  useEffect(() => {
    try {
      localStorage.setItem("leadflow_stored_calendar_events", JSON.stringify(events));
    } catch (e) {}
  }, [events]);

  // Calendar State & Dynamic Month Navigation
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const [currentDate, setCurrentDate] = useState(new Date()); // Dynamic current system date

  const [currentView, setCurrentView] = useState("month"); // "month" | "week" | "day"
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLeadStatus, setSelectedLeadStatus] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // Modals & Active Event States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Lead Card Modal State
  const [selectedLeadForCard, setSelectedLeadForCard] = useState(null);
  const [isLeadCardOpen, setIsLeadCardOpen] = useState(false);

  const [preSelectedDate, setPreSelectedDate] = useState(getTodayDateStr());
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setPreSelectedDate(getTodayDateStr());
  };

  const handleSelectMonth = (m) => {
    setSelectedMonth(m);
    if (m !== "All") {
      const idx = monthNames.indexOf(m);
      if (idx !== -1) {
        setCurrentDate(new Date(currentDate.getFullYear(), idx, 1));
      }
    }
  };

  // Filtered Events Calculation
  const filteredEvents = events.filter((evt) => {
    // Salesperson strict scoping
    if (salespersonName && evt.assignedTo !== salespersonName) return false;

    // Search filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchLead = evt.leadName.toLowerCase().includes(query);
      const matchCompany = evt.company ? evt.company.toLowerCase().includes(query) : false;
      const matchNotes = evt.notes ? evt.notes.toLowerCase().includes(query) : false;
      if (!matchLead && !matchCompany && !matchNotes) return false;
    }

    // Assigned To filter
    if (selectedAssignee !== "All" && evt.assignedTo !== selectedAssignee) return false;

    // Type filter
    if (selectedType !== "All" && evt.type !== selectedType) return false;

    // Status filter
    if (selectedStatus !== "All" && evt.status !== selectedStatus) return false;

    // Lead Status filter
    if (selectedLeadStatus !== "All" && evt.leadStatus !== selectedLeadStatus) return false;

    // Month filter
    if (selectedMonth !== "All") {
      const monthPrefix = selectedMonth.substring(0, 3).toLowerCase();
      if (!evt.date.toLowerCase().includes(monthPrefix)) return false;
    }

    // Exact Date filter
    if (selectedDateFilter) {
      if (evt.dateStr !== selectedDateFilter) return false;
    }

    return true;
  });

  // Action: Click Event Card
  const handleEventClick = (evt) => {
    setSelectedEvent(evt);
    setIsDetailsModalOpen(true);
  };

  // Action: View Specific Lead Details Modal
  const handleViewLeadDetails = (evt) => {
    const foundLead = initialLeadsData.find(
      (l) => l.id === evt.leadId || l.name?.toLowerCase() === evt.leadName?.toLowerCase()
    );

    const leadObject = foundLead || {
      id: evt.leadId || "LD-1001",
      name: evt.leadName || "Lead Contact",
      company: evt.company || "",
      email: `${(evt.leadName || "lead").toLowerCase().replace(/\s+/g, ".")}@company.com`,
      phone: evt.phone || "+91 98765 43210",
      status: evt.leadStatus || "Follow-up",
      source: "Website",
      salesperson: evt.assignedTo || salespersonName || "Amit Sharma",
    };

    setSelectedLeadForCard(leadObject);
    setIsLeadCardOpen(true);
  };

  // Action: Add Event for Date (Day cell click)
  const handleAddEventForDate = (dateStr) => {
    setPreSelectedDate(dateStr);
    setIsScheduleModalOpen(true);
  };

  // Action: Confirm Schedule New Follow-up
  const handleConfirmSchedule = (formData) => {
    const formattedDateStr = formData.date;
    const dateObj = new Date(formData.date);
    const monthName = monthNames[dateObj.getMonth()] ? monthNames[dateObj.getMonth()].substring(0, 3) : "Sep";
    const dayNum = dateObj.getDate() || 2;
    const formattedDate = `${monthName} ${dayNum < 10 ? "0" + dayNum : dayNum}, 2026`;

    // Format time for display (e.g. 14:30 -> 2:30 PM)
    let displayTime = formData.time || "2:30 PM";
    if (displayTime.includes(":")) {
      const [hStr, mStr] = displayTime.split(":");
      let h = parseInt(hStr, 10);
      if (!isNaN(h)) {
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        displayTime = `${h}:${mStr} ${ampm}`;
      }
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      leadId: formData.leadId,
      leadName: formData.leadName,
      company: formData.company,
      type: formData.type,
      date: formattedDate,
      dateStr: formattedDateStr,
      time: displayTime,
      assignedTo: formData.assignedTo || salespersonName || "Amit Sharma",
      status: "Pending",
      leadStatus: formData.leadStatus || "Follow-up",
      notes: formData.notes || "Scheduled activity.",
      reminder: formData.reminder,
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    try {
      localStorage.setItem("leadflow_stored_calendar_events", JSON.stringify(updated));
    } catch (e) {}

    setToastMessage(`Follow-up scheduled with ${formData.leadName}`);
    setIsToastOpen(true);
  };

  // Action: Mark Event Completed
  const handleMarkCompleted = (eventId) => {
    const updated = events.map((e) => (e.id === eventId ? { ...e, status: "Completed" } : e));
    setEvents(updated);
    try {
      localStorage.setItem("leadflow_stored_calendar_events", JSON.stringify(updated));
    } catch (e) {}
    setToastMessage("Activity marked as completed");
    setIsToastOpen(true);
  };

  // Action: Confirm Edit Event
  const handleConfirmEdit = (updatedData) => {
    const updated = events.map((e) => (e.id === updatedData.id ? { ...e, ...updatedData } : e));
    setEvents(updated);
    try {
      localStorage.setItem("leadflow_stored_calendar_events", JSON.stringify(updated));
    } catch (e) {}
    setToastMessage("Activity details updated");
    setIsToastOpen(true);
    setIsDetailsModalOpen(false);
  };

  // Action: Delete Event
  const handleDeleteEvent = (eventId) => {
    const updated = events.filter((e) => e.id !== eventId);
    setEvents(updated);
    try {
      localStorage.setItem("leadflow_stored_calendar_events", JSON.stringify(updated));
    } catch (e) {}
    setToastMessage("Activity deleted");
    setIsToastOpen(true);
    setIsDetailsModalOpen(false);
  };

  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className="calendar-page">
      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* Modals */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onMarkCompleted={handleMarkCompleted}
        onEdit={handleConfirmEdit}
        onDelete={handleDeleteEvent}
        onViewLead={handleViewLeadDetails}
      />

      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        leadsList={initialLeadsData}
        initialDate={preSelectedDate}
        onConfirm={handleConfirmSchedule}
      />

      <ProfileEditCardModal
        isOpen={isLeadCardOpen}
        onClose={() => setIsLeadCardOpen(false)}
        data={selectedLeadForCard}
        type="lead"
      />

      {/* Page Header Banner */}
      <div className="calendar-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", width: "100%" }}>
        <div className="header-text-container">
          <p className="page-desc" style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Schedule and manage your team's follow-ups, calls and meetings.
          </p>
        </div>
      </div>

      {/* Main Calendar Toolbar Card */}
      <CalendarToolbar
        currentMonthName={currentMonthName}
        currentYear={currentYear}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onTodayClick={handleTodayClick}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      {/* Expandable Filter Card */}
      {isFilterOpen && (
        <CalendarFilters
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedMonth={selectedMonth}
          setSelectedMonth={handleSelectMonth}
          selectedDateFilter={selectedDateFilter}
          setSelectedDateFilter={setSelectedDateFilter}
          salespersonName={salespersonName}
          onResetFilters={() => {
            setSelectedAssignee("All");
            setSelectedType("All");
            setSelectedMonth("All");
            setSelectedDateFilter("");
          }}
        />
      )}

      {/* Main Calendar Workspace Layout */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : hasError ? (
        <div className="crm-card calendar-error-state">
          <AlertCircle size={32} className="text-rose" />
          <h3>Unable to load calendar</h3>
          <p>Please check your connection and try again.</p>
          <button className="crm-btn crm-btn-secondary" onClick={() => setHasError(false)}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <div className="calendar-workspace-grid">
          {/* Main Calendar Views (Month / Week / Day) */}
          <div className="main-view-container">
            {currentView === "month" && (
              <MonthView
                events={filteredEvents}
                currentDate={currentDate}
                todayDateStr={getTodayDateStr()}
                onEventClick={handleEventClick}
                onAddEventForDate={handleAddEventForDate}
              />
            )}

            {currentView === "week" && (
              <WeekView
                events={filteredEvents}
                currentDate={currentDate}
                todayDateStr={getTodayDateStr()}
                onEventClick={handleEventClick}
                onAddEventForDate={handleAddEventForDate}
              />
            )}

            {currentView === "day" && (
              <DayView
                events={filteredEvents}
                todayDateStr={getTodayDateStr()}
                dateLabel={getTodayLongLabel()}
                onEventClick={handleEventClick}
                onAddEventForDate={handleAddEventForDate}
              />
            )}
          </div>

          {/* Today's Schedule & Upcoming Sidebar */}
          <TodaySummarySidebar
            events={filteredEvents}
            todayDateStr={getTodayDateStr()}
            onEventClick={handleEventClick}
            onScheduleClick={() => setIsScheduleModalOpen(true)}
            salespersonName={salespersonName}
          />
        </div>
      )}
    </div>
  );
};
