import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Tag, Share2, UserCheck, Activity, Save, X } from "lucide-react";
import { salespersonOptions, leadStatusOptions, getActiveStoredSources } from "../data/leadsMockData";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const UpdateLeadModal = ({ isOpen, onClose, targetLead, onUpdateLead }) => {
  const [sourcesList, setSourcesList] = useState([]);

  const repsList = salespersonOptions.filter((r) => r !== "All");
  const statusOptionsList = leadStatusOptions.filter((s) => s !== "All");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "Meta Ads",
    category: "SMB",
    status: "New",
    salesperson: "Unassigned"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && targetLead) {
      const activeSources = getActiveStoredSources();
      setSourcesList(activeSources);
      setFormData({
        name: targetLead.name || "",
        phone: targetLead.phone || "",
        email: targetLead.email || "",
        source: targetLead.source || activeSources[0] || "Meta Ads",
        category: targetLead.category || targetLead.leadType || "SMB",
        status: targetLead.status || "New",
        salesperson: targetLead.salesperson || "Unassigned"
      });
    }
    setErrors({});
  }, [targetLead, isOpen]);

  if (!isOpen || !targetLead) return null;

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
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.source) {
      newErrors.source = "Please select a lead source.";
    }

    if (!formData.salesperson) {
      newErrors.salesperson = "Please select a sales employee.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedLead = {
      ...targetLead,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      source: formData.source,
      status: formData.status,
      category: formData.category,
      leadType: formData.category,
      salesperson: formData.salesperson,
    };

    onUpdateLead(updatedLead);
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
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Update Lead Details
              </h2>
              <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                Editing lead details for {targetLead.name}
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

            {/* Full Name */}
            <div className="form-group">
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                <input
                  type="text"
                  name="name"
                  className={`crm-input ${errors.name ? "input-error" : ""}`}
                  style={{ paddingLeft: "38px" }}
                  placeholder="Enter lead full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              {errors.name && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.name}</span>}
            </div>

            {/* Phone & Email Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Phone Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Phone size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <input
                    type="tel"
                    name="phone"
                    className={`crm-input ${errors.phone ? "input-error" : ""}`}
                    style={{ paddingLeft: "38px" }}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <input
                    type="email"
                    name="email"
                    className={`crm-input ${errors.email ? "input-error" : ""}`}
                    style={{ paddingLeft: "38px" }}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.email}</span>}
              </div>
            </div>

            {/* Lead Source & Lead Category Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Lead Source <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <CustomSelect
                  name="source"
                  icon={Share2}
                  value={formData.source}
                  onChange={handleChange}
                  options={sourcesList}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Lead Category
                </label>
                <CustomSelect
                  name="category"
                  icon={Tag}
                  value={formData.category}
                  onChange={handleChange}
                  options={["Enterprise", "SMB", "Startup", "Retail"]}
                />
              </div>
            </div>

            {/* Lead Status & Assigned Sales Employee Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Lead Status <span style={{ fontSize: "0.725rem", fontWeight: 600, color: "#64748b" }}>(Read-only)</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Activity size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                  <input
                    type="text"
                    name="status"
                    className="crm-input"
                    style={{ paddingLeft: "38px", backgroundColor: "#f1f5f9", cursor: "default", color: "#334155", fontWeight: 700 }}
                    value={formData.status}
                    readOnly={true}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Assigned Sales Employee <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <CustomSelect
                  name="salesperson"
                  icon={UserCheck}
                  value={formData.salesperson}
                  onChange={handleChange}
                  options={["Unassigned", ...repsList]}
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
