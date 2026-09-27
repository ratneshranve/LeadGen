import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Period specific mock trend data
const trendDataByPeriod = {
  "This Week": [
    { period: "Mon", leads: 8, converted: 1, rate: 12.5 },
    { period: "Tue", leads: 12, converted: 2, rate: 16.6 },
    { period: "Wed", leads: 15, converted: 3, rate: 20.0 },
    { period: "Thu", leads: 10, converted: 2, rate: 20.0 },
    { period: "Fri", leads: 14, converted: 3, rate: 21.4 },
    { period: "Sat", leads: 6, converted: 1, rate: 16.6 },
    { period: "Sun", leads: 4, converted: 0, rate: 0.0 },
  ],
  "This Month": [
    { period: "Week 1", leads: 38, converted: 5, rate: 13.1 },
    { period: "Week 2", leads: 48, converted: 7, rate: 14.5 },
    { period: "Week 3", leads: 52, converted: 7, rate: 13.4 },
    { period: "Week 4", leads: 46, converted: 5, rate: 10.8 },
  ],
  "This Year": [
    { period: "Q1", leads: 310, converted: 45, rate: 14.5 },
    { period: "Q2", leads: 380, converted: 58, rate: 15.2 },
    { period: "Q3", leads: 410, converted: 64, rate: 15.6 },
    { period: "Q4", leads: 320, converted: 48, rate: 15.0 },
  ],
};

// Dark-styled Custom Tooltip matching reference screenshot
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const leadsVal = payload.find((p) => p.dataKey === "leads")?.value || 0;
    const convertedVal = payload.find((p) => p.dataKey === "converted")?.value || 0;
    const rate = leadsVal > 0 ? ((convertedVal / leadsVal) * 100).toFixed(1) : 0;

    return (
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.5)",
          color: "#ffffff",
          fontSize: "0.8rem",
          minWidth: "160px",
        }}
      >
        <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: "8px", fontSize: "0.825rem" }}>
          {label}
        </div>

        {/* Total Leads Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "2px solid #06b6d4",
                backgroundColor: "#0f172a"
              }}
            />
            <span style={{ color: "#cbd5e1", fontWeight: 600 }}>Leads:</span>
          </div>
          <strong style={{ color: "#ffffff", fontSize: "0.875rem" }}>{leadsVal}</strong>
        </div>

        {/* Converted Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "2px solid #ec4899",
                backgroundColor: "#0f172a"
              }}
            />
            <span style={{ color: "#cbd5e1", fontWeight: 600 }}>Converted:</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <strong style={{ color: "#ffffff", fontSize: "0.875rem" }}>{convertedVal}</strong>
            <span
              style={{
                fontSize: "0.675rem",
                fontWeight: 700,
                backgroundColor: "rgba(236, 72, 153, 0.15)",
                color: "#f472b6",
                padding: "2px 5px",
                borderRadius: "4px"
              }}
            >
              {rate}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const LeadConversionTrendChart = ({ dateRange, data }) => {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return trendDataByPeriod[dateRange] || trendDataByPeriod["This Month"];
  }, [dateRange, data]);

  return (
    <div style={{ width: "100%", height: 260, marginTop: "12px" }}>
      {/* Legend Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", fontWeight: 700, color: "#1b2559" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#06b6d4", display: "inline-block" }} />
          Total Leads
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", fontWeight: 700, color: "#1b2559" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ec4899", display: "inline-block" }} />
          Converted Deals
        </div>
      </div>

      {/* Responsive Recharts Container */}
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: "#06b6d4", strokeWidth: 1, strokeDasharray: "4 4" }} />

          {/* Area 1: Total Leads (Cyan Solid Curve with Area Fill) */}
          <Area
            type="monotone"
            dataKey="leads"
            stroke="#06b6d4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#cyanGradient)"
            dot={{ r: 5, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 3 }}
          />

          {/* Line 2: Converted Deals (Pink Dashed Curve) */}
          <Line
            type="monotone"
            dataKey="converted"
            stroke="#ec4899"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: "#ec4899", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#ec4899", stroke: "#ffffff", strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
