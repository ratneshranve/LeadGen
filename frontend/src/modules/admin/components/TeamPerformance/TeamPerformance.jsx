import React, { useState } from "react";
import { Award } from "lucide-react";
import { teamPerformanceData } from "../../data/dashboardMockData";
import { ProfileEditCardModal } from "../../../../components/common/ProfileEditCardModal";

export const TeamPerformance = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (person) => {
    const userPayload = {
      id: person.id || `sp-${Date.now()}`,
      name: person.name,
      email: `${person.name.toLowerCase().replace(/\s+/g, ".")}@leadflow.com`,
      phone: person.phone || "+91 98765 11111",
      role: "Sales Employee",
      status: "Active",
      assignedLeads: person.totalLeads,
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
              <th>Pending Follow-ups</th>
              <th>Conversion Rate</th>
              <th>Performance Status</th>
            </tr>
          </thead>
          <tbody>
            {teamPerformanceData.map((person) => (
              <tr
                key={person.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(person)}
              >
                <td>
                  <div className="user-cell">
                    <div className="avatar-circle">{person.avatar}</div>
                    <div className="user-details">
                      <span className="user-name" style={{ fontWeight: 700, color: "#0f172a" }}>{person.name}</span>
                      <span className="user-role">{person.role}</span>
                    </div>
                  </div>
                </td>
                <td className="font-semibold">{person.totalLeads}</td>
                <td className="font-semibold text-emerald">{person.converted}</td>
                <td>
                  <span className={`pill-tag ${person.pendingFollowups > 10 ? "pill-warning" : "pill-muted"}`}>
                    {person.pendingFollowups} pending
                  </span>
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
                      person.status === "Top Performer"
                        ? "top-performer"
                        : person.status === "Consistent"
                        ? "consistent"
                        : "standard"
                    }`}
                  >
                    {person.status === "Top Performer" && <Award size={12} />}
                    {person.status}
                  </span>
                </td>
              </tr>
            ))}
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
