"use client";

import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

const SidebarContext = createContext(undefined);

const RAIL_WIDTH = 76;
const OPEN_WIDTH = 248;

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openState;
  const setOpen = (value) => {
    setOpenState(value);
  };

  const openMobile = openProp !== undefined ? openProp : openState;
  const setOpenMobile = setOpenProp !== undefined ? setOpenProp : setOpen;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, openMobile, setOpenMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

// Navy icon rail. The rail keeps a fixed footprint in the layout and expands
// over the page on hover, so content never reflows while browsing the menu.
export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <div className="hidden md:block flex-shrink-0 sticky top-0 h-screen z-[90]" style={{ width: RAIL_WIDTH }}>
      <motion.div
        className={cn(
          "admin-rail h-screen px-3 py-4 flex flex-col text-white overflow-y-auto overflow-x-hidden select-none [overscroll-behavior:contain] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          open && "admin-rail--open",
          className
        )}
        initial={false}
        animate={{
          width: animate ? (open ? OPEN_WIDTH : RAIL_WIDTH) : OPEN_WIDTH,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Mobile drawer (opened from the header's menu button).
export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();
  const isMobileOpen = openMobile !== undefined ? openMobile : open;
  const setIsMobileOpen = setOpenMobile || setOpen;

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" {...props}>
          <motion.div
            className="absolute inset-0 bg-[rgba(2,20,53,0.55)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className={cn(
              "admin-rail admin-rail--open absolute inset-y-0 left-0 w-[284px] max-w-[86vw] text-white p-5 flex flex-col justify-between overflow-y-auto",
              className
            )}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute right-4 top-4 z-50 text-white/80 p-2 hover:bg-white/10 rounded-full transition"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const SidebarLink = ({ link, className, onClick, ...props }) => {
  const { open, animate, openMobile } = useSidebar();
  const IconComponent = link.icon;
  const linkPath = link.href || link.path || "#";
  const showLabel = !animate || open || openMobile;

  return (
    <NavLink
      to={linkPath}
      onClick={onClick}
      title={link.label}
      className={({ isActive }) =>
        cn("admin-rail-link group/sidebar", (isActive || link.isActive) && "is-active", className)
      }
      {...props}
    >
      <span className="admin-rail-icon">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : IconComponent ? (
          <IconComponent size={19} strokeWidth={1.75} />
        ) : null}
      </span>
      <motion.span
        initial={false}
        animate={{
          opacity: showLabel ? 1 : 0,
          x: showLabel ? 0 : -6,
        }}
        transition={{ duration: 0.2 }}
        className="admin-rail-label"
        style={{ pointerEvents: showLabel ? "auto" : "none" }}
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};
