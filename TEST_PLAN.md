# Likhatu — Full Feature Test Plan

**App URL:** http://localhost:5173
**Last updated:** 2026-03-14
**Test run date:** 2026-03-14
**Status legend:** `[ ]` Not tested · `[P]` Pass · `[F]` Fail · `[S]` Skip · `[B]` Bug filed

---

## How to Use This File

- Work through each section in order on first pass
- Mark each test case with a status symbol
- Add notes in the **Notes** column for failures or unexpected behaviour
- Re-run `[F]` tests after a fix is applied; update status to `[P]` or keep `[F]`

---

## Fix & Improvement Log

All items to be actioned after testing is complete.

### Bugs (must fix)
| ID | Description |
|----|-------------|
| B1 | **13.2** — H1/H2/H3 headings not rendering in preview pane |
| B2 | **13.5** — Markdown tables not rendering in preview pane |
| B3 | **14.2/Editor** — Article content bleeds from previous article when navigating directly between articles; store state not reset on `loadArticle()`. Also causes blank screen on first open after restart (requires reopening twice). |
| B4 | **14.4** — Word count underreported in NLP panel (off by ~2 words) |
| B5 | **14.2** — NLP hint "Save or wait 3 seconds" inconsistent; tied to B3 |
| B6 | **27.4** — Ollama model dropdown selection does not sync back to model name input field |
| B7 | **29.1** — Corpus URL import fails for all URLs due to browser CORS restrictions; error message does not distinguish between CORS block vs 404 |
| B8 | **30.2** — Corpus file upload completely non-functional; fails silently for all file types (.txt, .md, PubMed) |
| B9 | **32.1** — Data loss when dev server port changes (localStorage is origin-scoped); not a production bug but affects development workflow |

### Improvements (should fix)
| ID | Description |
|----|-------------|
| I1 | **5.2** — Article cards show date only; should include time (e.g. "Mar 14, 2026 11:32 PM") |
| I2 | **14.8** — NLP scores junk/random text without any minimum threshold or warning |
| I3 | **20.4** — If no references exist (or none selected for export), show a message instead of downloading an empty `.bib` file |
| I4 | **22.3** — Change Focus Mode duration options from 15, 25, 45, 60, 90 → **15, 30, 45, 60, 90** minutes |
| I5 | **22.5** — Show article title in Focus Mode header (e.g. "Focus Mode — My First Paper") |
| I6 | **23.7** — After ending a focus session, navigate directly back to the editor instead of returning to Focus setup screen |
| I7 | **36.2** — Add thin border/outline and subtle emboss/shadow to buttons to make them more clearly distinguishable |
| I8 | **36.3** — Add minimum responsive breakpoint; layout should reflow gracefully below ~768px instead of showing horizontal scrollbars |
| I9 | **36.5** — Standardise back button label to "← Back" across all pages (Editor currently shows "← Library") |
| I10 | **15.8/Docs** — Add note in Settings and Research panel that Ollama requires no API key and works fully offline |

### Features (new additions)
| ID | Description |
|----|-------------|
| F1 | **13.6** — Add strikethrough toolbar button (`~~text~~`) |
| F2 | **13.6** — Add table insertion toolbar button |
| F3 | **17.4** — Change default shortcode naming from `ref1`, `ref2`... to `author:year` format (e.g. `smith2021`) |
| F4 | **20.2** — Add selective BibTeX export: checkboxes on each reference card + "Select All" option; only export checked references |
| F5 | **21.4** — Global References should display all article references tagged with their article title; becomes a unified view across the app |
| F6 | **23.6** — Redesign Focus Mode: fullscreen with full editor interface intact (writing, NLP, research, refs all available). Timer shows as a small chip in the header. Fullscreen removes browser chrome only. |
| F7 | **Focus** — Add custom session length input (as low as 30s, format: `30s`, `5m`, `25m`) for flexibility and testing |
| F8 | **Focus** — When timer expires, show a non-intrusive nudge/indicator (banner, subtle flash, or sound) without interrupting writing |
| F9 | **30.2** — Add keyword tagging for corpus documents (multiple tags per doc); searchable/filterable for topic collation and regrouping |
| F10 | **36.1** — Add theme selector in Settings: at minimum Dark and Light themes |
| F11 | **Editor** — Add image support: insert images via file upload or URL using standard markdown `![alt](src)` syntax; toolbar button to insert image placeholder; images render correctly in preview mode |

