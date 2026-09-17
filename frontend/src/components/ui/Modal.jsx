import React from "react";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "560px" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "16px"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "var(--radius-md)",
        width: "100%",
        maxWidth: maxWidth,
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-color)",
        animation: "modalFadeIn 0.2s ease-out"
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-app)"
        }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
