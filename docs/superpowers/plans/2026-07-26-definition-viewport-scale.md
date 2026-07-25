# Definition Viewport Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the definition page's CSS zoom with viewport-level initial scaling so the 320px Oxford layout maps to the portrait pane without preserving a wider native scroll content size.

**Architecture:** Keep the existing `buildDefinitionPageScaleScript(paneWidth, shrinkToFit)` interface and replace its internals. In portrait the script stores and updates Oxford's viewport meta element plus a fixed 320px app style; in landscape it restores Oxford's original viewport and removes the style.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-webview, Jest

## Global Constraints

- Do not retain CSS `zoom`, transforms, or reciprocal percentage widths.
- Do not intercept touch gestures or merely hide the native scroll indicator.
- Preserve `window.__oxfordDefinitionPageScale` for safe-area auto-scroll.
- Do not modify the word-list WebView.
- Continue updating existing PR #1 on `agent/oxford-viewer-phase-1`.
- Report the final result as awaiting iPhone Expo Go acceptance.

---

### Task 1: Replace CSS zoom with viewport scaling

**Files:**
- Modify: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts`
- Modify: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.ts`

**Interfaces:**
- Consumes: `buildDefinitionPageScaleScript(paneWidth: number, shrinkToFit: boolean)`
- Produces: a WebView script ending in `true;`, with the same public function signature
- Stores: Oxford viewport content in `data-oxford-viewer-original-content`

- [ ] **Step 1: Write failing portrait assertions**

Extend the injected-script mock with an Oxford viewport element and assert:

```ts
expect(viewportElement.setAttribute).toHaveBeenCalledWith(
  'data-oxford-viewer-original-content',
  'width=device-width, initial-scale=1',
);
expect(viewportElement.setAttribute).toHaveBeenCalledWith(
  'content',
  'width=320, initial-scale=0.625',
);
expect(createdStyle.textContent).toContain(
  'width: 320px !important',
);
expect(createdStyle.textContent).not.toContain('zoom:');
expect(createdStyle.textContent).not.toContain('160%');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts
```

Expected: FAIL because the current implementation never updates the viewport
meta element and still emits CSS zoom plus reciprocal width.

- [ ] **Step 3: Add failing landscape restoration assertions**

Mock a viewport carrying the stored original content and assert that a
landscape or scale-1 script:

```ts
expect(viewportElement.setAttribute).toHaveBeenCalledWith(
  'content',
  'width=device-width, initial-scale=1',
);
expect(viewportElement.removeAttribute).toHaveBeenCalledWith(
  'data-oxford-viewer-original-content',
);
expect(existingStyle.remove).toHaveBeenCalledTimes(1);
```

- [ ] **Step 4: Implement viewport application and restoration**

In the generated script:

```js
var viewportSelector = 'meta[name="viewport"]';
var originalContentAttribute =
  'data-oxford-viewer-original-content';
```

For portrait:

```js
if (!viewport.hasAttribute(originalContentAttribute)) {
  viewport.setAttribute(
    originalContentAttribute,
    viewport.getAttribute('content') || ''
  );
}
viewport.setAttribute(
  'content',
  'width=320, initial-scale=<calculated scale>'
);
```

Generate only fixed logical-width CSS:

```css
html {
  overflow-x: hidden !important;
  width: 320px !important;
}

body {
  max-width: 320px !important;
  min-width: 320px !important;
  width: 320px !important;
}
```

For landscape or scale 1, restore the stored content, remove its storage
attribute, remove the app-owned style, stop the observer, and set the published
scale to `1`.

- [ ] **Step 5: Cover document-start ordering**

Update the existing observer test so the viewport meta is initially absent and
then appears before the callback. Assert that the viewport is updated, the
style is installed, the scale becomes `0.625`, and the observer disconnects.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```text
npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts
```

Expected: all scale-plugin tests pass.

### Task 2: Update evidence and complete verification

**Files:**
- Modify: `docs/oxford-navigation-dom.md`

**Interfaces:**
- Consumes: completed viewport scaling behavior
- Produces: an accurate record of the failed CSS approach and current design

- [ ] **Step 1: Update the investigation document**

Record the measured 225px client width and 327px scroll width, explain why
reciprocal CSS width retained native horizontal panning, and document the new
320px viewport plus initial-scale strategy.

- [ ] **Step 2: Run full verification**

Run:

```text
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 3: Request read-only review**

Review the diff for viewport restoration, document-start ordering, safe-area
scale publication, and absence of word-list changes. Fix every Critical or
Important finding and rerun all verification commands after the last change.

- [ ] **Step 4: Commit and push**

Commit all scoped changes, push `agent/oxford-viewer-phase-1`, and verify local
SHA, remote SHA, and PR #1 head SHA match.

- [ ] **Step 5: Report the acceptance boundary**

Report automated command output accurately and state that elimination of the
iPhone horizontal pan remains unconfirmed until the user retests in Expo Go.
