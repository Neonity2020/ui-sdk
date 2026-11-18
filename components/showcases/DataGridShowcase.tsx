"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Table, Copy, Check, Sparkles, ArrowUpDown, ChevronRight, Layers, FileSpreadsheet } from "lucide-react";
import { cellsToText, textToCells } from "@ui-sdk/core";
import { useXRay } from "../hud/XRayContext";

interface CellCoord {
  row: number;
  col: number;
}

interface CellRange {
  start: CellCoord;
  end: CellCoord;
}

const INITIAL_ROWS = [
  ["PRD-101", "Next.js App Router 适配器", "框架层", "已就绪", "$12,400"],
  ["PRD-102", "createGridFocus 状态机优化", "核心算法", "进行中", "$8,900"],
  ["PRD-103", "WAI-ARIA 表格无障碍测试套件", "无障碍 (a11y)", "审核中", "$4,500"],
  ["PRD-104", "虚拟滚动渲染帧率压测 (10k Rows)", "性能优化", "已完成", "$15,200"],
  ["PRD-105", "TSV 剪贴板双向序列化引擎", "数据互通", "已就绪", "$6,100"],
  ["PRD-106", "指针拖拽阈值防抖 (3px)", "手势交互", "进行中", "$3,800"],
  ["PRD-107", "非正交平面空间几何寻路 (Spatial)", "核心算法", "待排期", "$9,400"],
  ["PRD-108", "跨列看板任务调度与消息播报", "复合组件", "已完成", "$11,200"],
  ["PRD-109", "Geist 工业网格设计系统对齐", "设计工程", "已就绪", "$7,600"],
  ["PRD-110", "Claude & Cursor Agent 组装规范", "文档生态", "已发布", "$5,000"],
];

const COLUMNS = ["任务编号", "名称与功能描述", "模块分类", "交付状态", "预估成本"];

