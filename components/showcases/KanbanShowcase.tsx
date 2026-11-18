"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Columns3, Sparkles, Move, Check, Volume2, GripVertical, Plus } from "lucide-react";
import { transferMessage, reorderMessage } from "@ui-sdk/core";
import { useXRay } from "../hud/XRayContext";

interface KanbanCard {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  assignee: string;
}

interface Column {
  id: string;
  title: string;
  cards: KanbanCard[];
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: "col-backlog",
    title: "待开发 (Backlog)",
    cards: [
      { id: "task-1", title: "集成 @ui-sdk/react/command 到全局快捷入口", tag: "特性", tagColor: "bg-blue-500/10 text-blue-500 border-blue-500/20", assignee: "Alex" },
      { id: "task-2", title: "添加移动端触控侧滑手势 (createSwipeActions)", tag: "交互", tagColor: "bg-purple-500/10 text-purple-500 border-purple-500/20", assignee: "Sarah" },
      { id: "task-3", title: "编写 Agent 组装单元测试与类型断言", tag: "测试", tagColor: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20", assignee: "Dave" },
    ],
  },
  {
    id: "col-progress",
    title: "进行中 (In Progress)",
    cards: [
      { id: "task-4", title: "优化 2D 网格万行虚拟滚动跳帧问题", tag: "性能", tagColor: "bg-amber-500/10 text-amber-500 border-amber-500/20", assignee: "Elena" },
      { id: "task-5", title: "构建 Geist 风格 1px 细线边框与网格背景", tag: "UI", tagColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", assignee: "John" },
    ],
  },
  {
    id: "col-done",
    title: "已完成 (Done)",
    cards: [
      { id: "task-6", title: "建立 Behavior X-Ray 全局 HUD 探针上下文", tag: "架构", tagColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", assignee: "Alex" },
      { id: "task-7", title: "对齐 Vercel UI SDK 规范文档 (SPEC.md)", tag: "规范", tagColor: "bg-blue-500/10 text-blue-500 border-blue-500/20", assignee: "Dave" },
    ],
  },
];

export function KanbanShowcase({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { flashBehavior } = useXRay();
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isKeyboardPicked, setIsKeyboardPicked] = useState(false);
  const [pickedCardOriginal, setPickedCardOriginal] = useState<{ colId: string; index: number } | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>("提示：聚焦卡片后按空格键可开启纯键盘无障碍调度模式。");

  // Find column and index of a card
  const findCardPosition = useCallback(
    (cardId: string) => {
      for (let cIdx = 0; cIdx < columns.length; cIdx++) {
        const rIdx = columns[cIdx].cards.findIndex((card) => card.id === cardId);
        if (rIdx !== -1) {
          return { colIdx: cIdx, cardIdx: rIdx, col: columns[cIdx], card: columns[cIdx].cards[rIdx] };
        }
      }
      return null;
    },
    [columns]
  );

  // Announce helper
  const notifyAria = (msg: string) => {
    setAnnouncement(msg);
  };

  // Keyboard navigation on cards
  const handleCardKeyDown = (e: React.KeyboardEvent, cardId: string) => {
    const pos = findCardPosition(cardId);
    if (!pos) return;

    if (e.key === " " && !isKeyboardPicked) {
      // Pick up card
      e.preventDefault();
      setIsKeyboardPicked(true);
      setActiveCardId(cardId);
      setPickedCardOriginal({ colId: pos.col.id, index: pos.cardIdx });
      flashBehavior("bindDrag:pickup");

      const msg = transferMessage({
        type: "grab",
        key: pos.card.id,
        label: pos.card.title,
        list: pos.col.title,
        position: pos.cardIdx + 1,
        total: pos.col.cards.length,
      });
      notifyAria(msg);
      return;
    }

    if (isKeyboardPicked && activeCardId === cardId) {
      if (e.key === "Enter") {
        // Drop card
        e.preventDefault();
        setIsKeyboardPicked(false);
        setPickedCardOriginal(null);
        flashBehavior("createTransfer:commit");

        const msg = transferMessage({
          type: "drop",
          key: pos.card.id,
          label: pos.card.title,
          list: pos.col.title,
          position: pos.cardIdx + 1,
          total: pos.col.cards.length,
        });
        notifyAria(msg);
        return;
      }

      if (e.key === "Escape") {
        // Cancel and revert
        e.preventDefault();
        if (pickedCardOriginal) {
          setColumns((prev) => {
            const next = prev.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) }));
            const origCol = next.find((c) => c.id === pickedCardOriginal.colId);
            if (origCol) {
              origCol.cards.splice(pickedCardOriginal.index, 0, pos.card);
            }
            return next;
          });
        }
        setIsKeyboardPicked(false);
        setPickedCardOriginal(null);
        flashBehavior("createTransfer:cancel");
        notifyAria(`已取消移动，卡片已恢复至原位置。`);
        return;
      }

