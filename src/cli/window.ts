import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import electronPath from "electron";
import { resolveConfigPath } from "../core/config.js";

export async function launchWindow(configPath?: string): Promise<void> {
  const resolvedConfigPath = resolveConfigPath(configPath);
  const mainPath = fileURLToPath(new URL("../electron/main.js", import.meta.url));
  const child = spawn(electronPath as unknown as string, [mainPath], {
    detached: true,
    env: {
      ...process.env,
      TERMINAL_HELP_CONFIG: resolvedConfigPath
    },
    stdio: "ignore"
  });

  child.unref();
}
