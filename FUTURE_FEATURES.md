# Future Features

A running list of ideas and improvements for Longform. Add to this freely — nothing here is committed to or prioritised.

---

## Editor

- **Autosave indicator** — subtle "Saved" / "Saving…" status in the header so users know their work is safe
- **Word count goal** — set a target word count per article; progress bar in the header
- **Reading time estimate** — show estimated reading time alongside word count
- **Find & replace** — in-editor search with optional replace (Ctrl+H)
- **Text alignment / justification** — toolbar controls for left, centre, right, and justify alignment (via HTML or custom markdown attributes)
- **Typewriter mode** — keep the active line vertically centred as you type
- **Distraction-free mode** — full-width editor with no header, accessible via keyboard shortcut
- **Undo history across sessions** — currently CodeMirror undo is reset on reload
- **Spell check toggle** — opt-in browser spell check on the editor contenteditable
- **Paragraph focus** — dim all paragraphs except the one being edited
- **Custom fonts** — let users pick from a small list of serif/sans/mono writing fonts

---

## Library

- **Folder / collection grouping** — organise articles into named folders or collections
- **Colour tags / labels** — tag articles with custom colour labels for quick visual grouping
- **Bulk actions** — select multiple articles to delete, export, or move
- **Duplicate article** — copy an article with all its content (but not its references)
- **Article templates** — start a new article from a saved template (e.g. "Research Paper", "Blog Post")
- **Recent articles** — a "recently opened" section at the top of the library
- **Grid view** — card-grid layout alternative to the current list view
- **Pinned articles** — pin important articles to the top of the library

---

## References

- **Borrow from Global Refs** — from within an article's References page, allow viewing Global Refs and linking/borrowing them into the article. Since duplicate DOIs are denied globally, articles need a way to reference a globally-held entry without duplicating it. Could be implemented as a "Link from Global" button that creates an association rather than a copy.
- **DOI batch import** — paste a list of DOIs and import them all at once
- **BibTeX import** — import references from a `.bib` file
- **Zotero / Mendeley integration** — sync references from external managers via API
- **Inline citation insertion** — click a reference from a sidebar panel to insert a formatted citation at the cursor
- **Reference deduplication** — detect and merge duplicate entries (same DOI or title)
- **Citation preview** — hover over a shortcode in the editor to see the full formatted citation
- **Reference notes** — a free-text annotation field per reference for personal notes
- **Tag filtering across articles** — filter the global refs view by tag

---

## Corpus

- **Image compression on insert** — when inserting a local image file, resize/compress via canvas API before encoding as base64 to reduce localStorage footprint; warn if resulting data URL exceeds a size threshold
- **Auto-compute embeddings on add** — when a corpus document is added, automatically call Ollama's `/api/embed` endpoint (using the configured model) to compute and store the embedding vector; show a progress indicator and "embedded" badge once done; use stored embeddings for semantic similarity search instead of passing full text as context
- **PDF text extraction** — extract plain text from uploaded PDFs (via pdf.js or similar)
- **Automatic tagging** — suggest tags for corpus documents based on NLP keyword extraction
- **Semantic search** — find corpus documents by meaning, not just keyword match
- **Corpus ↔ reference linking** — link a corpus document to a reference entry so they stay connected
- **Export corpus** — export all corpus documents as a zip of text files

---

## NLP / Analysis

- **Sentence complexity score** — flag very long or complex sentences
- **Passive voice detection** — highlight passive constructions
- **Readability score** — Flesch-Kincaid or similar, shown in the analysis panel
- **Repeated phrase detection** — highlight phrases used too frequently
- **Transition word suggestions** — flag paragraphs that lack connecting language
- **Named entity highlighting** — highlight people, places, and organisations in the text

---

## Focus Mode

- **Session history** — log completed sessions with duration and article name
- **Ambient sound** — optional background noise (white noise, rain, café) during sessions
- **Break reminders** — optional Pomodoro-style break prompts between sessions
- **Session goal** — set a word-count goal for the session, shown alongside the timer

---

## Export

- **PDF export** — generate a clean PDF via browser print or a library like `@react-pdf/renderer`
- **DOCX export** — export to Word format for submission to journals or editors
- **HTML export** — styled standalone HTML file
- **Formatted citations in export** — include a formatted bibliography section at the end of exports
- **Citation style per export** — override the article's citation style at export time

---

## Settings / Sync

- **Cloud sync** — optional sync via a simple backend (or browser storage API like OPFS)
- **Export / import database** — download and restore the entire SQLite DB as a file
- **Keyboard shortcut customisation** — let users remap editor shortcuts
- **Font size control** — global font size slider for accessibility
- **Custom citation styles** — import or define CSL citation styles beyond the built-in list

---

## Infrastructure / DX

- **PWA / offline support** — add a service worker so the app works fully offline and is installable
- **Mobile layout** — responsive design for tablet and phone screens (currently min-width: 768px)
- **Multi-tab safety** — detect when the app is open in two tabs and warn about DB conflicts
- **Crash recovery** — detect and offer to restore from a previous DB snapshot if a write fails
- **Automated test suite** — Playwright or Vitest browser tests covering critical paths
