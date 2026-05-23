"use client";

import { useEffect } from "react";

// Close a modal when the user presses Escape. Pass null to disable
// (e.g. when the modal is not currently open).
export function useEscapeClose(onClose: (() => void) | null): void {
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
}
