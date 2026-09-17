import React from "react";
import { Calendar, Clock, MessageSquare, Phone, Video, Mail, FileText } from "lucide-react";

export const LeadFollowUp = ({ formData, setFormData }) => {
  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      scheduleFollowup: !prev.scheduleFollowup,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      followup: {
        ...prev.followup,
        [name]: value,
      },
    }));
  };

  return (
    <div className="crm-card form-section-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <Calendar size={18} className="text-indigo" /> Follow-up
        </h3>

        {/* Toggle Switch */}
        <label className="toggle-switch-wrapper">
          <span className="toggle-label">Schedule Follow-up</span>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={formData.scheduleFollowup}
            onChange={handleToggle}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {formData.scheduleFollowup && (
        <div className="section-body followup-body">
          <div className="grid-2-col">
            {/* Date */}
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <div className="input-with-icon">
                <Calendar size={16} className="field-icon" />
                <input
                  type="date"
                  name="date"
                  className="crm-input"
                  value={formData.followup.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Time */}
            <div className="form-group">
              <label className="form-label">Follow-up Time</label>
              <div className="input-with-icon">
                <Clock size={16} className="field-icon" />
                <input
                  type="time"
                  name="time"
                  className="crm-input"
                  value={formData.followup.time}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Follow-up Type</label>
            <div className="input-with-icon">
              <Phone size={16} className="field-icon" />
              <select
                name="type"
                className="crm-input select-input"
                value={formData.followup.type}
                onChange={handleChange}
              >
                <option value="Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Meeting">Meeting / Demo</option>
                <option value="Email">Email Communication</option>
              </select>
            </div>
          </div>

          {/* Follow-up Notes */}
          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">Follow-up Notes</label>
            <textarea
              name="notes"
              className="crm-input crm-textarea"
              rows={3}
              placeholder="Add follow-up notes..."
              value={formData.followup.notes}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
