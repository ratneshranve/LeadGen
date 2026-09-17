import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export const CustomSelect = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  icon: Icon,
  className = "",
  style = {},
  buttonStyle = {},
  size = "md", // "sm" | "md"
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) =>
    typeof opt === "object" ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === "object"
      ? selectedOption.label
      : selectedOption
    : value || placeholder;

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", ...style }}
      className={`custom-select-container ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: Icon
            ? isSmall ? "6px 10px 6px 30px" : "10px 14px 10px 38px"
            : isSmall ? "6px 10px" : "10px 14px",
          backgroundColor: "#ffffff",
          border: isOpen ? "1px solid #ff3b19" : "1px solid #ece7dc",
          boxShadow: isOpen ? "0 0 0 3px rgba(255, 59, 25, 0.15)" : "none",
          borderRadius: isSmall ? "9px" : "12px",
          fontSize: isSmall ? "0.8rem" : "0.875rem",
          fontWeight: 600,
          color: value && value !== "All" ? "#141416" : "#64748b",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          textAlign: "left",
          outline: "none",
          minHeight: isSmall ? "36px" : "42px",
          height: isSmall ? "36px" : "auto",
          ...buttonStyle,
        }}
      >
        {Icon && (
          <Icon
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              color: isOpen ? "#ff3b19" : "#a3aed0",
              transition: "color 0.15s ease",
            }}
          />
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: isOpen ? "#ff3b19" : "#71717a",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease, color 0.15s ease",
            flexShrink: 0,
            marginLeft: "8px",
          }}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "100%",
            width: "max-content",
            maxWidth: "260px",
            zIndex: 99999,
            backgroundColor: "#ffffff",
            border: "1px solid #ece7dc",
            borderRadius: "14px",
            boxShadow: "0 12px 32px rgba(20, 20, 22, 0.14)",
            padding: "6px",
            maxHeight: "240px",
            overflowY: "auto",
            animation: "customSelectFadeIn 0.15s ease-out",
          }}
        >
          {options.map((opt) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            const isSelected = optVal === value;

            return (
              <div
                key={optVal}
                onClick={() => handleSelect(optVal)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? "#fff1ee" : "transparent",
                  color: isSelected ? "#ff3b19" : "#141416",
                  cursor: "pointer",
                  transition: "background-color 0.12s ease, color 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "#fff7ed";
                    e.currentTarget.style.color = "#ea580c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#141416";
                  }
                }}
              >
                <span>{optLabel}</span>
                {isSelected && <Check size={15} color="#ff3b19" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
