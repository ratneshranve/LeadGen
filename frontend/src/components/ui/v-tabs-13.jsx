import React, { useState } from "react";
import {
  BellIcon,
  LockIcon,
  UserIcon,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Calendar,
  Phone,
  Mail,
  User
} from "lucide-react";
import { Separator } from "./v-tabs-13-utils/separator";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "./v-tabs-13-utils/tabs";

export function Pattern({
  user,
  onNavigateToUpdate,
  onSavePassword,
  notificationSettings,
  onToggleNotification,
  onLogout,
}) {
  // Read-only profile details
  const firstName = user?.name ? user.name.split(" ")[0] : "Amit";
  const lastName = user?.name ? user.name.split(" ").slice(1).join(" ") : "Sharma";
  const email = user?.email || "amit@leadflow.com";
  const mobile = user?.mobile || "+91 98765 11111";
  const dob = user?.dob || "15 Aug 1995";

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Local notification toggles fallback
  const [notifs, setNotifs] = useState(
    notificationSettings || {
      newLeads: true,
      followUpReminders: true,
      weeklyDigest: false,
      securityAlerts: true,
    }
  );

  const toggleNotif = (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    onToggleNotification?.(updated);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    onSavePassword?.(newPassword, confirmPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 text-slate-900">
      <Tabs className="gap-4 sm:gap-6" defaultValue="profile" orientation="vertical">
        {/* Navigation Tabs List (Clean, No Grey Bars, Compact) */}
        <TabsList className="w-full sm:w-40 shrink-0 flex-row sm:flex-col gap-1 pb-1 sm:pb-0">
          <TabsTab className="justify-start gap-2 text-xs sm:text-sm px-3 py-2" value="profile">
            <UserIcon className="size-3.5 sm:size-4 text-slate-500" />
            Profile
          </TabsTab>
          <TabsTab className="justify-start gap-2 text-xs sm:text-sm px-3 py-2" value="security">
            <LockIcon className="size-3.5 sm:size-4 text-slate-500" />
            Security
          </TabsTab>
          <TabsTab className="justify-start gap-2 text-xs sm:text-sm px-3 py-2" value="notifications">
            <BellIcon className="size-3.5 sm:size-4 text-slate-500" />
            Notifications
          </TabsTab>
        </TabsList>

        {/* 1. Profile Tab Panel (Read-only Details with Update Profile CTA) */}
        <TabsPanel value="profile">
          <div className="flex flex-col gap-3.5 max-w-md">
            <div>
              <p className="font-bold text-base text-slate-900">Profile Settings</p>
              <p className="mt-0.5 text-slate-500 text-xs">
                Manage your public profile and personal account details.
              </p>
            </div>

            <Separator />

            {/* Read-Only Details Fields (Compact width & Short height according to device) */}
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">First name</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium select-none truncate">
                    {firstName}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Last name</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium select-none truncate">
                    {lastName}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Email Address (Login ID)</label>
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium select-none truncate">
                  {email}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Mobile Phone Number</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium select-none truncate">
                    {mobile}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Date of Birth (DOB)</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium select-none truncate">
                    {dob}
                  </div>
                </div>
              </div>
            </div>

            {/* Update Profile Button (Navigates to sales/profile/updateProfile) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToUpdate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff3b19] hover:bg-[#e63010] text-white font-bold text-xs sm:text-sm px-4 py-2.5 transition-all shadow-sm shadow-[#ff3b19]/25 active:scale-95 cursor-pointer"
              >
                <Edit3 className="size-4" /> Update Profile
              </button>
            </div>

            {/* Log Out Button (Short name: Log Out, only shown in Profile Tab) */}
            <div className="pt-2.5 border-t border-[#ece7dc] mt-0.5">
              <button
                type="button"
                onClick={onLogout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm px-4 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <LogOut className="size-4" /> Log Out
              </button>
            </div>
          </div>
        </TabsPanel>

        {/* 2. Security Tab Panel */}
        <TabsPanel value="security">
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5 max-w-md">
            <div>
              <p className="font-bold text-base text-slate-900">Security & Password</p>
              <p className="mt-0.5 text-slate-500 text-xs">
                Manage your password and login authentication.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2.5">
              <div>
                <p className="mb-1 font-medium text-[11px] sm:text-xs text-slate-600">Current password status</p>
                <div className="rounded-lg border border-[#ece7dc] bg-slate-50/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-500 flex items-center justify-between select-none">
                  <span>••••••••••••</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active & Encrypted
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 pr-9 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 pr-9 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Update Password Button (Theme Coral-Red) */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff3b19] hover:bg-[#e63010] text-white font-bold text-xs sm:text-sm px-4 py-2.5 transition-all shadow-sm shadow-[#ff3b19]/25 active:scale-95 cursor-pointer"
              >
                <LockIcon className="size-4" /> Update Password
              </button>
            </div>
          </form>
        </TabsPanel>

        {/* 3. Notifications Tab Panel */}
        <TabsPanel value="notifications">
          <div className="flex flex-col gap-3.5 max-w-md">
            <div>
              <p className="font-bold text-base text-slate-900">Notification Preferences</p>
              <p className="mt-0.5 text-slate-500 text-xs">
                Choose how and when you receive push and email notifications.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              {[
                { key: "newLeads", label: "New leads assigned to me" },
                { key: "followUpReminders", label: "Follow-up schedule reminders" },
                { key: "weeklyDigest", label: "Daily sales activity digest" },
                { key: "securityAlerts", label: "Security and account login alerts" },
              ].map((item) => {
                const isOn = notifs[item.key] ?? false;
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleNotif(item.key)}
                    className="flex items-center justify-between rounded-lg border border-[#ece7dc] bg-white hover:bg-[#fff7ed]/50 px-3 py-2 transition-all cursor-pointer select-none"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{item.label}</span>

                    {/* Interactive iOS/Shadcn Toggle Switch */}
                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        isOn ? "bg-[#ff3b19]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isOn ? "translate-x-4" : "translate-x-0.5"
                        } mt-0.5`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Changes to notifications are automatically saved to your profile preferences.
            </p>
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  );
}

export default Pattern;
