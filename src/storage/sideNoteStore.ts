import {App, TFile} from "obsidian";

export const SIDENOTE_FRONTMATTER_KEY = "sidebarNote";

export function readSideNote(app: App, file: TFile): string {
	const cache = app.metadataCache.getFileCache(file);
	const value: unknown = cache?.frontmatter?.[SIDENOTE_FRONTMATTER_KEY];
	return typeof value === "string" ? value : "";
}

export async function writeSideNote(app: App, file: TFile, content: string): Promise<void> {
	await app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
		if (content.trim().length === 0) {
			delete fm[SIDENOTE_FRONTMATTER_KEY];
		} else {
			fm[SIDENOTE_FRONTMATTER_KEY] = content.replace(/\r\n/g, "\n");
		}
	});
}
