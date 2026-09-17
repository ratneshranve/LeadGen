import React, { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { useAuth } from "../../../../../context/AuthContext";
import { salespersonOptions } from "../../Leads/data/leadsMockData";

export const ScheduleFollowUpModal = ({
  isOpen,
  onClose,
  leadsList,
  initialDate,
  onConfirm,
}) => {
  const { isAdmin, user } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  const [formData, setFormData] = useState({
    leadId: leadsList[0]?.id || "LD-1001",
    assignedTo: currentSalesperson,
    type: "Call",
    date: initialDate || "2026-09-03",
    time: "14:30",
    notes: "",
    reminder: "15 minutes before",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({ ...prev, date: initialDate }));
    }
  }, [initialDate]);

  useEffect(() => {
    if (!isAdmin) {
      setFormData((prev) => ({ ...prev, assignedTo: currentSalesperson }));
    }
  }, [isAdmin, currentSalesperson]);

  const reps = salespersonOptions.filter((r) => r !== "All");
  const types = ["Call", "Meeting", "WhatsApp", "Email"];
  const reminders = [
    "None",
    "15 minutes before",
    "30 minutes before",
    "1 hour before",
    "1 day before",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "assignedTo" && !isAdmin) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.leadId) newErrors.leadId = "Please select a lead.";
    if (!formData.assignedTo) newErrors.assignedTo = "Please select a sales employee.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedLead = leadsList.find((l) => l.id === formData.leadId);

      onConfirm({
        ...formData,
        leadName: selectedLead ? selectedLead.name : "Rahul Sharma",
        company: selectedLead ? selectedLead.company : "Rahul Traders",
        phone: selectedLead ? selectedLead.phone : "+91 98765 43210",
        leadStatus: selectedLead ? selectedLead.status : "Follow-up",
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Follow-up">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Select Lead */}
          <div className="form-group">
            <label className="form-label">
              Select Lead <span className="text-req">*</span>
            </label>
            <select
              name="leadId"
              className={`crm-input select-input ${errors.leadId ? "input-error" : ""}`}
              value={formData.leadId}
              onChange={handleChange}
            >
              {leadsList.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.company})
                </option>
              ))}
            </select>
            {errors.leadId && <span className="error-text">{errors.leadId}</span>}
          </div>

          {/* Activity Type & Assigned To Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">
                Activity Type <span className="text-req">*</span>
              </label>
              <select
                name="type"
                className="crm-input select-input"
                value={formData.type}
                onChange={handleChange}
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Assigned To {!isAdmin && "(Admin Only)"} <span className="text-req">*</span>
              </label>
              {!isAdmin ? (
                <input
                  type="text"
                  name="assignedTo"
                  className="crm-input"
                  value={formData.assignedTo}
                  disabled
                  readOnly
                  style={{ backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
                />
              ) : (
                <select
                  name="assignedTo"
                  className={`crm-input select-input ${errors.assignedTo ? "input-error" : ""}`}
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  {reps.map((rep) => (
                    <option key={rep} value={rep}>{rep}</option>
                  ))}
                </select>
              )}
              {errors.assignedTo && <span className="error-text">{errors.assignedTo}</span>}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">
                Date <span className="text-req">*</span>
              </label>
              <input
                type="date"
                name="date"
                className={`crm-input ${errors.date ? "input-error" : ""}`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Time <span className="text-req">*</span>
              </label>
              <input
                type="time"
                name="time"
                className={`crm-input ${errors.time ? "input-error" : ""}`}
                value={formData.time}
                onChange={handleChange}
              />
              {errors.time && <span className="error-text">{errors.time}</span>}
            </div>
          </div>

          {/* Reminder Select */}
          <div className="form-group">
            <label className="form-label">Reminder</label>
            <select
              name="reminder"
              className="crm-input select-input"
              value={formData.reminder}
              onChange={handleChange}
            >
              {reminders.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Agenda Notes */}
          <div className="form-group">
            <label className="form-label">Agenda / Notes</label>
            <textarea
              name="notes"
              className="crm-input crm-textarea"
              rows={3}
              placeholder="Add notes about this follow-up..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="spin-icon" /> Saving...
                </>
              ) : (
                <>
                  <Calendar size={15} /> Schedule Follow-up
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
