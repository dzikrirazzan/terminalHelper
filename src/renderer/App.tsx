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

type SortMode = "relevance" | "title" | "category";

const FAVORITES_KEY = "terminal-help.favorite-commands";

function readFavorites(): Set<string> {
  try {
    const stored = JSON.parse(typeof window.localStorage?.getItem === "function" ? window.localStorage.getItem(FAVORITES_KEY) || "[]" : "[]");
    return new Set(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
}

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
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites());
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("Loading notes...");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState("");

  const load = async () => {
    setIsBusy(true);
    try {
      const result = await api.loadNotes();
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setSelectedId((current) => current || result.notes.commands[0]?.id || "");
      setStatus(`Loaded ${result.notes.commands.length} commands`);
      setError("");
      setIsLoaded(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      setStatus("Could not load notes");
      setIsLoaded(true);
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(() => getCategories(notes.commands), [notes.commands]);
  const filteredCommands = useMemo(() => {
    const matches = filterCommands(notes.commands, query, category).filter((command) => !favoritesOnly || favorites.has(command.id));
    return [...matches].sort((left, right) => {
      if (sortMode === "title") return left.title.localeCompare(right.title);
      if (sortMode === "category") return `${left.category}-${left.title}`.localeCompare(`${right.category}-${right.title}`);
      return Number(favorites.has(right.id)) - Number(favorites.has(left.id));
    });
  }, [category, favorites, favoritesOnly, notes.commands, query, sortMode]);
  const selectedCommand = filteredCommands.find((command) => command.id === selectedId) ?? filteredCommands[0];

  useEffect(() => {
    if (filteredCommands.length > 0 && !filteredCommands.some((command) => command.id === selectedId)) {
      setSelectedId(filteredCommands[0].id);
    }
  }, [filteredCommands, selectedId]);

  const persist = async (nextNotes: NotesDocument, nextStatus: string): Promise<boolean> => {
    setIsBusy(true);
    try {
      const result = await api.saveNotes(nextNotes);
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setStatus(nextStatus);
      setError("");
      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const startAdd = () => {
    setFormError("");
    setForm({
      mode: "add",
      values: valuesFromCommand(),
    });
  };

  const startEdit = (command: CommandEntry) => {
    setFormError("");
    setForm({
      mode: "edit",
      values: valuesFromCommand(command),
      fallback: command,
    });
  };

  const toggleFavorite = (commandId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(commandId)) next.delete(commandId);
      else next.add(commandId);
      try {
        window.localStorage?.setItem?.(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // Preview and privacy-restricted browsers can disable local storage.
      }
      return next;
    });
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) {
      return;
    }

    const command = commandFromValues(form.values, form.fallback);
    if (form.mode === "add" && notes.commands.some((item) => item.id === command.id)) {
      setFormError(`A note with the id “${command.id}” already exists. Choose a different id.`);
      return;
    }

    try {
      const nextNotes = upsertCommand(notes, command);
      const saved = await persist(nextNotes, `${form.mode === "add" ? "Added" : "Saved"} ${command.title}`);
      if (!saved) {
        return;
      }

      setSelectedId(command.id);
      setForm(null);
      setFormError("");
    } catch (caughtError) {
      setFormError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    }
  };

  const removeSelected = async () => {
    if (!selectedCommand) {
      return;
    }

    const nextNotes = deleteCommand(notes, selectedCommand.id);
    const deleted = await persist(nextNotes, `Deleted ${selectedCommand.title}`);
    if (!deleted) {
      return;
    }

    setSelectedId(nextNotes.commands[0]?.id || "");
  };

  const reset = async () => {
    if (!window.confirm("Reset all notes to the built-in beginner commands?")) {
      return;
    }

    setIsBusy(true);
    try {
      const result = await api.resetNotes();
      setNotes(result.notes);
      setConfigPath(result.configPath);
      setSelectedId(result.notes.commands[0]?.id || "");
      setStatus("Reset default notes");
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    } finally {
      setIsBusy(false);
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
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand((current) => current === command ? "" : current), 1400);
    } catch {
      setError("Could not copy this command. Select it manually instead.");
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

      if (event.key === "Escape" && form) {
        event.preventDefault();
        setForm(null);
        return;
      }

      if (form) {
        return;
      }

      if (event.key.toLowerCase() === "f" && !isTyping && selectedCommand) {
        event.preventDefault();
        toggleFavorite(selectedCommand.id);
        return;
      }

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')?.focus();
      }

      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')?.focus();
      }

      if (event.key === "Escape" && isTyping) {
        setQuery("");
        (document.activeElement as HTMLInputElement).blur();
        return;
      }

      if (!isTyping && filteredCommands.length > 0 && ["ArrowDown", "ArrowUp", "j", "k"].includes(event.key)) {
        event.preventDefault();
        const currentIndex = Math.max(0, filteredCommands.findIndex((command) => command.id === selectedId));
        const direction = event.key === "ArrowUp" || event.key === "k" ? -1 : 1;
        const nextIndex = (currentIndex + direction + filteredCommands.length) % filteredCommands.length;
        setSelectedId(filteredCommands[nextIndex].id);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [filteredCommands, form, selectedCommand, selectedId]);

  return (
    <main className="app-shell" aria-busy={isBusy}>
      <header className="topbar">
        <div>
          <div className="brand-line">
            <span className="brand-mark">&gt;_</span>
            <h1>terminal-help</h1>
          </div>
          <p className="subtitle">Your pocket reference for the command line.</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="button-primary" onClick={startAdd} disabled={isBusy} aria-keyshortcuts="a">
            + Add note
          </button>
          <button type="button" onClick={() => selectedCommand && startEdit(selectedCommand)} disabled={!selectedCommand || isBusy}>
            Edit
          </button>
          <button type="button" onClick={() => void removeSelected()} disabled={!selectedCommand || isBusy}>
            Delete
          </button>
        </div>
      </header>

      <div className="controls-stack">
        <section className="toolbar" aria-label="Command filters">
          <label>
            <span>
              Find a command <kbd>/</kbd>
            </span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="cd, git, npm..." aria-label="Search commands" autoComplete="off" />
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
          <label>
            <span>Sort</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Sort commands">
              <option value="relevance">Favorites first</option>
              <option value="title">Title A–Z</option>
              <option value="category">Category</option>
            </select>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} aria-label="Show favorites only" />
            <span>Favorites only</span>
          </label>
          <button type="button" onClick={() => void load()} disabled={isBusy} aria-keyshortcuts="r">
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
          <button type="button" onClick={() => void reset()} disabled={isBusy}>
            Reset
          </button>
        </section>

        {error ? (
          <div className="error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void load()} disabled={isBusy}>
              Try again
            </button>
          </div>
        ) : null}

        <section className="collection-strip" aria-label="Collection summary">
          <div>
            <strong>{notes.commands.length}</strong>
            <span>commands ready</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>topics</span>
          </div>
          <div className="collection-path" title={configPath}>
            <span>saved in</span>
            <code>{configPath || "your notes file"}</code>
          </div>
          <div className="collection-tip">
            <span className="tip-label">START HERE</span>
            <span>Click a note to see how it works.</span>
          </div>
        </section>
      </div>

      {!isLoaded && !error ? <div className="loading-state" role="status">Loading your command shelf…</div> : null}

      <section className="workspace" aria-label="Command workspace">
        <nav className="command-list" aria-label="Commands">
          {isLoaded ? filteredCommands.map((command) => (
            <button
              key={command.id}
              type="button"
              className={command.id === selectedCommand?.id ? "command-row active" : "command-row"}
              aria-current={command.id === selectedCommand?.id ? "true" : undefined}
              onClick={() => setSelectedId(command.id)}
            >
              <span className="command-title">{command.title}</span>
              <span className="command-category">{command.category}</span>
            </button>
          )) : null}
          {isLoaded && filteredCommands.length === 0 ? (
            <div className="empty-state" role="status">
              {notes.commands.length === 0 ? (
                <>
                  <strong>Your command shelf is empty</strong>
                  <p>Add your first note, or restore the built-in starter set.</p>
                  <div className="empty-actions">
                    <button type="button" className="button-primary" onClick={startAdd} disabled={isBusy}>
                      Add your first note
                    </button>
                    <button type="button" onClick={() => void reset()} disabled={isBusy}>
                      Restore starters
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>No commands found</strong>
                  <p>Try a different word or clear the filters.</p>
                  <button type="button" onClick={() => { setQuery(""); setCategory("all"); setFavoritesOnly(false); }}>
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : null}
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
                  <button type="button" className="favorite-button" onClick={() => toggleFavorite(selectedCommand.id)} aria-pressed={favorites.has(selectedCommand.id)}>
                    {favorites.has(selectedCommand.id) ? "★ Favorite" : "☆ Favorite"}
                  </button>
                </div>
              </div>

              <section>
                <h3>Syntax</h3>
                <div className="code-list">
                  {selectedCommand.syntax.map((syntax) => (
                    <div className="code-row" key={syntax}>
                      <code>$ {syntax}</code>
                        <button type="button" className="copy-button" onClick={() => void copyCommand(syntax)} aria-label={`Copy ${syntax}`}>
                          {copiedCommand === syntax ? "Copied" : "Copy"}
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
                          {copiedCommand === example.command ? "Copied" : "Copy"}
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
            <div className="detail-empty">
              <span className="detail-empty-mark">&gt;_</span>
              <h2>Build your command shelf</h2>
              <p>Keep the commands you reach for most in one calm, searchable place.</p>
              <button type="button" className="button-primary" onClick={startAdd} disabled={isBusy}>
                Add a command
              </button>
            </div>
          )}
        </article>
      </section>

      <footer className="statusbar" aria-live="polite">{status}</footer>

      {form ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setForm(null)}>
          <form className="edit-modal" onSubmit={submitForm} role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="modal-head">
              <h2 id="editor-title">{form.mode === "add" ? "Add command" : "Edit command"}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Close editor">
                Close
              </button>
            </div>
            {formError ? <div className="form-error" role="alert">{formError}</div> : null}
            <div className="form-grid">
              {formFields.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  {field.key === "summary" || field.key === "notes" ? (
                    <textarea
                      value={form.values[field.key]}
                      autoFocus={field.key === "summary"}
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
                      autoFocus={field.key === (form.mode === "add" ? "id" : "title")}
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
              <button type="submit" disabled={isBusy}>{isBusy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
