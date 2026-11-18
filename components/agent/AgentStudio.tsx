"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UISdkAgentUIMessage } from "@/lib/ai/ui-sdk-agent";
import { useXRay } from "@/components/hud/XRayContext";
import {
  Bot,
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  Loader2,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Wrench,
} from "lucide-react";

const PRESET_PROMPTS = [
  {
    label: "空间寻路 Icon Picker",
    prompt: "组装一个带模糊搜索、Popover 定位和二维空间方向键导航的无障碍 Icon Picker",
  },
  {
    label: "键盘重排树形目录",
    prompt: "构建一个支持全键盘无障碍拖拽重排、Typeahead 跳跃和节点删除焦点自愈的文件树组件",
  },
  {
    label: "万行虚拟多选框",
    prompt: "做一个支持 10,000 行虚拟滚动、Shift 区间多选和键盘漫游的下拉列表组件",
  },
  {
    label: "Agent 桥接受控表单",
    prompt: "用 @ui-sdk/react/agent 的 createAgent 桥接一个表单输入框，让外部 AI 直接读取 snapshot 并调用 act 修改值",
  },
];

function FormattedTextLine({ text }: { text: string }) {
  // Safe inline parser for **bold** and `code` without dangerouslySetInnerHTML
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((token, idx) => {
        if (token.startsWith("**") && token.endsWith("**")) {
          return (
            <strong
              key={idx}
              className="font-semibold text-neutral-900 dark:text-neutral-100"
            >
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-blue-600 dark:text-blue-300 font-mono text-[11px]"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        return <span key={idx}>{token}</span>;
      })}
    </>
  );
}

function BlueprintCodeCard({
  primitiveFile,
  primitiveCode,
  reactFile,
  reactCode,
  componentTitle,
  selectedBehaviors,
  ariaContract,
}: {
  primitiveFile: string;
  primitiveCode: string;
  reactFile: string;
  reactCode: string;
  componentTitle: string;
  selectedBehaviors: string[];
  ariaContract: string[];
}) {
  const [tab, setTab] = useState<"primitive" | "react">("primitive");
  const [copied, setCopied] = useState(false);

  const activeCode = tab === "primitive" ? primitiveCode : reactCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 overflow-hidden shadow-md">
      <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-100">
            {componentTitle}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
            composePrimitive ✓
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-md border border-neutral-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setTab("primitive")}
              className={`px-2.5 py-1 rounded transition-colors ${
                tab === "primitive"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {primitiveFile}
            </button>
            <button
              type="button"
              onClick={() => setTab("react")}
              className={`px-2.5 py-1 rounded transition-colors ${
                tab === "react"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {reactFile}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-white text-neutral-950 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Behavior & ARIA chips */}
      <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-900/30 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
        {selectedBehaviors.map((b) => (
          <span
            key={b}
            className="px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/50"
          >
            {b}
          </span>
        ))}
        {ariaContract.map((a) => (
          <span
            key={a}
            className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
          >
            {a}
          </span>
        ))}
      </div>

      <pre className="p-4 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed max-h-80">
        <code>{activeCode}</code>
      </pre>
    </div>
  );
}

