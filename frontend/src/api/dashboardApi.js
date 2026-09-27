import { apiClient } from "./client";

export const dashboardApi = {
  // GET /dashboard/stats -> { kpi, statusDistribution, stageDistribution, monthlyTrend, teamPerformance, recentActivities }
  getStats: (query = {}) => {
    const params = new URLSearchParams(query).toString();
    return apiClient.get(`/dashboard/stats${params ? `?${params}` : ""}`);
  },
};
