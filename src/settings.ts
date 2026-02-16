import {App, PluginSettingTab, Setting} from "obsidian";
import SidebarNotesPlugin from "./main";

export interface SidebarNotesSettings {
	autoOpenSidebar: boolean;
}

export const DEFAULT_SETTINGS: SidebarNotesSettings = {
	autoOpenSidebar: true,
};

export class SidebarNotesSettingTab extends PluginSettingTab {
	plugin: SidebarNotesPlugin;

	constructor(app: App, plugin: SidebarNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Open sidebar automatically')
			.setDesc('Open the side note panel whenever a Markdown note is focused (desktop only).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoOpenSidebar)
				.onChange(async (value) => {
					this.plugin.settings.autoOpenSidebar = value;
					await this.plugin.saveSettings();
				}));
	}
}
