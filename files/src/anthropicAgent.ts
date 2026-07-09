import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ClientTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<string>;
}

export type ServerTool = { type: string; name: string; [key: string]: unknown };

export interface RunAgentOptions {
  model: string;
  system: string;
  tools?: (ClientTool | ServerTool)[];
  maxTokens?: number;
  maxTurns?: number;
}

function isClientTool(tool: ClientTool | ServerTool): tool is ClientTool {
  return "execute" in tool;
}

function lastTextBlock(content: Anthropic.ContentBlock[]): string {
  // Walk from the end to get the model's final prose (after any server tool results).
  for (let i = content.length - 1; i >= 0; i--) {
    const b = content[i];
    if (b.type === "text") return b.text;
  }
  return "";
}

export async function runAgent(
  userContent: string,
  opts: RunAgentOptions,
): Promise<string> {
  const tools = opts.tools ?? [];
  const clientTools = tools.filter(isClientTool);
  const toolSchemas = tools.map((t) =>
    isClientTool(t)
      ? {
          name: t.name,
          description: t.description,
          input_schema: t.input_schema,
        }
      : t,
  );

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userContent },
  ];

  for (let turn = 0; turn < (opts.maxTurns ?? 12); turn++) {
    const response = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages,
      ...(toolSchemas.length ? { tools: toolSchemas as Anthropic.Tool[] } : {}),
    });

    // pause_turn: a server tool (e.g. web_search) ran mid-turn and the model needs
    // another iteration to process the results and finish its response. Push the current
    // content and loop — no user message required.
    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const pendingClientCalls = response.content.filter(
      (block): block is Anthropic.ToolUseBlock =>
        block.type === "tool_use" &&
        clientTools.some((t) => t.name === block.name),
    );

    if (pendingClientCalls.length === 0) {
      return lastTextBlock(response.content);
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      pendingClientCalls.map(async (call) => {
        const tool = clientTools.find((t) => t.name === call.name)!;
        const result = await tool.execute(
          call.input as Record<string, unknown>,
        );
        return {
          type: "tool_result" as const,
          tool_use_id: call.id,
          content: result,
        };
      }),
    );

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error(
    `Agent exceeded maximum turns (${opts.maxTurns ?? 12}) without finishing`,
  );
}
