"use client";

import React, { useState } from "react";
import { XRayProvider } from "@/components/hud/XRayContext";
import { XRayHUD } from "@/components/hud/XRayHUD";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CommandShowcase } from "@/components/showcases/CommandShowcase";
import { DataGridShowcase } from "@/components/showcases/DataGridShowcase";
import { KanbanShowcase } from "@/components/showcases/KanbanShowcase";
import { CanvasShowcase } from "@/components/showcases/CanvasShowcase";
import { BentoLab } from "@/components/bento/BentoLab";
import { AgentStudio } from "@/components/agent/AgentStudio";
import { AgentPromptModal } from "@/components/ui/AgentPromptModal";
import { Sparkles, Layers, Box, ExternalLink, Cpu, Bot } from "lucide-react";

export default function Home() {
  const [activeModalPromptId, setActiveModalPromptId] = useState<string | null>(null);

  return (
    <XRayProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        {/* Navigation Header */}
        <Header onOpenAgentModal={(id) => setActiveModalPromptId(id)} />

        {/* Hero Section */}
        <Hero onOpenAgentModal={(id) => setActiveModalPromptId(id)} />

        {/* Main Content Sections */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 space-y-20">
          {/* Section 0: Vercel AI SDK ToolLoopAgent Studio */}
          <section id="agent-studio" className="space-y-6 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">
                  <Bot className="w-4 h-4" />
                  <span>VERCEL AI SDK · TOOLLOOPAGENT STUDIO</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  UI SDK AI Agent 组装台
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
                  基于 Vercel AI SDK <code>ToolLoopAgent</code> 与 AI Gateway 构建。自动检索 <code>@ui-sdk/core</code> 原语、查阅本地随包 Markdown 文档并编排无障碍组件源码。
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>开启 X-Ray 可同步观察 Agent 命中的原语</span>
              </div>
            </div>

            <AgentStudio />
          </section>

          {/* Section 1: 4 Major Composite Showcases */}
          <section id="showcases" className="space-y-10 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-2">
                  <Layers className="w-4 h-4" />
                  <span>COMPOSITE SHOWCASE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  四大标杆复合组件实战
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
                  以纯粹的 <code>@ui-sdk/core</code> 底层 Behavior 积木组合而成。零外部重型 UI 库依赖，完整保留极致手感与 WAI-ARIA 无障碍标准。
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>支持纯键盘无障碍漫游</span>
              </div>
            </div>

            {/* Showcase 1: Command Palette */}
            <CommandShowcase onOpenAgentModal={(id) => setActiveModalPromptId(id)} />

            {/* Showcase 2: 2D Data Grid */}
            <DataGridShowcase onOpenAgentModal={(id) => setActiveModalPromptId(id)} />

            {/* Showcase 3: Dual-Mode Kanban */}
            <KanbanShowcase onOpenAgentModal={(id) => setActiveModalPromptId(id)} />

            {/* Showcase 4: Resizable Canvas & Lasso */}
            <CanvasShowcase onOpenAgentModal={(id) => setActiveModalPromptId(id)} />
          </section>

          {/* Section 2: Atomic Bento Labs */}
          <section id="bento-labs" className="space-y-8 scroll-mt-20 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                  <Box className="w-4 h-4" />
                  <span>ATOMIC BEHAVIORS BENTO LAB</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  原子 Behavior Bento 实验室
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
                  一屏可玩的最惊艳原子行为原语。体验看不见却至关重要的焦点保护、空间几何向量寻路、打字跳转与手势防抖。
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
                <span>点击右上角 <Sparkles className="w-3.5 h-3.5 inline text-blue-500" /> 可复制对应 Agent 组装 Prompt</span>
              </div>
            </div>

            {/* Bento Lab 6 Cards */}
            <BentoLab onOpenAgentModal={(id) => setActiveModalPromptId(id)} />
          </section>

          {/* Section 3: Agent Integration Blueprint */}
          <section className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-600 dark:text-purple-400 mb-2">
                <Cpu className="w-4 h-4" />
                <span>AGENT-FIRST ECOSYSTEM</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                为什么 UI SDK 是专为 AI Coding Agent 打造的？
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                以往让 LLM 生成复杂组件（如带有键盘无障碍的多选表格或命令面板）时，大模型经常写出成百上千行充满事件监听漏洞、焦点丢失与 ARIA 缺陷的臃肿代码。
                而在 UI SDK 范式下，Agent 只需要声明需要的底层 Behavior 积木，框架自动保证键盘漫游与无障碍契约。
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveModalPromptId("command")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>查看标准 Agent 组装 Prompt 模板</span>
                </button>

                <a
                  href="https://github.com/vercel-labs/ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <span>vercel-labs/ui GitHub 仓库</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 bg-neutral-50 dark:bg-black/60 text-xs text-neutral-500 font-mono transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-neutral-200">UI SDK Demo</span>
              <span>· Powered by Vercel Labs @ui-sdk/core</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Next.js 15 App Router</span>
              <span>·</span>
              <span>React 19</span>
              <span>·</span>
              <span>Tailwind CSS</span>
              <span>·</span>
              <a
                href="https://ui-sdk.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 dark:hover:text-white underline"
              >
                ui-sdk.dev
              </a>
            </div>
          </div>
        </footer>

        {/* Behavior X-Ray HUD Floating Controller */}
        <XRayHUD />

        {/* Agent Prompt & Source Code Modal */}
        <AgentPromptModal
          promptId={activeModalPromptId}
          onClose={() => setActiveModalPromptId(null)}
        />
      </div>
    </XRayProvider>
  );
}
