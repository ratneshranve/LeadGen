import React, { useState, useEffect } from "react";
import { Share2, Tag, Shield, AlignLeft, X, Save } from "lucide-react";

export const UpdateLeadSourceModal = ({
  isOpen,
  onClose,
  targetSource,
  existingSources,
  onUpdateSource,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Advertising",
    status: "Active",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const typeOptions = [
    "Advertising",
    "Website",
    "Social Media",
    "Referral",
    "Messaging",
    "Manual",
    "Other",
  ];

  useEffect(() => {
    if (targetSource) {
      setFormData({
        name: targetSource.name || "",
        type: targetSource.type || "Advertising",
        status: targetSource.status || "Active",
        description: targetSource.description || "",
      });
    }
    setErrors({});
  }, [targetSource, isOpen]);

  if (!isOpen || !targetSource) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Source name is required.";
    } else {
      const isDuplicate = existingSources.some(
        (s) =>
          s.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
          s.id !== targetSource.id
      );
      if (isDuplicate) {
        newErrors.name = "A lead source with this name already exists.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedSource = {
      ...targetSource,
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      description: formData.description.trim(),
    };

    onUpdateSource(updatedSource);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "modalFadeIn 0.2s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #ff3b19 0%, #e63010 100%)",
            color: "#ffffff",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}
            >
              <Share2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Update Lead Source
              </h2>
              <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                Update category, description, and status for {targetSource.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Source Name */}
            <div className="form-group">
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                Source Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Share2 size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                <input
                  type="text"
                  name="name"
                  className={`crm-input ${errors.name ? "input-error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  placeholder="e.g. Google Ads, Meta Ads, Referral..."
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              {errors.name && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.name}</span>}
            </div>

            {/* Source Type & Status Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Source Category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Tag size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <select
                    name="type"
                    className="crm-input select-input"
                    style={{ paddingLeft: "38px" }}
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {typeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Status <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Shield size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <select
                    name="status"
                    className="crm-input select-input"
                    style={{ paddingLeft: "38px" }}
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                Description (Optional)
              </label>
              <div style={{ position: "relative", display: "flex" }}>
                <AlignLeft size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#a3aed0" }} />
                <textarea
                  name="description"
                  className="crm-input crm-textarea"
                  style={{ paddingLeft: "38px", paddingTop: "10px", minHeight: "80px" }}
                  placeholder="Brief description or campaign details for this lead source..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              onClick={onClose}
              style={{ borderRadius: "10px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              style={{ borderRadius: "10px" }}
            >
              <Save size={16} /> Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
