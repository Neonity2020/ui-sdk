"use client";

import React from "react";
import { useXRay } from "./XRayContext";
import { Activity, Radio, Eye, Layers, Compass, Zap, X } from "lucide-react";

export function XRayHUD() {
  const {
    isOpen,
    toggleOpen,
    keyHistory,
    activeBehaviors,
    flashedBehaviors,
    currentFocus,
  } = useXRay();

  const allActiveOrFlashed = Array.from(
    new Set([...Array.from(activeBehaviors), ...Object.keys(flashedBehaviors)])
  );

  return (
    <>
      {/* Floating Radar Capsule (Always visible, minimal & non-intrusive) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={toggleOpen}
          aria-label="Toggle Behavior X-Ray HUD"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all text-xs font-mono select-none ${
            isOpen
              ? "bg-blue-950/80 border-blue-500/60 text-blue-200 ring-2 ring-blue-500/20 shadow-blue-900/30"
              : "bg-neutral-900/80 hover:bg-neutral-800/90 border-neutral-800 text-neutral-300 hover:text-white"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOpen ? "bg-blue-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOpen ? "bg-blue-500" : "bg-emerald-500"
              }`}
            />
          </span>

          <span className="font-semibold tracking-wide">
            {isOpen ? "X-Ray 透视: 开启" : "X-Ray 透视"}
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800/80 text-neutral-400 border border-neutral-700/60">
            按 X
          </span>

          {allActiveOrFlashed.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
              {allActiveOrFlashed.length} 活跃
            </span>
          )}
        </button>
      </div>

      {/* Expanded HUD Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] rounded-xl border border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md shadow-2xl p-4 text-xs font-mono animate-fade-in flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-neutral-200 font-medium">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Behavior X-Ray HUD</span>
              <span className="text-[10px] text-neutral-500 px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800">
                实时探针
              </span>
            </div>
            <button
              onClick={toggleOpen}
              className="text-neutral-500 hover:text-neutral-300 p-1 rounded hover:bg-neutral-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Key Stream */}
          <div>
            <div className="text-[11px] text-neutral-400 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Radio className="w-3 h-3 text-emerald-400" />
                实时按键流 (Key Stream)
              </span>
              <span className="text-[10px] text-neutral-500">最近 8 次</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 min-h-[32px]">
              {keyHistory.length === 0 ? (
                <span className="text-[11px] text-neutral-600 italic">在页面中操作键盘按键...</span>
              ) : (
                keyHistory.map((k, idx) => (
                  <div
                    key={k.id}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded text-[11px] font-mono border whitespace-nowrap transition-all ${
                      idx === 0
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-300 scale-105 shadow-sm"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    {k.modifiers.map((m) => (
                      <span key={m} className="text-[9px] text-neutral-500">
                        {m}+
                      </span>
                    ))}
                    <span>{k.key}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Active Focus Inspector */}
          <div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              活动 DOM 焦点探针 (Focus Inspector)
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-[11px] leading-relaxed">
              {currentFocus ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">元素:</span>
                    <span className="text-cyan-300 font-semibold">&lt;{currentFocus.tagName}&gt;</span>
                  </div>
                  {currentFocus.role && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">ARIA Role:</span>
                      <span className="text-emerald-400 font-mono">role=&quot;{currentFocus.role}&quot;</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Tab Index:</span>
                    <span className="text-amber-400">{currentFocus.tabIndex}</span>
                  </div>
                  {currentFocus.ariaLabel && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Aria Label:</span>
                      <span className="text-neutral-300 truncate max-w-[180px]">
                        &quot;{currentFocus.ariaLabel}&quot;
                      </span>
                    </div>
                  )}
                  {currentFocus.textSnippet && (
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[10px]">
                      <span className="text-neutral-500">文本:</span>
                      <span className="text-neutral-400 truncate max-w-[200px]">
                        &quot;{currentFocus.textSnippet}&quot;
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-600 text-center py-1">未捕获焦点（点击或 Tab 聚焦任一组件）</div>
              )}
            </div>
          </div>

          {/* 3. Active Behavior Matrix */}
          <div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              当前活跃 Behavior 积木 (Active Behaviors)
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60">
              {allActiveOrFlashed.length === 0 ? (
                <span className="text-[11px] text-neutral-600 italic">操作下方组件触发行为积木...</span>
              ) : (
                allActiveOrFlashed.map((name) => {
                  const isFlashed = Boolean(flashedBehaviors[name]);
                  return (
                    <span
                      key={name}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                        isFlashed
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/60 scale-105 shadow-sm shadow-amber-900/20"
                          : "bg-blue-900/30 text-blue-300 border-blue-700/50"
                      }`}
                    >
                      {name}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
