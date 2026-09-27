import React, { useState, useEffect, useCallback } from "react";
import { ScheduleFollowUpModal } from "../../admin/pages/FollowUps/components/ScheduleFollowUpModal";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";
import {
  Phone,
  MessageSquare,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";
import { SalesPagination } from "../../../components/common/SalesPagination";
import { followupsApi } from "../../../api/followupsApi";
import { leadsApi } from "../../../api/leadsApi";
import { adaptFollowUp } from "../../../utils/followupAdapter";
import { adaptLead } from "../../../utils/leadAdapter";
import "./SalesPages.css";

export const SalesFollowUps = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myAssignedLeads, setMyAssignedLeads] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastOpen(true);
  };

  const fetchFollowups = useCallback(() => {
    setIsLoading(true);
    // Backend scopes this to the logged-in salesperson's own follow-ups automatically.
    return followupsApi
      .getAll({ limit: 200 })
      .then((data) => setFollowups((data.followUps || []).map(adaptFollowUp)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchFollowups();
    leadsApi.getAll({ limit: 200 }).then((data) => setMyAssignedLeads((data.leads || []).map(adaptLead))).catch(() => {});
  }, [fetchFollowups]);

  const handleConfirmSchedule = (newFollowup) => {
    const lead = myAssignedLeads.find((l) => l.id === newFollowup.leadId);
    if (!lead) {
      showToast("Please select a valid assigned lead.");
      return;
    }
    const scheduledAt = new Date(`${newFollowup.date}T${newFollowup.time}`);

    followupsApi
      .create({
        leadId: lead.id,
        assignedTo: lead.assignedTo,
        type: newFollowup.type,
        scheduledAt: scheduledAt.toISOString(),
        notes: newFollowup.notes,
      })
      .then((created) => {
        setFollowups((prev) => [adaptFollowUp(created), ...prev]);
        setActiveTab("All");
        showToast(`Follow-up scheduled for ${lead.name}`);
        setIsScheduleOpen(false);
      })
      .catch((err) => showToast(err.message || "Failed to schedule follow-up."));
  };

  const filtered = followups.filter((item) => {
    if (activeTab === "Today") return item.dateLabel === "Today";
    if (activeTab === "Upcoming") return item.dateLabel === "Upcoming" || item.dateLabel === "Tomorrow";
    return true;
  });

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
  const upcomingCount = followups.filter((f) => f.dateLabel === "Upcoming" || f.dateLabel === "Tomorrow").length;

  return (
    <div className="sales-page-container">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <ScheduleFollowUpModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        leadsList={myAssignedLeads}
        onConfirm={handleConfirmSchedule}
      />

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
            cursor: "pointer",
          }}
        >
          <Plus size={15} /> Schedule
        </button>
      </div>

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

      <div className="sales-lead-cards-list">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={24} className="spin-icon" />
          </div>
        ) : filtered.length > 0 ? (
          paginatedFollowups.map((item) => {
            return (
              <div key={item.id} className="sales-mobile-lead-card" style={{ borderLeft: "4px solid #ff3b19" }}>
                <div className="lead-card-header">
                  <div className="lead-card-info">
                    <h4 className="lead-card-name">{item.leadName}</h4>
                    <span className="lead-card-company">{item.company}</span>
                  </div>

                  <span className={item.dateLabel === "Today" ? "mobile-badge mobile-badge-contacted" : "mobile-badge mobile-badge-new"}>
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

                <div className="lead-card-actions" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: "6px" }}>
                  <div className="lead-card-action-btns" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.phone && (
                      <>
                        <a
                          href={`tel:${item.phone}`}
                          className="btn-mobile-call"
                          title="Call"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "0.75rem", borderRadius: "8px", fontWeight: 600 }}
                        >
                          <Phone size={13} /> Call
                        </a>
                        <a
                          href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-mobile-wa"
                          title="WhatsApp"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "0.75rem", borderRadius: "8px", fontWeight: 600 }}
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
              border: "1.5px dashed #fdba74",
            }}
          >
            <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>No follow-ups found</p>
            <span style={{ fontSize: "0.775rem", color: "#334155", fontWeight: 600 }}>
              All clear! You have no tasks in this tab.
            </span>
          </div>
        )}
      </div>

      <SalesPagination currentPage={currentPage} setCurrentPage={setCurrentPage} pageSize={pageSize} totalItems={filtered.length} />
    </div>
  );
};