---

## 1. App Startup & Initialisation

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 1.1 | Open http://localhost:5173 in browser | Page loads without blank screen or JS console errors | [P] | |
| 1.2 | Open DevTools → Console | No red errors; sql.js WASM loads silently | [P] | |
| 1.3 | Open DevTools → Application → Local Storage | Key `likhatu_db` exists after first load | [P] | |
| 1.4 | Open DevTools → Application → Local Storage | Key `likhatu-settings` exists | [P] | |
| 1.5 | Verify the Library page is shown as the default route (`/`) | Library page renders with header "Likhatu" | [P] | |

---

## 2. Library Page — Layout & Empty State

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 2.1 | Observe header | Shows: "Likhatu" title, Global Refs, Corpus, Settings buttons, "+ New Article" button | [P] | |
| 2.2 | Observe body with no articles created | Empty-state message: "No articles yet. Click 'New Article' to get started." | [P] | Cache cleared to test |
| 2.3 | Observe search bar | Visible, placeholder text "Search articles..." | [P] | |
| 2.4 | Observe sort dropdown | Visible, default value "Modified" | [P] | |

---

## 3. Library Page — Create Article

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 3.1 | Click "+ New Article" | Immediately navigates to `/editor/<uuid>` | [P] | |
| 3.2 | Click "← Library" in editor | Returns to Library page | [P] | |
| 3.3 | Verify new article appears in library | Article card visible, title shows "Untitled" (italic/grey) | [P] | |
| 3.4 | Observe article card details | Shows "0 words", a modification date, Refs and Focus links, Delete button | [P] | |
| 3.5 | Create a second article | Library shows two article cards | [P] | |

---

## 4. Library Page — Search

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 4.1 | Title one article "Quantum Computing" and return to library | Card shows title "Quantum Computing" | [P] | |
| 4.2 | Type "quantum" in the search bar | Only the "Quantum Computing" article shown (≤300ms debounce) | [P] | |
| 4.3 | Type "zzz" (no match) | Empty list | [P] | |
| 4.4 | Clear the search bar | All articles reappear | [P] | |
| 4.5 | Search for a string that matches article body text | Matching article appears | [P] | |

---

## 5. Library Page — Sort

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 5.1 | Select "Modified" | Articles sorted by `updatedAt` descending | [P] | |
| 5.2 | Select "Created" | Articles sorted by `createdAt` descending | [P] | **I1:** Cards show date only — should include time |
| 5.3 | Select "Word Count" | Articles sorted by word count descending | [P] | |
| 5.4 | Select "Title" | Articles sorted alphabetically A→Z | [P] | |

---

## 6. Library Page — Delete Article

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 6.1 | Click "Delete" on an article card | Shows red "Delete" + "Cancel" confirmation | [P] | |
| 6.2 | Click "Cancel" | Returns to single Delete button; article still present | [P] | |
| 6.3 | Click "Delete" then confirm | Article card disappears | [P] | |
| 6.4 | Reload the page | Deleted article does not reappear | [P] | |

---

## 7. Library Page — Navigation Links

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 7.1 | Click "Global Refs" | Navigates to `/references/__global__` | [P] | |
| 7.2 | Click "Corpus" | Navigates to `/corpus` | [P] | |
| 7.3 | Click "Settings" | Navigates to `/settings` | [P] | |
| 7.4 | Click article card | Navigates to `/editor/<articleId>` | [P] | |
| 7.5 | Click "Refs" on article card | Navigates to `/references/<articleId>` | [P] | |
| 7.6 | Click "Focus" on article card | Navigates to `/focus/<articleId>` | [P] | |

---

## 8. Editor Page — Loading & Header

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 8.1 | Open an article | Header shows: ← Library, title input, word count, Preview, NLP, Research, Refs, Focus | [P] | |
| 8.2 | Verify title placeholder | Shows "Untitled" in dimmed text | [P] | |
| 8.3 | Verify word count | Shows "0 words" for empty article | [P] | |
| 8.4 | Verify CodeMirror editor ready | Cursor visible on click | [P] | |

---

