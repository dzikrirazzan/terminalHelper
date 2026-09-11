import { spawn } from "node:child_process";

function openWith(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore"
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

export async function openConfigFile(configPath: string): Promise<void> {
  const editor = process.env.EDITOR || process.env.VISUAL;

  if (editor) {
    await openWith(editor, [configPath]);
    return;
  }

  if (process.platform === "darwin") {
    await openWith("open", [configPath]);
    return;
  }

  if (process.platform === "win32") {
    await openWith("notepad", [configPath]);
    return;
  }

  await openWith("xdg-open", [configPath]);
}
