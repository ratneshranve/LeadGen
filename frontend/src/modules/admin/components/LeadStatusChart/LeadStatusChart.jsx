import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Layers, Share2 } from "lucide-react";
import {
  leadStatusDistributionByDateRange,
  leadSourcesData,
} from "../../data/dashboardMockData";
import "./LeadStatusChart.css";

// Clean Light Frosted Tooltip showing ONLY pipeline stage data
const CustomPipelineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid #ffd2c7",
          borderRadius: "14px",
          padding: "10px 14px",
          boxShadow: "0 12px 28px -4px rgba(0, 0, 0, 0.12)",
          color: "#141416",
          fontSize: "0.8rem",
          minWidth: "160px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "5px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: data.color || "#ff3b19",
              boxShadow: `0 0 6px ${data.color || "#ff3b19"}`,
            }}
          />
          <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>
            {data.stage}
          </strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
              Total Leads:
            </span>
            <strong style={{ color: "#ff3b19", fontSize: "0.95rem" }}>
              {data.count.toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
              Distribution:
            </span>
            <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.75rem" }}>
              {data.percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LeadStatusChart = ({ dateRange = "this_month" }) => {
  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "sources"
  const [hoveredStage, setHoveredStage] = useState(null);

  const currentDistribution = useMemo(() => {
    return (
      leadStatusDistributionByDateRange[dateRange] ||
      leadStatusDistributionByDateRange.this_month
    );
  }, [dateRange]);

  // Direct Pipeline Stages Data for the Area Chart
  const pipelineChartData = useMemo(() => {
    return currentDistribution.map((item) => ({
      stage: item.status,
      count: item.count,
      percentage: item.percentage,
      color: item.color,
    }));
  }, [currentDistribution]);

  return (
    <div className="animated-dashboard-chart group/animated-card">
      {/* 1. Card Header with Title and Tabs */}
      <div className="chart-light-header">
        <div>
          <h2 className="chart-light-title">Lead Status Overview</h2>
          <p className="chart-light-subtitle">
            Pipeline distribution across conversion stages
          </p>
        </div>

        <div className="chart-light-tabs">
          <button
            type="button"
            className={`chart-light-tab-btn ${activeTab === "pipeline" ? "active" : ""}`}
            onClick={() => setActiveTab("pipeline")}
          >
            <Layers size={13} /> Pipeline Stages
          </button>
          <button
            type="button"
            className={`chart-light-tab-btn ${activeTab === "sources" ? "active" : ""}`}
            onClick={() => setActiveTab("sources")}
          >
            <Share2 size={13} /> Lead Sources
          </button>
        </div>
      </div>

      {/* 2. Animated Curved Area Chart plotting ONLY pipeline stages */}
      <div className="chart-area-stage">
        <div style={{ width: "100%", height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={pipelineChartData}
              margin={{ top: 16, right: 18, left: -22, bottom: 4 }}
            >
              <defs>
                <linearGradient id="pipelineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b19" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#ff3b19" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              {/* Dotted Subtle Grid Lines blending with light white-grey theme */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                horizontal={true}
                stroke="rgba(0, 0, 0, 0.06)"
              />

              {/* X Axis showing ONLY Pipeline Stages */}
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={{ stroke: "rgba(0, 0, 0, 0.08)" }}
                tick={{ fill: "#475569", fontSize: 11.5, fontWeight: 600 }}
                dy={6}
              />

              {/* Y Axis */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                domain={[0, "auto"]}
              />

              {/* Tooltip showing ONLY stage details (e.g. New 184, Follow-up 292) */}
              <Tooltip
                content={<CustomPipelineTooltip />}
                cursor={{
                  stroke: "#ff3b19",
                  strokeWidth: 1.5,
                  strokeDasharray: "3 3",
                }}
              />

              {/* Animated Curved Area Line */}
              <Area
                type="natural"
                dataKey="count"
                name="Leads Count"
                stroke="#ff3b19"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#pipelineAreaGradient)"
                isAnimationActive={true}
                animationDuration={1400}
                animationEasing="ease-in-out"
                activeDot={{
                  r: 6,
                  fill: "#ff3b19",
                  stroke: "#ffffff",
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Card Body - Stage Pills Legend or Sources breakdown */}
      <div className="chart-light-body">
        {activeTab === "pipeline" ? (
          <div>
            <div className="chart-light-legend-grid">
              {currentDistribution.map((item) => {
                const isHovered = hoveredStage?.status === item.status;
                return (
                  <div
                    key={item.status}
                    className={`chart-stage-pill ${isHovered ? "active" : ""}`}
                    onMouseEnter={() => setHoveredStage(item)}
                    onMouseLeave={() => setHoveredStage(null)}
                  >
                    <div className="stage-pill-left">
                      <span
                        className="stage-pill-dot"
                        style={{
                          backgroundColor: item.color,
                          color: item.color,
                        }}
                      />
                      <span className="stage-pill-name">{item.status}</span>
                    </div>
                    <div className="stage-pill-right">
                      <span className="stage-pill-count">{item.count}</span>
                      <span className="stage-pill-pct">({item.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="chart-light-sources-grid">
            {leadSourcesData.map((src) => (
              <div key={src.source} className="light-source-item">
                <div className="light-source-header">
                  <span className="light-source-name">{src.source}</span>
                  <span className="light-source-stats">
                    {src.count} ({src.percentage}%)
                  </span>
                </div>
                <div className="light-source-track">
                  <div
                    className="light-source-fill"
                    style={{
                      width: `${src.percentage}%`,
                      backgroundColor:
                        src.color === "#64748b" ? "#ff3b19" : src.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
