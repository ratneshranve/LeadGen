import { apiClient } from "./client";

export const pipelineApi = {
  getStages: () => apiClient.get("/pipeline/stages"),
  getBoard: (query = {}) => {
    const params = new URLSearchParams(query).toString();
    return apiClient.get(`/pipeline/board${params ? `?${params}` : ""}`);
  },
  moveLead: (data) => apiClient.patch("/pipeline/move-lead", data),
};
