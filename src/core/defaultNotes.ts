import type { NotesDocument } from "./types.js";

export const defaultNotes: NotesDocument = {
  version: 1,
  commands: [
    {
      id: "cd",
      title: "cd",
      category: "navigation",
      summary: "Change the current working directory.",
      syntax: ["cd <path>", "cd ..", "cd ~", "cd -"],
      examples: [
        {
          command: "cd ~/Projects",
          explanation: "Go to the Projects folder inside your home directory."
        },
        {
          command: "cd ..",
          explanation: "Move one directory up from the current location."
        }
      ],
      tags: ["filesystem", "beginner"],
      notes: "Use pwd first when you are not sure where you currently are."
    },
    {
      id: "ls",
      title: "ls",
      category: "navigation",
      summary: "List files and folders in a directory.",
      syntax: ["ls", "ls -la", "ls <path>"],
      examples: [
        {
          command: "ls -la",
          explanation: "Show hidden files, permissions, owners, sizes, and dates."
        }
      ],
      tags: ["filesystem", "beginner"]
    },
    {
      id: "pwd",
      title: "pwd",
      category: "navigation",
      summary: "Print the full path of the current directory.",
      syntax: ["pwd"],
      examples: [
        {
          command: "pwd",
          explanation: "Check where the terminal is currently pointed."
        }
      ],
      tags: ["filesystem", "beginner"]
    },
    {
      id: "mkdir",
      title: "mkdir",
      category: "filesystem",
      summary: "Create one or more directories.",
      syntax: ["mkdir <name>", "mkdir -p <nested/path>"],
      examples: [
        {
          command: "mkdir -p app/src/components",
          explanation: "Create nested folders without failing if parent folders are missing."
        }
      ],
      tags: ["filesystem", "create"]
    },
    {
      id: "rm",
      title: "rm",
      category: "filesystem",
      summary: "Remove files or directories.",
      syntax: ["rm <file>", "rm -r <directory>", "rm -i <file>"],
      examples: [
        {
          command: "rm -i notes.txt",
          explanation: "Ask for confirmation before deleting the file."
        }
      ],
      tags: ["filesystem", "danger"],
      notes: "Be careful with rm -rf. It permanently deletes files without moving them to trash."
    },
    {
      id: "cp",
      title: "cp",
      category: "filesystem",
      summary: "Copy files or directories.",
      syntax: ["cp <source> <destination>", "cp -R <directory> <destination>"],
      examples: [
        {
          command: "cp README.md README.backup.md",
          explanation: "Create a backup copy of README.md."
        }
      ],
      tags: ["filesystem", "copy"]
    },
    {
      id: "mv",
      title: "mv",
      category: "filesystem",
      summary: "Move or rename files and directories.",
      syntax: ["mv <source> <destination>"],
      examples: [
        {
          command: "mv old-name.txt new-name.txt",
          explanation: "Rename a file in the current folder."
        }
      ],
      tags: ["filesystem", "move"]
    },
    {
      id: "cat",
      title: "cat",
      category: "files",
      summary: "Print a file to the terminal.",
      syntax: ["cat <file>"],
      examples: [
        {
          command: "cat package.json",
          explanation: "Show package.json contents in the terminal."
        }
      ],
      tags: ["files", "read"]
    },
    {
      id: "grep",
      title: "grep",
      category: "search",
      summary: "Search text using a pattern.",
      syntax: ["grep <pattern> <file>", "grep -R <pattern> <directory>"],
      examples: [
        {
          command: "grep -R \"TODO\" src",
          explanation: "Search for TODO in every file under src."
        }
      ],
      tags: ["search", "text"]
    },
    {
      id: "find",
      title: "find",
      category: "search",
      summary: "Find files and directories by name or other conditions.",
      syntax: ["find <path> -name <pattern>", "find . -type f -name \"*.ts\""],
      examples: [
        {
          command: "find . -name \"*.json\"",
          explanation: "Find JSON files under the current directory."
        }
      ],
      tags: ["search", "filesystem"]
    },
    {
      id: "clear",
      title: "clear",
      category: "terminal",
      summary: "Clear visible terminal output.",
      syntax: ["clear"],
      examples: [
        {
          command: "clear",
          explanation: "Clean the terminal screen without changing the current directory."
        }
      ],
      tags: ["terminal", "beginner"]
    },
    {
      id: "history",
      title: "history",
      category: "terminal",
      summary: "Show recently used commands.",
      syntax: ["history", "history | grep <term>"],
      examples: [
        {
          command: "history | grep npm",
          explanation: "Find npm commands you ran before."
        }
      ],
      tags: ["terminal", "recall"]
    },
    {
      id: "git-status",
      title: "git status",
      category: "git",
      summary: "Show the current Git working tree state.",
      syntax: ["git status", "git status --short"],
      examples: [
        {
          command: "git status --short",
          explanation: "Show a compact list of changed files."
        }
      ],
      tags: ["git", "daily"]
    },
    {
      id: "git-add",
      title: "git add",
      category: "git",
      summary: "Stage files for the next commit.",
      syntax: ["git add <file>", "git add ."],
      examples: [
        {
          command: "git add src/App.tsx",
          explanation: "Stage one file."
        }
      ],
      tags: ["git", "daily"]
    },
    {
      id: "git-commit",
      title: "git commit",
      category: "git",
      summary: "Create a commit from staged changes.",
      syntax: ["git commit -m \"message\""],
      examples: [
        {
          command: "git commit -m \"Add terminal help notes\"",
          explanation: "Commit staged changes with a short message."
        }
      ],
      tags: ["git", "daily"]
    },
    {
      id: "npm-install",
      title: "npm install",
      category: "node",
      summary: "Install project dependencies or add a package.",
      syntax: ["npm install", "npm install <package>", "npm install -D <package>"],
      examples: [
        {
          command: "npm install",
          explanation: "Install dependencies from package.json."
        },
        {
          command: "npm install -D vitest",
          explanation: "Add Vitest as a development dependency."
        }
      ],
      tags: ["node", "package-manager"]
    },
    {
      id: "npm-run",
      title: "npm run",
      category: "node",
      summary: "Run a script from package.json.",
      syntax: ["npm run <script>", "npm run"],
      examples: [
        {
          command: "npm run dev",
          explanation: "Run the dev script if the project defines one."
        },
        {
          command: "npm run",
          explanation: "List available package scripts."
        }
      ],
      tags: ["node", "package-manager"]
    }
  ]
};
