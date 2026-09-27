import React, { useState } from "react";
import { Award } from "lucide-react";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";

// backend/src/modules/dashboard/dashboard.service.js:getDashboardStats teamPerformance
// gives { _id, name, email, avatarUrl, total, converted, lost, active, totalValue, conversionRate }.
// Derive a simple performance-status label from the conversion rate since the backend doesn't
// classify one.
const performanceStatus = (rate) => {
  if (rate >= 27) return "Top Performer";
  if (rate >= 20) return "Consistent";
  return "Standard";
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const TeamPerformance = ({ teamPerformance = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (person) => {
    const userPayload = {
      id: person._id,
      name: person.name,
      email: person.email,
      phone: person.phone || "",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: person.total,
    };
    setSelectedUser(userPayload);
    setIsModalOpen(true);
  };

  return (
    <div className="crm-card performance-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Sales Team Performance</h2>
          <p className="card-subtitle">Lead conversion rate and activity per sales employee</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Sales Employee</th>
              <th>Assigned</th>
              <th>Converted</th>
              <th>Active Leads</th>
              <th>Conversion Rate</th>
              <th>Performance Status</th>
            </tr>
          </thead>
          <tbody>
            {teamPerformance.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                  No assigned leads yet.
                </td>
              </tr>
            )}
            {teamPerformance.map((person) => {
              const status = performanceStatus(person.conversionRate);
              return (
              <tr
                key={person._id}
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(person)}
              >
                <td>
                  <div className="user-cell">
                    <div className="avatar-circle">{initials(person.name)}</div>
                    <div className="user-details">
                      <span className="user-name" style={{ fontWeight: 700, color: "#0f172a" }}>{person.name}</span>
                      <span className="user-role">Sales Employee</span>
                    </div>
                  </div>
                </td>
                <td className="font-semibold">{person.total}</td>
                <td className="font-semibold text-emerald">{person.converted}</td>
                <td>
                  <span className="pill-tag pill-muted">{person.active} active</span>
                </td>
                <td>
                  <div className="rate-cell">
                    <span className="rate-text">{person.conversionRate}%</span>
                    <div className="rate-bar-track">
                      <div
                        className="rate-bar-fill"
                        style={{
                          width: `${Math.min(person.conversionRate * 2.5, 100)}%`,
                          backgroundColor:
                            person.conversionRate >= 27
                              ? "#10b981"
                              : person.conversionRate >= 20
                              ? "#ff3b19"
                              : "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      status === "Top Performer"
                        ? "top-performer"
                        : status === "Consistent"
                        ? "consistent"
                        : "standard"
                    }`}
                  >
                    {status === "Top Performer" && <Award size={12} />}
                    {status}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interactive Sales Employee Profile / Edit Card Modal */}
      <ProfileEditCardModal
        isOpen={isModalOpen && selectedUser !== null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        data={selectedUser}
        type="user"
        onSave={(updatedUser) => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onDelete={(userToDelete) => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};
