import { apiClient } from "./client";

const withQuery = (path, query = {}) => {
  const clean = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const params = new URLSearchParams(clean).toString();
  return `${path}${params ? `?${params}` : ""}`;
};

export const leadsApi = {
  getAll: (query = {}) => apiClient.get(withQuery("/leads", query)),
  getById: (id) => apiClient.get(`/leads/${id}`),
  create: (data) => apiClient.post("/leads", data),
  update: (id, data) => apiClient.patch(`/leads/${id}`, data),
  remove: (id) => apiClient.delete(`/leads/${id}`),
  assign: (id, assignedTo) => apiClient.patch(`/leads/${id}/assign`, { assignedTo }),
  bulkActions: (data) => apiClient.post("/leads/bulk", data),
  getActivities: (id, query = {}) => {
    const params = new URLSearchParams(query).toString();
    return apiClient.get(`/leads/${id}/activities${params ? `?${params}` : ""}`);
  },
  generateAiDraft: (id) => apiClient.post(`/leads/${id}/ai-draft`),
  addInteraction: (id, data) => apiClient.post(`/leads/${id}/interactions`, data),
};
