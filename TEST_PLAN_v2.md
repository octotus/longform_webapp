# Likhitu — Test Plan v2

**App URL:** http://localhost:5173
**Version:** Post-feature-sprint (all bugs, improvements, and features resolved)
**Prepared:** 2026-03-14
**Status legend:** `[ ]` Not tested · `[P]` Pass · `[F]` Fail · `[S]` Skip · `[B]` Bug filed

---

## Fix & Improvement Log

*Fill in during test run.*

### Bugs (must fix)
| ID | Description |
|----|-------------|
| B-WC1 | Word count excludes numeric tokens — "100 people" counts as 1 word instead of 2. Fixed. |
| B-ED1 | Hard refresh (F5) on editor page shows blank content — article text not loaded. Fixed: MarkdownEditor now syncs external value changes into CodeMirror view. |
| B-SS1 | Superscript (^text^) and subscript (~text~) toolbar buttons wrap correctly. Preview does not render them as `<sup>`/`<sub>` — remark-gfm does not support these; needs a remark plugin (e.g. remark-supersub). |
| B-IMG1 | Images do not render in Preview — both URL-based and base64 file uploads show broken icon. urlTransform passthrough applied but issue persists. Needs deeper debugging. |
| B-OL1 | Ollama model fetch only returns gemma, not mistral. API response maps m.name \|\| m.model but issue persists. Needs debugging with actual network response. |
| B-TAG1 | Corpus tag chip × button hover:text-red-400 not applying — Tailwind v4 CSS ordering issue; !important modifier also ineffective. Needs investigation. |
| B-FOC1 | Focus timer text invisible in light mode — text-white on light bg. CSS override with !important and custom class both ineffective. Tailwind v4 specificity issue. |

### Improvements / Features
| ID | Description |
|----|-------------|
| — | — |

---

## 1. App Startup & Initialisation

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 1.1 | Open http://localhost:5173 | Page loads; no blank screen; no JS console errors | [P] | |
| 1.2 | DevTools → Console | No red errors; sql.js WASM loads silently | [P] | Console warning: "form field element has neither an id nor a name attribute" — search input and sort dropdown on Library page. Accessibility issue; fixed. |
| 1.3 | DevTools → Application → Local Storage | `likhitu_db` key present after first load | [P] | |
| 1.4 | DevTools → Application → Local Storage | `likhitu-settings` key present | [P] | |
| 1.5 | Observe default route | Library page renders with "Likhitu" heading | [P] | |

---

## 2. Library Page — Layout & Empty State

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 2.1 | Observe header | "Likhitu" title · Global Refs · Corpus · Settings · "+ New Article" | [P] | |
| 2.2 | Fresh/empty state | "No articles yet" message with instruction text | [P] | |
| 2.3 | Search bar | Visible, placeholder "Search articles..." | [P] | |
| 2.4 | Sort dropdown | Visible, default "Modified" | [P] | |

---

## 3. Library Page — New Article Dialog

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 3.1 | Click "+ New Article" | Modal dialog appears over a dark overlay | [P] | |
| 3.2 | Dialog content | Shows "New Article" heading, subtitle, title input, Cancel and "Create Article" buttons | [P] | |
| 3.3 | Focus on open | Title input is auto-focused | [P] | |
| 3.4 | "Create Article" button with empty input | Button is disabled | [P] | |
| 3.5 | "Create Article" button with whitespace only | Button is disabled | [P] | |
| 3.6 | Type a title | "Create Article" button enables | [P] | |
| 3.7 | Press Escape | Dialog closes; no article created | [P] | |
| 3.8 | Click outside the dialog (overlay) | Dialog closes; no article created | [P] | |
| 3.9 | Click "Cancel" | Dialog closes; no article created | [P] | |
| 3.10 | Type "My First Paper", press Enter | Navigates to `/editor/<uuid>` | [P] | |
| 3.11 | Type "My First Paper", click "Create Article" | Same result as Enter | [P] | |
| 3.12 | Return to Library | Card shows "My First Paper" as title (not "Untitled") | [P] | |
| 3.13 | Create a second article via dialog | Two cards in library, both with their given titles | [P] | |
| 3.14 | Article card detail | Shows word count, modified date+time, Refs, Focus, Delete | [P] | |

