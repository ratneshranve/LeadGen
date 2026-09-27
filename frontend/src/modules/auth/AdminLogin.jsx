import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SignInCard } from "@/components/ui/travel-connect-signin-1.tsx";

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, adminUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // If already logged in as Admin, redirect to admin dashboard
  useEffect(() => {
    if (adminUser && (adminUser.role === "MASTER_ADMIN" || adminUser.role === "Admin")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      await adminLogin(email, password, rememberMe);
      setIsLoading(false);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "Invalid admin credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbf9f4] p-3 sm:p-6">
      <SignInCard
        portalType="admin"
        brandName="LeadGen"
        brandSubtitle="Streamline lead distribution, pipeline tracking, team user management, and sales performance."
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
      />
    </div>
  );
};
