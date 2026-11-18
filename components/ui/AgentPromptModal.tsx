"use client";

import React, { useState } from "react";
import { Copy, Check, X, Terminal, Code2, Sparkles } from "lucide-react";
import { AGENT_PROMPTS } from "@/lib/agent-prompts";

interface AgentPromptModalProps {
  promptId: string | null;
  onClose: () => void;
}

export function AgentPromptModal({ promptId, onClose }: AgentPromptModalProps) {
  const [copiedType, setCopiedType] = useState<"prompt" | "source" | null>(null);
  const [activeTab, setActiveTab] = useState<"prompt" | "source">("prompt");

  if (!promptId) return null;
  const data = AGENT_PROMPTS[promptId];
  if (!data) return null;

  const handleCopy = (text: string, type: "prompt" | "source") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                {data.title}
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                  {data.category}
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{data.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Behaviors Used */}
        <div className="px-5 py-2.5 bg-neutral-900/30 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-500 font-mono flex-shrink-0">驱动原语:</span>
          {data.behaviors.map((b) => (
            <span
              key={b}
              className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 font-mono border border-blue-800/40 text-[11px] flex-shrink-0"
            >
              {b}
            </span>
          ))}
        </div>

        {/* Tabs & Actions */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("prompt")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "prompt"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Agent 组装 Prompt
            </button>
            <button
              onClick={() => setActiveTab("source")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "source"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              definePrimitive 源码
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeTab === "prompt" ? data.agentPrompt : data.primitiveSource, activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 hover:bg-white text-neutral-900 transition-colors"
          >
            {copiedType === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制{activeTab === "prompt" ? " Prompt" : " 源码"}
              </>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-neutral-300 bg-neutral-950/60 leading-relaxed select-text">
          {activeTab === "prompt" ? (
            <div className="whitespace-pre-wrap rounded-lg bg-neutral-900/60 p-4 border border-neutral-800/80 font-sans text-xs text-neutral-200 leading-normal">
              {data.agentPrompt}
            </div>
          ) : (
            <pre className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800/80 overflow-x-auto text-blue-300">
              <code>{data.primitiveSource}</code>
            </pre>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/40 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>可以直接投喂给 Cursor, Claude, Antigravity 或任何支持 @ui-sdk 的 AI Coding Agent</span>
          <span className="font-mono text-neutral-600">@ui-sdk/core</span>
        </div>
      </div>
    </div>
  );
}
