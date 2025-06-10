import Adw from "gi://Adw";
import Gtk from "gi://Gtk";

import {
    ExtensionPreferences,
    gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AudioQuickSwitcherPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        window.add(page);

        const shortcutsGroup = new Adw.PreferencesGroup({
            title: _("Shortcuts"),
        });
        page.add(shortcutsGroup);

        this._addShortcutRow(
            shortcutsGroup,
            _("Switch to next audio output device"),
            "switch-audio-output-device",
        );

        this._addShortcutRow(
            shortcutsGroup,
            _("Switch to previous audio output device"),
            "switch-audio-output-device-backward",
        );
    }

    _addShortcutRow(group, title, settingsKey) {
        const settings = this.getSettings();

        const shortcutRow = new Adw.ActionRow({
            title,
        });
        group.add(shortcutRow);

        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator: settings.get_strv(settingsKey)[0] || "",
            valign: Gtk.Align.CENTER,
        });
        shortcutRow.add_suffix(shortcutLabel);
    }
}