## 9. Editor Page — Title Editing

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 9.1 | Type "My First Paper" in title input | Title updates in real time | [P] | |
| 9.2 | Click "← Library" | Library shows "My First Paper" card | [P] | |
| 9.3 | Reopen the article | Title field shows "My First Paper" (persisted) | [P] | |
| 9.4 | Clear the title | Placeholder "Untitled" shown; library card shows italic "Untitled" | [P] | |

---

## 10. Editor Page — Content Editing

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 10.1 | Type several sentences | Text appears with markdown syntax highlighting | [P] | |
| 10.2 | Wait 3 seconds after typing | Word count in header updates | [P] | |
| 10.3 | Type `# Introduction` | `#` highlighted differently from heading text | [P] | |
| 10.4 | Type `**bold**` | Asterisks highlighted as markdown syntax | [P] | |
| 10.5 | Type a long paragraph | Lines wrap; no horizontal scrollbar | [P] | |

---

## 11. Editor Page — Autosave

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 11.1 | Type content, do NOT click Save | — | [P] | |
| 11.2 | Wait 3 seconds | Content saves automatically | [P] | |
| 11.3 | Reload the page (F5) | Article content and title still present | [P] | |
| 11.4 | Type content, immediately click "← Library" | Save triggers on back navigation | [P] | |
| 11.5 | Return to the article | New content present | [P] | |
| 11.6 | Click manual "Save" button in toolbar | Content saves immediately | [P] | |

---

## 12. Editor Page — Formatting Toolbar

| # | Button | Action | Expected Output | Status | Notes |
|---|--------|--------|-----------------|--------|-------|
| 12.1 | B | "hello" selected | `**hello**` | [P] | |
| 12.2 | B | No selection | `****` inserted | [P] | |
| 12.3 | I | "hello" selected | `_hello_` | [P] | |
| 12.4 | H1 | Cursor at line | `# ` prepended | [P] | |
| 12.5 | H2 | Cursor at line | `## ` prepended | [P] | |
| 12.6 | H3 | Cursor at line | `### ` prepended | [P] | |
| 12.7 | ❝ | Cursor at line | `> ` prepended | [P] | |
| 12.8 | — | Anywhere | `—` inserted | [P] | |
| 12.9 | ^ | Anywhere | `^[ref]` inserted | [P] | |
| 12.10 | ↓ | Anywhere | `[^1]` inserted | [P] | |
| 12.11 | [@] | Anywhere | `[@ref]` inserted | [P] | |
| 12.12 | All buttons | Preview mode | All buttons disabled/dimmed | [P] | |

---

## 13. Editor Page — Preview Mode

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 13.1 | Click "Preview" | Button turns blue; CodeMirror replaced by rendered markdown | [P] | |
| 13.2 | Type `# Hello`, switch to preview | Renders as `<h1>` heading | [F] | **B1:** Headings H1/H2/H3 not rendering |
| 13.3 | Type `**bold**`, switch to preview | Renders in **bold** | [P] | |
| 13.4 | Type `_italic_`, switch to preview | Renders in *italic* | [P] | |
| 13.5 | Type a markdown table, switch to preview | Renders as visual table | [F] | **B2:** Tables not rendering |
| 13.6 | Type `~~strikethrough~~`, switch to preview | Renders with strikethrough | [P] | **F1,F2:** Add strikethrough + table toolbar buttons |
| 13.7 | Click "Edit" to toggle back | CodeMirror editor reappears | [P] | |
| 13.8 | Verify editor content unchanged after toggle | Content matches what was typed | [P] | |

---

## 14. Editor Page — NLP Panel

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 14.1 | Click "NLP" button | Right panel opens "NLP Analysis"; button turns purple | [P] | |
| 14.2 | NLP panel on empty article | "Save or wait 3 seconds for NLP analysis." shown | [F] | **B5:** Hint inconsistent; tied to B3 (content bleed) |
| 14.3 | Type 5+ sentences, wait 3 seconds | Panel shows Readability, Passive Voice, Hedging % | [P] | |
| 14.4 | Check word/sentence count display | e.g. "142 words • 8 sentences" | [F] | **B4:** Word count underreported by ~2 words |
| 14.5 | Write simple short sentences | Readability Grade low (green bar) | [P] | |
| 14.6 | Write complex academic text | Readability Grade higher; bar shifts yellow/red | [P] | |
| 14.7 | Write passive voice sentences | Passive Voice % increases | [P] | |
| 14.8 | Write hedging sentences | Hedging Language % increases | [P] | **I2:** NLP scores junk text without warning |
| 14.9 | Passive 0–14% | Bar green | [P] | |
| 14.10 | Passive 15–29% | Bar yellow | [P] | |
| 14.11 | Passive 30%+ | Bar red | [P] | |
| 14.12 | Click "NLP" again | Panel closes; editor expands | [P] | |

