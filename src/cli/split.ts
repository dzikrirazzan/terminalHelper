import { spawnSync } from "node:child_process";
import { resolveConfigPath } from "../core/config.js";
import { hasExecutable, shellQuote, spawnDetached } from "./shell.js";

export type SplitResult =
  | { ok: true; mode: "tmux" | "ghostty" }
  | { ok: false; message: string };

export async function launchSplit(configPath?: string): Promise<SplitResult> {
  const resolvedConfigPath = resolveConfigPath(configPath);
  const helperCommand = `terminal-help tui --compact --config ${shellQuote(resolvedConfigPath)}`;

  if (process.env.TMUX && hasExecutable("tmux")) {
    const result = spawnSync("tmux", ["split-window", "-h", "-l", "45%", helperCommand], {
      stdio: "inherit"
    });

    if (result.status === 0) {
      return { ok: true, mode: "tmux" };
    }
  }

  if (process.platform === "darwin") {
    try {
      await spawnDetached("open", ["-na", "Ghostty.app", "--args", "-e", helperCommand]);
      return { ok: true, mode: "ghostty" };
    } catch {
      if (hasExecutable("ghostty")) {
        await spawnDetached("ghostty", ["-e", helperCommand]);
        return { ok: true, mode: "ghostty" };
      }
    }
  }

  if (hasExecutable("ghostty")) {
    await spawnDetached("ghostty", ["-e", helperCommand]);
    return { ok: true, mode: "ghostty" };
  }

  return {
    ok: false,
    message: [
      "No supported terminal split adapter is available.",
      "Run terminal-help tui for the in-terminal UI, or terminal-help window for the side window.",
      "Install tmux if you want terminal-help split to create a real right-side pane."
    ].join("\n")
  };
}
