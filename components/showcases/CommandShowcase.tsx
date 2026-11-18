"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Command, ArrowRight, CornerDownLeft, Sparkles, FolderGit2, Settings, Palette, Terminal, Shield, FileText, Check } from "lucide-react";
import { matchRanges, matchSegments } from "@ui-sdk/core/text-match";
import { createInputHistory } from "@ui-sdk/core";
import { useXRay } from "../hud/XRayContext";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  children?: CommandItem[];
}

export function CommandShowcase({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { flashBehavior, registerActiveBehavior } = useXRay();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<string>("root");
  const [pageTitle, setPageTitle] = useState("全局指令");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [executedFeedback, setExecutedFeedback] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<string[]>(["git status", "theme dark", "deploy"]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command items definitions
  const rootItems: CommandItem[] = useMemo(() => [
    {
      id: "git-commit",
      title: "Git: 提交并推送到远端 (Commit & Push)",
      subtitle: "创建变更 commit 并安全同步到 GitHub",
      category: "版本控制",
      icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />,
      shortcut: "⌘⇧P",
      action: () => triggerAction("Git: Commit & Push 已模拟执行"),
    },
    {
      id: "run-tests",
      title: "运行单元测试套件 (Run Tests)",
      subtitle: "执行 Vitest 测试并生成代码覆盖率报告",
      category: "自动化",
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      shortcut: "⌥T",
      action: () => triggerAction("单元测试套件已在后台启动"),
    },
    {
      id: "open-theme",
      title: "偏好设置: 切换显示主题 (Appearance)",
      subtitle: "进入子菜单配置深色、浅色或高对比模式",
      category: "偏好设置",
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      action: () => {
        setPage("theme");
        setPageTitle("选择主题模式");
        setQuery("");
        setSelectedIndex(0);
        flashBehavior("createPopup:navigatePage");
      },
    },
    {
      id: "open-security",
      title: "安全审计: 扫描依赖漏洞",
      subtitle: "执行 pnpm audit 检查已知 CVE 漏洞",
      category: "安全",
      icon: <Shield className="w-4 h-4 text-blue-400" />,
      action: () => triggerAction("安全审计完成: 0 致命漏洞"),
    },
    {
      id: "open-docs",
      title: "查看 Vercel UI SDK 规范文档",
      subtitle: "打开关于 Headless Behaviors 与 Agent 的完整指导",
      category: "文档",
      icon: <FileText className="w-4 h-4 text-neutral-400" />,
      action: () => triggerAction("已载入 UI SDK 设计手册"),
    },
  ], [flashBehavior]);

  const themeItems: CommandItem[] = useMemo(() => [
    {
      id: "theme-dark",
      title: "暗黑工业风 (Dark Industrial)",
      subtitle: "Vercel Geist 黑色美学，适合夜间高效编码",
      category: "主题",
      icon: <Check className="w-4 h-4 text-blue-400" />,
      action: () => {
        document.documentElement.classList.add("dark");
        triggerAction("已切换为暗黑工业风");
        setPage("root");
        setPageTitle("全局指令");
      },
    },
    {
      id: "theme-light",
      title: "白昼极简风 (Light Minimal)",
      subtitle: "高反差瑞士排版，清晰干净",
      category: "主题",
      icon: <Palette className="w-4 h-4 text-amber-400" />,
      action: () => {
        document.documentElement.classList.remove("dark");
        triggerAction("已切换为白昼极简风");
        setPage("root");
        setPageTitle("全局指令");
      },
    },
  ], []);

  const currentItems = page === "theme" ? themeItems : rootItems;

  // Filter items using matchRanges and fuzzy logic
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return currentItems.map((item) => ({ item, ranges: [] }));
    }
    flashBehavior("fuzzyScore");
    flashBehavior("matchRanges");
    return currentItems
      .map((item) => {
        const ranges = matchRanges(item.title, query, "fuzzy") || [];
        const isMatched = ranges.length > 0 || item.title.toLowerCase().includes(query.toLowerCase());
        return { item, ranges, isMatched };
      })
      .filter((x) => x.isMatched);
  }, [currentItems, query, flashBehavior]);

  const triggerAction = (msg: string) => {
    setExecutedFeedback(msg);
    setTimeout(() => setExecutedFeedback(null), 2500);
    setIsOpen(false);
    flashBehavior("createRovingFocus:select");
  };

  // Keyboard navigation & Input history
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 1. Navigation with ArrowUp / ArrowDown
    if (e.key === "ArrowDown") {
      e.preventDefault();
      flashBehavior("createRovingFocus");
      setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      flashBehavior("createRovingFocus");
      setSelectedIndex((prev) => (filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === "Enter" && filteredItems.length > 0) {
      e.preventDefault();
      const target = filteredItems[selectedIndex]?.item;
      if (target) {
        if (query.trim()) {
          setHistoryItems((prev) => [query, ...prev.filter((q) => q !== query).slice(0, 8)]);
        }
        target.action();
      }
    } else if (e.key === "Backspace" && query === "" && page !== "root") {
      // Return to root page on Backspace if query is empty
      e.preventDefault();
      setPage("root");
      setPageTitle("全局指令");
      setSelectedIndex(0);
      flashBehavior("createPopup:navigateBack");
    } else if (e.key === "Escape") {
      setIsOpen(false);
      flashBehavior("createPopup:dismiss");
    }
  };

  // Listen to Cmd+K to toggle modal
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        flashBehavior("createPopup");
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [flashBehavior]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      const cleanup = registerActiveBehavior("createPopup");
      setTimeout(() => inputRef.current?.focus(), 50);
      return cleanup;
    }
  }, [isOpen, registerActiveBehavior]);

  // Helper to highlight matching text chunks using matchSegments
  const renderHighlighted = (text: string, ranges: { start: number; end: number }[]) => {
    if (!ranges || ranges.length === 0) return <span>{text}</span>;
    const segments = matchSegments(text, ranges);
    return (
      <>
        {segments.map((seg, idx) =>
          seg.match ? (
            <mark
              key={idx}
              className="bg-blue-500/30 text-blue-400 dark:text-blue-300 font-semibold rounded-[2px] px-0.5"
            >
              {seg.text}
            </mark>
          ) : (
            <span key={idx}>{seg.text}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      {/* Showcase Card Header */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-mono text-sm font-bold">
            ⌘
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              ⌘K 多级命令面板
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                Command Palette
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              整合 createPopup、fuzzyScore、matchRanges、createRovingFocus 与 createInputHistory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAgentModal("command")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Agent 组装 Prompt</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true);
              flashBehavior("createPopup");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Command className="w-3.5 h-3.5" />
            <span>唤起面板 (⌘K)</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Playground Preview */}
      <div className="p-5 bg-neutral-100/50 dark:bg-neutral-900/20">
        {executedFeedback && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>执行反馈: {executedFeedback}</span>
          </div>
        )}

        <div className="max-w-xl mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-md overflow-hidden">
          {/* Mock In-Place Command Box for instant testing */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900/60 font-mono">
            <span>当前页面:</span>
            <span className="text-blue-500 font-semibold">{pageTitle}</span>
            {page !== "root" && (
              <button
                onClick={() => {
                  setPage("root");
                  setPageTitle("全局指令");
                }}
                className="ml-auto text-[11px] text-neutral-500 hover:text-neutral-300 underline"
              >
                返回上一级 (Backspace)
              </button>
            )}
          </div>

          <div className="flex items-center px-4 py-3 gap-2.5 border-b border-neutral-200 dark:border-neutral-800">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="搜索操作、菜单或按 ↑↓ 方向键漫游..."
              className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-neutral-400 hover:text-neutral-200 font-mono"
              >
                清空
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1" role="listbox">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                无匹配项。尝试其他关键词搜索或按 ESC。
              </div>
            ) : (
              filteredItems.map(({ item, ranges }, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium">
                          {renderHighlighted(item.title, ranges)}
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-blue-500 opacity-80" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer tips */}
          <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">↑↓</kbd> 漫游
              <kbd className="px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ml-1">↵</kbd> 执行
              <kbd className="px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ml-1">Esc</kbd> 退出
            </span>
            <span className="text-blue-500">
              createRovingFocus ({selectedIndex + 1}/{filteredItems.length})
            </span>
          </div>
        </div>
      </div>

      {/* Floating Global Modal (When Cmd+K is pressed) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3.5 gap-3 border-b border-neutral-200 dark:border-neutral-800">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="输入命令或按 ↑↓ 浏览..."
                className="w-full bg-transparent text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              />
              <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.map(({ item, ranges }, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-medium">
                          {renderHighlighted(item.title, ranges)}
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft className="w-4 h-4 text-blue-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
