"use client";

import { useState, useCallback } from "react";
import { Toast, ToastType } from "@/components/ui/Toast";

interface ToastState {
  message: string;
  type: ToastType;
  isOpen: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    setToast({ message, type, isOpen: true });
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, "success", duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, "warning", duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, "info", duration);
  }, [showToast]);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ToastComponent = useCallback(() => (
    <Toast
      message={toast.message}
      type={toast.type}
      isOpen={toast.isOpen}
      onClose={closeToast}
    />
  ), [toast, closeToast]);

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    ToastComponent,
  };
}






