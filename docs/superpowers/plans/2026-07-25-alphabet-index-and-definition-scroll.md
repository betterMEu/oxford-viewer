# Alphabet Index and Definition Auto-Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable native A–Z index that scrolls the Oxford 3000 WebView,
and automatically position successfully loaded definition pages at
`#entryContent`.

**Architecture:** Project-local plugin modules own the A–Z UI and both WebView
script builders. `OxfordWordListWebView` exposes only `scrollToLetter`; Oxford
word text remains inside the page. `DictionaryWebView` injects a responsive
DOM-target script after successful loads.

**Tech Stack:** Expo SDK 54, React Native, TypeScript,
`react-native-webview`, Jest, React Native Testing Library.

## Global Constraints

- Do not add dependencies.
- Do not return, save, cache, or parse Oxford word-list or definition text in
  React Native.
- Do not hardcode the measured 370px, 504px, 601px, or 735px offsets.
- Keep left native Oxford UK/US audio and definition navigation unchanged.
- Keep the right loading animation absent and retain its concise error state.
- Keep X visible but disabled because no Oxford 3000 X entry was verified.

---

### Task 1: Alphabet index plugin

**Files:**

- Create: `src/plugins/alphabet-index/AlphabetIndexPlugin.tsx`
- Create: `src/plugins/alphabet-index/AlphabetIndexPlugin.test.tsx`
- Create: `src/plugins/alphabet-index/buildAlphabetScrollScript.ts`
- Create: `src/plugins/alphabet-index/buildAlphabetScrollScript.test.ts`

**Interfaces:**

```ts
export const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
] as const;

export type AlphabetLetter = (typeof ALPHABET)[number];

type AlphabetIndexPluginProps = {
  disabled: boolean;
  onSelectLetter: (letter: AlphabetLetter) => void;
};

export function buildAlphabetScrollScript(letter: AlphabetLetter): string;
```

- [ ] **Step 1: Write failing component and script tests**

```tsx
expect(screen.getAllByRole('button')).toHaveLength(26);
fireEvent.press(screen.getByRole('button', { name: 'B' }));
expect(onSelectLetter).toHaveBeenCalledWith('B');
expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();
```

```ts
const script = buildAlphabetScrollScript('B');
expect(script).toContain("var requestedLetter = 'B';");
expect(script).toContain("li[data-hw][data-ox3000]");
expect(script).toContain("getAttribute('data-hw')");
expect(script).toContain('window.scrollTo(0, targetTop)');
expect(script).toMatch(/true;\s*$/);
```

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run:

```powershell
npm test -- src/plugins/alphabet-index
```

Expected: FAIL because the plugin files do not exist.

- [ ] **Step 3: Implement the minimum plugin**

The script must use a bounded loop over
`document.querySelectorAll('li[data-hw][data-ox3000]')`, compare the first
uppercase character of `data-hw`, skip elements whose computed display is
`none`, and scroll to:

```js
var targetTop = target.getBoundingClientRect().top + window.scrollY;
window.scrollTo(0, targetTop);
```

If no target exists, it must return without scrolling. The index renders all
26 letters with X disabled and all letters disabled when `disabled` is true.

- [ ] **Step 4: Run focused tests**

```powershell
npm test -- src/plugins/alphabet-index
```

Expected: all alphabet plugin tests pass.

---

### Task 2: Integrate the alphabet plugin with the left WebView

**Files:**

- Modify: `src/components/OxfordWordListWebView.tsx`
- Modify: `src/components/OxfordWordListWebView.test.tsx`
- Modify: `App.tsx`
- Modify: `App.test.tsx`

**Interfaces:**

```ts
export type OxfordWordListWebViewHandle = {
  scrollToLetter: (letter: AlphabetLetter) => void;
};
```

- [ ] **Step 1: Write failing imperative-ref and App tests**

