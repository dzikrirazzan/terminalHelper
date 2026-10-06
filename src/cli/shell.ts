import { spawn, spawnSync } from "node:child_process";

export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function hasExecutable(name: string): boolean {
  const result = process.platform === "win32"
    ? spawnSync("where", [name], { stdio: "ignore" })
    : spawnSync("command", ["-v", name], { stdio: "ignore" });

  return result.status === 0;
}

export function spawnDetached(command: string, args: string[], env: NodeJS.ProcessEnv = process.env): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      env,
      stdio: "ignore"
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}
