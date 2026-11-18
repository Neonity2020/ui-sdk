import {
  ToolLoopAgent,
  type InferAgentUIMessage,
  gateway,
  isStepCount,
  tool,
} from "ai";
import { z } from "zod";
import {
  buildComponentBlueprint,
  readBundledDocExcerpt,
  searchBehaviorCatalog,
} from "./behavior-catalog";

export const UI_SDK_AGENT_MODEL = "anthropic/claude-sonnet-5.5";

export const uiSdkTools = {
  searchBehaviors: tool({
    description:
      "Search Vercel Labs @ui-sdk/core headless behavior primitives by component requirement or interaction keyword (e.g. roving focus, popup, spatial move, lasso, virtualizer, agent bridge).",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Interaction goal or keywords describing what the UI needs to do"),
    }),
    execute: async ({ query }) => {
      const matches = searchBehaviorCatalog(query, 5);
      return {
        query,
        matchedCount: matches.length,
        behaviors: matches.map((m) => ({
          name: m.name,
          category: m.category,
          importPath: m.importPath,
          summary: m.summary,
          ariaGuarantees: m.ariaGuarantees,
        })),
      };
    },
  }),

  inspectBehaviorDoc: tool({
    description:
      "Read the official bundled Markdown documentation excerpt from node_modules/@ui-sdk/core/docs (core.md / agents.md) to verify exact definePrimitive, createParts, or createAgent APIs.",
    inputSchema: z.object({
      topic: z
        .string()
        .describe("Topic or behavior heading to inspect, e.g. 'Define a Primitive', 'Compose Behaviors', or 'Agents Use Your Components'"),
    }),
    execute: async ({ topic }) => {
      return readBundledDocExcerpt(topic);
    },
  }),

  composePrimitive: tool({
    description:
      "Generate a framework-agnostic @ui-sdk/core definePrimitive module and its @ui-sdk/react/primitive createParts binding for the requested UI component.",
    inputSchema: z.object({
      componentGoal: z
        .string()
        .describe("Clear description of the target component and its interactions"),
      kebabName: z
        .string()
        .optional()
        .describe("Optional kebab-case name for the primitive, e.g. 'icon-picker'"),
      behaviors: z
        .array(z.string())
        .optional()
        .describe("Selected @ui-sdk/core behavior names to compose"),
    }),
    execute: async ({ componentGoal, kebabName, behaviors }) => {
      return buildComponentBlueprint({ componentGoal, kebabName, behaviors });
    },
  }),
};

export const uiSdkAgent = new ToolLoopAgent({
  model: gateway(UI_SDK_AGENT_MODEL),
  instructions: `你是 Vercel UI SDK (@ui-sdk/core & @ui-sdk/react) 首席架构智能体，基于 Vercel AI SDK ToolLoopAgent 构建。

你的工作流：
1. 先调用 searchBehaviors 检索与用户需求最匹配的 @ui-sdk/core 无头行为积木（Focus、Selection、Popups、Drag & Drop、Text Match、Direct Manipulation、Agent Bridge）。
2. 调用 inspectBehaviorDoc 查阅随包附带的 @ui-sdk/core/docs 官方文档片段，确保 API 与无障碍契约准确无误。
3. 调用 composePrimitive 生成完整的 definePrimitive 核心逻辑与 @ui-sdk/react/primitive 的 createParts 绑定代码。
4. 用简洁专业的中文总结：为什么选择这组 Behavior 积木、它们自动兜底了哪些键盘与 WAI-ARIA 细节，以及如何在业务中使用（由于工具卡片已在界面渲染完整代码，正文中无需重复粘贴整段长代码，重点讲清架构组合思路）。`,
  stopWhen: isStepCount(8),
  tools: uiSdkTools,
});

export type UISdkAgentUIMessage = InferAgentUIMessage<typeof uiSdkAgent>;
