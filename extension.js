import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import Meta from "gi://Meta";
import Pango from "gi://Pango";
import Shell from "gi://Shell";
import St from "gi://St";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as SwitcherPopup from "resource:///org/gnome/shell/ui/switcherPopup.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const AudioDevicePopup = GObject.registerClass(
    class AudioDevicePopup extends SwitcherPopup.SwitcherPopup {
        _init(items, action, actionBackward) {
            super._init(items);

            this._action = action;
            this._actionBackward = actionBackward;

            this._switcherList = new AudioDeviceSwitcher(this._items);
        }

        _keyPressHandler(keysym, action) {
            if (action === this._action) this._select(this._next());
            else if (action === this._actionBackward)
                this._select(this._previous());
            else if (keysym === Clutter.KEY_Left)
                this._select(this._previous());
            else if (keysym === Clutter.KEY_Right) this._select(this._next());
            else return Clutter.EVENT_PROPAGATE;

            return Clutter.EVENT_STOP;
        }

        _finish() {
            super._finish();

            this._items[this._selectedIndex].activate(true);
        }
    },
);

const AudioDeviceSwitcher = GObject.registerClass(
    class AudioDeviceSwitcher extends SwitcherPopup.SwitcherList {
        _init(items) {
            super._init(true);

            for (let i = 0; i < items.length; i++) this._addIcon(items[i]);
        }

        _addIcon(item) {
            const box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
            });

            let icon = new St.Icon({
                style_class: "audio-device-switcher-icon",
                x_align: Clutter.ActorAlign.CENTER,
            });
            icon.gicon = item.icon;

            box.add_child(icon);

            let text = new St.Label({
                text: item.name,
                x_align: Clutter.ActorAlign.CENTER,
            });
            text.height = text.height * 2;
            text.clutter_text.set_line_wrap(true);
            text.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);

            box.add_child(text);

            this.addItem(box, text);
        }
    },
);

export default class AudioQuickSwitcherExtension extends Extension {
    enable() {
        console.log("AudioQuickSwitcher Extension enabled");

        this._settings = this.getSettings();

        this._keybindingAction = Main.wm.addKeybinding(
            "switch-audio-output-device",
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            this._switchAudioOutputDevice.bind(this),
        );

        this._keybindingActionBackward = Main.wm.addKeybinding(
            "switch-audio-output-device-backward",
            this._settings,
            Meta.KeyBindingFlags.IS_REVERSED,
            Shell.ActionMode.ALL,
            this._switchAudioOutputDevice.bind(this),
        );
    }

    disable() {
        Main.wm.removeKeybinding("switch-audio-output-device");
        Main.wm.removeKeybinding("switch-audio-output-device-backward");

        if (this._switcherPopup) {
            this._switcherPopup.destroy();
            this._switcherPopup = null;
        }

        console.log("AudioQuickSwitcher Extension disabled");
    }

    _switchAudioOutputDevice(display, window, event, binding) {
        console.log("Switching Audio Output Device");

        let outputSlider =
            Main.panel.statusArea.quickSettings._volumeOutput._output;

        // Find active device by finding out which one is checked, as this
        // information does not seem to be stored anywhere in StreamSlider
        const activeDeviceId = Array.from(
            outputSlider._deviceItems.entries(),
        ).find(([, item]) => item._ornament === PopupMenu.Ornament.CHECK)?.[0];

        const allKeys = Array.from(outputSlider._deviceItems.keys());

        const reorderedKeys = activeDeviceId
            ? [
                  ...allKeys.slice(allKeys.indexOf(activeDeviceId)),
                  ...allKeys.slice(0, allKeys.indexOf(activeDeviceId)),
              ]
            : allKeys;

        const devices = reorderedKeys
            .map((id) => outputSlider._lookupDevice(id))
            .filter((device) => device !== null)
            .map((device) => {
                const { description, origin } = device;
                const name = origin
                    ? `${description} – ${origin}`
                    : description;
                return {
                    icon: device.get_gicon(),
                    name: name,
                    activate: () => {
                        outputSlider._activateDevice(device);
                    },
                };
            });

        this._switcherPopup = new AudioDevicePopup(
            devices,
            this._keybindingAction,
            this._keybindingActionBackward,
        );
        this._switcherPopup.connect("destroy", () => {
            this._switcherPopup = null;
        });
        if (
            !this._switcherPopup.show(
                binding.is_reversed(),
                binding.get_name(),
                binding.get_mask(),
            )
        )
            this._switcherPopup.fadeAndDestroy();
    }
}