      // Reorder within column: ArrowUp / ArrowDown
      if (e.key === "ArrowUp" && pos.cardIdx > 0) {
        e.preventDefault();
        flashBehavior("createReorder");
        setColumns((prev) => {
          const next = [...prev];
          const list = [...next[pos.colIdx].cards];
          const temp = list[pos.cardIdx];
          list[pos.cardIdx] = list[pos.cardIdx - 1];
          list[pos.cardIdx - 1] = temp;
          next[pos.colIdx] = { ...next[pos.colIdx], cards: list };
          return next;
        });

        const msg = reorderMessage({
          type: "move",
          key: pos.card.id,
          label: pos.card.title,
          count: 1,
          position: pos.cardIdx,
          total: pos.col.cards.length,
        });
        notifyAria(msg);
        return;
      }

      if (e.key === "ArrowDown" && pos.cardIdx < pos.col.cards.length - 1) {
        e.preventDefault();
        flashBehavior("createReorder");
        setColumns((prev) => {
          const next = [...prev];
          const list = [...next[pos.colIdx].cards];
          const temp = list[pos.cardIdx];
          list[pos.cardIdx] = list[pos.cardIdx + 1];
          list[pos.cardIdx + 1] = temp;
          next[pos.colIdx] = { ...next[pos.colIdx], cards: list };
          return next;
        });

        const msg = reorderMessage({
          type: "move",
          key: pos.card.id,
          label: pos.card.title,
          count: 1,
          position: pos.cardIdx + 2,
          total: pos.col.cards.length,
        });
        notifyAria(msg);
        return;
      }

      // Transfer across columns: ArrowLeft / ArrowRight
      if (e.key === "ArrowRight" && pos.colIdx < columns.length - 1) {
        e.preventDefault();
        flashBehavior("createTransfer");
        const targetColIdx = pos.colIdx + 1;
        setColumns((prev) => {
          const next = [...prev];
          const sourceList = next[pos.colIdx].cards.filter((c) => c.id !== cardId);
          const targetList = [...next[targetColIdx].cards, pos.card];
          next[pos.colIdx] = { ...next[pos.colIdx], cards: sourceList };
          next[targetColIdx] = { ...next[targetColIdx], cards: targetList };
          return next;
        });

        const msg = transferMessage({
          type: "move",
          key: pos.card.id,
          label: pos.card.title,
          list: columns[targetColIdx].title,
          position: columns[targetColIdx].cards.length + 1,
          total: columns[targetColIdx].cards.length + 1,
        });
        notifyAria(msg);
        return;
      }

