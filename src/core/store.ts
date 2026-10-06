import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { resolveConfigPath } from "./config.js";
import { defaultNotes } from "./defaultNotes.js";
import { deleteCommand, upsertCommand } from "./mutations.js";
import type { NotesDocument, NotesStoreResult } from "./types.js";
import { validateNotesDocument } from "./validation.js";

export { deleteCommand, upsertCommand };

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function stringifyNotes(notes: NotesDocument): string {
  return YAML.stringify(notes, {
    lineWidth: 100,
    singleQuote: false,
  });
}

function migrateNotes(notes: NotesDocument): NotesDocument {
  if (notes.version === 2) {
    return notes;
  }

  const existingIds = new Set(notes.commands.map((command) => command.id));
  const missingCommands = defaultNotes.commands.filter((command) => !existingIds.has(command.id));

  return {
    version: 2,
    commands: [...notes.commands, ...missingCommands],
  };
}

export async function ensureNotesFile(configPath?: string): Promise<string> {
  const resolvedPath = resolveConfigPath(configPath);

  if (!(await fileExists(resolvedPath))) {
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, stringifyNotes(defaultNotes), { encoding: "utf8", mode: 0o600 });
  }

  return resolvedPath;
}

export async function loadNotes(configPath?: string): Promise<NotesStoreResult> {
  const resolvedPath = await ensureNotesFile(configPath);
  const contents = await fs.readFile(resolvedPath, "utf8");
  const parsed = YAML.parse(contents);

  const notes = migrateNotes(validateNotesDocument(parsed));

  return {
    configPath: resolvedPath,
    notes,
  };
}

export async function saveNotes(notes: NotesDocument, configPath?: string): Promise<NotesStoreResult> {
  const resolvedPath = resolveConfigPath(configPath);
  const validated = validateNotesDocument(notes);

  await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
  const temporaryPath = `${resolvedPath}.${process.pid}.${Date.now()}.tmp`;

  try {
    await fs.writeFile(temporaryPath, stringifyNotes(validated), { encoding: "utf8", mode: 0o600 });
    await fs.rename(temporaryPath, resolvedPath);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }

  return {
    configPath: resolvedPath,
    notes: validated,
  };
}

export async function resetNotes(configPath?: string): Promise<NotesStoreResult> {
  return saveNotes(defaultNotes, configPath);
}
