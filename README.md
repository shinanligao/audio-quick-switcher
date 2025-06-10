# Audio Quick Switcher

A GNOME Shell extension providing a popup for quick audio output device switching.

## Description

This extension provides a keyboard shortcut to quickly open a popup that allows you to switch between available audio output devices without having to navigate through the system or quick settings.

## Features

- Quick audio device switching through an overlay popup
- Customizable keyboard shortcuts
- Seamless integration with GNOME Shell

## Installation

1. Clone this repository into the GNOME extensions directory:
```bash
git clone https://github.com/shinanligao/audio-quick-switcher ~/.local/share/gnome-shell/extensions/audio-quick-switcher@shinan.ligao.proton.me
```

2. Compile the GSettings Schema:
```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/audio-quick-switcher@shinan.ligao.proton.me/schemas/
```

3. Restart GNOME Shell, e.g. by logging out and logging back in

4. Enable the extension using the Extensions app or the following command:
```bash
gnome-extensions enable audio-quick-switcher@shinan.ligao.proton.me
```


## Usage

1. Press the configured keyboard shortcut (default: Super+O) to open the audio switcher popup, hold the modifier key to keep the popup open
2. Use arrow keys or the configured shortcuts to cycle through available devices
3. Release or press Enter to select a device
4. Press Escape to cancel

## Configuration

Open the Extensions app, find "Audio Quick Switcher" and click the settings gear icon to change the keyboard shortcuts.

## License

This extension is licensed under the GNU General Public License v3.0 or later (GPL-3.0-or-later).

See the [LICENSE](LICENSE) file for the full text of the license.


The `icons/enter-keyboard-shortcut.svg` icon used in the preferences dialog is derived from [GNOME Control Center](https://gitlab.gnome.org/Joshua-Dickens/wacom-settings-project/-/blob/39d1bd4e4488847bae906d62e84b34f14dd12af1/panels/keyboard/enter-keyboard-shortcut.svg), which is licensed under the GNU General Public License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
