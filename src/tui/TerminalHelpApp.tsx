import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { filterCommands, getCategories } from "../core/search.js";
import { deleteCommand, loadNotes, saveNotes, upsertCommand } from "../core/store.js";
import type { CommandEntry, NotesDocument } from "../core/types.js";
import { ConfigError } from "../core/validation.js";
import { openConfigFile } from "../core/openFile.js";
import { commandFromValues, formFields, valuesFromCommand, type FormMode, type FormValues } from "./form.js";

type FocusMode = "list" | "search" | "detail" | "form";

export type TerminalHelpAppProps = {
  configPath?: string;
  compact?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function trimText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function CommandList({
  commands,
  selectedIndex,
  query,
  category,
  categories,
  focused,
  compact
}: {
  commands: CommandEntry[];
  selectedIndex: number;
  query: string;
  category: string;
  categories: string[];
  focused: boolean;
  compact: boolean;
}) {
  const visibleCommands = commands.slice(0, compact ? 12 : 18);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={focused ? "cyan" : "gray"} width={compact ? 34 : 42} paddingX={1}>
      <Box justifyContent="space-between">
        <Text color="cyan" bold>
          terminal-help
        </Text>
        <Text color="gray">{commands.length}</Text>
      </Box>
      <Text color={query ? "yellow" : "gray"}>/{query || "search commands"}</Text>
      <Text color="gray">cat: {category === "all" ? categories.join(", ") || "all" : category}</Text>
      <Box flexDirection="column" marginTop={1}>
        {visibleCommands.map((command, index) => {
          const selected = index === selectedIndex;

          return (
            <Text key={command.id} color={selected ? "black" : "white"} backgroundColor={selected ? "cyan" : undefined}>
              {selected ? ">" : " "} {trimText(command.title.padEnd(15), 15)} {trimText(command.category, 12)}
            </Text>
          );
        })}
        {commands.length === 0 ? <Text color="yellow">No commands match the current search.</Text> : null}
      </Box>
    </Box>
  );
}

