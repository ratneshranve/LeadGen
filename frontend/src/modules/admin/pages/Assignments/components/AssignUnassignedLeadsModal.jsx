import React, { useState, useEffect } from "react";
import { UserCheck, Search, UserX, CheckSquare, Square, Users } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { Badge } from "../../../../../components/ui/Badge";

// salespeople: real backend list [{ _id, name }]. Emits the selected user's _id.
export const AssignUnassignedLeadsModal = ({
  isOpen,
  onClose,
  allLeads = [],
  unassignedLeads = [],
  onConfirmAssign,
  salespeople = [],
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRep, setSelectedRep] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All | Unassigned | Assigned
  const [error, setError] = useState("");

  const salesReps = salespeople;

  // All leads dataset (fallback to unassignedLeads if allLeads empty)
  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : unassignedLeads;

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectedRep("");
      setSearchQuery("");
      setActiveFilter("All");
      setError("");
    }
  }, [isOpen]);

  const unassignedCount = leadsPool.filter(
    (l) => !l.salesperson || l.salesperson.toLowerCase() === "unassigned"
  ).length;
  const assignedCount = leadsPool.length - unassignedCount;

  // Filtered Leads
  const filteredLeads = leadsPool.filter((l) => {
    // Tab filter
    const isUnassigned = !l.salesperson || l.salesperson.toLowerCase() === "unassigned";
    if (activeFilter === "Unassigned" && !isUnassigned) return false;
    if (activeFilter === "Assigned" && isUnassigned) return false;

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q)) ||
      (l.salesperson && l.salesperson.toLowerCase().includes(q))
    );
  });

  const isAllFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedIds.includes(l.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIds = filteredLeads.map((l) => l.id);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredLeads.map((l) => l.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSingle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError("Please select at least one lead.");
      return;
    }
    if (!selectedRep) {
      setError("Please select a target sales employee.");
      return;
    }
    setError("");
    onConfirmAssign(selectedIds, selectedRep);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Leads" maxWidth="820px">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header Summary Banner */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#FFF7ED",
              border: "1px solid #FED7AA",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#9A3412", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={16} /> Total Leads: {leadsPool.length} ({unassignedCount} Unassigned, {assignedCount} Assigned)
              </span>
              <span style={{ fontSize: "0.75rem", color: "#C2410C" }}>
                Select leads (both unassigned and assigned) to assign or reassign to a sales employee.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9A3412" }}>
                Selected: {selectedIds.length} / {leadsPool.length}
              </span>
            </div>
          </div>

          {/* Filter Pills & Search Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            {/* Quick Filter Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {[
                { key: "All", label: `All (${leadsPool.length})` },
                { key: "Unassigned", label: `Unassigned (${unassignedCount})` },
                { key: "Assigned", label: `Assigned (${assignedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "0.775rem",
                    fontWeight: 700,
                    border: activeFilter === tab.key ? "1px solid #ff3b19" : "1px solid #ece7dc",
                    background: activeFilter === tab.key ? "#ff3b19" : "#ffffff",
                    color: activeFilter === tab.key ? "#ffffff" : "#71717a",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Select All CTA */}
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={handleToggleSelectAll}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.775rem", fontWeight: 700 }}
            >
              {isAllFilteredSelected ? <CheckSquare size={14} color="#ff3b19" /> : <Square size={14} />}
              {isAllFilteredSelected ? "Deselect Filtered" : "Select Filtered"}
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              className="crm-input"
              style={{ paddingLeft: "36px", height: "38px", fontSize: "0.825rem" }}
              placeholder="Search leads by name, company, assignee, source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Leads List Table */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          >
            <table className="crm-table" style={{ margin: 0 }}>
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1, borderBottom: "1px solid #cbd5e1" }}>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="crm-checkbox"
                    />
                  </th>
                  <th>LEAD DETAILS</th>
                  <th>ASSIGNMENT STATUS</th>
                  <th>SOURCE</th>
                  <th>LEAD STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const isChecked = selectedIds.includes(lead.id);
                    const isAssigned = lead.salesperson && lead.salesperson.toLowerCase() !== "unassigned";

                    return (
                      <tr
                        key={lead.id}
                        style={{
                          backgroundColor: isChecked ? "#f0fdf4" : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => handleToggleSingle(lead.id)}
                      >
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSingle(lead.id)}
                            className="crm-checkbox"
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.825rem" }}>
                              {lead.name}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "0.725rem" }}>
                              {lead.company || "Direct Client"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {isAssigned ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              <UserCheck size={12} /> Assigned to {lead.salesperson}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#fffbeb",
                                color: "#d97706",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                border: "1px solid #fde68a",
                              }}
                            >
                              <UserX size={12} /> Unassigned
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="source-tag">{lead.source || "Website"}</span>
                        </td>
                        <td>
                          <Badge status={lead.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.85rem" }}>
                      No leads match your filter or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Target Sales Employee Dropdown */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.825rem", color: "#0f172a" }}>
              Assign Selected ({selectedIds.length}) Leads to Sales Employee <span className="text-req">*</span>
            </label>
            <select
              className={`crm-input select-input ${error ? "input-error" : ""}`}
              style={{ height: "40px", fontSize: "0.85rem", fontWeight: 600 }}
              value={selectedRep}
              onChange={(e) => {
                setSelectedRep(e.target.value);
                if (e.target.value) setError("");
              }}
            >
              <option value="">-- Select Sales Employee --</option>
              {salesReps.map((rep) => (
                <option key={rep._id} value={rep._id}>{rep.name}</option>
              ))}
            </select>
            {error && <span className="error-text" style={{ color: "#dc2626", fontSize: "0.775rem", fontWeight: 600 }}>{error}</span>}
          </div>

          {/* Modal Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700 }}
            >
              <UserCheck size={16} /> Assign {selectedIds.length} Lead{selectedIds.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
