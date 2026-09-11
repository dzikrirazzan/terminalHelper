import type { CommandEntry } from "../core/types.js";

export type FormMode = "add" | "edit";

export type FormValues = {
  id: string;
  title: string;
  category: string;
  summary: string;
  syntax: string;
  exampleCommand: string;
  exampleExplanation: string;
  tags: string;
  notes: string;
};

export type FormField = {
  key: keyof FormValues;
  label: string;
};

export const formFields: FormField[] = [
  { key: "id", label: "id" },
  { key: "title", label: "title" },
  { key: "category", label: "category" },
  { key: "summary", label: "summary" },
  { key: "syntax", label: "syntax (comma separated)" },
  { key: "exampleCommand", label: "example command" },
  { key: "exampleExplanation", label: "example explanation" },
  { key: "tags", label: "tags (comma separated)" },
  { key: "notes", label: "notes" }
];

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function valuesFromCommand(command?: CommandEntry): FormValues {
  return {
    id: command?.id ?? "",
    title: command?.title ?? "",
    category: command?.category ?? "",
    summary: command?.summary ?? "",
    syntax: command?.syntax.join(", ") ?? "",
    exampleCommand: command?.examples[0]?.command ?? "",
    exampleExplanation: command?.examples[0]?.explanation ?? "",
    tags: command?.tags.join(", ") ?? "",
    notes: command?.notes ?? ""
  };
}

export function commandFromValues(values: FormValues, fallback?: CommandEntry): CommandEntry {
  const title = values.title.trim() || fallback?.title || values.id.trim();
  const id =
    values.id.trim() ||
    fallback?.id ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const syntax = splitList(values.syntax);
  const tags = splitList(values.tags);
  const exampleCommand = values.exampleCommand.trim();
  const exampleExplanation = values.exampleExplanation.trim();

  return {
    id,
    title,
    category: values.category.trim() || fallback?.category || "custom",
    summary: values.summary.trim() || fallback?.summary || "Custom terminal note.",
    syntax: syntax.length > 0 ? syntax : fallback?.syntax ?? [title],
    examples:
      exampleCommand && exampleExplanation
        ? [
            {
              command: exampleCommand,
              explanation: exampleExplanation
            }
          ]
        : fallback?.examples ?? [
            {
              command: title,
              explanation: "Run the command in your terminal."
            }
          ],
    tags,
    notes: values.notes.trim() || undefined
  };
}
