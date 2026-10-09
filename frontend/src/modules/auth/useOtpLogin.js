import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

// Shared phone + OTP sign-in flow for the admin and sales login pages.
// Step 1: enter mobile number -> backend SMSes an OTP (SMS India Hub).
// Step 2: enter the 6-digit OTP -> backend verifies it and issues tokens.
export const useOtpLogin = (portal) => {
  const { sendLoginOtp, verifyLoginOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const requestOtp = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendLoginOtp(phone, portal);
      setOtpSent(true);
      setOtp("");
      setResendSeconds(result?.resendCooldownSeconds || 60);
      setInfoMessage(`OTP sent to +91 ${phone}. It is valid for 5 minutes.`);
    } catch (error) {
      setErrorMessage(error.message || "Could not send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Returns the redirect URL on success, null otherwise
  const verifyOtp = async () => {
    setErrorMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return null;
    }

    setIsLoading(true);
    try {
      const result = await verifyLoginOtp(phone, otp, portal, rememberMe);
      return result.redirectUrl;
    } catch (error) {
      setErrorMessage(error.message || "Invalid OTP. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const changeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setErrorMessage("");
    setInfoMessage("");
  };

  return {
    phone,
    setPhone: (val) => setPhone(val.replace(/\D/g, "").slice(0, 10)),
    otp,
    setOtp: (val) => setOtp(val.replace(/\D/g, "").slice(0, 6)),
    otpSent,
    rememberMe,
    setRememberMe,
    resendSeconds,
    isLoading,
    errorMessage,
    infoMessage,
    requestOtp,
    verifyOtp,
    changeNumber,
  };
};
