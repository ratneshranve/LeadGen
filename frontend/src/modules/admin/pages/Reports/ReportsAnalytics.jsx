import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  IndianRupee,
  Download,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Search,
  Loader2,
} from "lucide-react";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { LeadConversionTrendChart } from "./components/LeadConversionTrendChart";
import { LeadsPagination } from "../Leads/components/LeadsPagination";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { reportsApi } from "../../../../api/reportsApi";
import "./ReportsAnalytics.css";

const STATUS_COLORS = {
  New: "#ff3b19",
  Contacted: "#8b5cf6",
  "Follow-up": "#eab308",
  Interested: "#06b6d4",
  Converted: "#22c55e",
  Lost: "#ef4444",
};

const formatINR = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Computes the [from, to] ISO date bounds for the selected quick range.
const getDateBounds = (dateRange) => {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from;
  if (dateRange === "This Week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    from = d.toISOString().split("T")[0];
  } else if (dateRange === "This Year") {
    from = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  }
  return { from, to };
};

export const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState("This Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRep, setSelectedRep] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    const { from, to } = getDateBounds(dateRange);
    setIsLoading(true);
    reportsApi
      .getAll({ from, to, groupBy: dateRange === "This Year" ? "month" : "day" })
      .then((data) => {
        setReport(data);
        setLoadError("");
      })
      .catch((err) => setLoadError(err.message || "Failed to load reports."))
      .finally(() => setIsLoading(false));
  }, [dateRange]);

  const kpi = useMemo(() => {
    const s = report?.summary || {};
    return {
      totalLeads: s.total || 0,
      converted: s.converted || 0,
      rate: `${s.conversionRate || 0}%`,
      revenue: formatINR(s.convertedValue),
    };
  }, [report]);

  const pipeline = useMemo(() => {
    const s = report?.summary || {};
    const total = s.total || 1;
    const stages = [
      { stage: "New", count: s.newLeads || 0 },
      { stage: "Contacted", count: s.contacted || 0 },
      { stage: "Follow-up", count: s.followUp || 0 },
      { stage: "Interested", count: s.interested || 0 },
      { stage: "Converted", count: s.converted || 0 },
      { stage: "Lost", count: s.lost || 0 },
    ];
    return stages.map((st) => ({ ...st, pct: Math.round((st.count / total) * 100), color: STATUS_COLORS[st.stage] }));
  }, [report]);

  const performance = useMemo(() => {
    return (report?.salespersonWise || []).map((sp) => ({
      name: sp.name,
      assigned: sp.total,
      active: sp.active,
      followups: sp.pendingFollowUps,
      converted: sp.converted,
      rate: `${sp.conversionRate}%`,
      revenue: formatINR(sp.totalValue),
    }));
  }, [report]);

  const trendChartData = useMemo(() => {
    return (report?.dateWiseTrend || []).map((t) => {
      const label = dateRange === "This Year"
        ? new Date(t._id.year, t._id.month - 1, 1).toLocaleDateString("en-US", { month: "short" })
        : new Date(t._id.year, t._id.month - 1, t._id.day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        period: label,
        leads: t.total,
        converted: t.converted,
        rate: t.total > 0 ? Number(((t.converted / t.total) * 100).toFixed(1)) : 0,
      };
    });
  }, [report, dateRange]);

  const repOptions = useMemo(() => ["All", ...performance.map((p) => p.name)], [performance]);

  const filteredPerformance = performance.filter((item) => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedRep !== "All" && item.name !== selectedRep) return false;
    return true;
  });

  const paginatedPerformance = filteredPerformance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    if (!report) return;
    const csvContent = "Salesperson,Assigned,Active,Followups,Converted,Conversion Rate,Revenue\n" +
      performance.map((s) => `${s.name},${s.assigned},${s.active},${s.followups},${s.converted},${s.rate},${s.revenue}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crm_performance_${dateRange.toLowerCase().replace(" ", "_")}_${Date.now()}.csv`;
    link.click();

    setToastMessage("Performance report exported successfully");
    setIsToastOpen(true);
  };

  return (
    <div className="reports-page">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      <div className="reports-header-banner">
        <div>
          <p className="page-desc">Analyze lead performance, sales activity and conversion trends.</p>
        </div>

        <div className="header-actions-group">
          <CustomSelect
            size="sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "This Week", label: "This Week" },
              { value: "This Month", label: "This Month" },
              { value: "This Year", label: "This Year" },
            ]}
            style={{ minWidth: "130px" }}
          />

          <button className="crm-btn crm-btn-primary" onClick={handleExport}>
            <Download size={15} /> Export Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 size={24} className="spin-icon" />
        </div>
      ) : loadError ? (
        <div className="crm-card" style={{ padding: 24, color: "#b91c1c", background: "#fef2f2" }}>{loadError}</div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="reports-kpi-grid">
            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #93c5fd", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Total Leads</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{kpi.totalLeads}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>In {dateRange.toLowerCase()}</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                  <Users size={20} />
                </div>
              </div>
            </div>

            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #86efac", boxShadow: "0 4px 14px rgba(34, 197, 94, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Converted Leads</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{kpi.converted}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>Closed-won</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1px solid #fed7aa", boxShadow: "0 4px 14px rgba(249, 115, 22, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Conversion Rate</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{kpi.rate}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>Converted / Total</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" }}>
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1px solid #c7d2fe", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Revenue Won</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{kpi.revenue}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>From converted leads</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "#4338ca", border: "1px solid #c7d2fe" }}>
                  <IndianRupee size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="charts-grid-two">
            <div className="crm-card report-chart-card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)", border: "1px solid #a5f3fc", boxShadow: "0 4px 14px rgba(6, 182, 212, 0.1)" }}>
              <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", borderBottom: "1px solid #7dd3fc" }}>
                <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
                  <LineIcon size={18} className="text-indigo" /> Lead Conversion Trend
                </h3>
                <span className="section-subtext" style={{ color: "#334155", fontWeight: 600 }}>Acquisition vs closures for {dateRange}</span>
              </div>

              <LeadConversionTrendChart dateRange={dateRange} data={trendChartData} />
            </div>

            <div className="crm-card report-chart-card" style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)", border: "1px solid #f5d0fe", boxShadow: "0 4px 14px rgba(217, 70, 239, 0.1)" }}>
              <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)", borderBottom: "1px solid #e9d5ff" }}>
                <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
                  <PieIcon size={18} className="text-indigo" /> Pipeline Distribution
                </h3>
                <span className="section-subtext" style={{ color: "#334155", fontWeight: 600 }}>Status-wise lead volume breakdown</span>
              </div>

              <div className="pipeline-bars-stack">
                {pipeline.map((p) => (
                  <div key={p.stage} className="pipeline-mini-row">
                    <div className="stage-info-label" style={{ color: "#0f172a", fontWeight: 700 }}>
                      <span style={{ color: "#1e293b" }}>{p.stage}</span>
                      <strong style={{ color: "#0f172a" }}>{p.count} leads ({p.pct}%)</strong>
                    </div>
                    <div className="progress-bar-track" style={{ backgroundColor: "#e2e8f0" }}>
                      <div className="progress-bar-fill" style={{ width: `${Math.min(p.pct * 3, 100)}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Performance Section */}
          <div className="crm-card reports-table-card" style={{ background: "linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)", border: "1px solid #fde68a", boxShadow: "0 4px 14px rgba(245, 158, 11, 0.1)" }}>
            <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderBottom: "1px solid #fcd34d" }}>
              <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
                <BarChart3 size={18} className="text-indigo" /> Salesperson Performance
              </h3>
              <span className="section-count-pill" style={{ background: "#78350f", color: "#ffffff" }}>{filteredPerformance.length} Executives</span>
            </div>

            <div className="report-table-toolbar">
              <div className="search-input-wrapper">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="crm-input search-input"
                  placeholder="Search executive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <CustomSelect
                size="sm"
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                options={repOptions.map((s) => ({ value: s, label: s }))}
                style={{ minWidth: "140px" }}
              />
            </div>

            <div className="table-responsive-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Sales Employee</th>
                    <th>Assigned</th>
                    <th>Active</th>
                    <th>Follow-ups</th>
                    <th>Converted</th>
                    <th>Conversion Rate</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPerformance.length > 0 ? (
                    paginatedPerformance.map((row) => (
                      <tr key={row.name}>
                        <td><strong>{row.name}</strong></td>
                        <td>{row.assigned}</td>
                        <td><span className="text-indigo">{row.active}</span></td>
                        <td><span className="text-amber">{row.followups}</span></td>
                        <td><span className="text-emerald">{row.converted}</span></td>
                        <td><strong>{row.rate}</strong></td>
                        <td><strong className="text-emerald">{row.revenue}</strong></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center" style={{ padding: "30px", color: "#64748b" }}>
                        No executive performance records found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredPerformance.length > 0 && (
              <LeadsPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={filteredPerformance.length}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
