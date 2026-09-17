import React, { useState } from "react";
import {
  Share2,
  Globe,
  Share,
  Users,
  MessageSquare,
  FileSpreadsheet,
  FolderKanban,
  TrendingUp
} from "lucide-react";
import { CustomSelect } from "../../../../../components/ui/CustomSelect";

export const SourcePerformanceCards = ({
  sources,
}) => {
  const [dateRangeFilter, setDateRangeFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All");

  const getSourceIcon = (name, type) => {
    const n = name.toLowerCase();
    if (n.includes("google")) return <Share2 size={16} className="icon-google" />;
    if (n.includes("meta") || n.includes("facebook")) return <Share size={16} className="icon-meta" />;
    if (n.includes("website") || type === "Website") return <Globe size={16} className="icon-website" />;
    if (n.includes("referral")) return <Users size={16} className="icon-referral" />;
    if (n.includes("whatsapp")) return <MessageSquare size={16} className="icon-whatsapp" />;
    if (n.includes("manual")) return <FileSpreadsheet size={16} className="icon-manual" />;
    if (n.includes("linkedin")) return <Globe size={16} className="icon-linkedin" />;
    return <FolderKanban size={16} className="icon-other" />;
  };

  const filteredSources = sources.filter((s) => {
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="crm-card source-performance-card">
      <div className="card-header-flex">
        <div>
          <h3 className="section-title">
            <TrendingUp size={18} className="text-indigo" /> Source Performance
          </h3>
          <span className="section-subtext">Track lead volume and conversion performance by source.</span>
        </div>

        {/* Filters */}
        <div className="source-filter-toolbar">
          <CustomSelect
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "All", label: "Status: All" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
            style={{ minWidth: "120px" }}
          />
        </div>
      </div>

      <div className="source-performance-list" style={{ marginTop: "16px" }}>
        {filteredSources.map((item) => {
          const isHighest = item.rate >= 18;

          return (
            <div key={item.id} className="source-row-item">
              <div className="source-identity-group">
                <div className="source-icon-wrapper">
                  {getSourceIcon(item.name, item.type)}
                </div>
                <div className="source-name-details">
                  <h4 className="source-fullname">{item.name}</h4>
                  <span className="source-type-tag">{item.type || "Advertising"}</span>
                </div>
              </div>

              <div className="source-metrics-flex">
                <div className="s-metric">
                  <span className="m-val">{item.leads}</span>
                  <span className="m-lbl">Leads</span>
                </div>

                <div className="s-metric">
                  <span className="m-val text-emerald">{item.converted}</span>
                  <span className="m-lbl">Converted</span>
                </div>

                <div className="s-metric">
                  <span className="m-val text-indigo">{item.rate}%</span>
                  <span className="m-lbl">Conv. Rate</span>
                </div>

                <div className="s-progress-container">
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${isHighest ? "fill-primary" : "fill-subtle"}`}
                      style={{ width: `${Math.min(item.rate * 4, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="s-status">
                  <span className={`status-badge-chip ${item.status === "Active" ? "status-active" : "status-inactive"}`}>
                    <span className="status-dot" /> {item.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
