# Responsive Pane Fit and Full-Screen Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fit the constrained Oxford pane to its available width in each orientation and fill the iPhone screen while keeping A–Z controls inside vertical safe insets.

**Architecture:** A pure orientation helper selects which pane needs fitting. A reusable injected-style script overrides Oxford's verified minimum widths and supports enable/disable updates after rotation. The root keeps only horizontal safe-area edges, while the native alphabet index receives explicit top and bottom safe padding.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-webview, react-native-safe-area-context, Jest, Testing Library.

## Global Constraints

- Portrait enables width fitting only for the definition WebView.
- Landscape enables width fitting only for the word-list WebView.
- Do not use a fixed zoom ratio or clip a 320px page.
- Do not reload an Oxford page when orientation changes.
- Preserve all existing word-list, definition, alphabet, and pronunciation behavior.
- Keep the app edge-to-edge vertically, with A and Z protected by native safe-area insets.

---

### Task 1: Orientation mode and pane-width fit plugin

**Files:**
- Create: `src/layout/getPaneWidthFitMode.ts`
- Create: `src/layout/getPaneWidthFitMode.test.ts`
- Create: `src/plugins/pane-width-fit/buildPaneWidthFitScript.ts`
- Create: `src/plugins/pane-width-fit/buildPaneWidthFitScript.test.ts`

**Interfaces:**
- Produces: `getPaneWidthFitMode(width: number, height: number): { fitWordList: boolean; fitDictionary: boolean }`
- Produces: `buildPaneWidthFitScript(enabled: boolean): string`

- [ ] **Step 1: Write failing orientation tests**

Test that `390×844` returns `{ fitWordList: false, fitDictionary: true }`
and `844×390` returns `{ fitWordList: true, fitDictionary: false }`.

- [ ] **Step 2: Write failing script tests**

Assert that the enabled script creates the stable style id
`oxford-viewer-pane-width-fit`, overrides `body`, `.responsive_container`, and
`.responsive_row` minimum widths, and that the disabled script removes the
same style element. Assert both scripts end in `true;`.

- [ ] **Step 3: Run tests and verify RED**

Run:

```powershell
npx jest src/layout/getPaneWidthFitMode.test.ts src/plugins/pane-width-fit/buildPaneWidthFitScript.test.ts --runInBand
```

Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement the pure mode helper and idempotent script**

Use `height >= width` as portrait. The injected style must contain:

```css
html,
body,
.responsive_container,
.responsive_row {
  box-sizing: border-box !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

html,
body {
  overflow-x: hidden !important;
  width: 100% !important;
}
```

Enabling reuses or creates the stable style element. Disabling removes it.

- [ ] **Step 5: Run tests and verify GREEN**

Run the Step 3 command and expect both suites to pass.

### Task 2: Integrate fitting into both WebViews

**Files:**
- Modify: `src/components/DictionaryWebView.tsx`
- Modify: `src/components/DictionaryWebView.test.tsx`
- Modify: `src/components/OxfordWordListWebView.tsx`
- Modify: `src/components/OxfordWordListWebView.test.tsx`

**Interfaces:**
- Consumes: `buildPaneWidthFitScript(enabled: boolean): string`
- Produces: required `fitToWidth: boolean` prop on both WebView components

- [ ] **Step 1: Write failing component tests**

For each component, render with `fitToWidth`. Verify
`injectedJavaScriptBeforeContentLoaded` contains the stable style id. Fire
`loadEnd`, clear the injection mock, rerender with `fitToWidth={false}`, and
verify one injected script removes that style id.

- [ ] **Step 2: Run component tests and verify RED**

Run:

```powershell
npx jest src/components/DictionaryWebView.test.tsx src/components/OxfordWordListWebView.test.tsx --runInBand
```

Expected: FAIL because neither component accepts or injects the fit mode.

- [ ] **Step 3: Implement pre-load and rotation injection**

Both components build the fit script before content loads. Track successful
page loading in a ref. A `useEffect` injects the current fit script only when
the page is already loaded, so rotation updates layout without navigation.
Concatenate the definition auto-scroll script with the definition pre-load
fit script so the WebView receives a single pre-load string.

- [ ] **Step 4: Run component tests and verify GREEN**

Run the Step 2 command and expect both suites to pass.

### Task 3: Full-screen layout and alphabet safe padding

**Files:**
- Modify: `App.tsx`
- Modify: `App.test.tsx`
- Modify: `src/plugins/alphabet-index/AlphabetIndexPlugin.tsx`
- Modify: `src/plugins/alphabet-index/AlphabetIndexPlugin.test.tsx`

**Interfaces:**
- Consumes: `getPaneWidthFitMode(width, height)`
- Produces: optional `topInset?: number` and `bottomInset?: number` props on `AlphabetIndexPlugin`

- [ ] **Step 1: Write failing safe-layout tests**

Test that the app safe-area view uses only `['left', 'right']`. Test the pure
orientation helper separately from Task 1. Render the alphabet plugin with
`topInset={59}` and `bottomInset={34}` and verify its container has 61px top
padding and 36px bottom padding, including the existing 2px visual padding.

- [ ] **Step 2: Run layout tests and verify RED**

Run:

```powershell
npx jest App.test.tsx src/plugins/alphabet-index/AlphabetIndexPlugin.test.tsx --runInBand
```

Expected: FAIL because the root includes vertical safe edges and the alphabet
plugin does not accept insets.

- [ ] **Step 3: Implement the full-screen safe layout**

Use `useWindowDimensions` and `useSafeAreaInsets` inside a child of
`SafeAreaProvider`. Pass the derived fit flags to the WebViews. Set the root
`SafeAreaView` edges to `['left', 'right']`. Pass top and bottom insets to the
alphabet plugin and combine them with its existing 2px padding.

- [ ] **Step 4: Run layout tests and verify GREEN**

Run the Step 2 command and expect both suites to pass.

### Task 4: Documentation and verification

**Files:**
- Modify: `docs/oxford-navigation-dom.md`

- [ ] **Step 1: Record the verified Oxford minimum-width rules**

Document `body: 320px`, `.responsive_container: 320px`, and
`.responsive_row: 300px`, plus the orientation-specific override behavior.

- [ ] **Step 2: Run all required checks**

```powershell
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: all Jest suites pass, TypeScript exits 0, Expo Doctor reports 18/18,
and `git diff --check` exits 0.

- [ ] **Step 3: Commit and push the current PR branch**

```powershell
git add App.tsx App.test.tsx src docs
git commit -m "Fit Oxford panes to iPhone screen"
git push origin agent/oxford-viewer-phase-1
```
