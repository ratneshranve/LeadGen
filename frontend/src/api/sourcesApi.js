import { apiClient } from "./client";

export const sourcesApi = {
  getAll: () => apiClient.get("/sources"),
  create: (data) => apiClient.post("/sources", data),
};
