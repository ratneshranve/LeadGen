import { apiClient } from "./client";

const withQuery = (path, query = {}) => {
  const clean = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const params = new URLSearchParams(clean).toString();
  return `${path}${params ? `?${params}` : ""}`;
};

// admin/manager only (backend/src/modules/users/user.routes.js)
export const usersApi = {
  getAll: (query = {}) => apiClient.get(withQuery("/users", { limit: 200, ...query })),
  getSalespeople: () => apiClient.get(withQuery("/users", { role: "salesperson", status: "active", limit: 200 })),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post("/users", data),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  remove: (id) => apiClient.delete(`/users/${id}`),
  toggleStatus: (id) => apiClient.patch(`/users/${id}/toggle-status`),
};
