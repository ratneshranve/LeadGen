import { apiClient } from "./client";

const withQuery = (path, query = {}) => {
  const clean = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const params = new URLSearchParams(clean).toString();
  return `${path}${params ? `?${params}` : ""}`;
};

export const followupsApi = {
  getAll: (query = {}) => apiClient.get(withQuery("/followups", query)),
  getForLead: (leadId) => apiClient.get(`/followups/lead/${leadId}`),
  create: (data) => apiClient.post("/followups", data),
  update: (id, data) => apiClient.patch(`/followups/${id}`, data),
  remove: (id) => apiClient.delete(`/followups/${id}`),
  complete: (id, notes) => apiClient.patch(`/followups/${id}/complete`, { notes }),
  cancel: (id) => apiClient.patch(`/followups/${id}/cancel`),
};
