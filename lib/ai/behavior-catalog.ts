import fs from "node:fs";
import path from "node:path";

export interface BehaviorEntry {
  name: string;
  category:
    | "Focus & Keys"
    | "Selection"
    | "Drag & Drop"
    | "Popups & Overlays"
    | "Text & Matching"
    | "Direct Manipulation"
    | "Agent Bridge";
  importPath: string;
  summary: string;
  ariaGuarantees: string[];
  keywords: string[];
  docAnchor: string;
}

export const BEHAVIOR_CATALOG: BehaviorEntry[] = [
  {
    name: "createPopup",
    category: "Popups & Overlays",
    importPath: "@ui-sdk/core",
    summary:
      "管理浮层定位、打开/关闭状态机、点击外部关闭、Escape 退出及关闭后焦点归还触发器。",
    ariaGuarantees: ["aria-expanded", "aria-controls", "aria-haspopup", "focus restoration"],
    keywords: ["popup", "popover", "dropdown", "menu", "modal", "dialog", "picker", "icon", "emoji", "command", "浮层", "弹窗", "下拉", "菜单", "选择器"],
    docAnchor: "Popups",
  },
  {
    name: "createRovingFocus",
    category: "Focus & Keys",
    importPath: "@ui-sdk/core",
    summary:
      "为一组元素提供单一 Tab 停靠点 (Single Tab Stop)，并在组内通过上下左右方向键循环漫游焦点。",
    ariaGuarantees: ["roving tabindex (0 / -1)", "Home / End support", "RTL-aware arrow keys"],
    keywords: ["roving", "focus", "arrow", "tab", "toolbar", "tabs", "menu", "list", "picker", "焦点", "方向键", "工具栏", "列表", "菜单"],
    docAnchor: "Compose Behaviors",
  },
  {
    name: "spatialMove",
    category: "Focus & Keys",
    importPath: "@ui-sdk/core",
    summary:
      "基于真实二维屏幕几何坐标 (BoundingClientRect) 计算方向扇区距离，让非规则网格或散点布局也能顺畅响应方向键。",
    ariaGuarantees: ["2D geometric cone navigation", "responsive column-wrap resilience"],
    keywords: ["spatial", "2d", "grid", "icon", "picker", "canvas", "scatter", "bento", "空间", "图标", "二维", "画布", "网格"],
    docAnchor: "Let Me Show You",
  },
  {
    name: "createGridFocus",
    category: "Focus & Keys",
    importPath: "@ui-sdk/core",
    summary:
      "处理电子表格与高密度数据矩阵的二维 (row, col) 单元格焦点漫游，支持配合虚拟滚动跳转到未挂载单元格。",
    ariaGuarantees: ['role="grid"', 'role="gridcell"', "2D row/col coordinates"],
    keywords: ["grid", "table", "spreadsheet", "cell", "matrix", "datagrid", "表格", "单元格", "电子表格", "数据网格"],
    docAnchor: "Roles, Focus and Keys",
  },
  {
    name: "createFocusRecovery",
    category: "Focus & Keys",
    importPath: "@ui-sdk/core",
    summary:
      "当当前聚焦节点被删除或卸载时，自动将焦点平滑迁移到相邻可用元素，防止焦点坠落回 document.body。",
    ariaGuarantees: ["zero focus-drop on DOM removal", "adjacent fallback resolution"],
    keywords: ["recovery", "delete", "remove", "toast", "tag", "token", "tree", "焦点自愈", "删除", "移除", "标签"],
    docAnchor: "Parts That Come and Go",
  },
  {
    name: "createTypeahead",
    category: "Text & Matching",
    importPath: "@ui-sdk/core",
    summary:
      "监听非输入框列表中的连续字符敲击，在超时窗口内拼接前缀并自动聚焦首字母匹配项。",
    ariaGuarantees: ["printable key filtering", "IME composition guard", "auto-reset buffer"],
    keywords: ["typeahead", "select", "dropdown", "listbox", "tree", "file", "字符跳跃", "下拉", "多选", "树形", "文件"],
    docAnchor: "Roles, Focus and Keys",
  },
  {
    name: "fuzzyScore & matchRanges",
    category: "Text & Matching",
    importPath: "@ui-sdk/core/text-match",
    summary:
      "计算查询词与候选文本的模糊匹配得分，并通过 matchRanges / matchSegments 切分出高亮字符区间。",
    ariaGuarantees: ["locale-aware folding", "ordered segment highlighting"],
    keywords: ["fuzzy", "search", "filter", "command", "combobox", "autocomplete", "picker", "icon", "模糊", "搜索", "高亮", "过滤", "命令", "选择器"],
    docAnchor: "Let Me Show You",
  },
  {
    name: "createInputHistory",
    category: "Text & Matching",
    importPath: "@ui-sdk/core",
    summary:
      "为单行或多行输入框赋予类似终端的 ArrowUp / ArrowDown 历史记录回溯与未提交草稿保护。",
    ariaGuarantees: ["IME composition safe", "popup aria-expanded guard", "draft preservation"],
    keywords: ["history", "prompt", "chat", "terminal", "command", "repl", "历史", "终端", "聊天", "命令"],
    docAnchor: "Events",
  },
  {
    name: "createSelection",
    category: "Selection",
    importPath: "@ui-sdk/core",
    summary:
      "统一管理单选、多选与 Shift 连续区间选择模型，内置受控/非受控状态同步。",
    ariaGuarantees: ["aria-selected", "aria-multiselectable", "Shift-range & Cmd-toggle"],
    keywords: ["select", "multiselect", "listbox", "option", "checkbox", "tree", "选择", "多选", "单选", "下拉", "列表"],
    docAnchor: "Handle Changes",
  },
  {
    name: "createLasso",
    category: "Selection",
    importPath: "@ui-sdk/core",
    summary:
      "在画布或文件视图空白处拖拽指针拉出矩形选框 (Marquee)，实时计算碰撞并批量选中元素。",
    ariaGuarantees: ["pointer capture", "activation threshold", "keyboard modifier merge"],
    keywords: ["lasso", "marquee", "canvas", "finder", "box", "框选", "套索", "画布"],
    docAnchor: "Working with the Element",
  },
  {
    name: "createCellRange & cellsToText",
    category: "Selection",
    importPath: "@ui-sdk/core",
    summary:
      "管理二维表格的矩形单元格选区，并提供标准 TSV 剪贴板序列化 (cellsToText) 与反序列化 (textToCells)。",
    ariaGuarantees: ["2D range aria-selected", "screen reader cellRangeMessage", "RFC TSV quoting"],
    keywords: ["cell", "range", "clipboard", "copy", "paste", "tsv", "spreadsheet", "grid", "剪贴板", "复制", "粘贴", "表格"],
    docAnchor: "Handle Changes",
  },
  {
    name: "createReorder & createTransfer",
    category: "Drag & Drop",
    importPath: "@ui-sdk/core",
    summary:
      "支持指针拖拽与全键盘无障碍操作（Space 拾取、方向键移动/跨列穿梭、Enter 放置）的同列重排与跨列转移引擎。",
    ariaGuarantees: ["keyboard parity", "reorderMessage & transferMessage live announcements"],
    keywords: ["drag", "drop", "reorder", "transfer", "kanban", "sortable", "tree", "file", "拖拽", "重排", "看板", "跨列", "树形", "文件"],
    docAnchor: "What a Change Reports",
  },
  {
    name: "createVirtualizer",
    category: "Direct Manipulation",
    importPath: "@ui-sdk/core",
    summary:
      "按视口仅挂载可见子集与 overscan 缓冲区，轻松支撑万级列表、下拉框或二维网格 60fps 滚动。",
    ariaGuarantees: ["aria-setsize", "aria-posinset", "scrollToIndex on keyboard highlight"],
    keywords: ["virtual", "virtualizer", "scroll", "10000", "large", "performance", "select", "虚拟滚动", "万行", "长列表", "性能", "多选"],
    docAnchor: "Parts That Come and Go",
  },
  {
    name: "createResize",
    category: "Direct Manipulation",
    importPath: "@ui-sdk/core",
    summary:
      "驱动分栏面板、抽屉或画布节点的边缘拖拽缩放与键盘步进缩放，内置 min/max 约束与吸附点。",
    ariaGuarantees: ['role="separator"', "aria-valuenow / aria-valuemin / aria-valuemax", "resizeMessage"],
    keywords: ["resize", "split", "panel", "drawer", "sidebar", "缩放", "分栏", "侧边栏"],
    docAnchor: "Pass Values as CSS Variables",
  },
  {
    name: "createAgent (@ui-sdk/react/agent)",
    category: "Agent Bridge",
    importPath: "@ui-sdk/react/agent",
    summary:
      "在页面渲染层建立结构化 Agent 桥接：通过 agent.snapshot() 读取组件状态，通过 agent.act() 直接调用组件 API（实测减少 59% 工具调用与 76% Token）。",
    ariaGuarantees: ['source: "agent" change provenance', "allow() permission gate", "WebMCP compatible"],
    keywords: ["agent", "bridge", "snapshot", "act", "webmcp", "form", "control", "桥接", "表单", "操作组件", "智能体"],
    docAnchor: "Agents Use Your Components",
  },
];

