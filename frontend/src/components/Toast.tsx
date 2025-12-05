import { useEffect } from "react";
import type { ToastType } from "../types/toast";

interface ToastProps {
  message: string;
  type?: ToastType;
  show: boolean;
  onClose: () => void;
}

const typeStyles: Record<ToastType, string> = {
  standard: "bg-white",
  error: "bg-red-50",
  success: "bg-green-50",
};

export default function Toast({
  message,
  type = "standard",
  show,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 px-6 py-3 rounded-md shadow-md z-50 max-w-sm ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
}
