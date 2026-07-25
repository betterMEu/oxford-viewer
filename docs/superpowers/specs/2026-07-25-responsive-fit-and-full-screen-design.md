# Responsive Pane Fit and Full-Screen Layout Design

## Goal

Make the two Oxford pages fit their narrow split panes without horizontal
scrolling in the orientations where each pane is constrained, and let the app
fill the iPhone screen vertically without placing the A–Z controls under the
Dynamic Island or Home indicator.

## Verified cause

Both Oxford pages already declare:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Oxford's current CSS still enforces minimum widths:

```css
body {
  min-width: 320px;
}

.responsive_container {
  min-width: 320px;
}

.responsive_row {
  min-width: 300px;
}
```

Either split pane can be narrower than these values on an iPhone. The result is
horizontal overflow even though the page has a mobile viewport.

The current root `SafeAreaView` applies top and bottom safe-area insets to the
entire app, which leaves unused strips above and below the split layout.

## Design

### Web content fit

Add a small script-builder plugin that installs or removes an idempotent style
element in an Oxford page. When enabled, it preserves Oxford's verified 320px
natural layout width and calculates:

```text
scale = min(1, current pane width / 320)
```

The body is rendered at that scale with compensating width, so the complete
native layout fits the pane and text becomes proportionally smaller instead of
reflowing into a narrower, larger-looking layout. The scale is measured from
the current WebView width rather than hardcoded for a particular iPhone.

The app derives fit modes from `useWindowDimensions`:

- Portrait: enable width fitting in the definition WebView.
- Landscape: enable width fitting in the word-list WebView.

Each WebView injects the current mode before content loads. If the device
rotates after a page has loaded, the component injects the new mode immediately
without reloading the Oxford page.

### Full-screen safe layout

Keep `SafeAreaProvider`, but limit the root `SafeAreaView` to the left and right
edges. The split panes therefore fill the screen from top to bottom.

Hide the iOS status bar so it does not remain visible over the edge-to-edge app
content.

Pass the current top and bottom safe-area insets to `AlphabetIndexPlugin`. Its
background continues edge-to-edge, while its letter-button area receives safe
padding. This keeps A below the Dynamic Island in portrait and Z above the Home
indicator without restoring full-width blank strips.

## Scope

No word-list, definition-navigation, pronunciation, search, persistence, or
Oxford DOM behavior changes are included.

## Tests

- Verify portrait and landscape choose the required fit modes.
- Verify the injected style calculates a below-100% scale for panes narrower
  than 320px, preserves the 320px natural layout, and can be removed.
- Verify both WebViews install the fit script before content loads and apply
  orientation changes to an already-loaded page.
- Verify the root safe area excludes top and bottom edges.
- Verify the system status bar is hidden.
- Verify the alphabet index applies supplied top and bottom safe insets.
- Run the full Jest suite, TypeScript check, Expo Doctor, and
  `git diff --check`.
