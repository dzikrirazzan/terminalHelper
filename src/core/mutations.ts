import type { CommandEntry, NotesDocument } from "./types.js";
import { validateCommand, validateNotesDocument } from "./validation.js";

export function upsertCommand(notes: NotesDocument, command: CommandEntry): NotesDocument {
  const validated = validateCommand(command);
  const commands = [...notes.commands];
  const index = commands.findIndex((item) => item.id === validated.id);

  if (index >= 0) {
    commands[index] = validated;
  } else {
    commands.push(validated);
  }

  return validateNotesDocument({
    version: notes.version,
    commands,
  });
}

export function deleteCommand(notes: NotesDocument, commandId: string): NotesDocument {
  const commands = notes.commands.filter((command) => command.id !== commandId);

  return validateNotesDocument({
    version: notes.version,
    commands,
  });
}
