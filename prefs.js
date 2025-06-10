import Adw from "gi://Adw";
import Gtk from "gi://Gtk";

import {
    ExtensionPreferences,
    gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AudioQuickSwitcherPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _("General"),
            icon_name: "dialog-information-symbolic",
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _("Shortcuts"),
        });
        page.add(group);

        const settings = this.getSettings();

        const shortcutRow = new Adw.ActionRow({
            title: _("Switch to next audio output device"),
        });
        group.add(shortcutRow);

        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator:
                settings.get_strv("switch-audio-output-device")[0] || "",
            valign: Gtk.Align.CENTER,
        });
        shortcutRow.add_suffix(shortcutLabel);
    }
}
