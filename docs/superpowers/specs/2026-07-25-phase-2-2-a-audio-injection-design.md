# Phase 2.2-A Oxford Audio Injection Design

## Goal

Verify, with the smallest possible application change, whether an injected
`HTMLElement.click()` can activate Oxford's UK and US pronunciation controls
inside the existing WebView.

## Scope

- Modify `DictionaryWebView.tsx`.
- Add a WebView ref and two temporary controls labelled `UK Test` and
  `US Test`.
- Inject the selectors confirmed in Phase 2.1.
- Return `FOUND` or `NOT_FOUND` through
  `window.ReactNativeWebView.postMessage`.
- Log the returned value in the React Native `onMessage` handler.
- Add focused component tests for both injected selectors and message logging.

The work does not add a pronunciation controller, shared state, WordRow
integration, caching, TTS, or an audio service.

## Component design

`DictionaryWebView` keeps a `useRef<WebView>` reference to its existing WebView.
A local `injectPronunciationClick(selector)` function builds one self-contained
script and passes it to `injectJavaScript`.

The script queries the supplied selector. When the element exists, it posts
`FOUND` and invokes `element.click()`. When the element does not exist, it posts
`NOT_FOUND`. The script ends with `true;` for WebView injection compatibility.

The two native test buttons render directly above the WebView. They are
temporary Phase 2.2-A controls and are not connected to `WordRow`.

## Message flow

1. The user presses `UK Test` or `US Test`.
2. React Native injects the matching selector into the current Oxford page.
3. The injected script posts `FOUND` or `NOT_FOUND`.
4. `DictionaryWebView` logs the received string with `console.log`.
5. When the selector was found, the script also calls the Oxford DOM element's
   `click()` method.

`FOUND` confirms only that the selector resolved. Actual audio output must be
confirmed on an iPhone running Expo Go.

## Error handling

- A missing WebView ref causes no action and no crash.
- A missing Oxford element returns `NOT_FOUND`.
- No retry, fallback selector, alert, or additional status UI is added.

## Testing

Component tests replace only the native WebView boundary with a ref-capable
test double. Tests verify that each button sends a script containing the exact
approved selector, the `FOUND`/`NOT_FOUND` branches, and the click operation.
A message-event test verifies that the native handler logs the returned value.

Automated tests cannot confirm audible playback. The manual acceptance test is
to open the `abandon` page on iPhone Expo Go and press each test button while
listening for the corresponding UK and US recording.