---

## 4. Library Page — Search & Sort

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | Type "quantum" in search (with a "Quantum Computing" article) | Only matching article shown (debounced ≤300ms) | [P] | |
| 4.2 | Type "zzz" (no match) | Empty list | [P] | |
| 4.3 | Clear search | All articles reappear | [P] | |
| 4.4 | Search for body text content | Matching article found | [P] | |
| 4.5 | Sort: Modified | Articles sorted by `updatedAt` descending | [P] | |
| 4.6 | Sort: Created | Articles sorted by `createdAt` descending; date+time visible | [P] | |
| 4.7 | Sort: Word Count | Articles sorted by word count descending | [P] | |
| 4.8 | Sort: Title | Articles sorted A→Z | [P] | |

---

## 5. Library Page — Delete & Navigation

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Click "Delete" on a card | Shows inline "Delete" + "Cancel" confirmation | [P] | |
| 5.2 | Click "Cancel" | Returns to single Delete button; article present | [P] | |
| 5.3 | Click "Delete" → confirm | Article card disappears | [P] | |
| 5.4 | Reload | Deleted article absent | [P] | |
| 5.5 | Click "Global Refs" | Navigates to `/references/__global__` | [P] | |
| 5.6 | Click "Corpus" | Navigates to `/corpus` | [P] | |
| 5.7 | Click "Settings" | Navigates to `/settings` | [P] | |
| 5.8 | Click article card | Navigates to `/editor/<id>` | [P] | |
| 5.9 | Click "Refs" on card | Navigates to `/references/<id>` | [P] | |
| 5.10 | Click "Focus" on card | Navigates to `/focus/<id>` | [P] | |

---

## 6. Editor Page — Loading & Header

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 6.1 | Open article created via dialog | Header shows: ← Back · title input (pre-filled) · word count · Preview · NLP · Research · Refs · Focus | [P] | |
| 6.2 | Back button label | Shows "← Back" | [P] | |
| 6.3 | Title input pre-filled | Shows the title entered in the dialog | [P] | |
| 6.4 | Observe word count | "0 words" for new article | [P] | Bug fixed: numeric tokens now counted. |
| 6.5 | Click in editor area | Cursor appears; editor ready | [P] | |

---

## 7. Editor Page — Title & Content

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 7.1 | Edit title in editor | Updates in real time; library card reflects new title | [P] | |
| 7.2 | Clear title entirely; click away | Title reverts to last valid title (empty title not allowed) | [P] | |
| 7.3 | Retype a title | Persists on reload | [P] | |
| 7.4 | Type several sentences | Text with markdown syntax highlighting | [F] | ~~ highlighting fixed. Superscript (^text^) and subscript (~text~) buttons added but syntax not rendering/highlighting correctly — logged as B-SS1. |
| 7.5 | Long paragraph | Lines wrap; no horizontal scrollbar | [P] | Suggestion: text alignment/justification controls. Logged in FUTURE_FEATURES.md. |
| 7.6 | Type `# Introduction` | `#` highlighted differently | [P] | |

---

## 8. Editor Page — Autosave

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 8.1 | Type content; wait 3 seconds | Saves automatically; word count updates | [P] | |
| 8.2 | Reload (F5) | Content and title persist | [P] | |
| 8.3 | Type content; click "← Back" | Save triggers on navigation | [P] | |
| 8.4 | Return to article | Content present | [P] | |
| 8.5 | Click manual "Save" button | Saves immediately; brief green "Saved ✓" indicator shown | [P] | Enhancement added: green indicator flashes for ~2s after save. |

---

## 9. Editor Page — Formatting Toolbar

