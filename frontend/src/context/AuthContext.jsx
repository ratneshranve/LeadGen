import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  mockAuthenticate,
  mockRegisterSalesperson,
  mockUpdateUserProfile,
  getStoredUsers,
} from "./mockAuthStore";

const AuthContext = createContext(null);

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

  // Dedicated Admin Login
  const adminLogin = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const authenticatedUser = mockAuthenticate(email, password);

          if (authenticatedUser.role !== "MASTER_ADMIN" && authenticatedUser.role !== "Admin") {
            setIsLoading(false);
            reject(new Error("Access denied: Only Admin accounts can sign in here. Please use the Sales App Login."));
            return;
          }

          setAdminUser(authenticatedUser);
          sessionStorage.setItem("leadflow_admin_user", JSON.stringify(authenticatedUser));
          if (rememberMe) {
            localStorage.setItem("leadflow_admin_user", JSON.stringify(authenticatedUser));
          } else {
            localStorage.removeItem("leadflow_admin_user");
          }

          setIsLoading(false);
          resolve({ success: true, user: authenticatedUser, redirectUrl: "/admin/dashboard" });
        } catch (error) {
          setIsLoading(false);
          reject(error);
        }
      }, 350);
    });
  };

  // Dedicated Sales Login
  const salesLogin = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const authenticatedUser = mockAuthenticate(email, password);

          if (authenticatedUser.role === "MASTER_ADMIN" || authenticatedUser.role === "Admin") {
            setIsLoading(false);
            reject(new Error("Notice: This is an Admin account. Please use the Admin Portal Login."));
            return;
          }

          setSalesUser(authenticatedUser);
          sessionStorage.setItem("leadflow_sales_user", JSON.stringify(authenticatedUser));
          if (rememberMe) {
            localStorage.setItem("leadflow_sales_user", JSON.stringify(authenticatedUser));
          } else {
            localStorage.removeItem("leadflow_sales_user");
          }

          setIsLoading(false);
          resolve({ success: true, user: authenticatedUser, redirectUrl: "/sales/dashboard" });
        } catch (error) {
          setIsLoading(false);
          reject(error);
        }
      }, 350);
    });
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
    setAdminUser(null);
    sessionStorage.removeItem("leadflow_admin_user");
    localStorage.removeItem("leadflow_admin_user");
  };

  // Sales Logout Handler
  const salesLogout = () => {
    setSalesUser(null);
    sessionStorage.removeItem("leadflow_sales_user");
    localStorage.removeItem("leadflow_sales_user");
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
  const createSalespersonAccount = (userData) => {
    const createdUser = mockRegisterSalesperson(userData);
    return createdUser;
  };

  // Update Profile Handler (Name, Email, Mobile, Password)
  const updateUserProfile = (updatedFields) => {
    const activeTarget = location.pathname.startsWith("/sales") ? salesUser : adminUser;
    if (!activeTarget) throw new Error("No authenticated user found.");

    const updatedUser = mockUpdateUserProfile(activeTarget.id, {
      ...updatedFields,
      currentEmail: activeTarget.email,
    });

    if (location.pathname.startsWith("/sales")) {
      setSalesUser(updatedUser);
      sessionStorage.setItem("leadflow_sales_user", JSON.stringify(updatedUser));
      if (localStorage.getItem("leadflow_sales_user")) {
        localStorage.setItem("leadflow_sales_user", JSON.stringify(updatedUser));
      }
    } else {
      setAdminUser(updatedUser);
      sessionStorage.setItem("leadflow_admin_user", JSON.stringify(updatedUser));
      if (localStorage.getItem("leadflow_admin_user")) {
        localStorage.setItem("leadflow_admin_user", JSON.stringify(updatedUser));
      }
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
