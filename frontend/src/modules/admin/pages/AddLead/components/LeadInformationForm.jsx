import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Tag, Share2, Activity, Plus, X } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";
import { getActiveStoredSources } from "../../Leads/data/leadsMockData";

export const LeadInformationForm = ({ formData, setFormData, errors }) => {
  // Sources state with active lead sources filtering
  const [sourcesList, setSourcesList] = useState(getActiveStoredSources);

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [sourceError, setSourceError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newSourceName.trim()) {
      setSourceError("Please enter a source name");
      return;
    }

    const trimmed = newSourceName.trim();
    if (sourcesList.includes(trimmed)) {
      setSourceError("Source already exists");
      return;
    }

    const updated = [...sourcesList, trimmed];
    setSourcesList(updated);
    localStorage.setItem("leadflow_custom_sources", JSON.stringify(updated));

    // Automatically select the newly created source
    setFormData((prev) => ({ ...prev, source: trimmed }));
    setNewSourceName("");
    setSourceError("");
    setShowSourceModal(false);
  };

  return (
    <>
      <div className="crm-card form-section-card">
        <div className="card-header-flex">
          <h3 className="section-title">
            <User size={18} className="text-indigo" /> Lead Information
          </h3>
          <span className="required-legend">* Required fields</span>
        </div>

        <div className="section-body grid-2-col">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="text-req">*</span>
            </label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                type="text"
                name="fullName"
                className={`crm-input ${errors.fullName ? "input-error" : ""}`}
                placeholder="Enter lead name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label">
              Mobile Number <span className="text-req">*</span>
            </label>
            <div className="input-with-icon">
              <Phone size={16} className="field-icon" />
              <input
                type="tel"
                name="mobile"
                className={`crm-input ${errors.mobile ? "input-error" : ""}`}
                placeholder="+91 XXXXX XXXXX"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                type="email"
                name="email"
                className="crm-input"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Lead Type / Category */}
          <div className="form-group">
            <label className="form-label">Lead Type / Category</label>
            <div className="input-with-icon">
              <Tag size={16} className="field-icon" />
              <select
                name="leadType"
                className="crm-input select-input"
                value={formData.leadType}
                onChange={handleChange}
              >
                <option value="Individual">Individual</option>
                <option value="SMB">SMB</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Startup">Startup</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
          </div>

          {/* Lead Source with + Create Source Button */}
          <div className="form-group">
            <div className="label-with-badge" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">
                Lead Source <span className="text-req">*</span>
              </label>
              <button
                type="button"
                className="add-source-link-btn"
                onClick={() => setShowSourceModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff3b19",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Plus size={13} /> Create Source
              </button>
            </div>
            <div className="input-with-icon">
              <Share2 size={16} className="field-icon" />
              <select
                name="source"
                className={`crm-input select-input ${errors.source ? "input-error" : ""}`}
                value={formData.source}
                onChange={handleChange}
              >
                <option value="">-- Select Source --</option>
                {sourcesList.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
            {errors.source && <span className="error-text">{errors.source}</span>}
          </div>

          {/* Lead Status (Fixed to New) */}
          <div className="form-group">
            <div className="label-with-badge">
              <label className="form-label">Lead Status</label>
              <Badge status="New" />
            </div>
            <div className="input-with-icon">
              <Activity size={16} className="field-icon" />
              <select
                name="status"
                className="crm-input select-input"
                value="New"
                disabled
                readOnly
              >
                <option value="New">New (Default for created lead)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating New Lead Source */}
      {showSourceModal && (
        <div className="modal-overlay show" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="crm-card" style={{ width: "90%", maxWidth: "400px", padding: "24px", background: "#ffffff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: "1px solid #cbd5e1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Share2 size={18} color="#ff3b19" /> Create New Lead Source
              </h3>
              <button
                type="button"
                onClick={() => { setShowSourceModal(false); setSourceError(""); }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSource}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Source Name <span className="text-req">*</span>
                </label>
                <input
                  type="text"
                  className="crm-input"
                  placeholder="e.g. Instagram Ads, Trade Show, TikTok"
                  value={newSourceName}
                  onChange={(e) => { setNewSourceName(e.target.value); setSourceError(""); }}
                  autoFocus
                />
                {sourceError && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.725rem", marginTop: "4px", display: "block" }}>{sourceError}</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="crm-btn crm-btn-secondary"
                  onClick={() => { setShowSourceModal(false); setSourceError(""); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-btn crm-btn-primary"
                >
                  Save & Select Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
