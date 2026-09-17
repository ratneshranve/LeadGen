import React, { useState } from "react";
import { Calendar, Clock, Phone, Video, MessageSquare, Mail } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

export const ScheduleFollowupModal = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    date: "2026-09-03",
    time: "14:30",
    type: "Call",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Lead Follow-up">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Follow-up Date *</label>
              <input
                type="date"
                name="date"
                className="crm-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Follow-up Time *</label>
              <input
                type="time"
                name="time"
                className="crm-input"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interaction Type</label>
            <select
              name="type"
              className="crm-input select-input"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Call">Phone Call</option>
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Meeting">In-Person Meeting / Demo</option>
              <option value="Email">Email Communication</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Follow-up Agenda / Notes</label>
            <textarea
              name="notes"
              className="crm-input crm-textarea"
              rows={3}
              placeholder="Add follow-up notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              <Calendar size={15} /> Save Follow-up
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
