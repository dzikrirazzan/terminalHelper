import os from "node:os";
import path from "node:path";

export const CONFIG_DIR_NAME = ".terminal-help";
export const CONFIG_FILE_NAME = "notes.yaml";

export function expandHome(inputPath: string): string {
  if (inputPath === "~") {
    return os.homedir();
  }

  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  return inputPath;
}

export function getDefaultConfigDir(): string {
  return path.join(os.homedir(), CONFIG_DIR_NAME);
}

export function getDefaultConfigPath(): string {
  return path.join(getDefaultConfigDir(), CONFIG_FILE_NAME);
}

export function resolveConfigPath(configPath?: string): string {
  const configuredPath = configPath || process.env.TERMINAL_HELP_CONFIG;
  return path.resolve(expandHome(configuredPath || getDefaultConfigPath()));
}
