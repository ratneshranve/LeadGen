import React, { useState, useEffect } from "react";
import { X, Mail, Phone, CheckCircle2, Trash2, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getActiveStoredSources } from "../../modules/admin/pages/Leads/data/leadsMockData";
import { CustomSelect } from "../ui/CustomSelect";

export const ProfileEditCardModal = ({
  isOpen,
  onClose,
  data,
  type = "user", // "user" | "lead"
  onSave,
  onDelete
}) => {
  const { isAdmin } = useAuth();
  const isUser = type === "user";
  const isReadOnlyLead = !isAdmin && !isUser; // Sales Representative can ONLY READ lead data!
  const [activeSourcesList, setActiveSourcesList] = useState(getActiveStoredSources);

  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "1995-08-15",
    role: "Sales Employee",
    status: "Active",
    source: "Website",
    company: "",
    leadType: "SMB",
    salesperson: "Unassigned",
    location: "Mumbai, Maharashtra"
  });

  useEffect(() => {
    if (data) {
      const nameParts = (data.name || data.fullName || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        name: data.name || data.fullName || "",
        firstName: firstName,
        lastName: lastName,
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob || "1995-08-15",
        role: data.role === "Sales Person" || data.role === "Sales Representative" || !data.role ? "Sales Employee" : data.role,
        status: data.status || "Active",
        source: data.source || "Website",
        company: data.company || "",
        leadType: data.leadType || data.type || data.category || "SMB",
        salesperson: data.salesperson || data.assignedTo || "Unassigned",
        location: data.location || "Mumbai, Maharashtra"
      });
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleNameChange = (first, last) => {
    if (isUser || isReadOnlyLead) return;
    const fullName = `${first} ${last}`.trim();
    setFormData((prev) => ({
      ...prev,
      firstName: first,
      lastName: last,
      name: fullName
    }));
  };

  const handleChange = (e) => {
    if (isUser || isReadOnlyLead) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUser || isReadOnlyLead) {
      onClose();
      return;
    }
    if (onSave) {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      onSave({
        ...data,
        ...formData,
        name: fullName,
        fullName: fullName,
        type: formData.leadType,
        category: formData.leadType,
        assignedTo: formData.salesperson
      });
    }
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
        padding: "12px",
        boxSizing: "border-box"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          maxHeight: "92vh",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.22)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "modalFadeIn 0.2s ease-out",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Card Area */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
            padding: "16px 18px 14px 18px",
            borderBottom: "1px solid #e2e8f0",
            position: "relative",
            flexShrink: 0
          }}
        >
          {/* Close X Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
            }}
          >
            <X size={15} />
          </button>

          {/* Avatar Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  background: isUser
                    ? "linear-gradient(135deg, #27272a, #141416)"
                    : "linear-gradient(135deg, #ff3b19, #e63010)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
                }}
              >
                {formData.name
                  ? formData.name.split(" ").map((n) => n[0]).join("").substring(0, 2)
                  : (isUser ? "SU" : "LD")}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "0px",
                  right: "0px",
                  background: "#ffffff",
                  borderRadius: "50%",
                  padding: "1px"
                }}
              >
                <CheckCircle2 size={14} color="#ff3b19" fill="#ffffff" />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1, paddingRight: "28px" }}>
              <h2 style={{ fontSize: "0.975rem", fontWeight: 800, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {formData.name || (isUser ? "Sales User" : "Lead Contact")}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {formData.email || formData.phone || (isUser ? "user@leadflow.com" : "No contact details")}
              </p>
              {isReadOnlyLead && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "3px",
                    padding: "1px 7px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                    borderRadius: "4px"
                  }}
                >
                  Read-Only Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form / Details Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "14px 18px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxSizing: "border-box"
          }}
        >
          {/* Name Fields (First Name & Last Name) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
              {isUser ? "Sales Employee Full Name" : "Lead Full Name"}
            </label>
            {isUser ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  type="text"
                  className="crm-input"
                  value={formData.firstName}
                  readOnly
                  style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#141416", fontWeight: 600, cursor: "default" }}
                />
                <input
                  type="text"
                  className="crm-input"
                  value={formData.lastName}
                  readOnly
                  style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#141416", fontWeight: 600, cursor: "default" }}
                />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  type="text"
                  className="crm-input"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleNameChange(e.target.value, formData.lastName)}
                  disabled={isReadOnlyLead}
                  readOnly={isReadOnlyLead}
                  style={{
                    height: "36px",
                    fontSize: "0.8rem",
                    ...(isReadOnlyLead ? { backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" } : {})
                  }}
                  required
                />
                <input
                  type="text"
                  className="crm-input"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleNameChange(formData.firstName, e.target.value)}
                  disabled={isReadOnlyLead}
                  readOnly={isReadOnlyLead}
                  style={{
                    height: "36px",
                    fontSize: "0.8rem",
                    ...(isReadOnlyLead ? { backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" } : {})
                  }}
                />
              </div>
            )}
          </div>

          {/* For Leads: Company / Organization (Full Width) */}
          {!isUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                Company / Organization
              </label>
              <input
                type="text"
                name="company"
                className="crm-input"
                placeholder="Company name"
                value={formData.company}
                onChange={handleChange}
                disabled={isReadOnlyLead}
                readOnly={isReadOnlyLead}
                style={{
                  height: "36px",
                  fontSize: "0.8rem",
                  ...(isReadOnlyLead ? { backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" } : {})
                }}
              />
            </div>
          )}

          {/* Email Address (Full Width) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
              Email address
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail size={15} style={{ position: "absolute", left: "11px", color: "#94a3b8" }} />
              <input
                type="email"
                name="email"
                className="crm-input"
                style={{
                  height: "36px",
                  fontSize: "0.8rem",
                  paddingLeft: "34px",
                  ...(isUser || isReadOnlyLead ? { backgroundColor: "#f8fafc", color: "#141416", fontWeight: 600, cursor: "default" } : {})
                }}
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                readOnly={isUser || isReadOnlyLead}
                disabled={isReadOnlyLead}
              />
            </div>
          </div>

          {/* Phone Number (Full Width so it NEVER truncates on mobile!) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
              Phone Number
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Phone size={15} style={{ position: "absolute", left: "11px", color: "#94a3b8" }} />
              <input
                type="tel"
                name="phone"
                className="crm-input"
                style={{
                  height: "36px",
                  fontSize: "0.8rem",
                  paddingLeft: "34px",
                  ...(isUser || isReadOnlyLead ? { backgroundColor: "#f8fafc", color: "#141416", fontWeight: 600, cursor: "default" } : {})
                }}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                readOnly={isUser || isReadOnlyLead}
                disabled={isReadOnlyLead}
              />
            </div>
          </div>

          {/* For Leads: Category / Type & Status (Side by side 2 columns) */}
          {!isUser && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  Lead Category / Type
                </label>
                {isReadOnlyLead ? (
                  <input
                    type="text"
                    name="leadType"
                    className="crm-input"
                    value={formData.leadType}
                    disabled
                    readOnly
                    style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
                  />
                ) : (
                  <CustomSelect
                    name="leadType"
                    value={formData.leadType}
                    onChange={handleChange}
                    options={[
                      { value: "SMB", label: "SMB" },
                      { value: "Startup", label: "Startup" },
                      { value: "Enterprise", label: "Enterprise" },
                      { value: "Retail", label: "Retail" },
                    ]}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  Lead Status
                </label>
                {isReadOnlyLead ? (
                  <input
                    type="text"
                    name="status"
                    className="crm-input"
                    value={formData.status}
                    disabled
                    readOnly
                    style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
                  />
                ) : (
                  <CustomSelect
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={["New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"]}
                  />
                )}
              </div>
            </div>
          )}

          {/* For Leads: Lead Source & Assigned Sales Employee (Side by side 2 columns) */}
          {!isUser && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  Lead Source
                </label>
                {isReadOnlyLead ? (
                  <input
                    type="text"
                    name="source"
                    className="crm-input"
                    value={formData.source}
                    disabled
                    readOnly
                    style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
                  />
                ) : (
                  <CustomSelect
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    options={activeSourcesList.map((src) => ({ value: src, label: src }))}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  Assigned Employee
                </label>
                {isReadOnlyLead ? (
                  <input
                    type="text"
                    name="salesperson"
                    className="crm-input"
                    value={formData.salesperson}
                    disabled
                    readOnly
                    style={{ height: "36px", fontSize: "0.8rem", backgroundColor: "#f8fafc", color: "#334155", fontWeight: 600, cursor: "not-allowed" }}
                  />
                ) : (
                  <CustomSelect
                    name="salesperson"
                    value={formData.salesperson}
                    onChange={handleChange}
                    options={[
                      { value: "Unassigned", label: "Unassigned" },
                      { value: "Amit Sharma", label: "Amit Sharma" },
                      { value: "Neha Verma", label: "Neha Verma" },
                      { value: "Rahul Mehta", label: "Rahul Mehta" },
                      { value: "Priya Singh", label: "Priya Singh" },
                    ]}
                  />
                )}
              </div>
            </div>
          )}

          {/* For Users: Role & Account Status */}
          {isUser && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  User Role
                </label>
                <div
                  className="crm-input"
                  style={{
                    height: "36px",
                    fontSize: "0.8rem",
                    backgroundColor: "#f8fafc",
                    color: "#141416",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "default"
                  }}
                >
                  <span style={{ fontSize: "0.75rem" }}>{formData.role}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                  Account Status
                </label>
                <div
                  className="crm-input"
                  style={{
                    height: "36px",
                    fontSize: "0.8rem",
                    backgroundColor: "#f8fafc",
                    color: "#141416",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "default"
                  }}
                >
                  <span style={{ fontSize: "0.75rem" }}>{formData.status}</span>
                  <span
                    className={`status-badge-chip ${formData.status === "Active" ? "status-active" : "status-inactive"}`}
                    style={{ padding: "1px 6px", fontSize: "0.675rem", margin: 0 }}
                  >
                    <span className="status-dot" /> {formData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* For Users: Date of Birth */}
          {isUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.725rem", fontWeight: 700, color: "#475569" }}>
                Date of Birth (DOB)
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Calendar size={15} style={{ position: "absolute", left: "11px", color: "#94a3b8" }} />
                <input
                  type="date"
                  name="dob"
                  className="crm-input"
                  style={{
                    height: "36px",
                    fontSize: "0.8rem",
                    paddingLeft: "34px",
                    backgroundColor: "#f8fafc",
                    color: "#141416",
                    fontWeight: 600,
                    cursor: "default",
                    pointerEvents: "none"
                  }}
                  value={formData.dob || "1995-08-15"}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isUser ? "flex-end" : "space-between",
              marginTop: "8px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9"
            }}
          >
            {isUser ? (
              <button
                type="button"
                className="crm-btn crm-btn-secondary"
                onClick={onClose}
                style={{
                  height: "36px",
                  padding: "0 20px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1"
                }}
              >
                Close
              </button>
            ) : (
              <>
                {/* Admin Delete Option */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isAdmin && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete this lead?`)) {
                          onDelete(data);
                          onClose();
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#dc2626",
                        background: "#fef2f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>

                {/* Actions for Leads */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    className="crm-btn crm-btn-secondary"
                    onClick={onClose}
                    style={{ height: "34px", padding: "0 14px", fontSize: "0.785rem", borderRadius: "8px" }}
                  >
                    {isReadOnlyLead ? "Close" : "Cancel"}
                  </button>

                  {!isReadOnlyLead && (
                    <button
                      type="submit"
                      className="crm-btn crm-btn-primary"
                      style={{
                        height: "34px",
                        padding: "0 16px",
                        fontSize: "0.785rem",
                        background: "linear-gradient(135deg, #ff3b19 0%, #e63010 100%)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(255, 59, 25, 0.28)"
                      }}
                    >
                      Save changes
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
