import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Phone,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import "./SalesPages.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const SalesCalendar = () => {
  const { user } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  // Current calendar view month & year (Default: Sep 2026 matching mock data)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 3)); // 3 Sep 2026
  const [selectedDateStr, setSelectedDateStr] = useState("2026-09-03");
  const [searchTerm, setSearchTerm] = useState("");

  // Follow-ups dataset (scoped to sales representative)
  const [events, setEvents] = useState([
    {
      id: "evt-1",
      leadId: "LD-1001",
      leadName: "Rahul Sharma",
      company: "Rahul Traders",
      type: "Call",
      dateStr: "2026-09-03",
      time: "4:00 PM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Product requirement call & pricing options discussion.",
      phone: "+91 98765 43210",
    },
    {
      id: "evt-2",
      leadId: "LD-1004",
      leadName: "Suresh Patel",
      company: "Patel Chemicals & Solvents",
      type: "Call",
      dateStr: "2026-09-03",
      time: "2:30 PM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Pricing negotiation and final timeline discussion.",
      phone: "+91 98765 11111",
    },
    {
      id: "evt-3",
      leadId: "LD-1002",
      leadName: "Priya Verma",
      company: "Apex Logistics LLP",
      type: "Meeting",
      dateStr: "2026-09-04",
      time: "11:30 AM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "In-person product demonstration and team pitch.",
      phone: "+91 98765 22222",
    },
    {
      id: "evt-4",
      leadId: "LD-1003",
      leadName: "Amit Mehta",
      company: "Mehta Auto Corp",
      type: "WhatsApp",
      dateStr: "2026-09-04",
      time: "10:00 AM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Send updated machinery catalog and quotation PDF.",
      phone: "+91 98765 33333",
    },
    {
      id: "evt-5",
      leadId: "LD-1005",
      leadName: "Vikram Aditya",
      company: "Aditya Machinery",
      type: "Call",
      dateStr: "2026-09-08",
      time: "11:00 AM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Review commercial proposal and financing terms.",
      phone: "+91 98765 44444",
    },
    {
      id: "evt-6",
      leadId: "LD-1006",
      leadName: "Anand Verma",
      company: "Verma Technologies",
      type: "Meeting",
      dateStr: "2026-09-10",
      time: "3:30 PM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Quarterly contract renewal discussion.",
      phone: "+91 98765 55555",
    },
    {
      id: "evt-7",
      leadId: "LD-1007",
      leadName: "Sunil Kapoor",
      company: "Kapoor Textiles",
      type: "WhatsApp",
      dateStr: "2026-09-12",
      time: "1:00 PM",
      assignedTo: currentSalesperson,
      status: "Pending",
      notes: "Follow up on sample delivery feedback.",
      phone: "+91 98765 66666",
    },
  ]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation (No today button)
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar Days calculation for the current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0, Sun = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Preceding month padding days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDateObj = new Date(year, month - 1, d);
      const dateStr = `${prevDateObj.getFullYear()}-${String(prevDateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ dayNumber: d, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ dayNumber: d, isCurrentMonth: true, dateStr });
    }

    // Remaining trailing padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDateObj = new Date(year, month + 1, d);
      const dateStr = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ dayNumber: d, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [year, month]);

  // Toggle status between Pending and Completed
  const handleToggleStatus = (id) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, status: evt.status === "Completed" ? "Pending" : "Completed" } : evt
      )
    );
  };

  // Filter follow-up events by selected date and search keywords
  const displayEvents = useMemo(() => {
    return events.filter((evt) => {
      // Date filter
      if (selectedDateStr && evt.dateStr !== selectedDateStr) {
        return false;
      }
      // Keyword search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = evt.leadName?.toLowerCase().includes(q);
        const matchCompany = evt.company?.toLowerCase().includes(q);
        const matchNotes = evt.notes?.toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchNotes) return false;
      }
      return true;
    });
  }, [events, selectedDateStr, searchTerm]);

  // Event count per day for calendar indicators
  const eventCountsByDate = useMemo(() => {
    const map = {};
    events.forEach((evt) => {
      map[evt.dateStr] = (map[evt.dateStr] || 0) + 1;
    });
    return map;
  }, [events]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return "All Dates";
    try {
      const [y, m, d] = selectedDateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <div className="sales-page-container">
      {/* 1. Header with Month Navigator & Full-Width Client/Lead Search */}
      <div style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1.5px solid #fed7aa", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)" }} className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top: Month Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-white border border-[#fed7aa] text-slate-800 hover:bg-[#ff3b19] hover:border-[#ff3b19] hover:text-white transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 select-none">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-white border border-[#fed7aa] text-slate-800 hover:bg-[#ff3b19] hover:border-[#ff3b19] hover:text-white transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            Follow-up Calendar
          </span>
        </div>

        {/* Client/Lead Search Field (Proper Width, No Date Picker, No Show All) */}
        <div className="pt-2 border-t border-[#fed7aa]">
          <div className="sales-calendar-search-box relative w-full flex items-center">
            <Search size={16} className="sales-calendar-search-icon" color="#ff3b19" />
            <input
              type="text"
              placeholder="Search client or lead name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sales-calendar-search-input"
              style={{
                paddingLeft: "44px",
                paddingRight: searchTerm ? "38px" : "16px",
                backgroundColor: "#ffffff",
                border: "1.5px solid #fed7aa",
                color: "#0f172a",
                fontWeight: 600
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="sales-calendar-search-clear"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. Interactive Calendar Grid (Short, compact, client-friendly) */}
        <div className="pt-2">
          {/* Days of week header (Short 3-letter labels, no overlapping!) */}
          <div style={{ background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", padding: "8px", borderRadius: "10px", border: "1.5px solid #fdba74" }} className="grid grid-cols-7 text-center mb-2">
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ color: "#0f172a" }} className="text-[11px] sm:text-xs font-extrabold">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {calendarDays.map((cd, idx) => {
              const isSelected = selectedDateStr === cd.dateStr;
              const hasEvents = (eventCountsByDate[cd.dateStr] || 0) > 0;
              const count = eventCountsByDate[cd.dateStr] || 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cd.dateStr)}
                  className={`relative flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl transition-all cursor-pointer min-h-[42px] sm:min-h-[50px] ${
                    isSelected
                      ? "bg-[#ff3b19] text-white font-black shadow-md shadow-[#ff3b19]/25"
                      : cd.isCurrentMonth
                      ? "bg-[#fff7ed] text-slate-900 border border-[#fed7aa] font-extrabold hover:bg-[#ffedd5]"
                      : "bg-[#fffaf5]/70 text-slate-400 border border-[#fed7aa]/50 hover:bg-[#fff7ed]"
                  }`}
                >
                  <span className="text-xs sm:text-sm">{cd.dayNumber}</span>

                  {/* Task Indicator Dot / Badge */}
                  {hasEvents && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#ff3b19]"
                        }`}
                      />
                      {count > 1 && (
                        <span
                          className={`text-[9px] font-extrabold leading-none ${
                            isSelected ? "text-orange-100" : "text-[#ff3b19]"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Follow-up Event Cards Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-[#ff3b19]" />
            Follow-ups on {formattedSelectedDate}
          </h3>
          <span className="text-xs font-bold text-[#ff3b19] bg-[#fff1ee] border border-[#ffd2c7] px-2.5 py-0.5 rounded-full">
            {displayEvents.length} scheduled
          </span>
        </div>

        {displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                  border: "1.5px solid #fed7aa",
                  borderLeft: "4px solid #ff3b19",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)"
                }}
                className="rounded-xl p-3.5 flex flex-col gap-2.5 transition-all"
              >
                {/* Header: Lead Name & Type */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        evt.type === "Call"
                          ? "bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]"
                          : evt.type === "WhatsApp"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-purple-50 text-purple-600 border border-purple-200"
                      }`}
                    >
                      {evt.type === "Call" ? (
                        <Phone size={14} />
                      ) : evt.type === "WhatsApp" ? (
                        <MessageSquare size={14} />
                      ) : (
                        <Users size={14} />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {evt.leadName}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {evt.company}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#fed7aa] text-slate-800 shrink-0">
                    {evt.time}
                  </span>
                </div>

                {/* Notes */}
                {evt.notes && (
                  <p style={{ background: "#ffffff", border: "1px solid #fed7aa", color: "#0f172a", fontWeight: 600 }} className="text-xs rounded-lg p-2 leading-relaxed italic">
                    "{evt.notes}"
                  </p>
                )}

                {/* Bottom Actions: Quick Call, WhatsApp & Status Toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-[#ece7dc]">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${evt.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#ea580c] bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] transition-all text-decoration-none"
                    >
                      <Phone size={11} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${evt.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all text-decoration-none"
                    >
                      <MessageSquare size={11} /> WhatsApp
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(evt.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      evt.status === "Completed"
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-amber-700 bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <CheckCircle2 size={12} /> {evt.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <AlertCircle size={28} className="text-slate-300" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              No follow-ups scheduled for {formattedSelectedDate}
            </p>
            <p className="text-xs text-slate-400">
              Select another date in the calendar above to view agenda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
