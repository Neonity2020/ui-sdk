"use client";

import React, { useEffect, useState } from "react";
import { Github, Sun, Moon, Sparkles, Terminal, Activity, Layers } from "lucide-react";
import { useXRay } from "./hud/XRayContext";

export function Header({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { isOpen, toggleOpen } = useXRay();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial dark mode
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            {/* Vercel Geometric Triangle */}
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                viewBox="0 0 1155 1000"
                className="w-5 h-5 fill-black dark:fill-white transition-transform group-hover:scale-105"
              >
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                UI SDK
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-neutral-600 dark:text-neutral-400">
                @ui-sdk/core
              </span>
            </div>
          </a>

          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>50+ Headless Behaviors Active</span>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <a
            href="#agent-studio"
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Agent 组装台
          </a>
          <a
            href="#showcases"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            复合组件 Showcase
          </a>
          <a
            href="#bento-labs"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            原子 Bento 实验室
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Quick HUD Toggle */}
          <button
            onClick={toggleOpen}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
              isOpen
                ? "bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">X-Ray</span>
            <kbd className="px-1 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400">
              X
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Github / Vercel docs */}
          <a
            href="https://ui-sdk.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            官方文档
          </a>
        </div>
      </div>
    </header>
  );
}
