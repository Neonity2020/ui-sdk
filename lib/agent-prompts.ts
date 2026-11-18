export interface AgentPromptData {
  id: string;
  title: string;
  category: "Showcase" | "Atomic";
  behaviors: string[];
  description: string;
  agentPrompt: string;
  primitiveSource: string;
}

export const AGENT_PROMPTS: Record<string, AgentPromptData> = {
  command: {
    id: "command",
    title: "⌘K 多级命令面板 (Command Palette)",
    category: "Showcase",
    behaviors: ["createPopup", "createRovingFocus", "createInputHistory", "fuzzyScore", "matchRanges"],
    description: "为应用构建零样式侵入的高性能全局命令面板，涵盖层级回退、模糊搜索高亮分词以及终端式的按键历史记录。",
    agentPrompt: `你是一个精通 Vercel UI SDK (@ui-sdk/core) 的专家。请为我组装一个无头的 ⌘K Command Palette 交互组件：

【核心行为需求】
1. 浮层控制：使用 createPopup 管理面板打开、关闭、点击外部区域与 ESC 关闭的生命周期。
2. 键盘导航：使用 createRovingFocus 实现搜索结果列表项之间的上下箭头 (ArrowUp/ArrowDown) 循环焦点漫游与 Tab 切换。
3. 模糊匹配：使用 @ui-sdk/core/text-match 的 fuzzyScore 计算相似度得分，并用 matchRanges 将目标文字拆分成 [高亮段] 与 [未匹配段]。
4. 输入历史：使用 createInputHistory 在搜索框为空且按下 ArrowUp/ArrowDown 时，穿梭回溯前几次查询的搜索词。
5. 多级页面：支持嵌套子菜单（如进入“设置”），按 Backspace 键且输入框为空时自愈返回上一级菜单。

【输出要求】
输出标准 TypeScript 代码，保持逻辑层与 Tailwind 表现层解耦，并具备完善的 WAI-ARIA (role="combobox", aria-expanded, aria-activedescendant) 无障碍标记。`,
    primitiveSource: `import { createPopup, createRovingFocus, createInputHistory, definePrimitive } from "@ui-sdk/core";
import { fuzzyScore, matchRanges } from "@ui-sdk/core/text-match";

export const commandPalette = definePrimitive({
  name: "command-palette",
  options: {
    defaultOpen: "boolean",
    historyCapacity: "number"
  },
  state: (options) => ({
    query: "",
    activePage: "root",
    history: createInputHistory({ capacity: options.historyCapacity ?? 10 })
  }),
  api: (context) => {
    const popup = createPopup(context, { dismissOnEscape: true });
    const roving = createRovingFocus(context, { orientation: "vertical", loop: true });
    return { popup, roving, fuzzyScore, matchRanges };
  }
});`
  },

  datagrid: {
    id: "datagrid",
    title: "电子表格级 2D 数据网格 (Data Grid)",
    category: "Showcase",
    behaviors: ["createGridFocus", "byCell", "createCellRange", "byCellRange", "cellsToText", "textToCells", "createVirtualizer"],
    description: "具备万行虚拟滚动、2D 焦点矩阵漫游、矩形单元格多选及与系统剪贴板 TSV 互通的现代化数据表格。",
    agentPrompt: `你是一个精通 Vercel UI SDK (@ui-sdk/core) 的专家。请组装一个电子表格级数据网格组件：

【核心行为需求】
1. 2D 焦点漫游：使用 createGridFocus 和 byCell 处理上下左右方向键在行与列之间的焦点移动，支持动态行高列宽计算。
2. 区域选区：使用 createCellRange 和 byCellRange 支持鼠标拖拽框选以及按住 Shift + 键盘箭头形成的矩形多单元格选区。
3. 原生剪贴板复制粘贴：
   - 监听 ⌘+C / Ctrl+C，利用 cellsToText 将选中的二维单元格序列化为标准制表符分隔文本 (TSV) 写入 navigator.clipboard。
   - 监听 ⌘+V / Ctrl+V，利用 textToCells 解析剪贴板内容并批量填充至当前聚焦选区。
4. 万行虚拟滚动：使用 createVirtualizer 计算仅在视口内渲染的可见行区间，支撑 10,000+ 级大数据量渲染。

【输出要求】
提供带有 role="grid"、role="row"、role="gridcell" 以及 aria-selected 状态绑定的可复用 React 组件代码。`,
    primitiveSource: `import { createGridFocus, byCell, createCellRange, cellsToText, textToCells, createVirtualizer, definePrimitive } from "@ui-sdk/core";

export const spreadsheetGrid = definePrimitive({
  name: "spreadsheet-grid",
  options: {
    rowCount: "number",
    colCount: "number"
  },
  state: (options) => ({
    gridFocus: createGridFocus({ rows: options.rowCount, cols: options.colCount }),
    range: createCellRange()
  }),
  api: (context) => ({
    copySelection: () => cellsToText(context.state.range.getCells()),
    pasteSelection: (text: string) => textToCells(text),
    virtualizer: createVirtualizer({ count: context.options.rowCount, estimateSize: () => 36 })
  })
});`
  },

  kanban: {
    id: "kanban",
    title: "双模看板与跨列穿梭 (Dual-Mode Kanban)",
    category: "Showcase",
    behaviors: ["createReorder", "createTransfer", "bindDrag", "bindDragPreview", "reorderMessage", "transferMessage"],
    description: "彻底解决传统拖拽库不支持全键盘操作的无障碍痛点，鼠标拖拽手感与纯键盘快捷重排双模驱动。",
    agentPrompt: `你是一个精通 Vercel UI SDK (@ui-sdk/core) 的专家。请组装一个同时支持高质感物理拖拽和无障碍键盘移动的双模看板组件：

【核心行为需求】
1. 指针拖拽：使用 bindDrag 监听 Pointer 事件，结合 bindDragPreview 渲染悬浮半透明幽灵占位。
2. 列内与跨列重排：使用 createReorder 处理同列上下调整，结合 createTransfer 支持跨列卡片调度。
3. 全键盘无障碍操作：
   - 聚焦卡片后按空格键 (Space) 拾取该卡片；
   - 使用 ArrowLeft / ArrowRight 将卡片跨列穿梭至相邻看板列；
   - 使用 ArrowUp / ArrowDown 改变卡片在当前列中的索引顺位；
   - 按 Enter 确认放置，按 Escape 撤销移动并恢复原位。
4. 无障碍播报：集成 reorderMessage 和 transferMessage 生成符合 ARIA live 规范的屏幕阅读器实时提示文案。`,
    primitiveSource: `import { createReorder, createTransfer, bindDrag, bindDragPreview, transferMessage, definePrimitive } from "@ui-sdk/core";

export const accessibleKanban = definePrimitive({
  name: "accessible-kanban",
  state: (options) => ({
    activeItemId: null,
    isPickedUp: false
  }),
  api: (context) => ({
    reorder: createReorder(context),
    transfer: createTransfer(context),
    bindDrag: (element: HTMLElement) => bindDrag(element, { threshold: 3 }),
    getAriaAnnouncement: (action) => transferMessage(action)
  })
});`
  },

  canvas: {
    id: "canvas",
    title: "可调分栏画布 + 矩形框选 (Resizable Canvas & Lasso)",
    category: "Showcase",
    behaviors: ["createResize", "createLasso", "spatialMove", "nearestInDirection"],
    description: "现代化生产力工具级工作台：支持面板把手拖拽吸附缩放、空白画布矩形套索框选与非线性几何空间焦点跳跃。",
    agentPrompt: `你是一个精通 Vercel UI SDK (@ui-sdk/core) 的专家。请组装一个现代化工作台画布组件：

【核心行为需求】
1. 可调分栏面板：使用 createResize 处理侧边栏与主画布之间的分隔线拖拽，包含 min/max 像素限制与吸附 (Snap) 阻尼。
2. 套索框选 (Lasso)：在主画布空白区域按下鼠标并拖动时，使用 createLasso 动态生成选区矩形坐标，自动计算并高亮落入选区内的节点。
3. 空间几何寻路：在散布在画布任意 x, y 坐标的卡片节点间，使用 spatialMove 和 nearestInDirection 计算欧式几何距离与方向角度，实现精准顺畅的键盘上下左右光标跳跃。`,
    primitiveSource: `import { createResize, createLasso, spatialMove, definePrimitive } from "@ui-sdk/core";

export const designCanvas = definePrimitive({
  name: "design-canvas",
  state: () => ({
    sidebarWidth: 260,
    selectedNodeIds: new Set<string>()
  }),
  api: (context) => ({
    resizeSidebar: createResize(context, { min: 180, max: 480 }),
    lasso: createLasso(context, { threshold: 4 }),
    moveFocus: (direction, currentRect, allRects) => spatialMove(direction, currentRect, allRects)
  })
});`
  },

  typeahead: {
    id: "typeahead",
    title: "Typeahead 字符跳跃",
    category: "Atomic",
    behaviors: ["createTypeahead", "isTypeaheadKey", "labelOf"],
    description: "在列表、菜单或长选项中，用户连续敲击键盘字符时，在毫秒级内依据输入字符串自动定位到最佳匹配项。",
    agentPrompt: `使用 @ui-sdk/core 的 createTypeahead 和 isTypeaheadKey 行为原语，为列表组件添加无障碍打字跳转定位功能。要求支持打字超时清除缓存（如 500ms 重置缓冲区），并能智能忽略非打字按键。`,
    primitiveSource: `import { createTypeahead, isTypeaheadKey } from "@ui-sdk/core";

const typeahead = createTypeahead({
  timeout: 500,
  getItems: () => Array.from(document.querySelectorAll("[data-item-label]")).map(el => el.getAttribute("data-item-label") || "")
});`
  },

  focusRecovery: {
    id: "focusRecovery",
    title: "焦点自愈保护 (Focus Recovery)",
    category: "Atomic",
    behaviors: ["createFocusRecovery", "keepFocus"],
    description: "当正在聚焦的 DOM 节点因删除、隐藏或网络变更被意外卸载时，自动将焦点平滑迁移到临近有效元素，杜绝焦点丢失。",
    agentPrompt: `使用 @ui-sdk/core 的 createFocusRecovery 原语，监听动态列表中的节点卸载事件。当用户按 Delete 键移除某一项时，焦点不能丢失到 body，必须平滑回退至后一项或前一项。`,
    primitiveSource: `import { createFocusRecovery } from "@ui-sdk/core";

const recovery = createFocusRecovery({
  onLostFocus: (lost) => {
    // 自动寻找下一个或者上一个同级 DOM 节点激活焦点
    lost.findNextAvailable()?.focus();
  }
});`
  },

  spatialMove: {
    id: "spatialMove",
    title: "空间方向几何寻路",
    category: "Atomic",
    behaviors: ["spatialMove", "nearestInDirection"],
    description: "对于非网格正交布局（散布在 2D 平面上的任意卡片），通过计算物理屏幕像素距离和视线扇区，实现 Arrow 键顺畅跳转。",
    agentPrompt: `使用 @ui-sdk/core 的 spatialMove 和 nearestInDirection，为一个自由布局的节点群添加全键盘导航支持。传入当前节点的 getBoundingClientRect 与所有候选节点的 Rect 列表，获取最合理的下一跳目标。`,
    primitiveSource: `import { spatialMove } from "@ui-sdk/core";

const nextElement = spatialMove({
  direction: "down",
  current: activeElement.getBoundingClientRect(),
  candidates: Array.from(allElements).map(el => ({ element: el, rect: el.getBoundingClientRect() }))
});
nextElement?.focus();`
  },

  inputHistory: {
    id: "inputHistory",
    title: "终端输入栈 (Input History)",
    category: "Atomic",
    behaviors: ["createInputHistory"],
    description: "为输入框添加类似 Unix Terminal / REPL 的上下箭头历史命令回溯，并在清空或编辑时维护草稿状态。",
    agentPrompt: `使用 @ui-sdk/core 的 createInputHistory 原语，实现一个拥有容量上限 (capacity) 的历史记录栈。支持 push(cmd)、navigateUp()、navigateDown()，并能在回到最新位置时恢复未提交的当前草稿。`,
    primitiveSource: `import { createInputHistory } from "@ui-sdk/core";

const history = createInputHistory({
  capacity: 20
});

// 在 input 上监听 onKeyDown
if (e.key === "ArrowUp") {
  const prev = history.navigateUp(input.value);
  if (prev !== undefined) input.value = prev;
}`
  },

  textMatch: {
    id: "textMatch",
    title: "模糊分词高亮 (Text Match)",
    category: "Atomic",
    behaviors: ["fuzzyScore", "matchRanges", "matchSegments"],
    description: "将输入查询词与候选文本进行高阶相似度评分，并将字符串精准切片为普通字符片段与匹配高亮片段用于渲染。",
    agentPrompt: `使用 @ui-sdk/core/text-match 的 fuzzyScore 和 matchRanges，为一个搜索组件实现高亮分词。返回片段数组，形如 [{ text: "foo", matched: true }, { text: "bar", matched: false }]。`,
    primitiveSource: `import { fuzzyScore, matchRanges } from "@ui-sdk/core/text-match";

const score = fuzzyScore("next", "Next.js App Router");
const ranges = matchRanges("next", "Next.js App Router");
// ranges 为 [[0, 4]] 对应 "Next" 区域`
  },

  dragThreshold: {
    id: "dragThreshold",
    title: "拖拽防抖阈值 (Drag Threshold)",
    category: "Atomic",
    behaviors: ["bindDrag", "dragThreshold"],
    description: "严格区分用户的微小点击手势与真正的拖拽意图，防止因点击手抖导致误触拖拽或触发意外布局位移。",
    agentPrompt: `使用 @ui-sdk/core 的 dragThreshold 和 bindDrag，实现精准手势分流：只有当指针位移超过 3px 阈值时才激活 Dragging 状态，否则按普通 Click 事件放行。`,
    primitiveSource: `import { bindDrag, dragThreshold } from "@ui-sdk/core";

bindDrag(buttonElement, {
  threshold: dragThreshold({ distance: 4 }),
  onDragStart: (e) => console.log("Drag confirmed, distance exceeded threshold"),
  onClick: (e) => console.log("Normal click triggered")
});`
  }
};
