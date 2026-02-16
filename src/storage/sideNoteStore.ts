import {App, TFile, parseYaml, stringifyYaml} from "obsidian";

export const SIDENOTE_FRONTMATTER_KEY = "sidebarNote";

interface ParsedFrontmatter {
	frontmatter: Record<string, unknown>;
	body: string;
}

function parseFrontmatterBlock(raw: string): ParsedFrontmatter {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		return {frontmatter: {}, body: raw};
	}

	let frontmatter: Record<string, unknown> = {};
	try {
		const yamlSection = match[1] ?? "";
		frontmatter = yamlSection ? (parseYaml(yamlSection) as Record<string, unknown>) ?? {} : {};
	} catch (error) {
		console.error("Sidebar Notes: failed to parse frontmatter", error);
		frontmatter = {};
	}

	const body = raw.slice(match[0].length);
	return {frontmatter, body};
}

function buildFrontmatterBlock(frontmatter: Record<string, unknown>, body: string): string {
	const keys = Object.keys(frontmatter);
	if (keys.length === 0) {
		return body;
	}

	const yaml = stringifyYaml(frontmatter).trimEnd();
	const trimmedBody = body.replace(/^\n+/, "");
	const bodySection = trimmedBody.length ? `\n${trimmedBody}` : "\n";
	return `---\n${yaml}\n---${bodySection}`;
}

export async function readSideNote(app: App, file: TFile): Promise<string> {
	const data = await app.vault.cachedRead(file);
	const {frontmatter} = parseFrontmatterBlock(data);
	const value = frontmatter[SIDENOTE_FRONTMATTER_KEY];
	return typeof value === "string" ? value : "";
}

export async function writeSideNote(app: App, file: TFile, content: string): Promise<void> {
	await app.vault.process(file, (current) => {
		const parsed = parseFrontmatterBlock(current);
		if (content.trim().length === 0) {
			delete parsed.frontmatter[SIDENOTE_FRONTMATTER_KEY];
		} else {
			parsed.frontmatter[SIDENOTE_FRONTMATTER_KEY] = content.replace(/\r\n/g, "\n");
		}

		return buildFrontmatterBlock(parsed.frontmatter, parsed.body);
	});
}
