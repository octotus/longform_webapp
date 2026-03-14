# Longform Web App — Full Feature Test Plan

**App URL:** http://localhost:5173
**Last updated:** 2026-03-14
**Status legend:** `[ ]` Not tested · `[P]` Pass · `[F]` Fail · `[S]` Skip · `[B]` Bug filed

---

## How to Use This File

- Work through each section in order on first pass
- Mark each test case with a status symbol
- Add notes in the **Notes** column for failures or unexpected behaviour
- Re-run `[F]` tests after a fix is applied; update status to `[P]` or keep `[F]`

---

## 1. App Startup & Initialisation

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 1.1 | Open http://localhost:5173 in browser | Page loads without blank screen or JS console errors | [ ] | |
| 1.2 | Open DevTools → Console | No red errors; sql.js WASM loads silently | [ ] | |
| 1.3 | Open DevTools → Application → Local Storage | Key `longform_db` exists after first load | [ ] | |
| 1.4 | Open DevTools → Application → Local Storage | Key `longform-settings` exists | [ ] | |
| 1.5 | Verify the Library page is shown as the default route (`/`) | Library page renders with header "Longform" | [ ] | |

---

## 2. Library Page — Layout & Empty State

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 2.1 | Observe header | Shows: "Longform" title, Global Refs, Corpus, Settings buttons, "+ New Article" button | [ ] | |
| 2.2 | Observe body with no articles created | Empty-state message: "No articles yet. Click 'New Article' to get started." | [ ] | |
| 2.3 | Observe search bar | Visible, placeholder text "Search articles..." | [ ] | |
| 2.4 | Observe sort dropdown | Visible, default value "Modified" | [ ] | |

---

## 3. Library Page — Create Article

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 3.1 | Click "+ New Article" | Immediately navigates to `/editor/<uuid>` | [ ] | |
| 3.2 | Click "← Library" in editor | Returns to Library page | [ ] | |
| 3.3 | Verify new article appears in library | Article card visible, title shows "Untitled" (italic/grey) | [ ] | |
| 3.4 | Observe article card details | Shows "0 words", a modification date, Refs and Focus links, Delete button | [ ] | |
| 3.5 | Create a second article | Library shows two article cards | [ ] | |

---

## 4. Library Page — Search

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 4.1 | In the editor, title one article "Quantum Computing" and return to library | Card shows title "Quantum Computing" | [ ] | |
| 4.2 | Type "quantum" in the search bar | Only the "Quantum Computing" article is shown (≤300 ms debounce) | [ ] | |
| 4.3 | Type "zzz" (no match) | Empty state: "No articles yet" or equivalent empty list | [ ] | |
| 4.4 | Clear the search bar | All articles reappear | [ ] | |
| 4.5 | Type a string that matches article body text (not title) | Matching article appears (search covers contentMd) | [ ] | |

---

## 5. Library Page — Sort

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 5.1 | Select "Modified" from sort dropdown | Articles sorted by `updatedAt` descending (most recently modified first) | [ ] | |
| 5.2 | Select "Created" | Articles sorted by `createdAt` descending | [ ] | |
| 5.3 | Select "Word Count" | Articles sorted by word count descending | [ ] | |
| 5.4 | Select "Title" | Articles sorted alphabetically A→Z by title | [ ] | |

---

## 6. Library Page — Delete Article

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 6.1 | Click "Delete" on an article card | Button changes to red "Delete" + "Cancel" confirmation pair | [ ] | |
| 6.2 | Click "Cancel" | Returns to single Delete button; article still present | [ ] | |
| 6.3 | Click "Delete" then confirm | Article card disappears; library list updates | [ ] | |
| 6.4 | Reload the page | Deleted article does not reappear | [ ] | |

---

## 7. Library Page — Navigation Links

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 7.1 | Click "Global Refs" | Navigates to `/references/__global__` (Global References page) | [ ] | |
| 7.2 | Click "Corpus" | Navigates to `/corpus` | [ ] | |
| 7.3 | Click "Settings" | Navigates to `/settings` | [ ] | |
| 7.4 | Click article title / card | Navigates to `/editor/<articleId>` | [ ] | |
| 7.5 | Click "Refs" on article card | Navigates to `/references/<articleId>` | [ ] | |
| 7.6 | Click "Focus" on article card | Navigates to `/focus/<articleId>` | [ ] | |

