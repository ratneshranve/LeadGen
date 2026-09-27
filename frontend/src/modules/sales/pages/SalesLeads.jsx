import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Phone,
  MessageSquare,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { SalesLeadDrawer } from "./SalesLeadDrawer";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";
import { SalesPagination } from "../../../components/common/SalesPagination";
import { leadsApi } from "../../../api/leadsApi";
import { adaptLead } from "../../../utils/leadAdapter";
import "./SalesPages.css";

export const SalesLeads = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || searchParams.get("tab");

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    setIsLoading(true);
    // Backend scopes this automatically to the logged-in salesperson's own leads
    // (lead.service.js:getAllLeads - assignedTo/createdBy match).
    return leadsApi
      .getAll({ limit: 200 })
      .then((data) => setLeads((data.leads || []).map(adaptLead)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (statusParam) setActiveTab(statusParam);
  }, [statusParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const filterTabs = ["All", "Active", "New", "Contacted", "Follow-up", "Interested", "Converted", "Lost"];

  const filteredLeads = leads.filter((lead) => {
    const st = lead.status || "New";

    if (activeTab === "Active") {
      if (st === "Lost") return false;
    } else if (activeTab !== "All" && st !== activeTab) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = lead.name ? lead.name.toLowerCase().includes(q) : false;
      const matchCompany = lead.company ? lead.company.toLowerCase().includes(q) : false;
      const matchPhone = lead.phone ? lead.phone.includes(q) : false;
      if (!matchName && !matchCompany && !matchPhone) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenLead = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || "new").toLowerCase().replace(/[^a-z]/g, "");
    return `mobile-badge mobile-badge-${s}`;
  };

  return (
    <div className="sales-page-container">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <SalesLeadDrawer
        isOpen={isModalOpen && selectedLead !== null}
        onClose={() => {
          setIsModalOpen(false);
          fetchLeads(); // pick up any score/status changes made while the drawer was open
        }}
        lead={selectedLead}
      />

      {/* Search Bar */}
      <div className="sales-mobile-search-box">
        <Search size={16} className="sales-search-left-icon" />
        <input
          type="text"
          className="sales-mobile-search-input"
          style={{ paddingLeft: "42px", paddingRight: "36px" }}
          placeholder="Search by name, company, phone..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        {searchQuery && (
          <button type="button" className="sales-search-clear-btn" onClick={() => setSearchQuery("")}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Horizontal Status Chips Carousel */}
      <div className="sales-pill-carousel">
        {filterTabs.map((tab) => {
          const count = tab === "All"
            ? leads.length
            : tab === "Active"
            ? leads.filter((l) => l.status !== "Lost").length
            : leads.filter((l) => l.status === tab).length;

          return (
            <button
              key={tab}
              type="button"
              className={`sales-filter-chip ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              <span>{tab}</span>
              <span className="sales-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
          Showing {filteredLeads.length} Lead{filteredLeads.length !== 1 ? "s" : ""}
        </span>
        {activeTab !== "All" && (
          <button
            type="button"
            onClick={() => setActiveTab("All")}
            style={{ background: "none", border: "none", color: "#ff3b19", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={24} className="spin-icon" />
        </div>
      ) : (
        <div className="sales-lead-cards-list">
          {paginatedLeads.length > 0 ? (
            paginatedLeads.map((lead) => {
              const leadStage = lead.status || "New";
              const initials = lead.name ? lead.name.split(" ").map((n) => n[0]).join("") : "L";

              return (
                <div key={lead.id} className="sales-mobile-lead-card" onClick={() => handleOpenLead(lead)}>
                  <div className="lead-card-header">
                    <div className="lead-card-avatar-group">
                      <div className="lead-card-avatar">{initials}</div>
                      <div className="lead-card-info">
                        <h4 className="lead-card-name">{lead.name}</h4>
                        <span className="lead-card-company">{lead.company || "Direct Prospect"}</span>
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(leadStage)}>{leadStage}</span>
                  </div>

                  <div className="lead-card-meta-row">
                    {lead.source && <span className="lead-card-meta-item">{lead.source}</span>}
                    {lead.score !== null && lead.score !== undefined && (
                      <span className="lead-card-meta-item" style={{ background: "#faf5ff", color: "#7e22ce" }}>
                        Score: {lead.score}/100
                      </span>
                    )}
                  </div>

                  <div className="lead-card-actions">
                    <span style={{ fontSize: "0.725rem", color: "#94a3b8" }}>Tap card for details</span>

                    <div className="lead-card-action-btns">
                      {lead.phone && (
                        <>
                          <a href={`tel:${lead.phone}`} className="btn-mobile-call" onClick={(e) => e.stopPropagation()} title="Call Lead">
                            <Phone size={13} /> Call
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-mobile-wa"
                            onClick={(e) => e.stopPropagation()}
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn-mobile-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLead(lead);
                        }}
                      >
                        <ChevronRight size={14} />
                      </button>
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
              <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>No leads found</p>
              <span style={{ fontSize: "0.775rem", color: "#334155", fontWeight: 600 }}>
                Try adjusting your search query or status filter.
              </span>
            </div>
          )}
        </div>
      )}

      <SalesPagination currentPage={currentPage} setCurrentPage={setCurrentPage} pageSize={pageSize} totalItems={filteredLeads.length} />
    </div>
  );
};
