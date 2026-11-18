# Vercel UI SDK Demo & Showcase

基于 Vercel Labs 推出的 **UI SDK (`@ui-sdk/core`, `@ui-sdk/react`)** 打造的交互式 Demo 网站与 Agent 组装技术参考站点。

> **核心哲学**：*Behaviors, Not Finished Components.*
> 
> 提供 50+ 个无头底层交互行为（焦点漫游、2D 网格漫游、空间寻路、矩形选区、拖拽重排、虚拟滚动、模糊分词等），专为 AI Coding Agent 与开发者解耦行为逻辑与视觉渲染。

---

## 🌟 核心特性与模块

### 1. 全局单键 HUD 透视 (Behavior X-Ray)
- **触发机制**：轻按键盘 <kbd>X</kbd> 键或点击右下角雷达胶囊触发。
- **实时按键流 (Key Stream)**：捕获并展示用户的最近按键序列（如 `Tab`、`ArrowDown`、`⌘K`）。
- **活动 DOM 焦点探针 (Focus Inspector)**：追踪当前聚焦元素的 `tag`、`role`、`tabindex` 与 `aria-*` 属性。
- **活跃 Behavior 矩阵 (Active Behaviors)**：实时高亮当前处于运行状态的行为积木（如 `createRovingFocus`、`createGridFocus`、`createLasso`）。

### 2. 四大标杆复合组件 Showcase
1. **⌘K 多级命令面板 (Command Palette)**：
   - 组合：`createPopup` + `createRovingFocus` + `fuzzyScore` + `matchRanges` + `createInputHistory`。
   - 键盘上下键循环漫游，模糊搜索高亮分词，输入历史栈回溯，支持子菜单与 Backspace 返回。
2. **电子表格级 2D 数据网格 (Data Grid)**：
   - 组合：`createGridFocus` + `byCell` + `createCellRange` + `cellsToText` + `textToCells`。
   - 键盘上下左右 2D 焦点漫游，Shift + 方向键或鼠标拖拽矩形选区，TSV 剪贴板双向复制粘贴，动态计算求和与均值。
3. **双模看板与跨列穿梭 (Dual-Mode Kanban)**：
   - 组合：`createReorder` + `createTransfer` + `bindDrag` + `bindDragPreview` + `reorderMessage` + `transferMessage`。
   - 鼠标物理拖拽手感与**全键盘无障碍操作**双模驱动（Space 拾取，←/→ 跨列，↑/↓ 换位，Enter 放置），具备标准 ARIA 语音播报。
4. **可调分栏画布 + 矩形框选 (Resizable Canvas & Lasso)**：
   - 组合：`createResize` + `createLasso` + `spatialMove` + `nearestInDirection`。
   - 侧边栏把手拖拽缩放，画布空白处套索框选，散落节点间按屏幕真实物理几何欧式距离进行键盘寻路跳跃。

### 3. 原子 Behavior Bento 实验室 (6 大微画布)
- **`createTypeahead`**：键盘字符跳跃定位
- **`createFocusRecovery`**：节点卸载销毁时焦点平滑自愈
- **`spatialMove`**：2D 散点空间几何寻路
- **`createInputHistory`**：终端级输入栈记忆与回溯
- **`matchRanges` & `fuzzyScore`**：模糊分词切片高亮渲染
- **`dragThreshold`**：4px 拖拽激活防抖保护

### 4. Agent-First 赋能与 Vercel AI SDK 实时组装台
- **UI SDK AI Agent 组装台 (`/api/agent`)**：基于 Vercel AI SDK v7 `ToolLoopAgent`、`@ai-sdk/react` (`useChat` + `DefaultChatTransport`) 与 **Vercel AI Gateway** (`anthropic/claude-sonnet-5.5`) 构建的多步工具调用智能体：
  1. `searchBehaviors`：检索 `@ui-sdk/core` 无头行为原语与无障碍保证。
  2. `inspectBehaviorDoc`：实时读取随包附带的 `node_modules/@ui-sdk/core/docs` Markdown 文档片段。
  3. `composePrimitive`：输出标准 `definePrimitive` 逻辑层与 `@ui-sdk/react/primitive` `createParts` 渲染层双栏代码，并联动全局 X-Ray HUD。
- **双模无感运行**：在 Vercel 部署环境（`VERCEL_OIDC_TOKEN`）或配置了 `AI_GATEWAY_API_KEY` 时自动走真实 AI Gateway 模型推理；本地未配密钥时自动降级为免报错确定性 `UIMessageStream` 工具循环演示流。
- 每个复合组件和原子卡片同时配备 **「复制 Agent 组装 Prompt」** 与 **「查看 definePrimitive 源码」** 快捷弹窗。

---

## 🚀 本地快速启动

```bash
# 安装依赖
pnpm install # 或 npm install

# 启动开发服务器
npm run dev

# 生产环境构建与启动
npm run build
npm start
```

访问 `http://localhost:3000`（或控制台提示端口）即可体验完整交互。

---

## 部署至 Vercel

本项目为原生 Next.js 15 (App Router) + React 19 应用，零外部二进制依赖：
1. 推送代码至 GitHub 仓库。
2. 在 Vercel 控制台选择该项目并点击 **Deploy**。
3. 即可完成自动化全站部署。
