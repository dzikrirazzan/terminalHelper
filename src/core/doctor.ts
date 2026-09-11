import { spawnSync } from "node:child_process";
import { resolveConfigPath } from "./config.js";
import { fileExists, loadNotes } from "./store.js";
import type { DoctorReport } from "./types.js";

export function hasCommand(command: string): boolean {
  const result =
    process.platform === "win32"
      ? spawnSync("where", [command], { stdio: "ignore" })
      : spawnSync("sh", ["-c", `command -v ${command}`], { stdio: "ignore" });

  return result.status === 0;
}

export async function getDoctorReport(configPath?: string): Promise<DoctorReport> {
  const resolvedConfigPath = resolveConfigPath(configPath);
  const configExists = await fileExists(resolvedConfigPath);
  let configValid = false;
  let error: string | undefined;

  try {
    await loadNotes(resolvedConfigPath);
    configValid = true;
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : String(caughtError);
  }

  return {
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    configPath: resolvedConfigPath,
    configExists,
    configValid,
    tmuxAvailable: hasCommand("tmux"),
    ghosttyAvailable: hasCommand("ghostty") || process.platform === "darwin",
    editor: process.env.EDITOR || process.env.VISUAL || null,
    error
  };
}
