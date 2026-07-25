# Portrait Definition Horizontal Overflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove residual horizontal dragging from the proportionally shrunk Oxford definition page in portrait.

**Architecture:** Extend the existing definition-only scale style rather than adding another injection layer. The style preserves the 320px natural body width and calculated zoom while constraining horizontal overflow on the root document; landscape removes the same style.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, react-native-webview, Jest

## Global Constraints

- Change only the portrait definition WebView scale style and its documentation.
- Preserve the current proportional zoom and safe-area auto-scroll behavior.
- Do not modify the word-list WebView.
- Do not add dependencies or unrelated features.
- Commit and push to the existing `agent/oxford-viewer-phase-1` branch and PR.

---

### Task 1: Constrain portrait definition horizontal overflow

**Files:**
- Modify: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts`
- Modify: `src/plugins/definition-page-scale/buildDefinitionPageScaleScript.ts`
- Modify: `docs/oxford-navigation-dom.md`

**Interfaces:**
- Consumes: existing `buildDefinitionPageScaleScript(paneWidth, shrinkToFit)`
- Produces: the same script-builder API with portrait-only root overflow control

- [ ] **Step 1: Write the failing regression assertions**

Add assertions to the narrow portrait test:

```ts
expect(createdStyle.textContent).toContain(
  'overflow-x: hidden !important',
);
expect(createdStyle.textContent).toContain(
  'min-width: 320px !important',
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts
```

Expected: FAIL because the current generated style contains neither rule.

- [ ] **Step 3: Implement the minimal portrait style change**

Generate this style structure while preserving the calculated values:

```css
html {
  overflow-x: hidden !important;
}

body {
  min-width: 320px !important;
  width: <reciprocal width>% !important;
  zoom: <calculated scale> !important;
}
```

The existing `scale >= 1` branch must continue removing the entire style.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```text
npm test -- --runInBand src/plugins/definition-page-scale/buildDefinitionPageScaleScript.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 5: Update the investigation document**

Document that portrait retains the 320px proportional layout and constrains
root horizontal overflow; landscape and the word-list page remain unchanged.

- [ ] **Step 6: Run full verification**

Run:

```text
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 7: Commit and push**

Commit the scoped code, tests, plan, and documentation, push
`agent/oxford-viewer-phase-1`, and verify local SHA, remote SHA, and PR #1 head
SHA match.