---

## 8. Editor Page — Loading & Header

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 8.1 | Open an article | Header shows: "← Library", title input, word count, Preview, NLP, Research, Refs, Focus buttons | [ ] | |
| 8.2 | Verify title input is empty / shows placeholder "Untitled" for a new article | Placeholder visible in dimmed text | [ ] | |
| 8.3 | Verify word count chip shows "0 words" for empty article | Correct count displayed | [ ] | |
| 8.4 | Verify CodeMirror editor is focused and ready | Cursor visible in the editor area | [ ] | |

---

## 9. Editor Page — Title Editing

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 9.1 | Click the title input and type "My First Paper" | Title updates in real time in the input field | [ ] | |
| 9.2 | Navigate to Library (click ← Library) | Library shows card with title "My First Paper" | [ ] | |
| 9.3 | Re-open the article | Title field shows "My First Paper" (persisted) | [ ] | |
| 9.4 | Clear the title entirely | Input shows placeholder "Untitled"; library shows italic "Untitled" | [ ] | |

---

## 10. Editor Page — Content Editing

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 10.1 | Click into the editor and type several sentences | Text appears in CodeMirror with markdown syntax highlighting | [ ] | |
| 10.2 | Wait 3 seconds without typing | Word count in header updates to reflect typed content | [ ] | |
| 10.3 | Type "# Introduction" and press Enter | Heading syntax `#` is highlighted differently from body text | [ ] | |
| 10.4 | Type `**bold**` | Asterisks highlighted as markdown bold syntax | [ ] | |
| 10.5 | Type a long paragraph | Editor wraps lines (no horizontal scrollbar within editor area) | [ ] | |

---

## 11. Editor Page — Autosave

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 11.1 | Type content in the editor | Do NOT click Save manually | [ ] | |
| 11.2 | Wait 3 seconds | Content saves automatically (no visible save indicator needed; test by reload) | [ ] | |
| 11.3 | Reload the page (`F5`) | Article content and title are still present | [ ] | |
| 11.4 | Type more content, immediately click "← Library" | Save triggers on back navigation (saveNow() called) | [ ] | |
| 11.5 | Return to the article | New content is present | [ ] | |
| 11.6 | Click the manual "Save" button in the toolbar | Content saves immediately (confirm via reload) | [ ] | |

---

## 12. Editor Page — Formatting Toolbar

For each button: place cursor in editor (or select text), click the button, observe output.

| # | Button | Action | Expected Output in Editor | Status | Notes |
|---|--------|--------|--------------------------|--------|-------|
| 12.1 | **B** | With "hello" selected | `**hello**` wraps selection | [ ] | |
| 12.2 | **B** | No selection | `****` inserted, cursor between | [ ] | |
| 12.3 | **I** | With "hello" selected | `_hello_` wraps selection | [ ] | |
| 12.4 | **H1** | Cursor at line start | `# ` prepended | [ ] | |
| 12.5 | **H2** | Cursor at line start | `## ` prepended | [ ] | |
| 12.6 | **H3** | Cursor at line start | `### ` prepended | [ ] | |
| 12.7 | **"** (blockquote) | Cursor at line start | `> ` prepended | [ ] | |
| 12.8 | **—** | Anywhere | Em dash `—` inserted at cursor | [ ] | |
| 12.9 | **^** | Anywhere | `^[ref]` inserted | [ ] | |
| 12.10 | **↓** | Anywhere | `[^1]` inserted | [ ] | |
| 12.11 | **[@]** | Anywhere | `[@ref]` inserted | [ ] | |
| 12.12 | All toolbar buttons | While in Preview mode | Buttons are disabled (dimmed, not clickable) | [ ] | |

---

