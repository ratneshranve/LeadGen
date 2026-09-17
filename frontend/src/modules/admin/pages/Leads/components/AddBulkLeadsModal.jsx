import React, { useState, useEffect } from "react";
import { Plus, CheckSquare, Square } from "lucide-react";
import { Modal } from "../../../../../components/ui/Modal";

const firstNames = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Dev", "Divya", "Gaurav", "Isha",
  "Karan", "Kavya", "Manish", "Meera", "Nikhil", "Pooja", "Pranav", "Radhika",
  "Rohan", "Siddharth", "Sneha", "Tushar", "Varun", "Vidya", "Yash", "Zoya",
  "Abhinav", "Bhavna", "Chirag", "Deepak", "Esha", "Harsh", "Jaya", "Kunal"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Mehta", "Patel", "Singh", "Joshi", "Kulkarni",
  "Reddy", "Nair", "Singhania", "Deshmukh", "Saxena", "Roy", "Malhotra", "Kapoor",
  "Chawla", "Bhasin", "Agarwal", "Rao", "Choudhury", "Bansal", "Iyer", "Thakur"
];

const companySuffixes = [
  "Traders", "Tech Solutions", "Logistics LLP", "Global Retail", "Organics",
  "Auto Corp", "Enterprises", "Industries", "Infotech", "Consulting",
  "Digital Services", "Pharma", "Textiles", "Heavy Machinery", "Ventures"
];

const categories = ["Enterprise", "SMB", "Retail", "Startup"];

// Function to fetch ONLY Active lead sources (excluding inactive or deleted sources)
const getActiveSourcesOnly = () => {
  try {
    const saved = localStorage.getItem("leadflow_mock_sources");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const activeOnly = parsed
          .filter((s) => s.status === "Active")
          .map((s) => s.name);
        if (activeOnly.length > 0) return activeOnly;
      }
    }
  } catch (e) {}

  return ["Google Ads", "Meta Ads", "Website", "Referral", "WhatsApp", "Manual Entry", "LinkedIn"];
};

export const AddBulkLeadsModal = ({ isOpen, onClose, onAddBulkLeads }) => {
  const [count, setCount] = useState(50);
  const [activeSources, setActiveSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const active = getActiveSourcesOnly();
      setActiveSources(active);
      setSelectedSources([]); // 1. Keep checkboxes unfilled by default
      setCount(50);
      setError("");
    }
  }, [isOpen]);

  const isAllSourcesSelected =
    activeSources.length > 0 && selectedSources.length === activeSources.length;

  const handleToggleSelectAllSources = () => {
    if (isAllSourcesSelected) {
      setSelectedSources([]);
    } else {
      setSelectedSources([...activeSources]);
    }
  };

  const handleToggleSingleSource = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const generateRandomLead = (index, chosenSources) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fn} ${ln}`;
    const comp = `${ln} ${companySuffixes[Math.floor(Math.random() * companySuffixes.length)]}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${comp.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`;
    const phone = `+91 ${Math.floor(60000 + Math.random() * 39999)} ${Math.floor(10000 + Math.random() * 89999)}`;

    const src = chosenSources.length > 0
      ? chosenSources[index % chosenSources.length]
      : "Meta Ads";

    const cat = categories[Math.floor(Math.random() * categories.length)];

    return {
      id: `LD-${Date.now()}-${index + 1}`,
      name,
      phone,
      email,
      company: comp,
      source: src,
      status: "New",
      category: cat,
      salesperson: "Unassigned",
      createdDate: "Sep 03, 2026",
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(count, 10);

    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid number of leads (at least 1).");
      return;
    }
    if (num > 500) {
      setError("Maximum limit is 500 leads per bulk batch.");
      return;
    }
    if (selectedSources.length === 0) {
      setError("Please select at least one lead source.");
      return;
    }

    setError("");
    const generated = Array.from({ length: num }, (_, idx) =>
      generateRandomLead(idx, selectedSources)
    );

    onAddBulkLeads(generated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bulk Leads" maxWidth="620px">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Quantity Input & Preset Pills */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
              Number of Leads to Generate & Add <span className="text-req">*</span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="number"
                min="1"
                max="500"
                className={`crm-input ${error && !count ? "input-error" : ""}`}
                style={{ height: "42px", fontSize: "0.95rem", fontWeight: 800, width: "160px" }}
                value={count}
                onChange={(e) => {
                  setCount(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. 56"
              />

              {/* Preset Quick Selection Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {[10, 20, 50, 100, 200].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`crm-btn crm-btn-xs ${Number(count) === num ? "crm-btn-primary" : "crm-btn-secondary"}`}
                    onClick={() => {
                      setCount(num);
                      if (error) setError("");
                    }}
                    style={{ padding: "6px 12px", fontWeight: Number(count) === num ? 800 : 600 }}
                  >
                    {num} Leads
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sources Selection Section (ONLY Active Sources Displayed) */}
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", margin: 0 }}>
                Select Lead Sources <span className="text-req">*</span> ({selectedSources.length} Selected)
              </label>

              <button
                type="button"
                className="crm-btn crm-btn-subtle crm-btn-xs"
                onClick={handleToggleSelectAllSources}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#ff3b19" }}
              >
                {isAllSourcesSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                {isAllSourcesSelected ? "Deselect All" : "Select All Sources"}
              </button>
            </div>

            {/* Checkboxes Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "10px",
                padding: "12px",
                backgroundColor: "#fbf9f4",
                border: "1px solid #ece7dc",
                borderRadius: "10px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {activeSources.map((source) => {
                const isChecked = selectedSources.includes(source);
                return (
                  <label
                    key={source}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      backgroundColor: isChecked ? "#fff1ee" : "#ffffff",
                      border: isChecked ? "1px solid #ff3b19" : "1px solid #ece7dc",
                      borderRadius: "8px",
                      fontSize: "0.825rem",
                      fontWeight: isChecked ? 700 : 500,
                      color: isChecked ? "#ff3b19" : "#334155",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        handleToggleSingleSource(source);
                        if (error) setError("");
                      }}
                      className="crm-checkbox"
                    />
                    <span>{source}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <span className="error-text" style={{ color: "#dc2626", fontSize: "0.8rem", fontWeight: 700 }}>
              {error}
            </span>
          )}

          {/* Footer CTAs (Primary Coral Button) */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="crm-btn crm-btn-primary"
              style={{
                padding: "10px 22px",
                fontSize: "0.875rem",
                fontWeight: 800,
                backgroundColor: "#ff3b19",
                borderColor: "#e63010",
                boxShadow: "0 2px 8px rgba(255, 59, 25, 0.3)"
              }}
            >
              <Plus size={16} /> Add Leads
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
