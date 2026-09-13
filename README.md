# terminal-help

Terminal Help is a small reference for terminal commands.

Open it when you forget a command. Click a command to see what it does, how to use it, and some examples. You can also add and edit your own notes.

## Install on a new computer

You need Git and Node.js 20 or newer. If you do not have them, install them first:

- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/

Then open Terminal and run these commands:

```bash
# Download the project
git clone https://github.com/dzikrirazzan/terminalHelper.git
cd terminalHelper

# Install the project packages
npm install

# Build the app
npm run build

# Make the terminal-help command available everywhere
npm install -g .
```

What the commands do:

- `git clone` downloads this project to your computer.
- `cd terminalHelper` moves Terminal into the project folder.
- `npm install` downloads the packages the project needs.
- `npm run build` prepares the app.
- `npm install -g .` lets you run `terminal-help` from any folder.

## Use it

Open the reference window:

```bash
terminal-help
```

The window opens on the right side of the screen. Click a command to read about it, or use the search box to find one.

To use it inside the current Terminal window instead:

```bash
terminal-help tui
```

Other commands:

```bash
terminal-help window
terminal-help split
terminal-help config path
terminal-help config open
terminal-help config reset
terminal-help doctor
```

Your notes are saved in `~/.terminal-help/notes.yaml`.

To change them, use **Customize YAML** in the window or run:

```bash
terminal-help config open
```

You can use your own notes file with `--config <path>`.

In the reference window, press `/` or `Ctrl/Cmd+K` to jump to search. Press `Escape` to clear the search or close the editor. Changes are saved when you press **Save**, and a failed save keeps the editor open so you can try again.

## Terminal controls

- `/`: search
- `up/down` or `j/k`: move selection
- `enter`: open command details
- `a`: add command
- `e`: edit selected command
- `d`: delete selected command
- `r`: reload notes
- `o`: open the notes file
- `escape`: leave the current mode
- `q`: quit
