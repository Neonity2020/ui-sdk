import {
  createAgentUIStreamResponse,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import {
  buildComponentBlueprint,
  readBundledDocExcerpt,
  searchBehaviorCatalog,
} from "@/lib/ai/behavior-catalog";
import {
  UI_SDK_AGENT_MODEL,
  uiSdkAgent,
  type UISdkAgentUIMessage,
} from "@/lib/ai/ui-sdk-agent";

function hasGatewayCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim()
  );
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  return Response.json({
    mode: hasGatewayCredentials() ? "ai-gateway" : "local-fallback",
    model: UI_SDK_AGENT_MODEL,
  });
}

export async function POST(request: Request) {
  const { messages }: { messages: UISdkAgentUIMessage[] } = await request.json();

  // 1. Live Vercel AI Gateway execution via ToolLoopAgent when OIDC / API key is present
  if (hasGatewayCredentials()) {
    return createAgentUIStreamResponse({
      agent: uiSdkAgent,
      uiMessages: messages,
    });
  }

  // 2. Zero-Key Deterministic Fallback: runs the exact same @ui-sdk/core server tools
  //    and streams native AI SDK UIMessageChunk steps so local previews work out-of-the-box.
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const userQuery =
    lastUserMessage?.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .trim() || "构建一个可无障碍漫游的复合组件";

  const stream = createUIMessageStream<UISdkAgentUIMessage>({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const uid = Date.now().toString(36);
      writer.write({ type: "start" });

      // Step 1: searchBehaviors
      const callSearchId = `call_search_${uid}`;
      writer.write({ type: "start-step" });
      writer.write({
        type: "tool-input-start",
        toolCallId: callSearchId,
        toolName: "searchBehaviors",
      });
      writer.write({
        type: "tool-input-available",
        toolCallId: callSearchId,
        toolName: "searchBehaviors",
        input: { query: userQuery },
      });
      await pause(160);

      const matches = searchBehaviorCatalog(userQuery, 5);
      writer.write({
        type: "tool-output-available",
        toolCallId: callSearchId,
        output: {
          query: userQuery,
          matchedCount: matches.length,
          behaviors: matches.map((m) => ({
            name: m.name,
            category: m.category,
            importPath: m.importPath,
            summary: m.summary,
            ariaGuarantees: m.ariaGuarantees,
          })),
        },
      });
      writer.write({ type: "finish-step" });

      // Step 2: inspectBehaviorDoc (reads real node_modules/@ui-sdk/core/docs)
      const docTopic = matches[0]?.docAnchor || "Define a Primitive";
      const callDocId = `call_doc_${uid}`;
      writer.write({ type: "start-step" });
      writer.write({
        type: "tool-input-start",
        toolCallId: callDocId,
        toolName: "inspectBehaviorDoc",
      });
      writer.write({
        type: "tool-input-available",
        toolCallId: callDocId,
        toolName: "inspectBehaviorDoc",
        input: { topic: docTopic },
      });
      await pause(180);

      const docExcerpt = readBundledDocExcerpt(docTopic);
      writer.write({
        type: "tool-output-available",
        toolCallId: callDocId,
        output: docExcerpt,
      });
      writer.write({ type: "finish-step" });

      // Step 3: composePrimitive
      const blueprint = buildComponentBlueprint({
        componentGoal: userQuery,
        behaviors: matches.map((m) => m.name),
      });
      const callComposeId = `call_compose_${uid}`;
      writer.write({ type: "start-step" });
      writer.write({
        type: "tool-input-start",
        toolCallId: callComposeId,
        toolName: "composePrimitive",
      });
      writer.write({
        type: "tool-input-available",
        toolCallId: callComposeId,
        toolName: "composePrimitive",
        input: {
          componentGoal: userQuery,
          kebabName: blueprint.primitiveName,
          behaviors: blueprint.selectedBehaviors,
        },
      });
      await pause(200);

      writer.write({
        type: "tool-output-available",
        toolCallId: callComposeId,
        output: blueprint,
      });
      writer.write({ type: "finish-step" });

      // Step 4: Final synthesized explanation streamed progressively
      const summaryLines = [
        `已完成 **${blueprint.componentTitle}** (\`${blueprint.primitiveName}\`) 的无头行为编排：`,
        `\n\n1. **行为积木解耦**：组合了 ${blueprint.selectedBehaviors.map((b) => `\`${b}\``).join(" + ")}，所有状态与键盘寻路均收敛在 \`${blueprint.primitiveFile}\` 的 \`definePrimitive\` 中，与样式零耦合。`,
        `\n2. **内建无障碍契约**：自动维护 ${blueprint.ariaContract.join("、")}，无需手写繁琐的 DOM 事件与焦点恢复样板代码。`,
        `\n3. **多框架一次定义**：在 \`${blueprint.reactFile}\` 中通过 \`createParts\` 映射为纯净 React 19 组件，同一份 Primitive 也可零改动接入 Vue / Svelte / Solid。`,
        `\n\n> 当前运行于本地免密钥 ToolLoop 演示流；部署到 Vercel 或在 \`.env.local\` 配置 \`AI_GATEWAY_API_KEY\` / \`VERCEL_OIDC_TOKEN\` 后将自动切换至 \`${UI_SDK_AGENT_MODEL}\` 实时推理。`,
      ].join("");

      const textId = `txt_${uid}`;
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: textId });

      const chunkSize = 14;
      for (let i = 0; i < summaryLines.length; i += chunkSize) {
        writer.write({
          type: "text-delta",
          id: textId,
          delta: summaryLines.slice(i, i + chunkSize),
        });
        await pause(22);
      }

      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
