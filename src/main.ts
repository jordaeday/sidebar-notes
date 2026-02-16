import {Notice, Platform, Plugin, TFile, WorkspaceLeaf} from 'obsidian';
import {DEFAULT_SETTINGS, SidebarNotesSettings, SidebarNotesSettingTab} from "./settings";
import {SideNoteView, SIDE_NOTE_VIEW_TYPE} from "./view/SideNoteView";
import {readSideNote, writeSideNote} from "./storage/sideNoteStore";

export default class SidebarNotesPlugin extends Plugin {
	settings: SidebarNotesSettings;
	private activeFile: TFile | null = null;
	private suppressReloadForPath: string | null = null;
	private suppressReloadTimeout: number | null = null;

	async onload() {
		if (!Platform.isDesktopApp) {
			new Notice('Sidebar notes is desktop-only and disabled on mobile.');
			return;
		}

		await this.loadSettings();
		this.registerViews();
		this.addSettingTab(new SidebarNotesSettingTab(this.app, this));
		this.registerCommands();
		this.registerEvent(this.app.workspace.on('file-open', (file) => {
			void this.handleFileOpen(file);
		}));
		this.registerEvent(this.app.metadataCache.on('changed', (file) => {
			if (!this.activeFile || file.path !== this.activeFile.path) {
				return;
			}
			if (this.suppressReloadForPath === file.path) {
				this.suppressReloadForPath = null;
				return;
			}
			const view = this.getSideNoteView();
			if (view && !view.isUserEditing()) {
				void view.setFile(this.activeFile);
			}
		}));

		this.app.workspace.onLayoutReady(() => {
			void this.handleFileOpen(this.app.workspace.getActiveFile());
		});
	}

	onunload() {
		if (this.suppressReloadTimeout) {
			window.clearTimeout(this.suppressReloadTimeout);
			this.suppressReloadTimeout = null;
		}
	}

	private registerViews() {
		this.registerView(SIDE_NOTE_VIEW_TYPE, (leaf: WorkspaceLeaf) => new SideNoteView(leaf, this));
	}

	private registerCommands() {
		this.addRibbonIcon('columns', 'Show side notes', () => {
			void this.revealSideNotes();
		});

		this.addCommand({
			id: 'open',
			name: 'Show side notes',
			callback: () => {
				void this.revealSideNotes();
			}
		});

	}

	private getSideNoteView(): SideNoteView | null {
		const leaf = this.getExistingSideNoteLeaf();
		return leaf ? leaf.view as SideNoteView : null;
	}

	private async handleFileOpen(file: TFile | null) {
		this.activeFile = file;
		const view = this.getSideNoteView();
		if (view) {
			await view.setFile(this.activeFile);
		} else if (this.settings.autoOpenSidebar && this.activeFile) {
			await this.revealSideNotes();
		}
	}

	async revealSideNotes() {
		let leaf = this.getExistingSideNoteLeaf();
		if (!leaf) {
			leaf = this.app.workspace.getRightLeaf(false);
			if (!leaf) {
				return;
			}
			await leaf.setViewState({type: SIDE_NOTE_VIEW_TYPE, active: true});
		}
		void this.app.workspace.revealLeaf(leaf);
	}

	loadSideNote(file: TFile): string {
		return readSideNote(this.app, file);
	}

	async persistSideNote(file: TFile, content: string): Promise<void> {
		this.suppressReloadForPath = file.path;
		if (this.suppressReloadTimeout) {
			window.clearTimeout(this.suppressReloadTimeout);
		}
		this.suppressReloadTimeout = window.setTimeout(() => {
			if (this.suppressReloadForPath === file.path) {
				this.suppressReloadForPath = null;
			}
			this.suppressReloadTimeout = null;
		}, 1500);
		try {
			await writeSideNote(this.app, file, content);
		} finally {
			// Keep suppression until metadata change fires.
		}
	}


	private getExistingSideNoteLeaf(): WorkspaceLeaf | null {
		const leaves = this.app.workspace.getLeavesOfType(SIDE_NOTE_VIEW_TYPE);
		return leaves[0] ?? null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<SidebarNotesSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
