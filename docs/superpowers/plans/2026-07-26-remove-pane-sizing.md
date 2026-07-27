# Remove Pane Sizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore Oxford's native page sizing in both WebViews while preserving the independent full-screen and safe-area fixes.

**Architecture:** Remove the entire orientation-to-fit data path from `App` through both WebView components and delete the now-unused script/helper modules. Keep definition auto-scroll, hidden status bar, edge-to-edge root, and alphabet safe insets unchanged.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-webview, Jest.

## Global Constraints

- Do not inject CSS zoom, width overrides, or orientation-dependent sizing.
- Do not modify definition auto-scroll behavior.
- Keep the system status bar hidden.
- Keep the A–Z Dynamic Island and Home indicator safe padding.
- Continue on the existing PR branch.

---

### Task 1: Remove sizing behavior from components

**Files:**
- Modify: `App.tsx`
- Modify: `App.test.tsx`
- Modify: `src/components/DictionaryWebView.tsx`
- Modify: `src/components/DictionaryWebView.test.tsx`
- Modify: `src/components/OxfordWordListWebView.tsx`
- Modify: `src/components/OxfordWordListWebView.test.tsx`

**Interfaces:**
- Removes: `fitToWidth?: boolean` from both WebView component props.
- Preserves: `DictionaryWebView({ url })` and the existing word-list props.

- [ ] **Step 1: Write failing tests**

Assert that neither WebView's `injectedJavaScriptBeforeContentLoaded` contains
`oxford-viewer-pane-width-fit`. Keep the definition pre-load assertion for
`#entryContent`. Assert the status bar remains hidden.

- [ ] **Step 2: Verify RED**

```powershell
npx jest App.test.tsx src/components/DictionaryWebView.test.tsx src/components/OxfordWordListWebView.test.tsx --runInBand
```

Expected: FAIL because both WebViews still install the sizing script.

- [ ] **Step 3: Remove component integration**

Remove `useWindowDimensions`, `getPaneWidthFitMode`, both `fitToWidth` props,
all pane-width script imports, load-state refs/effects used only for sizing,
and pre-load sizing injection. Restore the definition pre-load string to
`buildDefinitionAutoScrollScript()` only.

- [ ] **Step 4: Verify GREEN**

Run the Step 2 command and expect all three suites to pass.

### Task 2: Remove unused modules and stale active documentation

**Files:**
- Delete: `src/layout/getPaneWidthFitMode.ts`
- Delete: `src/layout/getPaneWidthFitMode.test.ts`
- Delete: `src/plugins/pane-width-fit/buildPaneWidthFitScript.ts`
- Delete: `src/plugins/pane-width-fit/buildPaneWidthFitScript.test.ts`
- Modify: `docs/oxford-navigation-dom.md`

- [ ] **Step 1: Delete the unused sizing modules**

After Task 1 has no remaining imports, delete both implementation modules and
their tests.

- [ ] **Step 2: Remove active sizing claims from navigation documentation**

Keep the verified Oxford minimum-width evidence if useful, but state explicitly
that the app does not alter Oxford page sizing.

- [ ] **Step 3: Run full verification**

```powershell
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: all Jest suites pass, TypeScript exits 0, Expo Doctor reports 18/18,
and `git diff --check` exits 0.

- [ ] **Step 4: Commit and push**

```powershell
git add -A -- App.tsx App.test.tsx src docs
git commit -m "Remove Oxford pane sizing"
git push origin agent/oxford-viewer-phase-1
```
