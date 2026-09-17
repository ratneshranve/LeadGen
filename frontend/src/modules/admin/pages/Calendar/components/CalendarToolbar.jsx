import React from "react";
import { ChevronLeft, ChevronRight, Search, Filter, Calendar as CalendarIcon } from "lucide-react";

export const CalendarToolbar = ({
  currentMonthName,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onTodayClick,
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  return (
    <div className="crm-card calendar-toolbar-card">
      <div className="toolbar-row-flex">
        {/* Month Navigation & Title */}
        <div className="month-nav-group">
          <button className="nav-arrow-btn" onClick={onPrevMonth} title="Previous Month">
            <ChevronLeft size={18} />
          </button>

          <h2 className="current-month-title">
            {currentMonthName} {currentYear}
          </h2>

          <button className="nav-arrow-btn" onClick={onNextMonth} title="Next Month">
            <ChevronRight size={18} />
          </button>

          <button className="crm-btn crm-btn-secondary crm-btn-sm today-btn" onClick={onTodayClick}>
            Today
          </button>
        </div>

        {/* View Switcher, Search & Filter Controls */}
        <div className="toolbar-controls-group">
          {/* View Switcher Pills */}
          <div className="view-switcher-group">
            <button
              className={`view-btn ${currentView === "month" ? "active" : ""}`}
              onClick={() => setCurrentView("month")}
            >
              Month
            </button>
            <button
              className={`view-btn ${currentView === "week" ? "active" : ""}`}
              onClick={() => setCurrentView("week")}
            >
              Week
            </button>
            <button
              className={`view-btn ${currentView === "day" ? "active" : ""}`}
              onClick={() => setCurrentView("day")}
            >
              Day
            </button>
          </div>

          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="crm-input search-input"
              placeholder="Search events, leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            className={`crm-btn crm-btn-secondary filter-toggle-btn ${isFilterOpen ? "active" : ""}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Toggle Filters"
          >
            <Filter size={15} /> Filters
          </button>
        </div>
      </div>
    </div>
  );
};
