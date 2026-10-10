import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SignInCard } from "@/components/ui/travel-connect-signin-1.tsx";
import { useOtpLogin } from "./useOtpLogin";

export const SalesLogin = () => {
  const navigate = useNavigate();
  const { salesUser } = useAuth();
  const otpLogin = useOtpLogin("sales");

  // If already logged in as sales rep, redirect to sales dashboard
  useEffect(() => {
    if (salesUser && (salesUser.role === "SALES_REPRESENTATIVE" || salesUser.role === "Sales Employee")) {
      navigate("/sales/dashboard", { replace: true });
    }
  }, [salesUser, navigate]);

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
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-2 sm:p-4 md:p-6 box-border">
      <div className="w-full flex justify-center items-center">
        <SignInCard
          portalType="sales"
          brandName="LeadGen"
          brandSubtitle="Access assigned leads, log quick client calls, and track deal progress on any device."
          portalTitle="Welcome Back"
          portalSubtitle="Sign in with your mobile number"
          {...otpLogin}
          onSubmit={handleSubmit}
          onResendOtp={otpLogin.requestOtp}
          onChangeNumber={otpLogin.changeNumber}
          isMobileAppFriendly={true}
        />
      </div>
    </div>
  );
};
