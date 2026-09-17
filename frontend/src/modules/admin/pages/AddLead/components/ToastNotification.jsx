import React, { useEffect } from "react";

export const ToastNotification = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && typeof onClose === "function") {
      onClose();
    }
  }, [isOpen, onClose]);

  return null;
};