---

## 15. Editor Page — Research Panel

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 15.1 | Click "Research" button | Panel opens "Research Assistant"; button turns green | [P] | |
| 15.2 | Verify source toggles | "Web (AI)" and "Local (Ollama)"; Web selected by default | [P] | |
| 15.3 | Click "Local (Ollama)" | Button becomes active | [P] | |
| 15.4 | Click "Web (AI)" | Returns to Web active | [P] | |
| 15.5 | Empty textarea; observe Ask button | Disabled | [P] | |
| 15.6 | Type a question | Ask button enabled | [P] | |
| 15.7 | Press Ctrl+Enter | Query submitted | [P] | |
| 15.8 | Submit query with valid provider (Ollama) | Response appears | [P] | **I10:** Add note that Ollama needs no API key |
| 15.9 | Submit with no API key | Error message in response area | [P] | |
| 15.10 | Click "Research" again | Panel closes | [P] | |
| 15.11 | Open both NLP and Research panels | Both stack in right sidebar with divider | [P] | |

---

## 16. References Page — Navigation & Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 16.1 | Click "Refs" from editor | Navigates to `/references/<articleId>` | [P] | |
| 16.2 | Observe header | "← Back", "References", "+ Add Manual", "Export BibTeX" | [P] | |
| 16.3 | Empty state | "No references yet. Import a DOI or add manually." | [P] | |
| 16.4 | Click "← Back" | Returns to editor | [P] | |

---

## 17. References Page — DOI Import

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 17.1 | Type `10.1038/nature12373` in DOI field | Field accepts input | [P] | |
| 17.2 | Click Import or press Enter | "Importing..." shown | [P] | |
| 17.3 | Import completes | Reference card with title, authors, journal, year | [P] | |
| 17.4 | Check auto-assigned shortcode | Shows `[ref1]` | [P] | **F3:** Change to author:year format (e.g. `smith2021`) |
| 17.5 | Import same DOI again | Error: "Already exists: '...' (ref1)" | [P] | |
| 17.6 | Import full URL `https://doi.org/10.1126/science.1259855` | Strips prefix; fetches correctly | [P] | |
| 17.7 | Enter fake DOI `10.9999/fake.0000` | Error: "DOI not found (404)" | [P] | |
| 17.8 | Empty DOI field; check Import button | Button disabled | [P] | |
| 17.9 | After successful import | DOI field cleared | [P] | |

---

## 18. References Page — Manual Add & Edit

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 18.1 | Click "+ Add Manual" | Blank reference card with auto shortcode | [P] | |
| 18.2 | Click "Edit" | Expands to edit form with all fields | [P] | |
| 18.3 | Edit Title field | Updates as you type | [P] | |
| 18.4 | Edit Authors with semicolons | Accepts "Smith, J.; Jones, A." | [P] | |
| 18.5 | Edit Shortcode | Accepts custom shortcode | [P] | |
| 18.6 | Click "Save" | Card collapses; updated values shown | [P] | |
| 18.7 | Click "Cancel" | Original values restored | [P] | |
| 18.8 | Reload page | Edited references persist | [P] | |

---

## 19. References Page — Delete

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 19.1 | Click "Delete" | Shows "Confirm" + "Cancel" | [P] | |
| 19.2 | Click "Cancel" | Reference still present | [P] | |
| 19.3 | Click "Delete" then "Confirm" | Reference removed | [P] | |
| 19.4 | Reload page | Deleted reference gone | [P] | |

---

## 20. References Page — BibTeX Export

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 20.1 | Click "Export BibTeX" with references | Downloads `references.bib` | [P] | **F4:** Add selective export with checkboxes |
| 20.2 | Open downloaded `.bib` file | Valid BibTeX format | [P] | |
| 20.3 | Check DOI field in `.bib` | `doi = {10.xxxx/...}` present | [P] | |
| 20.4 | Export with no references | Downloads empty file (no crash) | [P] | **I3:** Show message instead of downloading empty file |

---