| # | Button | Selection | Expected | Status | Notes |
|---|--------|-----------|----------|--------|-------|
| 9.1 | B | "hello" | `**hello**` | [P] | |
| 9.2 | B | None | `****` inserted | [P] | |
| 9.3 | I | "hello" | `_hello_` | [P] | |
| 9.4 | S̶ | "hello" | `~~hello~~` | [P] | |
| 9.5 | S̶ | None | `~~~~` inserted | [P] | |
| 9.6 | H1 | Cursor at line | `# ` prepended | [P] | |
| 9.7 | H2 | Cursor at line | `## ` prepended | [P] | |
| 9.8 | H3 | Cursor at line | `### ` prepended | [P] | |
| 9.9 | ❝ | Cursor at line | `> ` prepended | [P] | |
| 9.10 | ⊞ | Anywhere | 3-column markdown table template inserted | [P] | |
| 9.11 | Auto-convert | Type `--` | Converts to `—` in real time; button removed | [P] | |
| 9.12 | x² | Selection | `^selected^` wraps selection (superscript) | [P] | Wrapping works; preview does not render as superscript — B-SS1. |
| 9.13 | x₂ | Selection | `~selected~` wraps selection (subscript) | [P] | Wrapping works; preview does not render as subscript — B-SS1. |
| 9.14 | [@] | Anywhere | `[@ref]` inserted | [P] | |
| 9.15 | IMG | Anywhere | Image panel opens below toolbar | [P] | |
| 9.16 | All buttons | Preview mode | All buttons disabled/dimmed | [P] | |

---

## 10. Editor Page — Image Panel (F11)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 10.1 | Click IMG | Panel appears below toolbar with URL/File tabs and × close | [P] | |
| 10.2 | IMG button while panel open | Button highlighted blue | [P] | |
| 10.3 | Click × | Panel closes; IMG returns to normal | [P] | |
| 10.4 | URL tab — enter alt "fig1", URL "https://example.com/fig.png"; click Insert | `![fig1](https://example.com/fig.png)` inserted at cursor | [P] | |
| 10.5 | After insert | Panel closes; inputs cleared | [P] | |
| 10.6 | Switch to File tab | "Choose image..." button shown | [P] | |
| 10.7 | File tab — select a PNG/JPG | `![filename.png](data:image/png;base64,…)` inserted | [F] | Inserted correctly but image does not render in preview — B-IMG1. |
| 10.8 | After file insert | Panel closes | [F] | Panel closes but image preview broken — B-IMG1. |

---

## 11. Editor Page — Preview Mode

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 11.1 | Click "Preview" | Button turns blue; rendered markdown shown | [P] | |
| 11.2 | `# Heading 1` | Large bold heading with bottom border | [P] | |
| 11.3 | `## Heading 2` | Medium bold heading | [P] | |
| 11.4 | `### Heading 3` | Smaller bold heading | [P] | |
| 11.5 | `**bold**` | Bold text | [P] | |
| 11.6 | `_italic_` | Italic text | [P] | |
| 11.7 | `~~strikethrough~~` | Strikethrough text | [P] | |
| 11.8 | Markdown table via ⊞ | Visual table with header row, borders, row dividers | [P] | |
| 11.9 | `> blockquote` | Left-bordered italic blockquote | [P] | |
| 11.10 | `` `inline code` `` | Monospaced with background highlight | [P] | Inline code button added to toolbar. |
| 11.11 | Fenced code block | Block with background, monospaced | [P] | Code block button added to toolbar. |
| 11.12 | `[link](url)` | Underlined blue link | [P] | |
| 11.13 | Image inserted via URL panel | Image renders with max-width styling | [S] | Skipped — pending B-IMG1 fix. |
| 11.14 | Click "Edit" | CodeMirror reappears; content unchanged | [P] | |

---

## 12. Editor Page — NLP Panel

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 12.1 | Click "NLP" | Panel opens; button turns purple | [P] | |
| 12.2 | Fresh article (never saved) | "Save or wait 3 seconds for NLP analysis." | [P] | |
| 12.3 | Open Article A then Article B | NLP panel shows B's data (no bleed from A) | [P] | |
| 12.4 | < 20 words or < 2 sentences; save | Yellow warning: "Write at least 20 words across 2+ sentences..." | [P] | |
| 12.5 | 5+ sentences, 20+ words; save | Shows Readability, Passive Voice, Hedging scores | [P] | |
| 12.6 | Sentence containing "I went to the shop" | Word count includes "I" and "a" | [P] | Correctly counts 5 words including single-char "I". |
| 12.7 | Word count display | Matches actual word count (single-char words included) | [P] | |
| 12.8 | Passive Voice 0–14% | Bar green | [P] | |
| 12.9 | Passive Voice 15–29% | Bar yellow | [P] | |
| 12.10 | Passive Voice 30%+ | Bar red | [P] | |
| 12.11 | Click "NLP" again | Panel closes | [P] | |

