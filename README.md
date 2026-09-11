# terminal-help

A customizable command-note helper for people who keep jumping between terminal docs and the shell.

## Install locally

```bash
npm install
npm run build
npm install -g .
```

## Commands

```bash
terminal-help
# Opens the side window directly
terminal-help tui
terminal-help window
terminal-help split
terminal-help config path
terminal-help config open
terminal-help config reset
terminal-help doctor
```

Notes live at `~/.terminal-help/notes.yaml` by default. Use `--config <path>` on `tui`, `window`, or `split` to try another file.
The main `terminal-help` command opens the mini reference window on the right side of your screen. Use `terminal-help tui` when you want the helper to stay inside the current terminal.

## TUI controls

- `/`: search
- `up/down` or `j/k`: move selection
- `enter`: focus the detail panel
- `a`: add command
- `e`: edit selected command
- `d`: delete selected command
- `r`: reload notes
- `o`: open notes in `$EDITOR`
- `escape`: leave search/edit/detail focus
- `q`: quit
