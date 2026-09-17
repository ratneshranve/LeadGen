import React, { useState } from "react";
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
  FolderX,
  ArrowLeft
} from "lucide-react";
import { salespersonOptions } from "../Leads/data/leadsMockData";
import { ToastNotification } from "../AddLead/components/ToastNotification";
import { LeadConversionTrendChart } from "./components/LeadConversionTrendChart";
import { LeadsPagination } from "../Leads/components/LeadsPagination";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import "./ReportsAnalytics.css";

export const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState("This Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRep, setSelectedRep] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const analyticsDataMap = {
    "This Week": {
      kpi: {
        totalLeads: "42",
        totalLeadsChange: "+5.2% vs previous week",
        converted: "7",
        convertedChange: "+3.1% growth rate",
        rate: "16.6%",
        rateChange: "+1.8% efficiency gain",
        revenue: "₹4.2L",
        revenueChange: "+8.4% revenue increase",
      },
      pipeline: [
        { stage: "New", count: 8, pct: 19, color: "#ff3b19" },
        { stage: "Contacted", count: 12, pct: 28, color: "#8b5cf6" },
        { stage: "Follow-up", count: 10, pct: 24, color: "#eab308" },
        { stage: "Interested", count: 5, pct: 12, color: "#06b6d4" },
        { stage: "Converted", count: 7, pct: 17, color: "#22c55e" },
        { stage: "Lost", count: 3, pct: 7, color: "#ef4444" },
      ],
      performance: [
        { name: "Amit Sharma", assigned: 10, active: 6, followups: 2, converted: 2, rate: "20.0%", revenue: "₹1.2L" },
        { name: "Neha Verma", assigned: 12, active: 7, followups: 3, converted: 2, rate: "16.6%", revenue: "₹1.4L" },
        { name: "Rahul Mehta", assigned: 11, active: 6, followups: 2, converted: 2, rate: "18.1%", revenue: "₹1.1L" },
        { name: "Priya Singh", assigned: 9, active: 5, followups: 1, converted: 1, rate: "11.1%", revenue: "₹0.5L" },
      ],
      hasData: true,
    },
    "This Month": {
      kpi: {
        totalLeads: "184",
        totalLeadsChange: "+12.5% vs previous period",
        converted: "24",
        convertedChange: "+8.2% growth rate",
        rate: "13.0%",
        rateChange: "+2.1% efficiency gain",
        revenue: "₹18.6L",
        revenueChange: "+14.8% revenue increase",
      },
      pipeline: [
        { stage: "New", count: 32, pct: 17, color: "#ff3b19" },
        { stage: "Contacted", count: 45, pct: 24, color: "#8b5cf6" },
        { stage: "Follow-up", count: 38, pct: 21, color: "#eab308" },
        { stage: "Interested", count: 28, pct: 15, color: "#06b6d4" },
        { stage: "Converted", count: 24, pct: 13, color: "#22c55e" },
        { stage: "Lost", count: 17, pct: 10, color: "#ef4444" },
      ],
      performance: [
        { name: "Amit Sharma", assigned: 42, active: 28, followups: 5, converted: 6, rate: "14.3%", revenue: "₹4.8L" },
        { name: "Neha Verma", assigned: 38, active: 24, followups: 4, converted: 8, rate: "21.1%", revenue: "₹6.2L" },
        { name: "Rahul Mehta", assigned: 46, active: 31, followups: 7, converted: 9, rate: "19.5%", revenue: "₹7.1L" },
        { name: "Priya Singh", assigned: 35, active: 22, followups: 3, converted: 6, rate: "17.1%", revenue: "₹4.5L" },
      ],
      hasData: true,
    },
    "This Year": {
      kpi: {
        totalLeads: "1,420",
        totalLeadsChange: "+24.1% vs previous year",
        converted: "215",
        convertedChange: "+18.6% growth rate",
        rate: "15.1%",
        rateChange: "+3.5% efficiency gain",
        revenue: "₹1.42Cr",
        revenueChange: "+28.4% revenue increase",
      },
      pipeline: [
        { stage: "New", count: 280, pct: 20, color: "#ff3b19" },
        { stage: "Contacted", count: 390, pct: 27, color: "#8b5cf6" },
        { stage: "Follow-up", count: 310, pct: 22, color: "#eab308" },
        { stage: "Interested", count: 225, pct: 16, color: "#06b6d4" },
        { stage: "Converted", count: 215, pct: 15, color: "#22c55e" },
        { stage: "Lost", count: 150, pct: 10, color: "#ef4444" },
      ],
      performance: [
        { name: "Amit Sharma", assigned: 340, active: 180, followups: 25, converted: 52, rate: "15.2%", revenue: "₹38.5L" },
        { name: "Neha Verma", assigned: 380, active: 195, followups: 30, converted: 64, rate: "16.8%", revenue: "₹44.2L" },
        { name: "Rahul Mehta", assigned: 410, active: 210, followups: 35, converted: 58, rate: "14.1%", revenue: "₹39.1L" },
        { name: "Priya Singh", assigned: 290, active: 150, followups: 20, converted: 41, rate: "14.1%", revenue: "₹28.2L" },
      ],
      hasData: true,
    },
  };

  const currentDataset = analyticsDataMap[dateRange] || analyticsDataMap["This Month"];

  const filteredPerformance = (currentDataset.performance || []).filter((item) => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedRep !== "All" && item.name !== selectedRep) return false;
    return true;
  });

  const paginatedPerformance = filteredPerformance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    if (!currentDataset.hasData) {
      setToastMessage("No data available to export for selected period.");
      setIsToastOpen(true);
      return;
    }
    const csvContent = "Salesperson,Assigned,Active,Followups,Converted,Conversion Rate,Revenue\n" +
      (currentDataset.performance || []).map((s) => `${s.name},${s.assigned},${s.active},${s.followups},${s.converted},${s.rate},${s.revenue}`).join("\n");
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

      {/* Header Banner */}
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

      {/* Conditional Rendering: If No Data found for selected period */}
      {!currentDataset.hasData ? (
        <div className="crm-card no-data-card" style={{ padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <FolderX size={32} />
          </div>
          <div style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              No Data Available for {dateRange}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
              There are no lead activity records, sales conversions, or revenue performance logged for <strong>{dateRange}</strong>.
            </p>
          </div>
          <button
            type="button"
            className="crm-btn crm-btn-primary"
            onClick={() => setDateRange("This Month")}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px" }}
          >
            <ArrowLeft size={16} /> Back to This Month
          </button>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="reports-kpi-grid">
            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #93c5fd", boxShadow: "0 4px 14px rgba(59, 130, 246, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Total Leads</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{currentDataset.kpi.totalLeads}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>{currentDataset.kpi.totalLeadsChange}</span>
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
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{currentDataset.kpi.converted}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>{currentDataset.kpi.convertedChange}</span>
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
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{currentDataset.kpi.rate}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>{currentDataset.kpi.rateChange}</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" }}>
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            <div className="crm-card overview-stat-card" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "1px solid #c7d2fe", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.12)" }}>
              <div className="stat-card-inner">
                <div className="stat-info">
                  <span className="stat-label" style={{ color: "#334155", fontWeight: 700 }}>Revenue Generated</span>
                  <div className="stat-value" style={{ color: "#0f172a", fontWeight: 900 }}>{currentDataset.kpi.revenue}</div>
                  <span className="stat-subtext" style={{ color: "#166534", fontWeight: 700 }}>{currentDataset.kpi.revenueChange}</span>
                </div>
                <div className="stat-icon-wrapper" style={{ backgroundColor: "#ede9fe", color: "#4338ca", border: "1px solid #c7d2fe" }}>
                  <IndianRupee size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="charts-grid-two">
            {/* Chart 1: Lead Conversion Trend */}
            <div className="crm-card report-chart-card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)", border: "1px solid #a5f3fc", boxShadow: "0 4px 14px rgba(6, 182, 212, 0.1)" }}>
              <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", borderBottom: "1px solid #7dd3fc" }}>
                <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
                  <LineIcon size={18} className="text-indigo" /> Lead Conversion Trend
                </h3>
                <span className="section-subtext" style={{ color: "#334155", fontWeight: 600 }}>Acquisition vs closures for {dateRange}</span>
              </div>

              <LeadConversionTrendChart dateRange={dateRange} />
            </div>

            {/* Chart 2: Pipeline Distribution */}
            <div className="crm-card report-chart-card" style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)", border: "1px solid #f5d0fe", boxShadow: "0 4px 14px rgba(217, 70, 239, 0.1)" }}>
              <div className="card-header-flex" style={{ background: "linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)", borderBottom: "1px solid #e9d5ff" }}>
                <h3 className="section-title" style={{ color: "#0f172a", fontWeight: 800 }}>
                  <PieIcon size={18} className="text-indigo" /> Pipeline Distribution
                </h3>
                <span className="section-subtext" style={{ color: "#334155", fontWeight: 600 }}>Stage-wise lead volume breakdown</span>
              </div>

              <div className="pipeline-bars-stack">
                {(currentDataset.pipeline || []).map((p) => (
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

            {/* Filters */}
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
                options={salespersonOptions.map((s) => ({ value: s, label: s }))}
                style={{ minWidth: "140px" }}
              />
            </div>

            {/* Table */}
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

            {/* Pagination Controls */}
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
