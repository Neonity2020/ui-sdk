"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { LayoutDashboard, Sparkles, Move, Compass, Box, SplitSquareVertical, Check } from "lucide-react";
import { nearestInDirection } from "@ui-sdk/core";
import { useXRay } from "../hud/XRayContext";

interface CanvasNode {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const INITIAL_NODES: CanvasNode[] = [
  { id: "node-auth", title: "Auth 认证网关", type: "Security", x: 40, y: 40, width: 140, height: 70, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { id: "node-api", title: "GraphQL 聚合服务", type: "API", x: 230, y: 50, width: 150, height: 70, color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
  { id: "node-cache", title: "Redis 边缘缓存", type: "Storage", x: 420, y: 40, width: 140, height: 70, color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  { id: "node-db", title: "PostgreSQL 向量库", type: "Database", x: 120, y: 160, width: 160, height: 75, color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  { id: "node-queue", title: "Pub/Sub 消息管道", type: "Queue", x: 340, y: 170, width: 150, height: 75, color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" },
  { id: "node-agent", title: "AI Agent 执行核心", type: "Core", x: 230, y: 280, width: 160, height: 75, color: "border-rose-500/40 bg-rose-500/10 text-rose-400" },
];

export function CanvasShowcase({ onOpenAgentModal }: { onOpenAgentModal: (id: string) => void }) {
  const { flashBehavior } = useXRay();
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set(["node-auth"]));
  const [activeNodeId, setActiveNodeId] = useState<string>("node-auth");

  // Lasso drag state
  const [lassoBox, setLassoBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const lassoStartRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Resize handler for sidebar
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    flashBehavior("createResize");

    const startX = e.clientX;
    const startW = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(360, Math.max(160, startW + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Lasso selection on Canvas background
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger lasso if clicking canvas background (not on a node)
    if (e.target !== canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    lassoStartRef.current = { x: startX, y: startY };
    setLassoBox({ x: startX, y: startY, w: 0, h: 0 });
    flashBehavior("createLasso");

    if (!e.shiftKey) {
      setSelectedNodeIds(new Set());
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!lassoStartRef.current || !canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - canvasRect.left;
      const currentY = moveEvent.clientY - canvasRect.top;

      const minX = Math.min(lassoStartRef.current.x, currentX);
      const minY = Math.min(lassoStartRef.current.y, currentY);
      const width = Math.abs(currentX - lassoStartRef.current.x);
      const height = Math.abs(currentY - lassoStartRef.current.y);

      setLassoBox({ x: minX, y: minY, w: width, h: height });

      // Check collision with nodes
      const selected = new Set<string>(e.shiftKey ? selectedNodeIds : []);
      nodes.forEach((node) => {
        const nodeRight = node.x + node.width;
        const nodeBottom = node.y + node.height;
        const lassoRight = minX + width;
        const lassoBottom = minY + height;

        const isColliding = !(
          nodeRight < minX ||
          node.x > lassoRight ||
          nodeBottom < minY ||
          node.y > lassoBottom
        );

        if (isColliding) {
          selected.add(node.id);
        }
      });
      setSelectedNodeIds(selected);
    };

    const handleMouseUp = () => {
      lassoStartRef.current = null;
      setLassoBox(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 2D Spatial Move navigation between nodes using keyboard
  const handleNodeKeyDown = (e: React.KeyboardEvent, currentNodeId: string) => {
    const currentNode = nodes.find((n) => n.id === currentNodeId);
    if (!currentNode) return;

    let dir: [number, number] | null = null;
    if (e.key === "ArrowRight") dir = [1, 0];
    else if (e.key === "ArrowLeft") dir = [-1, 0];
    else if (e.key === "ArrowDown") dir = [0, 1];
    else if (e.key === "ArrowUp") dir = [0, -1];

    if (dir) {
      e.preventDefault();
      flashBehavior("spatialMove");
      flashBehavior("nearestInDirection");

      const fromRect = {
        left: currentNode.x,
        right: currentNode.x + currentNode.width,
        top: currentNode.y,
        bottom: currentNode.y + currentNode.height,
      };

      const candidates = nodes
        .filter((n) => n.id !== currentNodeId)
        .map((n) => ({
          key: n.id,
          rect: {
            left: n.x,
            right: n.x + n.width,
            top: n.y,
            bottom: n.y + n.height,
          },
        }));

      const nextKey = nearestInDirection(fromRect, candidates, dir);
      if (nextKey) {
        setActiveNodeId(nextKey);
        if (!e.shiftKey) {
          setSelectedNodeIds(new Set([nextKey]));
        } else {
          setSelectedNodeIds((prev) => new Set(prev).add(nextKey));
        }
        // Focus the target element
        const targetEl = document.getElementById(`node-card-${nextKey}`);
        targetEl?.focus();
      }
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center font-mono text-sm font-bold">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              可调分栏画布 + 矩形框选
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Canvas & Lasso
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              整合 createResize、createLasso、spatialMove 与 nearestInDirection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAgentModal("canvas")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Agent 组装 Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Workspace with Resizable Split */}
      <div className="overflow-x-auto bg-neutral-100/50 dark:bg-neutral-900/20">
        <div className="flex flex-row h-[420px] min-w-[640px] overflow-hidden relative">
        {/* Resizable Sidebar */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 flex flex-col justify-between overflow-y-auto"
        >
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between mb-3 font-mono">
              <span>架构节点列表</span>
              <span className="text-[10px] text-neutral-400">{nodes.length} 个</span>
            </div>
            <div className="space-y-1.5">
              {nodes.map((node) => {
                const isSelected = selectedNodeIds.has(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setActiveNodeId(node.id);
                      setSelectedNodeIds(new Set([node.id]));
                      const el = document.getElementById(`node-card-${node.id}`);
                      el?.focus();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-600/10 text-blue-500 dark:text-blue-300 border border-blue-500/30 font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span className="truncate">{node.title}</span>
                    <span className="text-[10px] opacity-60 ml-1">{node.type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <span>分栏宽度: {sidebarWidth}px</span>
            <div className="text-[10px] text-neutral-500 mt-1">拖拽右侧细线手柄缩放</div>
          </div>
        </div>

        {/* Resize Divider Handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          className={`w-1.5 cursor-col-resize hover:bg-blue-500 transition-colors z-20 flex items-center justify-center ${
            isResizing ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-800"
          }`}
          title="拖拽调整侧边栏宽度"
        >
          <div className="w-0.5 h-8 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="flex-1 relative bg-neutral-50 dark:bg-neutral-950 overflow-hidden bg-grid-pattern cursor-crosshair select-none"
        >
          {/* Dynamic Lasso Box */}
          {lassoBox && (
            <div
              style={{
                left: `${lassoBox.x}px`,
                top: `${lassoBox.y}px`,
                width: `${lassoBox.w}px`,
                height: `${lassoBox.h}px`,
              }}
              className="absolute pointer-events-none border border-blue-500 bg-blue-500/15 rounded-sm z-30"
            />
          )}

          {/* Canvas Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeIds.has(node.id);
            const isActive = activeNodeId === node.id;

            return (
              <div
                key={node.id}
                id={`node-card-${node.id}`}
                tabIndex={0}
                onFocus={() => setActiveNodeId(node.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNodeId(node.id);
                  if (e.shiftKey) {
                    setSelectedNodeIds((prev) => new Set(prev).add(node.id));
                  } else {
                    setSelectedNodeIds(new Set([node.id]));
                  }
                }}
                onKeyDown={(e) => handleNodeKeyDown(e, node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`absolute p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer shadow-sm transition-all focus:outline-none flex flex-col justify-between ${
                  node.color
                } ${
                  isSelected
                    ? "ring-2 ring-blue-500 shadow-md scale-102 z-20"
                    : "hover:border-neutral-400 dark:hover:border-neutral-600 z-10"
                } ${isActive ? "outline outline-2 outline-blue-400 outline-offset-1" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900/60 text-neutral-300">
                    {node.type}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>

                <div className="text-xs font-semibold truncate text-neutral-900 dark:text-neutral-100">
                  {node.title}
                </div>

                <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                  <span>x:{node.x} y:{node.y}</span>
                  {isActive && <span className="text-blue-400 font-bold">聚焦</span>}
                </div>
              </div>
            );
          })}

          {/* Floating Canvas Tips */}
          <div className="absolute bottom-3 left-3 pointer-events-none px-3 py-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 backdrop-blur-md flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>空白处拖拽矩形框选 (createLasso) · 聚焦卡片后按键盘 ↑↓←→ 空间寻路 (spatialMove)</span>
          </div>

          <div className="absolute top-3 right-3 pointer-events-none px-2.5 py-1 rounded-md bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-300 backdrop-blur-md">
            已选中: <strong className="text-blue-500">{selectedNodeIds.size}</strong> 个节点
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