## 21. Global References

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 21.1 | Click "Global Refs" from Library | Navigates to `/references/__global__` | [P] | |
| 21.2 | Observe header | Shows "Global References" | [P] | |
| 21.3 | Add reference via DOI | Reference appears | [P] | |
| 21.4 | Check article-specific refs | Global ref does NOT appear in article list | [P] | **F5:** Global Refs should show all article refs tagged by article title |
| 21.5 | Navigate back to Global Refs | Reference still present | [P] | |

---

## 22. Focus Mode — Setup

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 22.1 | Click "Focus" from editor | Navigates to `/focus/<articleId>` | [P] | |
| 22.2 | Observe layout | Header, title, instructions, duration buttons | [P] | |
| 22.3 | Observe duration buttons | 15, 25, 45, 60, 90 min | [P] | **I4:** Change to 15, 30, 45, 60, 90 min |
| 22.4 | Observe browser notes section | Informational text about fullscreen/wake lock | [P] | |
| 22.5 | Click "← Back" | Returns to editor | [P] | **I5:** Show article title in Focus header |

---

## 23. Focus Mode — Session

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 23.1 | Click "15 min" | Transitions to timer view; browser may ask fullscreen permission | [P] | |
| 23.2 | Verify timer UI | Large MM:SS countdown on dark screen | [P] | |
| 23.3 | Wait 2–3 seconds | Timer counts down correctly | [P] | |
| 23.4 | Verify background | Very dark screen with minimal UI | [P] | |
| 23.5 | Observe sub-text | "Focus session in progress. Stay in the zone." | [P] | |
| 23.6 | Click "End Session" | Timer stops; returns to setup screen | [F] | **F6:** Redesign — Focus Mode should show full editor in fullscreen, not blank timer screen |
| 23.7 | Navigate back to editor | Normal editor loads | [P] | **I6:** End session should navigate directly back to editor |
| 23.8 | Click "25 min" | Timer shows 25:00 and counts down | [P] | |

---

## 24. Focus Mode — Completion

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 24.1 | Let timer expire to 00:00 | Transitions to setup screen | [S] | Skipped — retest after Focus Mode redesign |
| 24.2 | Verify completion state | Green banner: "Session complete! Great work." | [S] | Skipped |
| 24.3 | Start new session immediately | Banner disappears; new timer starts | [S] | Skipped |

---

## 25. Settings Page — Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 25.1 | Navigate to Settings | All sections visible | [P] | **F7,F8:** Add custom focus session length + timer nudge |
| 25.2 | Active Provider section | 3 radio buttons; OpenAI default | [P] | |
| 25.3 | OpenAI section | Password input "sk-..." | [P] | |
| 25.4 | Claude section | Password input "sk-ant-..." | [P] | |
| 25.5 | Ollama section | URL, model, Fetch Models button | [P] | |
| 25.6 | Footer note | "Settings stored locally... API keys never leave your device." | [P] | |

---

## 26. Settings Page — Provider Selection & API Keys

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 26.1 | Click "Claude (Anthropic)" radio | Selected | [P] | |
| 26.2 | Click "Ollama (Local)" radio | Selected | [P] | |
| 26.3 | Type in OpenAI field | Shows bullet dots | [P] | |
| 26.4 | Type in Claude field | Shows bullet dots | [P] | |
| 26.5 | Click "Save Settings" | Shows "Saved!" for ~2s | [P] | |
| 26.6 | Reload and check Settings | Values restored from localStorage | [S] | Skipped — no API keys to test |

---

## 27. Settings Page — Ollama Config

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 27.1 | Change Ollama URL | Field accepts custom URL | [P] | |
| 27.2 | Type model name manually | Field updates | [P] | |
| 27.3 | Click "Fetch Models" (Ollama running) | Dropdown populates with models | [P] | |
| 27.4 | Select model from dropdown | Model name input updates | [F] | **B6:** Dropdown selection doesn't sync to input field |
| 27.5 | Invalid URL; click Fetch Models | Error: "Could not reach Ollama: ..." | [P] | |
| 27.6 | Blank URL; click Fetch Models | Nothing happens | [P] | |

---

## 28. Corpus Page — Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 28.1 | Navigate to Corpus | All sections visible | [P] | |
| 28.2 | Info box text | Explains Local (Ollama) usage | [P] | |
| 28.3 | Empty state | "No corpus documents yet..." | [P] | |

---

