import type { CommandEntry } from "./types.js";

export function getCategories(commands: CommandEntry[]): string[] {
  return [...new Set(commands.map((command) => command.category))].sort((a, b) => a.localeCompare(b));
}

export function filterCommands(commands: CommandEntry[], query: string, category = "all"): CommandEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return commands.filter((command) => {
    const matchesCategory = category === "all" || command.category === category;
    const searchable = [
      command.id,
      command.title,
      command.category,
      command.summary,
      command.notes || "",
      ...command.syntax,
      ...command.tags,
      ...command.examples.flatMap((example) => [example.command, example.explanation])
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}
