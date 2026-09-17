import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout/AdminLayout";
import { SalesLayout } from "../layouts/SalesLayout/SalesLayout";
import { AdminDashboard } from "../modules/admin/pages/Dashboard/AdminDashboard";
import { Leads } from "../modules/admin/pages/Leads/Leads";
import { AddLead } from "../modules/admin/pages/AddLead/AddLead";
import { Assignments } from "../modules/admin/pages/Assignments/Assignments";
import { Pipeline } from "../modules/admin/pages/Pipeline/Pipeline";
import { FollowUps } from "../modules/admin/pages/FollowUps/FollowUps";
import { AdminCalendar } from "../modules/admin/pages/Calendar/AdminCalendar";
import { TeamUsers } from "../modules/admin/pages/TeamUsers/TeamUsers";
import { UserProfile } from "../modules/admin/pages/TeamUsers/UserProfile";
import { LeadSources } from "../modules/admin/pages/LeadSources/LeadSources";
import { ReportsAnalytics } from "../modules/admin/pages/Reports/ReportsAnalytics";
import { ImportExport } from "../modules/admin/pages/ImportExport/ImportExport";
import { ActivityHistory } from "../modules/admin/pages/ActivityHistory/ActivityHistory";
import { Notifications } from "../modules/admin/pages/Notifications/Notifications";
import { SettingsPage } from "../modules/admin/pages/Settings/SettingsPage";

import { SalesDashboard } from "../modules/sales/pages/SalesDashboard";
import { SalesLeads } from "../modules/sales/pages/SalesLeads";
import { SalesPipeline } from "../modules/sales/pages/SalesPipeline";
import { SalesFollowUps } from "../modules/sales/pages/SalesFollowUps";
import { SalesCalendar } from "../modules/sales/pages/SalesCalendar";
import { SalesNotifications } from "../modules/sales/pages/SalesNotifications";
import { SalesProfile } from "../modules/sales/pages/SalesProfile";
import { SalesUpdateProfile } from "../modules/sales/pages/SalesUpdateProfile";

import { AdminLogin } from "../modules/auth/AdminLogin";
import { SalesLogin } from "../modules/auth/SalesLogin";
import { ForgotPassword } from "../modules/auth/ForgotPassword";
import { ResetPassword } from "../modules/auth/ResetPassword";
import { AdminRoute, SalesRoute } from "./guards/ProtectedRoute";
import { PlaceholderPage } from "../modules/admin/pages/PlaceholderPage";
import { ErrorPage } from "../components/common/ErrorPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Saperate Public Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/sales/login" element={<SalesLogin />} />
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Root redirect to admin login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Admin Panel Protected Routes (Desktop CRM App) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/add" element={<AddLead />} />
          <Route path="leads/addBulk" element={<Leads forceOpenAddBulkModal={true} />} />
          <Route path="leads/leadDetails" element={<Leads forceOpenDetailsModal={true} />} />
          <Route path="leads/details" element={<Leads forceOpenDetailsModal={true} />} />
          <Route path="leads/update" element={<Leads forceOpenUpdateModal={true} />} />
          <Route path="leads/:leadId" element={<Leads forceOpenDetailsModal={true} />} />
          <Route path="leads/:leadId/edit" element={<PlaceholderPage title="Edit Lead" description="The Edit Lead page interface." />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="assignments/assignLeads" element={<Assignments forceOpenAssignModal={true} />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="pipeline/updatePipeline" element={<Pipeline forceOpenUpdateModal={true} />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="follow-ups/addFollow-up" element={<FollowUps forceOpenScheduleModal={true} />} />
          <Route path="follow-ups/addFollowUp" element={<Navigate to="/admin/follow-ups/addFollow-up" replace />} />
          <Route path="follow-ups/add" element={<Navigate to="/admin/follow-ups/addFollow-up" replace />} />
          <Route path="followups" element={<Navigate to="/admin/follow-ups" replace />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="sales-employees" element={<TeamUsers />} />
          <Route path="sales-employees/add" element={<TeamUsers forceOpenAddModal={true} />} />
          <Route path="sales-employees/update" element={<TeamUsers forceOpenUpdateModal={true} />} />
          <Route path="sales-employees/:userId" element={<UserProfile />} />
          <Route path="team-users" element={<Navigate to="/admin/sales-employees" replace />} />
          <Route path="team" element={<Navigate to="/admin/sales-employees" replace />} />
          <Route path="lead-sources" element={<LeadSources />} />
          <Route path="lead-sources/add" element={<LeadSources forceOpenAddModal={true} />} />
          <Route path="lead-sources/update" element={<LeadSources forceOpenUpdateModal={true} />} />
          <Route path="sources" element={<Navigate to="/admin/lead-sources" replace />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="reports-analytics" element={<Navigate to="/admin/reports" replace />} />
          <Route path="export" element={<ImportExport />} />
          <Route path="import-export" element={<Navigate to="/admin/export" replace />} />
          <Route path="activity-history" element={<ActivityHistory />} />
          <Route path="activities" element={<Navigate to="/admin/activity-history" replace />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Sales Employee Panel Protected Routes (Mobile App View) */}
      <Route element={<SalesRoute />}>
        <Route path="/sales" element={<SalesLayout />}>
          <Route index element={<Navigate to="/sales/dashboard" replace />} />
          <Route path="dashboard" element={<SalesDashboard />} />
          <Route path="leads" element={<SalesLeads />} />
          <Route path="pipeline" element={<SalesPipeline />} />
          <Route path="follow-ups" element={<SalesFollowUps />} />
          <Route path="followups" element={<Navigate to="/sales/follow-ups" replace />} />
          <Route path="calendar" element={<SalesCalendar />} />
          <Route path="notifications" element={<SalesNotifications />} />
          <Route path="profile" element={<SalesProfile />} />
          <Route path="profile/updateProfile" element={<SalesUpdateProfile />} />
          <Route path="profile/update" element={<Navigate to="/sales/profile/updateProfile" replace />} />
        </Route>
      </Route>

      {/* Fallback & 404 Error Page */}
      <Route path="*" element={<ErrorPage is404={true} />} />
    </Routes>
  );
};
