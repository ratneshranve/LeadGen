import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, MoreHorizontal } from "lucide-react";

const metricConfigs = {
  all: {
    label: "All Channels",
    color: "#ffffff",
  },
  leads: {
    label: "Total Leads",
    color: "#ff5500", // Vibrant orange (Instagram style from 21st.dev)
    bgSoft: "rgba(255, 85, 0, 0.12)",
  },
  converted: {
    label: "Converted Deals",
    color: "#64748b", // Slate gray (LinkedIn style from 21st.dev)
    bgSoft: "rgba(100, 116, 139, 0.12)",
  },
  activeLeads: {
    label: "Active Leads",
    color: "#2563eb", // Royal blue (Facebook style from 21st.dev)
    bgSoft: "rgba(37, 99, 235, 0.12)",
  },
};

// Custom Frosted Dark Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div
        style={{
          backgroundColor: "rgba(18, 20, 24, 0.95)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          padding: "12px 16px",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.55)",
          color: "#ffffff",
          fontSize: "0.8rem",
          minWidth: "180px",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#f8fafc",
            marginBottom: "8px",
            fontSize: "0.875rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "6px",
          }}
        >
          {data.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Total Leads */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ff5500" }} />
              Total Leads:
            </span>
            <strong style={{ color: "#ff5500" }}>{data.leads}</strong>
          </div>

          {/* Active Leads */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#2563eb" }} />
              Active Leads:
            </span>
            <strong style={{ color: "#60a5fa" }}>{data.activeLeads}</strong>
          </div>

          {/* Converted Deals */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#64748b" }} />
              Converted Deals:
            </span>
            <strong style={{ color: "#cbd5e1" }}>{data.converted}</strong>
          </div>

          {/* Rate */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "4px",
              paddingTop: "6px",
              borderTop: "1px dashed rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "0.725rem" }}>Conversion Rate:</span>
            <strong style={{ color: "#10b981", fontSize: "0.75rem" }}>{data.rate}%</strong>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SourceAnalyticsChart = ({ sources = [] }) => {
  const [activeMetric, setActiveMetric] = useState("all");

  // Format Data for Recharts
  const chartData = useMemo(() => {
    if (!sources || sources.length === 0) return [];
    return sources.map((s) => ({
      name: s.name,
      leads: s.leads || 0,
      converted: s.converted || 0,
      activeLeads: s.activeLeads || Math.round((s.leads || 0) * 0.65),
      rate: s.rate || 0,
    }));
  }, [sources]);

  // Aggregate Totals
  const totals = useMemo(() => {
    return {
      leads: chartData.reduce((acc, curr) => acc + curr.leads, 0),
      converted: chartData.reduce((acc, curr) => acc + curr.converted, 0),
      activeLeads: chartData.reduce((acc, curr) => acc + curr.activeLeads, 0),
    };
  }, [chartData]);

  return (
    <div
      className="crm-card source-analytics-card"
      style={{
        backgroundColor: "#111215",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "0",
        overflow: "hidden",
        boxShadow: "0 14px 40px -8px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Interactive Card Header with Metric Selector Tabs */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          flexWrap: "wrap",
        }}
      >
        {/* Header Title */}
        <div style={{ flex: 1, minWidth: "240px", padding: "22px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              <BarChart3 size={20} color="#ff5500" /> Bar Chart - Interactive Analytics
            </h3>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
              }}
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
          <p style={{ fontSize: "0.775rem", color: "#a1a1aa", margin: "4px 0 0 0" }}>
            Showing performance volume breakdown across all acquisition channels
          </p>
        </div>

        {/* 3 Metric Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {[
            { key: "leads", label: "TOTAL LEADS", color: "#ff5500" },
            { key: "converted", label: "CONVERTED DEALS", color: "#64748b" },
            { key: "activeLeads", label: "ACTIVE LEADS", color: "#2563eb" },
          ].map((item) => {
            const isActive = activeMetric === item.key;
            const val = totals[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setActiveMetric((prev) => (prev === item.key ? "all" : item.key))
                }
                style={{
                  flex: 1,
                  minWidth: "125px",
                  padding: "16px 20px",
                  border: "none",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  borderBottom: isActive ? `3px solid ${item.color}` : "3px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: isActive ? item.color : "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: isActive ? "#ffffff" : "#cbd5e1",
                    marginTop: "2px",
                  }}
                >
                  {val.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Body */}
      <div style={{ padding: "26px 20px 20px 20px" }}>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              {/* Dashed Horizontal Grid Lines matching 21st.dev style */}
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.08)"
              />

              {/* X Axis */}
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />

              {/* Y Axis */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 11 }}
                domain={[0, "auto"]}
              />

              {/* Tooltip */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "rgba(255, 255, 255, 0.15)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />

              {/* 1. Total Leads Line (Vibrant Orange - Instagram Style) */}
              <Line
                type="natural"
                dataKey="leads"
                name="Total Leads"
                stroke="#ff5500"
                strokeWidth={activeMetric === "leads" ? 3.5 : 2.5}
                strokeOpacity={
                  activeMetric === "all" || activeMetric === "leads" ? 1 : 0.25
                }
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#ff5500",
                  stroke: "#111215",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />

              {/* 2. Active Leads Line (Vibrant Blue - Facebook Style) */}
              <Line
                type="natural"
                dataKey="activeLeads"
                name="Active Leads"
                stroke="#2563eb"
                strokeWidth={activeMetric === "activeLeads" ? 3.5 : 2.5}
                strokeOpacity={
                  activeMetric === "all" || activeMetric === "activeLeads" ? 1 : 0.25
                }
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#2563eb",
                  stroke: "#111215",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={1700}
                animationEasing="ease-in-out"
              />

              {/* 3. Converted Deals Line (Slate Gray - LinkedIn Style) */}
              <Line
                type="natural"
                dataKey="converted"
                name="Converted Deals"
                stroke="#64748b"
                strokeWidth={activeMetric === "converted" ? 3.5 : 2.5}
                strokeOpacity={
                  activeMetric === "all" || activeMetric === "converted" ? 1 : 0.25
                }
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#64748b",
                  stroke: "#111215",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={1900}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Legend Directly Matching 21st.dev Layout & Halo Rings */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "28px",
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            flexWrap: "wrap",
          }}
        >
          {/* Blue Dot: Active Leads */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() =>
              setActiveMetric((prev) => (prev === "activeLeads" ? "all" : "activeLeads"))
            }
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.25)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: activeMetric === "activeLeads" ? "#ffffff" : "#94a3b8",
                fontWeight: activeMetric === "activeLeads" ? 700 : 500,
              }}
            >
              Active Leads
            </span>
          </div>

          {/* Orange Dot: Total Leads */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() =>
              setActiveMetric((prev) => (prev === "leads" ? "all" : "leads"))
            }
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#ff5500",
                boxShadow: "0 0 0 4px rgba(255, 85, 0, 0.25)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: activeMetric === "leads" ? "#ffffff" : "#94a3b8",
                fontWeight: activeMetric === "leads" ? 700 : 500,
              }}
            >
              Total Leads
            </span>
          </div>

          {/* Slate Dot: Converted Deals */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() =>
              setActiveMetric((prev) => (prev === "converted" ? "all" : "converted"))
            }
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#64748b",
                boxShadow: "0 0 0 4px rgba(100, 116, 139, 0.25)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: activeMetric === "converted" ? "#ffffff" : "#94a3b8",
                fontWeight: activeMetric === "converted" ? 700 : 500,
              }}
            >
              Converted Deals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
