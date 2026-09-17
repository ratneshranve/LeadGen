import React, { useState, useEffect } from "react";
import { UserCheck, User } from "lucide-react";
import { salespersonOptions } from "../../Leads/data/leadsMockData";

export const LeadAssignment = ({ formData, setFormData, errors = {} }) => {
  const [repsList, setRepsList] = useState(() => {
    const defaultReps = salespersonOptions.filter((r) => r !== "All");
    try {
      const saved = localStorage.getItem("leadflow_mock_team_users");
      if (saved) {
        const team = JSON.parse(saved);
        const names = team.map(u => u.name);
        return Array.from(new Set([...defaultReps, ...names]));
      }
    } catch (e) {}
    return defaultReps;
  });

  const getInitials = (name) => {
    if (!name) return null;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, salesperson: e.target.value }));
  };

  const initials = getInitials(formData.salesperson);

  return (
    <div className="crm-card form-section-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <UserCheck size={18} className="text-indigo" /> Assignment
        </h3>
      </div>

      <div className="section-body">
        <div className="form-group">
          <label className="form-label">
            Assigned Sales Employee <span className="text-req">*</span>
          </label>
          <div className="rep-select-container">
            <div className={`rep-avatar-preview ${!formData.salesperson ? "rep-avatar-neutral" : ""}`}>
              {initials ? initials : <User size={18} />}
            </div>
            <select
              name="salesperson"
              className={`crm-input select-input flex-1 ${errors.salesperson ? "input-error" : ""}`}
              value={formData.salesperson}
              onChange={handleChange}
            >
              <option value="">-- Select Sales Employee --</option>
              {repsList.map((rep) => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
          </div>
          {errors.salesperson ? (
            <span className="error-text">{errors.salesperson}</span>
          ) : (
            <p className="helper-text">
              Select the sales employee responsible for this lead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
