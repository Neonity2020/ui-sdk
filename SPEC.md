# Vercel UI SDK Demo 网站技术与交互规范 (SPEC)

## 1. 项目定位与核心价值
本站是针对 Vercel Labs 发布的 **UI SDK (`@ui-sdk/core`, `@ui-sdk/react`)** 打造的深度交互式 Demo 与技术参考站点。
UI SDK 的核心哲学是 **"Behaviors, Not Finished Components"**（提供无头交互行为积木，面向 AI Coding Agent 与开发者自由组装）。
本演示站点旨在打破“无头库看不见摸不着”的痛点，将抽象的 Focus、Selection、Drag & Drop、Popup、Virtualizer 等底层 Behavior 转化为极致细腻的可操作体验。

---

## 2. 技术栈架构
- **框架**：Next.js 15+ (App Router) + React 19
- **核心依赖**：
  - `@ui-sdk/core` (底层行为状态机与无障碍引擎)
  - `@ui-sdk/react` (React 19 适配器与 Slots/Parts 绑定)
  - `lucide-react` (图标库)
  - `clsx` + `tailwind-merge` (样式合并)
- **样式体系**：Tailwind CSS v3/v4，严格对齐 **Vercel Geist Design System**
  - 1px 细线工业边框 (`border-neutral-200 dark:border-neutral-800`)
  - 细密底纹点阵与网格背景 (Subtle Grid Pattern)
  - Geist Sans & Geist Mono 字体排版
  - 完善的系统级暗黑模式（Dark / Light Mode 切换）
- **语言**：中英文混合（中文引导与设计解读，英文保留标准 API 与术语规范，适配中文开发者圈与全球开源生态）。

---

## 3. 网站功能架构与页面布局

### 3.1 顶部导航与全局控制 (Header & Global HUD)
- **品牌区**：Vercel 风格三角标 + `UI SDK` 徽标与版本标 tag (`@ui-sdk/core`)
- **全局 HUD 触发器**：
  - 快捷键提示：按 <kbd>X</kbd> 开启 / 关闭 **Behavior X-Ray** 透视模式
  - 胶囊按钮：状态指示器（显示当前页面挂载的 Behavior 计数、活跃焦点元素）
- **主题切换**：Dark / Light 一键切换
- **源码与外链**：Github 仓库链接、ui-sdk.dev 官方文档链接

### 3.2 页面主体结构（单页高密度滚动 + 快速锚点导航）
整个页面分为三大核心板块：
1. **Hero 交互引言**：直观展示 `@ui-sdk/core` 的组装式架构与 Agent 协同哲学。
2. **原子 Behavior Bento 实验室 (Atomic Bento Labs)**：6-8 个精致微交互卡片。
3. **四大标杆复合组件 Showcase (Composite Showcase)**：高保真业务级场景组合。

---

## 4. 四大标杆复合组件实战 (Composite Showcases)

### 4.1 ⌘K 多级命令面板 (Command Palette)
- **组合的 Behaviors**：
  - `createPopup` + `popoverPreset`：快捷键与浮层生命周期
  - `@ui-sdk/core/text-match` (`fuzzyScore`, `matchRanges`)：智能模糊匹配与字符高亮
  - `createRovingFocus`：上下箭头与 Tab 键平滑游走
  - `createInputHistory`：输入框上下按键提取终端历史记录
- **交互亮点**：
  - 按 <kbd>⌘</kbd><kbd>K</kbd> 或点击搜索框触发
  - 支持多级菜单切换（例如：设置主题 -> 选择深色/浅色，按 Backspace 返回上一级）
  - 右侧/底部实时高亮显示当前由哪个 Behavior 在响应事件

### 4.2 电子表格级 2D 数据网格 (Data Grid)
- **组合的 Behaviors**：
  - `createGridFocus` + `byCell`：行与列的 2D 焦点无障碍漫游
  - `createCellRange` + `byCellRange`：鼠标拖拽与按住 <kbd>Shift</kbd> 的多单元格框选
  - `cellsToText` / `textToCells`：与原生剪贴板的复制粘贴互通 (TSV/CSV 格式)
  - `createVirtualizer`：虚拟滚动支持 10,000+ 行流畅平滑渲染
- **交互亮点**：
  - 纯键盘即可导航单元格，高亮选中区块
  - 支持快捷键全选、复制到剪贴板，底部显示选中单元格统计信息