## 13. Editor Page — Preview Mode

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 13.1 | Click "Preview" button | Button turns blue/active; CodeMirror replaced by rendered markdown | [ ] | |
| 13.2 | Type `# Hello` in editor, switch to preview | "Hello" renders as an `<h1>` heading | [ ] | |
| 13.3 | Type `**bold**`, switch to preview | "bold" renders in **bold** | [ ] | |
| 13.4 | Type `_italic_`, switch to preview | "italic" renders in *italic* | [ ] | |
| 13.5 | Type a markdown table, switch to preview | Table renders visually (remark-gfm) | [ ] | |
| 13.6 | Type `~~strikethrough~~`, switch to preview | Text renders with strikethrough | [ ] | |
| 13.7 | Click "Edit" (toggle back) | Button returns to inactive; CodeMirror editor reappears | [ ] | |
| 13.8 | Verify editor content is unchanged after toggling | Content matches what was typed | [ ] | |

---

## 14. Editor Page — NLP Panel

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 14.1 | Click "NLP" button | Right panel opens with header "NLP Analysis"; button turns purple | [ ] | |
| 14.2 | NLP panel shows without any article content saved | "Save or wait 3 seconds for NLP analysis." hint shown | [ ] | |
| 14.3 | Type 5+ sentences, wait 3 seconds | NLP panel updates with: Readability Grade, Passive Voice %, Hedging Language % | [ ] | |
| 14.4 | Verify word count and sentence count shown | e.g. "142 words • 8 sentences" | [ ] | |
| 14.5 | Write simple short sentences (e.g. "The cat sat.") | Readability Grade is low (green bar) | [ ] | |
| 14.6 | Write complex academic text | Readability Grade is higher; bar shifts toward yellow/red | [ ] | |
| 14.7 | Write passive voice sentences (e.g. "The data was collected by researchers.") | Passive Voice % increases | [ ] | |
| 14.8 | Write hedging sentences (e.g. "The results might suggest…") | Hedging Language % increases | [ ] | |
| 14.9 | Passive voice 0–14% | Bar is green | [ ] | |
| 14.10 | Passive voice 15–29% | Bar is yellow | [ ] | |
| 14.11 | Passive voice 30%+ | Bar is red | [ ] | |
| 14.12 | Click "NLP" button again | Panel closes; editor expands to full width | [ ] | |

---

## 15. Editor Page — Research Panel

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 15.1 | Click "Research" button | Right panel opens with "Research Assistant"; button turns green | [ ] | |
| 15.2 | Verify two source toggle buttons: "Web (AI)" and "Local (Ollama)" | Both buttons visible; "Web (AI)" selected by default | [ ] | |
| 15.3 | Click "Local (Ollama)" | Button becomes active (blue highlight) | [ ] | |
| 15.4 | Click "Web (AI)" | Returns to Web (AI) active | [ ] | |
| 15.5 | Leave textarea empty; observe "Ask" button | "Ask" button is disabled | [ ] | |
| 15.6 | Type a question in the textarea | "Ask" button becomes enabled | [ ] | |
| 15.7 | Press Ctrl+Enter in the textarea | Submits the query (same as clicking Ask) | [ ] | |
| 15.8 | Submit a query (with valid API key in Settings) | "Thinking..." shows while loading; response appears in panel below | [ ] | |
| 15.9 | Submit a query with no API key configured | Error message appears in the response area | [ ] | |
| 15.10 | Click "Research" again | Panel closes | [ ] | |
| 15.11 | Open both NLP and Research panels simultaneously | Both panels stack in right sidebar with divider | [ ] | |

---

## 16. References Page — Navigation & Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 16.1 | Click "Refs" from editor header | Navigates to `/references/<articleId>` | [ ] | |
| 16.2 | Observe header | Shows "← Back", "References" title, "+ Add Manual", "Export BibTeX" buttons | [ ] | |
| 16.3 | Observe body with no references | "No references yet. Import a DOI or add manually." | [ ] | |
| 16.4 | Click "← Back" | Returns to previous page | [ ] | |

---

