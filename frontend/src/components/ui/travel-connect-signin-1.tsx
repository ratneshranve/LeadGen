import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Helper function to merge class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Custom Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export const Button = ({ 
  children, 
  variant = "default", 
  className = "", 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variantStyles = {
    default: "bg-gradient-to-r from-[#ff5722] via-[#ff3b19] to-[#e62e0b] text-white shadow-md shadow-orange-500/25 hover:from-[#f4511e] hover:to-[#d82a08] hover:shadow-lg hover:shadow-orange-500/35",
    outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`flex h-11 w-full rounded-xl border border-[#ece7dc] bg-white px-3.5 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:bg-white focus:border-[#ff3b19] focus:outline-none focus:ring-2 focus:ring-[#ff3b19]/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

// Static route points definition constrained to the upper sky section so animations never touch the text
const ROUTES: { start: RoutePoint; end: RoutePoint; color: string }[] = [
  {
    start: { x: 70, y: 110, delay: 0 },
    end: { x: 170, y: 55, delay: 2 },
    color: "#ff3b19",
  },
  {
    start: { x: 170, y: 55, delay: 2 },
    end: { x: 250, y: 85, delay: 4 },
    color: "#ff3b19",
  },
  {
    start: { x: 40, y: 50, delay: 1 },
    end: { x: 130, y: 120, delay: 3 },
    color: "#ff3b19",
  },
  {
    start: { x: 260, y: 45, delay: 0.5 },
    end: { x: 160, y: 115, delay: 2.5 },
    color: "#ff3b19",
  },
];

export const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Create dots for the world map
  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          // North America
          ((x < width * 0.25 && x > width * 0.05) && (y < height * 0.4 && y > height * 0.1)) ||
          // South America
          ((x < width * 0.25 && x > width * 0.15) && (y < height * 0.8 && y > height * 0.4)) ||
          // Europe
          ((x < width * 0.45 && x > width * 0.3) && (y < height * 0.35 && y > height * 0.15)) ||
          // Africa
          ((x < width * 0.5 && x > width * 0.35) && (y < height * 0.65 && y > height * 0.35)) ||
          // Asia
          ((x < width * 0.7 && x > width * 0.45) && (y < height * 0.5 && y > height * 0.1)) ||
          // Australia
          ((x < width * 0.8 && x > width * 0.65) && (y < height * 0.8 && y > height * 0.6));

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.45 + 0.18,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const updateSize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
        canvas.width = width;
        canvas.height = height;
      }
    });

    resizeObserver.observe(canvas.parentElement);
    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function drawDots() {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 87, 34, ${dot.opacity * 0.75})`;
        ctx.fill();
      });
    }

    function drawRoutes() {
      if (!ctx) return;
      const currentTime = (Date.now() - startTime) / 1000;
      
      ROUTES.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        
        // Scale route points horizontally across width, but constrain vertically to top 38%
        const scaleX = dimensions.width / 320;
        const maxRouteHeight = dimensions.height * 0.38;
        const scaleY = maxRouteHeight / 130;

        const startX = route.start.x * scaleX;
        const startY = route.start.y * scaleY;
        const endX = route.end.x * scaleX;
        const endY = route.end.y * scaleY;

        const x = startX + (endX - startX) * progress;
        const y = startY + (endY - startY) * progress;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff5722";
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 59, 25, 0.35)";
        ctx.fill();
        
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(endX, endY, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }
    
    function animate() {
      drawDots();
      drawRoutes();
      
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};

export interface SignInCardProps {
  portalType?: "admin" | "sales" | "generic";
  portalTitle?: string;
  portalSubtitle?: string;
  brandName?: string;
  brandSubtitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  email?: string;
  setEmail?: (val: string) => void;
  password?: string;
  setPassword?: (val: string) => void;
  rememberMe?: boolean;
  setRememberMe?: (val: boolean) => void;
  isLoading?: boolean;
  errorMessage?: string;
  onSubmit?: (e: React.FormEvent) => void;
  forgotPasswordLink?: string;
  isMobileAppFriendly?: boolean;
}