export function AgentStudio() {
  const { flashBehavior } = useXRay();
  const [input, setInput] = useState("");
  const [runtimeInfo, setRuntimeInfo] = useState<{
    mode: "ai-gateway" | "local-fallback";
    model: string;
  } | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent" }),
    []
  );

  const { messages, sendMessage, status, stop, setMessages, error } =
    useChat<UISdkAgentUIMessage>({ transport });

  const isBusy = status === "submitted" || status === "streaming";
  const flashedToolIdsRef = useRef<Set<string>>(new Set());
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((data) => setRuntimeInfo(data))
      .catch(() => null);
  }, []);

  // Flash discovered behaviors in the global X-Ray HUD when tools complete
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (
          part.type === "tool-searchBehaviors" &&
          part.state === "output-available" &&
          !flashedToolIdsRef.current.has(part.toolCallId)
        ) {
          flashedToolIdsRef.current.add(part.toolCallId);
          part.output.behaviors.forEach((b) => flashBehavior(b.name));
        }
        if (
          part.type === "tool-composePrimitive" &&
          part.state === "output-available" &&
          !flashedToolIdsRef.current.has(part.toolCallId)
        ) {
          flashedToolIdsRef.current.add(part.toolCallId);
          flashBehavior("definePrimitive");
          part.output.selectedBehaviors.forEach((name) => flashBehavior(name));
        }
      }
    }
    if (scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  }, [messages, flashBehavior]);

  const submitPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    flashBehavior("ToolLoopAgent");
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      {/* Studio Top Bar */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-500 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                UI SDK AI Agent 实时组装台
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Vercel AI SDK · ToolLoopAgent
              </span>
              {runtimeInfo && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                    runtimeInfo.mode === "ai-gateway"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                  }`}
                >
                  {runtimeInfo.mode === "ai-gateway"
                    ? `AI Gateway · ${runtimeInfo.model}`
                    : "Zero-Key Local Loop (配置 AI_GATEWAY_API_KEY 自动升格实时模型)"}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              多步工具循环：<code>searchBehaviors</code> → <code>inspectBehaviorDoc</code> (读取随包文档) → <code>composePrimitive</code>
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空会话</span>
          </button>
        )}
      </div>

      {/* Preset Quick Triggers */}
      <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-950 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          试试指令:
        </span>
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={isBusy}
            onClick={() => submitPrompt(preset.prompt)}
            className="px-2.5 py-1 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Messages & Multi-Step Tool Trace Stream */}
      <div
        ref={scrollBoxRef}
        className="p-5 min-h-[300px] max-h-[560px] overflow-y-auto space-y-5 bg-neutral-100/40 dark:bg-neutral-950/60"
      >
        {messages.length === 0 ? (
          <div className="py-12 text-center max-w-lg mx-auto space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-200/70 dark:bg-neutral-900 border border-neutral-300/60 dark:border-neutral-800 mx-auto flex items-center justify-center text-neutral-500">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              输入你想构建的交互组件，观察 AI SDK Agent 如何调用工具组装无头原语
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              不同于直接裸写几百行脆弱的键盘/DOM 监听代码，Agent 会先检索 <code>@ui-sdk/core</code> 行为目录、核对本地 <code>node_modules/@ui-sdk/core/docs</code> 文档，再输出标准 <code>definePrimitive</code> 与 <code>createParts</code> 代码。
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-2 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="text-[11px] font-mono text-neutral-400 px-1">
                {message.role === "user" ? "You" : "UI SDK Architect Agent"}
              </div>

              {message.role === "user" ? (
                <div className="max-w-2xl px-4 py-2.5 rounded-2xl rounded-tr-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs sm:text-sm shadow-sm">
                  {message.parts.map((part, idx) =>
                    part.type === "text" ? (
                      <span key={idx}>{part.text}</span>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="w-full max-w-4xl space-y-2.5">
                  {message.parts.map((part, idx) => {
                    if (part.type === "text") {
                      if (!part.text.trim()) return null;
                      return (
                        <div
                          key={`${message.id}-txt-${idx}`}
                          className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-1.5"
                        >
                          {part.text.split("\n").map((line, lIdx) => (
                            <p key={lIdx} className={line.startsWith(">") ? "pl-3 border-l-2 border-blue-500/50 text-xs text-neutral-500 dark:text-neutral-400 mt-2" : ""}>
                              <FormattedTextLine text={line.replace(/^>\s*/, "")} />
                            </p>
                          ))}
                        </div>
                      );
                    }

                    if (part.type === "tool-searchBehaviors") {
                      const done = part.state === "output-available";
                      return (
                        <div
                          key={part.toolCallId}
                          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/50 text-xs font-mono"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                              {done ? (
                                <Search className="w-3.5 h-3.5" />
                              ) : (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              <span>Step 1 · tool: searchBehaviors</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {done
                                ? `命中 ${part.output.matchedCount} 个原语`
                                : "正在检索 @ui-sdk/core..."}
                            </span>
                          </div>

                          {done && (
                            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {part.output.behaviors.map((b) => (
                                <div
                                  key={b.name}
                                  className="p-2 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-[11px]">
                                      {b.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                      {b.category}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-sans text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                                    {b.summary}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (part.type === "tool-inspectBehaviorDoc") {
                      const done = part.state === "output-available";
                      return (
                        <details
                          key={part.toolCallId}
                          className="group p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/50 text-xs font-mono"
                        >
                          <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
                              {done ? (
                                <BookOpen className="w-3.5 h-3.5" />
                              ) : (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              <span>Step 2 · tool: inspectBehaviorDoc</span>
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {done
                                ? `${part.output.sourceFile} · ${part.output.heading} (点击展开)`
                                : "读取随包 Markdown 文档..."}
                            </span>
                          </summary>
                          {done && (
                            <pre className="mt-2.5 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap max-h-48">
                              {part.output.excerpt}
                            </pre>
                          )}
                        </details>
                      );
                    }

                    if (part.type === "tool-composePrimitive") {
                      if (part.state !== "output-available") {
                        return (
                          <div
                            key={part.toolCallId}
                            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/50 text-xs font-mono flex items-center gap-2 text-emerald-500"
                          >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Step 3 · tool: composePrimitive — 正在生成 definePrimitive 与 createParts...</span>
                          </div>
                        );
                      }
                      return (
                        <BlueprintCodeCard
                          key={part.toolCallId}
                          primitiveFile={part.output.primitiveFile}
                          primitiveCode={part.output.primitiveCode}
                          reactFile={part.output.reactFile}
                          reactCode={part.output.reactCode}
                          componentTitle={part.output.componentTitle}
                          selectedBehaviors={part.output.selectedBehaviors}
                          ariaContract={part.output.ariaContract}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          ))
        )}

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-500 text-xs font-mono">
            请求异常: {error.message}
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPrompt(input);
        }}
        className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center gap-2"
      >
        <Wrench className="w-4 h-4 text-neutral-400 ml-2 flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述你想组装的组件，例如：做一个支持键盘穿梭和模糊搜索的标签选择器..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none py-1.5"
        />

        {isBusy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>停止</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            <span>组装原语</span>
          </button>
        )}
      </form>
    </div>
  );
}
