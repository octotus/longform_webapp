# Likhatu — User Guide

Likhatu is a browser-based writing tool for long-form academic and technical writing. Everything is stored locally in your browser — no account, no server, no cloud sync.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Library](#2-library)
3. [Editor](#3-editor)
4. [Writing Analysis (NLP Panel)](#4-writing-analysis-nlp-panel)
5. [AI Research Assistant](#5-ai-research-assistant)
6. [References](#6-references)
7. [Corpus](#7-corpus)
8. [Focus Mode](#8-focus-mode)
9. [Settings](#9-settings)
10. [Backup & Restore](#10-backup--restore)

---

## 1. Getting Started

Open Likhatu in your browser. Your data lives in `localStorage` under the `likhatu_*` keys — it persists across page reloads but is tied to the browser profile you use.

**Minimum browser width:** 768 px (designed for desktop use).

---

## 2. Library

The Library is the home screen. It lists all your articles.

### Creating an article
Click **+ New Article**, type a title, and press **Enter** or click **Create Article**. You are taken directly to the editor.

### Article cards
Each card shows:
- Title (click to open in editor)
- Word count and last-modified date
- Reference count (if any)
- A two-line content preview

### Per-article actions
Three buttons sit at the right of each card:

| Button | Action |
|--------|--------|
| **Refs** | Open the reference list for that article |
| **Focus** | Launch a focus timer session for that article |
| **Delete** | Asks for confirmation before deleting |

### Search and sort
- The search box filters articles by title and content in real time (300 ms debounce).
- The sort dropdown orders by **Modified** (default), **Created**, **Word Count**, or **Title**.

### Navigation
- **Global Refs** — view and manage references across all articles
- **Corpus** — manage your research document library
- **Settings** — configure AI providers, theme, and backups

---

## 3. Editor

Click an article title to open it. The editor is a full-featured Markdown editor with a live toolbar.

### Title
The title field is at the top. Changes are saved immediately to the database.

### Toolbar
The toolbar provides one-click formatting:

| Button | Markdown | Notes |
|--------|----------|-------|
| **B** | `**bold**` | |
| *I* | `*italic*` | |
| H1 / H2 / H3 | `#` / `##` / `###` | |
| List | `- item` | Unordered |
| Num | `1. item` | Ordered |
| `</>` | ` ```code``` ` | Code block |
| `"` | `> quote` | Blockquote |
| **Image** | `![alt](url)` | Opens image picker (see below) |

### Keyboard shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save now |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `F11` | Toggle fullscreen editor |

### Auto-save
Content is saved automatically 3 seconds after you stop typing. The NLP snapshot is also recorded at that point.

### Image insertion
Click the **Image** toolbar button. You can:
- **Paste a URL** — enter any public image URL.
- **Upload a file** — click "Choose file" to embed an image from disk. The image is stored locally in the browser and referenced with a `likhatu-img://` scheme so it travels with your backup file.

### Preview mode
Click **Preview** (top-right of the editor header) to render the Markdown — including tables, superscript (`^text^`), subscript (`~text~`), and inline references (`[@shortcode]`).
Click **Edit** to return to the editor.

### Superscript and subscript (in Markdown)
Use `^text^` for superscript and `~text~` for subscript. These render correctly in preview mode. In the WYSIWYG variant (LongForm-W), use **Ctrl+.** for superscript and **Ctrl+,** for subscript via the formatting toolbar.

### In-text citations
Type `[@shortcode]` anywhere in the text to insert an in-text citation. The shortcode must match a reference you have added under **Refs** for that article. The preview renders the citation in the article's selected citation style.

---

## 4. Writing Analysis (NLP Panel)

Click **Analysis** in the editor header to open the NLP panel.

The panel shows metrics computed from the last save:

| Metric | What it measures |
|--------|-----------------|
| **Word count** | Total words |
| **Readability** | Flesch–Kincaid grade level |
| **Passive voice** | Percentage of sentences using passive construction |
| **Hedge words** | Percentage of sentences containing hedging language (e.g., "might", "possibly") |

Scores update each time the auto-save fires or you click **Save Now**. The panel also shows a sparkline history of word count across recent saves.

---

## 5. AI Research Assistant

Click **Research** in the editor header to open the research panel.

### How it works
Type a question or search term and press **Enter** or click **Ask**. The assistant receives your article title and the first 500 characters of your content as context, then streams a response.

If you have corpus documents tagged (see §7), you can filter by tag — those documents are included in the context when using a local (Ollama) provider.

### Providers
Select the provider in the panel or configure a default in Settings:

| Provider | Requires |
|----------|---------|
| **OpenAI** | OpenAI API key |
| **Claude** | Anthropic API key |
| **Ollama** | Ollama running locally; no API key needed |

### Research source
- **Web** — uses the configured cloud provider (OpenAI or Claude).
- **Local** — forces Ollama regardless of the default provider; corpus tag filtering is active.

---

## 6. References

Each article has its own reference list. There is also a **Global References** list accessible from the Library header, which aggregates references from all articles.

### Opening references
From the Library, click **Refs** on an article card. From the editor header, click the **Refs** link.

### Importing from DOI
Paste a DOI (e.g., `10.1038/nature12345`) or a full `https://doi.org/…` URL into the import box and press **Enter** or click **Import**. Likhatu fetches metadata from CrossRef and populates all fields automatically.

### Adding manually
Click **+ Add Manual** to create a blank reference card and fill in the fields:

- Shortcode (used in `[@shortcode]` citations)
- Title, Authors (semicolon-separated), Year
- Journal, Volume, Issue, Pages
- DOI, URL

Click **Save** on the card.

### Tags
Each reference can carry one or more tags. Click **+ tag** on a reference card, type a label, and press **Enter**. Tags can be used to filter in the Global References view.

### Exporting BibTeX
Check the references you want to export (use **Select All** if needed) and click **Export BibTeX**. A `references.bib` file is downloaded.

### Global references
The Global Refs view shows references from every article. A badge on each card shows the source article name. Use the search box to filter by tag or article title.

---

## 7. Corpus

The Corpus is a library of reference documents (papers, notes, PDFs) that the AI research assistant can draw from when using the Local provider.

### Adding a URL source
1. Enter the source URL.
2. Optionally add tags by typing in the tag field and pressing **Enter** for each.
3. Click **Add**.

### Uploading a file
Supported formats: **plain text (.txt)**, **PDF (.pdf)**, and **MEDLINE (.nbib / .txt MEDLINE format)**.

1. Click **Choose File** and select a file.
2. A confirmation panel appears showing the filename.
3. Add tags if desired, then click **Import** (or **Cancel** to discard).

MEDLINE files may contain multiple records and are imported as a batch.

### Tagging and filtering
Tags let you scope which documents the AI sees during a research query. In the Research panel, select one or more tags under **Filter by tag** — only matching corpus documents are included in the prompt context.

### Removing documents
Each corpus card has a **Delete** button with a confirmation step.

---

## 8. Focus Mode

Focus Mode provides a distraction-free writing timer.

### Starting a session
From the Library, click **Focus** on an article card. Choose a preset duration:

- 15, 30, 45, 60, or 90 minutes
- **Custom** — type a duration like `25`, `25m`, or `90s` and press **Enter** or click **Start**

Clicking Start takes you back to the editor with a countdown chip visible in the header.

### During a session
- The chip in the editor header shows the remaining time.
- Click **← Back to Editor** (on the Focus screen) to return to writing without ending the session.
- Click **End Session** to stop the timer early.

### When time is up
A nudge appears prompting you to keep going or end the session. Clicking **End Session** returns you to the Library with a "Session complete!" confirmation.

**Browser notes:**
- Fullscreen is requested automatically when a session starts (requires a user gesture).
- Wake lock (screen stays on) is supported in Chrome and Edge.
- Session state is not persisted across page reloads.

---

## 9. Settings

Open Settings from the Library header.

### Appearance
Switch between **Dark** (default) and **Light** theme. The change applies immediately.

### AI Provider
Choose which provider the Research panel uses by default:

- **OpenAI** — paste your `sk-…` key in the OpenAI section.
- **Claude (Anthropic)** — paste your `sk-ant-…` key in the Claude section.
- **Ollama (Local)** — enter the base URL (default: `http://localhost:11434`) and model name. Click **Fetch Models** to populate a dropdown from your running Ollama instance. No API key is required.

Click **Save Settings** to persist. API keys are stored only in your browser's `localStorage` and never leave your device.

---

## 10. Backup & Restore

Likhatu stores up to **three backup slots** in the browser. Each slot captures the full database, settings, and all embedded images.

### Manual backup
Go to **Settings → Backup & Restore** and click **Backup Now**. The newest slot appears in the list labelled "Latest".

### Downloading a backup
Click **Download** next to any slot. A `.likhatu` file is saved to your downloads folder. Keep this file somewhere safe — it is a complete snapshot of your data.

### Auto-backup
Set an interval in the **Auto-backup interval** dropdown:
- Off (default), Every 15 min, Every 30 min, Every hour, Every 6 hours

When all three slots are full, the oldest is dropped automatically.

### Restoring from a file
Click **Restore from File**, select a `.likhatu` file, and the app reloads with the restored data. The current state is overwritten, so back up first if needed.

---

## Data & Privacy

- All data is stored locally in your browser (`localStorage`).
- API keys are never sent anywhere except directly to the provider's API endpoint.
- Clearing browser storage or site data will erase your articles. Use backups regularly.
- Likhatu runs entirely offline except when making AI research queries or importing DOI metadata.
