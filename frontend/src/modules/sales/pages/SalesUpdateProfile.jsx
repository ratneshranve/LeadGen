import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { Separator } from "../../../components/ui/v-tabs-13-utils/separator";
import "./SalesPages.css";

export const SalesUpdateProfile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "Amit");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "Sharma");
  const [email, setEmail] = useState(user?.email || "amit@leadflow.com");
  const [mobile, setMobile] = useState(user?.mobile || "+91 98765 11111");
  const [dob, setDob] = useState(user?.dob || "1995-08-15");

  useEffect(() => {
    if (user) {
      if (user.name) {
        setFirstName(user.name.split(" ")[0]);
        setLastName(user.name.split(" ").slice(1).join(" "));
      }
      if (user.email) setEmail(user.email);
      if (user.mobile) setMobile(user.mobile);
      if (user.dob) setDob(user.dob);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      updateUserProfile({
        name: fullName,
        email: email.trim(),
        mobile: mobile.trim(),
        dob: dob,
      });

      // Directly navigate back without showing any toast message
      navigate("/sales/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sales-page-container">
      {/* Top Back Navigation Button (No Edit Details text on right) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate("/sales/profile")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#ece7dc] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-[#fff7ed] hover:border-[#ffd2c7] hover:text-[#ff3b19] transition-all cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Profile
        </button>
      </div>

      {/* Edit Form Card (Compact width & Short field height) */}
      <div className="mx-auto w-full max-w-lg bg-white border border-[#ece7dc] rounded-2xl shadow-sm p-4 sm:p-6 text-slate-900">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <h2 className="font-bold text-base text-slate-900">Update Profile Details</h2>
            <p className="mt-0.5 text-slate-500 text-xs">
              Change your name, login email, mobile number, or date of birth.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">First name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Last name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Email Address (Login ID) *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Mobile Phone Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-[11px] sm:text-xs text-slate-600">Date of Birth (DOB)</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-[#ece7dc] bg-slate-50/50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#ff3b19] focus:bg-white focus:ring-2 focus:ring-[#ff3b19]/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/sales/profile")}
              className="flex-1 rounded-lg border border-[#ece7dc] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff3b19] hover:bg-[#e63010] text-white font-bold text-xs sm:text-sm px-4 py-2 transition-all shadow-sm shadow-[#ff3b19]/25 active:scale-95 cursor-pointer"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
