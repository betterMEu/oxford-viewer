# Phase 2.2-A Oxford Audio Injection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two temporary native controls that inject a click into the confirmed Oxford UK and US pronunciation elements and log `FOUND` or `NOT_FOUND`.

**Architecture:** Keep the experiment entirely inside `DictionaryWebView`. A WebView ref injects one self-contained script built from the approved selector, while `onMessage` logs the script result. The existing native WebView mock becomes ref-capable so tests can assert the script passed across the native boundary.

**Tech Stack:** Expo SDK 54, React Native, TypeScript, `react-native-webview`, Jest, React Native Testing Library.

## Global Constraints

- This is a minimal validation experiment, not a complete pronunciation architecture.
- Use the exact UK and US selectors confirmed in `docs/oxford-audio-dom.md`.
- Return only `FOUND` or `NOT_FOUND` through `window.ReactNativeWebView.postMessage`.
- Do not add a pronunciation controller, state-management refactor, WordRow integration, audio cache, audio service, or TTS.
- Audible playback requires a manual iPhone Expo Go test and must not be inferred from automated tests.

---

### Task 1: Add the WebView injection experiment

**Files:**
- Modify: `src/components/DictionaryWebView.test.tsx`
- Modify: `src/components/DictionaryWebView.tsx`

**Interfaces:**
- Consumes: the existing `DictionaryWebView({ word })` API and the two selectors documented in `docs/oxford-audio-dom.md`.
- Produces: `UK Test` and `US Test` button behavior, calls to `WebView.injectJavaScript(script)`, and `onMessage` logging.

- [x] **Step 1: Make the native WebView test double ref-capable**

Replace the string WebView mock with this minimal class test double:

```tsx
const mockInjectJavaScript = jest.fn();

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  class MockWebView extends React.Component {
    injectJavaScript = mockInjectJavaScript;

    render() {
      return React.createElement(View, this.props);
    }
  }

  return { WebView: MockWebView };
});
```

Clear `mockInjectJavaScript` before every test.

- [x] **Step 2: Add failing behavior tests**

Add focused tests:

```tsx
it('injects the confirmed UK pronunciation click script', async () => {
  const screen = await render(<DictionaryWebView word={WORDS[0]} />);

  await fireEvent.press(screen.getByRole('button', { name: 'UK Test' }));

  expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
  const script = mockInjectJavaScript.mock.calls[0][0] as string;
  expect(script).toContain(
    '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_br > .audio_play_button.pron-uk',
  );
  expect(script).toContain("postMessage('FOUND')");
  expect(script).toContain("postMessage('NOT_FOUND')");
  expect(script).toContain('element.click()');
});

it('injects the confirmed US pronunciation click script', async () => {
  const screen = await render(<DictionaryWebView word={WORDS[0]} />);

  await fireEvent.press(screen.getByRole('button', { name: 'US Test' }));

  expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
  const script = mockInjectJavaScript.mock.calls[0][0] as string;
  expect(script).toContain(
    '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_n_am > .audio_play_button.pron-us',
  );
});

it('logs messages returned by the injected script', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const screen = await render(<DictionaryWebView word={WORDS[0]} />);

  await fireEvent(screen.getByTestId('dictionary-webview'), 'message', {
    nativeEvent: { data: 'FOUND' },
  });

  expect(logSpy).toHaveBeenCalledWith('Oxford audio test:', 'FOUND');
  logSpy.mockRestore();
});
```

- [x] **Step 3: Run the focused test and verify RED**

Run:

```powershell
npm.cmd test -- src/components/DictionaryWebView.test.tsx
```

Expected: the new tests fail because the test buttons, ref injection, and
message handler do not exist.

- [x] **Step 4: Implement the minimal component behavior**

Add the imports:

```tsx
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
} from 'react-native-webview';
```

Add the exact selectors and script builder:

```tsx
const UK_PRONUNCIATION_SELECTOR =
  '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_br > .audio_play_button.pron-uk';
const US_PRONUNCIATION_SELECTOR =
  '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_n_am > .audio_play_button.pron-us';

function createPronunciationTestScript(selector: string) {
  return `
    (function () {
      var element = document.querySelector(${JSON.stringify(selector)});
      if (element) {
        window.ReactNativeWebView.postMessage('FOUND');
        element.click();
      } else {
        window.ReactNativeWebView.postMessage('NOT_FOUND');
      }
    })();
    true;
  `;
}
```

Inside `DictionaryWebView`, add:

```tsx
const webViewRef = useRef<WebView>(null);

const injectPronunciationClick = (selector: string) => {
  webViewRef.current?.injectJavaScript(
    createPronunciationTestScript(selector),
  );
};

const handleMessage = (event: WebViewMessageEvent) => {
  console.log('Oxford audio test:', event.nativeEvent.data);
};
```

Render the temporary controls above the existing WebView:

```tsx
<View style={styles.testControls}>
  <Button
    title="UK Test"
    onPress={() => injectPronunciationClick(UK_PRONUNCIATION_SELECTOR)}
  />
  <Button
    title="US Test"
    onPress={() => injectPronunciationClick(US_PRONUNCIATION_SELECTOR)}
  />
</View>
<WebView
  ref={webViewRef}
  accessibilityLabel={`Oxford dictionary page for ${word.word}`}
  onError={() => setLoadState('error')}
  onLoadEnd={() =>
    setLoadState((currentState) =>
      currentState === 'error' ? 'error' : 'loaded',
    )
  }
  onLoadStart={() => setLoadState('loading')}
  onMessage={handleMessage}
  source={{ uri: word.oxfordUrl }}
  style={styles.webView}
  testID="dictionary-webview"
/>
```

Add only the required control-row style:

```tsx
testControls: {
  borderBottomColor: '#cbd5e1',
  borderBottomWidth: StyleSheet.hairlineWidth,
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  paddingVertical: 4,
},
```

- [x] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
npm.cmd test -- src/components/DictionaryWebView.test.tsx
```

Expected: all `DictionaryWebView` tests pass.

- [x] **Step 6: Run full automated verification**

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run doctor
git diff --check
```

Expected:

- All Jest suites pass.
- Expo Doctor passes all checks.
- `git diff --check` exits successfully.
- TypeScript may continue to report the pre-existing
  `StyleSheet.absoluteFill` error at `DictionaryWebView.tsx:60`; do not change
  that unrelated business behavior in this task.

- [x] **Step 7: Commit the implementation**

Stage only the Phase 2.2-A plan, component, and component test:

```powershell
git add docs/superpowers/plans/2026-07-25-phase-2-2-a-audio-injection.md src/components/DictionaryWebView.tsx src/components/DictionaryWebView.test.tsx
git commit -m "Add Oxford audio injection test controls"
```

Do not stage the separately modified Phase 2.1 DOM investigation document.

- [x] **Step 8: Perform the manual device acceptance test when available**

On an iPhone with Expo Go:

1. Open the app and select `abandon`.
2. Wait for the Oxford page to finish loading.
3. Press `UK Test`; record the logged result and whether UK audio is audible.
4. Press `US Test`; record the logged result and whether US audio is audible.

If no connected iPhone is available, report both audible-playback results as
`NOT TESTED` rather than inferring success.
