# Definition Viewport Scale Design

Date: 2026-07-26

## Status

This design replaces the CSS `zoom` and reciprocal body-width approach used in
the preceding portrait definition scaling work.

## Confirmed symptom

On an iPhone in portrait, the Oxford definition page remains visibly draggable
from side to side after the existing scale and overflow styles are applied.

## Evidence and root cause

At a narrow browser viewport representative of the definition pane, the Oxford
page reported:

- `document.documentElement.clientWidth`: about 225px
- `document.documentElement.scrollWidth`: about 327px
- `body` minimum width: 320px
- `.responsive_container` minimum width: 320px

The current app then applies a CSS zoom below 1 while expanding `body` to
`100 / scale %`. That reciprocal layout width is intentionally wider than the
native pane. Hiding `overflow-x` in CSS does not reliably reduce the
`WKWebView` scroll view's native content size, so the page can still pan
horizontally.

## Design

### Portrait

Use the document viewport as the scaling mechanism:

```text
layout width = 320 CSS pixels
initial scale = native definition pane width / 320
```

Update Oxford's existing `<meta name="viewport">` content to:

```text
width=320, initial-scale=<calculated scale>
```

Keep a small app-owned style that constrains `html` and `body` to the same
320px logical width and hides only residual root horizontal overflow. Do not
apply CSS `zoom`, transforms, or reciprocal percentage widths.

Store Oxford's original viewport content on the meta element before changing
it. Publish the active scale on `window.__oxfordDefinitionPageScale` so the
existing safe-area auto-scroll calculation remains correct.

### Document-start loading

If Oxford's viewport meta element is not available when the pre-content script
runs, install a `MutationObserver`. The scale observer is created before the
entry auto-scroll observer; when Oxford inserts its `<head>` content, the
viewport is configured before `#entryContent` is aligned.

### Landscape

Restore the stored Oxford viewport content, remove the app-owned width style,
disconnect any pending scale observer, and publish scale `1`.

### Scope

- Change only the definition page scale plugin and its tests/documentation.
- Preserve safe-area auto-scroll and definition navigation.
- Do not change the word-list WebView.
- Do not intercept touch gestures.
- Do not merely hide the native horizontal scroll indicator.

## Testing

- Verify a 200px portrait pane produces viewport width 320 and initial scale
  0.625.
- Verify portrait CSS contains no `zoom` and no reciprocal percentage width.
- Verify the original Oxford viewport content is stored only once.
- Verify landscape restores the original viewport and removes the app style.
- Verify the document-start observer applies viewport scaling when the meta
  element appears.
- Run the full Jest suite, TypeScript check, Expo Doctor, and
  `git diff --check`.

Automated tests can verify the generated DOM behavior but cannot prove the
native iPhone pan gesture is gone. Completion must be reported as awaiting
physical-device acceptance until the user retests in Expo Go.