      if (e.key === "ArrowLeft" && pos.colIdx > 0) {
        e.preventDefault();
        flashBehavior("createTransfer");
        const targetColIdx = pos.colIdx - 1;
        setColumns((prev) => {
          const next = [...prev];
          const sourceList = next[pos.colIdx].cards.filter((c) => c.id !== cardId);
          const targetList = [...next[targetColIdx].cards, pos.card];
          next[pos.colIdx] = { ...next[pos.colIdx], cards: sourceList };
          next[targetColIdx] = { ...next[targetColIdx], cards: targetList };
          return next;
        });

        const msg = transferMessage({
          type: "move",
          key: pos.card.id,
          label: pos.card.title,
          list: columns[targetColIdx].title,
          position: columns[targetColIdx].cards.length + 1,
          total: columns[targetColIdx].cards.length + 1,
        });
        notifyAria(msg);
        return;
      }
    }
  };

  // Pointer drag and drop events
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    setDraggedCardId(cardId);
    flashBehavior("bindDrag");
    flashBehavior("bindDragPreview");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId) return;

    const pos = findCardPosition(cardId);
    if (!pos) return;

    if (pos.col.id !== targetColId) {
      flashBehavior("createTransfer");
      setColumns((prev) => {
        const next = [...prev];
        const srcCol = next.find((c) => c.id === pos.col.id);
        const dstCol = next.find((c) => c.id === targetColId);
        if (srcCol && dstCol) {
          srcCol.cards = srcCol.cards.filter((c) => c.id !== cardId);
          dstCol.cards = [...dstCol.cards, pos.card];
        }
        return next;
      });
      notifyAria(`鼠标放置 ${pos.card.title} 到 ${targetColId}`);
    }
    setDraggedCardId(null);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-mono text-sm font-bold">
            <Columns3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              双模看板与跨列穿梭
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Kanban
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              整合 createReorder、createTransfer、bindDrag、bindDragPreview 与无障碍播报
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAgentModal("kanban")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Agent 组装 Prompt</span>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-5 bg-neutral-100/50 dark:bg-neutral-900/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnColumn(e, col.id)}
              className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-3 min-h-[320px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  {col.title}
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                    {col.cards.length}
                  </span>
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2">
                {col.cards.map((card) => {
                  const isPicked = isKeyboardPicked && activeCardId === card.id;
                  const isBeingDragged = draggedCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      draggable
                      tabIndex={0}
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={() => setDraggedCardId(null)}
                      onFocus={() => setActiveCardId(card.id)}
                      onKeyDown={(e) => handleCardKeyDown(e, card.id)}
                      className={`group p-3 rounded-lg border bg-white dark:bg-neutral-950 transition-all select-none cursor-grab active:cursor-grabbing focus:outline-none ${
                        isPicked
                          ? "ring-2 ring-blue-500 scale-102 shadow-lg border-blue-500/50 z-20 bg-blue-500/5"
                          : isBeingDragged
                          ? "opacity-40 border-dashed border-neutral-400"
                          : "border-neutral-200 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${card.tagColor}`}>
                          {card.tag}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                          {isPicked && (
                            <span className="animate-pulse text-blue-500 font-bold">
                              [已拾取: 空格/Enter 放置]
                            </span>
                          )}
                          <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80" />
                        </div>
                      </div>

                      <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 mb-3 leading-snug">
                        {card.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[9px] flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
                            {card.assignee[0]}
                          </span>
                          <span>{card.assignee}</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">ID: {card.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live A11y & ARIA Announcement Bar */}
        <div className="mt-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-mono flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 truncate">
            <Volume2 className="w-4 h-4 text-purple-500 flex-shrink-0 animate-pulse" />
            <span className="text-neutral-400 flex-shrink-0">ARIA 实时播报:</span>
            <span className="text-neutral-900 dark:text-neutral-100 truncate font-semibold">
              {announcement}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-shrink-0">
            <span>按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">Space</kbd> 拾取/放下</span>
            <span>·</span>
            <span>按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">← →</kbd> 跨列穿梭</span>
            <span>·</span>
            <span>按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">↑ ↓</kbd> 换位</span>
          </div>
        </div>
      </div>
    </div>
  );
}
