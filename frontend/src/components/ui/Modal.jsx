import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Shared dialog. Admin: crisp white sheet that rises and settles (the
// "Save a new search" dialog of the lead-management reference). Sales: the
// same motion with the cream/ink skin from styles/sales-theme.css.
export const Modal = ({ isOpen, onClose, title, children, maxWidth = "560px" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="lg-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === "string" ? title : undefined}
          className="lg-modal"
          style={{ maxWidth }}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
        >
          <div className="lg-modal-header">
            <h3 className="lg-modal-title">{title}</h3>
            <button type="button" onClick={onClose} className="lg-modal-close" aria-label="Close">
              <X size={17} />
            </button>
          </div>
          <div className="lg-modal-body">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