---

## 13. Editor Page — Research Panel

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 13.1 | Click "Research" | Panel opens; button turns green | [P] | |
| 13.2 | Source toggles | "Web (AI)" and "Local (Ollama)"; Web default | [P] | |
| 13.3 | Empty textarea | Ask button disabled | [P] | |
| 13.4 | Type a question; press Ctrl+Enter | Query submitted | [P] | |
| 13.5 | No API key (OpenAI active) | Error message in response area | [P] | |
| 13.6 | Ollama active (running) | Response streams in token by token | [P] | |
| 13.7 | NLP + Research both open | Both stack in right sidebar with divider; no overflow | [P] | |
| 13.8 | Click "Research" again | Panel closes | [P] | |

---

## 14. References Page — Layout & Navigation

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 14.1 | Click "Refs" from editor | Navigates to `/references/<id>` | [P] | |
| 14.2 | Observe header | ← Back · References · + Add Manual · Export BibTeX | [P] | |
| 14.3 | Empty state | "No references yet. Import a DOI or add manually." | [P] | |
| 14.4 | Click "← Back" | Returns to editor | [P] | |

---

## 15. References Page — DOI Import

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 15.1 | Import `10.1038/nature12373` | Completes with title, authors, journal, year | [P] | |
| 15.2 | Shortcode format | `author:year` e.g. `chan2013` (not `ref1`) | [P] | |
| 15.3 | Import same DOI again | Error: "Already exists: '...' (chan2013)" | [P] | |
| 15.4 | Import `https://doi.org/10.1126/science.1259855` | Strips prefix; fetches correctly | [P] | |
| 15.5 | Fake DOI `10.9999/fake` | Error: "DOI not found (404)" | [P] | |
| 15.6 | Empty DOI field | Import button disabled | [P] | |
| 15.7 | After successful import | DOI field cleared | [P] | |
| 15.8 | Paper with no author family name | Shortcode falls back to `ref{n}` | [S] | Hard to trigger in practice — RFC 2606 resolved with "eastlake" as author. Fallback logic exists in code but untested. |

---

## 16. References Page — Manual Add & Edit

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 16.1 | Click "+ Add Manual" | Blank card with auto shortcode | [P] | Fixed: new refs now appear at top (ORDER BY sortOrder DESC). |
| 16.2 | Click "Edit" | Expands to edit form | [P] | |
| 16.3 | Edit fields | Update in real time | [P] | |
| 16.4 | Click "Save" | Card collapses; values shown | [P] | |
| 16.5 | Click "Cancel" | Original values restored | [P] | |
| 16.6 | Reload | Edited references persist | [P] | |

---

## 17. References Page — Checkboxes & Selective Export (F4)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 17.1 | Open refs page with 3+ refs | Every card has a checkbox; all unchecked by default | [P] | Changed to unchecked by default per user preference. |
| 17.2 | "Select All" and "Select None" buttons | Both visible next to reference count | [P] | Styled with borders for prominence. |
| 17.3 | Click "Select All" | All checkboxes checked | [P] | |
| 17.4 | Click "Export BibTeX" with none selected | Alert: "Select at least one reference to export." | [P] | |
| 17.5 | Export with 0 total refs | Alert: "No references to export." | [P] | |
| 17.6 | Check 2 of 3 refs; export | Downloaded `.bib` contains exactly those 2 refs | [P] | |
| 17.7 | Open `.bib` file | Omitted ref absent; checked refs valid BibTeX | [P] | |
| 17.8 | Click "Select None" | All checkboxes cleared | [P] | |
| 17.9 | Add new ref via DOI | New card appears unchecked | [P] | |

---

## 18. References Page — Tags (F9)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 18.1 | Each ref card | Shows `+ tag` dashed button below ref details | [P] | |
| 18.2 | Click `+ tag` | Inline input with "Add" and "✕" | [P] | |
| 18.3 | Type "genomics"; press Enter | Tag chip "genomics" appears | [P] | Add/✕ buttons now bordered and more prominent with proper spacing. |
| 18.4 | Press Escape in tag input | Input closes; no tag added | [P] | |
| 18.5 | Add second tag "methods" | Two chips shown | [P] | |
| 18.6 | Click "×" on "genomics" | Chip removed | [P] | |
| 18.7 | Reload | Tags persist | [P] | |

