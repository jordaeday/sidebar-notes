# Sidebar Notes

Pair every note with a synced sidebar note for summaries or extraneous notes.

Sidebar Notes adds a panel to Obsidian's right sidebar where you can write free-form notes that are linked to whichever note you have open. Switch between notes and the sidebar content follows along. Everything is stored in your note's frontmatter under the `sidebarNote` key, so your side notes travel with the file.

## Usage

1. Open a note.
2. Click the **columns** icon in the ribbon (or run the **Show side notes** command).
3. Start typing in the sidebar panel -- your text is saved automatically.

When you switch to a different note the sidebar updates to show that note's side note.

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Open sidebar automatically | Open the side note panel whenever a Markdown note is focused | On |

## Desktop only

This plugin is desktop-only. It will not load on Obsidian mobile.

## Manual installation

1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release.
2. Create a folder at `<vault>/.obsidian/plugins/sidebar-notes/`.
3. Copy the three files into that folder.
4. Restart Obsidian and enable the plugin in **Settings > Community plugins**.
