import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveConfigPath } from "../src/core/config.js";
import { hasCommand } from "../src/core/doctor.js";
import { defaultNotes } from "../src/core/defaultNotes.js";
import { filterCommands, getSearchScore } from "../src/core/search.js";
import { deleteCommand, loadNotes, resetNotes, saveNotes, upsertCommand } from "../src/core/store.js";
import { ConfigError } from "../src/core/validation.js";

async function tempConfigPath() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "terminal-help-"));
  return path.join(dir, "notes.yaml");
}

describe("notes store", () => {
  it("preserves version 2 documents when loading them", async () => {
    const configPath = await tempConfigPath();
    await saveNotes({ version: 2, commands: defaultNotes.commands }, configPath);

    const loaded = await loadNotes(configPath);

    expect(loaded.notes.version).toBe(2);
  });

  it("seeds a missing config file with beginner commands", async () => {
    const configPath = await tempConfigPath();
    const result = await loadNotes(configPath);

    expect(result.configPath).toBe(configPath);
    expect(result.notes.commands.map((command) => command.title)).toContain("cd");
    expect(result.notes.commands.map((command) => command.title)).toContain("npm install");
  });

  it("validates invalid YAML shape", async () => {
    const configPath = await tempConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, "version: 3\ncommands: []\n", "utf8");

    await expect(loadNotes(configPath)).rejects.toBeInstanceOf(ConfigError);
  });

  it("supports search and CRUD updates", async () => {
    const configPath = await tempConfigPath();
    const initial = await loadNotes(configPath);
    const custom = upsertCommand(initial.notes, {
      id: "custom-touch",
      title: "custom touch",
      category: "files",
      summary: "Create an empty file or update a timestamp.",
      syntax: ["touch <file>"],
      examples: [
        {
          command: "touch notes.txt",
          explanation: "Create notes.txt if it does not exist.",
        },
      ],
      tags: ["files", "create"],
    });

    await saveNotes(custom, configPath);
    const saved = await loadNotes(configPath);
    expect(filterCommands(saved.notes.commands, "timestamp").find((command) => command.id === "custom-touch")?.id).toBe("custom-touch");

    const deleted = deleteCommand(saved.notes, "custom-touch");
    await saveNotes(deleted, configPath);
    const afterDelete = await loadNotes(configPath);
    expect(afterDelete.notes.commands.some((command) => command.id === "custom-touch")).toBe(false);
  });

  it("resets a config file back to defaults", async () => {
    const configPath = await tempConfigPath();
    await saveNotes({ version: 1, commands: [defaultNotes.commands[0]] }, configPath);

    const reset = await resetNotes(configPath);

    expect(reset.notes.commands.length).toBe(defaultNotes.commands.length);
    expect(await fs.readFile(`${configPath}.backup`, "utf8")).toContain("version: 1");
  });

  it("keeps custom notes and adds new built-in commands", async () => {
    const configPath = await tempConfigPath();
    const customNotes = {
      version: 1 as const,
      commands: [
        {
          id: "my-note",
          title: "my note",
          category: "custom",
          summary: "A personal note.",
          syntax: ["my-command"],
          examples: [{ command: "my-command", explanation: "Run my command." }],
          tags: ["custom"],
        },
      ],
    };

    await saveNotes(customNotes, configPath);
    const loaded = await loadNotes(configPath);

    expect(loaded.notes.commands.some((command) => command.id === "my-note")).toBe(true);
    expect(loaded.notes.commands.some((command) => command.id === "git-clone")).toBe(true);
  });
});

describe("config paths", () => {
  it("expands custom config paths", () => {
    expect(resolveConfigPath("~/terminal-help-test.yaml")).toContain(path.join(os.homedir(), "terminal-help-test.yaml"));
  });
});

describe("doctor checks", () => {
  it("finds executables available on the current path", () => {
    expect(hasCommand("node")).toBe(true);
  });
});

describe("config normalization", () => {
  it("trims whitespace around validated strings", async () => {
    const configPath = await tempConfigPath();
    const notes = await saveNotes({
      version: 2,
      commands: [{
        id: "  custom  ",
        title: "  custom command  ",
        category: "  tools  ",
        summary: "  A useful note.  ",
        syntax: ["  custom  "],
        examples: [{ command: "  custom  ", explanation: "  Run it.  " }],
        tags: ["  tool  "],
      }],
    }, configPath);

    expect(notes.notes.commands[0]).toMatchObject({ id: "custom", title: "custom command", category: "tools", summary: "A useful note." });
    expect(notes.notes.commands[0].tags).toEqual(["tool"]);
  });
});

describe("command search", () => {
  it("matches every term in a multi-word query", () => {
    const matches = filterCommands(defaultNotes.commands, "working directory");

    expect(matches.some((command) => command.id === "cd")).toBe(true);
    expect(filterCommands(defaultNotes.commands, "working missing")).toHaveLength(0);
  });

  it("scores exact and title matches above broad content matches", () => {
    const exact = defaultNotes.commands.find((command) => command.id === "git-status");
    const broad = defaultNotes.commands.find((command) => command.id === "git-clone");

    expect(exact).toBeDefined();
    expect(broad).toBeDefined();
    expect(getSearchScore(exact!, "git status")).toBeGreaterThan(getSearchScore(broad!, "git"));
  });
});
