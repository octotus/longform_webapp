# Likhitu — Session Context

**Project:** `/home/k/Claude_Projects/likhitu`
**Last session date:** 2026-03-14
**Git branch:** master
**Last commit:** `eede0cf` — Post-test-run improvements and bug fixes (session 2)

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 — direct class overrides in `src/index.css` (variables don't work for bg-*)
- CodeMirror 6 with oneDark theme — explicit CSS overrides needed for light mode
- sql.js (SQLite WASM) — DB exported to localStorage as base64 (`likhitu_db`)
- Zustand stores: editorStore, settingsStore, referenceStore, focusStore
- React Router v6

---

## What We Are Doing

Running a full test plan (`TEST_PLAN_v2.md`, 253 tests, 36 sections) one test at a time.
- `0` = pass, `1` = fail, `2` = comment/issue
- TEST_PLAN_v2.md is updated after every result.
- Inline fixes are made when tests fail or the user raises an issue.

### Test progress at end of session

All tests through **36.8** have been completed. The test plan is fully run.

The remaining work is resolving open bugs (see below) and retesting the image upload fix.

---

## Open Bugs

| ID | Description | Status |
|----|-------------|--------|
| B-SS1 | Superscript/subscript not rendered in preview — remark-gfm doesn't support `^text^` / `~text~`. Needs `remark-supersub` plugin. | Unresolved |
| B-IMG1 | Image file uploads embedded base64 data URLs in markdown which broke the markdown tokenizer (URL too long). Fixed via `likhitu-img://uuid` scheme — images stored separately in localStorage, resolved at render time in `urlTransform`. **Not yet retested.** | Fix applied, needs retest |
| B-OL1 | Ollama model fetch only returns one model. `m.name \|\| m.model` fallback applied but issue persists. Needs live debugging with actual Ollama response. | Unresolved |
| B-TAG1 | Corpus tag chip × button `hover:text-red-400` not applying. Tailwind v4 CSS ordering issue; `!important` also ineffective. | Unresolved |
| B-FOC1 | Focus timer clock invisible in light mode. `text-white` on light background. CSS override with `!important` and custom class attempted but ineffective. Tailwind v4 specificity issue. | Unresolved |

---

## Key Changes Made This Session

### `src/index.css`
- Light theme: earthy amber palette for blue hover/active states
- CodeMirror overrides for light mode (`.cm-editor`, `.cm-content`, `.cm-gutters`, etc.)
- Color overrides: `text-green-400`, `text-yellow-500`, `text-red-400`, `text-gray-400` in light mode
- Attempted fix for B-FOC1: `.bg-gray-950`, `.focus-timer` with `!important` — not working

### `src/db/db.ts`
- `persist()`: fixed stack overflow on large DBs — replaced `String.fromCharCode(...data)` spread with a `for` loop

### `src/pages/SettingsPage.tsx`
- Save button: disabled until dirty state detected (compares live values to `useRef` snapshot)
- Backup & Restore section: 3 rotating in-browser slots + manual backup + restore from file
- Auto-backup interval: Off / 15min / 30min / 1hr / 6hr (saves silently to slot, no download spam)
- After downloading a slot, all slots are cleared

### `src/pages/CorpusPage.tsx`
- MEDLINE/PubMed bulk import with mandatory tagging, duplicate detection, click-to-view
- Tag tree with `/` hierarchical grouping, collapsible, bulk delete at root and child level
- File type validation (allowedTypes + extensions including .nbib, .medline, .ris)
- URL prefix auto-add (https://) for bare domains
- `DocCard` component, corpus search, viewMode toggle (tags / list)

### `src/pages/ReferencesPage.tsx`
- "No article found" message with Library link for invalid article IDs
- Imported `getDb` + `articleRepo` to detect missing articles

### `src/pages/EditorPage.tsx`
- Image upload: now stores data URL in localStorage as `likhitu-img-{uuid}`, inserts short `likhitu-img://uuid` reference in markdown (fixes tokenizer breakage)
- `urlTransform` resolves `likhitu-img://uuid` → data URL at render time

### `src/pages/FocusPage.tsx`
- Back button: bordered style
- Active session: added `.focus-active-screen` and `.focus-timer` classes for CSS targeting (B-FOC1 fix attempt)

### `src/stores/settingsStore.ts`
- Added `autoBackupInterval` (0 | 15 | 30 | 60 | 360 minutes)
- Ollama model fetch: `m.name || m.model` fallback

### `src/stores/editorStore.ts`
- Added `corpusTagFilter`, `availableCorpusTags`, `toggleCorpusTag`, `loadCorpusTags`
- `submitResearchQuery`: filters corpus docs by selected tags when LOCAL source

### `src/stores/referenceStore.ts`
- New refs use `Date.now()` as sortOrder (appear at top)
- Duplicate DOI: resets loading state and clears input on error

### `src/utils/backup.ts` (new)
- `saveBackupSlot()`: collects DB + settings + all `likhitu-img-*` images → rotates 3 slots
- `getBackupSlots()`, `clearBackupSlots()`, `downloadBackupSlot()`, `restoreFromPayload()`

### `src/utils/imageStore.ts` (new)
- `storeImage(dataUrl)` → returns UUID, saves to `localStorage['likhitu-img-{uuid}']`
- `resolveImageUrl(url)` → resolves `likhitu-img://uuid` → data URL
- Used by EditorPage for image upload and preview rendering

### `src/App.tsx`
- Auto-backup timer: `setInterval(saveBackupSlot, interval * 60 * 1000)`

---

## Approach / Conventions to Maintain

- **Tailwind v4**: use direct class overrides in `src/index.css` under `html.light-theme .classname { ... }`. CSS variables for bg-* do not work.
- **Light theme text**: `text-white` has no global light-mode override (would break colored buttons). Target specific containers instead.
- **Back buttons**: always `text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors`
- **Disabled buttons**: `disabled:opacity-40 disabled:cursor-not-allowed`
- **persist()**: always use `for` loop, never spread on Uint8Array (stack overflow risk)
- **New refs**: always use `Date.now()` as sortOrder so they appear at top
- **Images in markdown**: never embed base64 directly — use `likhitu-img://uuid` scheme

---

## Next Steps (suggested order)

1. **Retest B-IMG1** — upload an image file, switch to preview, confirm it renders
2. **Fix B-FOC1** — focus timer invisible in light mode. Try inline style or theme-aware class instead of CSS override
3. **Fix B-SS1** — install and wire `remark-supersub` for superscript/subscript preview
4. **Fix B-TAG1** — corpus tag chip × hover red. Investigate Tailwind v4 hover specificity
5. **Investigate B-OL1** — Ollama multi-model fetch. May need to log raw API response
