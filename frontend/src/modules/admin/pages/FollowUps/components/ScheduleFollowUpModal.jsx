import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Users,
  CheckSquare,
  ChevronDown,
  User,
  Check
} from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { useAuth } from "../../../../../context/AuthContext";
import { getStoredLeads } from "../../Leads/data/leadsMockData";

export const ScheduleFollowUpModal = ({ isOpen, onClose, leadsList = [], onConfirm }) => {
  const { user, isAdmin } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  // Filter ONLY assigned leads:
  // For sales employees (!isAdmin), strictly filter to ONLY their own assigned leads!
  const assignedLeads = useMemo(() => {
    const list = leadsList && leadsList.length > 0 ? leadsList : getStoredLeads();
    return list.filter((l) => {
      const rep = l.salesperson || l.assignedTo || "Unassigned";
      if (!rep || rep === "Unassigned") return false;
      if (!isAdmin) {
        return rep.trim().toLowerCase() === currentSalesperson.trim().toLowerCase();
      }
      return true;
    });
  }, [leadsList, isAdmin, currentSalesperson]);

  const defaultLead = assignedLeads[0] || null;
  const defaultRep = !isAdmin ? currentSalesperson : (defaultLead?.salesperson || defaultLead?.assignedTo || "");

  const [formData, setFormData] = useState({
    leadId: defaultLead?.id || "",
    assignedTo: defaultRep,
    type: "Call",
    date: new Date().toISOString().split("T")[0],
    time: "15:00",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const leadDropdownRef = useRef(null);

  const followUpTypes = [
    { value: "Call", label: "Call", icon: Phone, color: "#ea580c" },
    { value: "WhatsApp", label: "WhatsApp", icon: MessageSquare, color: "#16a34a" },
    { value: "Email", label: "Email", icon: Mail, color: "#ea580c" },
    { value: "Meeting", label: "Meeting", icon: Users, color: "#9333ea" },
    { value: "Task", label: "Task", icon: CheckSquare, color: "#ff3b19" },
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (leadDropdownRef.current && !leadDropdownRef.current.contains(e.target)) {
        setIsLeadDropdownOpen(false);
      }
    };
    if (isTypeDropdownOpen || isLeadDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTypeDropdownOpen, isLeadDropdownOpen]);

  // Sync state whenever modal opens or assigned leads list updates
  useEffect(() => {
    if (isOpen) {
      const currentSelected = assignedLeads.find((l) => l.id === formData.leadId) || assignedLeads[0];
      const rep = !isAdmin ? currentSalesperson : (currentSelected?.salesperson || currentSelected?.assignedTo || "");
      setFormData((prev) => ({
        ...prev,
        leadId: currentSelected?.id || "",
        assignedTo: rep,
        date: prev.date || new Date().toISOString().split("T")[0],
        time: prev.time || "15:00",
      }));
      setErrors({});
      setIsTypeDropdownOpen(false);
      setIsLeadDropdownOpen(false);
    }
  }, [isOpen, assignedLeads, isAdmin, currentSalesperson]);

  const selectedLead = assignedLeads.find((l) => l.id === formData.leadId) || assignedLeads[0] || null;

  // Lead selection via custom dropdown
  const handleSelectLead = (lead) => {
    const assignedRep = !isAdmin ? currentSalesperson : (lead.salesperson || lead.assignedTo || "Unassigned");
    setFormData((prev) => ({
      ...prev,
      leadId: lead.id,
      assignedTo: assignedRep,
    }));
    if (errors.leadId) {
      setErrors((prev) => ({ ...prev, leadId: "" }));
    }
    setIsLeadDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "assignedTo") return; // read only
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectType = (typeName) => {
    setFormData((prev) => ({ ...prev, type: typeName }));
    setIsTypeDropdownOpen(false);
  };

  const selectedTypeObj = followUpTypes.find((t) => t.value === formData.type) || followUpTypes[0];
  const SelectedTypeIcon = selectedTypeObj.icon;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.leadId) newErrors.leadId = "Please select an assigned lead.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const curLead = assignedLeads.find((l) => l.id === formData.leadId);
    const assignedRep = !isAdmin ? currentSalesperson : (curLead ? (curLead.salesperson || curLead.assignedTo || formData.assignedTo) : formData.assignedTo);

    onConfirm({
      ...formData,
      assignedTo: assignedRep,
      leadName: curLead ? curLead.name : "Lead",
      company: curLead ? (curLead.company || "Direct Client") : "Direct Client",
      phone: curLead ? (curLead.phone || "") : "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Follow-up" maxWidth="520px">
      <style>{`
        .sched-followup-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 520px) {
          .sched-followup-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        .custom-type-select-btn {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 600;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .custom-type-select-btn:focus,
        .custom-type-select-btn.active {
          border-color: #ff3b19;
          box-shadow: 0 0 0 3px rgba(255, 59, 25, 0.15);
        }
        .custom-type-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 100%;
          max-width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          z-index: 100;
          overflow: hidden;
          box-sizing: border-box;
        }
        .custom-type-option-item {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: background 0.12s;
        }
        .custom-type-option-item:hover {
          background: #f1f5f9;
        }
        .custom-type-option-item.selected {
          background: #fff1ee;
          color: #ff3b19;
          font-weight: 700;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Select Lead (Custom Bounded Dropdown - strictly inside card) */}
          <div className="form-group" style={{ position: "relative" }} ref={leadDropdownRef}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
              Lead Record <span className="text-req">*</span>
            </label>

            <button
              type="button"
              className={`custom-type-select-btn ${isLeadDropdownOpen ? "active" : ""} ${errors.leadId ? "input-error" : ""}`}
              onClick={() => {
                setIsLeadDropdownOpen((prev) => !prev);
                setIsTypeDropdownOpen(false);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderColor: errors.leadId ? "#ef4444" : undefined
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, overflow: "hidden" }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#fff1ee",
                  color: "#ff3b19",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.725rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {selectedLead ? selectedLead.name.charAt(0).toUpperCase() : <User size={13} />}
                </div>
                <div style={{ textAlign: "left", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedLead ? (
                    <span>
                      <strong style={{ color: "#0f172a" }}>{selectedLead.name}</strong>
                      {selectedLead.company && (
                        <span style={{ color: "#64748b", marginLeft: "6px", fontSize: "0.8rem" }}>
                          — {selectedLead.company}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>Select an assigned lead...</span>
                  )}
                </div>
              </div>

              <ChevronDown
                size={16}
                color="#64748b"
                style={{
                  transform: isLeadDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                  marginLeft: "8px"
                }}
              />
            </button>

            {/* Bounded Responsive Dropdown Menu for Leads */}
            {isLeadDropdownOpen && (
              <div className="custom-type-dropdown-menu" style={{ maxHeight: "230px", overflowY: "auto", zIndex: 120 }}>
                {assignedLeads.length > 0 ? (
                  assignedLeads.map((lead) => {
                    const isSelected = (selectedLead?.id === lead.id) || (formData.leadId === lead.id);
                    return (
                      <div
                        key={lead.id}
                        className={`custom-type-option-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectLead(lead)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderBottom: "1px solid #f1f5f9"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <div style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            backgroundColor: isSelected ? "#ff3b19" : "#fbf9f4",
                            color: isSelected ? "#ffffff" : "#71717a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: isSelected ? 700 : 600, color: isSelected ? "#ff3b19" : "#141416", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lead.name}
                            </div>
                            {lead.company && (
                              <div style={{ fontSize: "0.75rem", color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {lead.company}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && <Check size={16} color="#ff3b19" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                    No assigned leads available for you
                  </div>
                )}
              </div>
            )}

            {errors.leadId && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.leadId}</span>}
          </div>

          {/* Assigned Sales Employee & Type Grid - Stacks nicely on device */}
          <div className="sched-followup-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
                Assigned Sales Employee <span style={{ fontSize: "0.725rem", color: "#64748b" }}>(Read-only)</span> <span className="text-req">*</span>
              </label>
              <input
                type="text"
                name="assignedTo"
                className="crm-input"
                value={formData.assignedTo || currentSalesperson}
                readOnly
                disabled
                style={{
                  width: "100%",
                  height: "42px",
                  fontSize: "0.85rem",
                  backgroundColor: "#f8fafc",
                  color: "#1e293b",
                  fontWeight: 700,
                  cursor: "not-allowed",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px"
                }}
                title="Assigned sales employee cannot be changed from here"
              />
            </div>

            {/* Custom Responsive Follow-up Type Selector */}
            <div className="form-group" style={{ position: "relative" }} ref={typeDropdownRef}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
                Follow-up Type <span className="text-req">*</span>
              </label>

              <button
                type="button"
                className={`custom-type-select-btn ${isTypeDropdownOpen ? "active" : ""}`}
                onClick={() => {
                  setIsTypeDropdownOpen((prev) => !prev);
                  setIsLeadDropdownOpen(false);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <SelectedTypeIcon size={16} color={selectedTypeObj.color} />
                  <span>{selectedTypeObj.label}</span>
                </div>
                <ChevronDown
                  size={16}
                  color="#64748b"
                  style={{
                    transform: isTypeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                />
              </button>

              {/* Bounded Responsive Dropdown Menu */}
              {isTypeDropdownOpen && (
                <div className="custom-type-dropdown-menu">
                  {followUpTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.type === t.value;
                    return (
                      <div
                        key={t.value}
                        className={`custom-type-option-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectType(t.value)}
                      >
                        <Icon size={16} color={t.color} />
                        <span>{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
                Date <span className="text-req">*</span>
              </label>
              <input
                type="date"
                name="date"
                className={`crm-input ${errors.date ? "input-error" : ""}`}
                style={{ height: "42px", borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem", width: "100%" }}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px" }}>{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
                Time <span className="text-req">*</span>
              </label>
              <input
                type="time"
                name="time"
                className={`crm-input ${errors.time ? "input-error" : ""}`}
                style={{ height: "42px", borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem", width: "100%" }}
                value={formData.time}
                onChange={handleChange}
              />
              {errors.time && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px" }}>{errors.time}</span>}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1e293b", marginBottom: "6px", display: "block" }}>
              Follow-up Notes / Agenda
            </label>
            <textarea
              name="notes"
              className="crm-input crm-textarea"
              rows={3}
              style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem", padding: "10px 14px", width: "100%", resize: "vertical" }}
              placeholder="Add notes about this follow-up..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose} style={{ height: "40px", padding: "0 18px", borderRadius: "8px", fontSize: "0.85rem" }}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary" style={{ fontWeight: 700, height: "40px", padding: "0 18px", borderRadius: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={15} /> Schedule Follow-up
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
