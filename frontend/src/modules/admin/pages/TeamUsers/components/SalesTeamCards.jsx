import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MoreVertical, Eye, Edit3, UserX, AlertTriangle, CheckCircle2 } from "lucide-react";

export const SalesTeamCards = ({ salesReps, onOpenEdit, onOpenDeactivate }) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "AS";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="crm-card sales-team-overview-card">
      <div className="card-header-flex">
        <div>
          <h3 className="section-title">
            <Users size={18} className="text-indigo" /> Sales Team
          </h3>
          <span className="section-subtext">Monitor your team's availability and workload.</span>
        </div>
      </div>

      <div className="sales-reps-cards-grid">
        {salesReps.map((rep) => {
          const capacity = rep.maxCapacity || 50;
          const assigned = rep.assignedLeads || 0;
          const workloadPct = Math.round((assigned / capacity) * 100);
          const isNearCapacity = workloadPct >= 90;

          return (
            <div key={rep.id} className={`salesperson-workload-card ${isNearCapacity ? "near-capacity-card" : ""}`}>
              {/* Card Top: Avatar, Name & 3-dot Menu */}
              <div className="card-top-header">
                <div className="rep-identity-flex">
                  <div className="rep-avatar-md">{getInitials(rep.name)}</div>
                  <div className="rep-names">
                    <h4 className="rep-fullname">{rep.name}</h4>
                    <span className="rep-role-tag">{rep.role}</span>
                  </div>
                </div>

                <div className="dropdown-wrapper" ref={openMenuId === rep.id ? menuRef : null}>
                  <button
                    className="action-menu-btn"
                    onClick={() => setOpenMenuId(openMenuId === rep.id ? null : rep.id)}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === rep.id && (
                    <div className="table-dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/admin/team-users/${rep.id}`);
                        }}
                      >
                        <Eye size={14} /> View Profile
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenEdit(rep);
                        }}
                      >
                        <Edit3 size={14} /> Edit User
                      </button>
                      <div className="dropdown-divider" />
                      <button
                        className="dropdown-item text-rose"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenDeactivate(rep);
                        }}
                      >
                        <UserX size={14} /> Deactivate
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ marginTop: "8px" }}>
                <span className={`status-badge-chip ${rep.status === "Active" ? "status-active" : "status-inactive"}`}>
                  <span className="status-dot" /> {rep.status}
                </span>
              </div>

              {/* Metrics 4-Column Grid */}
              <div className="rep-metrics-grid">
                <div className="metric-box">
                  <span className="m-val">{rep.assignedLeads || 0}</span>
                  <span className="m-lbl">Assigned</span>
                </div>
                <div className="metric-box">
                  <span className="m-val text-indigo">{rep.activeLeads || 0}</span>
                  <span className="m-lbl">Active</span>
                </div>
                <div className="metric-box">
                  <span className="m-val text-amber">{rep.followups || 0}</span>
                  <span className="m-lbl">Follow-ups</span>
                </div>
                <div className="metric-box">
                  <span className="m-val text-emerald">{rep.converted || 0}</span>
                  <span className="m-lbl">Converted</span>
                </div>
              </div>

              {/* Workload Progress Bar & Warning */}
              <div className="workload-progress-group">
                <div className="progress-labels">
                  <span className="lbl-text">Workload: {workloadPct}%</span>
                  <span className="count-text">({assigned}/{capacity})</span>
                </div>

                <div className="workload-bar-track">
                  <div
                    className={`workload-bar-fill ${isNearCapacity ? "bar-warning" : "bar-normal"}`}
                    style={{ width: `${Math.min(workloadPct, 100)}%` }}
                  />
                </div>

                {isNearCapacity && (
                  <div className="capacity-warning-badge">
                    <AlertTriangle size={12} /> Near capacity
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                className="crm-btn crm-btn-secondary crm-btn-sm btn-view-profile"
                onClick={() => navigate(`/admin/team-users/${rep.id}`)}
              >
                View Profile
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
