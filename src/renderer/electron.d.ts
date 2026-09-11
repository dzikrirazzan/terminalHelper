import type { TerminalHelpApi } from "../electron/preload.js";

declare global {
  interface Window {
    terminalHelp?: TerminalHelpApi;
  }
}

export {};
