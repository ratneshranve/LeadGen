import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = () => {
  const { adminUser, salesUser } = useAuth();
  const isAuthenticated = !!(adminUser || salesUser);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

// Strict Admin Gate: Only logged in Admin accounts can enter Admin pages
export const AdminRoute = () => {
  const { adminUser } = useAuth();

  if (!adminUser || (adminUser.role !== "MASTER_ADMIN" && adminUser.role !== "Admin")) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

// Strict Sales Gate: Only logged in Sales Employee accounts can enter Sales pages
export const SalesRoute = () => {
  const { salesUser } = useAuth();

  if (!salesUser || (salesUser.role !== "SALES_REPRESENTATIVE" && salesUser.role !== "Sales Employee")) {
    return <Navigate to="/sales/login" replace />;
  }

  return <Outlet />;
};
