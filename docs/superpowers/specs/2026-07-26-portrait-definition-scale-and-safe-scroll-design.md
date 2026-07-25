# Portrait Definition Scale and Safe Scroll Design

Date: 2026-07-26

## Goal

Improve the Oxford definition pane in portrait orientation so that the page is
automatically shrunk like a pinch-in gesture and the automatic entry alignment
keeps the word title below the iPhone top safe area.

## Scope

- Apply page scaling only to the definition WebView in portrait orientation.
- Preserve Oxford's natural definition layout width of 320 CSS pixels.
- Shrink only when the native definition pane is narrower than 320 pixels.
- Keep the automatic `#entryContent` alignment, with a top margin derived from
  the native safe-area inset and the active page scale.
- Reapply the definition configuration after an orientation change.
- Do not change the word-list WebView sizing or behavior.

## Design

`AppContent` reads the current window dimensions and passes two values to
`DictionaryWebView`: the native top safe-area inset and whether the device is
in portrait orientation.

A definition-page-scale plugin builds a self-contained WebView script. In
portrait it computes `min(1, paneWidth / 320)`, applies that value through CSS
`zoom`, expands the body width by the reciprocal percentage, and records the
active value on `window.__oxfordDefinitionPageScale`. In landscape it removes
the injected style and records a scale of `1`.

The existing definition auto-scroll script accepts the native top inset. Before
calling `scrollIntoView`, it sets `#entryContent`'s `scroll-margin-top` to
`topInset / activeScale` CSS pixels. Dividing by the page scale ensures the
visual gap remains equal to the iPhone safe-area inset after zooming.

`DictionaryWebView` combines the scale and scroll scripts for pre-content
injection and successful load-end injection. Once a page is loaded, changes to
orientation, pane width, or top inset are reinjected immediately so the current
page updates without navigation.

## Testing

- Unit-test scale calculation, portrait style application, and landscape
  cleanup.
- Unit-test scale-compensated safe scroll and one-time observer installation.
- Component-test pre-content injection, successful load-end injection, and
  loaded-page updates after orientation changes.
- App-test propagation of portrait state and top inset.
- Keep the word-list WebView free of any definition scaling script.

## Risks

- Oxford can change `#entryContent`, its minimum layout width, or its CSS.
- CSS `zoom` is WebKit-specific but is appropriate for the iPhone-only WebView
  target.
- Automated tests cannot confirm the exact visual result on a physical iPhone;
  Expo Go acceptance testing remains required.
