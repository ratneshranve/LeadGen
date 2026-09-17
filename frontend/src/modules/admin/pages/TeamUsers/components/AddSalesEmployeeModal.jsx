import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Key, Shield, UserPlus, X, Lock } from "lucide-react";

export const AddSalesEmployeeModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "1995-08-15",
    password: "Sales@123",
    role: "Sales Employee",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        dob: "1995-08-15",
        password: "Sales@123",
        role: "Sales Employee",
        status: "Active",
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dob: formData.dob || "1995-08-15",
      password: formData.password,
      role: "Sales Employee",
      status: formData.status || "Active",
      assignedLeads: 0,
      activeLeads: 0,
      followups: 0,
      converted: 0,
      maxCapacity: 50,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      lastActive: "Just now",
    };

    onAddUser(newUser);
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
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Add New Sales Employee
              </h2>
              <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                Create a new sales employee account with system permissions
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
                  placeholder="e.g. Vikram Sharma"
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
                  Email Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Mail size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <input
                    type="email"
                    name="email"
                    className={`crm-input ${errors.email ? "input-error" : ""}`}
                    style={{ paddingLeft: "38px" }}
                    placeholder="vikram@leadflow.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.email}</span>}
              </div>
            </div>

            {/* Date of Birth & Password Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Date of Birth (DOB)
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Calendar size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <input
                    type="date"
                    name="dob"
                    className="crm-input"
                    style={{ paddingLeft: "38px" }}
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Password <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Key size={16} style={{ position: "absolute", left: "12px", color: "#a3aed0" }} />
                  <input
                    type="password"
                    name="password"
                    className={`crm-input ${errors.password ? "input-error" : ""}`}
                    style={{ paddingLeft: "38px" }}
                    placeholder="Sales@123"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && <span className="error-text" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>{errors.password}</span>}
              </div>
            </div>

            {/* Account Status & Locked Role Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Account Status
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

              {/* Locked Role Field */}
              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1b2559", display: "block", marginBottom: "6px" }}>
                  Role <span style={{ color: "#a3aed0", fontSize: "0.725rem" }}>(Locked)</span>
                </label>
                <div
                  style={{
                    height: "42px",
                    backgroundColor: "#f4f7fe",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    gap: "8px",
                    cursor: "not-allowed"
                  }}
                >
                  <Lock size={15} color="#ff3b19" />
                  <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "#ff3b19" }}>
                    Sales Employee
                  </span>
                </div>
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
              <UserPlus size={16} /> Create Sales Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
