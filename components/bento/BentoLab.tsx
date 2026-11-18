"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Terminal, Keyboard, ShieldAlert, Navigation2, Highlighter, Hand, Trash2, RotateCcw, ArrowRight } from "lucide-react";
import { matchRanges, matchSegments, fuzzyScore } from "@ui-sdk/core/text-match";
import { createInputHistory, nearestInDirection, isTypeaheadKey } from "@ui-sdk/core";
import { useXRay } from "../hud/XRayContext";

export function BentoLab({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { flashBehavior } = useXRay();

  // 1. Typeahead state
  const typeaheadItems = [
    "Apple Safari", "Brave Browser", "Chrome Google", "Docker Engine", "Edge Microsoft",
    "Firefox Mozilla", "Git VCS", "Hyper Terminal", "Insomnia API", "Jest Testing"
  ];
  const [typeaheadActiveIndex, setTypeaheadActiveIndex] = useState(0);
  const [typeaheadBuffer, setTypeaheadBuffer] = useState("");
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTypeaheadKeyDown = (e: React.KeyboardEvent) => {
    if (isTypeaheadKey(e.nativeEvent)) {
      e.preventDefault();
      flashBehavior("createTypeahead");
      const char = e.key.toLowerCase();
      const newBuffer = typeaheadBuffer + char;
      setTypeaheadBuffer(newBuffer);

      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = setTimeout(() => setTypeaheadBuffer(""), 600);

      const matchIdx = typeaheadItems.findIndex((item) =>
        item.toLowerCase().startsWith(newBuffer)
      );
      if (matchIdx !== -1) {
        setTypeaheadActiveIndex(matchIdx);
      }
    }
  };

  // 2. Focus Recovery state
  const [recoveryItems, setRecoveryItems] = useState([
    { id: "rec-1", text: "React 19 核心水合层" },
    { id: "rec-2", text: "焦点自愈钩子 (createFocusRecovery)" },
    { id: "rec-3", text: "Next.js App Router 客户端组件" },
    { id: "rec-4", text: "Tailwind CSS 工业网格" },
  ]);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleDeleteItem = (id: string, index: number) => {
    flashBehavior("createFocusRecovery");
    flashBehavior("keepFocus");

    // Compute next target to transfer focus safely before DOM removal
    const remaining = recoveryItems.filter((item) => item.id !== id);
    const nextTargetIndex = Math.min(index, remaining.length - 1);
    const nextTargetId = remaining[nextTargetIndex]?.id;

    setRecoveryItems(remaining);

    setTimeout(() => {
      if (nextTargetId) {
        setFocusedId(nextTargetId);
        document.getElementById(`rec-btn-${nextTargetId}`)?.focus();
      }
    }, 10);
  };

  const handleResetRecovery = () => {
    setRecoveryItems([
      { id: "rec-1", text: "React 19 核心水合层" },
      { id: "rec-2", text: "焦点自愈钩子 (createFocusRecovery)" },
      { id: "rec-3", text: "Next.js App Router 客户端组件" },
      { id: "rec-4", text: "Tailwind CSS 工业网格" },
    ]);
  };

  // 3. Spatial Move state
  const spatialPoints = [
    { id: "p1", label: "A (0,0)", x: 20, y: 20 },
    { id: "p2", label: "B (140,25)", x: 140, y: 25 },
    { id: "p3", label: "C (60,85)", x: 60, y: 85 },
    { id: "p4", label: "D (180,95)", x: 180, y: 95 },
  ];
  const [activeSpatialId, setActiveSpatialId] = useState("p1");

  const handleSpatialKeyDown = (e: React.KeyboardEvent, currentId: string) => {
    const cur = spatialPoints.find((p) => p.id === currentId);
    if (!cur) return;

    let dir: [number, number] | null = null;
    if (e.key === "ArrowRight") dir = [1, 0];
    else if (e.key === "ArrowLeft") dir = [-1, 0];
    else if (e.key === "ArrowDown") dir = [0, 1];
    else if (e.key === "ArrowUp") dir = [0, -1];

    if (dir) {
      e.preventDefault();
      flashBehavior("spatialMove");
      const fromRect = { left: cur.x, right: cur.x + 40, top: cur.y, bottom: cur.y + 30 };
      const candidates = spatialPoints
        .filter((p) => p.id !== currentId)
        .map((p) => ({ key: p.id, rect: { left: p.x, right: p.x + 40, top: p.y, bottom: p.y + 30 } }));

      const nextKey = nearestInDirection(fromRect, candidates, dir);
      if (nextKey) {
        setActiveSpatialId(nextKey);
        document.getElementById(`sp-btn-${nextKey}`)?.focus();
      }
    }
  };

  // 4. Input History state
  const [historyCmds] = useState(["git status", "pnpm test --watch", "next build", "deploy --prod"]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [draftValue, setDraftValue] = useState("");

  const handleHistoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      flashBehavior("createInputHistory");
      if (historyIndex === -1) {
        setDraftValue(inputValue);
      }
      const nextIdx = Math.min(historyIndex + 1, historyCmds.length - 1);
      setHistoryIndex(nextIdx);
      setInputValue(historyCmds[historyCmds.length - 1 - nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      flashBehavior("createInputHistory");
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputValue(historyCmds[historyCmds.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue(draftValue);
      }
    }
  };

  // 5. Text Match state
  const [matchQuery, setMatchQuery] = useState("api");
  const matchTarget = "Building Robust Web APIs with Next.js App Router";
  const matchScore = fuzzyScore(matchTarget, matchQuery);
  const matchRangesResult = matchRanges(matchTarget, matchQuery, "fuzzy") || [];
  const matchSegmentsResult = matchSegments(matchTarget, matchRangesResult);

  // 6. Drag Threshold state
  const [dragEventLog, setDragEventLog] = useState<string>("就绪：尝试微移或快速拖拽方块");
  const [pointerStart, setPointerStart] = useState<{ x: number; y: number } | null>(null);
  const [isThresholdExceeded, setIsThresholdExceeded] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setPointerStart({ x: e.clientX, y: e.clientY });
    setIsThresholdExceeded(false);
    setDragEventLog("指针按下 (PointerDown)... 正在评估 4px 阈值");
    flashBehavior("dragThreshold");
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStart) return;
    const dist = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y);
    if (dist >= 4 && !isThresholdExceeded) {
      setIsThresholdExceeded(true);
      setDragEventLog(`✓ 位移已达 ${dist.toFixed(1)}px (超过 4px 阈值) -> 确认激活拖拽 (Dragging)`);
      flashBehavior("bindDrag:activated");
    }
  };

  const handlePointerUp = () => {
    if (pointerStart) {
      if (!isThresholdExceeded) {
        setDragEventLog("未达 4px 阈值 -> 判定为普通点击 (Click)");
      }
      setPointerStart(null);
      setIsThresholdExceeded(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Typeahead */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-blue-500 flex items-center gap-1.5">
                <Keyboard className="w-4 h-4" />
                createTypeahead
              </span>
              <button
                onClick={() => onOpenAgentModal("typeahead")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
                title="查看 Agent Prompt"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Typeahead 字符跳跃
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              聚焦下方列表并连续敲击字母（如敲 &quot;G&quot;、&quot;D&quot;、&quot;H&quot;），光标飞跃定位。
            </p>

            <div
              tabIndex={0}
              onKeyDown={handleTypeaheadKeyDown}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 max-h-40 overflow-y-auto space-y-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {typeaheadItems.map((item, idx) => (
                <div
                  key={item}
                  onClick={() => setTypeaheadActiveIndex(idx)}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                    idx === typeaheadActiveIndex
                      ? "bg-blue-600/15 text-blue-500 dark:text-blue-300 font-semibold border border-blue-500/30"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>缓冲词: {typeaheadBuffer ? `"${typeaheadBuffer}"` : "无"}</span>
            <span className="text-blue-500">isTypeaheadKey()</span>
          </div>
        </div>

        {/* Card 2: Focus Recovery */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-emerald-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                createFocusRecovery
              </span>
              <button
                onClick={() => onOpenAgentModal("focusRecovery")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              焦点自愈保护 (Focus Recovery)
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              当聚焦的 DOM 节点被动态销毁时，焦点自动平滑自愈至相邻项，不丢失到 body。
            </p>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {recoveryItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-xs font-mono"
                >
                  <span className="truncate text-neutral-700 dark:text-neutral-300">{item.text}</span>
                  <button
                    id={`rec-btn-${item.id}`}
                    onClick={() => handleDeleteItem(item.id, idx)}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded transition-colors focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    title="删除节点测试自愈"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {recoveryItems.length === 0 && (
                <div className="text-center py-4 text-xs text-neutral-500">
                  所有项目已删除。
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
            <button
              onClick={handleResetRecovery}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300"
            >
              <RotateCcw className="w-3 h-3" />
              重置节点
            </button>
            <span className="text-emerald-500">keepFocus()</span>
          </div>
        </div>

        {/* Card 3: Spatial Move */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-purple-500 flex items-center gap-1.5">
                <Navigation2 className="w-4 h-4" />
                spatialMove
              </span>
              <button
                onClick={() => onOpenAgentModal("spatialMove")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              空间几何寻路 (Spatial Move)
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              散布在二维平面的散点卡片，按键盘上下左右按屏幕物理距离寻路跳跃。
            </p>

            <div className="h-32 relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden bg-grid-pattern">
              {spatialPoints.map((p) => {
                const isActive = activeSpatialId === p.id;
                return (
                  <button
                    key={p.id}
                    id={`sp-btn-${p.id}`}
                    tabIndex={0}
                    onClick={() => setActiveSpatialId(p.id)}
                    onKeyDown={(e) => handleSpatialKeyDown(e, p.id)}
                    style={{ left: `${p.x}px`, top: `${p.y}px` }}
                    className={`absolute px-2 py-1 rounded text-[10px] font-mono border transition-all focus:outline-none ${
                      isActive
                        ? "bg-purple-600/20 text-purple-400 border-purple-500 ring-2 ring-purple-500/30 font-bold z-10"
                        : "bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>当前: {activeSpatialId}</span>
            <span className="text-purple-500">nearestInDirection()</span>
          </div>
        </div>

        {/* Card 4: Input History */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-amber-500 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                createInputHistory
              </span>
              <button
                onClick={() => onOpenAgentModal("inputHistory")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              终端输入栈 (Input History)
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              在输入框按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">↓</kbd> 穿梭回溯终端历史，回到底部恢复草稿。
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleHistoryKeyDown}
                placeholder="在此输入，或按 ↑ 提取历史..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="text-[10px] text-neutral-400 font-mono space-y-0.5 px-1">
                <div className="text-neutral-500">历史栈记录:</div>
                {historyCmds.map((cmd, i) => (
                  <div key={cmd} className="truncate">
                    {i === historyCmds.length - 1 - historyIndex ? "→ " : "  "}{cmd}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>索引: {historyIndex === -1 ? "草稿" : historyIndex}</span>
            <span className="text-amber-500">capacity: 20</span>
          </div>
        </div>

        {/* Card 5: Text Match */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-cyan-500 flex items-center gap-1.5">
                <Highlighter className="w-4 h-4" />
                matchRanges
              </span>
              <button
                onClick={() => onOpenAgentModal("textMatch")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              模糊分词切片高亮
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              计算文本相似度得分并切片出匹配字符范围进行高精度 mark 渲染。
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={matchQuery}
                onChange={(e) => setMatchQuery(e.target.value)}
                placeholder="输入检索关键词..."
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs font-mono leading-relaxed">
                {matchSegmentsResult.map((seg, idx) =>
                  seg.match ? (
                    <mark key={idx} className="bg-cyan-500/30 text-cyan-400 font-bold px-0.5 rounded-xs">
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={idx}>{seg.text}</span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>匹配区间数: {matchRangesResult.length}</span>
            <span className="text-cyan-500">fuzzyScore: {matchScore}</span>
          </div>
        </div>

        {/* Card 6: Drag Threshold */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-rose-500 flex items-center gap-1.5">
                <Hand className="w-4 h-4" />
                dragThreshold
              </span>
              <button
                onClick={() => onOpenAgentModal("dragThreshold")}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              拖拽防抖阈值保护
            </h4>
            <p className="text-xs text-neutral-500 mb-3">
              严格区分用户的手抖轻点与真实拖拽意图，位移达到 4px 前不激活拖拽。
            </p>

            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`h-24 rounded-lg border border-dashed flex flex-col items-center justify-center p-3 text-center cursor-grab active:cursor-grabbing transition-all select-none ${
                isThresholdExceeded
                  ? "border-rose-500 bg-rose-500/10 text-rose-400 ring-2 ring-rose-500/30"
                  : "border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-500 hover:border-neutral-400"
              }`}
            >
              <span className="text-xs font-mono font-medium">
                {isThresholdExceeded ? "🔥 已触发拖拽 (Dragging)" : "按住并在此微移指针测试"}
              </span>
              <span className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{dragEventLog}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <span>阈值门槛: 4px</span>
            <span className="text-rose-500">bindDrag()</span>
          </div>
        </div>
      </div>
    </div>
  );
}
