"use client";

import { useState } from "react";

type ViewMode = "grid" | "list";

export function useViewToggle(storageKey: string, defaultView: ViewMode = "grid") {
  const [view, setView] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(`view-toggle-${storageKey}`);
      if (stored === "grid" || stored === "list") {
        return stored;
      }
    } catch {
      // localStorage not available
    }
    return defaultView;
  });

  const toggleView = (newView: ViewMode) => {
    setView(newView);
    try {
      localStorage.setItem(`view-toggle-${storageKey}`, newView);
    } catch {
      // localStorage not available
    }
  };

  return { view, toggleView };
}
