"use client";

import React from "react";
import { Sparkles, ArrowRight, Eye, Code2, Layers, Cpu, Compass } from "lucide-react";
import { useXRay } from "./hud/XRayContext";

export function Hero({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { toggleOpen, isOpen } = useXRay();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden bg-grid-pattern">
      {/* Radial soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Vercel Labs · AI Agent-First UI Architecture</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.1] mb-6">
            Behaviors,
            <span className="block text-neutral-400 dark:text-neutral-500 font-normal">
              Not Finished Components.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 max-w-2xl font-normal">
            打破传统 UI 库将逻辑与样式强制绑定的弊端。
            <strong className="text-neutral-900 dark:text-neutral-200 font-medium"> UI SDK </strong>
            提供 50+ 个纯净的无头行为积木（焦点漫游、区域框选、拖拽重排、虚拟滚动），供 AI Agent 与工程师自由组装成极致交互体验。
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#showcases"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-neutral-900 hover:bg-black dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-950 transition-all shadow-sm"
            >
              <span>体验复合组件 Showcase</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={toggleOpen}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                isOpen
                  ? "bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isOpen ? "关闭 X-Ray 探针" : "开启 X-Ray 探针 (按 X)"}</span>
            </button>

            <button
              onClick={() => onOpenAgentModal("command")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>复制 Agent 组装 Prompt</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Architecture Diagram */}
        <div className="mt-14 max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/90 bg-neutral-50/50 dark:bg-neutral-950/60 backdrop-blur-sm">
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              UI SDK 架构分层原理
            </span>
            <span className="text-[11px] text-neutral-400">解耦行为与渲染</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tier 1 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                    第 1 层：核心行为积木
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono">
                    @ui-sdk/core
                  </span>
                </div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  Headless Behaviors
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  提供状态机、键盘捕获、2D 焦点寻路、无障碍播报。没有任何 DOM 依赖与样式限制。
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  createRovingFocus
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  createGridFocus
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  createLasso
                </span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    第 2 层：框架层适配
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                    Adapters
                  </span>
                </div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  React 19 / Vue / Svelte
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  通过 <code>definePrimitive</code> 与 <code>createParts</code> 将行为无缝绑定至各框架的虚拟 DOM 与 Slots。
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  createParts()
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Slots & Props
                </span>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">
                    第 3 层：业务层组合
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-mono">
                    AI Agent / Dev
                  </span>
                </div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  自由视觉与交互
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  开发者或 AI Agent 只需关注视觉表现（Tailwind / CSS）和业务场景组合，零无障碍与焦点负担。
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Command Palette
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Data Grid
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Kanban
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