## 29. Corpus Page — Add from URL

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 29.1 | Enter a URL and click Add | Document appears in list | [F] | **B7:** All URL fetches fail with CORS error; error message doesn't distinguish CORS vs 404 |
| 29.2 | Enter optional title | Used as document name | [S] | Skipped — dependent on 29.1 |
| 29.3 | Click Add | "Fetching..." shown; success | [S] | Skipped |
| 29.4 | Try HTML URL | Tags stripped; plain text stored | [S] | Skipped |
| 29.5 | Try CORS-restricted URL | Error shown | [S] | Confirmed — all URLs fail with CORS |
| 29.6 | Press Enter in URL field | Same as clicking Add | [S] | Skipped |
| 29.7 | Verify document card details | Title, word count, date, source URL | [S] | Skipped |

---

## 30. Corpus Page — Add from File

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 30.1 | Click "Choose Text File" | OS file picker opens | [P] | |
| 30.2 | Select a `.txt` file | Document added; appears in list | [F] | **B8:** File upload fails silently for all types; **F9:** Add keyword tagging for corpus docs |
| 30.3 | Select a `.md` file | Added as plain text | [S] | Skipped — dependent on 30.2 |
| 30.4 | Select a `.csv` file | Added as plain text | [S] | Skipped |
| 30.5 | Select a `.json` file | Added as plain text | [S] | Skipped |
| 30.6 | Verify document in list | Title = filename, word count shown | [S] | Skipped |

---

## 31. Corpus Page — Document Management

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 31.1–31.8 | All document management tests | — | [S] | Skipped — dependent on working file/URL import (B7, B8) |

---

## 32. Data Persistence — Cross-Session

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 32.1 | Close tab entirely, reopen app | Articles and references persist | [P] | Article blank on first open; needs second open. **B3** |
| 32.2 | References persist | References still present | [P] | |
| 32.3 | Settings persist after restart | Provider, Ollama URL/model restored | [P] | |
| 32.4 | Corpus documents persist | Documents still present | [S] | Skipped — file upload broken (B8) |
| 32.5 | Close tab, reopen | All data present | [P] | |
| 32.6 | Check `likhatu_db` key | Present and non-empty | [P] | |
| 32.7 | `likhatu_db` value | Long base64 string | [P] | |

---

## 33. Research Panel — AI Integration

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 33.1–33.7 | OpenAI / Claude tests | — | [S] | Skipped — no API keys |
| 33.8 | Ollama Web (AI) — query submitted | Response streams in | [P] | |
| 33.9 | Ollama Local source — query submitted | Response streams in | [P] | |
| 33.10 | Ollama streaming | Text appears token by token | [P] | |

---

## 34. Navigation — Browser Back/Forward

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 34.1 | Library → Editor → Back | Returns to Library | [P] | |
| 34.2 | Library → Settings → Back | Returns to Library | [P] | |
| 34.3 | Library → Corpus → Back | Returns to Library | [P] | |
| 34.4 | Editor → References → Back | Returns to Editor | [P] | |
| 34.5 | Editor → Focus → Back | Returns to Editor | [P] | |
| 34.6 | Forward after Back | Navigates forward correctly | [P] | |

---

## 35. Edge Cases & Error Handling

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 35.1 | Navigate to `/editor/nonexistentid` | Loads without crash | [P] | |
| 35.2 | Navigate to `/references/nonexistentid` | Loads without crash | [P] | Shows empty editor |
| 35.3 | Clear localStorage, reload | Fresh DB initialised; no crash | [P] | |
| 35.4 | Empty research query + Ctrl+Enter | Nothing happens | [P] | |
| 35.5 | NLP panel on empty article | Hint message shown | [P] | |
| 35.6 | DOI import with no internet | Error displayed; no crash | [P] | |
| 35.7 | Corpus URL import with no internet | Error: "Failed to fetch URL..." | [P] | |
| 35.8 | Resize browser window | Layout reflows | [P] | **I8:** Below ~768px shows scrollbars instead of reflowing |
| 35.9 | App open in two tabs | Both work independently | [P] | |

---