## 17. References Page — DOI Import

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 17.1 | Type a valid DOI in import field: `10.1038/nature12373` | Field accepts input | [ ] | |
| 17.2 | Click "Import" or press Enter | "Importing..." shows while fetching | [ ] | |
| 17.3 | Verify import success | Reference card appears with title, authors, journal, year populated from Crossref | [ ] | |
| 17.4 | Verify shortcode auto-assigned | Reference shows `[ref1]` shortcode | [ ] | |
| 17.5 | Try to import the same DOI again | Error: "Already exists: '...' (ref1)" | [ ] | |
| 17.6 | Type a full DOI URL: `https://doi.org/10.1126/science.1259855` | Import strips the prefix and fetches correctly | [ ] | |
| 17.7 | Enter an invalid/fake DOI: `10.9999/fake.0000` | Error: "DOI not found (404)" | [ ] | |
| 17.8 | Enter a blank DOI field and click Import | Nothing happens (button disabled) | [ ] | |
| 17.9 | Verify DOI field clears after successful import | DOI input is empty | [ ] | |

---

## 18. References Page — Manual Add & Edit

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 18.1 | Click "+ Add Manual" | A new blank reference card appears with `[ref#]` shortcode | [ ] | |
| 18.2 | Click "Edit" on a reference card | Card expands to edit form with all fields: Shortcode, Year, Title, Authors, Journal, Volume, Issue, Pages, DOI, URL | [ ] | |
| 18.3 | Edit the "Title" field | Field updates as you type | [ ] | |
| 18.4 | Edit the "Authors" field | Accepts semicolon-separated format: "Smith, J.; Jones, A." | [ ] | |
| 18.5 | Edit the "Shortcode" field | Accepts custom shortcode | [ ] | |
| 18.6 | Click "Save" on the edit form | Card collapses; updated values shown in collapsed view | [ ] | |
| 18.7 | Click "Cancel" on the edit form | Card collapses; original values restored (no changes saved) | [ ] | |
| 18.8 | Reload the page | Edited references persist | [ ] | |

---

## 19. References Page — Delete

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 19.1 | Click "Delete" on a reference card | Shows "Confirm" + "Cancel" buttons | [ ] | |
| 19.2 | Click "Cancel" | Returns to single "Delete" button; reference still present | [ ] | |
| 19.3 | Click "Delete" then "Confirm" | Reference card removed from list | [ ] | |
| 19.4 | Reload page | Deleted reference does not return | [ ] | |

---

## 20. References Page — BibTeX Export

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 20.1 | With at least one reference present, click "Export BibTeX" | Browser triggers download of `references.bib` | [ ] | |
| 20.2 | Open the downloaded `.bib` file | Valid BibTeX format: `@article{shortcode, author = {...}, ...}` | [ ] | |
| 20.3 | Verify DOI field is included | `doi = {10.xxxx/...}` present for DOI-imported refs | [ ] | |
| 20.4 | Export with no references | Downloads empty file (no crash) | [ ] | |

---

## 21. Global References

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 21.1 | Click "Global Refs" from Library | Navigates to `/references/__global__` | [ ] | |
| 21.2 | Observe header | Shows "Global References" (not just "References") | [ ] | |
| 21.3 | Add a reference here via DOI | Reference appears | [ ] | |
| 21.4 | Navigate to a specific article's References page | Global reference does NOT appear in the article-specific list | [ ] | |
| 21.5 | Navigate back to Global Refs | Reference is still there | [ ] | |

---

## 22. Focus Mode — Setup

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 22.1 | Click "Focus" from editor header | Navigates to `/focus/<articleId>` | [ ] | |
| 22.2 | Observe layout | Header with "← Back" and "Focus Mode" title; main area has title + instructions | [ ] | |
| 22.3 | Observe duration grid | 5 buttons: 15 min, 25 min, 45 min, 60 min, 90 min | [ ] | |
| 22.4 | Observe browser notes section | Informational text about fullscreen and wake lock shown | [ ] | |
| 22.5 | Click "← Back" | Returns to editor for the same article | [ ] | |

---

