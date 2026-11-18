"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export interface KeyStroke {
  id: string;
  key: string;
  modifiers: string[];
  timestamp: number;
}

export interface FocusSnapshot {
  tagName: string;
  role: string | null;
  tabIndex: number;
  ariaLabel: string | null;
  className: string;
  textSnippet: string;
}

interface XRayContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  keyHistory: KeyStroke[];
  activeBehaviors: Set<string>;
  registerActiveBehavior: (behaviorName: string) => () => void;
  currentFocus: FocusSnapshot | null;
  flashBehavior: (behaviorName: string) => void;
  flashedBehaviors: Record<string, number>;
}

const XRayContext = createContext<XRayContextType | null>(null);

export function XRayProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyHistory, setKeyHistory] = useState<KeyStroke[]>([]);
  const [activeBehaviors, setActiveBehaviors] = useState<Set<string>>(new Set());
  const [flashedBehaviors, setFlashedBehaviors] = useState<Record<string, number>>({});
  const [currentFocus, setCurrentFocus] = useState<FocusSnapshot | null>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Flash a behavior in the HUD when triggered
  const flashBehavior = useCallback((behaviorName: string) => {
    setFlashedBehaviors((prev) => ({ ...prev, [behaviorName]: Date.now() }));
    setTimeout(() => {
      setFlashedBehaviors((prev) => {
        const next = { ...prev };
        delete next[behaviorName];
        return next;
      });
    }, 1500);
  }, []);

  // Register an active behavior (e.g. while interacting inside a component)
  const registerActiveBehavior = useCallback((behaviorName: string) => {
    setActiveBehaviors((prev) => new Set(prev).add(behaviorName));
    return () => {
      setActiveBehaviors((prev) => {
        const next = new Set(prev);
        next.delete(behaviorName);
        return next;
      });
    };
  }, []);

  // Keyboard and focus tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle X-Ray on pressing 'x' or 'X' unless user is inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");

      if ((e.key === "x" || e.key === "X") && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Record keystroke for HUD
      const modifiers: string[] = [];
      if (e.metaKey) modifiers.push("⌘");
      if (e.ctrlKey) modifiers.push("Ctrl");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");

      let displayKey = e.key;
      if (displayKey === " ") displayKey = "Space";
      if (displayKey === "ArrowUp") displayKey = "↑";
      if (displayKey === "ArrowDown") displayKey = "↓";
      if (displayKey === "ArrowLeft") displayKey = "←";
      if (displayKey === "ArrowRight") displayKey = "→";
      if (displayKey === "Escape") displayKey = "Esc";

      const stroke: KeyStroke = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: displayKey,
        modifiers,
        timestamp: Date.now(),
      };

      setKeyHistory((prev) => [stroke, ...prev.slice(0, 7)]);
    };

    const handleFocusChange = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) {
        setCurrentFocus(null);
        return;
      }

      setCurrentFocus({
        tagName: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
        tabIndex: el.tabIndex,
        ariaLabel: el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"),
        className: el.className ? String(el.className).split(" ").slice(0, 3).join(" ") : "",
        textSnippet: (el.innerText || el.textContent || "").trim().slice(0, 24),
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("focusin", handleFocusChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocusChange);
    };
  }, []);

  return (
    <XRayContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        keyHistory,
        activeBehaviors,
        registerActiveBehavior,
        currentFocus,
        flashBehavior,
        flashedBehaviors,
      }}
    >
      {children}
    </XRayContext.Provider>
  );
}

export function useXRay() {
  const context = useContext(XRayContext);
  if (!context) {
    throw new Error("useXRay must be used within an XRayProvider");
  }
  return context;
}
