import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
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
    <div className="fixed bottom-5 right-5 bg-white px-6 py-3 rounded-md shadow-md z-50 max-w-sm">
      {message}
    </div>
  );
}
