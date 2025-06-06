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
import Meta from "gi://Meta";
import Shell from "gi://Shell";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

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
        console.log("AudioQuickSwitcher Extension disabled");
    }

    _switchAudioOutputDevice(display, window, event, binding) {
        console.log("Switching Audio Output Device");

        // HACK: Fall back on simple audio output switching since we
        // can't show a popup switcher while a GrabHelper grab is in
        // effect without considerable work to consolidate the usage
        // of pushModal/popModal and grabHelper. See
        // https://bugzilla.gnome.org/show_bug.cgi?id=695143 .
        if (Main.actionMode === Shell.ActionMode.POPUP) {
            this._simpleSwitch();
            return;
        }
    }

    _simpleSwitch() {
        // TO DO
        console.log("Simple switch: not implemented");
    }
}
