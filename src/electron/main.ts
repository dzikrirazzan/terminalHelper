import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { resolveConfigPath } from "../core/config.js";
import { ensureNotesFile, loadNotes, resetNotes, saveNotes } from "../core/store.js";
import { openConfigFile } from "../core/openFile.js";
import type { NotesDocument } from "../core/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getConfigPathFromProcess(): string {
  const configArg = process.argv.find((arg) => arg.startsWith("--config="));
  const configValue = configArg?.slice("--config=".length);
  return resolveConfigPath(configValue || process.env.TERMINAL_HELP_CONFIG);
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const width = Math.min(720, Math.max(560, Math.floor(workArea.width * 0.38)));
  const height = Math.max(680, workArea.height - 80);

  const window = new BrowserWindow({
    width,
    height,
    minWidth: 520,
    minHeight: 560,
    x: workArea.x + workArea.width - width - 24,
    y: workArea.y + 40,
    title: "terminal-help",
    backgroundColor: "#101318",
    titleBarStyle: "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererUrl = process.env.TERMINAL_HELP_RENDERER_URL;

  if (rendererUrl) {
    void window.loadURL(rendererUrl);
  } else {
    void window.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  const configPath = getConfigPathFromProcess();

  ipcMain.handle("terminal-help:load-notes", async () => loadNotes(configPath));
  ipcMain.handle("terminal-help:save-notes", async (_event, notes: NotesDocument) => saveNotes(notes, configPath));
  ipcMain.handle("terminal-help:reset-notes", async () => resetNotes(configPath));
  ipcMain.handle("terminal-help:open-config", async () => {
    const resolvedPath = await ensureNotesFile(configPath);
    await openConfigFile(resolvedPath);
    return resolvedPath;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
