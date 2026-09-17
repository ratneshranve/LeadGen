import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";
import { useAuth } from "../../../../../context/AuthContext";

const defaultFormState = {
  name: "",
  email: "",
  phone: "",
  dob: "1995-08-15",
  role: "Sales Employee",
  status: "Active",
  password: "",
  confirmPassword: "",
  sendWelcomeEmail: true,
};

export const AddEditUserModal = ({
  isOpen,
  onClose,
  targetUser,
  onConfirm,
}) => {
  const { createSalespersonAccount } = useAuth();
  const isEditing = Boolean(targetUser);

  const [formData, setFormData] = useState(defaultFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetUser) {
      setFormData({
        name: targetUser.name || "",
        email: targetUser.email || "",
        phone: targetUser.phone || "",
        dob: targetUser.dob || "1995-08-15",
        role: targetUser.role || "Sales Employee",
        status: targetUser.status || "Active",
        sendWelcomeEmail: false,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        dob: "1995-08-15",
        role: "Sales Employee",
        status: "Active",
        sendWelcomeEmail: true,
      });
    }
    setErrors({});
  }, [targetUser, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!isEditing) {
      if (!formData.password) newErrors.password = "Password is required.";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isEditing) {
        // Add to pure frontend auth store
        createSalespersonAccount({
          name: formData.name,
          email: formData.email,
          mobile: formData.phone,
          password: formData.password,
          role: formData.role === "Master Admin" ? "MASTER_ADMIN" : "SALES_REPRESENTATIVE",
          status: formData.status === "Active" ? "ACTIVE" : "INACTIVE",
        });
      }

      onConfirm({
        ...targetUser,
        ...formData,
        maxCapacity: Number(formData.maxCapacity) || 50,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ email: err.message || "Failed to create user account." });
    }
  };

  const isSalesRole = formData.role === "Sales Person";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User Account" : "Add New User"}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isEditing && (
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>
              Create a new user account and assign their role and system permissions.
            </p>
          )}

          {/* Full Name & Email Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="text-req">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`crm-input ${errors.name ? "input-error" : ""}`}
                placeholder="e.g. Vikram Sharma"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="text-req">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`crm-input ${errors.email ? "input-error" : ""}`}
                placeholder="e.g. vikram@leadflow.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Phone & Date of Birth Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="crm-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth (DOB)</label>
              <input
                type="date"
                name="dob"
                className="crm-input"
                value={formData.dob || "1995-08-15"}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Account Status & Role Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                name="status"
                className="crm-input select-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Role <span className="text-req">*</span>
              </label>
              <select
                name="role"
                className="crm-input select-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Sales Employee">Sales Employee</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Welcome Email Checkbox */}
          {!isEditing && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                name="sendWelcomeEmail"
                className="crm-checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={handleChange}
              />
              <label htmlFor="sendWelcomeEmail" style={{ fontSize: "0.825rem", color: "var(--text-main)", cursor: "pointer" }}>
                Send welcome email with login credentials link
              </label>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="spin-icon" /> Saving...
                </>
              ) : isEditing ? (
                <>
                  <UserCheck size={15} /> Save Changes
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Create User
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
