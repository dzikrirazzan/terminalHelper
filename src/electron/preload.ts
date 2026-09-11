import { contextBridge, ipcRenderer } from "electron";
import type { NotesDocument, NotesStoreResult } from "../core/types.js";

const api = {
  loadNotes: (): Promise<NotesStoreResult> => ipcRenderer.invoke("terminal-help:load-notes"),
  saveNotes: (notes: NotesDocument): Promise<NotesStoreResult> => ipcRenderer.invoke("terminal-help:save-notes", notes),
  resetNotes: (): Promise<NotesStoreResult> => ipcRenderer.invoke("terminal-help:reset-notes"),
  openConfig: (): Promise<string> => ipcRenderer.invoke("terminal-help:open-config")
};

contextBridge.exposeInMainWorld("terminalHelp", api);

export type TerminalHelpApi = typeof api;
