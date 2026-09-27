import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { authApi } from "../api/authApi";
import {
  mockRegisterSalesperson,
  mockUpdateUserProfile,
  getStoredUsers,
} from "./mockAuthStore";

const AuthContext = createContext(null);

// Backend roles (admin/manager/salesperson - see backend/src/models/User.model.js) are
// normalized to the role strings the rest of this frontend already checks against
// (see ProtectedRoute.jsx, TeamUsers, etc.) so wiring in the real API doesn't require
// touching every component that reads `user.role`.
const ROLE_MAP = { admin: "MASTER_ADMIN", manager: "Admin", salesperson: "SALES_REPRESENTATIVE" };

const normalizeUser = (backendUser) => {
  if (!backendUser) return null;
  return {
    id: backendUser._id,
    _id: backendUser._id,
    name: backendUser.name,
    email: backendUser.email,
    mobile: backendUser.phone,
    phone: backendUser.phone,
    avatarUrl: backendUser.avatarUrl || null,
    role: ROLE_MAP[backendUser.role] || backendUser.role,
    backendRole: backendUser.role,
    status: backendUser.status === "active" ? "ACTIVE" : "INACTIVE",
    createdAt: backendUser.createdAt,
  };
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();

  // Admin User Session State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      // Clear legacy single user key if present to enforce clean fresh login
      localStorage.removeItem("leadflow_current_user");
      const saved = sessionStorage.getItem("leadflow_admin_user") || localStorage.getItem("leadflow_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Sales Representative Session State
  const [salesUser, setSalesUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("leadflow_sales_user") || localStorage.getItem("leadflow_sales_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync Admin session
  useEffect(() => {
    if (adminUser) {
      sessionStorage.setItem("leadflow_admin_user", JSON.stringify(adminUser));
    } else {
      sessionStorage.removeItem("leadflow_admin_user");
      localStorage.removeItem("leadflow_admin_user");
    }
  }, [adminUser]);

  // Sync Sales session
  useEffect(() => {
    if (salesUser) {
      sessionStorage.setItem("leadflow_sales_user", JSON.stringify(salesUser));
    } else {
      sessionStorage.removeItem("leadflow_sales_user");
      localStorage.removeItem("leadflow_sales_user");
    }
  }, [salesUser]);

  // If a token refresh ultimately fails (client.js), force that portal's session out.
  useEffect(() => {
    const handleExpired = (e) => {
      if (e.detail?.portal === "sales") {
        setSalesUser(null);
      } else {
        setAdminUser(null);
      }
    };
    window.addEventListener("leadflow:session-expired", handleExpired);
    return () => window.removeEventListener("leadflow:session-expired", handleExpired);
  }, []);

  // Dedicated Admin Login - real backend auth (admin or manager role)
  const adminLogin = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const { user } = await authApi.login(email, password, { portal: "admin", persist: rememberMe });
      const authenticatedUser = normalizeUser(user);

      if (authenticatedUser.role !== "MASTER_ADMIN" && authenticatedUser.role !== "Admin") {
        await authApi.logout("admin").catch(() => {});
        throw new Error("Access denied: Only Admin accounts can sign in here. Please use the Sales App Login.");
      }

      setAdminUser(authenticatedUser);
      return { success: true, user: authenticatedUser, redirectUrl: "/admin/dashboard" };
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Sales Login - real backend auth (salesperson role)
  const salesLogin = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const { user } = await authApi.login(email, password, { portal: "sales", persist: rememberMe });
      const authenticatedUser = normalizeUser(user);

      if (authenticatedUser.role === "MASTER_ADMIN" || authenticatedUser.role === "Admin") {
        await authApi.logout("sales").catch(() => {});
        throw new Error("Notice: This is an Admin account. Please use the Admin Portal Login.");
      }

      setSalesUser(authenticatedUser);
      return { success: true, user: authenticatedUser, redirectUrl: "/sales/dashboard" };
    } finally {
      setIsLoading(false);
    }
  };

  // General Login (dispatches based on active path)
  const login = async (email, password, rememberMe = false) => {
    if (location.pathname.startsWith("/sales")) {
      return salesLogin(email, password, rememberMe);
    }
    return adminLogin(email, password, rememberMe);
  };

  // Admin Logout Handler
  const adminLogout = () => {
    authApi.logout("admin").catch(() => {});
    setAdminUser(null);
  };

  // Sales Logout Handler
  const salesLogout = () => {
    authApi.logout("sales").catch(() => {});
    setSalesUser(null);
  };

  // Universal Logout
  const logout = () => {
    if (location.pathname.startsWith("/sales")) {
      salesLogout();
    } else {
      adminLogout();
    }
  };

  // Admin Create Salesperson Handler
  // NOTE: still backed by the local mock user directory (frontend/src/context/mockAuthStore.js).
  // The TeamUsers screen and this call will be switched to the real POST /users endpoint
  // (authApi.createUser) when that page is wired up to the backend.
  const createSalespersonAccount = (userData) => {
    const createdUser = mockRegisterSalesperson(userData);
    return createdUser;
  };

  // Update Profile Handler (Name, Email, Mobile, Password)
  // NOTE: still backed by the local mock user directory - see note above.
  const updateUserProfile = (updatedFields) => {
    const activeTarget = location.pathname.startsWith("/sales") ? salesUser : adminUser;
    if (!activeTarget) throw new Error("No authenticated user found.");

    const updatedUser = mockUpdateUserProfile(activeTarget.id, {
      ...updatedFields,
      currentEmail: activeTarget.email,
    });

    if (location.pathname.startsWith("/sales")) {
      setSalesUser({ ...salesUser, ...updatedUser, id: activeTarget.id });
    } else {
      setAdminUser({ ...adminUser, ...updatedUser, id: activeTarget.id });
    }

    return updatedUser;
  };

  // Context user resolution depending on active portal path
  const isSalesPath = location.pathname.startsWith("/sales");
  const currentUser = isSalesPath ? salesUser : (adminUser || salesUser);
  const isAuthenticated = isSalesPath ? !!salesUser : !!adminUser;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        adminUser,
        salesUser,
        isAuthenticated,
        isAdmin: !!adminUser,
        isSales: !!salesUser,
        isLoading,
        login,
        logout,
        adminLogin,
        salesLogin,
        adminLogout,
        salesLogout,
        createSalespersonAccount,
        updateUserProfile,
        getStoredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
