import React, { useEffect, useMemo, useState } from "react";
import { deleteCommand, upsertCommand } from "../core/mutations.js";
import { filterCommands, getCategories } from "../core/search.js";
import type { CommandEntry, NotesDocument } from "../core/types.js";
import { commandFromValues, formFields, valuesFromCommand, type FormMode, type FormValues } from "../tui/form.js";
import { getTerminalHelpApi } from "./api.js";

type FormState = {
  mode: FormMode;
  values: FormValues;
  fallback?: CommandEntry;
};

function emptyNotes(): NotesDocument {
  return {
    version: 1,
    commands: [],
  };
}

function createNextValues(values: FormValues, key: keyof FormValues, value: string): FormValues {
  return {
    ...values,
    [key]: value,
  };
}

export function App() {
  const api = useMemo(() => getTerminalHelpApi(), []);
  const [notes, setNotes] = useState<NotesDocument>(emptyNotes());
  const [configPath, setConfigPath] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [status, setStatus] = useState("Loading notes...");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await api.loadNotes();
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setSelectedId((current) => current || result.notes.commands[0]?.id || "");
      setStatus(`Loaded ${result.notes.commands.length} commands`);
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      setStatus("Could not load notes");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(() => getCategories(notes.commands), [notes.commands]);
  const filteredCommands = useMemo(() => filterCommands(notes.commands, query, category), [category, notes.commands, query]);
  const selectedCommand = filteredCommands.find((command) => command.id === selectedId) ?? filteredCommands[0] ?? notes.commands[0];

  useEffect(() => {
    if (filteredCommands.length > 0 && !filteredCommands.some((command) => command.id === selectedId)) {
      setSelectedId(filteredCommands[0].id);
    }
  }, [filteredCommands, selectedId]);

  const persist = async (nextNotes: NotesDocument, nextStatus: string) => {
    try {
      const result = await api.saveNotes(nextNotes);
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setStatus(nextStatus);
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  const startAdd = () => {
    setForm({
      mode: "add",
      values: valuesFromCommand(),
    });
  };

  const startEdit = (command: CommandEntry) => {
    setForm({
      mode: "edit",
      values: valuesFromCommand(command),
      fallback: command,
    });
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) {
      return;
    }

    const command = commandFromValues(form.values, form.fallback);
    const nextNotes = upsertCommand(notes, command);
    await persist(nextNotes, `${form.mode === "add" ? "Added" : "Saved"} ${command.title}`);
    setSelectedId(command.id);
    setForm(null);
  };

  const removeSelected = async () => {
    if (!selectedCommand) {
      return;
    }

    const nextNotes = deleteCommand(notes, selectedCommand.id);
    await persist(nextNotes, `Deleted ${selectedCommand.title}`);
    setSelectedId(nextNotes.commands[0]?.id || "");
  };

  const reset = async () => {
    try {
      const result = await api.resetNotes();
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setSelectedId(result.notes.commands[0]?.id || "");
      setStatus("Reset default notes");
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  const copyCommand = async (command: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = command;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();
        if (!copied) {
          throw new Error("Clipboard unavailable");
        }
      }

      setError("");
      setStatus(`Copied ${command}`);
    } catch {
      setError("Could not copy this command. Select it manually instead.");
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')?.focus();
      }

      if (event.key === "Escape" && document.activeElement?.tagName === "INPUT") {
        setQuery("");
        (document.activeElement as HTMLInputElement).blur();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-line">
            <span className="brand-mark">&gt;_</span>
            <h1>terminal-help</h1>
          </div>
          <p className="subtitle">Your pocket reference for the command line.</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="button-primary" onClick={startAdd}>
            + Add note
          </button>
          <button type="button" onClick={() => selectedCommand && startEdit(selectedCommand)} disabled={!selectedCommand}>
            Edit
          </button>
          <button type="button" onClick={removeSelected} disabled={!selectedCommand}>
            Delete
          </button>
        </div>
      </header>

      <section className="toolbar" aria-label="Command filters">
        <label>
          <span>
            Find a command <kbd>/</kbd>
          </span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="cd, git, npm..." aria-label="Search commands" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
            <option value="all">All</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={load}>
          Reload
        </button>
        <button
          type="button"
          onClick={() =>
            void api
              .openConfig()
              .then((path) => {
                setError("");
                setStatus(`Opened ${path}`);
              })
              .catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : String(caughtError)))
          }
        >
          Customize YAML
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </section>

      {error ? <div className="error">{error}</div> : null}

      <section className="collection-strip" aria-label="Collection summary">
        <div>
          <strong>{notes.commands.length}</strong>
          <span>commands ready</span>
        </div>
        <div>
          <strong>{categories.length}</strong>
          <span>topics</span>
        </div>
        <div className="collection-tip">
          <span className="tip-label">START HERE</span>
          <span>Click a note to see how it works.</span>
        </div>
      </section>

      <section className="workspace">
        <nav className="command-list" aria-label="Commands">
          {filteredCommands.map((command) => (
            <button key={command.id} type="button" className={command.id === selectedCommand?.id ? "command-row active" : "command-row"} onClick={() => setSelectedId(command.id)}>
              <span className="command-title">{command.title}</span>
              <span className="command-category">{command.category}</span>
            </button>
          ))}
          {filteredCommands.length === 0 ? <div className="empty-state">No commands match this search.</div> : null}
        </nav>

        <article className="detail-pane">
          {selectedCommand ? (
            <>
              <div className="detail-head">
                <div>
                  <h2>{selectedCommand.title}</h2>
                  <p>{selectedCommand.summary}</p>
                </div>
                <div className="detail-meta">
                  <span>{selectedCommand.category}</span>
                  <span>{selectedCommand.tags[0] ?? "note"}</span>
                </div>
              </div>

              <section>
                <h3>Syntax</h3>
                <div className="code-list">
                  {selectedCommand.syntax.map((syntax) => (
                    <div className="code-row" key={syntax}>
                      <code>$ {syntax}</code>
                      <button type="button" className="copy-button" onClick={() => void copyCommand(syntax)} aria-label={`Copy ${syntax}`}>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3>Examples</h3>
                <div className="example-list">
                  {selectedCommand.examples.map((example) => (
                    <div key={example.command} className="example-row">
                      <div className="code-row">
                        <code>$ {example.command}</code>
                        <button type="button" className="copy-button" onClick={() => void copyCommand(example.command)} aria-label={`Copy ${example.command}`}>
                          Copy
                        </button>
                      </div>
                      <p>{example.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>

              {selectedCommand.notes ? (
                <section>
                  <h3>Notes</h3>
                  <p>{selectedCommand.notes}</p>
                </section>
              ) : null}

              <div className="tag-row">
                {selectedCommand.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">Select a command.</div>
          )}
        </article>
      </section>

      <footer className="statusbar">{status}</footer>

      {form ? (
        <div className="modal-backdrop" role="presentation">
          <form className="edit-modal" onSubmit={submitForm}>
            <div className="modal-head">
              <h2>{form.mode === "add" ? "Add command" : "Edit command"}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Close editor">
                Close
              </button>
            </div>
            <div className="form-grid">
              {formFields.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  {field.key === "summary" || field.key === "notes" ? (
                    <textarea
                      value={form.values[field.key]}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? {
                                ...current,
                                values: createNextValues(current.values, field.key, event.target.value),
                              }
                            : current,
                        )
                      }
                    />
                  ) : (
                    <input
                      value={form.values[field.key]}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? {
                                ...current,
                                values: createNextValues(current.values, field.key, event.target.value),
                              }
                            : current,
                        )
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
