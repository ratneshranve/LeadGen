import { apiClient, setTokens, clearTokens, getPortal } from "./client";

export const authApi = {
  // Login user - stores access/refresh tokens for the active portal (admin/sales)
  login: async (email, password, { portal, persist = false } = {}) => {
    const activePortal = portal || getPortal();
    const data = await apiClient.post(
      "/auth/login",
      { email, password },
      { auth: false, portal: activePortal }
    );
    setTokens(activePortal, data, persist);
    return data;
  },

  // Get current user profile (validates the stored access token)
  getMe: async (portal) => apiClient.get("/auth/me", { portal }),

  // Revoke refresh token on the server and clear local tokens
  logout: async (portal) => {
    const activePortal = portal || getPortal();
    try {
      await apiClient.post("/auth/logout", {}, { portal: activePortal });
    } finally {
      clearTokens(activePortal);
    }
  },

  // Admin Create User (Salesperson) - requires an authenticated admin/manager token
  createUser: async (userData, portal) => apiClient.post("/users", userData, { portal }),

  // NOTE: the backend has no forgot/reset-password routes yet (no email provider is
  // configured - see backend/src/modules/auth/auth.routes.js). These throw a clear
  // error instead of a silent fake success so the gap is visible, not hidden.
  forgotPassword: async () => {
    throw new Error("Password reset isn't available yet - ask an admin to reset your password.");
  },
  resetPassword: async () => {
    throw new Error("Password reset isn't available yet - ask an admin to reset your password.");
  },
};
