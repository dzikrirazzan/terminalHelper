import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import React from "react";
import { render } from "ink-testing-library";
import { describe, expect, it } from "vitest";
import { defaultNotes } from "../src/core/defaultNotes.js";
import { loadNotes } from "../src/core/store.js";
import { TerminalHelpApp } from "../src/tui/TerminalHelpApp.js";

async function tempConfigPath() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "terminal-help-tui-"));
  return path.join(dir, "notes.yaml");
}

async function waitForFrame(lastFrame: () => string | undefined, text: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const frame = lastFrame() || "";
    if (frame.includes(text)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Timed out waiting for frame containing ${text}. Last frame:\n${lastFrame()}`);
}

function renderTui(element: React.ReactElement) {
  const app = render(element);
  const stdin = app.stdin as unknown as {
    ref: () => void;
    unref: () => void;
    read: () => string | null;
    write: (data: string) => void;
    emit: (event: string) => void;
  };
  const queue: string[] = [];

  stdin.ref = () => undefined;
  stdin.unref = () => undefined;
  stdin.read = () => queue.shift() ?? null;
  stdin.write = (data: string) => {
    queue.push(data);
    stdin.emit("readable");
  };

  return app;
}

async function writeInput(app: ReturnType<typeof renderTui>, value: string) {
  for (const character of value) {
    app.stdin.write(character);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

async function pressEnter(app: ReturnType<typeof renderTui>) {
  app.stdin.write("\r");
  await new Promise((resolve) => setTimeout(resolve, 5));
}

describe("TerminalHelpApp", () => {
  it("renders command details and filters search", async () => {
    const configPath = await tempConfigPath();
    const app = renderTui(<TerminalHelpApp configPath={configPath} compact />);

    await waitForFrame(app.lastFrame, "Change the current working directory.");
    app.stdin.write("/");
    await waitForFrame(app.lastFrame, "type to filter");
    await writeInput(app, "npm");
    await waitForFrame(app.lastFrame, "npm install");

    app.unmount();
  });

  it("adds and deletes commands from the TUI", async () => {
    const configPath = await tempConfigPath();
    const app = renderTui(<TerminalHelpApp configPath={configPath} compact />);

    await waitForFrame(app.lastFrame, `Loaded ${defaultNotes.commands.length} commands.`);
    await writeInput(app, "a");
    await waitForFrame(app.lastFrame, "Add command");

    for (const value of ["custom-touch", "custom touch", "files", "Create an empty file.", "touch <file>", "touch notes.txt", "Create notes.txt.", "files, beginner", "Custom note"]) {
      await writeInput(app, value);
      await pressEnter(app);
    }

    await waitForFrame(app.lastFrame, "Added custom touch");
    let notes = await loadNotes(configPath);
    expect(notes.notes.commands.some((command) => command.id === "custom-touch")).toBe(true);

    app.stdin.write("d");
    await waitForFrame(app.lastFrame, "Deleted custom touch");
    notes = await loadNotes(configPath);
    expect(notes.notes.commands.some((command) => command.id === "custom-touch")).toBe(false);

    app.unmount();
  });
});