function DetailPanel({
  command,
  focused,
  compact
}: {
  command?: CommandEntry;
  focused: boolean;
  compact: boolean;
}) {
  if (!command) {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="gray" flexGrow={1} paddingX={1}>
        <Text color="gray">Select a command to see details.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={focused ? "cyan" : "gray"} flexGrow={1} paddingX={1}>
      <Box justifyContent="space-between">
        <Text color="cyan" bold>
          {command.title}
        </Text>
        <Text color="gray">{command.category}</Text>
      </Box>
      <Text>{command.summary}</Text>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">Syntax</Text>
        {command.syntax.map((syntax) => (
          <Text key={syntax} color="green">
            $ {syntax}
          </Text>
        ))}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">Examples</Text>
        {command.examples.slice(0, compact ? 2 : 4).map((example) => (
          <Box key={example.command} flexDirection="column">
            <Text color="green">$ {example.command}</Text>
            <Text color="gray">  {example.explanation}</Text>
          </Box>
        ))}
      </Box>
      {command.notes ? (
        <Box marginTop={1} flexDirection="column">
          <Text color="yellow">Notes</Text>
          <Text>{command.notes}</Text>
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Text color="gray">tags: {command.tags.length > 0 ? command.tags.join(", ") : "none"}</Text>
      </Box>
    </Box>
  );
}

function FormPanel({
  mode,
  fieldIndex,
  draft,
  values,
  fallback
}: {
  mode: FormMode;
  fieldIndex: number;
  draft: string;
  values: FormValues;
  fallback?: CommandEntry;
}) {
  const field = formFields[fieldIndex];
  const currentValue = values[field.key];
  const fallbackValues = valuesFromCommand(fallback);
  const fallbackValue = fallback ? fallbackValues[field.key] : "";

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="yellow" flexGrow={1} paddingX={1}>
      <Text color="yellow" bold>
        {mode === "add" ? "Add command" : "Edit command"}
      </Text>
      <Text color="gray">
        Field {fieldIndex + 1}/{formFields.length}. Enter saves field, Esc cancels.
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text color="cyan">{field.label}</Text>
        {mode === "edit" && fallbackValue ? <Text color="gray">current: {fallbackValue}</Text> : null}
        <Text>
          {"> "}
          {draft || currentValue || ""}
          <Text color="gray">_</Text>
        </Text>
      </Box>
    </Box>
  );
}

function Footer({ status, focus }: { status: string; focus: FocusMode }) {
  const help =
    focus === "search"
      ? "type to filter | enter apply | esc cancel"
      : focus === "form"
        ? "enter next/save | backspace edit | esc cancel"
        : "/ search | up/down select | enter detail | a add | e edit | d delete | r reload | o open | q quit";

  return (
    <Box flexDirection="column">
      <Text color="gray">{help}</Text>
      {status ? <Text color="yellow">{status}</Text> : null}
    </Box>
  );
}

export function TerminalHelpApp({ configPath, compact = false }: TerminalHelpAppProps) {
  const { exit } = useApp();
  const [notes, setNotes] = useState<NotesDocument | null>(null);
  const [resolvedConfigPath, setResolvedConfigPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focus, setFocus] = useState<FocusMode>("list");
  const [status, setStatus] = useState("");
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [formValues, setFormValues] = useState<FormValues>(() => valuesFromCommand());
  const [formFallback, setFormFallback] = useState<CommandEntry | undefined>();

  const reload = async () => {
    try {
      const result = await loadNotes(configPath);
      setNotes(result.notes);
      setResolvedConfigPath(result.configPath);
      setError(null);
      setStatus(`Loaded ${result.notes.commands.length} commands.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  useEffect(() => {
    void reload();
  }, [configPath]);

  const categories = useMemo(() => getCategories(notes?.commands ?? []), [notes]);
  const filteredCommands = useMemo(
    () => filterCommands(notes?.commands ?? [], query, category),
    [category, notes, query]
  );
  const selectedCommand = filteredCommands[selectedIndex];

  useEffect(() => {
    setSelectedIndex((current) => clamp(current, 0, Math.max(0, filteredCommands.length - 1)));
  }, [filteredCommands.length]);

  const persistNotes = async (nextNotes: NotesDocument, nextStatus: string) => {
    try {
      const result = await saveNotes(nextNotes, configPath);
      setNotes(result.notes);
      setResolvedConfigPath(result.configPath);
      setStatus(nextStatus);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  const startForm = (mode: FormMode, command?: CommandEntry) => {
    setFormMode(mode);
    setFieldIndex(0);
    setDraft("");
    setFormValues(valuesFromCommand(mode === "edit" ? command : undefined));
    setFormFallback(command);
    setFocus("form");
    setStatus(mode === "add" ? "Adding a custom command." : `Editing ${command?.title ?? "command"}.`);
  };

  const submitFormField = async () => {
    if (!formMode || !notes) {
      return;
    }

    const field = formFields[fieldIndex];
    const nextValues = {
      ...formValues,
      [field.key]: draft.trim() || formValues[field.key]
    };

    setFormValues(nextValues);
    setDraft("");

    if (fieldIndex < formFields.length - 1) {
      setFieldIndex((current) => current + 1);
      return;
    }

    try {
      const command = commandFromValues(nextValues, formFallback);
      const nextNotes = upsertCommand(notes, command);
      await persistNotes(nextNotes, `${formMode === "add" ? "Added" : "Saved"} ${command.title}.`);
      setFormMode(null);
      setFocus("list");
      setQuery("");
      setSelectedIndex(Math.max(0, nextNotes.commands.findIndex((item) => item.id === command.id)));
    } catch (caughtError) {
      setError(caughtError instanceof ConfigError || caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  useInput((input, key) => {
    if (focus === "form") {
      if (key.escape) {
        setFormMode(null);
        setFocus("list");
        setDraft("");
        setStatus("Edit cancelled.");
        return;
      }

      if (key.return) {
        void submitFormField();
        return;
      }

      if (key.backspace || key.delete) {
        setDraft((current) => current.slice(0, -1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setDraft((current) => current + input);
      }

      return;
    }

    if (focus === "search") {
      if (key.escape || key.return) {
        setFocus("list");
        return;
      }

      if (key.backspace || key.delete) {
        setQuery((current) => current.slice(0, -1));
        setSelectedIndex(0);
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setQuery((current) => current + input);
        setSelectedIndex(0);
      }

      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    if (input === "/") {
      setFocus("search");
      setStatus("Search mode.");
      return;
    }

    if (input === "j" || key.downArrow) {
      setSelectedIndex((current) => clamp(current + 1, 0, Math.max(0, filteredCommands.length - 1)));
      return;
    }

    if (input === "k" || key.upArrow) {
      setSelectedIndex((current) => clamp(current - 1, 0, Math.max(0, filteredCommands.length - 1)));
      return;
    }

    if (key.return) {
      setFocus(focus === "detail" ? "list" : "detail");
      return;
    }

    if (input === "a") {
      startForm("add");
      return;
    }

    if (input === "e" && selectedCommand) {
      startForm("edit", selectedCommand);
      return;
    }

    if (input === "d" && selectedCommand && notes) {
      const nextNotes = deleteCommand(notes, selectedCommand.id);
      void persistNotes(nextNotes, `Deleted ${selectedCommand.title}. Use config reset to restore defaults.`);
      setSelectedIndex(0);
      return;
    }

    if (input === "r") {
      void reload();
      return;
    }

    if (input === "o" && resolvedConfigPath) {
      void openConfigFile(resolvedConfigPath)
        .then(() => setStatus(`Opened ${resolvedConfigPath}.`))
        .catch((caughtError) => setStatus(caughtError instanceof Error ? caughtError.message : String(caughtError)));
      return;
    }

    if (input === "c" && categories.length > 0) {
      const categoryOptions = ["all", ...categories];
      const index = categoryOptions.indexOf(category);
      setCategory(categoryOptions[(index + 1) % categoryOptions.length]);
      setSelectedIndex(0);
    }
  });

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">terminal-help config error</Text>
        <Text>{error}</Text>
        <Text color="gray">Run terminal-help config reset to restore the default notes file.</Text>
      </Box>
    );
  }

  if (!notes) {
    return <Text color="cyan">Loading terminal-help...</Text>;
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <CommandList
          commands={filteredCommands}
          selectedIndex={selectedIndex}
          query={query}
          category={category}
          categories={categories}
          focused={focus === "list" || focus === "search"}
          compact={compact}
        />
        {focus === "form" && formMode ? (
          <FormPanel
            mode={formMode}
            fieldIndex={fieldIndex}
            draft={draft}
            values={formValues}
            fallback={formFallback}
          />
        ) : (
          <DetailPanel command={selectedCommand} focused={focus === "detail"} compact={compact} />
        )}
      </Box>
      <Footer status={status} focus={focus} />
    </Box>
  );
}
