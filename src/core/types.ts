export type CommandExample = {
  command: string;
  explanation: string;
};

export type CommandEntry = {
  id: string;
  title: string;
  category: string;
  summary: string;
  syntax: string[];
  examples: CommandExample[];
  tags: string[];
  notes?: string;
};

export type NotesDocument = {
  version: 1 | 2;
  commands: CommandEntry[];
};

export type NotesStoreResult = {
  configPath: string;
  notes: NotesDocument;
};

export type DoctorReport = {
  node: string;
  platform: string;
  configPath: string;
  configExists: boolean;
  configValid: boolean;
  tmuxAvailable: boolean;
  ghosttyAvailable: boolean;
  editor: string | null;
  error?: string;
};
