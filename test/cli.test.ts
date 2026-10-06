import path from "node:path";
import os from "node:os";
import { describe, expect, it, vi } from "vitest";
import { createProgram } from "../src/cli/program.js";

describe("CLI", () => {
  it("prints help", async () => {
    let output = "";
    const program = createProgram();
    program.exitOverride();
    program.configureOutput({
      writeOut: (value) => {
        output += value;
      },
      writeErr: (value) => {
        output += value;
      }
    });

    await expect(program.parseAsync(["node", "terminal-help", "--help"], { from: "node" })).rejects.toMatchObject({
      code: "commander.helpDisplayed"
    });
    expect(output).toContain("terminal-help");
    expect(output).toContain("window");
    expect(output).toContain("split");
  });

  it("prints a resolved config path", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const configPath = path.join(process.cwd(), "tmp-notes.yaml");

    await createProgram().parseAsync(["node", "terminal-help", "config", "path", "--config", configPath], {
      from: "node"
    });

    expect(log).toHaveBeenCalledWith(path.resolve(configPath));
    log.mockRestore();
  });

  it("validates a notes file", async () => {
    let output = "";
    const log = vi.spyOn(console, "log").mockImplementation((value) => {
      output += String(value);
    });
    const configPath = path.join(os.tmpdir(), "terminal-help-cli-validate-notes.yaml");

    await createProgram().parseAsync(["node", "terminal-help", "config", "validate", "--config", configPath], { from: "node" });

    expect(output).toContain("Valid");
    log.mockRestore();
  });
});
