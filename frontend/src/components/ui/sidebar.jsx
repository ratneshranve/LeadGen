"use client";

import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const SidebarContext = createContext(undefined);

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

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-3 py-4 hidden md:flex md:flex-col bg-[#141416] text-white border-r border-white/10 w-[280px] flex-shrink-0 sticky top-0 z-40 overflow-y-auto select-none [overscroll-behavior:contain] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "70px") : "280px",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();
  const isMobileOpen = openMobile !== undefined ? openMobile : open;
  const setIsMobileOpen = setOpenMobile || setOpen;

  return (
    <div
      className={cn(
        "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-[#141416] text-white border-b border-white/10 w-full sticky top-0 z-50"
      )}
      {...props}
    >
      <div className="flex justify-between items-center z-20 w-full">
        <span className="font-bold text-sm tracking-tight text-white">LeadGen</span>
        <Menu
          className="text-white cursor-pointer"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        />
      </div>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-[#141416] text-white p-6 z-[100] flex flex-col justify-between overflow-y-auto",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-white cursor-pointer p-2 hover:bg-white/10 rounded-full transition"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({ link, className, onClick, ...props }) => {
  const { open, animate } = useSidebar();
  const IconComponent = link.icon;
  const linkPath = link.href || link.path || "#";

  return (
    <NavLink
      to={linkPath}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/sidebar text-white/70 hover:text-white hover:bg-white/10",
          (isActive || link.isActive) && "bg-[#ff3b19] !text-white font-bold shadow-lg shadow-[#ff3b19]/30",
          className
        )
      }
      {...props}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : IconComponent ? (
          <IconComponent size={19} />
        ) : null}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.2 }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-nowrap overflow-hidden text-ellipsis !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};
