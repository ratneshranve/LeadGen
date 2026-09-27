import { apiClient } from "./client";

const withQuery = (path, query = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  ).toString();
  return `${path}${params ? `?${params}` : ""}`;
};

// Admin/manager only (backend/src/modules/reports/report.routes.js).
export const reportsApi = {
  getAll: (query = {}) => apiClient.get(withQuery("/reports", query)),
  getSummary: (query = {}) => apiClient.get(withQuery("/reports/summary", query)),
  getTrend: (query = {}) => apiClient.get(withQuery("/reports/trend", query)),
  getSources: (query = {}) => apiClient.get(withQuery("/reports/sources", query)),
  getSalespersons: (query = {}) => apiClient.get(withQuery("/reports/salespersons", query)),
  getProducts: (query = {}) => apiClient.get(withQuery("/reports/products", query)),
  getFollowUps: (query = {}) => apiClient.get(withQuery("/reports/followups", query)),
  getPipeline: (query = {}) => apiClient.get(withQuery("/reports/pipeline", query)),
  getConversion: (query = {}) => apiClient.get(withQuery("/reports/conversion", query)),
};