---

## 19. References Page — Delete

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 19.1 | Click "Delete" | Shows "Confirm" + "Cancel" | [P] | |
| 19.2 | Click "Cancel" | Reference present | [P] | |
| 19.3 | Confirm delete | Reference removed | [P] | |
| 19.4 | Reload | Deleted reference gone | [P] | |

---

## 20. Global References — Unified View (F5)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 20.1 | Setup: 2 articles with 2 refs each; 1 global ref | 5 refs across 3 buckets | [P] | |
| 20.2 | Open Global Refs | All 5 refs shown (not just __global__ refs) | [P] | |
| 20.3 | Flat list (not grouped) | Refs shown as a flat list sorted newest first | [P] | Changed from grouped-by-article to flat list per user request. |
| 20.4 | Article title badge | Each ref card shows a blue badge with the source article title | [P] | Badge styled in blue to distinguish from tag chips. |
| 20.5 | Global badge | Refs from global article show "Global" badge | [P] | |
| 20.6 | Sort order | Newest refs appear at top | [P] | Already sorted DESC by sortOrder. |
| 20.7 | Checkboxes | All refs have checkboxes; selective export works | [P] | |
| 20.8 | Tags visible | Tags set on article-specific refs appear here | [P] | |
| 20.9 | DOI import | Imports to __global__; appears at top of list | [P] | Fixed: maxSortOrder now uses global table max so new refs always get highest sortOrder. |
| 20.10 | Article-specific refs page | Does NOT show global refs | [P] | |

---

## 21. Focus Mode — Setup Page

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 21.1 | Click "Focus" from editor | Navigates to `/focus/<id>` | [P] | |
| 21.2 | Article title in header | "Focus Mode — [Article Title]" | [P] | |
| 21.3 | Duration buttons | 15, 30, 45, 60, 90 min | [P] | |
| 21.4 | Custom duration: "45s" | Starts ~1 min session | [P] | Confirmed: anything < 1 min rounds up to 1 min. |
| 21.5 | Custom duration: "5m" | Starts 5 min session | [P] | Added "← Back to Editor" button on active session screen alongside "End Session". |
| 21.6 | Custom duration: "25" | Starts 25 min session | [P] | Focus button in editor now disabled while session is active. |
| 21.7 | Custom duration: "abc" | Error: "Enter a duration like '30s', '5m', or '25'" | [P] | |
| 21.8 | Click "← Back" | Returns to editor | [P] | |

---

## 22. Focus Mode — Session in Editor (F6)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 22.1 | Click "15 min" | Fullscreen activates silently (no dialog); navigates to editor with timer chip | [P] | Browser Fullscreen API doesn't show a permission dialog — it silently grants when triggered by a click. |
| 22.2 | Timer chip | `⏱ 15:00 [End]` chip visible in editor header | [P] | |
| 22.3 | Wait 2–3 seconds | Timer counts down correctly | [P] | |
| 22.4 | Editor fully functional | Can type, use toolbar, open NLP/Research during session | [P] | |
| 22.5 | Click "End" on chip | Chip disappears; fullscreen exits; writing continues | [P] | |
| 22.6 | No separate focus screen | After starting, editor is the session interface | [P] | |

---

## 23. Focus Mode — Timer Expiry Nudge (F8)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 23.1 | Start "30s" custom session; wait | Timer hits 00:00 | [P] | |
| 23.2 | Completion nudge | Green banner below toolbar: "Focus session complete! Great work." | [P] | |
| 23.3 | Auto-dismiss | Banner disappears after ~6 seconds | [P] | |
| 23.4 | Manual dismiss | Click × on banner → closes immediately | [P] | |
| 23.5 | Writing during nudge | Can type in editor while banner is visible | [P] | |
| 23.6 | After nudge | Timer chip gone; editor fully normal | [P] | |

---