## 23. Focus Mode — Session

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 23.1 | Click "15 min" | Page transitions to fullscreen timer view; browser may ask permission for fullscreen | [ ] | |
| 23.2 | Verify timer UI | Large monospace countdown in `MM:SS` format (e.g. `15:00`) visible | [ ] | |
| 23.3 | Wait 2 seconds | Timer counts down: `14:58`, `14:57`, etc. | [ ] | |
| 23.4 | Verify background | Very dark screen (`bg-gray-950`) with minimal UI | [ ] | |
| 23.5 | Observe sub-text | "Focus session in progress. Stay in the zone." | [ ] | |
| 23.6 | Click "End Session" | Timer stops; returns to Focus setup screen | [ ] | |
| 23.7 | After ending, navigate back to editor | Normal editor view loads | [ ] | |
| 23.8 | Click "25 min" | Timer shows `25:00` and counts down | [ ] | |

---

## 24. Focus Mode — Completion

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 24.1 | (Requires manual test or shortening timer) Let timer expire to `00:00` | Timer reaches zero; transitions to setup screen | [ ] | |
| 24.2 | Verify completion state | Green banner: "Session complete! Great work." shown | [ ] | |
| 24.3 | Start a new session immediately | Green banner disappears; new timer starts | [ ] | |

---

## 25. Settings Page — Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 25.1 | Navigate to Settings | Page shows: Active AI Provider section, OpenAI section, Claude section, Ollama section, Save button | [ ] | |
| 25.2 | Verify Active Provider section | Three radio buttons: OpenAI, Claude (Anthropic), Ollama (Local); "OpenAI" selected by default | [ ] | |
| 25.3 | Verify OpenAI section | Password input with placeholder "sk-..." | [ ] | |
| 25.4 | Verify Claude section | Password input with placeholder "sk-ant-..." | [ ] | |
| 25.5 | Verify Ollama section | URL input (default: `http://localhost:11434`), model name input (default: `llama3.2`), "Fetch Models" button | [ ] | |
| 25.6 | Verify footer note | "Settings are stored locally in your browser via localStorage. API keys never leave your device." | [ ] | |

---

## 26. Settings Page — Provider Selection & API Keys

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 26.1 | Click "Claude (Anthropic)" radio | Radio becomes selected | [ ] | |
| 26.2 | Click "Ollama (Local)" radio | Radio becomes selected | [ ] | |
| 26.3 | Type a key into OpenAI field | Field shows bullet dots (password type) | [ ] | |
| 26.4 | Type a key into Claude field | Field shows bullet dots | [ ] | |
| 26.5 | Click "Save Settings" | Button shows "Saved!" for ~2 seconds, then returns to "Save Settings" | [ ] | |
| 26.6 | Reload the page and navigate to Settings | Previously entered values are restored from localStorage | [ ] | |

---

## 27. Settings Page — Ollama Config

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 27.1 | Change Ollama URL field | Accepts custom URL | [ ] | |
| 27.2 | Type a model name manually | Model name field updates | [ ] | |
| 27.3 | Click "Fetch Models" with Ollama running on localhost | Shows "..." while fetching; populates dropdown with model names | [ ] | |
| 27.4 | Select a model from the dropdown | Model name input updates to selected model | [ ] | |
| 27.5 | Click "Fetch Models" with invalid URL | Error: "Could not reach Ollama: ..." | [ ] | |
| 27.6 | Click "Fetch Models" when URL is blank | Nothing happens (button disabled or no request made) | [ ] | |

---

## 28. Corpus Page — Layout

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 28.1 | Navigate to Corpus from Library | Page shows: header, About the Corpus info box, Add from URL section, Add from File section, Documents list | [ ] | |
| 28.2 | Verify info box text | Explains corpus is used with "Local (Ollama)" research source | [ ] | |
| 28.3 | Empty state for documents | "No corpus documents yet. Add a URL or upload a text file." | [ ] | |

---

