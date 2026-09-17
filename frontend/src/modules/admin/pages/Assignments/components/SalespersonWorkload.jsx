import React, { useState, useMemo, useEffect } from "react";
import { ShieldCheck, Search, ArrowUpDown, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";

export const SalespersonWorkload = ({ repsWorkload }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("max_leads");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const maxCapacity = 50; // Capacity benchmark limit per salesperson

  const getInitials = (name) => {
    if (!name) return "SP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Filter & Sort Salesperson Workload List
  const filteredAndSortedReps = useMemo(() => {
    return repsWorkload
      .filter((rep) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const matchName = rep.name ? rep.name.toLowerCase().includes(query) : false;
        const matchEmail = rep.email ? rep.email.toLowerCase().includes(query) : false;
        const matchPhone = rep.phone ? rep.phone.toLowerCase().includes(query) : false;
        const matchRole = rep.role ? rep.role.toLowerCase().includes(query) : false;

        return matchName || matchEmail || matchPhone || matchRole;
      })
      .sort((a, b) => {
        if (sortOption === "max_leads") {
          return b.assigned - a.assigned; // Highest / Max Leads First
        }
        if (sortOption === "min_leads") {
          return a.assigned - b.assigned; // Lowest / Min Leads First
        }
        if (sortOption === "name_asc") {
          return a.name.localeCompare(b.name); // Name A-Z
        }
        if (sortOption === "name_desc") {
          return b.name.localeCompare(a.name); // Name Z-A
        }
        if (sortOption === "workload_pct") {
          return b.assigned - a.assigned; // Workload % Highest First
        }
        return 0;
      });
  }, [repsWorkload, searchQuery, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption, repsWorkload.length]);

  const totalItems = filteredAndSortedReps.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReps = filteredAndSortedReps.slice(startIndex, startIndex + pageSize);

  const startItem = totalItems === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="crm-card workload-section-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Header Row */}
      <div className="card-header-flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 className="section-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#141416", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} className="text-indigo" color="#ff3b19" /> Sales Employee Workload Table
          </h3>
          <span className="section-subtext" style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>
            Capacity distribution and lead workflow tracking across team ({filteredAndSortedReps.length} sales employees)
          </span>
        </div>

        {/* Toolbar Controls: Search & Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div className="search-input-wrapper" style={{ position: "relative", minWidth: "260px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              className="crm-input"
              style={{ paddingLeft: "36px", height: "36px", fontSize: "0.8rem" }}
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Select Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowUpDown size={14} color="#64748b" />
            <select
              className="crm-input"
              style={{ height: "36px", fontSize: "0.8rem", paddingRight: "28px" }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="max_leads">Max Leads First (Highest Workload)</option>
              <option value="min_leads">Min Leads First (Lowest Workload)</option>
              <option value="workload_pct">Workload % (Highest First)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workload Data Table Container */}
      <div className="table-responsive-container" style={{ border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden" }}>
        <table className="crm-table workload-table">
          <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
            <tr>
              <th style={{ width: "240px", padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>SALES EMPLOYEE</th>
              <th style={{ width: "130px", padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>ASSIGNED LEADS</th>
              <th style={{ width: "120px", padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>ACTIVE LEADS</th>
              <th style={{ width: "120px", padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>FOLLOW-UPS</th>
              <th style={{ width: "120px", padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>CONVERTED</th>
              <th style={{ width: "240px", padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>WORKLOAD LEVEL</th>
              <th style={{ width: "100px", padding: "12px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReps.length > 0 ? (
              paginatedReps.map((rep) => {
                const percentage = Math.min(Math.round((rep.assigned / maxCapacity) * 100), 100);

                return (
                  <tr key={rep.id || rep.name} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s ease" }}>
                    {/* Salesperson Contact Profile Cell */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #27272a 0%, #141416 100%)",
                            color: "#ffffff",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(20, 20, 22, 0.18)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            flexShrink: 0
                          }}
                        >
                          {getInitials(rep.name)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                            {rep.name}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Mail size={11} color="#94a3b8" /> {rep.email || "rep@leadflow.com"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Leads Count */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          backgroundColor: "#fff1ee",
                          color: "#ff3b19",
                          borderRadius: "12px",
                          border: "1px solid #ffd2c7"
                        }}
                      >
                        {rep.assigned} leads
                      </span>
                    </td>

                    {/* Active Leads */}
                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#ea580c", fontSize: "0.875rem" }}>
                      {rep.active}
                    </td>

                    {/* Follow-ups */}
                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#d97706", fontSize: "0.875rem" }}>
                      {rep.followups}
                    </td>

                    {/* Converted Deals */}
                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#16a34a", fontSize: "0.875rem" }}>
                      {rep.converted}
                    </td>

                    {/* Workload Level Fill Bar */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                          <span>Workload Level</span>
                          <span style={{ color: "#ff3b19" }}>{percentage}% ({rep.assigned}/{maxCapacity})</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "#ece7dc", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              backgroundColor: "#ff3b19",
                              borderRadius: "4px",
                              transition: "width 0.3s ease"
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.725rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: rep.status === "Inactive" ? "#fef2f2" : "#f0fdf4",
                          color: rep.status === "Inactive" ? "#dc2626" : "#16a34a",
                          border: rep.status === "Inactive" ? "1px solid #fecdd3" : "1px solid #bbf7d0"
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }} />
                        {rep.status || "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                  No salesperson matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar for Workload Table */}
      <div className="pagination-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
        <div className="pagination-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="pagination-info" style={{ fontSize: "0.825rem", color: "#64748b" }}>
            Showing <strong style={{ color: "#0f172a" }}>{startItem}-{endItem}</strong> of <strong style={{ color: "#0f172a" }}>{totalItems}</strong> salespersons
          </span>

          <div className="page-size-selector" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.825rem", color: "#64748b" }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="crm-input"
              style={{ height: "32px", fontSize: "0.8rem", padding: "0 24px 0 8px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="pagination-right" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            className="crm-btn crm-btn-secondary crm-btn-xs"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            title="Previous Page"
            style={{ padding: "6px 10px", opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            <ChevronLeft size={15} /> Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                className={`crm-btn crm-btn-xs ${currentPage === pageNum ? "crm-btn-primary" : "crm-btn-secondary"}`}
                onClick={() => setCurrentPage(pageNum)}
                style={{ padding: "4px 10px", minWidth: "30px", fontWeight: currentPage === pageNum ? 800 : 500 }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="crm-btn crm-btn-secondary crm-btn-xs"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Next Page"
            style={{ padding: "6px 10px", opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
