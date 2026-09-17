import React from "react";
import { Building2, MapPin, FileText } from "lucide-react";

export const AdditionalInformation = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="crm-card form-section-card">
      <div className="card-header-flex">
        <h3 className="section-title">
          <Building2 size={18} className="text-indigo" /> Additional Information
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
          All fields optional
        </span>
      </div>

      <div className="section-body">
        <div className="grid-2-col" style={{ marginBottom: "16px" }}>
          {/* Company / Organization (Optional) */}
          <div className="form-group">
            <label className="form-label">
              Company / Organization <span style={{ color: "#94a3b8", fontWeight: 500 }}>(Optional)</span>
            </label>
            <div className="input-with-icon">
              <Building2 size={16} className="field-icon" />
              <input
                type="text"
                name="company"
                className="crm-input"
                placeholder="Enter company name (Optional)"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location (Optional) */}
          <div className="form-group">
            <label className="form-label">
              Location <span style={{ color: "#94a3b8", fontWeight: 500 }}>(Optional)</span>
            </label>
            <div className="input-with-icon">
              <MapPin size={16} className="field-icon" />
              <input
                type="text"
                name="location"
                className="crm-input"
                placeholder="City, State (Optional)"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Lead Notes (Optional) */}
        <div className="form-group">
          <label className="form-label">
            Lead Notes <span style={{ color: "#94a3b8", fontWeight: 500 }}>(Optional)</span>
          </label>
          <div className="input-with-icon" style={{ alignItems: "flex-start" }}>
            <FileText size={16} className="field-icon" style={{ marginTop: "10px" }} />
            <textarea
              name="notes"
              className="crm-input"
              rows={3}
              style={{ paddingLeft: "36px", paddingTop: "8px", resize: "vertical" }}
              placeholder="Add any internal notes, requirements, or client preferences... (Optional)"
              value={formData.notes || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
