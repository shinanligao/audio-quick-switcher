/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import St from "gi://St";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as SwitcherPopup from "resource:///org/gnome/shell/ui/switcherPopup.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const InputSourcePopup = GObject.registerClass(
    class InputSourcePopup extends SwitcherPopup.SwitcherPopup {
        _init(items, action, actionBackward) {
            super._init(items);

            this._action = action;
            this._actionBackward = actionBackward;

            this._switcherList = new InputSourceSwitcher(this._items);
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

const InputSourceSwitcher = GObject.registerClass(
    class InputSourceSwitcher extends SwitcherPopup.SwitcherList {
        _init(items) {
            super._init(true);

            for (let i = 0; i < items.length; i++) this._addIcon(items[i]);
        }

        _addIcon(item) {
            const box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
            });

            const symbol = new St.Bin({
                style_class: "input-source-switcher-symbol",
                child: new St.Label({
                    text: item.shortName, // THIS IS WHERE I CAN RENDER THE ICON INSTEAD!
                    x_align: Clutter.ActorAlign.CENTER,
                    y_align: Clutter.ActorAlign.CENTER,
                }),
            });
            box.add_child(symbol);

            let text = new St.Label({
                text: item.displayName,
                x_align: Clutter.ActorAlign.CENTER,
            });
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

        // HACK: Fall back on simple audio output switching since we
        // can't show a popup switcher while a GrabHelper grab is in
        // effect without considerable work to consolidate the usage
        // of pushModal/popModal and grabHelper. See
        // https://bugzilla.gnome.org/show_bug.cgi?id=695143 .
        if (Main.actionMode === Shell.ActionMode.POPUP) {
            this._simpleSwitch();
            return;
        }

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
            .map((device) => ({
                shortName: device.description.substring(0, 2),
                displayName: device.description,
                activate: () => {
                    outputSlider._activateDevice(device);
                },
            }));

        this._switcherPopup = new InputSourcePopup(
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

    _simpleSwitch() {
        // TO DO
        console.log("Simple switch: not implemented");
    }
}