## 29. Corpus Page — Add from URL

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 29.1 | Enter a URL that returns plain text (e.g. a `.txt` raw file) | URL field accepts input | [ ] | |
| 29.2 | Enter optional title in the Title field | Title will be used instead of URL as the document name | [ ] | |
| 29.3 | Click "Add" | "Fetching..." shows; on success document appears in list | [ ] | |
| 29.4 | Try a URL that returns HTML (e.g. a Wikipedia page) | HTML tags are stripped; plain text stored | [ ] | |
| 29.5 | Try a URL with CORS restrictions | Error: "Failed to fetch URL: ... Try a local file instead" | [ ] | |
| 29.6 | Press Enter in URL field | Same as clicking Add | [ ] | |
| 29.7 | Verify document card shows: title, word count, date added, source URL link | All fields present | [ ] | |

---

## 30. Corpus Page — Add from File

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 30.1 | Click "Choose Text File" | OS file picker opens | [ ] | |
| 30.2 | Select a `.txt` file | File is read; document added; appears in list with filename as title | [ ] | |
| 30.3 | Select a `.md` file | Markdown file added (raw text stored) | [ ] | |
| 30.4 | Select a `.csv` file | CSV file added as plain text | [ ] | |
| 30.5 | Select a `.json` file | JSON file added as plain text | [ ] | |
| 30.6 | Verify document in list after file upload | Title = filename, word count shown, no source URL | [ ] | |

---

## 31. Corpus Page — Document Management

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 31.1 | Add multiple documents | All appear in the list ordered by date added (newest first) | [ ] | |
| 31.2 | Document count in heading | "3 Documents" (pluralised correctly) | [ ] | |
| 31.3 | Document with no embedding | No "embedded" badge shown | [ ] | |
| 31.4 | Click "Delete" on a document | "Delete" + "Cancel" confirmation appears | [ ] | |
| 31.5 | Click "Cancel" on delete | Document remains; single Delete button restored | [ ] | |
| 31.6 | Confirm delete | Document removed from list | [ ] | |
| 31.7 | Reload page | Remaining documents still present; deleted document gone | [ ] | |
| 31.8 | Click a source URL link | Opens URL in new tab | [ ] | |

---

## 32. Data Persistence — Cross-Session

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 32.1 | Create 3 articles with distinct titles and content | All appear in library | [ ] | |
| 32.2 | Add references to one article | References saved | [ ] | |
| 32.3 | Configure Settings (API key, provider, Ollama URL) | Settings saved | [ ] | |
| 32.4 | Add a corpus document | Document saved | [ ] | |
| 32.5 | Close the browser tab entirely | — | [ ] | |
| 32.6 | Reopen http://localhost:5173 | All articles, references, settings, and corpus documents still present | [ ] | |
| 32.7 | Open DevTools → Application → Local Storage → `longform_db` | Key present and non-empty (base64 string) | [ ] | |

---

## 33. Research Panel — AI Integration (requires API key)

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 33.1 | Set OpenAI key in Settings, set provider to OpenAI | Key saved | [ ] | |
| 33.2 | Open an article with some content | — | [ ] | |
| 33.3 | Open Research panel, select "Web (AI)" | Panel open, Web selected | [ ] | |
| 33.4 | Type "What is quantum entanglement?" and click Ask | Loading state "Thinking..." | [ ] | |
| 33.5 | Response received | Text response appears in the panel response area | [ ] | |
| 33.6 | Set provider to Claude, enter Claude API key | Key saved | [ ] | |
| 33.7 | Ask same question via Claude | Response appears from Claude | [ ] | |
| 33.8 | Set provider to Ollama (with Ollama running) | — | [ ] | |
| 33.9 | Ask question via Ollama | Response streams token by token into the panel | [ ] | |
| 33.10 | Select "Local (Ollama)" source, ask a question | Sends query to Ollama with Local source (same behaviour as Ollama provider) | [ ] | |

---

## 34. Navigation — Browser Back/Forward

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 34.1 | Library → Editor → press browser Back | Returns to Library | [ ] | |
| 34.2 | Library → Settings → press browser Back | Returns to Library | [ ] | |
| 34.3 | Library → Corpus → press browser Back | Returns to Library | [ ] | |
| 34.4 | Editor → References → press browser Back | Returns to Editor | [ ] | |
| 34.5 | Editor → Focus → press browser Back | Returns to Editor | [ ] | |
| 34.6 | Use browser Forward after going back | Navigates forward correctly | [ ] | |

