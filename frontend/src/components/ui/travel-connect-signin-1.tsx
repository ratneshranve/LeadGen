import React, { useState } from "react";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { AdminLogoMark, SalesLogoMark, FloatingStack } from "../brand/BrandMark";

// Helper function to merge class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

const EASE = [0.16, 1, 0.3, 1] as const;

// Custom Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export const Button = ({ children, variant = "default", className = "", ...props }: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  const variantStyles = {
    default: "signin-primary-btn",
    outline: "border border-line bg-surface hover:bg-subtle text-[color:var(--text-main)]",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Custom Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = ({ className = "", ...props }: InputProps) => {
  return <input className={`signin-input ${className}`} {...props} />;
};

/* ------------------------------------------------------------------------ */
/* Admin showcase: navy panel with a lead table that tilts into place        */
/* ------------------------------------------------------------------------ */
const MOCK_ROWS = [
  { name: "Tahani Al-Hashemi", status: "In Progress", w: 72 },
  { name: "Alexe Jordan", status: "New", w: 58 },
  { name: "Shouq Al-Kumaiti", status: "Sold", w: 64 },
  { name: "Dibbendo Pranto", status: "In Progress", w: 52 },
];

const AdminShowcase = ({ brandName, brandSubtitle }: { brandName: string; brandSubtitle: string }) => (
  <div className="signin-admin-showcase">
    <div className="signin-admin-brand">
      <span className="signin-admin-logo">
        <AdminLogoMark size={30} />
      </span>
      <div>
        <div className="signin-admin-brand-name">{brandName}</div>
        <div className="signin-admin-brand-sub">Admin console</div>
      </div>
    </div>

    <div className="signin-admin-stage">
      <motion.div
        className="signin-mock"
        initial={{ opacity: 0, rotateX: 18, rotateY: -16, rotateZ: 4, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, rotateX: 8, rotateY: -10, rotateZ: 1.5, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
      >
        <div className="signin-mock-top">
          <span className="signin-mock-title">Lead Management</span>
          <span className="signin-mock-btn">
            <Plus size={10} /> Add Leads
          </span>
        </div>
        <div className="signin-mock-tabs">
          <span className="is-active">New Search</span>
          <span>Saved Searches</span>
        </div>
        <div className="signin-mock-filters">
          <span className="signin-mock-search">
            <Search size={9} /> Search
          </span>
          <span className="signin-mock-chip">
            <SlidersHorizontal size={9} /> All Filters <b>2</b>
          </span>
        </div>
        <div className="signin-mock-table">
          {MOCK_ROWS.map((row, i) => (
            <motion.div
              key={row.name}
              className={cn("signin-mock-row", i === 1 && "is-selected")}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.7 + i * 0.09 }}
            >
              <span className={cn("signin-mock-check", i === 1 && "is-on")} />
              <span className="signin-mock-avatar" style={{ animationDelay: `${i * 0.4}s` }} />
              <span className="signin-mock-name">{row.name}</span>
              <span className="signin-mock-line" style={{ width: `${row.w}px` }} />
              <span className="signin-mock-status">{row.status}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="signin-admin-glow" />
    </div>

    <motion.p
      className="signin-admin-copy"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
    >
      {brandSubtitle}
    </motion.p>
  </div>
);

/* ------------------------------------------------------------------------ */
/* Sales showcase: big grotesk headline + floating layered art               */
/* ------------------------------------------------------------------------ */
const SalesShowcase = ({ brandSubtitle }: { brandSubtitle: string }) => (
  <div className="signin-sales-showcase">
    <h2 className="signin-sales-title">
      {["There's a", "better way", "to close."].map((line, i) => (
        <motion.span
          key={line}
          className="signin-sales-line"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.1 }}
        >
          {i === 1 && <span className="signin-sales-chip" aria-hidden="true" />}
          {line}
        </motion.span>
      ))}
    </h2>
    <motion.div
      className="signin-sales-link"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <span className="signin-sales-link-dot" /> Sales workspace
    </motion.div>
    <motion.p
      className="signin-sales-copy"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      {brandSubtitle}
    </motion.p>
    <FloatingStack className="signin-sales-art" />
  </div>
);

export interface SignInCardProps {
  portalType?: "admin" | "sales" | "generic";
  portalTitle?: string;
  portalSubtitle?: string;
  brandName?: string;
  brandSubtitle?: string;
  // Phone + OTP sign-in (see frontend/src/modules/auth/useOtpLogin.js)
  phone?: string;
  setPhone?: (val: string) => void;
  otp?: string;
  setOtp?: (val: string) => void;
  otpSent?: boolean;
  resendSeconds?: number;
  onResendOtp?: () => void;
  onChangeNumber?: () => void;
  rememberMe?: boolean;
  setRememberMe?: (val: boolean) => void;
  isLoading?: boolean;
  errorMessage?: string;
  infoMessage?: string;
  onSubmit?: (e: React.FormEvent) => void;
  isMobileAppFriendly?: boolean;
}

export const SignInCard: React.FC<SignInCardProps> = ({
  portalType = "admin",
  portalTitle = "Welcome Back",
  portalSubtitle = "Sign in with your mobile number",
  brandName = "LeadGen",
  brandSubtitle = "Streamline lead distribution, pipeline tracking, team user management, and sales performance.",
  phone: propPhone,
  setPhone: propSetPhone,
  otp: propOtp,
  setOtp: propSetOtp,
  otpSent = false,
  resendSeconds = 0,
  onResendOtp,
  onChangeNumber,
  rememberMe: propRememberMe,
  setRememberMe: propSetRememberMe,
  isLoading = false,
  errorMessage = "",
  infoMessage = "",
  onSubmit: propOnSubmit,
}) => {
  const [internalPhone, setInternalPhone] = useState("");
  const [internalOtp, setInternalOtp] = useState("");
  const [internalRememberMe, setInternalRememberMe] = useState(false);

  const phone = propPhone !== undefined ? propPhone : internalPhone;
  const setPhone = propSetPhone || setInternalPhone;
  const otp = propOtp !== undefined ? propOtp : internalOtp;
  const setOtp = propSetOtp || setInternalOtp;
  const rememberMe = propRememberMe !== undefined ? propRememberMe : internalRememberMe;
  const setRememberMe = propSetRememberMe || setInternalRememberMe;

  const isSales = portalType === "sales";

  const handleSubmit = (e: React.FormEvent) => {
    if (propOnSubmit) {
      propOnSubmit(e);
    } else {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("signin-root", isSales ? "signin-root--sales" : "signin-root--admin")}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="signin-card"
      >
        {/* Showcase side */}
        <div className="signin-showcase">
          {isSales ? (
            <SalesShowcase brandSubtitle={brandSubtitle} />
          ) : (
            <AdminShowcase brandName={brandName} brandSubtitle={brandSubtitle} />
          )}
        </div>

        {/* Form side */}
        <div className="signin-form-side">
          {isSales && (
            <div className="signin-sales-brand">
              <SalesLogoMark size={28} />
              <span>{brandName}</span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="w-full"
          >
            <div className="signin-heading">
              {!isSales && (
                <div className="signin-admin-mobile-brand">
                  <AdminLogoMark size={28} />
                  <span>{brandName}</span>
                </div>
              )}
              <h1 className="signin-title">{portalTitle}</h1>
              <p className="signin-subtitle">{portalSubtitle}</p>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="signin-alert signin-alert--error"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {/* Info Banner (e.g. "OTP sent") */}
            {infoMessage && !errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="signin-alert signin-alert--info"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{infoMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="signin-form" autoComplete="off">
              <div>
                <div className="signin-label-row">
                  <label htmlFor="portal-phone" className="signin-label">
                    Mobile Number *
                  </label>
                  {otpSent && onChangeNumber && (
                    <button type="button" onClick={onChangeNumber} className="signin-link-btn">
                      Change number
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="signin-prefix">+91</span>
                  <Input
                    id="portal-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    disabled={otpSent}
                    required
                    className="signin-input--prefixed"
                  />
                </div>
              </div>

              {otpSent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.45, ease: EASE }}>
                  <div className="signin-label-row">
                    <label htmlFor="portal-otp" className="signin-label">
                      OTP *
                    </label>
                    {onResendOtp && (
                      <button
                        type="button"
                        onClick={onResendOtp}
                        disabled={resendSeconds > 0 || isLoading}
                        className="signin-link-btn"
                      >
                        {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : "Resend OTP"}
                      </button>
                    )}
                  </div>
                  <Input
                    id="portal-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    autoFocus
                    required
                    className="signin-input--otp"
                  />
                </motion.div>
              )}

              {/* Remember Me */}
              <label className="signin-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading} className="signin-submit lg-shine">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{otpSent ? "Verifying..." : "Sending OTP..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{otpSent ? "Verify & Sign In" : "Send OTP"}</span>
                    <span className="signin-submit-arrow">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                )}
              </Button>

              {/* Portal Switcher Link */}
              <div className="signin-switch">
                {portalType === "admin" ? (
                  <p>
                    Sales team member?{" "}
                    <a href="/sales/login">Login to Sales Panel &rarr;</a>
                  </p>
                ) : (
                  <p>
                    Administrator?{" "}
                    <a href="/admin/login">Login to Admin Panel &rarr;</a>
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-3 sm:p-6">
      <SignInCard />
    </div>
  );
};

export default Index;
