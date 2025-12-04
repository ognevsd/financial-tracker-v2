import { useEffect } from "react";

export const useEscModalClose = (isOpen: boolean, onClose: () => void) => {
  // Close modal when Esc is clicked
  useEffect(() => {
    const handleEscClick = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscClick);
    };
  }, [isOpen, onClose]);
};
