import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ScheduleFollowUpModal } from "../../admin/pages/FollowUps/components/ScheduleFollowUpModal";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";
import { getStoredLeads } from "../../admin/pages/Leads/data/leadsMockData";
import {
  Clock,
  Phone,
  MessageSquare,
  Plus,
  Calendar,
  AlertCircle
} from "lucide-react";
import { SalesPagination } from "../../../components/common/SalesPagination";
import "./SalesPages.css";

export const SalesFollowUps = () => {
  const { user } = useAuth();
  const currentSalesperson = user?.name || "Amit Sharma";

  const [activeTab, setActiveTab] = useState("All");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Load followups from localStorage or defaults, strictly scoped to this sales employee
  const [followups, setFollowups] = useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_mock_followups");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userFollowups = parsed.filter(
            (f) => !f.assignedTo || f.assignedTo.trim().toLowerCase() === currentSalesperson.trim().toLowerCase()
          );
          if (userFollowups.length > 0) return userFollowups;
        }
      }
    } catch (e) {}

    return [
      { id: "fu-1", leadName: "Rahul Sharma", company: "Rahul Traders", type: "Call", phone: "+91 98765 43210", date: "Sep 02, 2026", time: "16:00", dateLabel: "Today", status: "Pending", notes: "Product requirement call & pricing options discussion.", assignedTo: currentSalesperson },
      { id: "fu-2", leadName: "Suresh Patel", company: "Patel Chemicals", type: "Call", phone: "+91 98765 11111", date: "Sep 02, 2026", time: "14:30", dateLabel: "Today", status: "Pending", notes: "Pricing negotiation and final timeline discussion.", assignedTo: currentSalesperson },
      { id: "fu-3", leadName: "Vikram Aditya", company: "Aditya Enterprises", type: "Meeting", phone: "+91 98765 22222", date: "Sep 03, 2026", time: "11:30", dateLabel: "Upcoming", status: "Pending", notes: "In-person product demonstration and team pitch.", assignedTo: currentSalesperson },
      { id: "fu-4", leadName: "Amit Mehta", company: "Mehta Auto Corp", type: "WhatsApp", phone: "+91 98765 33333", date: "Sep 03, 2026", time: "10:00", dateLabel: "Upcoming", status: "Pending", notes: "Send updated machinery catalog and quotation PDF.", assignedTo: currentSalesperson },
    ];
  });

  // Sync followups state changes to localStorage so other modules also receive them
  useEffect(() => {
    try {
      const saved = localStorage.getItem("leadflow_mock_followups");
      const allFollowups = saved ? JSON.parse(saved) : [];
      const otherFollowups = allFollowups.filter(
        (f) => f.assignedTo && f.assignedTo.trim().toLowerCase() !== currentSalesperson.trim().toLowerCase()
      );
      localStorage.setItem("leadflow_mock_followups", JSON.stringify([...followups, ...otherFollowups]));
    } catch (e) {}
  }, [followups, currentSalesperson]);

  // Strictly filter leads belonging ONLY to this logged-in sales employee (e.g. Amit Sharma)
  const myAssignedLeads = useMemo(() => {
    const all = getStoredLeads();
    return all.filter((l) => {
      const rep = l.salesperson || l.assignedTo || "";
      return rep.trim().toLowerCase() === currentSalesperson.trim().toLowerCase();
    });
  }, [currentSalesperson]);

  // Schedule follow-up action
  const handleConfirmSchedule = (newFollowup) => {
    let formattedDate = "Sep 03, 2026";
    let dateLabel = "Today";

    if (newFollowup.date) {
      try {
        const [y, m, d] = newFollowup.date.split("-").map(Number);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        formattedDate = `${months[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        if (newFollowup.date === todayStr || newFollowup.date === "2026-09-03") {
          dateLabel = "Today";
        } else if (newFollowup.date > todayStr) {
          dateLabel = "Upcoming";
        } else {
          dateLabel = "Today";
        }
      } catch (e) {
        formattedDate = newFollowup.date;
      }
    }

    const newItem = {
      id: `fu-${Date.now()}`,
      leadId: newFollowup.leadId,
      leadName: newFollowup.leadName,
      company: newFollowup.company,
      type: newFollowup.type || "Call",
      notes: newFollowup.notes || "Follow-up scheduled.",
      assignedTo: currentSalesperson,
      date: formattedDate,
      dateLabel: dateLabel,
      time: newFollowup.time || "15:00",
      status: "Pending",
      phone: newFollowup.phone || "",
    };

    // Append new item at top and save immediately
    setFollowups((prev) => [newItem, ...prev]);

    // Ensure the new follow-up is immediately visible on screen
    setActiveTab("All");
    setToastMessage(`Follow-up scheduled for ${newFollowup.leadName}`);
    setIsToastOpen(true);
    setIsScheduleOpen(false);
  };

  // Filter items
  const filtered = followups.filter((item) => {
    if (activeTab === "Today") return item.dateLabel === "Today";
    if (activeTab === "Upcoming") return item.dateLabel === "Upcoming";
    return true;
  });

  // Pagination (Fixed 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const paginatedFollowups = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const todayCount = followups.filter((f) => f.dateLabel === "Today").length;
  const upcomingCount = followups.filter((f) => f.dateLabel === "Upcoming").length;

  return (
    <div className="sales-page-container">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      {/* Schedule Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        leadsList={myAssignedLeads}
        onConfirm={handleConfirmSchedule}
      />

      {/* Header with New Follow-up CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Follow-up Schedule
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Tasks assigned to you ({followups.length})
          </span>
        </div>

        <button
          type="button"
          className="crm-btn crm-btn-primary"
          onClick={() => setIsScheduleOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "9999px",
            fontWeight: 700,
            padding: "9px 18px",
            fontSize: "0.8rem",
            backgroundColor: "#ff3b19",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 14px rgba(255, 59, 25, 0.28)",
            cursor: "pointer"
          }}
        >
          <Plus size={15} /> Schedule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="sales-pill-carousel" style={{ marginTop: "4px" }}>
        {[
          { key: "All", label: "All Tasks", count: followups.length },
          { key: "Today", label: "Today", count: todayCount },
          { key: "Upcoming", label: "Upcoming", count: upcomingCount },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`sales-filter-chip ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="sales-chip-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Follow-up Cards List */}
      <div className="sales-lead-cards-list">
        {filtered.length > 0 ? (
          paginatedFollowups.map((item) => {
            return (
              <div
                key={item.id}
                className="sales-mobile-lead-card"
                style={{
                  borderLeft: "4px solid #ff3b19"
                }}
              >
                <div className="lead-card-header">
                  <div className="lead-card-info">
                    <h4 className="lead-card-name">
                      {item.leadName}
                    </h4>
                    <span className="lead-card-company">{item.company}</span>
                  </div>

                  <span
                    className={
                      item.dateLabel === "Today"
                        ? "mobile-badge mobile-badge-contacted"
                        : "mobile-badge mobile-badge-new"
                    }
                  >
                    {item.dateLabel || "Scheduled"}
                  </span>
                </div>

                {item.notes && (
                  <p style={{ fontSize: "0.775rem", color: "#0f172a", fontWeight: 600, margin: "2px 0 0 0", fontStyle: "italic", background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #fed7aa" }}>
                    "{item.notes}"
                  </p>
                )}

                <div className="lead-card-meta-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="lead-card-meta-item">
                    <Calendar size={11} /> {item.date} · {item.time}
                  </span>
                  <span className="lead-card-meta-item" style={{ fontWeight: 700 }}>
                    {item.type}
                  </span>
                </div>

                {/* Actions Row - Only Call and WhatsApp (Mark as Done removed) */}
                <div className="lead-card-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: "6px" }}>
                  <div className="lead-card-action-btns" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.phone && (
                      <>
                        <a
                          href={`tel:${item.phone}`}
                          className="btn-mobile-call"
                          title="Call"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                            fontWeight: 600
                          }}
                        >
                          <Phone size={13} /> Call
                        </a>
                        <a
                          href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-mobile-wa"
                          title="WhatsApp"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                            fontWeight: 600
                          }}
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
              borderRadius: "16px",
              padding: "40px 20px",
              textAlign: "center",
              border: "1.5px dashed #fdba74"
            }}
          >
            <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>No follow-ups found</p>
            <span style={{ fontSize: "0.775rem", color: "#334155", fontWeight: 600 }}>
              All clear! You have no tasks in this tab.
            </span>
          </div>
        )}
      </div>

      {/* Responsive Pagination - Only < 1 2 > buttons */}
      <SalesPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        totalItems={filtered.length}
      />
    </div>
  );
};
