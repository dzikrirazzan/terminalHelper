import type { NotesDocument } from "./types.js";

export const defaultNotes: NotesDocument = {
  version: 2,
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
    },
    {
        id: "touch",
        title: "touch",
        category: "files",
        summary: "Create an empty file or update a file timestamp.",
        syntax: ["touch <file>", "touch src/index.js"],
        examples: [
          {
            command: "touch notes.txt",
            explanation: "Create notes.txt if it does not exist."
          }
        ],
        tags: ["files", "create", "beginner"]
      },
      {
        id: "file",
        title: "file",
        category: "files",
        summary: "Identify what kind of file something is.",
        syntax: ["file <path>"],
        examples: [
          {
            command: "file photo.png",
            explanation: "Show the file type and basic information."
          }
        ],
        tags: ["files", "inspect"]
      },
      {
        id: "head",
        title: "head",
        category: "files",
        summary: "Show the first lines of a file.",
        syntax: ["head <file>", "head -n <number> <file>"],
        examples: [
          {
            command: "head -n 20 README.md",
            explanation: "Show the first 20 lines of README.md."
          }
        ],
        tags: ["files", "read"]
      },
      {
        id: "tail",
        title: "tail",
        category: "files",
        summary: "Show the last lines of a file or follow new lines as they appear.",
        syntax: ["tail <file>", "tail -f <log-file>"],
        examples: [
          {
            command: "tail -f app.log",
            explanation: "Keep watching new lines added to a log file. Press Ctrl+C to stop."
          }
        ],
        tags: ["files", "logs", "read"]
      },
      {
        id: "less",
        title: "less",
        category: "files",
        summary: "Read a long file one screen at a time.",
        syntax: ["less <file>", "command | less"],
        examples: [
          {
            command: "less README.md",
            explanation: "Open a file without printing the whole thing at once. Press q to quit."
          }
        ],
        tags: ["files", "read", "beginner"]
      },
      {
        id: "wc",
        title: "wc",
        category: "text",
        summary: "Count lines, words, and characters.",
        syntax: ["wc <file>", "wc -l <file>"],
        examples: [
          {
            command: "wc -l src/index.ts",
            explanation: "Count the lines in a file."
          }
        ],
        tags: ["text", "count"]
      },
      {
        id: "sort",
        title: "sort",
        category: "text",
        summary: "Sort lines of text.",
        syntax: ["sort <file>", "command | sort"],
        examples: [
          {
            command: "sort names.txt",
            explanation: "Print the lines in alphabetical order."
          }
        ],
        tags: ["text", "pipe"]
      },
      {
        id: "uniq",
        title: "uniq",
        category: "text",
        summary: "Remove repeated neighboring lines from text.",
        syntax: ["uniq <file>", "sort <file> | uniq"],
        examples: [
          {
            command: "sort names.txt | uniq",
            explanation: "Sort names and remove repeated entries."
          }
        ],
        tags: ["text", "pipe"]
      },
      {
        id: "cut",
        title: "cut",
        category: "text",
        summary: "Take selected columns or characters from each line.",
        syntax: ["cut -d ',' -f 1 <file>", "cut -c 1-10 <file>"],
        examples: [
          {
            command: "cut -d ',' -f 1 users.csv",
            explanation: "Print the first comma-separated column."
          }
        ],
        tags: ["text", "csv"]
      },
      {
        id: "tee",
        title: "tee",
        category: "text",
        summary: "Show command output and save it to a file at the same time.",
        syntax: ["command | tee <file>", "command | tee -a <file>"],
        examples: [
          {
            command: "npm test | tee test-output.txt",
            explanation: "See test output and save a copy."
          }
        ],
        tags: ["text", "pipe", "logs"]
      },
      {
        id: "pipe",
        title: "| (pipe)",
        category: "shell",
        summary: "Send the output of one command into another command.",
        syntax: ["command1 | command2", "cat file.txt | grep word"],
        examples: [
          {
            command: "history | grep npm",
            explanation: "Find previous commands that contain npm."
          }
        ],
        tags: ["shell", "pipe", "beginner"]
      },
      {
        id: "redirect-output",
        title: "> and >>",
        category: "shell",
        summary: "Write command output to a file, replacing it or adding to it.",
        syntax: ["command > <file>", "command >> <file>"],
        examples: [
          {
            command: "echo 'hello' > greeting.txt",
            explanation: "Create or replace greeting.txt with one line. Use >> to append instead."
          }
        ],
        tags: ["shell", "files", "redirect"]
      },
      {
        id: "echo",
        title: "echo",
        category: "shell",
        summary: "Print text or a variable value.",
        syntax: ["echo <text>", "echo $HOME"],
        examples: [
          {
            command: "echo $HOME",
            explanation: "Print the path to your home folder."
          }
        ],
        tags: ["shell", "output", "beginner"]
      },
      {
        id: "command-v",
        title: "which / command -v",
        category: "shell",
        summary: "Find which program will run for a command.",
        syntax: ["which <command>", "command -v <command>"],
        examples: [
          {
            command: "command -v node",
            explanation: "Show the path of the Node.js executable."
          }
        ],
        tags: ["shell", "inspect", "debug"]
      },
      {
        id: "man",
        title: "man",
        category: "help",
        summary: "Open the manual page for a command.",
        syntax: ["man <command>", "man -k <keyword>"],
        examples: [
          {
            command: "man chmod",
            explanation: "Read the built-in manual for chmod. Press q to quit."
          }
        ],
        tags: ["help", "learn", "beginner"]
      },
      {
        id: "whoami",
        title: "whoami",
        category: "system",
        summary: "Show the current user name.",
        syntax: ["whoami"],
        examples: [
          {
            command: "whoami",
            explanation: "Check which user account the terminal is using."
          }
        ],
        tags: ["system", "identity"]
      },
      {
        id: "env",
        title: "env",
        category: "system",
        summary: "Show or run a command with environment variables.",
        syntax: ["env", "env | grep <name>", "NAME=value command"],
        examples: [
          {
            command: "env | grep PATH",
            explanation: "Find the PATH variable in the current environment."
          }
        ],
        tags: ["system", "environment"]
      },
      {
        id: "open",
        title: "open",
        category: "macOS",
        summary: "Open a file, folder, or URL with the default macOS app.",
        syntax: ["open <file>", "open <folder>", "open https://example.com"],
        examples: [
          {
            command: "open .",
            explanation: "Open the current folder in Finder."
          }
        ],
        tags: ["macos", "desktop"]
      },
      {
        id: "pbcopy",
        title: "pbcopy / pbpaste",
        category: "macOS",
        summary: "Copy text to or read text from the macOS clipboard.",
        syntax: ["command | pbcopy", "pbpaste"],
        examples: [
          {
            command: "pwd | pbcopy",
            explanation: "Copy the current folder path so you can paste it elsewhere."
          }
        ],
        tags: ["macos", "clipboard"]
      },
      {
        id: "zip",
        title: "zip / unzip",
        category: "archives",
        summary: "Create or open ZIP archives.",
        syntax: ["zip <archive>.zip <file>", "zip -r <archive>.zip <folder>", "unzip <archive>.zip"],
        examples: [
          {
            command: "zip -r project.zip project",
            explanation: "Compress the project folder into project.zip."
          }
        ],
        tags: ["archives", "files"]
      },
      {
        id: "tar",
        title: "tar",
        category: "archives",
        summary: "Create or extract tar archives, often used with gzip.",
        syntax: ["tar -czf <archive>.tar.gz <folder>", "tar -xzf <archive>.tar.gz"],
        examples: [
          {
            command: "tar -xzf project.tar.gz",
            explanation: "Extract a gzip-compressed tar archive."
          }
        ],
        tags: ["archives", "files"]
      },
      {
        id: "ps",
        title: "ps",
        category: "processes",
        summary: "List running processes.",
        syntax: ["ps", "ps aux", "ps aux | grep <name>"],
        examples: [
          {
            command: "ps aux | grep node",
            explanation: "Find running processes that contain node in their name."
          }
        ],
        tags: ["processes", "debug"]
      },
      {
        id: "top",
        title: "top",
        category: "processes",
        summary: "Watch CPU and memory use from running processes.",
        syntax: ["top", "top -o cpu"],
        examples: [
          {
            command: "top",
            explanation: "Open a live process view. Press q to quit."
          }
        ],
        tags: ["processes", "performance"]
      },
      {
        id: "kill",
        title: "kill",
        category: "processes",
        summary: "Stop a process using its process ID.",
        syntax: ["kill <pid>", "kill -9 <pid>"],
        examples: [
          {
            command: "kill 12345",
            explanation: "Ask the process with ID 12345 to stop."
          }
        ],
        tags: ["processes", "stop"],
        notes: "Find the PID with ps or top first. Use kill -9 only when a process will not stop normally."
      },
      {
        id: "jobs",
        title: "jobs / fg / bg",
        category: "processes",
        summary: "See and control commands running in the background.",
        syntax: ["jobs", "command &", "fg %1", "bg %1"],
        examples: [
          {
            command: "npm run dev &",
            explanation: "Start a command in the background. Use jobs to see it and fg to bring it back."
          }
        ],
        tags: ["processes", "shell"]
      },
      {
        id: "curl",
        title: "curl",
        category: "network",
        summary: "Send requests to a URL or download data.",
        syntax: ["curl <url>", "curl -I <url>", "curl -o <file> <url>"],
        examples: [
          {
            command: "curl -I https://example.com",
            explanation: "Show the response headers without downloading the page body."
          }
        ],
        tags: ["network", "http"]
      },
      {
        id: "ping",
        title: "ping",
        category: "network",
        summary: "Check whether a host responds over the network.",
        syntax: ["ping <host>", "ping -c 4 <host>"],
        examples: [
          {
            command: "ping -c 4 example.com",
            explanation: "Send four test packets and show the response time."
          }
        ],
        tags: ["network", "debug"]
      },
      {
        id: "ssh",
        title: "ssh",
        category: "network",
        summary: "Connect to another computer through a secure shell.",
        syntax: ["ssh <user>@<host>", "ssh -p <port> <user>@<host>"],
        examples: [
          {
            command: "ssh user@example.com",
            explanation: "Connect to a remote computer as user."
          }
        ],
        tags: ["network", "remote"]
      },
      {
        id: "scp",
        title: "scp",
        category: "network",
        summary: "Copy files between your computer and a remote computer.",
        syntax: ["scp <file> <user>@<host>:<path>", "scp <user>@<host>:<file> ."],
        examples: [
          {
            command: "scp report.txt user@example.com:~/",
            explanation: "Copy report.txt to the remote user's home folder."
          }
        ],
        tags: ["network", "remote", "files"]
      },
      {
        id: "chmod",
        title: "chmod",
        category: "permissions",
        summary: "Change who can read, write, or run a file.",
        syntax: ["chmod +x <file>", "chmod 644 <file>"],
        examples: [
          {
            command: "chmod +x script.sh",
            explanation: "Make a shell script executable."
          }
        ],
        tags: ["permissions", "files"],
        notes: "Permissions can affect security. Avoid copying chmod 777 commands unless you understand why they are needed."
      },
      {
        id: "sudo",
        title: "sudo",
        category: "permissions",
        summary: "Run a command with administrator permissions.",
        syntax: ["sudo <command>"],
        examples: [
          {
            command: "sudo <command>",
            explanation: "Use only when the command specifically requires administrator access."
          }
        ],
        tags: ["permissions", "admin", "danger"],
        notes: "Read the command before entering your password. Do not use sudo to fix an error you do not understand."
      },
      {
        id: "node",
        title: "node",
        category: "node",
        summary: "Run JavaScript files or open a small JavaScript prompt.",
        syntax: ["node <file>.js", "node", "node --version"],
        examples: [
          {
            command: "node script.js",
            explanation: "Run a JavaScript file with Node.js."
          }
        ],
        tags: ["node", "javascript", "run"]
      },
      {
        id: "npm-version",
        title: "node --version / npm --version",
        category: "node",
        summary: "Check which Node.js and npm versions are installed.",
        syntax: ["node --version", "npm --version"],
        examples: [
          {
            command: "node --version && npm --version",
            explanation: "Print both installed versions."
          }
        ],
        tags: ["node", "debug", "beginner"]
      },
      {
        id: "npm-ci",
        title: "npm ci",
        category: "node",
        summary: "Install the exact dependency versions from package-lock.json.",
        syntax: ["npm ci"],
        examples: [
          {
            command: "npm ci",
            explanation: "Make a clean install, commonly used in automated builds."
          }
        ],
        tags: ["node", "package-manager", "install"]
      },
      {
        id: "npm-start",
        title: "npm start / npm test",
        category: "node",
        summary: "Run the start or test script defined in package.json.",
        syntax: ["npm start", "npm test", "npm run <script>"],
        examples: [
          {
            command: "npm test",
            explanation: "Run the project's tests when a test script exists."
          }
        ],
        tags: ["node", "package-manager", "scripts"]
      },
      {
        id: "npx",
        title: "npx",
        category: "node",
        summary: "Run a package command without installing it globally.",
        syntax: ["npx <package>", "npx <package> <args>"],
        examples: [
          {
            command: "npx vite",
            explanation: "Run Vite from the project or download a temporary copy if needed."
          }
        ],
        tags: ["node", "package-manager", "run"]
      },
      {
        id: "git-clone",
        title: "git clone",
        category: "git",
        summary: "Download a Git repository to your computer.",
        syntax: ["git clone <url>", "git clone <url> <folder>"],
        examples: [
          {
            command: "git clone https://github.com/user/project.git",
            explanation: "Download a project and create a local folder for it."
          }
        ],
        tags: ["git", "setup", "beginner"]
      },
      {
        id: "git-init",
        title: "git init",
        category: "git",
        summary: "Start tracking a folder with Git.",
        syntax: ["git init", "git init <folder>"],
        examples: [
          {
            command: "git init",
            explanation: "Create a new Git repository in the current folder."
          }
        ],
        tags: ["git", "setup"]
      },
      {
        id: "git-diff",
        title: "git diff",
        category: "git",
        summary: "Show changes that are not staged yet.",
        syntax: ["git diff", "git diff <file>"],
        examples: [
          {
            command: "git diff src/App.tsx",
            explanation: "Review changes in one file before staging it."
          }
        ],
        tags: ["git", "review"]
      },
      {
        id: "git-log",
        title: "git log",
        category: "git",
        summary: "View the commit history.",
        syntax: ["git log", "git log --oneline", "git log --oneline --all"],
        examples: [
          {
            command: "git log --oneline",
            explanation: "Show a short list of recent commits."
          }
        ],
        tags: ["git", "history"]
      },
      {
        id: "git-branch",
        title: "git branch",
        category: "git",
        summary: "List, create, or delete local branches.",
        syntax: ["git branch", "git branch <name>", "git branch -d <name>"],
        examples: [
          {
            command: "git branch feature-name",
            explanation: "Create a branch without switching to it."
          }
        ],
        tags: ["git", "branches"]
      },
      {
        id: "git-switch",
        title: "git switch",
        category: "git",
        summary: "Move to another Git branch or create and move to one.",
        syntax: ["git switch <branch>", "git switch -c <new-branch>"],
        examples: [
          {
            command: "git switch -c feature-name",
            explanation: "Create feature-name and switch to it."
          }
        ],
        tags: ["git", "branches"]
      },
      {
        id: "git-pull",
        title: "git pull",
        category: "git",
        summary: "Download and apply new changes from a remote repository.",
        syntax: ["git pull", "git pull origin <branch>"],
        examples: [
          {
            command: "git pull origin main",
            explanation: "Update the local main branch from the remote repository."
          }
        ],
        tags: ["git", "remote", "daily"]
      },
      {
        id: "git-push",
        title: "git push",
        category: "git",
        summary: "Upload local commits to a remote repository.",
        syntax: ["git push", "git push origin <branch>"],
        examples: [
          {
            command: "git push origin main",
            explanation: "Upload the local main branch to origin."
          }
        ],
        tags: ["git", "remote", "daily"]
      },
      {
        id: "git-stash",
        title: "git stash",
        category: "git",
        summary: "Temporarily save uncommitted changes and return to a clean tree.",
        syntax: ["git stash", "git stash pop", "git stash list"],
        examples: [
          {
            command: "git stash pop",
            explanation: "Restore the most recently stashed changes."
          }
        ],
        tags: ["git", "changes"]
      },
      {
        id: "git-restore",
        title: "git restore",
        category: "git",
        summary: "Discard unstaged changes or remove a file from the staging area.",
        syntax: ["git restore <file>", "git restore --staged <file>"],
        examples: [
          {
            command: "git restore --staged README.md",
            explanation: "Unstage README.md without deleting its changes."
          }
        ],
        tags: ["git", "undo"],
        notes: "git restore <file> discards local changes in that file. Review git diff first."
      },
      {
        id: "git-remote",
        title: "git remote",
        category: "git",
        summary: "View or change the remote repository connection.",
        syntax: ["git remote -v", "git remote add origin <url>"],
        examples: [
          {
            command: "git remote -v",
            explanation: "See where push and pull commands connect."
          }
        ],
        tags: ["git", "remote", "setup"]
      },
      {
        id: "git-reset",
        title: "git reset",
        category: "git",
        summary: "Move the current branch or undo staging, depending on the options.",
        syntax: ["git reset <file>", "git reset --soft HEAD~1", "git reset --hard HEAD~1"],
        examples: [
          {
            command: "git reset README.md",
            explanation: "Remove README.md from staging but keep its file changes."
          }
        ],
        tags: ["git", "undo", "danger"],
        notes: "Avoid git reset --hard until you understand it. It can permanently remove local changes."
      },
  ]
};
