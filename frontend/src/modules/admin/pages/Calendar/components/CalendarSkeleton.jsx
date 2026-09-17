import React from "react";

export const CalendarSkeleton = () => {
  return (
    <div className="calendar-skeleton-wrapper">
      <div className="skeleton-toolbar" />
      <div className="skeleton-grid">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="skeleton-cell" />
        ))}
      </div>
    </div>
  );
};
