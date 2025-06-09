import Adw from "gi://Adw";

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
    }
}