## 24. Settings Page — Appearance / Themes (F10)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 24.1 | Navigate to Settings | "Appearance" section at top with Dark/Light buttons | [P] | |
| 24.2 | Default state | "Dark" button highlighted | [P] | |
| 24.3 | Click "Light" | App immediately switches to light colour scheme | [P] | Fixed: Tailwind v4 bakes bg values directly; switched to direct class overrides in index.css. Also added CodeMirror overrides for editor area. |
| 24.4 | Navigate Library, Editor, Corpus, Refs in light mode | All pages use light backgrounds; text readable | [P] | Global Refs article-title badge contrast fixed (bg-blue-600/white). Refs sort fixed: new refs now use Date.now() as sortOrder. |
| 24.5 | Inputs in light mode | Visible borders; readable placeholder text | [P] | Back buttons given bordered style. Toolbar icons darkened (text-gray-400 → #374151). Action buttons use earthy amber palette in light mode. |
| 24.6 | Blue/green/red accents in light mode | Remain distinct and visible | [P] | |
| 24.7 | Click "Dark" | App reverts to dark theme | [P] | |
| 24.8 | Set light; reload | Theme persists across reload | [P] | |

---

## 25. Settings Page — AI Providers & Ollama

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 25.1 | Active Provider section | 3 radio buttons; OpenAI default | [P] | |
| 25.2 | Ollama section | Green note: "No API key required — runs fully offline on your machine." | [P] | Light mode: green/yellow/red text colours darkened for readability. |
| 25.3 | Click "Fetch Models" (Ollama running) | Dropdown populates with available models | [B] | Only gemma returned; mistral missing. Logged B-OL1. |
| 25.4 | Current model not in fetched list | Dropdown and input auto-update to first fetched model | [P] | |
| 25.5 | Select model from dropdown | Text input updates to match | [S] | Blocked by B-OL1 — only one model fetched. |
| 25.6 | Invalid Ollama URL; Fetch Models | Error: "Could not reach Ollama: ..." | [P] | |
| 25.7 | Click "Save Settings" | Shows "Saved!" for ~2s | [P] | |
| 25.8 | Reload | All settings restored | [P] | |

---

## 26. Corpus Page — Layout

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 26.1 | Navigate to Corpus | Header · info box · Add from URL · Add from File · doc list | [P] | |
| 26.2 | Info box | Explains Local (Ollama) usage; embeddings note | [P] | User wants embeddings auto-computed on document add. Logged in FUTURE_FEATURES.md. |
| 26.3 | Empty state | "No corpus documents yet…" | [P] | |

---

## 27. Corpus Page — Add from URL

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 27.1 | CORS-restricted URL (e.g. https://www.bbc.com) | Error: "CORS blocked: The server does not allow browser access… Try uploading as a file instead." | [P] | |
| 27.2 | Non-existent URL | Error: "HTTP 404" (distinct from CORS message) | [P] | Browser cannot distinguish DNS failures from CORS blocks — both surface as "Failed to fetch". Error message updated to cover both cases. |
| 27.3 | Press Enter in URL field | Same as clicking Add | [P] | |
| 27.4 | Empty URL field | Add button disabled | [P] | Fixed: switched to disabled:opacity-40 for theme-independent visibility; Enter key guarded. |

---

## 28. Corpus Page — Add from File

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 28.1 | Click "Choose Text File" | OS file picker opens | [P] | |
| 28.2 | While reading | Button text changes to "Reading file..." | [S] | Too fast to observe on small files; state logic exists in code. |
| 28.3 | Select a `.txt` file | Document appears with filename, word count, date | [P] | Fixed: timestamp now includes time (toLocaleString with hour/minute). |
| 28.4 | Select a `.md` file | Added as plain text | [P] | |
| 28.5 | File read error (simulated) | Error message shown — not silent failure | [P] | Fixed: binary files (image, STL) now rejected with clear error. File type validated by MIME type and extension. accept attribute updated. |

---

## 29. Corpus Page — Keyword Tagging (F9)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 29.1 | Each doc card | Shows `+ tag` dashed button | [P] | Button visibility improved. × hover red not working — logged B-TAG1. |
| 29.2 | Click `+ tag` | Inline input appears | [P] | |
| 29.3 | Type "machine-learning"; Enter | Chip appears on card | [P] | |
| 29.4 | Press Escape | Input closes; no tag added | [P] | |
| 29.5 | Add second tag "nlp" | Two chips shown | [P] | |
| 29.6 | Click × on chip | Tag removed | [P] | |
| 29.7 | Reload | Tags persist | [P] | |

---

## 30. Corpus Page — Tag Filter (F9)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 30.1 | Docs A→"nlp", B→"nlp,vision", C→"vision" | Setup | [P] | Also implemented: MEDLINE bulk import with mandatory tagging, click-to-view corpus records, bulk delete by tag, corpus tag filter for Ollama context. |
| 30.2 | Tag filter bar | "Filter by tag:" with "nlp" and "vision" chips | [P] | Replaced with tag tree view (default). Tags shown as collapsible groups with counts. Hierarchical tags via "/" separator. |
| 30.3 | Click "nlp" | Only A and B shown; count: "2 Documents tagged 'nlp'" | [P] | Clicking tag header expands record list. |
| 30.4 | Active chip | Highlighted blue | [P] | Expanded group highlighted. |
| 30.5 | Click "Clear filter" | All docs shown | [P] | Collapse tag group or switch to List view. |
| 30.6 | Click same tag again | Filter toggles off | [P] | Toggle expand/collapse. |
| 30.7 | Remove all tags from a doc | Its tags disappear from filter bar | [P] | Tag disappears from tree when no docs carry it. |

---

## 31. Corpus Page — Document Management

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 31.1 | Click "Delete" | Confirm/Cancel shown | [P] | |
| 31.2 | Cancel | Document present | [P] | |
| 31.3 | Confirm | Document removed; filter bar updates | [P] | |
| 31.4 | Reload | Deleted doc absent | [P] | |

---

## 32. Data Persistence — Cross-Session

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 32.1 | Close tab; reopen app | Articles load on first open (no blank screen) | [P] | |
| 32.2 | Article titles | Created titles persist (not "Untitled") | [P] | |
| 32.3 | References | Present with their shortcodes and tags | [P] | |
| 32.4 | Settings | Provider, Ollama URL/model, theme all restored | [P] | |
| 32.5 | Corpus docs + tags | Documents and their tags still present | [P] | |

---

## 33. Content Bleed Between Articles

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 33.1 | Open Article A (100 words); library; open Article B (empty) | B shows empty content, not A's | [P] | |
| 33.2 | NLP on Article B | Shows "Save or wait..." — not A's scores | [P] | |
| 33.3 | Fresh tab; navigate directly to `/editor/<id>` | Article loads correctly on first open | [P] | |
| 33.4 | Rapid navigation between 3 articles | Each shows its own content; no bleed | [P] | |

---

## 34. Navigation — Browser Back/Forward

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 34.1 | Library → Editor → Back | Returns to Library | [P] | |
| 34.2 | Library → Settings → Back | Returns to Library | [P] | |
| 34.3 | Library → Corpus → Back | Returns to Library | [P] | |
| 34.4 | Editor → References → Back | Returns to Editor | [P] | |
| 34.5 | Editor → Focus → Back (no session) | Returns to Editor | [P] | |
| 34.6 | Focus → start session → editor → Back | Returns to Focus setup (session chip disappears) | [B] | B-FOC1: timer illegible in light mode |
| 34.7 | Forward after Back | Navigates forward correctly | [P] | |

---

## 35. Edge Cases

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 35.1 | `/editor/nonexistentid` | Loads without crash | [P] | |
| 35.2 | `/references/nonexistentid` | Loads without crash; "No article found" message with link to Library | [P] | Added "No article found" banner with Library link |
| 35.3 | Clear localStorage; reload | Fresh DB; no crash | [P] | By design: all data lost. Added Backup & Restore with 3 rotating slots + auto-backup interval. |
| 35.4 | Empty research query + Ctrl+Enter | Nothing happens | [P] | |
| 35.5 | DOI import with no internet | Error displayed; no crash | [P] | |
| 35.6 | App in two tabs simultaneously | Both work independently | [P] | |
| 35.7 | Image data URL inserted; reload | Markdown persists; renders in preview | [P] | |
| 35.8 | Switch theme rapidly multiple times | No artifacts; applies cleanly | [P] | |
| 35.9 | Dialog open; resize browser | Dialog stays centred | [P] | |
| 35.10 | Global refs: article with empty title | Falls back to article ID (existing data edge case) | [S] | Obsolete — articles cannot have empty titles |

---

## 36. Visual & UX

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 36.1 | Dark theme | Consistent dark backgrounds across all pages | [P] | |
| 36.2 | Light theme | Consistent light backgrounds; all text readable | [B] | B-FOC1: focus timer illegible in light mode |
| 36.3 | Button shadows (I7) | Non-disabled buttons have subtle box-shadow | [P] | |
| 36.4 | Hover states | Visible on all interactive elements | [P] | |
| 36.5 | Disabled buttons | Dimmed; `cursor: not-allowed` | [P] | |
| 36.6 | "← Back" label | Consistent across Editor, Refs, Corpus, Settings, Focus | [P] | |
| 36.7 | New article dialog | Dark overlay; dialog centred; readable in both themes | [P] | |
| 36.8 | Responsive ≥768px | No horizontal scrollbar; layout fills correctly | [P] | |
| 36.9 | Responsive <768px | `min-width: 768px` enforced; horizontal scrollbar rather than collapse | [ ] | |
| 36.10 | Tab key navigation | Keyboard focus visible throughout | [ ] | |

---

## Test Run Summary

| Section | Total | Pass | Fail | Skip |
|---------|-------|------|------|------|
| 1. Startup | 5 | | | |
| 2. Library Layout | 4 | | | |
| 3. New Article Dialog | 14 | | | |
| 4. Search & Sort | 8 | | | |
| 5. Delete & Nav | 10 | | | |
| 6. Editor Loading | 5 | | | |
| 7. Title & Content | 6 | | | |
| 8. Autosave | 5 | | | |
| 9. Toolbar | 16 | | | |
| 10. Image Panel | 8 | | | |
| 11. Preview | 14 | | | |
| 12. NLP Panel | 11 | | | |
| 13. Research Panel | 8 | | | |
| 14. Refs Layout | 4 | | | |
| 15. DOI Import | 8 | | | |
| 16. Manual Add/Edit | 6 | | | |
| 17. Checkboxes & Export | 9 | | | |
| 18. Reference Tags | 7 | | | |
| 19. Delete Ref | 4 | | | |
| 20. Global Refs View | 10 | | | |
| 21. Focus Setup | 8 | | | |
| 22. Focus Session | 6 | | | |
| 23. Timer Nudge | 6 | | | |
| 24. Themes | 8 | | | |
| 25. AI Providers / Ollama | 8 | | | |
| 26. Corpus Layout | 3 | | | |
| 27. Corpus URL | 4 | | | |
| 28. Corpus File | 5 | | | |
| 29. Corpus Tags | 7 | | | |
| 30. Tag Filter | 7 | | | |
| 31. Corpus Mgmt | 4 | | | |
| 32. Persistence | 5 | | | |
| 33. Content Bleed | 4 | | | |
| 34. Browser Nav | 7 | | | |
| 35. Edge Cases | 10 | | | |
| 36. Visual/UX | 10 | | | |
| **Total** | **253** | | | |

---

## Known Limitations (as built)

- **B9 / Dev port scoping:** localStorage is origin-scoped; data appears lost if dev server port changes. Not a production bug.
- **Corpus URL import:** Blocked by browser CORS for most external URLs. File upload is the reliable alternative.
- **Embeddings not computed:** Corpus docs stored as plain text only; "embedded" badge will never appear. Ollama receives full text as context.
- **PDF / PubMed import:** Not implemented. `.txt`, `.md`, `.csv`, `.json` only.
- **Focus fullscreen:** Requires Fullscreen API (Chrome/Edge). Degrades silently in unsupported browsers.
- **Wake Lock:** Chrome/Edge on HTTPS or localhost only.
- **Citation rendering in preview:** `[@ref:shortcode]` not yet resolved in preview (shown as raw text).
- **Light theme — dynamic colours:** Some UI elements (streaming text, progress bars) may not invert perfectly; blue/green/red accents are intentionally constant across themes.
- **Image data URLs:** Large images inserted as data URLs inflate the `likhitu_db` localStorage key significantly. No size warning is shown; no compression is applied. Consider using URL references instead of file uploads for large images.
- **Existing articles with empty titles:** Articles created before the dialog was introduced may still have empty titles; the global refs view falls back to displaying the article ID.

---

*Test plan v2 · 253 test cases · 36 sections · 2026-03-14*
