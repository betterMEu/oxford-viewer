# Portrait Definition Scale and Safe Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink the Oxford definition page in portrait and keep its word title below the iPhone top safe area after automatic scrolling.

**Architecture:** `AppContent` supplies orientation, pane width, and the top safe-area inset to `DictionaryWebView`. A definition-only WebView script applies CSS zoom, while the existing auto-scroll script uses the active scale to convert the native safe-area inset into the correct CSS scroll margin.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-webview, Jest, React Native Testing Library

## Global Constraints

- Apply scaling only to the Oxford definition WebView in portrait.
- Do not restore or add sizing behavior to the word-list WebView.
- Do not add dependencies or unrelated features.
- Keep all existing Oxford navigation and loading-error behavior.
- Commit and push to the existing `agent/oxford-viewer-phase-1` branch and PR.

---

### Task 1: Add the definition page scale plugin

**Files:**
- Create: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.ts`
- Create: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts`

**Interfaces:**
- Consumes: `paneWidth: number`, `shrinkToFit: boolean`
- Produces: `buildDefinitionPageScaleScript(paneWidth, shrinkToFit): string`

- [ ] **Step 1: Write failing tests**

Test that a 200-pixel portrait pane emits scale `0.625`, a wide pane caps the
scale at `1`, and landscape removes the injected style while resetting
`window.__oxfordDefinitionPageScale` to `1`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts`

Expected: FAIL because the plugin module does not exist.

- [ ] **Step 3: Implement the minimal script builder**

Create a WebView-compatible script that installs or removes a stable style
element. The enabled CSS must set `zoom` and reciprocal body width; every path
must update `window.__oxfordDefinitionPageScale`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts`

Expected: PASS.

### Task 2: Make definition auto-scroll safe-area and scale aware

**Files:**
- Modify: `src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.ts`
- Modify: `src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.test.ts`

**Interfaces:**
- Consumes: `topInset: number` and optional `window.__oxfordDefinitionPageScale`
- Produces: `buildDefinitionAutoScrollScript(topInset): string`

- [ ] **Step 1: Write failing tests**

Extend the mock target with `style.scrollMarginTop`. Test that a 47-pixel inset
at scale `1` produces `47px`, scale `0.625` produces `75.2px`, and reinjection
performs immediate alignment without installing another observer.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --runInBand src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.test.ts`

Expected: FAIL because the builder does not accept or apply the inset.

- [ ] **Step 3: Implement scale-compensated scroll margin**

Pass the inset into the generated script, read a finite positive page scale,
set `target.style.scrollMarginTop`, and align the target immediately on every
injection while guarding only observer/listener installation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --runInBand src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.test.ts`

Expected: PASS.

### Task 3: Integrate portrait scaling into the definition WebView

**Files:**
- Modify: `src/components/DictionaryWebView.tsx`
- Modify: `src/components/DictionaryWebView.test.tsx`

**Interfaces:**
- Consumes: `url`, `paneWidth`, `shrinkToFit`, `topInset`
- Produces: combined pre-content and load-end definition scripts

- [ ] **Step 1: Write failing component tests**

Test that portrait props include the scale and safe-scroll scripts before
content loads, successful load end injects the combined script, and rerendering
a loaded page with landscape props injects scale cleanup.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --runInBand src/components/DictionaryWebView.test.tsx`

Expected: FAIL because the component props and scale integration do not exist.

- [ ] **Step 3: Implement the integration**

Build a memoized combined script, use it before content loads and after
successful load end, track whether the page is loaded, and inject updated
configuration from an effect when layout inputs change.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --runInBand src/components/DictionaryWebView.test.tsx`

Expected: PASS.

### Task 4: Supply window and safe-area information

**Files:**
- Modify: `App.tsx`
- Modify: `App.test.tsx`

**Interfaces:**
- Consumes: `useWindowDimensions()`, `useSafeAreaInsets().top`
- Produces: `DictionaryWebView` props `paneWidth`, `shrinkToFit`, `topInset`

- [ ] **Step 1: Write a failing app test**

Mock portrait window dimensions and verify the definition WebView receives a
portrait scale script containing the safe-area inset. Verify the word-list
WebView still has no sizing injection.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --runInBand App.test.tsx`

Expected: FAIL because `AppContent` does not pass definition layout inputs.

- [ ] **Step 3: Implement prop propagation**

Read window dimensions, calculate the definition pane width using the split
ratio and fixed alphabet strip width, derive `height >= width`, and pass the
three values to `DictionaryWebView`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --runInBand App.test.tsx`

Expected: PASS.

### Task 5: Document and verify

**Files:**
- Modify: `docs/oxford-navigation-dom.md`

**Interfaces:**
- Consumes: completed implementation behavior
- Produces: current navigation and scaling investigation notes

- [ ] **Step 1: Update the investigation document**

Record portrait-only CSS zoom, reciprocal width compensation, safe-area
scroll-margin conversion, landscape cleanup, and physical-device validation
risk.

- [ ] **Step 2: Run the full checks**

Run:

```text
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 3: Commit and push**

Commit all scoped changes with a concise message, push
`agent/oxford-viewer-phase-1`, and verify the local and remote SHA match.
