# Portrait Definition Horizontal Overflow Design

Date: 2026-07-26

## Goal

Remove residual horizontal dragging from the Oxford definition page in portrait
while preserving the approved proportional page shrink.

## Root cause

Oxford keeps a minimum 320 CSS-pixel layout. The definition plugin already
scales that layout to the narrower native pane and compensates the body width,
but the root `html` scrolling container can still expose horizontal overflow.

## Design

Extend the existing portrait-only definition scale style:

- Keep `body` at a 320 CSS-pixel minimum layout width.
- Keep the existing calculated `zoom` and reciprocal body width.
- Set `overflow-x: hidden` on `html` so the fully scaled layout does not expose
  a residual horizontal drag range.

The style continues to be removed when the definition pane is not in portrait
shrink mode. The word-list WebView remains unchanged.

## Alternatives rejected

- Removing Oxford minimum widths would reflow the page and enlarge text instead
  of shrinking the complete page proportionally.
- Rewriting the viewport meta element would be more invasive and introduce a
  document-loading race.

## Testing

- Verify a narrow portrait pane emits the 320px minimum width, proportional
  zoom, reciprocal body width, and root horizontal overflow constraint.
- Keep the existing landscape style-removal test.
- Run Jest, TypeScript, Expo Doctor, and `git diff --check`.

Physical iPhone Expo Go testing remains necessary to confirm that the native
drag gesture no longer moves the page horizontally.
