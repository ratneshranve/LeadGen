import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SignInCard } from "@/components/ui/travel-connect-signin-1.tsx";

export const SalesLogin = () => {
  const navigate = useNavigate();
  const { salesLogin, salesUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already logged in as sales rep, redirect to sales dashboard
  useEffect(() => {
    if (salesUser && (salesUser.role === "SALES_REPRESENTATIVE" || salesUser.role === "Sales Employee")) {
      navigate("/sales/dashboard", { replace: true });
    }
  }, [salesUser, navigate]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      await salesLogin(email, password, rememberMe);
      setIsLoading(false);
      navigate("/sales/dashboard", { replace: true });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Invalid sales credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbf9f4] p-2 sm:p-4 md:p-6 box-border">
      <div className="w-full flex justify-center items-center">
        <SignInCard
          portalType="sales"
          brandName="LeadGen"
          brandSubtitle="Access assigned leads, log quick client calls, and track deal progress on any device."
          portalTitle="Welcome Back"
          portalSubtitle="Sign in to your account"
          emailLabel="Email *"
          emailPlaceholder="Enter Email"
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
          forgotPasswordLink="/forgot-password"
          isMobileAppFriendly={true}
        />
      </div>
    </div>
  );
};
