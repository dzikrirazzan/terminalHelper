import type { CommandEntry } from "./types.js";

export function getCategories(commands: CommandEntry[]): string[] {
  return [...new Set(commands.map((command) => command.category))].sort((a, b) => a.localeCompare(b));
}

export function filterCommands(commands: CommandEntry[], query: string, category = "all"): CommandEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

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

    return matchesCategory && queryTerms.every((term) => searchable.includes(term));
  });
}

export function getSearchScore(command: CommandEntry, query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return 0;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const title = command.title.toLowerCase();
  const id = command.id.toLowerCase();
  const category = command.category.toLowerCase();

  return terms.reduce((score, term) => {
    if (id === term || title === term) return score + 100;
    if (title.startsWith(term)) return score + 60;
    if (id.includes(term)) return score + 45;
    if (title.includes(term)) return score + 35;
    if (category.includes(term)) return score + 20;
    return score + 1;
  }, 0);
}