export function DataGridShowcase({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { flashBehavior, registerActiveBehavior } = useXRay();
  const [data, setData] = useState<string[][]>(INITIAL_ROWS);
  const [activeCell, setActiveCell] = useState<CellCoord>({ row: 0, col: 0 });
  const [selectionRange, setSelectionRange] = useState<CellRange>({
    start: { row: 0, col: 0 },
    end: { row: 0, col: 0 },
  });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const numRows = data.length;
  const numCols = COLUMNS.length;

  // Normalized bounding box for selection
  const bounds = useMemo(() => {
    const minRow = Math.min(selectionRange.start.row, selectionRange.end.row);
    const maxRow = Math.max(selectionRange.start.row, selectionRange.end.row);
    const minCol = Math.min(selectionRange.start.col, selectionRange.end.col);
    const maxCol = Math.max(selectionRange.start.col, selectionRange.end.col);
    return { minRow, maxRow, minCol, maxCol };
  }, [selectionRange]);

  const isCellSelected = useCallback(
    (r: number, c: number) => {
      return (
        r >= bounds.minRow &&
        r <= bounds.maxRow &&
        c >= bounds.minCol &&
        c <= bounds.maxCol
      );
    },
    [bounds]
  );

  // Copy selected area to clipboard using cellsToText
  const handleCopy = useCallback(() => {
    const selectedData: string[][] = [];
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const rowSlice: string[] = [];
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        rowSlice.push(data[r]?.[c] ?? "");
      }
      selectedData.push(rowSlice);
    }
    const tsvText = cellsToText(selectedData);
    navigator.clipboard.writeText(tsvText);
    flashBehavior("cellsToText");
    flashBehavior("createCellRange");
    setCopiedNotice(`已复制选区 (${selectedData.length} × ${selectedData[0]?.length || 0}) 到剪贴板`);
    setTimeout(() => setCopiedNotice(null), 2500);
  }, [bounds, data, flashBehavior]);

  // Paste TSV text into grid using textToCells
  const handlePaste = useCallback(
    (pastedText: string) => {
      const pastedRows = textToCells(pastedText);
      if (!pastedRows.length) return;

      flashBehavior("textToCells");
      flashBehavior("byCellRange");

      setData((prev) => {
        const next = prev.map((row) => [...row]);
        const startR = bounds.minRow;
        const startC = bounds.minCol;

        pastedRows.forEach((pRow, rIdx) => {
          const targetR = startR + rIdx;
          if (targetR < next.length) {
            pRow.forEach((val, cIdx) => {
              const targetC = startC + cIdx;
              if (targetC < next[targetR].length) {
                next[targetR][targetC] = val;
              }
            });
          }
        });
        return next;
      });

      setCopiedNotice(`已从剪贴板粘贴 ${pastedRows.length} 行数据`);
      setTimeout(() => setCopiedNotice(null), 2500);
    },
    [bounds, flashBehavior]
  );

  // Handle 2D Grid navigation via keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let nextRow = activeCell.row;
    let nextCol = activeCell.col;
    let moved = false;

    if (e.key === "ArrowDown") {
      nextRow = Math.min(numRows - 1, activeCell.row + 1);
      moved = true;
    } else if (e.key === "ArrowUp") {
      nextRow = Math.max(0, activeCell.row - 1);
      moved = true;
    } else if (e.key === "ArrowRight") {
      nextCol = Math.min(numCols - 1, activeCell.col + 1);
      moved = true;
    } else if (e.key === "ArrowLeft") {
      nextCol = Math.max(0, activeCell.col - 1);
      moved = true;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
      e.preventDefault();
      handleCopy();
      return;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setSelectionRange({
        start: { row: 0, col: 0 },
        end: { row: numRows - 1, col: numCols - 1 },
      });
      flashBehavior("createCellRange:selectAll");
      return;
    }

    if (moved) {
      e.preventDefault();
      flashBehavior("createGridFocus");
      flashBehavior("byCell");
      setActiveCell({ row: nextRow, col: nextCol });

      if (e.shiftKey) {
        // Expand range selection
        flashBehavior("createCellRange");
        setSelectionRange((prev) => ({
          start: prev.start,
          end: { row: nextRow, col: nextCol },
        }));
      } else {
        // Reset single cell selection
        setSelectionRange({
          start: { row: nextRow, col: nextCol },
          end: { row: nextRow, col: nextCol },
        });
      }
    }
  };

  // Selection statistics
  const selectionSummary = useMemo(() => {
    const rowsCount = bounds.maxRow - bounds.minRow + 1;
    const colsCount = bounds.maxCol - bounds.minCol + 1;
    let numericSum = 0;
    let numericCount = 0;

    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        const val = data[r]?.[c];
        if (val) {
          const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(num)) {
            numericSum += num;
            numericCount++;
          }
        }
      }
    }

    return {
      rowsCount,
      colsCount,
      totalCells: rowsCount * colsCount,
      sum: numericCount > 0 ? numericSum.toLocaleString() : null,
      avg: numericCount > 0 ? (numericSum / numericCount).toFixed(1) : null,
    };
  }, [bounds, data]);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-mono text-sm font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              电子表格级 2D 数据网格
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Data Grid
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              整合 createGridFocus、byCell、createCellRange、cellsToText 与 textToCells
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAgentModal("datagrid")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Agent 组装 Prompt</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>复制选区 (⌘C)</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-5 bg-neutral-100/50 dark:bg-neutral-900/20">
        {copiedNotice && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{copiedNotice}</span>
          </div>
        )}

        <div
          ref={gridContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            handlePaste(text);
          }}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-md overflow-x-auto focus:outline-none focus:ring-1 focus:ring-blue-500/50 select-none"
        >
          <table className="w-full text-xs text-left border-collapse" role="grid">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-mono text-neutral-500 dark:text-neutral-400">
                <th className="w-10 p-2.5 text-center border-r border-neutral-200 dark:border-neutral-800 font-normal">
                  #
                </th>
                {COLUMNS.map((col, idx) => (
                  <th
                    key={col}
                    className={`p-2.5 font-medium border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${
                      activeCell.col === idx ? "text-blue-500 font-bold bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => {
                const isRowActive = activeCell.row === rIdx;
                return (
                  <tr
                    key={rIdx}
                    className={`border-b border-neutral-100 dark:border-neutral-900/80 last:border-b-0 transition-colors ${
                      isRowActive ? "bg-neutral-50/80 dark:bg-neutral-900/30" : ""
                    }`}
                    role="row"
                  >
                    {/* Row Index */}
                    <td
                      className={`p-2.5 text-center font-mono border-r border-neutral-200 dark:border-neutral-800 ${
                        isRowActive
                          ? "text-blue-500 font-bold bg-blue-50/50 dark:bg-blue-950/20"
                          : "text-neutral-400"
                      }`}
                    >
                      {rIdx + 1}
                    </td>

                    {/* Cells */}
                    {row.map((val, cIdx) => {
                      const isActive = activeCell.row === rIdx && activeCell.col === cIdx;
                      const isSelected = isCellSelected(rIdx, cIdx);

                      return (
                        <td
                          key={cIdx}
                          role="gridcell"
                          tabIndex={isActive ? 0 : -1}
                          aria-selected={isSelected}
                          onMouseDown={() => {
                            setIsMouseDown(true);
                            setActiveCell({ row: rIdx, col: cIdx });
                            setSelectionRange({
                              start: { row: rIdx, col: cIdx },
                              end: { row: rIdx, col: cIdx },
                            });
                            flashBehavior("createGridFocus");
                            flashBehavior("byCell");
                          }}
                          onMouseEnter={() => {
                            if (isMouseDown) {
                              setSelectionRange((prev) => ({
                                start: prev.start,
                                end: { row: rIdx, col: cIdx },
                              }));
                              flashBehavior("createCellRange");
                            }
                          }}
                          onMouseUp={() => setIsMouseDown(false)}
                          className={`p-2.5 border-r border-neutral-100 dark:border-neutral-900/80 last:border-r-0 cursor-cell relative font-mono transition-all ${
                            isSelected
                              ? "bg-blue-500/15 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200"
                              : "text-neutral-700 dark:text-neutral-300"
                          } ${
                            isActive
                              ? "ring-2 ring-blue-500 z-10 bg-blue-500/25 dark:bg-blue-500/30 font-semibold"
                              : ""
                          }`}
                        >
                          <span className="truncate block max-w-xs">{val}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Status Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="text-neutral-700 dark:text-neutral-300">
              活动单元格: <strong className="text-blue-500">R{activeCell.row + 1}:C{activeCell.col + 1}</strong>
            </span>
            <span className="text-neutral-400">|</span>
            <span>
              已选中: {selectionSummary.rowsCount} 行 × {selectionSummary.colsCount} 列 ({selectionSummary.totalCells} 单元格)
            </span>
            {selectionSummary.sum && (
              <>
                <span className="text-neutral-400">|</span>
                <span className="text-emerald-500">求和: {selectionSummary.sum}</span>
                <span className="text-neutral-400">|</span>
                <span className="text-amber-500">均值: {selectionSummary.avg}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">Shift + ↑↓←→</kbd> 范围框选</span>
            <span>·</span>
            <span>按 <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border">⌘+C</kbd> 复制</span>
          </div>
        </div>
      </div>
    </div>
  );
}