## 36. Visual & UX Checks

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 36.1 | Dark theme across all pages | Consistent dark background | [P] | **F10:** Add Light/Dark theme selector in Settings |
| 36.2 | Hover over all buttons | Hover state visible | [P] | **I7:** Add thin outline + emboss to buttons |
| 36.3 | Disabled buttons | Dimmed; cursor `not-allowed` | [P] | **I8:** Min responsive breakpoint needed |
| 36.4 | Placeholder text in all inputs | Readable grey placeholders | [P] | |
| 36.5 | "← Back" buttons across all pages | Consistent style and function | [P] | **I9:** Editor shows "← Library" instead of "← Back" |
| 36.6 | Both NLP + Research panels open | Both visible without overflow | [P] | |
| 36.7 | Tab key navigation | Keyboard focus visible | [P] | |

---

## Test Run Summary

| Section | Total | Pass | Fail | Skip |
|---------|-------|------|------|------|
| 1. Startup | 5 | 5 | 0 | 0 |
| 2. Library Layout | 4 | 4 | 0 | 0 |
| 3. Create Article | 5 | 5 | 0 | 0 |
| 4. Search | 5 | 5 | 0 | 0 |
| 5. Sort | 4 | 4 | 0 | 0 |
| 6. Delete | 4 | 4 | 0 | 0 |
| 7. Navigation | 6 | 6 | 0 | 0 |
| 8. Editor Loading | 4 | 4 | 0 | 0 |
| 9. Title Editing | 4 | 4 | 0 | 0 |
| 10. Content Editing | 5 | 5 | 0 | 0 |
| 11. Autosave | 6 | 6 | 0 | 0 |
| 12. Toolbar | 12 | 12 | 0 | 0 |
| 13. Preview | 8 | 6 | 2 | 0 |
| 14. NLP Panel | 12 | 9 | 3 | 0 |
| 15. Research Panel | 11 | 11 | 0 | 0 |
| 16. References Layout | 4 | 4 | 0 | 0 |
| 17. DOI Import | 9 | 9 | 0 | 0 |
| 18. Manual Add/Edit | 8 | 8 | 0 | 0 |
| 19. Delete Reference | 4 | 4 | 0 | 0 |
| 20. BibTeX Export | 4 | 4 | 0 | 0 |
| 21. Global References | 5 | 5 | 0 | 0 |
| 22. Focus Setup | 5 | 5 | 0 | 0 |
| 23. Focus Session | 8 | 7 | 1 | 0 |
| 24. Focus Completion | 3 | 0 | 0 | 3 |
| 25. Settings Layout | 6 | 6 | 0 | 0 |
| 26. Provider/Keys | 6 | 5 | 0 | 1 |
| 27. Ollama Config | 6 | 5 | 1 | 0 |
| 28. Corpus Layout | 3 | 3 | 0 | 0 |
| 29. Corpus URL | 7 | 0 | 1 | 6 |
| 30. Corpus File | 6 | 1 | 1 | 4 |
| 31. Corpus Mgmt | 8 | 0 | 0 | 8 |
| 32. Persistence | 7 | 6 | 0 | 1 |
| 33. AI Integration | 10 | 3 | 0 | 7 |
| 34. Navigation | 6 | 6 | 0 | 0 |
| 35. Edge Cases | 9 | 9 | 0 | 0 |
| 36. Visual/UX | 7 | 7 | 0 | 0 |
| **Total** | **196** | **166** | **9** | **30** |

---

## Known Limitations (as built)

- **Embeddings not computed:** Corpus documents stored as plain text only; no ONNX/Transformers.js pipeline active. "Embedded" badge will never appear. Local research sends full document text as context to Ollama.
- **PDF import not implemented:** Only `.txt`, `.md`, `.csv`, `.json` accepted in Corpus (currently broken — see B8).
- **PubMed import not implemented:** No `.nbib` parser in web version yet.
- **Ollama CORS:** Streaming works correctly when Ollama CORS is configured (`OLLAMA_ORIGINS=*`).
- **Focus Mode fullscreen:** Requires browser supporting Fullscreen API (Chrome/Edge). Degrades silently in unsupported browsers.
- **Wake Lock:** Only available in Chrome/Edge on HTTPS or localhost.
- **Citation rendering in preview:** `[@ref:shortcode]` not yet resolved in preview pane (shown as raw text).
- **Corpus URL import:** Blocked by browser CORS for most external URLs. File upload currently non-functional (B8).

---

*Test run completed: 2026-03-14 · Commit `a397a9f` · likhatu_webapp*
*Results: 166 Pass · 9 Fail · 30 Skip out of 196 tests*
