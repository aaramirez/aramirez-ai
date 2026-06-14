import type { Plugin } from "@opencode-ai/plugin";

export default (async () => {
  return {
    config: (cfg: Record<string, unknown>) => {
      // Custom config mutations here
    },
    "tool.execute.before": async (
      _input: Record<string, unknown>,
      output: { args: Record<string, unknown> },
    ) => {
      // Log or modify tool calls before execution
    },
  };
}) satisfies Plugin;
