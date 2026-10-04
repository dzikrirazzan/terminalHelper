import type { CommandEntry, CommandExample, NotesDocument } from "./types.js";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ConfigError(`Expected ${field} to be a non-empty string.`);
  }

  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return requireString(value, field);
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new ConfigError(`Expected ${field} to be a list of strings.`);
  }

  return value.map((item, index) => requireString(item, `${field}[${index}]`));
}

function validateExamples(value: unknown, field: string): CommandExample[] {
  if (!Array.isArray(value)) {
    throw new ConfigError(`Expected ${field} to be a list of examples.`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new ConfigError(`Expected ${field}[${index}] to be an object.`);
    }

    return {
      command: requireString(item.command, `${field}[${index}].command`),
      explanation: requireString(item.explanation, `${field}[${index}].explanation`),
    };
  });
}

export function validateCommand(value: unknown, field = "command"): CommandEntry {
  if (!isRecord(value)) {
    throw new ConfigError(`Expected ${field} to be an object.`);
  }

  const command: CommandEntry = {
    id: requireString(value.id, `${field}.id`),
    title: requireString(value.title, `${field}.title`),
    category: requireString(value.category, `${field}.category`),
    summary: requireString(value.summary, `${field}.summary`),
    syntax: requireStringArray(value.syntax, `${field}.syntax`),
    examples: validateExamples(value.examples, `${field}.examples`),
    tags: Array.isArray(value.tags) ? requireStringArray(value.tags, `${field}.tags`) : [],
    notes: optionalString(value.notes, `${field}.notes`),
  };

  return command;
}

export function validateNotesDocument(value: unknown): NotesDocument {
  if (!isRecord(value)) {
    throw new ConfigError("Expected notes file to contain an object.");
  }

  if (value.version !== 1 && value.version !== 2) {
    throw new ConfigError("Expected notes version to be 1 or 2.");
  }

  if (!Array.isArray(value.commands)) {
    throw new ConfigError("Expected commands to be a list.");
  }

  const commands = value.commands.map((command, index) => validateCommand(command, `commands[${index}]`));
  const seen = new Set<string>();

  for (const command of commands) {
    if (seen.has(command.id)) {
      throw new ConfigError(`Duplicate command id: ${command.id}`);
    }

    seen.add(command.id);
  }

  return {
    version: 1,
    commands,
  };
}