export const SignInCard: React.FC<SignInCardProps> = ({
  portalType = "admin",
  portalTitle = "Welcome Back",
  portalSubtitle = "Sign in to your account",
  brandName = "LeadGen",
  brandSubtitle = "Streamline lead distribution, pipeline tracking, team user management, and sales performance.",
  emailLabel = "Email *",
  emailPlaceholder = "Enter Email",
  email: propEmail,
  setEmail: propSetEmail,
  password: propPassword,
  setPassword: propSetPassword,
  rememberMe: propRememberMe,
  setRememberMe: propSetRememberMe,
  isLoading = false,
  errorMessage = "",
  onSubmit: propOnSubmit,
  forgotPasswordLink = "/forgot-password",
  isMobileAppFriendly = true,
}) => {
  const [internalEmail, setInternalEmail] = useState("");
  const [internalPassword, setInternalPassword] = useState("");
  const [internalRememberMe, setInternalRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const email = propEmail !== undefined ? propEmail : internalEmail;
  const setEmail = propSetEmail || setInternalEmail;
  const password = propPassword !== undefined ? propPassword : internalPassword;
  const setPassword = propSetPassword || setInternalPassword;
  const rememberMe = propRememberMe !== undefined ? propRememberMe : internalRememberMe;
  const setRememberMe = propSetRememberMe || setInternalRememberMe;

  const handleSubmit = (e: React.FormEvent) => {
    if (propOnSubmit) {
      propOnSubmit(e);
    } else {
      e.preventDefault();
      console.log("Sign in attempt with:", { email, password, rememberMe });
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 md:p-6 box-border">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "w-full bg-white shadow-2xl overflow-hidden border border-[#ece7dc]",
          isMobileAppFriendly ? "max-w-md md:max-w-4xl rounded-2xl md:rounded-3xl" : "max-w-4xl rounded-2xl md:rounded-3xl",
          "flex flex-col md:flex-row"
        )}
      >
        {/* Left Side - Animated Global DotMap & Brand Showcase (Desktop/Tablet) */}
        <div className="hidden md:flex w-1/2 min-h-[560px] lg:min-h-[590px] relative overflow-hidden border-r border-[#ece7dc] flex-col items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-orange-100/30">
            <DotMap />
            
            {/* Subtle soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent pointer-events-none" />

            {/* Logo and text overlay - Placed directly below where the animation finishes */}
            <div className="absolute inset-0 flex flex-col items-center z-10 text-center px-8 pointer-events-none">
              {/* Spacer matching the animation area */}
              <div className="h-[34%] min-h-[170px] w-full" />

              {/* Text content placed right below the animation */}
              <div className="flex flex-col items-center justify-start pt-3 pointer-events-auto">
                <motion.div 
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="mb-3.5 relative"
                >
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#ff5722] via-[#ff3b19] to-[#e62e0b] flex items-center justify-center shadow-xl shadow-orange-500/30 ring-4 ring-white">
                    {portalType === "sales" ? (
                      <Zap className="text-white h-7 w-7" />
                    ) : (
                      <ShieldCheck className="text-white h-7 w-7" />
                    )}
                  </div>
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-2xl lg:text-3xl font-extrabold mb-2 tracking-tight text-[#141416]"
                >
                  {brandName}
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="text-xs lg:text-sm text-gray-600 max-w-xs leading-relaxed font-medium px-2"
                >
                  {brandSubtitle}
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / App-UI Header (Shown on mobile screens) */}
        <div className="md:hidden relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-orange-100/40 border-b border-[#ece7dc] p-6 pt-7 text-center">
          <div className="absolute inset-0 opacity-40">
            <DotMap />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#ff5722] to-[#e62e0b] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3 ring-2 ring-white">
              {portalType === "sales" ? (
                <Zap className="text-white h-6 w-6" />
              ) : (
                <ShieldCheck className="text-white h-6 w-6" />
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#141416]">
              {brandName}
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs font-medium">
              {portalSubtitle}
            </p>
          </div>
        </div>
        
        {/* Right side - Sign In Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {/* Desktop form header */}
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
                {portalTitle}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {portalSubtitle}
              </p>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs sm:text-sm font-medium"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label htmlFor="portal-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                  {emailLabel}
                </label>
                <Input
                  id="portal-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  required
                  className="w-full text-sm"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="portal-password" className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Password *
                  </label>
                  {forgotPasswordLink && (
                    <a
                      href={forgotPasswordLink}
                      className="text-xs font-semibold text-[#ff3b19] hover:text-[#e63010] transition-colors"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="portal-password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pr-11 text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#ff3b19] focus:ring-[#ff3b19] cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
              
              {/* Submit Button */}
              <div className="pt-3">
                <motion.div 
                  whileHover={{ scale: 1.008 }}
                  whileTap={{ scale: 0.985 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-11 relative overflow-hidden font-bold text-sm sm:text-base",
                      isHovered ? "shadow-lg shadow-orange-500/35" : ""
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing in...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}

                    {isHovered && !isLoading && (
                      <motion.span
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                        style={{ filter: "blur(6px)" }}
                      />
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Portal Switcher Link */}
              <div className="pt-3.5 mt-2 border-t border-gray-100 text-center">
                {portalType === "admin" ? (
                  <p className="text-xs text-gray-500 font-medium">
                    Sales team member?{" "}
                    <a
                      href="/sales/login"
                      className="text-[#ff3b19] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Login to Sales Panel &rarr;
                    </a>
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 font-medium">
                    Administrator?{" "}
                    <a
                      href="/admin/login"
                      className="text-[#ff3b19] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Login to Admin Panel &rarr;
                    </a>
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbf9f4] p-3 sm:p-6">
      <SignInCard />
    </div>
  );
};

export default Index;