```tsx
const ref = createRef<OxfordWordListWebViewHandle>();
render(<OxfordWordListWebView ref={ref} {...props} />);
ref.current?.scrollToLetter('B');
expect(mockInjectJavaScript.mock.calls.at(-1)?.[0]).toContain(
  "var requestedLetter = 'B';",
);
```

App tests must verify that all letters start disabled, filter success enables
B, pressing B injects the B script, and X remains disabled.

- [ ] **Step 2: Run tests and confirm the missing ref/plugin behavior**

```powershell
npm test -- App.test.tsx src/components/OxfordWordListWebView.test.tsx
```

Expected: FAIL because the ref API and A–Z strip are absent.

- [ ] **Step 3: Implement the ref and App integration**

Use `forwardRef` and `useImperativeHandle` in `OxfordWordListWebView`.
`scrollToLetter` calls `injectJavaScript(buildAlphabetScrollScript(letter))`
only when the left page is loaded. In `App.tsx`, insert:

```tsx
<AlphabetIndexPlugin
  disabled={!wordListReady}
  onSelectLetter={(letter) =>
    wordListWebViewRef.current?.scrollToLetter(letter)
  }
/>
```

between `wordPane` and `dictionaryPane`. Set readiness to true only for a
matching `WORD_LIST_FILTER_APPLIED` result and false on loading/error/failure.

- [ ] **Step 4: Run focused tests**

```powershell
npm test -- App.test.tsx src/components/OxfordWordListWebView.test.tsx
```

Expected: all focused integration tests pass.

---

### Task 3: Definition auto-scroll plugin

**Files:**

- Create: `src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.ts`
- Create: `src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.test.ts`
- Modify: `src/components/DictionaryWebView.tsx`
- Modify: `src/components/DictionaryWebView.test.tsx`

**Interfaces:**

```ts
export function buildDefinitionAutoScrollScript(): string;
```

- [ ] **Step 1: Write failing script and component tests**

```ts
const script = buildDefinitionAutoScrollScript();
expect(script).toContain("document.querySelector('#entryContent')");
expect(script).toContain('getBoundingClientRect().top + window.scrollY');
expect(script).toContain('window.scrollTo(0, targetTop)');
expect(script).toMatch(/true;\s*$/);
```

The component test uses a ref-capable WebView mock, fires `loadEnd`, and expects
one auto-scroll injection. A second test fires `error` before `loadEnd` and
expects no injection.

- [ ] **Step 2: Run tests and confirm missing-module/behavior failures**

```powershell
npm test -- src/plugins/definition-auto-scroll src/components/DictionaryWebView.test.tsx
```

Expected: FAIL because the script and load-end injection are absent.

- [ ] **Step 3: Implement dynamic entry positioning**

The script queries `#entryContent`; when found it computes the target's current
document top and calls `window.scrollTo(0, targetTop)`. It performs no action
when the target is absent and ends with `true;`.

`DictionaryWebView` tracks load errors in a ref, clears the ref on
`onLoadStart`, sets it on `onError`, and injects only from a successful
`onLoadEnd`. It must not reintroduce a loading overlay.

- [ ] **Step 4: Run focused tests**

```powershell
npm test -- src/plugins/definition-auto-scroll src/components/DictionaryWebView.test.tsx
```

Expected: all definition auto-scroll tests pass.

---

### Task 4: Documentation and verification

**Files:**

- Modify: `README.md`
- Create: `docs/oxford-navigation-dom.md`

- [ ] **Step 1: Document the A–Z plugin, disabled X, verified selectors, measured offsets, and dynamic `#entryContent` positioning**

- [ ] **Step 2: Run all checks**

```powershell
npm test
npm run typecheck
npm run doctor
git diff --check
```

Expected: all tests pass, TypeScript exits 0, Expo Doctor reports all checks
passed, and `git diff --check` reports no whitespace errors.

- [ ] **Step 3: Commit and push the existing PR branch**

```powershell
git add -A
git commit -m "Add alphabet index and definition auto-scroll"
git push
```
