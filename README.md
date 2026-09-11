# terminal-help

Terminal Help is a small reference for terminal commands.

Open it when you forget a command. Click a command to see what it does, how to use it, and some examples. You can also add and edit your own notes.

## Install

```bash
npm install
npm run build
npm install -g .
```

Node.js 20 or newer is required.

## Use it

```bash
# Open the reference window
terminal-help

# Open the reference inside the current terminal
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

You can use your own file with `--config <path>`.

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
