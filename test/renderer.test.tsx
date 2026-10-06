// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultNotes } from "../src/core/defaultNotes.js";
import type { NotesDocument } from "../src/core/types.js";
import { App } from "../src/renderer/App.js";

function cloneNotes(notes: NotesDocument): NotesDocument {
  return JSON.parse(JSON.stringify(notes)) as NotesDocument;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "terminalHelp");
});

describe("renderer app", () => {
  it("shows command details and filters the command list", async () => {
    const notes = cloneNotes(defaultNotes);
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes: vi.fn(),
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    expect(await screen.findByText("Change the current working directory.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search commands"), { target: { value: "npm" } });

    expect(screen.getByRole("button", { name: /npm install/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /git status/i })).toBeNull();
  });

  it("persists edits through the Electron bridge", async () => {
    const notes = cloneNotes(defaultNotes);
    const saveNotes = vi.fn(async (nextNotes: NotesDocument) => ({ configPath: "/tmp/notes.yaml", notes: nextNotes }));
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes,
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    await screen.findByText("Change the current working directory.");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByDisplayValue("Change the current working directory."), {
      target: { value: "Move to another folder." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveNotes).toHaveBeenCalled());
    const saved = saveNotes.mock.calls[0]?.[0] as NotesDocument;
    expect(saved.commands.find((command) => command.id === "cd")?.summary).toBe("Move to another folder.");
  });

  it("keeps the editor open when saving fails", async () => {
    const notes = cloneNotes(defaultNotes);
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes: vi.fn(async () => {
          throw new Error("Disk is full");
        }),
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    await screen.findByText("Change the current working directory.");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("dialog", { name: "Edit command" })).toBeTruthy();
    expect(screen.getByText("Disk is full")).toBeTruthy();
  });

  it("copies a syntax command and reports the action", async () => {
    const notes = cloneNotes(defaultNotes);
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes: vi.fn(),
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    await screen.findByText("Change the current working directory.");
    fireEvent.click(screen.getByRole("button", { name: "Copy cd <path>" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("cd <path>"));
    expect(screen.getByText("Copied cd <path>")).toBeTruthy();
  });

  it("supports keyboard navigation and closes the editor with Escape", async () => {
    const notes = cloneNotes(defaultNotes);
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes: vi.fn(),
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    await screen.findByText("Change the current working directory.");
    expect(screen.getByRole("heading", { name: "cd" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByRole("heading", { name: "ls" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("dialog", { name: "Edit command" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Edit command" })).toBeNull();
  });

  it("explains duplicate ids before saving a new note", async () => {
    const notes = cloneNotes(defaultNotes);
    const saveNotes = vi.fn();
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes,
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);

    await screen.findByText("Change the current working directory.");
    fireEvent.click(screen.getByRole("button", { name: "+ Add note" }));
    fireEvent.change(screen.getByLabelText("id"), { target: { value: "cd" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toContain("already exists");
    expect(saveNotes).not.toHaveBeenCalled();
  });

  it("persists favorites and can filter to them", async () => {
    const notes = cloneNotes(defaultNotes);
    Object.defineProperty(window, "terminalHelp", {
      configurable: true,
      value: {
        loadNotes: vi.fn(async () => ({ configPath: "/tmp/notes.yaml", notes })),
        saveNotes: vi.fn(),
        resetNotes: vi.fn(),
        openConfig: vi.fn(),
      },
    });

    render(<App />);
    await screen.findByText("Change the current working directory.");
    fireEvent.click(screen.getByRole("button", { name: "☆ Favorite" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Show favorites only" }));

    expect(screen.getByRole("button", { name: "cd navigation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /git status/i })).toBeNull();
    expect(screen.getByRole("button", { name: "★ Favorite" })).toBeTruthy();
  });
});
