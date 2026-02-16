import {ItemView, TFile, WorkspaceLeaf, debounce} from "obsidian";
import SidebarNotesPlugin from "../main";

export const SIDE_NOTE_VIEW_TYPE = "sidebar-notes-view";

export class SideNoteView extends ItemView {
	private plugin: SidebarNotesPlugin;
	private fileNameEl: HTMLSpanElement | null = null;
	private textAreaEl: HTMLTextAreaElement | null = null;
	private currentFile: TFile | null = null;
	private suppressInput = false;
	private saveDebounced: (() => void) | null = null;
	private isDirty = false;

	constructor(leaf: WorkspaceLeaf, plugin: SidebarNotesPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return SIDE_NOTE_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Side notes";
	}

	getIcon(): string {
		return "layout-grid";
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.addClass("sidebar-notes-view");

		const headerEl = this.contentEl.createDiv({cls: "sidebar-notes-header"});
		this.fileNameEl = headerEl.createEl("span", {cls: "sidebar-notes-title", text: "No note selected"});

		const editorWrapper = this.contentEl.createDiv({cls: "sidebar-notes-editor"});
		this.textAreaEl = editorWrapper.createEl("textarea", {
			cls: "sidebar-notes-textarea",
			attr: {placeholder: "Select a note to start writing side notes."}
		});

		this.textAreaEl.addEventListener("input", () => this.handleInput());
		this.saveDebounced = debounce(() => this.persistCurrentContent(), 600);

		void this.setFile(this.app.workspace.getActiveFile());
	}

	async onClose(): Promise<void> {
		// View cleanup handled by Obsidian
	}

	async setFile(file: TFile | null): Promise<void> {
		this.currentFile = file;

		if (!this.textAreaEl || !this.fileNameEl) {
			return;
		}

		if (!file) {
			this.fileNameEl.setText("No note selected");
			this.textAreaEl.value = "";
			this.textAreaEl.setAttribute("disabled", "true");
			this.textAreaEl.setAttribute("placeholder", "Select a note to start writing side notes.");
			return;
		}

		this.textAreaEl.removeAttribute("disabled");
		this.fileNameEl.setText(file.basename);
		this.textAreaEl.setAttribute("placeholder", "Capture quick thoughts or summaries for this note.");

		const content = this.plugin.loadSideNote(file);
		this.suppressInput = true;
		this.textAreaEl.value = content;
		this.suppressInput = false;
		this.isDirty = false;
	}

	private async persistCurrentContent(): Promise<void> {
		if (!this.currentFile || !this.textAreaEl) {
			return;
		}
		try {
			await this.plugin.persistSideNote(this.currentFile, this.textAreaEl.value);
			this.isDirty = false;
		} catch (error) {
			console.error("Sidebar Notes: failed to save side note", error);
		}
	}

	private handleInput(): void {
		if (this.suppressInput) {
			return;
		}
		this.isDirty = true;
		this.saveDebounced?.();
	}

	isUserEditing(): boolean {
		return this.isDirty;
	}
}
