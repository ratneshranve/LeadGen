import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ToastNotification } from "../../admin/pages/AddLead/components/ToastNotification";
import { Pattern as ProfileTabs } from "../../../components/ui/v-tabs-13";
import "./SalesPages.css";

export const SalesProfile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, logout } = useAuth();

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Notification preferences stored in localStorage
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_sales_notif_prefs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      newLeads: true,
      followUpReminders: true,
      weeklyDigest: false,
      securityAlerts: true,
    };
  });

  const handleSaveProfile = (profileData) => {
    try {
      updateUserProfile({
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.mobile,
        bio: profileData.bio,
      });
      setToastMessage("Profile & login email updated successfully!");
      setIsToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || "Failed to update profile.");
      setIsToastOpen(true);
    }
  };

  const handleSavePassword = (newPassword, confirmPassword) => {
    if (!newPassword) {
      setToastMessage("Please enter a new password.");
      setIsToastOpen(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMessage("New passwords do not match.");
      setIsToastOpen(true);
      return;
    }

    try {
      updateUserProfile({
        password: newPassword,
      });
      setToastMessage("Password updated successfully! Permanent credentials saved.");
      setIsToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || "Failed to update password.");
      setIsToastOpen(true);
    }
  };

  const handleToggleNotification = (updatedSettings) => {
    setNotifSettings(updatedSettings);
    try {
      localStorage.setItem("leadflow_sales_notif_prefs", JSON.stringify(updatedSettings));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/sales/login");
  };

  return (
    <div className="sales-page-container">
      <ToastNotification message={toastMessage} isOpen={isToastOpen} onClose={() => setIsToastOpen(false)} />

      {/* Main Profile & Settings Container (Light Mode Shadcn Vertical Tabs) */}
      <ProfileTabs
        user={user}
        onNavigateToUpdate={() => navigate("/sales/profile/updateProfile")}
        onSavePassword={handleSavePassword}
        notificationSettings={notifSettings}
        onToggleNotification={handleToggleNotification}
        onLogout={handleLogout}
      />
    </div>
  );
};