### 4.3 双模看板与跨列穿梭 (Dual-Mode Kanban & Transfer)
- **组合的 Behaviors**：
  - `createReorder`：列内卡片顺序重排
  - `createTransfer`：跨列移转任务卡片
  - `bindDrag` + `bindDragPreview`：指针拖拽手感、微缩拖拽幽灵阴影
  - `transferMessage` + `reorderMessage`：全键盘无障碍支持（键盘按空格拾取卡片，左右箭头跨列，上下箭头换位，Enter 放置）
- **交互亮点**：
  - 解决现代前端“只做鼠标拖拽，丢掉键盘无障碍”的硬伤，演示完整的无障碍重排体验

### 4.4 可调分栏画布 + 矩形框选 (Resizable Canvas & Lasso)
- **组合的 Behaviors**：
  - `createResize`：面板比例拖拽与吸附 (Snap)
  - `createLasso`：在画布空白处按住鼠标拖出的动态矩形选择框
  - `spatialMove` / `nearestInDirection`：基于空间几何位置的非线性焦点跳转
- **交互亮点**：
  - 左侧树形/文件列表可拖动把手缩放宽度；右侧多元素画布支持套索框选与空间光标移动

---

## 5. 原子 Behavior Bento 实验室 (Bento Labs)
精选 6 个最具有代表性的底层行为原语，做成独立微画布卡片：
1. **Typeahead 字符跳跃 (`createTypeahead`)**：快速敲击键盘字母，光标立刻在长列表中飞跃至首字母匹配项。
2. **焦点自愈 (`createFocusRecovery` + `keepFocus`)**：当列表项在操作中被动态删除或节点卸载时，焦点自动自愈恢复到合理的邻近节点，防止焦点丢失落空到 `document.body`。
3. **空间定位导航 (`spatialMove`)**：非正交排布的卡片或星空点阵中，按上下左右根据真实屏幕几何距离寻路。
4. **历史栈穿梭 (`createInputHistory`)**：带记忆的提示输入框，支持像 Bash/Zsh 一样按 <kbd>↑</kbd> <kbd>↓</kbd> 溯源历史命令。
5. **模糊高亮切片 (`matchRanges` + `matchSegments`)**：输入关键词，字符串在毫秒级内被切分成未匹配段与高亮段，展示分词精准度。
6. **手势阈值与拖拽保护 (`bindDrag` + `dragThreshold`)**：测试 3px/5px 阈值防抖，区分点击与拖拽手势。

---

## 6. 特色杀手锏功能

### 6.1 全局单键 HUD 模式 (Behavior X-Ray)
- **默认状态**：100% 极简克制，呈现如纯生商业级应用的丝滑触感。
- **触发机制**：轻按键盘 <kbd>X</kbd> 键（或右下角浮动雷达胶囊）：
  - **按键回显条 (Key Stream)**：屏幕底部以极其雅致的按键气泡浮现用户的每一次 KeyDown（如 `Tab`、`ArrowDown`、`⌘+K`）。
  - **焦点轨迹光环 (Focus Ring Halo)**：为当前获得焦点的 DOM 节点施加高精度的动态高亮边框和 ARIA 角色标签（如 `role="gridcell"`、`tabindex="0"`）。
  - **行为积木徽章 (Active Behavior Badges)**：在激活的组件右上角实时浮现 `[createRovingFocus: active]`、`[createTypeahead: listening]` 等状态指示。

### 6.2 Agent-First 组装 Prompt 与源码生成器
- 每个实战组件与 Bento 卡片均配备 **「复制 Agent 组装 Prompt」** 与 **「查看 Primitive 源码」** 按钮：
  - 点击后可一键复制专门为 AI Coding Agent (如 Cursor / Claude / Gemini) 准备的 Behavior 组装 Prompt。
  - 展示 `@ui-sdk/core` 的 `definePrimitive` 逻辑，以及 `@ui-sdk/react` 的 `createParts` 渲染层绑定。

---

## 7. 部署与交付规划
- 适配 Vercel 一键自动化部署，保证服务端渲染 (SSR) 与客户端纯净水合 (Hydration) 零闪烁。
- 遵循零外部重型运行时依赖，保持首屏加载与运行性能在毫秒级。
