import Adw from "gi://Adw";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";

import {
    ExtensionPreferences,
    gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AudioQuickSwitcherPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        this.window = window;

        const page = new Adw.PreferencesPage();
        window.add(page);

        const shortcutsGroup = new Adw.PreferencesGroup({
            title: _("Keyboard Shortcuts"),
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

        const editButton = new Gtk.Button({
            icon_name: "edit-symbolic",
            valign: Gtk.Align.CENTER,
            tooltip_text: _("Edit shortcut"),
        });
        shortcutRow.add_suffix(editButton);

        editButton.connect("clicked", () => {
            this._captureKeypress(settings, settingsKey);
        });
    }

    _captureKeypress(settings, settingsKey) {
        const dialog = new Gtk.Dialog({
            title: _("Set Shortcut"),
            use_header_bar: 1,
            modal: true,
            transient_for: this.window,
            default_width: 400,
        });

        const contentArea = dialog.get_content_area();
        contentArea.margin_start = 12;
        contentArea.margin_end = 12;
        contentArea.margin_top = 12;
        contentArea.margin_bottom = 12;
        contentArea.spacing = 12;

        const svgPath = GLib.build_filenamev([
            this.path,
            "icons",
            "enter-keyboard-shortcut.svg",
        ]);
        const file = Gio.File.new_for_path(svgPath);

        const picture = new Gtk.Picture({
            file: file,
            can_shrink: false,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
        });

        contentArea.append(picture);

        const label = new Gtk.Label({
            label: _("Press a key combination to set as shortcut"),
            wrap: true,
            halign: Gtk.Align.CENTER,
        });
        contentArea.append(label);

        const keyController = new Gtk.EventControllerKey();
        dialog.add_controller(keyController);

        keyController.connect(
            "key-pressed",
            (_controller, keyval, _keycode, state) => {
                if (keyval === Gdk.KEY_Escape) {
                    dialog.response(Gtk.ResponseType.CANCEL);
                    return Gdk.EVENT_STOP;
                }

                const mask = state & Gtk.accelerator_get_default_mod_mask();

                if (mask === 0) {
                    return Gdk.EVENT_STOP;
                }

                if (Gtk.accelerator_valid(keyval, mask)) {
                    const accelerator = Gtk.accelerator_name(keyval, mask);
                    settings.set_strv(settingsKey, [accelerator]);
                    dialog.destroy();
                }

                return Gdk.EVENT_STOP;
            },
        );

        dialog.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
        dialog.connect("response", (dlg, _response) => {
            dlg.destroy();
        });

        dialog.present();
    }
}