export function searchBehaviorCatalog(query: string, limit = 5): BehaviorEntry[] {
  const tokens = query
    .toLowerCase()
    .split(/[\s,，、/+]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const scored = BEHAVIOR_CATALOG.map((entry) => {
    const haystack = [
      entry.name,
      entry.category,
      entry.summary,
      ...entry.keywords,
      ...entry.ariaGuarantees,
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const token of tokens) {
      if (entry.name.toLowerCase().includes(token)) score += 6;
      if (entry.keywords.some((k) => k.toLowerCase().includes(token) || token.includes(k.toLowerCase()))) {
        score += 4;
      }
      if (haystack.includes(token)) score += 2;
    }

    // Match Chinese multi-char substrings directly against keywords
    for (const kw of entry.keywords) {
      if (kw.length >= 2 && query.toLowerCase().includes(kw.toLowerCase())) {
        score += 5;
      }
    }

    return { entry, score };
  });

  const matched = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);

  if (matched.length > 0) return matched;

  // Sensible default foundational set if query is super generic
  return BEHAVIOR_CATALOG.slice(0, Math.min(4, limit));
}

export function readBundledDocExcerpt(topic: string): {
  sourceFile: string;
  heading: string;
  excerpt: string;
} {
  try {
    const isAgentTopic = /agent|snapshot|act|webmcp|桥接/i.test(topic);
    const relativeDoc = isAgentTopic
      ? "node_modules/@ui-sdk/core/docs/agents.md"
      : "node_modules/@ui-sdk/core/docs/core.md";
    const fullPath = path.join(process.cwd(), relativeDoc);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n");
      const needle = topic.toLowerCase().trim();

      let startIdx = lines.findIndex(
        (line) => /^#{1,3}\s+/.test(line) && line.toLowerCase().includes(needle)
      );
      if (startIdx === -1) {
        startIdx = lines.findIndex((line) => line.toLowerCase().includes(needle));
      }
      if (startIdx === -1) {
        startIdx = 0;
      }

      const slice = lines.slice(Math.max(0, startIdx - 1), startIdx + 34).join("\n").trim();
      const headingLine =
        lines.slice(0, startIdx + 5).reverse().find((l) => /^#{1,3}\s+/.test(l)) ||
        "# @ui-sdk/core Documentation";

      return {
        sourceFile: `@ui-sdk/core/docs/${isAgentTopic ? "agents.md" : "core.md"}`,
        heading: headingLine.replace(/^#+\s*/, ""),
        excerpt: slice.slice(0, 1400),
      };
    }
  } catch {
    // Ignore fs errors in restricted edge environments and return embedded excerpt
  }

  return {
    sourceFile: "@ui-sdk/core/docs/core.md",
    heading: "Define & Render a Primitive",
    excerpt: `import { definePrimitive } from "@ui-sdk/core"\nimport { createParts } from "@ui-sdk/react/primitive"\n// Combine headless behaviors in definePrimitive(), then bind slots via createParts().`,
  };
}

export interface ComposedBlueprint {
  primitiveName: string;
  componentTitle: string;
  selectedBehaviors: string[];
  ariaContract: string[];
  primitiveFile: string;
  primitiveCode: string;
  reactFile: string;
  reactCode: string;
}

export function buildComponentBlueprint(params: {
  componentGoal: string;
  kebabName?: string;
  behaviors?: string[];
}): ComposedBlueprint {
  const goal = params.componentGoal;
  const lower = goal.toLowerCase();

  // 1. Agent Bridge blueprint
  if (/agent|snapshot|act|webmcp|桥接|表单/.test(lower)) {
    return {
      primitiveName: "agent-project-field",
      componentTitle: "Agent-Controllable Project Field",
      selectedBehaviors: ["definePrimitive", "createAgent (@ui-sdk/react/agent)"],
      ariaContract: [
        'source: "agent" provenance tracking',
        "allow() permission gate before mutation",
        "aria-label exposed in agent.snapshot()",
      ],
      primitiveFile: "lib/project-field.ts",
      primitiveCode: `import { definePrimitive } from "@ui-sdk/core";

export const projectField = definePrimitive({
  name: "project-field",
  options: {
    defaultValue: "string",
    label: "string",
  },
  state: (options) => ({
    value: options.defaultValue ?? "Apollo",
  }),
  api: (context) => ({
    setValue: (next: string) => context.store.set({ value: next }),
    clear: () => context.store.set({ value: "" }),
  }),
  slots: (slot) => ({
    root: slot({
      attrs: () => ({ role: "group" }),
    }),
    input: slot({
      attrs: (state, { options }) => ({
        type: "text",
        value: state.value,
        "aria-label": options.label ?? "Project name",
      }),
    }),
  }),
});`,
      reactFile: "components/ui/project-field.tsx",
      reactCode: `"use client";

import { createParts } from "@ui-sdk/react/primitive";
import { createAgent } from "@ui-sdk/react/agent";
import { projectField } from "@/lib/project-field";

// Create bridge so AI agents can inspect snapshot() & invoke act() directly
export const uiBridge = createAgent({
  allow: (step) => step.action === "setValue" || step.action === "clear",
});

const parts = createParts(projectField, {
  root: "div",
  input: "input",
});

export const ProjectField = parts.Root;
export const ProjectFieldInput = parts.Input;`,
    };
  }

  // 2. Icon / Emoji Picker blueprint
  if (/icon|emoji|图标|表情|picker|选择器/.test(lower)) {
    return {
      primitiveName: "icon-picker",
      componentTitle: "Accessible Spatial Icon Picker",
      selectedBehaviors: [
        "createPopup",
        "createRovingFocus",
        "spatialMove",
        "fuzzyScore",
        "announce",
      ],
      ariaContract: [
        'trigger: aria-expanded + aria-haspopup="dialog"',
        "grid: single Tab stop + 2D spatialMove arrow keys",
        "live screen-reader match count via announce()",
      ],
      primitiveFile: "lib/icon-picker.ts",
      primitiveCode: `import {
  announce,
  createPopup,
  createRovingFocus,
  definePrimitive,
  popupContent,
  popupState,
  popupTrigger,
  spatialMove,
} from "@ui-sdk/core";
import { fuzzyScore } from "@ui-sdk/core/text-match";

export const iconPicker = definePrimitive({
  name: "icon-picker",
  options: { defaultOpen: "boolean" },
  state: (options) => ({
    ...popupState(options),
    query: "",
    activeIcon: "sparkles",
    selectedIcon: "sparkles",
  }),
  api: (context) => {
    const popup = createPopup(context);
    const roving = createRovingFocus(context, {
      slot: "item",
      key: "activeIcon",
      move: spatialMove(),
    });
    return {
      popup,
      roving,
      filterIcons: (icons: string[], query: string) => {
        const matches = icons
          .map((id) => ({ id, score: fuzzyScore(id, query) }))
          .filter((x) => x.score > 0.2)
          .sort((a, b) => b.score - a.score);
        announce(\`\${matches.length} icons matched\`);
        return matches;
      },
    };
  },
  slots: (slot) => ({
    trigger: popupTrigger(slot),
    content: popupContent(slot),
    item: slot({
      attrs: (state, { props }) => ({
        type: "button",
        "aria-selected": String(state.selectedIcon === props.value),
      }),
    }),
  }),
});`,
      reactFile: "components/ui/icon-picker.tsx",
      reactCode: `"use client";

import { createParts } from "@ui-sdk/react/primitive";
import { iconPicker } from "@/lib/icon-picker";

const parts = createParts(iconPicker, {
  trigger: "button",
  content: "div",
  item: "button",
});

export const IconPicker = parts.Root;
export const IconPickerTrigger = parts.Trigger;
export const IconPickerContent = parts.Content;
export const IconPickerItem = parts.Item;`,
    };
  }

  // 3. Tree / File Explorer / Drag Reorder blueprint
  if (/tree|file|folder|kanban|reorder|transfer|树|文件|目录|拖拽|穿梭|看板/.test(lower)) {
    return {
      primitiveName: "file-tree",
      componentTitle: "Keyboard & Pointer Reorderable File Tree",
      selectedBehaviors: [
        "createTreeCollection",
        "createTreeReorder",
        "createRovingFocus",
        "createTypeahead",
        "createFocusRecovery",
      ],
      ariaContract: [
        'role="tree" & role="treeitem" with aria-expanded / aria-level',
        "Spacebar pickup + Arrow keys reorder + treeReorderMessage()",
        "createFocusRecovery prevents focus loss when deleting a node",
      ],
      primitiveFile: "lib/file-tree.ts",
      primitiveCode: `import {
  createFocusRecovery,
  createRovingFocus,
  createTreeReorder,
  createTypeahead,
  definePrimitive,
  treeReorderMessage,
} from "@ui-sdk/core";

export const fileTree = definePrimitive({
  name: "file-tree",
  state: () => ({
    activeId: "src/index.ts",
    expandedIds: ["src"],
    reorderDraft: null,
  }),
  api: (context) => {
    const roving = createRovingFocus(context, {
      slot: "row",
      key: "activeId",
      orientation: "vertical",
    });
    const typeahead = createTypeahead();
    const recovery = createFocusRecovery();
    const reorder = createTreeReorder(context, {
      slot: "row",
      draft: "reorderDraft",
      announce: treeReorderMessage,
    });
    return { roving, typeahead, recovery, reorder };
  },
  slots: (slot) => ({
    root: slot({ attrs: () => ({ role: "tree" }) }),
    row: slot({
      attrs: (state, { props }) => ({
        role: "treeitem",
        "aria-selected": String(state.activeId === props.id),
      }),
    }),
  }),
});`,
      reactFile: "components/ui/file-tree.tsx",
      reactCode: `"use client";

import { createParts } from "@ui-sdk/react/primitive";
import { fileTree } from "@/lib/file-tree";

const parts = createParts(fileTree, {
  root: "div",
  row: "div",
});

export const FileTree = parts.Root;
export const FileTreeRow = parts.Row;`,
    };
  }

  // 4. Virtualized Multi-Select / Combobox / Default blueprint
  const rawSlug =
    params.kebabName ||
    (/virtual|万行|select|多选|下拉/.test(lower) ? "virtual-multi-select" : "custom-composite");

  return {
    primitiveName: rawSlug,
    componentTitle:
      rawSlug === "virtual-multi-select"
        ? "Virtualized Typeahead Multi-Select"
        : "Custom Headless Behavior Primitive",
    selectedBehaviors: params.behaviors?.length
      ? params.behaviors
      : [
          "createPopup",
          "createSelection",
          "createVirtualizer",
          "createTypeahead",
          "createRovingFocus",
        ],
    ariaContract: [
      'role="listbox" + aria-multiselectable="true"',
      "aria-setsize & aria-posinset preserved across virtualized rows",
      "Typeahead character jump + Shift-click range selection",
    ],
    primitiveFile: `lib/${rawSlug}.ts`,
    primitiveCode: `import {
  createPopup,
  createRovingFocus,
  createSelection,
  createTypeahead,
  createVirtualizer,
  definePrimitive,
  popupContent,
  popupState,
  popupTrigger,
} from "@ui-sdk/core";

export const ${rawSlug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())} = definePrimitive({
  name: "${rawSlug}",
  options: {
    itemCount: "number",
    multiple: "boolean",
  },
  state: (options) => ({
    ...popupState({ defaultOpen: false }),
    activeKey: "item-0",
    selectedKeys: [] as string[],
  }),
  api: (context) => {
    const popup = createPopup(context);
    const selection = createSelection(context, {
      key: "selectedKeys",
      multiple: true,
    });
    const roving = createRovingFocus(context, {
      slot: "option",
      key: "activeKey",
      orientation: "vertical",
    });
    const virtualizer = createVirtualizer({
      count: () => context.options.itemCount ?? 10000,
      estimateSize: () => 34,
    });
    const typeahead = createTypeahead();
    return { popup, selection, roving, virtualizer, typeahead };
  },
  slots: (slot) => ({
    trigger: popupTrigger(slot),
    listbox: popupContent(slot),
    option: slot({
      attrs: (state, { props }) => ({
        role: "option",
        "aria-selected": String(state.selectedKeys.includes(props.value)),
      }),
    }),
  }),
});`,
    reactFile: `components/ui/${rawSlug}.tsx`,
    reactCode: `"use client";

import { createParts } from "@ui-sdk/react/primitive";
import { ${rawSlug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())} } from "@/lib/${rawSlug}";

const parts = createParts(${rawSlug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}, {
  trigger: "button",
  listbox: "div",
  option: "div",
});

export const CustomPrimitive = parts.Root;
export const CustomTrigger = parts.Trigger;
export const CustomListbox = parts.Listbox;
export const CustomOption = parts.Option;`,
  };
}
