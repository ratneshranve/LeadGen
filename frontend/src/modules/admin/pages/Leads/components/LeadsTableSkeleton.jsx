import React from "react";

export const LeadsTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-row">
          <div className="skeleton-box skeleton-chk" />
          <div className="skeleton-box skeleton-text-lg" />
          <div className="skeleton-box skeleton-text-md" />
          <div className="skeleton-box skeleton-pill" />
          <div className="skeleton-box skeleton-pill" />
          <div className="skeleton-box skeleton-avatar" />
          <div className="skeleton-box skeleton-text-sm" />
          <div className="skeleton-box skeleton-text-sm" />
          <div className="skeleton-box skeleton-action" />
        </div>
      ))}
    </div>
  );
};
