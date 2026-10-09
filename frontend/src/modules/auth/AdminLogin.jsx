import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SignInCard } from "@/components/ui/travel-connect-signin-1.tsx";
import { useOtpLogin } from "./useOtpLogin";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const otpLogin = useOtpLogin("admin");

  // If already logged in as Admin, redirect to admin dashboard
  useEffect(() => {
    if (adminUser && (adminUser.role === "MASTER_ADMIN" || adminUser.role === "Admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!otpLogin.otpSent) {
      await otpLogin.requestOtp();
      return;
    }

    const redirectUrl = await otpLogin.verifyOtp();
    if (redirectUrl) navigate(redirectUrl, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbf9f4] p-3 sm:p-6">
      <SignInCard
        portalType="admin"
        brandName="LeadGen"
        brandSubtitle="Streamline lead distribution, pipeline tracking, team user management, and sales performance."
        portalTitle="Welcome Back"
        portalSubtitle="Sign in with your mobile number"
        {...otpLogin}
        onSubmit={handleSubmit}
        onResendOtp={otpLogin.requestOtp}
        onChangeNumber={otpLogin.changeNumber}
      />
    </div>
  );
};
