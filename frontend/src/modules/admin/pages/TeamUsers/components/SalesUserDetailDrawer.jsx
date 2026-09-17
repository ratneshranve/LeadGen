import React from "react";
import { X, Phone, Mail, Shield, Activity, CheckCircle2, Clock, Edit3, UserX, Trash2, Calendar, Target } from "lucide-react";
import { Badge } from "../../../../../components/ui/Badge";

export const SalesUserDetailDrawer = ({ isOpen, onClose, user, onEdit, onDeactivate, onDelete }) => {
  if (!isOpen || !user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "SP";

  return (
    <>
      {/* Dark Backdrop Shading */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(3px)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease"
        }}
        onClick={onClose}
      />

      {/* Slide-Over Drawer Card Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          boxShadow: "-4px 0 25px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          animation: "slideInRight 0.25s ease-out"
        }}
      >
        {/* Drawer Top Header Banner */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #ff3b19 0%, #e63010 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#ffffff",
                color: "#ff3b19",
                fontSize: "1.2rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)"
              }}
            >
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                {user.name}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    padding: "2px 8px",
                    borderRadius: "9999px"
                  }}
                >
                  {user.role === "Sales Person" || user.role === "Sales Representative" || !user.role ? "Sales Employee" : user.role}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    backgroundColor: user.status === "Active" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: user.status === "Active" ? "#4ade80" : "#fca5a5",
                    padding: "2px 8px",
                    borderRadius: "9999px"
                  }}
                >
                  {user.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
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

        {/* Drawer Body Content */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          {/* Quick Action CTAs */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              style={{ flex: 1, fontSize: "0.8rem", padding: "8px 12px" }}
              onClick={() => { onClose(); onEdit && onEdit(user); }}
            >
              <Edit3 size={14} color="#ff3b19" /> Edit Profile
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              style={{ flex: 1, fontSize: "0.8rem", padding: "8px 12px", color: "#d97706" }}
              onClick={() => { onClose(); onDeactivate && onDeactivate(user); }}
            >
              <UserX size={14} /> Deactivate
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              style={{ padding: "8px 12px", color: "#dc2626", borderColor: "#fecdd3" }}
              onClick={() => { onClose(); onDelete && onDelete(user); }}
              title="Delete Account"
            >
              <Trash2 size={14} color="#dc2626" />
            </button>
          </div>

          {/* 4 Metric Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="crm-card" style={{ padding: "14px", background: "#fbf9f4", border: "1px solid #ece7dc" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Assigned Leads
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ea580c", marginTop: "2px" }}>
                {user.assignedLeads || 12}
              </div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Allocated in pipeline</span>
            </div>

            <div className="crm-card" style={{ padding: "14px", background: "#fbf9f4", border: "1px solid #ece7dc" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Active Discussions
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ff3b19", marginTop: "2px" }}>
                {user.activeLeads || 8}
              </div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>In negotiation</span>
            </div>

            <div className="crm-card" style={{ padding: "14px", background: "#fbf9f4", border: "1px solid #ece7dc" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Converted Deals
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginTop: "2px" }}>
                {user.converted || 4}
              </div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Won client accounts</span>
            </div>

            <div className="crm-card" style={{ padding: "14px", background: "#fbf9f4", border: "1px solid #ece7dc" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Conversion Rate
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#9333ea", marginTop: "2px" }}>
                {user.assignedLeads ? `${Math.round(((user.converted || 4) / user.assignedLeads) * 100)}%` : "33%"}
              </div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Closing efficiency</span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="crm-card" style={{ padding: "16px", background: "#ffffff", border: "1px solid #ece7dc" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Contact & Account Info
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.825rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} color="#ff3b19" /> Email Address:
                </span>
                <strong style={{ color: "#0f172a", marginLeft: "auto" }}>{user.email}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} color="#ff3b19" /> Mobile Number:
                </span>
                <strong style={{ color: "#0f172a", marginLeft: "auto" }}>{user.phone || "+91 98765 00000"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#71717a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={14} color="#ff3b19" /> Date of Birth (DOB):
                </span>
                <strong style={{ color: "#141416", marginLeft: "auto" }}>{user.dob || "1995-08-15"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#71717a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Target size={14} color="#ff3b19" /> Max Capacity:
                </span>
                <strong style={{ color: "#141416", marginLeft: "auto" }}>{user.maxCapacity || 50} leads</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#71717a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={14} color="#ff3b19" /> Joined Date:
                </span>
                <strong style={{ color: "#141416", marginLeft: "auto" }}>{user.createdAt || "Jan 10, 2026"}</strong>
              </div>
            </div>
          </div>

          {/* Assigned Leads Preview Card */}
          <div className="crm-card" style={{ padding: "16px", background: "#ffffff", border: "1px solid #cbd5e1" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Recent Allocated Leads</span>
              <span style={{ fontSize: "0.725rem", color: "#16a34a", fontWeight: 700 }}>Active</span>
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { name: "Rahul Sharma", company: "Rahul Traders", status: "New" },
                { name: "Anjali Gupta", company: "Global Tech Labs", status: "Contacted" },
                { name: "Amit Mehta", company: "Mehta Auto Corp", status: "Follow-up" },
              ].map((l) => (
                <div
                  key={l.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "0.8rem"
                  }}
                >
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>{l.name}</strong>
                    <span style={{ fontSize: "0.725rem", color: "#64748b" }}>{l.company}</span>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #cbd5e1", backgroundColor: "#f8fafc", textAlign: "right" }}>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
            Close Drawer
          </button>
        </div>
      </div>
    </>
  );
};
