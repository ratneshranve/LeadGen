import React from "react";

export const Badge = ({ status, text, children, className = "" }) => {
  const normalizedStatus = (status || text || "").toLowerCase().replace(/[^a-z]/g, "");

  let badgeClass = "badge-new";

  if (normalizedStatus.includes("new")) badgeClass = "badge-new";
  else if (normalizedStatus.includes("contact")) badgeClass = "badge-contacted";
  else if (normalizedStatus.includes("follow")) badgeClass = "badge-followup";
  else if (normalizedStatus.includes("interest")) badgeClass = "badge-interested";
  else if (normalizedStatus.includes("convert")) badgeClass = "badge-converted";
  else if (normalizedStatus.includes("lost")) badgeClass = "badge-lost";

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <span className="badge-dot" />
      {text || children || status}
    </span>
  );
};
