import { defaultNotes } from "../core/defaultNotes.js";
import type { NotesDocument, NotesStoreResult } from "../core/types.js";

const STORAGE_KEY = "terminal-help.preview-notes";

function cloneNotes(notes: NotesDocument): NotesDocument {
  return JSON.parse(JSON.stringify(notes)) as NotesDocument;
}

function getFallbackApi() {
  return {
    async loadNotes(): Promise<NotesStoreResult> {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const notes = saved ? (JSON.parse(saved) as NotesDocument) : cloneNotes(defaultNotes);

      return {
        configPath: "browser preview",
        notes
      };
    },
    async saveNotes(notes: NotesDocument): Promise<NotesStoreResult> {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      return {
        configPath: "browser preview",
        notes
      };
    },
    async resetNotes(): Promise<NotesStoreResult> {
      const notes = cloneNotes(defaultNotes);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      return {
        configPath: "browser preview",
        notes
      };
    },
    async openConfig(): Promise<string> {
      return "browser preview";
    }
  };
}

export function getTerminalHelpApi() {
  return window.terminalHelp ?? getFallbackApi();
}
