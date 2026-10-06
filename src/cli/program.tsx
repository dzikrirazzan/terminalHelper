import React from "react";
import { Command } from "commander";
import { render } from "ink";
import { getDoctorReport } from "../core/doctor.js";
import { resolveConfigPath } from "../core/config.js";
import { ensureNotesFile, loadNotes, resetNotes } from "../core/store.js";
import { openConfigFile } from "../core/openFile.js";
import { TerminalHelpApp } from "../tui/TerminalHelpApp.js";
import { launchSplit } from "./split.js";
import { launchWindow } from "./window.js";

type RunTuiOptions = {
  config?: string;
  compact?: boolean;
};

function readConfigOption(options: RunTuiOptions, command?: Command): string | undefined {
  return options.config ?? (command?.optsWithGlobals().config as string | undefined);
}

async function runTui(options: RunTuiOptions = {}) {
  const instance = render(<TerminalHelpApp configPath={options.config} compact={Boolean(options.compact)} />);
  await instance.waitUntilExit();
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name("terminal-help")
    .description("Customizable terminal command notes for beginners and daily terminal work.")
    .version("0.1.0")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions) => {
      await launchWindow(options.config);
    });

  program
    .command("tui")
    .description("Open the interactive terminal UI.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .option("--compact", "Use a narrower layout for split panes.")
    .action(async (options: RunTuiOptions, command: Command) => {
      await runTui({ ...options, config: readConfigOption(options, command) });
    });

  program
    .command("window")
    .description("Open the desktop side-window UI.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      await launchWindow(readConfigOption(options, command));
    });

  program
    .command("split")
    .description("Open terminal-help in a best-effort right-side terminal split.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      const result = await launchSplit(readConfigOption(options, command));

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
      }
    });

  const configCommand = program.command("config").description("Manage the notes YAML file.");

  configCommand
    .command("path")
    .description("Print the notes YAML path.")
    .option("--config <path>", "Resolve this notes YAML path instead of the default.")
    .action((options: RunTuiOptions, command: Command) => {
      console.log(resolveConfigPath(readConfigOption(options, command)));
    });

  configCommand
    .command("open")
    .description("Open the notes YAML file in $EDITOR or the OS default app.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      const configPath = await ensureNotesFile(readConfigOption(options, command));
      await openConfigFile(configPath);
      console.log(`Opened ${configPath}`);
    });

  configCommand
    .command("reset")
    .description("Reset the notes YAML file to the default beginner commands.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      const result = await resetNotes(readConfigOption(options, command));
      console.log(`Reset ${result.configPath}`);
    });

  configCommand
    .command("validate")
    .description("Validate the notes YAML file and report its command count.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      try {
        const result = await loadNotes(readConfigOption(options, command));
        console.log(`Valid ${result.configPath} (${result.notes.commands.length} commands)`);
      } catch (caughtError) {
        console.error(caughtError instanceof Error ? caughtError.message : String(caughtError));
        process.exitCode = 1;
      }
    });

  program
    .command("doctor")
    .description("Check terminal-help configuration and integration support.")
    .option("--config <path>", "Use a custom notes YAML file.")
    .action(async (options: RunTuiOptions, command: Command) => {
      const report = await getDoctorReport(readConfigOption(options, command));
      console.log(`node: ${report.node}`);
      console.log(`platform: ${report.platform}`);
      console.log(`config: ${report.configPath}`);
      console.log(`config exists: ${report.configExists ? "yes" : "no"}`);
      console.log(`config valid: ${report.configValid ? "yes" : "no"}`);
      console.log(`tmux: ${report.tmuxAvailable ? "available" : "missing"}`);
      console.log(`ghostty: ${report.ghosttyAvailable ? "available" : "missing"}`);
      console.log(`editor: ${report.editor || "not set"}`);

      if (report.error) {
        console.log(`error: ${report.error}`);
        process.exitCode = 1;
      }
    });

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  await createProgram().parseAsync(argv);
}