---

## 35. Edge Cases & Error Handling

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 35.1 | Navigate to `/editor/nonexistentid` directly | Page loads without crash (article shows empty or gracefully handles missing ID) | [ ] | |
| 35.2 | Navigate to `/references/nonexistentid` | Page loads without crash | [ ] | |
| 35.3 | Clear localStorage manually (DevTools → Application → Clear Site Data) then reload | App reinitialises fresh DB without crash | [ ] | |
| 35.4 | Submit empty research query via Ctrl+Enter | Nothing happens (button was disabled) | [ ] | |
| 35.5 | Open NLP panel when article is empty | "Save or wait 3 seconds for NLP analysis." hint shown | [ ] | |
| 35.6 | Import DOI with no internet connection | Error displayed; no crash | [ ] | |
| 35.7 | Add corpus document from URL with no internet | Error displayed: "Failed to fetch URL..." | [ ] | |
| 35.8 | Resize browser window while editor is open | Layout reflows; no overflow or missing elements | [ ] | |
| 35.9 | Open app in a second tab simultaneously | Both tabs work independently (each reads from same localStorage) | [ ] | |

---

## 36. Visual & UX Checks

| # | Step | Expected Result | Status | Notes |
|---|------|-----------------|--------|-------|
| 36.1 | Verify dark theme is consistent across all pages | All pages use `bg-gray-900` / `bg-gray-800` background | [ ] | |
| 36.2 | Hover over all buttons | Hover state visible (color change) | [ ] | |
| 36.3 | Check all disabled buttons | Visually dimmed; cursor shows `not-allowed` | [ ] | |
| 36.4 | Check placeholder text in all inputs | Readable grey placeholder text in all fields | [ ] | |
| 36.5 | Check all "← Back" buttons | Consistent style and function across all pages | [ ] | |
| 36.6 | Open editor, then open both NLP + Research panels | Layout doesn't overflow; both panels visible | [ ] | |
| 36.7 | Check focus/focus-outline on interactive elements | Keyboard focus visible (accessibility) | [ ] | |

---

## Test Run Summary

| Section | Total Tests | Pass | Fail | Skip | Not Run |
|---------|-------------|------|------|------|---------|
| 1. Startup | 5 | | | | 5 |
| 2–7. Library | 28 | | | | 28 |
| 8–15. Editor | 50 | | | | 50 |
| 16–21. References | 26 | | | | 26 |
| 22–24. Focus | 13 | | | | 13 |
| 25–27. Settings | 17 | | | | 17 |
| 28–31. Corpus | 18 | | | | 18 |
| 32. Persistence | 7 | | | | 7 |
| 33. AI Integration | 10 | | | | 10 |
| 34. Navigation | 6 | | | | 6 |
| 35. Edge Cases | 9 | | | | 9 |
| 36. Visual/UX | 7 | | | | 7 |
| **Total** | **196** | | | | **196** |

---

## Known Limitations (as built)

- **Embeddings not computed:** Corpus documents are stored as plain text; no ONNX/Transformers.js embedding pipeline is active yet. The "embedded" badge will never appear. Local research sends full document text as context to Ollama.
- **PDF import not implemented:** Only `.txt`, `.md`, `.csv`, `.json` files are accepted in Corpus.
- **PubMed import not implemented:** No `.nbib` parser in the web version yet.
- **Ollama streaming:** Tokens stream correctly only if Ollama CORS is configured (`OLLAMA_ORIGINS=*`).
- **Focus Mode fullscreen:** Requires a browser that supports the Fullscreen API (Chrome/Edge). Will degrade silently in unsupported browsers.
- **Wake Lock:** Only available in Chrome/Edge on HTTPS or localhost.
- **Citation rendering in preview:** `[@ref:shortcode]` is not yet resolved in the preview pane (shown as raw text).

---

*Generated for commit `c3dd305` · longform_webapp*
